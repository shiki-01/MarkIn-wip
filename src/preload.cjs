const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
	invoke: (channel, data) => ipcRenderer.invoke(channel, data),
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
	sendSync: (channel, data) => {
		ipcRenderer.sendSync(channel, data);
	},
	receive: (channel, func) => {
		ipcRenderer.on(channel, (event, ...args) => func(...args));
	},
});
