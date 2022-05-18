import { createContext } from 'react';
import { CommonManager } from './types';

// eslint-disable-next-line import/prefer-default-export
export const CommonManagerContext = createContext<{
  commonManager?: CommonManager | undefined;
}>({});
