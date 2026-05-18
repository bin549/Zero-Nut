using System.Diagnostics;

namespace DesktopApp.Services;

public sealed class GitSyncService {
    public async Task<string> SyncAsync() {
        var commitMessage = $"Update posts ({DateTimeOffset.Now:yyyy-MM-dd_HH-mm-ss})";
        var command = string.Join("\n", new[] {
            $"cd \"{ProjectPaths.ProjectRoot}\"",
            "git status --short src/data/tg/posts.json src/static",
            "git add -A -- src/data/tg/posts.json src/static",
            $"if ! git diff --cached --quiet; then git commit -m \"{commitMessage}\"; else echo \"No changes to commit\"; fi",
            "git pull --rebase origin main || git pull --rebase origin master",
            "git push origin HEAD:main",
            "git status --short src/data/tg/posts.json src/static"
        });
        var startInfo = new ProcessStartInfo {
            FileName = "/bin/bash",
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };
        startInfo.ArgumentList.Add("-lc");
        startInfo.ArgumentList.Add(command);
        using var process = Process.Start(startInfo) ?? throw new InvalidOperationException("Failed to start git sync process");
        var stdoutTask = process.StandardOutput.ReadToEndAsync();
        var stderrTask = process.StandardError.ReadToEndAsync();
        await process.WaitForExitAsync();
        var stdout = await stdoutTask;
        var stderr = await stderrTask;
        if (process.ExitCode != 0) {
            throw new InvalidOperationException(string.IsNullOrWhiteSpace(stderr) ? stdout : stderr.Trim());
        }
        return string.IsNullOrWhiteSpace(stdout) ? commitMessage : $"{commitMessage}\n{stdout.Trim()}";
    }
}