const windowStateManager = require('electron-window-state');
const { app, BrowserWindow, ipcMain } = require('electron');
const contextMenu = require('electron-context-menu');
const serve = require('electron-serve');
const path = require('path');

try {
	require('electron-reloader')(module);
} catch (e) {
	console.error(e);
}

const fs = require('fs');

// AppDataディレクトリのパスを取得
const userDataPath = app.getPath('userData');

// ProjectDataディレクトリのパスを作成
const projectDataPath = path.join(userDataPath, 'ProjectData');

// ProjectDataディレクトリが存在しない場合は作成
if (!fs.existsSync(projectDataPath)) {
    fs.mkdirSync(projectDataPath);
}

const serveURL = serve({ directory: '.' });
const port = process.env.PORT || 5173;
const dev = !app.isPackaged;
let mainWindow;

function createWindow() {
	let windowState = windowStateManager({
		defaultWidth: 800,
		defaultHeight: 600,
	});

	const mainWindow = new BrowserWindow({
		backgroundColor: 'whitesmoke',
		titleBarStyle: 'hidden',
		autoHideMenuBar: true,
		trafficLightPosition: {
			x: 17,
			y: 32,
		},
		minHeight: 450,
		minWidth: 500,
		webPreferences: {
			enableRemoteModule: true,
			contextIsolation: true,
			nodeIntegration: true,
			spellcheck: false,
			devTools: dev,
			preload: path.join(__dirname, 'preload.cjs'),
		},
		x: windowState.x,
		y: windowState.y,
		width: windowState.width,
		height: windowState.height,
	});

	windowState.manage(mainWindow);

	mainWindow.once('ready-to-show', () => {
		mainWindow.show();
		mainWindow.focus();
	});

	mainWindow.on('close', () => {
		windowState.saveState(mainWindow);
	});

	return mainWindow;
}

contextMenu({
	showLookUpSelection: false,
	showSearchWithGoogle: false,
	showCopyImage: false,
	prepend: (defaultActions, params, browserWindow) => [
		{
			label: 'Make App 💻',
		},
	],
});

function loadVite(port) {
	mainWindow.loadURL(`http://localhost:${port}`).catch((e) => {
		console.log('Error loading URL, retrying', e);
		setTimeout(() => {
			loadVite(port);
		}, 200);
	});
}

function createMainWindow() {
	mainWindow = createWindow();
	mainWindow.once('close', () => {
		mainWindow = null;
	});

	if (dev) loadVite(port);
	else serveURL(mainWindow);
}

app.once('ready', createMainWindow);
app.on('activate', () => {
	if (!mainWindow) {
		createMainWindow();
	}
});
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('to-main', (event, count) => {
	return mainWindow.webContents.send('from-main', `next count is ${count + 1}`);
});

// Window controls
ipcMain.on('window-close', () => {
    if (mainWindow) mainWindow.close();
});

ipcMain.on('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
	if (mainWindow) {
		mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
	}
});

// File system

const util = require('util');
const readdir = util.promisify(fs.readdir);

async function getAllFiles(dirPath) {
    let entries = await readdir(dirPath, { withFileTypes: true });

    // Get files within the current directory and add a path key to the file objects
    let files = entries
        .map(file => ({ ...file, path: path.join(dirPath, file.name), isDirectory: file.isDirectory() }));

    // Get directories within the current directory
    let directories = entries.filter(folder => folder.isDirectory());

    for (let directory of directories) {
        files = files.concat(await getAllFiles(path.join(dirPath, directory.name)));
    }

    return files;
}

ipcMain.handle('file-get-all', async (event, arg) => {
    // userDataディレクトリのパスを取得
    const userDataPath = app.getPath('userData');

    // ProjectDataディレクトリのパスを作成
    const projectDataPath = path.join(userDataPath, 'ProjectData');

    // ProjectDataディレクトリ内のすべてのファイルを取得
    const files = await getAllFiles(projectDataPath);

    // Promiseが解決された値を返す
    return files.map(file => ({ name: file.name, path: file.path }));
});