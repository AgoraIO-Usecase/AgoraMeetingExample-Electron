import { useContext } from 'react';
import { CommonManagerContext } from './context';

// eslint-disable-next-line import/prefer-default-export
export const useCommonManager = () => {
  const context = useContext(CommonManagerContext);
  return context;
};
