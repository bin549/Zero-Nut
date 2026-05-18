using System.Text.Json;
using System.Text.Encodings.Web;
using DesktopApp.Models;

namespace DesktopApp.Services;

public sealed class PostRepository {
    private static readonly JsonSerializerOptions JsonOptions = new() {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
        WriteIndented = true
    };

    public async Task<IReadOnlyList<PostRecord>> LoadPostsAsync(bool strict = false) {
        ProjectPaths.EnsureRequiredDirectories();

        if (!File.Exists(ProjectPaths.PostsFilePath)) {
            return [];
        }

        var json = await File.ReadAllTextAsync(ProjectPaths.PostsFilePath);
        if (string.IsNullOrWhiteSpace(json)) {
            return [];
        }

        try {
            return JsonSerializer.Deserialize<List<PostRecord>>(json, JsonOptions) ?? [];
        } catch when (!strict) {
            return [];
        }
    }

    public async Task<PostRecord> AddPostAsync(PostRecord draft) {
        var posts = (await LoadPostsAsync(strict: true)).ToList();
        var highestId = posts.Count == 0 ? 0 : posts.Max(post => post.Id);

        var newPost = new PostRecord {
            Id = highestId + 1,
            Date = string.IsNullOrWhiteSpace(draft.Date) ? DateTimeOffset.UtcNow.ToString("o") : draft.Date,
            Text = draft.Text,
            Image = draft.Image,
            Music = draft.Music
        };

        posts.Insert(0, newPost);
        await SavePostsAsync(posts);
        return newPost;
    }

    public async Task<PostRecord> UpdatePostAsync(PostRecord updatedPost) {
        var posts = (await LoadPostsAsync(strict: true)).ToList();
        var index = posts.FindIndex(post => post.Id == updatedPost.Id);
        if (index < 0) {
            throw new InvalidOperationException($"Post with ID {updatedPost.Id} not found");
        }
        posts[index] = new PostRecord {
            Id = posts[index].Id,
            Date = string.IsNullOrWhiteSpace(updatedPost.Date) ? posts[index].Date : updatedPost.Date,
            Text = string.IsNullOrWhiteSpace(updatedPost.Text) ? posts[index].Text : updatedPost.Text,
            Image = updatedPost.Image,
            Music = updatedPost.Music
        };

        await SavePostsAsync(posts);
        return posts[index];
    }

    public async Task DeletePostAsync(int postId) {
        var posts = (await LoadPostsAsync(strict: true)).ToList();
        var postToDelete = posts.FirstOrDefault(post => post.Id == postId);
        if (postToDelete is null) {
            throw new InvalidOperationException($"Post with ID {postId} not found");
        }
        var removed = posts.RemoveAll(post => post.Id == postId);
        if (removed == 0) {
            throw new InvalidOperationException($"Post with ID {postId} not found");
        }
        await SavePostsAsync(posts);
        DeleteUnusedMusicFile(postToDelete.Music?.File, posts);
    }

    private static async Task SavePostsAsync(IEnumerable<PostRecord> posts) {
        ProjectPaths.EnsureRequiredDirectories();
        var json = JsonSerializer.Serialize(posts, JsonOptions);
        await File.WriteAllTextAsync(ProjectPaths.PostsFilePath, json);
    }

    private static void DeleteUnusedMusicFile(string? fileName, IReadOnlyList<PostRecord> remainingPosts) {
        if (string.IsNullOrWhiteSpace(fileName)) {
            return;
        }

        var normalizedFileName = Path.GetFileName(fileName);
        if (string.IsNullOrWhiteSpace(normalizedFileName)) {
            return;
        }

        var stillReferenced = remainingPosts.Any(post =>
            post.Music is not null &&
            string.Equals(Path.GetFileName(post.Music.File), normalizedFileName, StringComparison.OrdinalIgnoreCase));

        if (stillReferenced) {
            return;
        }

        var musicFilePath = Path.Combine(ProjectPaths.MusicDirectory, normalizedFileName);
        if (File.Exists(musicFilePath)) {
            File.Delete(musicFilePath);
        }
    }
}