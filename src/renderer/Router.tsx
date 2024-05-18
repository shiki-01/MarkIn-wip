import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { useContext, useEffect } from "react";
import FunctionTestPage from "./pages/FunctionTestPage";
import IndexPage from "./pages/IndexPage";
import Setting from "./pages/Setting";
import IsSetting from "./components/IsSetting";
import ProjectContext from './components/IsAddProject';
import AddProject from './pages/AddProject'
import Header from './components/Header'
import FolderPage from './pages/FolderPage'

const Router = () => {
  const { isSetting, setIsSetting } = useContext(IsSetting);
  const projectContext = useContext(ProjectContext);

  useEffect(() => {
    window.electron.on('set-isSetting', (_: any, value: boolean) => {
      setIsSetting(value);
    });

    return () => {
      window.electron.removeListener('set-isSetting', setIsSetting);
    };
  }, []);

  return (
    <>
      {isSetting && <Setting />}
      <MemoryRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Outlet />}>
            <Route index element={<IndexPage />} />
            <Route path="function_test" element={<FunctionTestPage />} />
            <Route path="add_project" element={<AddProject />} />
            <Route path="folder/*" element={<FolderPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </>
  );
};

export default Router;
