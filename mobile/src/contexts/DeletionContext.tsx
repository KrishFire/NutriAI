import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DeletionContextType {
  deletionCount: number;
  triggerDeletion: () => void;
}

const DeletionContext = createContext<DeletionContextType | undefined>(undefined);

export function DeletionProvider({ children }: { children: ReactNode }) {
  const [deletionCount, setDeletionCount] = useState(0);

  const triggerDeletion = () => {
    setDeletionCount(prev => prev + 1);
  };

  return (
    <DeletionContext.Provider value={{ deletionCount, triggerDeletion }}>
      {children}
    </DeletionContext.Provider>
  );
}

export function useDeletion() {
  const context = useContext(DeletionContext);
  if (!context) {
    throw new Error('useDeletion must be used within a DeletionProvider');
  }
  return context;
}