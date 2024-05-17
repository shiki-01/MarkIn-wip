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

const useCreateEntity = (path: any, entityType: 'file' | 'folder') => {
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const { fetchDetail } = useFolderDetails(path, path);

    const handleSubmit = (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        const newPath = `ProjectData/${path}/${newName}`.replace(/\\/g, '/');
        const finalPath = newPath.substring(newPath.toLowerCase().indexOf('projectdata/') + 'projectdata/'.length);
        window.electron.project.create[entityType](finalPath);
        fetchDetail();
        setNewName('');
        setIsCreating(false);
    };
    return { isCreating, setIsCreating, newName, setNewName, handleSubmit };
};

type CreateEntityInputProps = {
    path: string;
    entityType: "file" | "folder";
};

const CreateEntityInput = ({ path, entityType }: CreateEntityInputProps) => {
    const { handleSubmit, newName, setNewName } = useCreateEntity(path, entityType);

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
};

const useFetchFiles = (path: string[]) => {
    const [files, setFiles] = useState(null);

    const fetchFiles = async () => {
        const result = await window.electron.project.getProjects();
        setFiles(result);
    };

    useEffect(() => {
        fetchFiles();
    }, path);

    return { files, fetchFiles };
};

const useFolderDetails = (folderName: string, path: string) => {
    const [folderContents, setFolderContents] = useState<Folder[]>([]);

    const fetchDetail = async () => {
        if (folderName && path.startsWith('/folder/')) {
            const result = await window.electron.project.getProjectDetail(folderName);
            setFolderContents(result);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [folderName, path]);

    return { folderContents, fetchDetail };
};

const TreeItemComponent = ({ id, node }: { id: number, node: any }) => {

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
        drop: async (item: DragItem, monitor) => {
            if (!monitor.didDrop()) {
                await window.electron.project.moveFile(item.path, `${node.path}/${item.name}`);
                fetchDetail();
                fetchFiles();
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop(),
        }),
    });

    const location = useLocation();
    const folderName = location.pathname.split('/')[2];

    const { folderContents, fetchDetail } = useFolderDetails(folderName, node.path);
    const { files, fetchFiles } = useFetchFiles([node.path]);

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

    const location = useLocation();
    const folderName = location.pathname.split('/')[2];
    const { folderContents, fetchDetail } = useFolderDetails(folderName, location.pathname);
    const { files, fetchFiles } = useFetchFiles([folderName]) as unknown as { files: File[], fetchFiles: Function };

    const [isCreatingFile, setIsCreatingFile] = useState(false);

    const [isCreatingFolder, setIsCreatingFolder] = useState(false);

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
                                        <CreateEntityInput path={folderName} entityType='file' />
                                    )}
                                    {isCreatingFolder && (
                                        <CreateEntityInput path={folderName} entityType='folder' />
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