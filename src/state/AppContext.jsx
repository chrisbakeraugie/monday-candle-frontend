import { createContext, useContext, useState } from "react";
import { NAVIGATION_TABS } from "../utils/constants";

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [mondayContext, setMondayContext] = useState();
  const [fragrances, setFragrances] = useState([]);
  const [navigationTab, setNavigationTab] = useState(NAVIGATION_TABS[0]);
  const [storeFragrancesOnMonday, setStoreFragrancesOnMonday] = useState(false);

  const contextValues = {
    fragrances,
    setFragrances,
    mondayContext,
    setMondayContext,
    navigationTab,
    setNavigationTab,
    storeFragrancesOnMonday,
    setStoreFragrancesOnMonday,
  };

  return (
    <AppContext.Provider value={contextValues}>{children}</AppContext.Provider>
  );
};
