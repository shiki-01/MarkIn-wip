import React, { useState } from 'react';
import {
    makeStyles,
    shorthands,
    useId,
    Input,
    Label,
} from "@fluentui/react-components";
import type { InputProps } from "@fluentui/react-components";
import { Button } from "@fluentui/react-components";

const AddProject = (props: InputProps) => {
    const [projectName, setProjectName] = useState('');

    const handleCreate = () => {
        console.log(`Creating project: ${projectName}`);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setProjectName(event.target.value);
    };

    const inputId = useId("input");

    return (
        <div className="add-project">
            <div>
                <Label htmlFor={inputId} size={props.size} disabled={props.disabled}>
                    Sample input
                </Label>
                <Input id={inputId} {...props} onChange={handleInputChange} />
            </div>
            <Button onClick={handleCreate}>
                作成
            </Button>
        </div>
    );
};

export default AddProject;