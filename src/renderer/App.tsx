import { FluentProvider, webLightTheme, webDarkTheme } from '@fluentui/react-components';
import React, { useEffect, useState } from 'react';
import Router from "renderer/Router";
import MenuBar from "renderer/components/MenuBar";
import Header from "renderer/components/Header";
import IsSetting from "renderer/components/IsSetting"
import { ConfigContext } from 'renderer/components/Config';
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
        <div>
          <MenuBar />
        </div>
        <div className="main">
          <Header />
          <IsSetting.Provider value={{ isSetting, setIsSetting }}>
            <Router />
          </IsSetting.Provider>
        </div>
      </FluentProvider>
    </ConfigContext.Provider>
  );
};

export default App;
