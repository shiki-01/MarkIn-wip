import {
    contextBridge,
    ipcRenderer,
    BrowserWindow,
} from "electron";

// レンダラープロセスとメインプロセスの通信はこちらで定義する
const electronHandler = {
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
        }
    }
};

contextBridge.exposeInMainWorld("electron", electronHandler);

export type ElectronHandler = typeof electronHandler;

