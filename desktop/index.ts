import { app, BrowserWindow, ipcMain, dialog, IpcMainEvent } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';
import * as https from 'https';

app.disableHardwareAcceleration();

let postsFilePath: string;

interface Post {
    id: number;
    date: string;
    text: string;
    images: string[];
}

interface UpdatedPost {
    date?: string;
    text?: string;
    images?: string[];
}

interface SyncResult {
    success: boolean;
    message: string;
}

interface PostResult {
    success: boolean;
    post?: Post;
    error?: string;
    postId?: number;
}

const findPostsFile = (): string => {
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
let mainWindow: BrowserWindow | null = null;

function createMainWindow(): void {
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

function loadPosts(targetWindow: BrowserWindow): void {
    console.log(`Trying to read posts file: ${postsFilePath}`);
    targetWindow.webContents.send('posts-file-path', postsFilePath);
    fs.readFile(postsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Failed to read posts file: ${err.message}`);
            targetWindow.webContents.send('posts-data', []);
            return;
        }
        try {
            const posts: Post[] = JSON.parse(data);
            console.log(`Found ${posts.length} posts`);
            targetWindow.webContents.send('posts-data', posts);
        } catch (parseErr) {
            console.error(`Failed to parse posts data: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`);
            targetWindow.webContents.send('posts-data', []);
        }
    });
}

function addNewPost(post: Partial<Post>): Promise<Post> {
    return new Promise((resolve, reject) => {
        fs.readFile(postsFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error(`Failed to read posts file: ${err.message}`);
                return reject(err);
            }
            try {
                const posts: Post[] = JSON.parse(data);
                const highestId = posts.reduce((max, p) => Math.max(max, p.id), 0);
                const newPost: Post = {
                    id: highestId + 1,
                    date: post.date || new Date().toISOString(),
                    text: post.text || '',
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
                console.error(`Failed to parse posts data: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`);
                reject(parseErr);
            }
        });
    });
}

function editPost(postId: number, updatedPost: UpdatedPost): Promise<Post> {
    return new Promise((resolve, reject) => {
        fs.readFile(postsFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error(`Failed to read posts file: ${err.message}`);
                return reject(err);
            }
            try {
                let posts: Post[] = JSON.parse(data);
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
                console.error(`Failed to parse posts data: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`);
                reject(parseErr);
            }
        });
    });
}

function deletePost(postId: number): Promise<{ success: boolean; postId: number }> {
    return new Promise((resolve, reject) => {
        fs.readFile(postsFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error(`Failed to read posts file: ${err.message}`);
                return reject(err);
            }
            try {
                let posts: Post[] = JSON.parse(data);
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
                console.error(`Failed to parse posts data: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`);
                reject(parseErr);
            }
        });
    });
}

function syncWithGitHubDirect(): Promise<SyncResult> {
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

ipcMain.on('add-post', async (event: IpcMainEvent, post: Partial<Post>) => {
    try {
        const newPost = await addNewPost(post);
        event.reply('post-added', { success: true, post: newPost });
        if (mainWindow) {
            loadPosts(mainWindow);
        }
    } catch (error) {
        console.error('Error adding post:', error);
        event.reply('post-added', { success: false, error: error instanceof Error ? error.message : String(error) });
    }
});

ipcMain.on('edit-post', async (event: IpcMainEvent, data: { id: number; post: UpdatedPost }) => {
    try {
        const updatedPost = await editPost(data.id, data.post);
        event.reply('post-edited', { success: true, post: updatedPost });
        if (mainWindow) {
            loadPosts(mainWindow);
        }
    } catch (error) {
        console.error('Error editing post:', error);
        event.reply('post-edited', { success: false, error: error instanceof Error ? error.message : String(error) });
    }
});

ipcMain.on('delete-post', async (event: IpcMainEvent, postId: number) => {
    try {
        await deletePost(postId);
        event.reply('post-deleted', { success: true, postId });
        if (mainWindow) {
            loadPosts(mainWindow);
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        event.reply('post-deleted', { success: false, error: error instanceof Error ? error.message : String(error) });
    }
});

ipcMain.on('github-sync-direct', async (event: IpcMainEvent) => {
    try {
        const result = await syncWithGitHubDirect();
        event.reply('github-sync-result', { success: true, message: result.message });
    } catch (error) {
        console.error('Error during direct GitHub sync:', error);
        event.reply('github-sync-result', { success: false, error: error instanceof Error ? error.message : String(error) });
    }
});

ipcMain.on('toggle-fullscreen', (event: IpcMainEvent) => {
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