import { useContext } from 'react';
import { CommonManagerContext } from './context';

export const useCommonManager = () => {
  const context = useContext(CommonManagerContext);

  if (!context) throw Error('invalid common manager');

  return context;
};

export default {};
