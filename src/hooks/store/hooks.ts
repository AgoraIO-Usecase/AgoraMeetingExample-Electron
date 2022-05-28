import { useContext } from 'react';
import { StoreContext } from './context';

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw Error('invalid store context');

  return context;
};

export default {};
