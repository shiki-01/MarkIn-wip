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
			{ label: 'New Window', click: () => { console.log('New Window') } },
			{ type: 'separator' },
			{ label: 'Open', accelerator: 'CmdOrCtrl+O', click: () => { console.log('Open File') } },
			{ type: 'separator' },
			{ label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => { console.log('Save File') } },
			{ label: 'Save As...', accelerator: 'Shift+CmdOrCtrl+S', click: () => { console.log('Save File As...') } },
			{ type: 'separator' },
			{ label: 'Close', accelerator: 'CmdOrCtrl+W', role: 'close' }
		]
	},
	{
		label: 'Edit',
		submenu: [
			{ label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
			{ label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
			{ type: 'separator' },
			{ label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
			{ label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
			{ label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
			{ label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectall' }
		]
	}
]

app.on('ready', function () {
	const menu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(menu)
	createMainWindow();
})
ipcMain.handle('get-menu', () => {
    const menuItems = Menu.getApplicationMenu().items.map(item => ({
        label: item.label,
        enabled: item.enabled,
        click: item.click ? item.id : null
    }));
    console.log(menuItems);
    return menuItems;
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
