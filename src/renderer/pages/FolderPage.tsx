import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const FolderPage = () => {
    const params = useParams();
    const path = params['*'] || '';

    // Fetch folder details using `pathSegments` here

    return (
        <div>
        </div>
    );
}

export default FolderPage;
