import { FluentProvider, webLightTheme, webDarkTheme } from '@fluentui/react-components';
import React, { useEffect, useState } from 'react';
import Router from "renderer/Router";
import MenuBar from "renderer/components/MenuBar";
import Header from "renderer/components/Header";
import "./style/_global.scss";

type ConfigType = {
  theme?: 'dark' | 'light';
};

const App = () => {

  const [config, setConfig] = useState<ConfigType | null>(null);

  useEffect(() => {
    window.electron.getSetting().then((config: React.SetStateAction<ConfigType | null>) => setConfig(config));
  }, []);

  const theme = config?.theme === 'dark' ? webDarkTheme : webLightTheme;

  if (!config) {
    return null;
  }

  return (
    <FluentProvider theme={theme}>
      <div>
        <MenuBar />
      </div>
      <div className="main">
        <Header />
        <Router />
      </div>
    </FluentProvider>
  );
};

export default App;
