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
    Input,
    Label,
} from "@fluentui/react-components";
import type { InputProps } from "@fluentui/react-components";
import { Tree, TreeItem, TreeItemLayout } from "@fluentui/react-components";
import ChevronRight from '@mui/icons-material/ChevronRight';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import Person from '@mui/icons-material/Person';
import Settings from '@mui/icons-material/Settings';
import Home from '@mui/icons-material/Home';
import Add from '@mui/icons-material/Add';
import { useEffect, useState } from "react";
import { useDrag, useDrop } from 'react-dnd';



const useStyles = makeStyles({
    root: {
        display: "flex",
        height: "calc(100vh - 40px)",
    },
});

const TreeItemComponent = ({ key, node }: { key: number, node: any }) => {
    const [{ isDragging }, drag] = useDrag({
        type: "TREE_ITEM",
        item: { id: node.id },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    });

    const [{ canDrop, isOver }, drop] = useDrop({
        accept: "TREE_ITEM",
        drop: (item, monitor) => {
            // ドロップ時の処理をここに書く
            // 例えば、item.idを使用してドラッグされたアイテムを特定し、
            // node.idを使用してドロップ先を特定します。
            if (!monitor.didDrop()) {
                window.electron.project.moveFile("ProjectData/hrh/data.json", "ProjectData/hrh/ge");
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop(),
        }),
    });

    if (node.isDirectory && node.children) {
        return (
            <TreeItem key={key} itemType="branch" ref={node => drag(drop(node))}>
                <TreeItemLayout>
                    {node.name}
                </TreeItemLayout>
                <Tree>{renderTree(node.children)}</Tree>
            </TreeItem>
        );
    } else {
        return (
            <TreeItem key={key} itemType="leaf">
                <TreeItemLayout ref={node => drag(drop(node))}>
                    {node.name}
                </TreeItemLayout>
            </TreeItem>
        );
    }
};

const renderTree = (nodes: any[]) => {
    return nodes.map((node, index) => <TreeItemComponent key={index} node={node} />);
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


    const fetchDetail = async () => {
        if (folderName && location.pathname.startsWith('/folder/')) {
            const result = await window.electron.project.getProjectDetail(folderName);
            setFolderContents(result);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [folderName]);

    const [isCreatingFile, setIsCreatingFile] = useState(false);
    const [newFileName, setNewFileName] = useState('');

    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    const handleNewFileSubmit = (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        window.electron.project.create.file(`ProjectData/${folderName}/${newFileName}`);
        setNewFileName('');
        setIsCreatingFile(false);
        fetchDetail();
    };

    const handleNewFolderSubmit = (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        window.electron.project.create.folder(`ProjectData/${folderName}/${newFolderName}`);
        setNewFolderName('');
        setIsCreatingFolder(false);
        fetchDetail();
    }

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
                            <TreeItem itemType="branch">
                                <TreeItemLayout>
                                    {folderName}
                                    <span>
                                        <Add
                                            onClick={() => setIsCreatingFile(true)}
                                        />
                                    </span>
                                    <span>
                                        <Add
                                            onClick={() => setIsCreatingFolder(true)}
                                        />
                                    </span>
                                </TreeItemLayout>
                                <Tree>
                                    {isCreatingFile && (
                                        <Input
                                        value={newFileName}
                                        onChange={(event) => setNewFileName(event.target.value)}
                                        onKeyDown={(event) => {
                                          if (event.key === 'Enter') {
                                            handleNewFileSubmit(event);
                                          }
                                        }}
                                      />
                                    )}
                                    {isCreatingFolder && (
                                        <Input
                                        value={newFolderName}
                                        onChange={(event) => setNewFolderName(event.target.value)}
                                        onKeyDown={(event) => {
                                          if (event.key === 'Enter') {
                                            handleNewFolderSubmit(event);
                                          }
                                        }}
                                        />
                                    )}
                                    {renderTree(folderContents)}
                                </Tree>
                            </TreeItem>
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