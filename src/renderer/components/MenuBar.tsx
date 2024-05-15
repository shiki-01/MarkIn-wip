import * as React from 'react';
import { useEffect, useState } from 'react';

import {
    Button,
    MenuButton,
    Menu,
    MenuTrigger,
    MenuList,
    MenuItem,
    MenuDivider,
    MenuPopover,
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
    id: string;
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
            }

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
            } else if (item.label === "MenuDivider") {
                return (
                    <MenuDivider />
                )
            } else {
                if (item.id) {
                    return (
                        <MenuItem
                            key={item.label}
                            secondaryContent={item.accelerator}
                            onClick={() => {
                                if (typeof window.electron.window.menu[item.id] === 'function') {
                                    window.electron.window.menu[item.id]();
                                } else {
                                    console.error(`Function ${item.id} does not exist on window.electron.window.menu`);
                                }
                            }}
                        >
                            {item.label}
                        </MenuItem>
                    )
                } else {
                    return (
                        <MenuItem
                            key={item.label}
                            secondaryContent={item.accelerator}
                        >
                            {item.label}
                        </MenuItem>
                    )
                }
            }
        });
    };

    return (
        <div className="menu">
            <div>
                <Menu>
                    <MenuTrigger disableButtonEnhancement>
                        <MenuButton icon={<MenuIcon width={40} />} size="large" />
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
                <Button icon={<Minimize />} appearance="subtle" size="large" onClick={() => handleMinimizeWindow()} />
                <Button icon={<SquareOutlined />} appearance="subtle" size="large" onClick={() => handleMaximizeWindow()} />
                <Button icon={<Close />} appearance="subtle" size="large" onClick={() => handleCloseWindow()} />
            </div>
        </div>
    );
};

export default MenuBar;
