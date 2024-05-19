import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import EditorComponent from 'renderer/components/Editor';

const FolderPage = () => {
    const params = useParams();
    const path = params['*'] || '';

    // Fetch folder details using `pathSegments` here

    return (
        <div>
            <h1>{path}</h1>
            {path.endsWith('.md') && <EditorComponent path={path} />}
        </div>
    );
}

export default FolderPage;
