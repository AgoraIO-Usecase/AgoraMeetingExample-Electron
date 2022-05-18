import { createContext } from 'react';
import { AttendeeManager } from './types';

// eslint-disable-next-line import/prefer-default-export
export const AttendeeManagerContext = createContext<{
  attendeeManager?: AttendeeManager | undefined;
}>({});
