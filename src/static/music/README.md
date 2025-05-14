# 音乐播放器使用说明

## 当前音乐列表
目前播放器包含以下音乐：
1. Fallen Down (Reprise) - Toby Fox
2. Home - Disasterpeace
3. Time Passes - Kevin MacLeod

## 添加更多音乐文件
1. 将您喜欢的MP3音乐文件放置在此目录（`static/music/`）中
2. 修改 `layouts/partials/music-player.html` 中的播放列表以包含新的音乐

## 修改播放列表
播放列表在 `layouts/partials/music-player.html` 文件中定义，找到以下代码部分：

```javascript
const playlist = [
  { title: "Fallen Down (Reprise)", artist: "Toby Fox", src: "/music/Toby Fox - Fallen Down (Reprise).mp3" },
  { title: "Home", artist: "Disasterpeace", src: "/music/Disasterpeace - Home.mp3" },
  { title: "Time Passes", artist: "Kevin MacLeod", src: "/music/Kevin MacLeod - Time Passes.mp3" }
];
```

您可以根据需要添加、删除或修改歌曲。确保：
1. 每首歌曲都有 `title`（标题）、`artist`（艺术家）和 `src`（文件路径）
2. 文件路径正确指向 `static/music/` 目录中的MP3文件
3. 使用合法的、您拥有版权的音乐，或来自免费资源的音乐

## 推荐免费音乐资源
1. [Free Stock Music](https://www.free-stock-music.com/)
2. [Free Sounds Info](https://freesounds.info/)
3. [Free Website Music](https://freewebsitemusic.net/)

## 自定义播放器外观
如需修改播放器的外观，请编辑 `layouts/partials/music-player.html` 文件中的CSS类和HTML结构。 