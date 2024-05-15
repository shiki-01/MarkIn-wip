import {
    app,
    Menu,
    shell,
    ipcMain,
    BrowserWindow,
    MenuItemConstructorOptions,
} from "electron";

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
    selector?: string;
    submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}

export default class MenuBuilder {
    mainWindow: BrowserWindow;

    constructor(mainWindow: BrowserWindow) {
        this.mainWindow = mainWindow;
    }

    buildMenu(): Menu {
        if (
            process.env.NODE_ENV === "development" ||
            process.env.DEBUG_PROD === "true"
        ) {
            this.setupDevelopmentEnvironment();
        }

        const template =
            process.platform === "darwin"
                ? this.buildDarwinTemplate()
                : this.buildDefaultTemplate();

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);

        return menu;
    }

    setupDevelopmentEnvironment(): void {
        this.mainWindow.webContents.on("context-menu", (_, props) => {
            const { x, y } = props;

            Menu.buildFromTemplate([
                {
                    label: "Inspect element",
                    click: () => {
                        this.mainWindow.webContents.inspectElement(x, y);
                    },
                },
            ]).popup({ window: this.mainWindow });
        });
    }

    buildDarwinTemplate(): MenuItemConstructorOptions[] {
        const subMenuAbout: DarwinMenuItemConstructorOptions = {
            label: "Electron",
            submenu: [
                {
                    label: "About ElectronReact",
                    selector: "orderFrontStandardAboutPanel:",
                },
                { type: "separator" },
                { label: "Services", submenu: [] },
                { type: "separator" },
                {
                    label: "Hide ElectronReact",
                    accelerator: "Command+H",
                    selector: "hide:",
                },
                {
                    label: "Hide Others",
                    accelerator: "Command+Shift+H",
                    selector: "hideOtherApplications:",
                },
                { label: "Show All", selector: "unhideAllApplications:" },
                { type: "separator" },
                {
                    label: "Quit",
                    accelerator: "Command+Q",
                    click: () => {
                        app.quit();
                    },
                },
            ],
        };
        const subMenuEdit: DarwinMenuItemConstructorOptions = {
            label: "Edit",
            submenu: [
                { label: "Undo", accelerator: "Command+Z", selector: "undo:" },
                { label: "Redo", accelerator: "Shift+Command+Z", selector: "redo:" },
                { type: "separator" },
                { label: "Cut", accelerator: "Command+X", selector: "cut:" },
                { label: "Copy", accelerator: "Command+C", selector: "copy:" },
                { label: "Paste", accelerator: "Command+V", selector: "paste:" },
                {
                    label: "Select All",
                    accelerator: "Command+A",
                    selector: "selectAll:",
                },
            ],
        };
        const subMenuViewDev: MenuItemConstructorOptions = {
            label: "View",
            submenu: [
                {
                    label: "Reload",
                    accelerator: "Command+R",
                },
                {
                    label: "Toggle Full Screen",
                    accelerator: "Ctrl+Command+F",
                },
                {
                    label: "Toggle Developer Tools",
                    accelerator: "Alt+Command+I",
                },
            ],
        };
        const subMenuViewProd: MenuItemConstructorOptions = {
            label: "View",
            submenu: [
                {
                    label: "Toggle Full Screen",
                    accelerator: "Ctrl+Command+F",
                },
            ],
        };
        const subMenuWindow: DarwinMenuItemConstructorOptions = {
            label: "Window",
            submenu: [
                {
                    label: "Minimize",
                    accelerator: "Command+M",
                    selector: "performMiniaturize:",
                },
                { label: "Close", accelerator: "Command+W", selector: "performClose:" },
                { type: "separator" },
                { label: "Bring All to Front", selector: "arrangeInFront:" },
            ],
        };
        const subMenuHelp: MenuItemConstructorOptions = {
            label: "Help",
            submenu: [
                {
                    label: "Learn More",
                },
                {
                    label: "Documentation",
                },
                {
                    label: "Community Discussions",
                },
                {
                    label: "Search Issues",
                },
            ],
        };

        const subMenuView =
            process.env.NODE_ENV === "development" ||
                process.env.DEBUG_PROD === "true"
                ? subMenuViewDev
                : subMenuViewProd;

        return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow, subMenuHelp];
    }

    buildDefaultTemplate() {
        const templateDefault = [
            {
                label: "&ファイル",
                submenu: [
                    {
                        label: "&開く",
                        accelerator: "Ctrl+O",
                    },
                    {
                        label: "&閉じる",
                        accelerator: "Ctrl+W",
                    },
                ],
            },
            {
                label: "&表示",
                submenu:
                    process.env.NODE_ENV === "development" ||
                        process.env.DEBUG_PROD === "true"
                        ? [
                            {
                                label: "&再読み込み",
                                accelerator: "Ctrl+R",
                            },
                            {
                                label: "&フルスクリーン",
                                accelerator: "F11",
                                id: "log"
                            },
                            {
                                label: "&Developer Tools",
                                accelerator: "Alt+Ctrl+I",
                            },
                        ]
                        : [
                            {
                                label: "&フルスクリーン",
                                accelerator: "F11",
                                id: "log"
                            },
                        ],
            },
            {
                label: "MenuDivider",
            },
            {
                label: "設定",
                accelerator: "Ctrl+S",
                id: "open-settings"
            },
            {
                label: "MenuDivider",
            },
            {
                label: "ヘルプ",
                submenu: [
                    {
                        label: "Electron公式",
                    },
                    {
                        label: "Electron リポジトリ",
                    },
                    {
                        label: "Electron コミュニティ",
                    },
                    {
                        label: "Electron Issues",
                    },
                ],
            },
        ];

        return templateDefault;
    }
}