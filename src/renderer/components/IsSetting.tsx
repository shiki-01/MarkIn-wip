import React from 'react';

const AppContext = React.createContext({
  isSetting: true,
  setIsSetting: (value: boolean) => {},
});

export default AppContext;