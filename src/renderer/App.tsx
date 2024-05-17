import { FluentProvider, webLightTheme, webDarkTheme } from '@fluentui/react-components';
import React, { useEffect, useState } from 'react';
import Router from "renderer/Router";
import MenuBar from "renderer/components/MenuBar";
import Header from "renderer/components/Header";
import IsSetting from "renderer/components/IsSetting"
import ProjectContext from 'renderer/components/IsAddProject';
import { ConfigContext } from 'renderer/components/Config';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import "./style/_global.scss";

type ConfigType = {
  theme?: 'dark' | 'light';
};

const App = () => {

  const [isSetting, setIsSetting] = useState(false);

  const [config, setConfig] = useState<ConfigType | null>(null);

  useEffect(() => {
    window.electron.getSetting().then((config: React.SetStateAction<ConfigType | null>) => setConfig(config));
  }, [config]);

  const theme = config?.theme === 'dark' ? webDarkTheme : webLightTheme;

  if (!config) {
    return null;
  }

  return (
    <ConfigContext.Provider value={config}>
      <FluentProvider theme={theme}>
      <DndProvider backend={HTML5Backend}>
        <div>
          <MenuBar />
        </div>
        <div className="main">
          <IsSetting.Provider value={{ isSetting, setIsSetting }}>
              <Router />
          </IsSetting.Provider>
        </div>
        </DndProvider>
      </FluentProvider>
    </ConfigContext.Provider>
  );
};

export default App;
