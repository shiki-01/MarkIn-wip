import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import Router from "renderer/Router";
import MenuBar from "renderer/components/MenuBar";
import Header from "renderer/components/Header";
import "./style/_global.scss";

const App = () => {
  return (
    <FluentProvider theme={webLightTheme}>
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
