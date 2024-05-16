import * as React from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
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
import { useEffect, useState } from "react";


const useStyles = makeStyles({
    root: {
        display: "flex",
        height: "calc(100vh - 40px)",
    },
});

const renderTree = (nodes: any[]) => {
    return nodes.map((node, index) => {
        if (node.isDirectory && node.children) {
            return (
                <TreeItem key={index} itemType="branch">
                    <TreeItemLayout>
                        {node.name}
                    </TreeItemLayout>
                    <Tree>{renderTree(node.children)}</Tree>
                </TreeItem>
            );
        } else {
            return (
                <TreeItem key={index} itemType="leaf">
                    <TreeItemLayout>
                        {node.name}
                    </TreeItemLayout>
                </TreeItem>
            );
        }
    });
};

type DrawerSeparatorExampleProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
    position: DrawerProps["position"];
    className?: string;
};

type File = {
    folder: string;
    file: string;
};

type Folder = {
    name: string;
    path: string;
    isDirectory: boolean;
    children: Folder[];
}

const DrawerSeparatorExample: React.FC<DrawerSeparatorExampleProps> = ({
    open,
    setOpen,
    position,
}) => {
    const navigate = useNavigate();

    const [files, setFiles] = useState<File[]>([]);
    useEffect(() => {
        const fetchFiles = async () => {
            const result = await window.electron.project.getProjects();
            setFiles(result);
        };
        fetchFiles();
    }, [files]);

    const location = useLocation();
    const folderName = location.pathname.split('/')[2];
    const [folderContents, setFolderContents] = useState<Folder[]>([]);

    useEffect(() => {
        const fetchDetail = async () => {
            if (folderName && location.pathname.startsWith('/folder/')) {
                const result = await window.electron.project.getProjectDetail(folderName);
                setFolderContents(result);
            }
        };
        fetchDetail();
    }, [folderName]);

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
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                navigate("add_project");
                                            }}
                                        />
                                    </span>
                                </span>
                            </TreeItemLayout>
                            <Tree>
                                {files.map((file, index) => (
                                    <TreeItem key={index} itemType="leaf">
                                        <TreeItemLayout
                                            onClick={() => {
                                                navigate(`/folder/${file.folder}`)
                                            }}
                                        >
                                            {file.folder}
                                        </TreeItemLayout>
                                    </TreeItem>
                                ))}
                            </Tree>
                        </TreeItem>
                    </Tree>
                </div>
                {folderName &&
                    <div>
                        <Tree aria-label="Default">
                            {renderTree(folderContents)}
                        </Tree>
                    </div>
                }
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