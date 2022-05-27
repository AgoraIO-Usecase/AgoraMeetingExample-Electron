/* eslint-disable import/prefer-default-export */
import { createContext } from 'react';
import { CommonManager } from './common';

export const CommonManagerContext = createContext<CommonManager | undefined>(
  undefined
);
