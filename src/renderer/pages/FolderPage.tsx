import { useParams } from 'react-router-dom';

const FolderPage = () => {
    const { folderName } = useParams();

    // Fetch folder details using `folderName` here

    return (
        <div>
            <h1>{folderName}</h1>
            {/* Display folder details here */}
        </div>
    );
};

export default FolderPage;