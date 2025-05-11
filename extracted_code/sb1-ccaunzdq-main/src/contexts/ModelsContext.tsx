// src/contexts/ModelsContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Model, deviceModels as initialModels } from '../db/models';

interface ModelsContextValue {
  models: Model[];
  setModels: React.Dispatch<React.SetStateAction<Model[]>>;
}

const ModelsContext = createContext<ModelsContextValue | undefined>(undefined);

export const ModelsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [models, setModels] = useState<Model[]>(initialModels);
  return (
    <ModelsContext.Provider value={{ models, setModels }}>
      {children}
    </ModelsContext.Provider>
  );
};

export const useModels = () => {
  const ctx = useContext(ModelsContext);
  if (!ctx) throw new Error('useModels must be used within a ModelsProvider');
  return ctx;
};
