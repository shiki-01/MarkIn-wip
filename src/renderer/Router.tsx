import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { useContext, useEffect } from "react";
import FunctionTestPage from "./pages/FunctionTestPage";
import IndexPage from "./pages/IndexPage";
import Setting from "./pages/Setting";
import IsSetting from "./components/IsSetting";

const Router = () => {
  const { isSetting, setIsSetting } = useContext(IsSetting);

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
        <Routes>
          <Route path="/" element={<Outlet />}>
            <Route index element={<IndexPage />} />
            <Route path="function_test" element={<FunctionTestPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </>
  );
};

export default Router;
