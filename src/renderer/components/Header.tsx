import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
    DrawerBody,
    DrawerHeader,
    DrawerHeaderTitle,
    InlineDrawer,
    makeStyles,
    Button,
    DrawerProps,
    Avatar,
} from "@fluentui/react-components";
import { Tree, TreeItem, TreeItemLayout } from "@fluentui/react-components";
import ChevronRight from '@mui/icons-material/ChevronRight';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import Person from '@mui/icons-material/Person';
import Settings from '@mui/icons-material/Settings';
import Home from '@mui/icons-material/Home';
import Add from '@mui/icons-material/Add';
import { useState } from "react";


const useStyles = makeStyles({
    root: {
        display: "flex",
        height: "calc(100vh - 40px)",
    },
});

type DrawerSeparatorExampleProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
    position: DrawerProps["position"];
    className?: string;
};

const DrawerSeparatorExample: React.FC<DrawerSeparatorExampleProps> = ({
    open,
    setOpen,
    position,
}) => {
    const navigate = useNavigate();

    return (
        <InlineDrawer separator position={position} open={open}>
            <DrawerHeader>
                <DrawerHeaderTitle
                    action={
                        <Button
                            appearance="subtle"
                            aria-label="Close"
                            icon={<ChevronLeft />}
                            onClick={() => setOpen(false)}
                        />
                    }
                >
                    MenuBar
                </DrawerHeaderTitle>
            </DrawerHeader>

            <DrawerBody>
                <div className="person">
                    <Avatar icon={<Person />} aria-label="Guest" />
                    <p>Guest</p>
                    <span className="setting">
                        <Button icon={<Settings />} size="small" appearance="transparent" />
                    </span>
                </div>
                <div className="home">
                    <Tree aria-label="Default">
                        <TreeItem itemType="branch">
                            <TreeItemLayout>
                                <span>
                                    <Home />
                                    <p>Home</p>
                                    <span>
                                        <Add
                                            onClick={() => {
                                                navigate("add_project");
                                            }}
                                        />
                                    </span>
                                </span>
                            </TreeItemLayout>
                            <Tree>
                            </Tree>
                        </TreeItem>
                    </Tree>
                </div>
            </DrawerBody>
        </InlineDrawer>
    );
};

const Header = () => {
    const styles = useStyles();

    const [leftOpen, setLeftOpen] = useState(true);

    return (
        <div className={`${leftOpen ? "toggle-wrap open" : "toggle-wrap"} ${styles.root}`} style={{ borderBottomWidth: 0 }}>
            <DrawerSeparatorExample
                open={leftOpen}
                setOpen={setLeftOpen}
                position="start"
            />
            <div className={leftOpen ? "toggle-opener open" : "toggle-opener"}>
                <Button icon={<ChevronRight />} appearance="subtle" size="large" onClick={() => setLeftOpen(!leftOpen)} />
            </div>
        </div>
    );
};

export default Header;