import { app, BrowserWindow, ipcMain, Menu, autoUpdater, dialog, session } from "electron";
import { exec } from "child_process";
import { shell } from "electron";
import axios from "axios";
import fs from 'fs';
import fsExtra from 'fs-extra';
import path from 'path'
import fsFunctionListener from "./functions/fsFunction";
import shellFunctionListener from "./functions/shellFunction";
import testFunctionListener from "./functions/testFunction";
import MenuBuilder from "./menu";
import Store from "electron-store"
import { Setting } from "./setting"
// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let mainWindow: BrowserWindow | null = null;

//#region eventListeners
// 各Functionをレンダラーから呼び出せるように
// 中でipcMain.onなどを行い、ここで実行
testFunctionListener();
shellFunctionListener();
fsFunctionListener();
//#endregion

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

let userData: null = null;
let win: Electron.BrowserWindow | null = null;

ipcMain.handle('open-account', async (event, url) => {
  try {
    win = new BrowserWindow({ width: 800, height: 600, webPreferences: { nodeIntegration: false } })

    win.loadURL(url)

    win.webContents.on('will-redirect', async (event, url) => {
      const code = new URL(url).searchParams.get('code')

      if (code) {
        try {
          // 認証コードを使用してアクセストークンを取得します
          const response = await axios({
            method: 'post',
            url: `https://github.com/login/oauth/access_token`,
            data: {
              client_id: 'Iv23li81DmrWmEfXtDcS',
              client_secret: '1e29919006ae1179433b467e22754c2b1d8ea9d9',
              code: code,
            },
            headers: {
              accept: 'application/json',
            },
          })

          const accessToken = response.data.access_token

          // アクセストークンを使用してユーザー情報を取得します
          const user = await axios({
            method: 'get',
            url: 'https://api.github.com/user',
            headers: {
              Authorization: `token ${accessToken}`,
            },
          })

          userData = user.data;
          win.close();

        } catch (error) {
          console.error('Error during login:', error);
        }
      }
    });
  } catch (error) {
    console.error('Error opening window:', error);
  }
});

ipcMain.handle('get-menu-data', async (event) => {
  const menu = Menu.getApplicationMenu();
  if (!menu) {
    return null;
  }

  const serializableData = menu.items.map(item => ({
    id: item.id,
    label: item.label,
    accelerator: item.accelerator || null,
    visible: item.visible,
    subitem: item.submenu ? item.submenu.items.map(subitem => ({
      id: subitem.id,
      label: subitem.label,
      accelerator: subitem.accelerator || null,
      visible: subitem.visible,
    })) : null,
  }));

  return serializableData;
});

ipcMain.handle('window-close', () => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) window.close();
});

ipcMain.handle('window-maximize', () => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) {
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  }
});

ipcMain.handle('window-minimize', () => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) window.minimize();
});

ipcMain.handle('log', () => {
  console.log("hello")
});

ipcMain.handle('open-settings', async () => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) window.webContents.send('set-isSetting', true);
});

ipcMain.handle('get-setting', async (event) => {
  const setting = new Setting();
  return setting.config;
})

ipcMain.handle('save-setting', async (event, config) => {
  const store = new Store();
  store.delete("config");
  store.set("config", config);
})

const projectDataPath = path.join(__dirname, 'ProjectData');

function saveProjectData(projectId: any, data: any) {
  const filePath = path.join(projectDataPath, projectId, 'data.json');

  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, JSON.stringify(data));
}

ipcMain.handle('save-project-data', (event, projectId, data) => {
  saveProjectData(projectId, data);
  event.sender.send('folder-operation-completed');
});

function getProjectDataFiles() {
  if (!fs.existsSync(projectDataPath)) {
    return [];
  }

  const folders = fs.readdirSync(projectDataPath).filter(folder => {
    const folderPath = path.join(projectDataPath, folder);
    return fs.statSync(folderPath).isDirectory();
  });

  const files = folders.map(folder => {
    const folderPath = path.join(projectDataPath, folder);
    return {
      folder,
      files: fs.readdirSync(folderPath)
    };
  });

  return files;
}

ipcMain.handle('get-projects-files', async () => {
  const files = getProjectDataFiles();
  return files;
});

ipcMain.handle('get-file', async (event, filePath) => {
  filePath = path.join(__dirname, filePath);
  const data = fs.readFileSync(filePath, 'utf8');
  return data;
});

ipcMain.handle('save-file', (event, filePath, data) => {
  filePath = path.join(__dirname, filePath);
  fs.writeFileSync(filePath, data, 'utf8');
  event.sender.send('file-operation-completed');
});

type ItemDetail = {
  name: string;
  path: string;
  isDirectory: boolean;
  children: ItemDetail[];
};

const getFolderDetails = (folderPath: string): ItemDetail[] => {
  const details: ItemDetail[] = fs.readdirSync(folderPath).map(item => {
    const itemPath = path.join(folderPath, item);
    const isDirectory = fs.statSync(itemPath).isDirectory();

    return {
      name: item,
      path: itemPath,
      isDirectory,
      children: isDirectory ? getFolderDetails(itemPath) : []
    };
  });

  return details;
};

ipcMain.handle('get-project-detail', async (event, folderName) => {
  const folderPath = path.join(projectDataPath, folderName);
  const details = getFolderDetails(folderPath);
  return details;
});

const moveFileOrDirectory = (sourcePath: string, destinationPath: string): void => {
  const absoluteSourcePath = path.resolve(__dirname, sourcePath);
  const absoluteDestinationPath = path.resolve(__dirname, destinationPath);

  try {
    fsExtra.moveSync(absoluteSourcePath, absoluteDestinationPath);
  } catch (error) {
    console.error(`Failed to move file or directory from ${absoluteSourcePath} to ${absoluteDestinationPath}: ${error}`);
  }
};

ipcMain.handle('move-file', async (event, source, destination) => {
  moveFileOrDirectory(source, destination)
  event.sender.send('folder-operation-completed');
})

const createNewFolder = (folderPath: string): void => {
  const absoluteFolderPath = path.resolve(__dirname, folderPath);

  try {
    fs.mkdirSync(absoluteFolderPath);
  } catch (error) {
    console.error(`Failed to create new folder at ${absoluteFolderPath}: ${error}`);
  }
};

ipcMain.handle('create-folder', async (event, folderPath) => {
  createNewFolder(folderPath);
  event.sender.send('folder-operation-completed');
});

// 新しいファイルを作成する関数
const createNewFile = (filePath: string): void => {
  const absoluteFilePath = path.resolve(__dirname, filePath);

  try {
    fs.writeFileSync(absoluteFilePath, '');
  } catch (error) {
    console.error(`Failed to create new file at ${absoluteFilePath}: ${error}`);
  }
};

ipcMain.handle('create-file', async (event, filePath) => {
  createNewFile(filePath);
  event.sender.send('folder-operation-completed');
});


const createWindow = async () => {

  if (BrowserWindow.getAllWindows().length > 0) {
    return;
  }

  mainWindow = new BrowserWindow({
    width: 1024,
    height: 728,
    frame: false,
    webPreferences: {
      // webpack が出力したプリロードスクリプトを読み込み
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      devTools: true,
    },
  });

  // レンダラープロセスをロード
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.on("ready-to-show", () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
};

app.whenReady().then(() => {
  // アプリの起動イベント発火で BrowserWindow インスタンスを作成
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient('markin', process.execPath, [path.resolve(process.argv[1])])
    }
  } else {
    app.setAsDefaultProtocolClient('markin')
  }

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ['script-src \'self\' \'unsafe-inline\' data: \'unsafe-eval\';']
      }
    });
  })

  createWindow();
});

ipcMain.handle('get-user', async (event) => {
  // ユーザーデータを返す
  return userData;
});

ipcMain.handle('logout', async (event) => {
  userData = null;
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

const server = 'https://update.electronjs.org'
const feed = `${server}/shiki-01/MarkIn/${process.platform}-${process.arch}/${app.getVersion()}`

if (app.isPackaged) { // パッケージされている（ローカル実行ではない）
  autoUpdater.setFeedURL({
    url: feed,
  });
  autoUpdater.checkForUpdates(); // アップデートを確認する

  // アップデートのダウンロードが完了したとき
  autoUpdater.on("update-downloaded", async () => {
    const returnValue = await dialog.showMessageBox({
      message: "アップデートあり",
      detail: "再起動してインストールできます。",
      buttons: ["再起動", "後で"],
    });
    if (returnValue.response === 0) {
      autoUpdater.quitAndInstall();  // アプリを終了してインストール
    }
  });

  // アップデートがあるとき
  autoUpdater.on("update-available", () => {
    dialog.showMessageBox({
      message: "アップデートがあります",
      buttons: ["OK"],
    });
  });

  // アップデートがないとき
  autoUpdater.on("update-not-available", () => {
    dialog.showMessageBox({
      message: "アップデートはありません",
      buttons: ["OK"],
    });
  });

  // エラーが発生したとき
  autoUpdater.on("error", () => {
    dialog.showMessageBox({
      message: "アップデートエラーが起きましたたた",
      buttons: ["OK"],
    });
  });
}