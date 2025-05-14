const {app, BrowserWindow, ipcMain, dialog} = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const https = require('https');
const { ipcRenderer } = require('electron');

app.disableHardwareAcceleration();

let postsFilePath;
let posts = [];
let selectedImage = null;
let selectedMusic = null;
let editingSelectedImage = null;
let editingSelectedMusic = null;
let currentEditingPostId = null;

const findPostsFile = () => {
    console.log(`Current app path: ${app.getAppPath()}`);
    console.log(`App is packaged: ${app.isPackaged}`);
    if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
        const rootPath = path.dirname(app.getAppPath());
        console.log(`Development root directory: ${rootPath}`);
        return path.join(rootPath, 'src', 'data', 'tg', 'posts.json');
    }
    const alternativePaths = [
        path.resolve(app.getAppPath(), '../../../../../src/data/tg/posts.json'),
        '/Users/Shared/1_work/web/zero-nut/src/data/tg/posts.json',
        path.resolve(app.getAppPath(), '../../../../src/data/tg/posts.json'),
        path.resolve(app.getAppPath(), '../../../src/data/tg/posts.json'),
        path.resolve(app.getAppPath(), '../../src/data/tg/posts.json')
    ];
    console.log('Trying to find posts.json file:');
    for (let i = 0; i < alternativePaths.length; i++) {
        const p = alternativePaths[i];
        console.log(`${i + 1}. Checking ${p}`);
        if (fs.existsSync(p)) {
            console.log(`Found posts.json: ${p}`);
            return p;
        }
    }
    console.log(`Posts file not found, using first path: ${alternativePaths[0]}`);
    return alternativePaths[0];
};

postsFilePath = findPostsFile();
console.log(`Final posts file path: ${postsFilePath}`);

const requireLogin = false;
let mainWindow = null;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        backgroundColor: '#ffffff',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    mainWindow.loadFile('index.html');
    loadPosts(mainWindow);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function loadPosts(targetWindow) {
    console.log(`Trying to read posts file: ${postsFilePath}`);
    targetWindow.webContents.send('posts-file-path', postsFilePath);
    fs.readFile(postsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Failed to read posts file: ${err.message}`);
            targetWindow.webContents.send('posts-data', []);
            return;
        }
        try {
            const posts = JSON.parse(data);
            console.log(`Found ${posts.length} posts`);
            targetWindow.webContents.send('posts-data', posts);
        } catch (parseErr) {
            console.error(`Failed to parse posts data: ${parseErr.message}`);
            targetWindow.webContents.send('posts-data', []);
        }
    });
}

function addNewPost(post) {
    return new Promise((resolve, reject) => {
        fs.readFile(postsFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error(`Failed to read posts file: ${err.message}`);
                return reject(err);
            }
            try {
                const posts = JSON.parse(data);
                const highestId = posts.reduce((max, p) => Math.max(max, p.id), 0);
                const newPost = {
                    id: highestId + 1,
                    date: post.date || new Date().toISOString(),
                    text: post.text,
                    images: post.images || []
                };
                posts.unshift(newPost);
                fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2), 'utf8', (writeErr) => {
                    if (writeErr) {
                        console.error(`Failed to write posts file: ${writeErr.message}`);
                        return reject(writeErr);
                    }
                    console.log(`Added new post with ID: ${newPost.id}`);
                    resolve(newPost);
                });
            } catch (parseErr) {
                console.error(`Failed to parse posts data: ${parseErr.message}`);
                reject(parseErr);
            }
        });
    });
}

function editPost(postId, updatedPost) {
    return new Promise((resolve, reject) => {
        fs.readFile(postsFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error(`Failed to read posts file: ${err.message}`);
                return reject(err);
            }
            try {
                let posts = JSON.parse(data);
                const postIndex = posts.findIndex(p => p.id === postId);
                if (postIndex === -1) {
                    return reject(new Error(`Post with ID ${postId} not found`));
                }
                posts[postIndex] = {
                    ...posts[postIndex],
                    date: updatedPost.date || posts[postIndex].date,
                    text: updatedPost.text || posts[postIndex].text
                };
                fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2), 'utf8', (writeErr) => {
                    if (writeErr) {
                        console.error(`Failed to write posts file: ${writeErr.message}`);
                        return reject(writeErr);
                    }
                    console.log(`Updated post with ID: ${postId}`);
                    resolve(posts[postIndex]);
                });
            } catch (parseErr) {
                console.error(`Failed to parse posts data: ${parseErr.message}`);
                reject(parseErr);
            }
        });
    });
}

function deletePost(postId) {
    return new Promise((resolve, reject) => {
        fs.readFile(postsFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error(`Failed to read posts file: ${err.message}`);
                return reject(err);
            }
            try {
                let posts = JSON.parse(data);
                const originalLength = posts.length;
                posts = posts.filter(p => p.id !== postId);
                if (posts.length === originalLength) {
                    return reject(new Error(`Post with ID ${postId} not found`));
                }
                fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2), 'utf8', (writeErr) => {
                    if (writeErr) {
                        console.error(`Failed to write posts file: ${writeErr.message}`);
                        return reject(writeErr);
                    }
                    console.log(`Deleted post with ID: ${postId}`);
                    resolve({ success: true, postId });
                });
            } catch (parseErr) {
                console.error(`Failed to parse posts data: ${parseErr.message}`);
                reject(parseErr);
            }
        });
    });
}

function syncWithGitHubDirect() {
    return new Promise((resolve, reject) => {
        const projectRoot = path.resolve('/Users/Shared/1_work/web/zero-nut');
        const postsRelativePath = path.relative(projectRoot, postsFilePath);
        console.log(`Project root path: ${projectRoot}`);
        console.log(`Posts relative path from project root: ${postsRelativePath}`);
        fs.access(path.join(projectRoot, '.git'), fs.constants.F_OK, (err) => {
            if (err) {
                return reject(new Error(`The directory "${projectRoot}" is not a git repository. Please initialize git first.`));
            }
            const now = new Date();
            const timestamp = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
            const commitMessage = `Update posts (${timestamp})`;
            const tempScriptPath = path.join(app.getPath('temp'), 'git-sync-direct.sh');
            const gitCommands = [
                `cd "${projectRoot}"`,
                `git add "${postsRelativePath}"`,
                `git commit -m "${commitMessage}" || echo "No changes to commit"`,
                `git pull --rebase origin main || git pull --rebase origin master || echo "No remote changes to pull"`,
                `git push origin HEAD || echo "Not pushing to remote (possibly not configured)"`
            ];
            fs.writeFile(tempScriptPath, `#!/bin/bash\n${gitCommands.join('\n')}`, { mode: 0o700 }, (writeErr) => {
                if (writeErr) {
                    return reject(new Error(`Failed to create temporary script: ${writeErr.message}`));
                }
                exec(`bash "${tempScriptPath}"`, (execErr, stdout, stderr) => {
                    fs.unlink(tempScriptPath, () => {});
                    console.log('Git sync stdout:', stdout);
                    if (execErr) {
                        console.error('Git sync error:', execErr);
                        console.error('stderr:', stderr);
                        return reject(new Error(`Git sync failed: ${stderr || execErr.message}`));
                    }
                    resolve({ success: true, message: commitMessage });
                });
            });
        });
    });
}

app.whenReady().then(() => {
    console.log('Application is ready');
    console.log('Node version:', process.versions.node);
    console.log('Electron version:', process.versions.electron);
    console.log('Chrome version:', process.versions.chrome);
    createMainWindow();
});

ipcMain.on('add-post', async (event, post) => {
    try {
        const newPost = await addNewPost(post);
        event.reply('post-added', { success: true, post: newPost });
        if (mainWindow) {
            loadPosts(mainWindow);
        }
    } catch (error) {
        console.error('Error adding post:', error);
        event.reply('post-added', { success: false, error: error.message });
    }
});

ipcMain.on('edit-post', async (event, data) => {
    try {
        const updatedPost = await editPost(data.id, data.post);
        event.reply('post-edited', { success: true, post: updatedPost });
        if (mainWindow) {
            loadPosts(mainWindow);
        }
    } catch (error) {
        console.error('Error editing post:', error);
        event.reply('post-edited', { success: false, error: error.message });
    }
});

ipcMain.on('delete-post', async (event, postId) => {
    try {
        await deletePost(postId);
        event.reply('post-deleted', { success: true, postId });
        if (mainWindow) {
            loadPosts(mainWindow);
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        event.reply('post-deleted', { success: false, error: error.message });
    }
});

ipcMain.on('github-sync-direct', async (event) => {
    try {
        const result = await syncWithGitHubDirect();
        event.reply('github-sync-result', { success: true, message: result.message });
    } catch (error) {
        console.error('Error during direct GitHub sync:', error);
        event.reply('github-sync-result', { success: false, error: error.message });
    }
});

ipcMain.on('toggle-fullscreen', (event) => {
    if (mainWindow) {
        const isFullScreen = mainWindow.isFullScreen();
        mainWindow.setFullScreen(!isFullScreen);
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});

// 接收posts数据，已有的
ipcRenderer.on('posts-data', (event, data) => {
    posts = data;
    renderPosts();
});

// 接收文件路径，已有的
ipcRenderer.on('posts-file-path', (event, path) => {
    document.getElementById('post-file-path').textContent = `Posts file: ${path}`;
});

// 显示post列表，需要修改以支持图片和音乐
function renderPosts() {
    const container = document.getElementById('posts-container');
    const noPostsMessage = document.getElementById('no-posts-message');
    
    if (!posts || posts.length === 0) {
        container.innerHTML = '';
        noPostsMessage.style.display = 'block';
        return;
    }
    
    noPostsMessage.style.display = 'none';
    container.innerHTML = posts.map(post => {
        const date = new Date(post.date).toLocaleString();
        
        // 处理音乐信息
        let musicInfo = '';
        if (post.music) {
            musicInfo = `
                <div class="post-music-info">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M6 13c0 1.105-1.12 2-2.5 2S1 14.105 1 13c0-1.104 1.12-2 2.5-2s2.5.896 2.5 2zm9-2c0 1.105-1.12 2-2.5 2s-2.5-.895-2.5-2 1.12-2 2.5-2 2.5.895 2.5 2z"/>
                        <path fill-rule="evenodd" d="M14 11V2h1v9h-1zM6 3v10H5V3h1z"/>
                        <path d="M5 2.905a1 1 0 0 1 .9-.995l8-.8a1 1 0 0 1 1.1.995V3L5 4V2.905z"/>
                    </svg>
                    ${post.music.title} - ${post.music.artist}
                </div>
            `;
        }
        
        // 添加背景图片元素
        let backgroundImage = '';
        if (post.image) {
            backgroundImage = `<img src="${post.image}" class="post-image-bg" alt="Background">`;
        }
        
        return `
            <div class="post-card" data-id="${post.id}">
                ${backgroundImage}
                <div class="post-content">
                    <div class="post-header">
                        <span class="post-id">#${post.id}</span>
                        <span class="post-date">${date}</span>
                    </div>
                    <div class="post-text">${post.text}</div>
                    ${musicInfo}
                    <div class="post-actions">
                        <button class="edit-button" onclick="openEditModal(${post.id})">Edit</button>
                        <button class="delete-button" onclick="openDeleteConfirmation(${post.id})">Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 添加新的post，修改以支持图片和音乐
function addPost() {
    const text = document.getElementById('post-text').value.trim();
    if (!text) {
        showStatusMessage('Please enter post text', false);
        return;
    }
    
    const dateInput = document.getElementById('post-date').value;
    
    let post = {
        text: text
    };
    
    if (dateInput) {
        post.date = new Date(dateInput).toISOString();
    }
    
    // 添加背景图片
    if (selectedImage) {
        post.image = selectedImage;
    }
    
    // 添加音乐
    if (selectedMusic) {
        const title = document.getElementById('music-title').value.trim();
        const artist = document.getElementById('music-artist').value.trim();
        
        if (!title || !artist) {
            showStatusMessage('Please enter music title and artist', false);
            return;
        }
        
        post.music = {
            title: title,
            artist: artist,
            file: selectedMusic
        };
    }
    
    ipcRenderer.send('add-post', post);
    
    // 清空表单
    document.getElementById('post-text').value = '';
    document.getElementById('post-date').value = '';
    clearSelectedImage();
    clearSelectedMusic();
}

// 打开编辑模态框，支持图片和音乐
function openEditModal(postId) {
    currentEditingPostId = postId;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    document.getElementById('edit-post-id').value = post.id;
    document.getElementById('edit-post-text').value = post.text;
    
    // 处理日期
    if (post.date) {
        const date = new Date(post.date);
        document.getElementById('edit-post-date').value = date.toISOString().slice(0, 16);
    } else {
        document.getElementById('edit-post-date').value = '';
    }
    
    // 处理背景图片
    if (post.image) {
        editingSelectedImage = post.image;
        displayEditImagePreview(post.image);
    } else {
        clearEditSelectedImage();
    }
    
    // 处理音乐
    if (post.music) {
        editingSelectedMusic = post.music.file;
        document.getElementById('edit-selected-music-name').textContent = post.music.file;
        document.getElementById('edit-clear-music-btn').style.display = 'block';
        document.getElementById('edit-music-metadata-section').style.display = 'block';
        document.getElementById('edit-music-title').value = post.music.title;
        document.getElementById('edit-music-artist').value = post.music.artist;
    } else {
        clearEditSelectedMusic();
    }
    
    document.getElementById('edit-modal').style.display = 'flex';
}

// 保存编辑后的post，支持图片和音乐
function saveEditedPost() {
    const postId = parseInt(document.getElementById('edit-post-id').value);
    const text = document.getElementById('edit-post-text').value.trim();
    if (!text) {
        alert('Please enter post text');
        return;
    }
    
    const dateInput = document.getElementById('edit-post-date').value;
    
    let updatedPost = {
        text: text
    };
    
    if (dateInput) {
        updatedPost.date = new Date(dateInput).toISOString();
    }
    
    // 设置背景图片，如果有更改
    if (editingSelectedImage) {
        updatedPost.image = editingSelectedImage;
    } else {
        // 如果清除了图片，设置为 null
        updatedPost.image = null;
    }
    
    // 设置音乐，如果有选择
    if (editingSelectedMusic) {
        const title = document.getElementById('edit-music-title').value.trim();
        const artist = document.getElementById('edit-music-artist').value.trim();
        
        if (!title || !artist) {
            alert('Please enter music title and artist');
            return;
        }
        
        updatedPost.music = {
            title: title,
            artist: artist,
            file: editingSelectedMusic
        };
    } else {
        // 如果清除了音乐，设置为 null
        updatedPost.music = null;
    }
    
    ipcRenderer.send('edit-post', { id: postId, post: updatedPost });
    closeEditModal();
}

// 清除编辑模态框
function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
    currentEditingPostId = null;
    editingSelectedImage = null;
    editingSelectedMusic = null;
}

// 选择背景图片
async function selectImage() {
    const imagePath = await ipcRenderer.invoke('select-image');
    if (imagePath) {
        selectedImage = imagePath;
        displayImagePreview(imagePath);
    }
}

// 清除选择的背景图片
function clearSelectedImage() {
    selectedImage = null;
    document.getElementById('selected-image-name').textContent = 'No image selected';
    document.getElementById('image-preview').style.display = 'none';
    document.getElementById('clear-image-btn').style.display = 'none';
}

// 显示图片预览
function displayImagePreview(imagePath) {
    const preview = document.getElementById('image-preview');
    const nameEl = document.getElementById('selected-image-name');
    const clearBtn = document.getElementById('clear-image-btn');
    
    // 提取文件名部分
    const fileName = imagePath.split('/').pop();
    nameEl.textContent = fileName;
    
    // 更新预览图
    preview.src = imagePath;
    preview.style.display = 'block';
    clearBtn.style.display = 'block';
}

// 选择背景图片（编辑模式）
async function selectEditImage() {
    const imagePath = await ipcRenderer.invoke('select-image');
    if (imagePath) {
        editingSelectedImage = imagePath;
        displayEditImagePreview(imagePath);
    }
}

// 清除选择的背景图片（编辑模式）
function clearEditSelectedImage() {
    editingSelectedImage = null;
    document.getElementById('edit-selected-image-name').textContent = 'No image selected';
    document.getElementById('edit-image-preview').style.display = 'none';
    document.getElementById('edit-clear-image-btn').style.display = 'none';
}

// 显示图片预览（编辑模式）
function displayEditImagePreview(imagePath) {
    const preview = document.getElementById('edit-image-preview');
    const nameEl = document.getElementById('edit-selected-image-name');
    const clearBtn = document.getElementById('edit-clear-image-btn');
    
    // 提取文件名部分
    const fileName = imagePath.split('/').pop();
    nameEl.textContent = fileName;
    
    // 更新预览图
    preview.src = imagePath;
    preview.style.display = 'block';
    clearBtn.style.display = 'block';
}

// 选择音乐文件
async function selectMusic() {
    const result = await ipcRenderer.invoke('select-music');
    if (result) {
        selectedMusic = result.filePath;
        document.getElementById('selected-music-name').textContent = result.fileName;
        document.getElementById('clear-music-btn').style.display = 'block';
        document.getElementById('music-metadata-section').style.display = 'block';
        
        // 尝试从文件名提取艺术家和曲目信息
        const parts = result.fileName.replace(/\.[^/.]+$/, '').split(' - ');
        if (parts.length > 1) {
            document.getElementById('music-artist').value = parts[0].trim();
            document.getElementById('music-title').value = parts[1].trim();
        } else {
            document.getElementById('music-title').value = parts[0].trim();
        }
    }
}

// 清除选择的音乐
function clearSelectedMusic() {
    selectedMusic = null;
    document.getElementById('selected-music-name').textContent = 'No music selected';
    document.getElementById('clear-music-btn').style.display = 'none';
    document.getElementById('music-metadata-section').style.display = 'none';
    document.getElementById('music-title').value = '';
    document.getElementById('music-artist').value = '';
}

// 选择音乐文件（编辑模式）
async function selectEditMusic() {
    const result = await ipcRenderer.invoke('select-music');
    if (result) {
        editingSelectedMusic = result.filePath;
        document.getElementById('edit-selected-music-name').textContent = result.fileName;
        document.getElementById('edit-clear-music-btn').style.display = 'block';
        document.getElementById('edit-music-metadata-section').style.display = 'block';
        
        // 尝试从文件名提取艺术家和曲目信息
        const parts = result.fileName.replace(/\.[^/.]+$/, '').split(' - ');
        if (parts.length > 1) {
            document.getElementById('edit-music-artist').value = parts[0].trim();
            document.getElementById('edit-music-title').value = parts[1].trim();
        } else {
            document.getElementById('edit-music-title').value = parts[0].trim();
        }
    }
}

// 清除选择的音乐（编辑模式）
function clearEditSelectedMusic() {
    editingSelectedMusic = null;
    document.getElementById('edit-selected-music-name').textContent = 'No music selected';
    document.getElementById('edit-clear-music-btn').style.display = 'none';
    document.getElementById('edit-music-metadata-section').style.display = 'none';
    document.getElementById('edit-music-title').value = '';
    document.getElementById('edit-music-artist').value = '';
}

// 切换全屏模式
function toggleFullscreen() {
    ipcRenderer.send('toggle-fullscreen');
}

// Post添加成功的回调，不需要修改
// ... 保留现有代码 ...

// Post编辑成功的回调，不需要修改
// ... 保留现有代码 ...

// Post删除成功的回调，不需要修改
// ... 保留现有代码 ...
