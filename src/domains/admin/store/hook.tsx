import { useContext } from 'react';
import { StoreContext } from '.';

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === null) {
    throw new Error('useStore must be used within a StoreContext');
  }
  return context;
};
