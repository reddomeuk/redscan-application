import React, { createContext, useState, useCallback } from 'react';

export const TaskQueueContext = createContext();

export const TaskQueueProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);

  const addTask = useCallback((task) => {
    setTasks(prev => [{ ...task, status: 'processing', progress: 0 }, ...prev]);
  }, []);

  const updateTask = useCallback((taskId, updates) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  }, []);

  const value = { tasks, addTask, updateTask };

  return (
    <TaskQueueContext.Provider value={value}>
      {children}
    </TaskQueueContext.Provider>
  );
};