import { createContext } from 'react';

const ProjectContext = createContext({
    showAddProject: true,
    setShowAddProject: (value: boolean) => { },
});

export default ProjectContext;