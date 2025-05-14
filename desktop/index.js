"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
var fs = require("fs");
var child_process_1 = require("child_process");
electron_1.app.disableHardwareAcceleration();
var postsFilePath;
var findPostsFile = function () {
    console.log("Current app path: ".concat(electron_1.app.getAppPath()));
    console.log("App is packaged: ".concat(electron_1.app.isPackaged));
    if (process.env.NODE_ENV === 'development' || !electron_1.app.isPackaged) {
        var rootPath = path.dirname(electron_1.app.getAppPath());
        console.log("Development root directory: ".concat(rootPath));
        return path.join(rootPath, 'src', 'data', 'tg', 'posts.json');
    }
    var alternativePaths = [
        path.resolve(electron_1.app.getAppPath(), '../../../../../src/data/tg/posts.json'),
        '/Users/Shared/1_work/web/zero-nut/src/data/tg/posts.json',
        path.resolve(electron_1.app.getAppPath(), '../../../../src/data/tg/posts.json'),
        path.resolve(electron_1.app.getAppPath(), '../../../src/data/tg/posts.json'),
        path.resolve(electron_1.app.getAppPath(), '../../src/data/tg/posts.json')
    ];
    console.log('Trying to find posts.json file:');
    for (var i = 0; i < alternativePaths.length; i++) {
        var p = alternativePaths[i];
        console.log("".concat(i + 1, ". Checking ").concat(p));
        if (fs.existsSync(p)) {
            console.log("Found posts.json: ".concat(p));
            return p;
        }
    }
    console.log("Posts file not found, using first path: ".concat(alternativePaths[0]));
    return alternativePaths[0];
};
postsFilePath = findPostsFile();
console.log("Final posts file path: ".concat(postsFilePath));
var requireLogin = false;
var mainWindow = null;
function createMainWindow() {
    mainWindow = new electron_1.BrowserWindow({
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
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}
function loadPosts(targetWindow) {
    console.log("Trying to read posts file: ".concat(postsFilePath));
    targetWindow.webContents.send('posts-file-path', postsFilePath);
    fs.readFile(postsFilePath, 'utf8', function (err, data) {
        if (err) {
            console.error("Failed to read posts file: ".concat(err.message));
            targetWindow.webContents.send('posts-data', []);
            return;
        }
        try {
            var posts = JSON.parse(data);
            console.log("Found ".concat(posts.length, " posts"));
            targetWindow.webContents.send('posts-data', posts);
        }
        catch (parseErr) {
            console.error("Failed to parse posts data: ".concat(parseErr instanceof Error ? parseErr.message : String(parseErr)));
            targetWindow.webContents.send('posts-data', []);
        }
    });
}
function addNewPost(post) {
    return new Promise(function (resolve, reject) {
        fs.readFile(postsFilePath, 'utf8', function (err, data) {
            if (err) {
                console.error("Failed to read posts file: ".concat(err.message));
                return reject(err);
            }
            try {
                var posts = JSON.parse(data);
                var highestId = posts.reduce(function (max, p) { return Math.max(max, p.id); }, 0);
                var newPost_1 = {
                    id: highestId + 1,
                    date: post.date || new Date().toISOString(),
                    text: post.text || '',
                    image: post.image,
                    music: post.music
                };
                posts.unshift(newPost_1);
                fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2), 'utf8', function (writeErr) {
                    if (writeErr) {
                        console.error("Failed to write posts file: ".concat(writeErr.message));
                        return reject(writeErr);
                    }
                    console.log("Added new post with ID: ".concat(newPost_1.id));
                    resolve(newPost_1);
                });
            }
            catch (parseErr) {
                console.error("Failed to parse posts data: ".concat(parseErr instanceof Error ? parseErr.message : String(parseErr)));
                reject(parseErr);
            }
        });
    });
}
function editPost(postId, updatedPost) {
    return new Promise(function (resolve, reject) {
        fs.readFile(postsFilePath, 'utf8', function (err, data) {
            if (err) {
                console.error("Failed to read posts file: ".concat(err.message));
                return reject(err);
            }
            try {
                var posts_1 = JSON.parse(data);
                var postIndex_1 = posts_1.findIndex(function (p) { return p.id === postId; });
                if (postIndex_1 === -1) {
                    return reject(new Error("Post with ID ".concat(postId, " not found")));
                }
                posts_1[postIndex_1] = __assign(__assign({}, posts_1[postIndex_1]), { date: updatedPost.date || posts_1[postIndex_1].date, text: updatedPost.text || posts_1[postIndex_1].text, image: updatedPost.image !== undefined ? updatedPost.image : posts_1[postIndex_1].image, music: updatedPost.music !== undefined ? updatedPost.music : posts_1[postIndex_1].music });
                fs.writeFile(postsFilePath, JSON.stringify(posts_1, null, 2), 'utf8', function (writeErr) {
                    if (writeErr) {
                        console.error("Failed to write posts file: ".concat(writeErr.message));
                        return reject(writeErr);
                    }
                    console.log("Updated post with ID: ".concat(postId));
                    resolve(posts_1[postIndex_1]);
                });
            }
            catch (parseErr) {
                console.error("Failed to parse posts data: ".concat(parseErr instanceof Error ? parseErr.message : String(parseErr)));
                reject(parseErr);
            }
        });
    });
}
function deletePost(postId) {
    return new Promise(function (resolve, reject) {
        fs.readFile(postsFilePath, 'utf8', function (err, data) {
            if (err) {
                console.error("Failed to read posts file: ".concat(err.message));
                return reject(err);
            }
            try {
                var posts = JSON.parse(data);
                var originalLength = posts.length;
                posts = posts.filter(function (p) { return p.id !== postId; });
                if (posts.length === originalLength) {
                    return reject(new Error("Post with ID ".concat(postId, " not found")));
                }
                fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2), 'utf8', function (writeErr) {
                    if (writeErr) {
                        console.error("Failed to write posts file: ".concat(writeErr.message));
                        return reject(writeErr);
                    }
                    console.log("Deleted post with ID: ".concat(postId));
                    resolve({ success: true, postId: postId });
                });
            }
            catch (parseErr) {
                console.error("Failed to parse posts data: ".concat(parseErr instanceof Error ? parseErr.message : String(parseErr)));
                reject(parseErr);
            }
        });
    });
}
function syncWithGitHubDirect() {
    return new Promise(function (resolve, reject) {
        var projectRoot = path.resolve('/Users/Shared/1_work/web/zero-nut');
        var postsRelativePath = path.relative(projectRoot, postsFilePath);
        console.log("Project root path: ".concat(projectRoot));
        console.log("Posts relative path from project root: ".concat(postsRelativePath));
        fs.access(path.join(projectRoot, '.git'), fs.constants.F_OK, function (err) {
            if (err) {
                return reject(new Error("The directory \"".concat(projectRoot, "\" is not a git repository. Please initialize git first.")));
            }
            var now = new Date();
            var timestamp = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
            var commitMessage = "Update posts (".concat(timestamp, ")");
            var tempScriptPath = path.join(electron_1.app.getPath('temp'), 'git-sync-direct.sh');
            var gitCommands = [
                "cd \"".concat(projectRoot, "\""),
                "git add \"".concat(postsRelativePath, "\""),
                "git commit -m \"".concat(commitMessage, "\" || echo \"No changes to commit\""),
                "git pull --rebase origin main || git pull --rebase origin master || echo \"No remote changes to pull\"",
                "git push origin HEAD || echo \"Not pushing to remote (possibly not configured)\""
            ];
            fs.writeFile(tempScriptPath, "#!/bin/bash\n".concat(gitCommands.join('\n')), { mode: 448 }, function (writeErr) {
                if (writeErr) {
                    return reject(new Error("Failed to create temporary script: ".concat(writeErr.message)));
                }
                (0, child_process_1.exec)("bash \"".concat(tempScriptPath, "\""), function (execErr, stdout, stderr) {
                    fs.unlink(tempScriptPath, function () { });
                    console.log('Git sync stdout:', stdout);
                    if (execErr) {
                        console.error('Git sync error:', execErr);
                        console.error('stderr:', stderr);
                        return reject(new Error("Git sync failed: ".concat(stderr || execErr.message)));
                    }
                    resolve({ success: true, message: commitMessage });
                });
            });
        });
    });
}
// 获取静态资源目录路径
function getStaticDir() {
    var projectRoot = path.resolve('/Users/Shared/1_work/web/zero-nut');
    var imagesDir = path.join(projectRoot, 'src', 'static', 'images', 'backgrounds');
    var musicDir = path.join(projectRoot, 'src', 'static', 'music');
    // 确保目录存在
    if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
    }
    if (!fs.existsSync(musicDir)) {
        fs.mkdirSync(musicDir, { recursive: true });
    }
    return { imagesDir: imagesDir, musicDir: musicDir };
}
// 选择图片文件
function selectImageFile() {
    return new Promise(function (resolve) {
        electron_1.dialog.showOpenDialog({
            title: '选择背景图片',
            filters: [
                { name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'gif'] }
            ],
            properties: ['openFile']
        }).then(function (result) {
            if (result.canceled || !result.filePaths.length) {
                resolve(null);
                return;
            }
            var imagesDir = getStaticDir().imagesDir;
            var sourceFile = result.filePaths[0];
            var fileName = "bg_".concat(Date.now()).concat(path.extname(sourceFile));
            var destFile = path.join(imagesDir, fileName);
            // 复制文件到静态目录
            fs.copyFile(sourceFile, destFile, function (err) {
                if (err) {
                    console.error("Failed to copy image file: ".concat(err.message));
                    resolve(null);
                    return;
                }
                // 返回相对路径用于存储
                resolve("/images/backgrounds/".concat(fileName));
            });
        }).catch(function (err) {
            console.error('Failed to select image file:', err);
            resolve(null);
        });
    });
}
// 选择音乐文件
function selectMusicFile() {
    return new Promise(function (resolve) {
        electron_1.dialog.showOpenDialog({
            title: '选择音乐文件',
            filters: [
                { name: '音乐文件', extensions: ['mp3', 'wav', 'ogg'] }
            ],
            properties: ['openFile']
        }).then(function (result) {
            if (result.canceled || !result.filePaths.length) {
                resolve(null);
                return;
            }
            var musicDir = getStaticDir().musicDir;
            var sourceFile = result.filePaths[0];
            var fileName = path.basename(sourceFile);
            var destFile = path.join(musicDir, fileName);
            // 复制文件到静态目录
            fs.copyFile(sourceFile, destFile, function (err) {
                if (err) {
                    console.error("Failed to copy music file: ".concat(err.message));
                    resolve(null);
                    return;
                }
                // 返回相对路径和原始文件名
                resolve({
                    filePath: fileName,
                    fileName: fileName
                });
            });
        }).catch(function (err) {
            console.error('Failed to select music file:', err);
            resolve(null);
        });
    });
}
electron_1.app.whenReady().then(function () {
    console.log('Application is ready');
    console.log('Node version:', process.versions.node);
    console.log('Electron version:', process.versions.electron);
    console.log('Chrome version:', process.versions.chrome);
    createMainWindow();
});
electron_1.ipcMain.on('add-post', function (event, post) { return __awaiter(void 0, void 0, void 0, function () {
    var newPost, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, addNewPost(post)];
            case 1:
                newPost = _a.sent();
                event.reply('post-added', { success: true, post: newPost });
                if (mainWindow) {
                    loadPosts(mainWindow);
                }
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error adding post:', error_1);
                event.reply('post-added', { success: false, error: error_1 instanceof Error ? error_1.message : String(error_1) });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
electron_1.ipcMain.on('edit-post', function (event, data) { return __awaiter(void 0, void 0, void 0, function () {
    var updatedPost, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, editPost(data.id, data.post)];
            case 1:
                updatedPost = _a.sent();
                event.reply('post-edited', { success: true, post: updatedPost });
                if (mainWindow) {
                    loadPosts(mainWindow);
                }
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error editing post:', error_2);
                event.reply('post-edited', { success: false, error: error_2 instanceof Error ? error_2.message : String(error_2) });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
electron_1.ipcMain.on('delete-post', function (event, postId) { return __awaiter(void 0, void 0, void 0, function () {
    var error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, deletePost(postId)];
            case 1:
                _a.sent();
                event.reply('post-deleted', { success: true, postId: postId });
                if (mainWindow) {
                    loadPosts(mainWindow);
                }
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('Error deleting post:', error_3);
                event.reply('post-deleted', { success: false, error: error_3 instanceof Error ? error_3.message : String(error_3) });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
electron_1.ipcMain.on('github-sync-direct', function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, syncWithGitHubDirect()];
            case 1:
                result = _a.sent();
                event.reply('github-sync-result', { success: true, message: result.message });
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.error('Error during direct GitHub sync:', error_4);
                event.reply('github-sync-result', { success: false, error: error_4 instanceof Error ? error_4.message : String(error_4) });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
electron_1.ipcMain.on('toggle-fullscreen', function (event) {
    if (mainWindow) {
        var isFullScreen = mainWindow.isFullScreen();
        mainWindow.setFullScreen(!isFullScreen);
    }
});
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', function () {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});
// 添加新的IPC处理
electron_1.ipcMain.handle('select-image', function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, selectImageFile()];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); });
electron_1.ipcMain.handle('select-music', function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, selectMusicFile()];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); });
