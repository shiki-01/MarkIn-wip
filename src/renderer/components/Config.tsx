import React from 'react';

type ConfigType = {
    theme?: 'dark' | 'light';
};

export const ConfigContext = React.createContext<ConfigType | null>(null);