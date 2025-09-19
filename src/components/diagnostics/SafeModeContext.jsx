import React, { createContext, useState, useContext } from 'react';

const SafeModeContext = createContext();

export const useSafeMode = () => useContext(SafeModeContext);

export const SafeModeProvider = ({ children }) => {
  // Default to true to ensure the app boots reliably
  const [isSafeMode, setIsSafeMode] = useState(true);

  const value = { isSafeMode, setIsSafeMode };

  return (
    <SafeModeContext.Provider value={value}>
      {children}
    </SafeModeContext.Provider>
  );
};