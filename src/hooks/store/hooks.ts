/* eslint-disable import/prefer-default-export */
import { useContext } from 'react';
import { StoreContext } from './context';

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw Error('use root store invalid context');

  return context;
};
