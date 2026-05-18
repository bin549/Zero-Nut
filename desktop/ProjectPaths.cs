namespace DesktopApp;

public static class ProjectPaths {
    private static readonly Lazy<string> ProjectRootLazy = new(FindProjectRoot);
    public static string ProjectRoot => ProjectRootLazy.Value;
    public static string PostsFilePath => Path.Combine(ProjectRoot, "src", "data", "tg", "posts.json");
    public static string StaticRoot => Path.Combine(ProjectRoot, "src", "static");
    public static string ImagesDirectory => Path.Combine(StaticRoot, "images", "backgrounds");
    public static string MusicDirectory => Path.Combine(StaticRoot, "music");

    public static void EnsureRequiredDirectories() {
        Directory.CreateDirectory(Path.GetDirectoryName(PostsFilePath) ?? ProjectRoot);
        Directory.CreateDirectory(ImagesDirectory);
        Directory.CreateDirectory(MusicDirectory);
    }

    private static string FindProjectRoot() {
        var current = new DirectoryInfo(AppContext.BaseDirectory);
        while (current is not null) {
            var candidate = current.FullName;
            var postsPath = Path.Combine(candidate, "src", "data", "tg", "posts.json");
            if (File.Exists(postsPath)) {
                return candidate;
            }
            current = current.Parent;
        }

        return "/Users/Shared/1_work/web/zero-nut";
    }
}