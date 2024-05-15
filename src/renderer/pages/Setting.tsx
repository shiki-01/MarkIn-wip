import React, { useState, useContext, useEffect, useRef } from 'react';
import { DrawerProps } from "@fluentui/react-components";
import IsSetting from "../components/IsSetting"
import {
    NavDrawer,
    NavDrawerBody,
    NavDrawerFooter,
    NavItem,
} from "@fluentui/react-nav-preview";
import {
    Button,
    Caption1Strong,
    makeStyles,
    tokens,
} from "@fluentui/react-components";
import { Field, Radio, RadioGroup } from "@fluentui/react-components";
import Close from '@mui/icons-material/Close';

const useStyles = makeStyles({
    content: {
        background: tokens.colorNeutralForegroundInverted
    },
    drawer: {
        padding: "20px 0",
    },
    headingContent: {
        marginInlineStart: `10px`,
    },
});

type ConfigType = {
    theme?: 'dark' | 'light';
};

type DrawerType = Required<DrawerProps>["type"];

const Setting = () => {
    const styles = useStyles();
    const [type, setType] = React.useState<DrawerType>("inline");

    const [config, setConfig] = useState<ConfigType | null>(null);
    useEffect(() => {
        window.electron.getSetting().then((config: React.SetStateAction<ConfigType | null>) => setConfig(config));
    }, []);


    const { setIsSetting } = useContext(IsSetting);
    const isOpen = true;

    const [selectedTab, setSelectedTab] = useState("1");
    const [isChanged, setIsChanged] = useState(false);

    const handleTabChange = (value: React.SetStateAction<string>) => {
        setSelectedTab(value);
    };

    if (!config) {
        return null
    }

    return (
        <div className="setting-modal">
            <div className={`setting-content ${styles.content}`}>
                <NavDrawer
                    defaultSelectedValue="1"
                    defaultSelectedCategoryValue="1"
                    open={isOpen}
                    type={type}
                    className={styles.drawer}
                    size="small"
                >
                    <NavDrawerBody>
                        <Caption1Strong className={styles.headingContent}>
                            アカウント
                        </Caption1Strong>
                        <NavItem
                            target="_blank"
                            value="1"
                            onClick={() => handleTabChange("1")}
                        >
                            ログイン設定
                        </NavItem>
                        <NavItem
                            target="_blank"
                            value="2"
                            onClick={() => handleTabChange("2")}
                        >
                            個人設定
                        </NavItem>
                        <NavItem
                            target="_blank"
                            value="3"
                            onClick={() => handleTabChange("3")}
                        >
                            言語
                        </NavItem>
                        <Caption1Strong className={styles.headingContent}>
                            メイン
                        </Caption1Strong>
                        <NavItem
                            target="_blank"
                            value="4"
                            onClick={() => handleTabChange("4")}
                        >
                            テーマ
                        </NavItem>
                        <NavItem
                            target="_blank"
                            value="5"
                            onClick={() => handleTabChange("5")}
                        >
                            エディタ
                        </NavItem>
                    </NavDrawerBody>
                    <NavDrawerFooter>
                        <NavItem
                            value="6"
                            target="_blank"
                            onClick={() => handleTabChange("6")}
                        >
                            ヘルプ
                        </NavItem>
                    </NavDrawerFooter>
                </NavDrawer>
                <div>
                    {config ? (
                        <>
                            <span className="close">
                                <Button appearance="transparent" icon={<Close />} onClick={() => setIsSetting(false)} />
                            </span>
                            {
                                selectedTab === "1" &&
                                <Button>hello</Button>
                            }
                            {
                                selectedTab === "3" &&
                                <Button>helloooo</Button>
                            }
                            {
                                selectedTab === "4" &&
                                <Field label="テーマ">
                                    <RadioGroup
                                        defaultValue={config.theme}
                                        onChange={(event: React.FormEvent<HTMLDivElement>, data: any) => {
                                            const value = data.value as "dark" | "light";
                                            config.theme = value;
                                            window.electron.window.saveSetting(config);
                                        }}
                                    >
                                        <Radio value="system" label="システム" />
                                        <Radio value="dark" label="ダーク" />
                                        <Radio value="light" label="ライト" />
                                    </RadioGroup>
                                </Field>
                            }
                        </>
                    ) : null}
                </div>
            </div>
        </div >
    );
};

export default Setting;

