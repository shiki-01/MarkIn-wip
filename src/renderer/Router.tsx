import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import FunctionTestPage from "./pages/FunctionTestPage";
import IndexPage from "./pages/IndexPage";
import Setting from "./pages/Setting";

const Router = () => {
  const [isSetting, setIsSetting] = useState(false);

  useEffect(() => {
    window.electron.on('set-isSetting', (_: any, value: boolean | ((prevState: boolean) => boolean)) => {
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
