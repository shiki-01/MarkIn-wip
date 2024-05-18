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
    TreeItemValue,
} from "@fluentui/react-components";
import { Tree, TreeItem, TreeItemLayout } from "@fluentui/react-components";
import ChevronRight from '@mui/icons-material/ChevronRight';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import Person from '@mui/icons-material/Person';
import Settings from '@mui/icons-material/Settings';
import Home from '@mui/icons-material/Home';
import Add from '@mui/icons-material/Add';
import { useEffect, useState, useCallback } from "react";
import { useDrag, useDrop } from 'react-dnd';


const useStyles = makeStyles({
    root: {
        display: "flex",
        height: "calc(100vh - 40px)",
    },
});

const useCreateEntity = (path: any, entityType: 'file' | 'folder') => {
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const { fetchDetail } = useFolderDetails(path, path);

    const handleSubmit = (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        const newPath = `${path}/${newName}`.replace(/\\/g, '/');
        let finalPath;

        if (newPath.toLowerCase().indexOf('projectdata/') !== -1) {
            finalPath = newPath;
        } else {
            finalPath = `projectData/${newPath}`;
        }

        window.electron.project.create[entityType](finalPath);
        setNewName('');
        setIsCreating(false);
    };

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    return { isCreating, setIsCreating, newName, setNewName, handleSubmit };
};

type CreateEntityInputProps = {
    path: string;
    entityType: "file" | "folder";
};

const CreateEntityInput = ({ path, entityType }: CreateEntityInputProps) => {
    const { handleSubmit, newName, setNewName, isCreating, setIsCreating } = useCreateEntity(path, entityType);

    useEffect(() => {
        setIsCreating(true);
    }, []);

    if (isCreating) {
        return (
            <Input
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                    if (event.key === 'Enter') {
                        handleSubmit(event);
                    }
                }}
            />
        );
    }
};

const useFetchFiles = (path: string[]) => {
    const [files, setFiles] = useState(null);

    const fetchFiles = useCallback(async () => {
        const result = await window.electron.project.getProjects();
        setFiles(result);
    }, []);

    useEffect(() => {
        fetchFiles();
        const handleFolderOperationCompleted = () => {
            fetchFiles();
        };

        window.electron.onFolderOperationCompleted(handleFolderOperationCompleted);

        return () => {
            window.electron.offFolderOperationCompleted(handleFolderOperationCompleted);
        };
    }, []);

    return { files, fetchFiles };
};

const useFolderDetails = (folderName: string, path: string) => {
    const [folderContents, setFolderContents] = useState<Folder[]>([]);

    const fetchDetail = useCallback(async () => {
        if (folderName && path.startsWith('/folder/')) {
            const result = await window.electron.project.getProjectDetail(folderName);
            setFolderContents(result);
        }
    }, [folderName, path]);

    useEffect(() => {
        fetchDetail();
        const handleFolderOperationCompleted = () => {
            fetchDetail();
        };

        window.electron.onFolderOperationCompleted(handleFolderOperationCompleted);

        return () => {
            window.electron.offFolderOperationCompleted(handleFolderOperationCompleted);
        };
    }, [folderName, path]);

    return { folderContents, fetchDetail };
};

const TreeItemComponent = ({ id, node }: { id: number, node: any }) => {

    const { fetchDetail } = useFolderDetails(node.name, node.path);

    type DragItem = {
        name: string;
        id: string;
        path: string;
    };

    const [{ isDragging }, drag] = useDrag({
        type: "TREE_ITEM",
        item: {
            name: node.name,
            id: node.id,
            path: node.path,
        } as DragItem,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    });

    const [{ canDrop, isOver }, drop] = useDrop({
        accept: "TREE_ITEM",
        drop: (item: DragItem, monitor) => {
            console.log(node.path);
            console.log(item.path);
            if (item.path === `${node.path}`) {
                return;
            }
            if (!monitor.didDrop()) {
                // ドロップ先がフォルダかファイルかを判断
            const isDropTargetDirectory = node.isDirectory;
            let newPath = `${node.path}/${item.name}`;

            // ドロップ先がファイルの場合、最後のファイル名を削除
            if (!isDropTargetDirectory) {
                const pathSegments = node.path.split('\\');
                pathSegments.pop();  // 最後のセグメント（ファイル名）を削除
                newPath = `${pathSegments.join('\\')}/${item.name}`;
            }
            window.electron.project.moveFile(item.path, newPath);
                console.log(item.path, `${node.path}/${item.name}`);
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop(),
        }),
    });

    const location = useLocation();
    const folderName = location.pathname.split('/')[2];

    const [isCreatingFile, setIsCreatingFile] = useState(false);

    const [isCreatingFolder, setIsCreatingFolder] = useState(false);

    if (node.isDirectory && node.children) {
        return (
            <TreeItem key={id} itemType="branch" ref={node => drag(drop(node))}>
                <TreeItemLayout>
                    {node.name}
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
                        <CreateEntityInput path={node.path} entityType='file' />
                    )}
                    {isCreatingFolder && (
                        <CreateEntityInput path={node.path} entityType='folder' />
                    )}
                    {renderTree(node.children)}
                </Tree>
            </TreeItem>
        );
    } else {
        return (
            <TreeItem key={id} itemType="leaf">
                <TreeItemLayout ref={node => drag(drop(node))}>
                    {node.name}
                </TreeItemLayout>
            </TreeItem>
        );
    }
};

const renderTree = (nodes: any[]) => {
    return nodes.map((node, index) => <TreeItemComponent key={node.name + index} id={index} node={node} />);
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

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    const location = useLocation();
    const folderName = location.pathname.split('/')[2];
    const { folderContents, fetchDetail } = useFolderDetails(folderName, location.pathname);
    const { files, fetchFiles } = useFetchFiles([folderName]) as unknown as { files: File[], fetchFiles: Function };

    useEffect(() => {
        const handleFolderOperationCompleted = () => {
            fetchDetail();
            fetchFiles();
        };

        window.electron.onFolderOperationCompleted(handleFolderOperationCompleted);

        return () => {
            window.electron.offFolderOperationCompleted(handleFolderOperationCompleted);
        };
    }, []);

    //TODO: フォルダの開閉の保存

    return (
        <InlineDrawer separator position={position} open={open}>
            <DrawerHeader>
                <DrawerHeaderTitle
                    action={
                        <Button
                            appearance="subtle"
                            aria-label="Close"
                            icon={<ChevronLeft />}
                            onClick={() => handleClose()}
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
                    <Tree
                        aria-label="Default"
                    >
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
                                {files?.map((file, index) => (
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
                    <Tree aria-label="Default">
                        <TreeItemComponent id={0} node={{ name: folderName, path: `projectData/${folderName}`, isDirectory: true, children: folderContents }} />
                    </Tree>
                }
            </DrawerBody>
        </InlineDrawer>
    );
};

const Header = () => {
    const styles = useStyles();

    const [leftOpen, setLeftOpen] = useState(true);

    const toggleLeftOpen = () => {
        setLeftOpen(prevState => !prevState);
    };

    return (
        <div className={`${leftOpen ? "toggle-wrap open" : "toggle-wrap"} ${styles.root}`} style={{ borderBottomWidth: 0 }}>
            <DrawerSeparatorExample
                open={leftOpen}
                setOpen={setLeftOpen}
                position="start"
            />
            <div className={leftOpen ? "toggle-opener open" : "toggle-opener"}>
                <Button icon={<ChevronRight />} appearance="subtle" size="large" onClick={() => toggleLeftOpen()} />
            </div>
        </div>
    );
};

export default Header;