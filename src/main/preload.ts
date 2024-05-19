import {
    contextBridge,
    ipcRenderer,
    BrowserWindow,
} from "electron";
import { read } from "original-fs";

const menuMethods = ['log', 'open-settings'];

// レンダラープロセスとメインプロセスの通信はこちらで定義する
const electronHandler = {
    on: (channel: string, callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => {
        ipcRenderer.on(channel, callback);
    },
    removeListener: (channel: string, callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => {
        ipcRenderer.removeListener(channel, callback);
    },
    onFolderOperationCompleted: (callback: () => void) => {
        ipcRenderer.on('folder-operation-completed', callback);
    },
    offFolderOperationCompleted: (callback: () => void) => {
        ipcRenderer.off('folder-operation-completed', callback);
    },
    test: {
        sendTest: (testMsg: string) => {
            ipcRenderer.send("test-msg", [testMsg]);
        },
    },
    shell: {
        execCmd: async (cmd: string): Promise<string> => {
            return await ipcRenderer.invoke("exec-cmd", [cmd]);
        },
    },
    fs: {
        readFile: async (filePath: string) => {
            const data = await ipcRenderer.invoke("read-file", [filePath]);
            return data;
        },
    },
    getSetting: () => {
        const config = ipcRenderer.invoke('get-setting');
        return config
    },
    menu: {
        getMenuData: async () => {
            const data = await ipcRenderer.invoke("get-menu-data");
            return data;
        },
    },
    git: {
        account: {
            open: async (url: string) => {
                await ipcRenderer.invoke('open-account', url);
            },
            get: async () => {
                const user = await ipcRenderer.invoke('get-user');
                return user;
            },
        }
    },
    window: {
        close: async () => {
            await ipcRenderer.invoke('window-close');
        },
        maximize: async () => {
            await ipcRenderer.invoke('window-maximize');
        },
        minimize: async () => {
            await ipcRenderer.invoke('window-minimize');
        },
        saveSetting: async (config: any) => {
            await ipcRenderer.invoke('save-setting', config);
        },

        menu: Object.fromEntries(menuMethods.map(method => [
            method,
            async (...args: any[]) => await ipcRenderer.invoke(method, args)
        ])),
    },
    project: {
        saveProject: async (proId: any, data: any) => {
            await ipcRenderer.invoke('save-project-data', proId, data)
        },
        getProjects: async () => {
            return await ipcRenderer.invoke('get-projects-files')
        },
        getProjectDetail: async (fileName: any) => {
            return await ipcRenderer.invoke('get-project-detail', fileName)
        },
        moveFile: async (source: string, destination: string) => {
            await ipcRenderer.invoke('move-file', source, destination)
        },
        create: {
            folder: async (path: string) => {
                await ipcRenderer.invoke('create-folder', path)
            },
            file: async (path: string) => {
                await ipcRenderer.invoke('create-file', path)
            },
        },
        saveFile: async (filePath: string, data: any) => {
            await ipcRenderer.invoke('save-file', filePath, data)
        },
        getFile: async (filePath: string) => {
            return await ipcRenderer.invoke('get-file', filePath)
        },
    },
};

contextBridge.exposeInMainWorld("electron", electronHandler);

export type ElectronHandler = typeof electronHandler;

