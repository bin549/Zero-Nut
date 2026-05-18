using Avalonia.Media.Imaging;
using DesktopApp.Models;
using DesktopApp;

namespace DesktopApp.Services;

public sealed class AssetService {
    public string ImportImage(string sourcePath) {
        ProjectPaths.EnsureRequiredDirectories();

        var extension = Path.GetExtension(sourcePath);
        var fileName = $"bg_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}{extension}";
        var destination = Path.Combine(ProjectPaths.ImagesDirectory, fileName);
        File.Copy(sourcePath, destination, true);

        return $"/images/backgrounds/{fileName}";
    }

    public string ImportMusic(string sourcePath) {
        ProjectPaths.EnsureRequiredDirectories();

        var fileName = Path.GetFileName(sourcePath);
        var destination = Path.Combine(ProjectPaths.MusicDirectory, fileName);
        File.Copy(sourcePath, destination, true);

        return fileName;
    }

    public string? ResolveAssetPath(string? relativePath) {
        if (string.IsNullOrWhiteSpace(relativePath)) {
            return null;
        }

        if (Path.IsPathRooted(relativePath) &&
            !relativePath.StartsWith("/images/", StringComparison.OrdinalIgnoreCase)) {
            return relativePath;
        }

        return Path.Combine(ProjectPaths.StaticRoot, relativePath.TrimStart('/'));
    }

    public Bitmap? LoadBitmap(string? relativePath) {
        var path = ResolveAssetPath(relativePath);
        if (string.IsNullOrWhiteSpace(path) || !File.Exists(path)) {
            return null;
        }

        try {
            return new Bitmap(path);
        } catch {
            return null;
        }
    }

    public MusicInfo? BuildMusicInfo(string? fileName, string? title, string? artist) {
        if (string.IsNullOrWhiteSpace(fileName)) {
            return null;
        }

        return new MusicInfo {
            File = fileName,
            Title = title?.Trim() ?? string.Empty,
            Artist = artist?.Trim() ?? string.Empty
        };
    }

    public (string? Title, string? Artist) ParseMusicFileName(string fileName) {
        var parts = Path.GetFileNameWithoutExtension(fileName).Split(" - ", StringSplitOptions.None);
        if (parts.Length > 1) {
            return (parts[1].Trim(), parts[0].Trim());
        }

        return (parts[0].Trim(), null);
    }
}