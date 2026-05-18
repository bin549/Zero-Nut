using Avalonia.Media.Imaging;

namespace DesktopApp.Models;

public sealed class PostCardModel : IDisposable {
    public int Id { get; init; }
    public string DateRaw { get; init; } = string.Empty;
    public string DateText { get; init; } = string.Empty;
    public string Text { get; init; } = string.Empty;
    public string? ImagePath { get; init; }
    public MusicInfo? Music { get; init; }
    public Bitmap? BackgroundBitmap { get; init; }

    public string IdLabel => $"#{Id}";
    public bool HasMusic => Music is not null;
    public string MusicDisplay => Music is null ? string.Empty : $"{Music.Title} - {Music.Artist}";

    public void Dispose() {
        BackgroundBitmap?.Dispose();
    }
}