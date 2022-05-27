/* eslint-disable import/prefer-default-export */
import { createContext } from 'react';
import { Store } from './types';

export const StoreContext = createContext<Store | undefined>(undefined);
