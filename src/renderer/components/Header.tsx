import * as React from "react";
import { useNavigate, Link, useLocation, Navigate } from "react-router-dom";
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
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import { useEffect, useState, useCallback, useRef } from "react";
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
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setIsCreating(true);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: { target: any; }) => {
            if (inputRef.current && !inputRef.current.contains(event.target)) {
                setIsCreating(false);  // Always hide the input when clicking outside, regardless of the newName value
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [setIsCreating]);

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
    } else {
        return null;
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

    const navigate = useNavigate();

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
            if (item.path === `${node.path}`) {
                return;
            }
            if (!monitor.didDrop()) {
                const isDropTargetDirectory = node.isDirectory;
                let newPath = `${node.path}/${item.name}`;

                if (!isDropTargetDirectory) {
                    const pathSegments = node.path.split('\\');
                    pathSegments.pop();
                    newPath = `${pathSegments.join('\\')}/${item.name}`;
                }
                window.electron.project.moveFile(item.path, newPath);
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
        //TODO: 同名のファイルがある場合の処理
        return (
            <TreeItem key={id} itemType="branch" ref={node => drag(drop(node))}>
                <div className="fol">
                    <TreeItemLayout>
                        <div className="foll">
                            <p>{node.name}</p>
                            <span className="add">
                                <NoteAddOutlinedIcon
                                    onClick={() => setIsCreatingFile(true)}
                                />
                            </span>
                            <span className="add">
                                <CreateNewFolderOutlinedIcon
                                    onClick={() => setIsCreatingFolder(true)}
                                />
                            </span>
                        </div>
                    </TreeItemLayout>
                </div>
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
                <TreeItemLayout
                    ref={node => drag(drop(node))}
                    onClick={() => {
                        const normalizedPath = node.path.replace(/\\/g, '/');
                        const parts = normalizedPath.split(`${folderName}`);
                        const relativePath = parts.length > 1 ? parts.slice(1).join(`${folderName}`) : '';
                        navigate(`/folder/${folderName}${relativePath}`);
                    }}
                >
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
                    <div className="folder">
                        <Tree aria-label="Default">
                            <TreeItemComponent id={0} node={{ name: folderName, path: `projectData/${folderName}`, isDirectory: true, children: folderContents }} />
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