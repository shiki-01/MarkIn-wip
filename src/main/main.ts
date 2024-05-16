import { app, BrowserWindow, ipcMain, Menu, autoUpdater, dialog } from "electron";
import fs from 'fs';
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
  const filePath = path.join(projectDataPath, `${projectId}.json`);

  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, JSON.stringify(data));
}

ipcMain.handle('save-project-data', (event, projectId, data) => {
  saveProjectData(projectId, data);
});


const createWindow = async () => {
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
  createWindow();
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