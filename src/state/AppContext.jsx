import { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [mondayContext, setMondayContext] = useState();
  const [fragrances, setFragrances] = useState([]);

  const contextValues = {
    fragrances,
    setFragrances,
    mondayContext,
    setMondayContext,
  };

  return (
    <AppContext.Provider value={contextValues}>{children}</AppContext.Provider>
  );
};
