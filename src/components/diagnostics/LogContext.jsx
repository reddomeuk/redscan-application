import React, { createContext, useState, useContext, useCallback } from 'react';

const LogContext = createContext();

export const useLogger = () => useContext(LogContext);

export const LogProvider = ({ children }) => {
  const [logs, setLogs] = useState([]);

  const addLog = useCallback((logEntry) => {
    setLogs(prevLogs => [logEntry, ...prevLogs.slice(0, 9)]); // Keep last 10 logs
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const value = { logs, addLog, clearLogs };

  return (
    <LogContext.Provider value={value}>
      {children}
    </LogContext.Provider>
  );
};