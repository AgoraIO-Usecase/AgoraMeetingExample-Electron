import { createContext } from 'react';
import { CommonManager } from './common';

export const CommonManagerContext = createContext<CommonManager | undefined>(
  undefined
);

export default {};
