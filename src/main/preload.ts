import {
    contextBridge,
    ipcRenderer,
    BrowserWindow,
} from "electron";

const menuMethods = ['log', 'open-settings'];

// レンダラープロセスとメインプロセスの通信はこちらで定義する
const electronHandler = {
    on: (channel: string, callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => {
        ipcRenderer.on(channel, callback);
    },
    removeListener: (channel: string, callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => {
        ipcRenderer.removeListener(channel, callback);
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
        }
    },
};

contextBridge.exposeInMainWorld("electron", electronHandler);

export type ElectronHandler = typeof electronHandler;

