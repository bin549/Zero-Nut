namespace DesktopApp.Models;

public sealed class PostRecord {
    public int Id { get; set; }
    public string Date { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public string? Image { get; set; }
    public MusicInfo? Music { get; set; }
}