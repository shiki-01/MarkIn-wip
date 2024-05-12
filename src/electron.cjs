const windowStateManager = require('electron-window-state');
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const contextMenu = require('electron-context-menu');
const serve = require('electron-serve');
const path = require('path');

try {
	require('electron-reloader')(module);
} catch (e) {
	console.error(e);
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
		autoHideMenuBar: false,
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

ipcMain.on('close-window', () => {
	BrowserWindow.getFocusedWindow().close();
});

ipcMain.on('minimize-window', () => {
	BrowserWindow.getFocusedWindow().minimize();
});

ipcMain.on('maximize-window', () => {
	const currentWindow = BrowserWindow.getFocusedWindow();
	if (currentWindow.isMaximized()) {
		currentWindow.unmaximize();
	} else {
		currentWindow.maximize();
	}
});

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

const template = [
	{
		label: 'File',
		submenu: [
			{ label: 'New' },
			{ label: 'Open' },
			{ label: 'Save' }
		]
	},
	{
		label: 'Edit',
		submenu: [
			{ label: 'Undo' },
			{ label: 'Redo' },
			{ label: 'Cut' },
			{ label: 'Copy' },
			{ label: 'Paste' }
		]
	},
	{
		label: 'View',
		submenu: [
			{ label: 'Reload' },
			{ label: 'Zoom In' },
			{ label: 'Zoom Out' },
			{ label: 'Reset Zoom' },
			{ label: 'Toggle Full Screen' },
			{ label: 'Toggle Developer Tools' }
		]
	},
	{
		label: 'Window',
		submenu: [
			{ label: 'Minimize' },
			{ label: 'Close' }
		]
	},
	{
		label: 'Help',
		submenu: [
			{ label: 'Learn More' }
		]
	}
];

app.on('ready', function () {
	if (process.platform === 'darwin') template.unshift({ role: 'appMenu' });
	const menu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(menu)
	createMainWindow();
})

ipcMain.handle('get-menu', async (event) => {
	return template;
})

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
