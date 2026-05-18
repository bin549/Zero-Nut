using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Diagnostics;
using System.Globalization;
using System.Runtime.InteropServices;
using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using Avalonia.Media;
using Avalonia.Media.Imaging;
using Avalonia.Platform.Storage;
using Avalonia.Styling;
using Avalonia.Threading;
using DesktopApp.Models;
using DesktopApp.Services;

namespace DesktopApp;

public partial class MainWindow : Window {
    [DllImport("libc", SetLastError = true)]
    private static extern int kill(int pid, int sig);
    private const int MacSigStop = 17;
    private const int MacSigCont = 19;
    private const int LinuxSigStop = 19;
    private const int LinuxSigCont = 18;
    private readonly PostRepository _postRepository = new();
    private readonly AssetService _assetService = new();
    private readonly GitSyncService _gitSyncService = new();
    private readonly ObservableCollection<PostCardModel> _currentPosts = [];
    private string? _selectedImagePath;
    private Bitmap? _selectedImageBitmap;
    private string? _selectedMusicFileName;
    private string? _editSelectedImagePath;
    private Bitmap? _editSelectedImageBitmap;
    private string? _editSelectedMusicFileName;
    private int _editingPostId;
    private int _deletingPostId;
    private CancellationTokenSource? _statusHideCts;
    private Process? _playbackProcess;
    private bool _isPlaybackPaused;
    private string? _nowPlayingPath;
    private string? _nowPlayingLabel;

    public MainWindow() {
        InitializeComponent();
        ProjectPaths.EnsureRequiredDirectories();
        PostsItemsControl.ItemsSource = _currentPosts;
        PostsFilePathText.Text = $"File path: {ProjectPaths.PostsFilePath}";
        Classes.Set("theme-dark", Application.Current?.RequestedThemeVariant == ThemeVariant.Dark);
        SetAddDateTimeNow();
        Loaded += OnLoaded;
    }

    private async void OnLoaded(object? sender, RoutedEventArgs e) {
        UpdateThemeButtonText();
        await ReloadPostsAsync();
    }

    private async Task ReloadPostsAsync() {
        try {
            DisposeCurrentPosts();
            _currentPosts.Clear();
            var posts = await _postRepository.LoadPostsAsync();
            foreach (var post in posts) {
                _currentPosts.Add(CreatePostCard(post));
            }
            UpdateEmptyState();
        } catch (Exception ex) {
            UpdateEmptyState();
            ShowStatus($"Error loading posts: {ex.Message}", false);
        }
    }

    private PostCardModel CreatePostCard(PostRecord record) {
        var parsedDate = ParseDate(record.Date);
        return new PostCardModel {
            Id = record.Id,
            DateRaw = record.Date,
            DateText = parsedDate.ToLocalTime().ToString("g", CultureInfo.CurrentCulture),
            Text = record.Text,
            ImagePath = record.Image,
            Music = record.Music is null
                ? null
                : new MusicInfo {
                    Title = record.Music.Title,
                    Artist = record.Music.Artist,
                    File = record.Music.File
                },
            BackgroundBitmap = _assetService.LoadBitmap(record.Image)
        };
    }

    private static DateTimeOffset ParseDate(string? value) {
        if (DateTimeOffset.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind,
                out var parsed)) {
            return parsed;
        }
        return DateTimeOffset.UtcNow;
    }

    private static DateTimeOffset ComposeDateTime(DateTimeOffset? date, TimeSpan? time) {
        var localDate = date?.DateTime ?? DateTime.Now;
        var chosenTime = time ?? DateTime.Now.TimeOfDay;
        var localDateTime = new DateTime(
            localDate.Year,
            localDate.Month,
            localDate.Day,
            chosenTime.Hours,
            chosenTime.Minutes,
            chosenTime.Seconds,
            DateTimeKind.Local);
        return new DateTimeOffset(localDateTime);
    }

    private void SetAddDateTimeNow() {
        var now = DateTime.Now;
        PostDatePicker.SelectedDate = new DateTimeOffset(now);
        PostTimePicker.SelectedTime = now.TimeOfDay;
    }

    private void SetEditDateTime(DateTimeOffset value) {
        var local = value.ToLocalTime();
        EditDatePicker.SelectedDate = local;
        EditTimePicker.SelectedTime = local.TimeOfDay;
    }

    private void UpdateEmptyState() {
        var hasPosts = _currentPosts.Count > 0;
        PostsItemsControl.IsVisible = hasPosts;
        NoPostsMessage.IsVisible = !hasPosts;
    }

    private void DisposeCurrentPosts() {
        foreach (var post in _currentPosts) {
            post.Dispose();
        }
    }

    private void ShowStatus(string message, bool success) {
        StatusText.Text = message;
        StatusBorder.Background = new SolidColorBrush(success ? Color.Parse("#E7F4EE") : Color.Parse("#FDE8E8"));
        StatusBorder.BorderBrush = new SolidColorBrush(success ? Color.Parse("#B9E3C8") : Color.Parse("#F5C6CB"));
        StatusText.Foreground = new SolidColorBrush(success ? Color.Parse("#155724") : Color.Parse("#721c24"));
        StatusBorder.IsVisible = true;
        _statusHideCts?.Cancel();
        _statusHideCts = new CancellationTokenSource();
        _ = HideStatusLaterAsync(_statusHideCts.Token);
    }

    private async Task HideStatusLaterAsync(CancellationToken token) {
        try {
            await Task.Delay(3000, token);
            await Dispatcher.UIThread.InvokeAsync(() => StatusBorder.IsVisible = false);
        } catch (TaskCanceledException) {
        }
    }

    private void SetSelectedImagePreview(Image preview, TextBlock name, Button clearButton, string? relativePath,
        ref Bitmap? bitmapField, ref string? pathField) {
        bitmapField?.Dispose();
        bitmapField = null;
        pathField = relativePath;
        if (string.IsNullOrWhiteSpace(relativePath)) {
            name.Text = "No image selected";
            preview.Source = null;
            preview.IsVisible = false;
            clearButton.IsVisible = false;
            return;
        }
        name.Text = Path.GetFileName(relativePath);
        bitmapField = _assetService.LoadBitmap(relativePath);
        preview.Source = bitmapField;
        preview.IsVisible = bitmapField is not null;
        clearButton.IsVisible = true;
    }

    private void ClearAddImageSelection() {
        SetSelectedImagePreview(SelectedImagePreview, SelectedImageNameText, ClearImageButton, null,
            ref _selectedImageBitmap, ref _selectedImagePath);
    }

    private void ClearEditImageSelection() {
        SetSelectedImagePreview(EditSelectedImagePreview, EditSelectedImageNameText, EditClearImageButton, null,
            ref _editSelectedImageBitmap, ref _editSelectedImagePath);
    }

    private void ClearAddMusicSelection() {
        _selectedMusicFileName = null;
        SelectedMusicNameText.Text = "No music selected";
        ClearMusicButton.IsVisible = false;
        MusicMetadataPanel.IsVisible = false;
        MusicTitleTextBox.Text = string.Empty;
        MusicArtistTextBox.Text = string.Empty;
    }

    private void ClearEditMusicSelection() {
        _editSelectedMusicFileName = null;
        EditSelectedMusicNameText.Text = "No music selected";
        EditClearMusicButton.IsVisible = false;
        EditMusicMetadataPanel.IsVisible = false;
        EditMusicTitleTextBox.Text = string.Empty;
        EditMusicArtistTextBox.Text = string.Empty;
    }

    private void ApplyMusicDefaults(TextBox titleBox, TextBox artistBox, string fileName) {
        var (title, artist) = _assetService.ParseMusicFileName(fileName);
        titleBox.Text = title ?? string.Empty;
        artistBox.Text = artist ?? string.Empty;
    }

    private async Task SelectImageAsync(bool editing) {
        var files = await StorageProvider.OpenFilePickerAsync(new FilePickerOpenOptions {
            Title = "Choose background image",
            AllowMultiple = false,
            FileTypeFilter = new List<FilePickerFileType> {
                new("Images") {
                    Patterns = new List<string> { "*.jpg", "*.jpeg", "*.png", "*.gif" }
                }
            }
        });
        var file = files.FirstOrDefault();
        var sourcePath = file?.TryGetLocalPath();
        if (string.IsNullOrWhiteSpace(sourcePath)) {
            return;
        }
        var importedPath = _assetService.ImportImage(sourcePath);
        if (editing) {
            SetSelectedImagePreview(EditSelectedImagePreview, EditSelectedImageNameText, EditClearImageButton,
                importedPath, ref _editSelectedImageBitmap, ref _editSelectedImagePath);
        } else {
            SetSelectedImagePreview(SelectedImagePreview, SelectedImageNameText, ClearImageButton, importedPath,
                ref _selectedImageBitmap, ref _selectedImagePath);
        }
    }

    private async Task SelectMusicAsync(bool editing) {
        var files = await StorageProvider.OpenFilePickerAsync(new FilePickerOpenOptions {
            Title = "Choose music file",
            AllowMultiple = false,
            FileTypeFilter = new List<FilePickerFileType> {
                new("Music") {
                    Patterns = new List<string> { "*.mp3", "*.wav", "*.ogg" }
                }
            }
        });
        var file = files.FirstOrDefault();
        var sourcePath = file?.TryGetLocalPath();
        if (string.IsNullOrWhiteSpace(sourcePath)) {
            return;
        }
        var importedFileName = _assetService.ImportMusic(sourcePath);
        if (editing) {
            _editSelectedMusicFileName = importedFileName;
            EditSelectedMusicNameText.Text = importedFileName;
            EditClearMusicButton.IsVisible = true;
            EditMusicMetadataPanel.IsVisible = true;
            ApplyMusicDefaults(EditMusicTitleTextBox, EditMusicArtistTextBox, importedFileName);
        } else {
            _selectedMusicFileName = importedFileName;
            SelectedMusicNameText.Text = importedFileName;
            ClearMusicButton.IsVisible = true;
            MusicMetadataPanel.IsVisible = true;
            ApplyMusicDefaults(MusicTitleTextBox, MusicArtistTextBox, importedFileName);
        }
    }

    private async void AddPost_Click(object? sender, RoutedEventArgs e) {
        var text = PostTextBox.Text?.Trim();
        if (string.IsNullOrWhiteSpace(text)) {
            ShowStatus("Post text cannot be empty", false);
            return;
        }
        MusicInfo? music = null;
        if (!string.IsNullOrWhiteSpace(_selectedMusicFileName)) {
            var title = MusicTitleTextBox.Text?.Trim();
            var artist = MusicArtistTextBox.Text?.Trim();
            if (string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(artist)) {
                ShowStatus("Please enter music title and artist", false);
                return;
            }
            music = new MusicInfo {
                Title = title,
                Artist = artist,
                File = _selectedMusicFileName
            };
        }
        var post = new PostRecord {
            Text = text,
            Date = ComposeDateTime(PostDatePicker.SelectedDate, PostTimePicker.SelectedTime).ToString("o"),
            Image = _selectedImagePath,
            Music = music
        };
        try {
            await _postRepository.AddPostAsync(post);
            await ReloadPostsAsync();
            ClearAddForm();
            SetAddDateTimeNow();
            CreateOverlay.IsVisible = false;
            ShowStatus("Post added successfully!", true);
        } catch (Exception ex) {
            ShowStatus($"Error adding post: {ex.Message}", false);
        }
    }

    private void OpenCreateDialog_Click(object? sender, RoutedEventArgs e) {
        ClearAddForm();
        SetAddDateTimeNow();
        CreateOverlay.IsVisible = true;
    }

    private void CloseCreateDialog_Click(object? sender, RoutedEventArgs e) {
        CreateOverlay.IsVisible = false;
    }

    private void ClearAddForm() {
        PostTextBox.Text = string.Empty;
        ClearAddImageSelection();
        ClearAddMusicSelection();
    }

    private async void SelectImage_Click(object? sender, RoutedEventArgs e) {
        await SelectImageAsync(editing: false);
    }

    private void ClearImage_Click(object? sender, RoutedEventArgs e) {
        ClearAddImageSelection();
    }

    private async void SelectMusic_Click(object? sender, RoutedEventArgs e) {
        await SelectMusicAsync(editing: false);
    }

    private void ClearMusic_Click(object? sender, RoutedEventArgs e) {
        ClearAddMusicSelection();
    }

    private void PlayMusic_Click(object? sender, RoutedEventArgs e) {
        if (sender is not Button { Tag: PostCardModel post } || post.Music is null) {
            return;
        }
        var fileName = Path.GetFileName(post.Music.File);
        if (string.IsNullOrWhiteSpace(fileName)) {
            ShowStatus("No music file configured for this post", false);
            return;
        }
        var fullPath = Path.Combine(ProjectPaths.MusicDirectory, fileName);
        if (!File.Exists(fullPath)) {
            ShowStatus($"Music file not found: {fileName}", false);
            return;
        }
        try {
            StartPlayback(fullPath, post.MusicDisplay);
            ShowStatus($"Playing: {post.MusicDisplay}", true);
        } catch (Exception ex) {
            ShowStatus($"Failed to play music: {ex.Message}", false);
        }
    }

    private void TogglePlayback_Click(object? sender, RoutedEventArgs e) {
        if (_playbackProcess is null || _playbackProcess.HasExited) {
            return;
        }
        try {
            if (_isPlaybackPaused) {
                ResumePlayback(_playbackProcess);
                _isPlaybackPaused = false;
                TogglePlaybackButton.Content = "Pause";
                NowPlayingText.Text = $"Now playing: {_nowPlayingLabel}";
            } else {
                PausePlayback(_playbackProcess);
                _isPlaybackPaused = true;
                TogglePlaybackButton.Content = "Resume";
                NowPlayingText.Text = $"Paused: {_nowPlayingLabel}";
            }
        } catch (Exception ex) {
            ShowStatus($"Playback toggle failed: {ex.Message}", false);
        }
    }

    private void StopPlayback_Click(object? sender, RoutedEventArgs e) {
        StopPlayback();
    }

    private void StartPlayback(string fullPath, string label) {
        StopPlayback();
        Process process;
        if (OperatingSystem.IsMacOS()) {
            var info = new ProcessStartInfo("afplay") {
                UseShellExecute = false
            };
            info.ArgumentList.Add(fullPath);
            process = Process.Start(info) ??
                      throw new InvalidOperationException("Could not start afplay process.");
        } else if (OperatingSystem.IsWindows()) {
            var info = new ProcessStartInfo("powershell") {
                UseShellExecute = false
            };
            info.ArgumentList.Add("-NoProfile");
            info.ArgumentList.Add("-Command");
            info.ArgumentList.Add($"$p = New-Object System.Media.SoundPlayer '{EscapeSingleQuotes(fullPath)}'; $p.PlaySync();");
            process = Process.Start(info) ??
                      throw new InvalidOperationException("Could not start powershell audio process.");
        } else {
            var info = new ProcessStartInfo("ffplay") {
                UseShellExecute = false
            };
            info.ArgumentList.Add("-nodisp");
            info.ArgumentList.Add("-autoexit");
            info.ArgumentList.Add(fullPath);
            process = Process.Start(info) ??
                      throw new InvalidOperationException("Could not start ffplay process.");
        }
        _playbackProcess = process;
        _isPlaybackPaused = false;
        _nowPlayingPath = fullPath;
        _nowPlayingLabel = label;
        TogglePlaybackButton.Content = "Pause";
        TogglePlaybackButton.IsEnabled = true;
        StopPlaybackButton.IsEnabled = true;
        NowPlayingText.Text = $"Now playing: {label}";
        _ = WatchPlaybackEndedAsync(process);
    }

    private async Task WatchPlaybackEndedAsync(Process process) {
        try {
            await process.WaitForExitAsync();
        } catch {
        }
        if (!ReferenceEquals(_playbackProcess, process)) {
            return;
        }
        await Dispatcher.UIThread.InvokeAsync(() => {
            _playbackProcess = null;
            _isPlaybackPaused = false;
            _nowPlayingPath = null;
            _nowPlayingLabel = null;
            TogglePlaybackButton.Content = "Pause";
            TogglePlaybackButton.IsEnabled = false;
            StopPlaybackButton.IsEnabled = false;
            NowPlayingText.Text = "Not playing";
        });
    }

    private void StopPlayback() {
        if (_playbackProcess is null) {
            return;
        }
        try {
            if (!_playbackProcess.HasExited) {
                _playbackProcess.Kill(entireProcessTree: true);
            }
        } catch {
        } finally {
            _playbackProcess.Dispose();
            _playbackProcess = null;
            _isPlaybackPaused = false;
            _nowPlayingPath = null;
            _nowPlayingLabel = null;
            TogglePlaybackButton.Content = "Pause";
            TogglePlaybackButton.IsEnabled = false;
            StopPlaybackButton.IsEnabled = false;
            NowPlayingText.Text = "Not playing";
        }
    }

    private static void PausePlayback(Process process) {
        if (OperatingSystem.IsMacOS() || OperatingSystem.IsLinux()) {
            SendUnixSignal(process.Id, stop: true);
            return;
        }
        throw new PlatformNotSupportedException("Pause is currently supported on Unix-like systems.");
    }

    private static void ResumePlayback(Process process) {
        if (OperatingSystem.IsMacOS() || OperatingSystem.IsLinux()) {
            SendUnixSignal(process.Id, stop: false);
            return;
        }
        throw new PlatformNotSupportedException("Resume is currently supported on Unix-like systems.");
    }

    private static void SendUnixSignal(int pid, bool stop) {
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows)) {
            throw new PlatformNotSupportedException("Signals are not supported on Windows.");
        }
        var signal = stop
            ? (OperatingSystem.IsMacOS() ? MacSigStop : LinuxSigStop)
            : (OperatingSystem.IsMacOS() ? MacSigCont : LinuxSigCont);
        var result = kill(pid, signal);
        if (result != 0) {
            throw new Win32Exception(Marshal.GetLastWin32Error());
        }
    }

    private static string EscapeSingleQuotes(string input) {
        return input.Replace("'", "''", StringComparison.Ordinal);
    }

    private void EditPost_Click(object? sender, RoutedEventArgs e) {
        if (sender is not Button { Tag: PostCardModel post }) {
            return;
        }
        _editingPostId = post.Id;
        EditPostTextBox.Text = post.Text;
        SetEditDateTime(ParseDateTimeForEdit(post.DateRaw));
        if (string.IsNullOrWhiteSpace(post.ImagePath)) {
            ClearEditImageSelection();
        } else {
            SetSelectedImagePreview(EditSelectedImagePreview, EditSelectedImageNameText, EditClearImageButton,
                post.ImagePath, ref _editSelectedImageBitmap, ref _editSelectedImagePath);
        }
        if (post.Music is null) {
            ClearEditMusicSelection();
        } else {
            _editSelectedMusicFileName = post.Music.File;
            EditSelectedMusicNameText.Text = post.Music.File;
            EditClearMusicButton.IsVisible = true;
            EditMusicMetadataPanel.IsVisible = true;
            EditMusicTitleTextBox.Text = post.Music.Title;
            EditMusicArtistTextBox.Text = post.Music.Artist;
        }
        EditOverlay.IsVisible = true;
    }

    private static DateTimeOffset ParseDateTimeForEdit(string value) {
        return DateTimeOffset.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out var local)
            ? local
            : DateTimeOffset.Now;
    }

    private async void SelectEditImage_Click(object? sender, RoutedEventArgs e) {
        await SelectImageAsync(editing: true);
    }

    private void ClearEditImage_Click(object? sender, RoutedEventArgs e) {
        ClearEditImageSelection();
    }

    private async void SelectEditMusic_Click(object? sender, RoutedEventArgs e) {
        await SelectMusicAsync(editing: true);
    }

    private void ClearEditMusic_Click(object? sender, RoutedEventArgs e) {
        ClearEditMusicSelection();
    }

    private async void SaveEditedPost_Click(object? sender, RoutedEventArgs e) {
        var text = EditPostTextBox.Text?.Trim();
        if (string.IsNullOrWhiteSpace(text)) {
            ShowStatus("Post text cannot be empty", false);
            return;
        }
        MusicInfo? music = null;
        if (!string.IsNullOrWhiteSpace(_editSelectedMusicFileName)) {
            var title = EditMusicTitleTextBox.Text?.Trim();
            var artist = EditMusicArtistTextBox.Text?.Trim();
            if (string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(artist)) {
                ShowStatus("Please enter music title and artist", false);
                return;
            }
            music = new MusicInfo {
                Title = title,
                Artist = artist,
                File = _editSelectedMusicFileName
            };
        }
        var updated = new PostRecord {
            Id = _editingPostId,
            Text = text,
            Date = ComposeDateTime(EditDatePicker.SelectedDate, EditTimePicker.SelectedTime).ToString("o"),
            Image = _editSelectedImagePath,
            Music = music
        };
        try {
            await _postRepository.UpdatePostAsync(updated);
            await ReloadPostsAsync();
            CloseEditDialog();
            ShowStatus("Post updated successfully!", true);
        } catch (Exception ex) {
            ShowStatus($"Error updating post: {ex.Message}", false);
        }
    }

    private void CloseEditDialog_Click(object? sender, RoutedEventArgs e) {
        CloseEditDialog();
    }

    private void CloseEditDialog() {
        EditOverlay.IsVisible = false;
        _editingPostId = 0;
    }

    private void DeletePost_Click(object? sender, RoutedEventArgs e) {
        if (sender is not Button { Tag: PostCardModel post }) {
            return;
        }
        _deletingPostId = post.Id;
        DeletePromptText.Text = $"Delete post #{post.Id}? This action cannot be undone.";
        DeleteOverlay.IsVisible = true;
    }

    private void CloseDeleteDialog_Click(object? sender, RoutedEventArgs e) {
        DeleteOverlay.IsVisible = false;
        _deletingPostId = 0;
    }

    private async void ConfirmDelete_Click(object? sender, RoutedEventArgs e) {
        if (_deletingPostId == 0) {
            DeleteOverlay.IsVisible = false;
            return;
        }
        try {
            await _postRepository.DeletePostAsync(_deletingPostId);
            await ReloadPostsAsync();
            DeleteOverlay.IsVisible = false;
            ShowStatus("Post deleted successfully!", true);
        } catch (Exception ex) {
            DeleteOverlay.IsVisible = false;
            ShowStatus($"Error deleting post: {ex.Message}", false);
        } finally {
            _deletingPostId = 0;
        }
    }

    private async void Sync_Click(object? sender, RoutedEventArgs e) {
        try {
            SyncButton.IsEnabled = false;
            SyncProgress.IsVisible = true;
            var commitMessage = await _gitSyncService.SyncAsync();
            ShowStatus($"Successfully synced to GitHub: {commitMessage}", true);
        } catch (Exception ex) {
            ShowStatus($"Error syncing to GitHub: {ex.Message}", false);
        } finally {
            SyncProgress.IsVisible = false;
            SyncButton.IsEnabled = true;
        }
    }

    private void ToggleFullscreen_Click(object? sender, RoutedEventArgs e) {
        WindowState = WindowState == WindowState.FullScreen ? WindowState.Normal : WindowState.FullScreen;
    }

    private void ToggleTheme_Click(object? sender, RoutedEventArgs e) {
        if (Application.Current is null) {
            return;
        }
        var current = Application.Current.RequestedThemeVariant;
        var isDark = current == ThemeVariant.Dark;
        Application.Current.RequestedThemeVariant = isDark ? ThemeVariant.Light : ThemeVariant.Dark;
        Classes.Set("theme-dark", !isDark);
        UpdateThemeButtonText();
    }

    private void UpdateThemeButtonText() {
        if (Application.Current is null) {
            return;
        }
        var isDark = Application.Current.RequestedThemeVariant == ThemeVariant.Dark;
        Classes.Set("theme-dark", isDark);
        ToggleThemeButton.Content = isDark ? "Light Mode" : "Night Mode";
    }

    protected override void OnClosed(EventArgs e) {
        base.OnClosed(e);
        _statusHideCts?.Cancel();
        StopPlayback();
        DisposeCurrentPosts();
        _selectedImageBitmap?.Dispose();
        _editSelectedImageBitmap?.Dispose();
    }
}
