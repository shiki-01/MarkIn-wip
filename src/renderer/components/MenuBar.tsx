import * as React from 'react';
import { useEffect, useState } from 'react';

import { ThemeProvider } from 'styled-components';
import {
    Button,
    Menu,
    MenuTrigger,
    MenuList,
    MenuItem,
    MenuPopover,
    webLightTheme,
} from "@fluentui/react-components";


import Close from '@mui/icons-material/Close';
import SquareOutlined from '@mui/icons-material/SquareOutlined';
import Minimize from '@mui/icons-material/Minimize';
import MenuIcon from '@mui/icons-material/Menu';

const handleCloseWindow = () => {
    window.electron.window.close();
};

const handleMaximizeWindow = () => {
    window.electron.window.maximize();
};

const handleMinimizeWindow = () => {
    window.electron.window.minimize();
};

type MenuItem = {
    label: string;
    accelerator?: string;
    subitem?: MenuItem[];
}

const MenuBar = () => {
    const [menuData, setMenuData] = useState<MenuItem[]>([]);

    useEffect(() => {
        const fetchMenuData = async () => {
            const data = await window.electron.menu.getMenuData();
            const updateLabels = (items: MenuItem[]) => {
                return items.map((item) => {
                    const updatedItem = { ...item };
                    if (item.label.startsWith('&')) {
                        updatedItem.label = item.label.substring(1);
                    }
                    if (item.subitem) {
                        updatedItem.subitem = updateLabels(item.subitem);
                    }
                    return updatedItem;
                });
            };
            const updatedData = updateLabels(data);
            setMenuData(updatedData);
        };

        fetchMenuData();
    }, []);

    const renderMenuItems = (items: MenuItem[]) => {
        return items.map((item) => {
            if (item.subitem) {
                return (
                    <Menu key={item.label}>
                        <MenuTrigger disableButtonEnhancement>
                            <MenuItem>{<span>{item.label}</span>}</MenuItem>
                        </MenuTrigger>
                        <MenuPopover>
                            <MenuList>
                                {renderMenuItems(item.subitem)}
                            </MenuList>
                        </MenuPopover>
                    </Menu>
                );
            } else {
                return <MenuItem
                    key={item.label}
                    secondaryContent={item.accelerator}
                >
                    {item.label}
                </MenuItem>;
            }
        });
    };

    return (
        <div className="menu">
            <div>
                <Menu>
                    <MenuTrigger disableButtonEnhancement>
                        <Button><MenuIcon /></Button>
                    </MenuTrigger>

                    <MenuPopover>
                        <MenuList>
                            {renderMenuItems(menuData)}
                        </MenuList>
                    </MenuPopover>
                </Menu>
            </div>
            <span className="can-drag" />
            <div>
                <button onClick={handleMinimizeWindow} title="Minimize Window"><Minimize /></button>
                <button onClick={handleMaximizeWindow} title="Maximize Window"><SquareOutlined /></button>
                <button onClick={handleCloseWindow} title="Close Window"><Close /></button>
            </div>
        </div>
    );
};

export default MenuBar;
