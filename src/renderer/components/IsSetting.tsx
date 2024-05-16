import { createContext } from 'react';

const IsSetting = createContext<{
  isSetting: boolean,
  setIsSetting: React.Dispatch<React.SetStateAction<boolean>>
}>({ isSetting: false, setIsSetting: () => { } });

export default IsSetting;