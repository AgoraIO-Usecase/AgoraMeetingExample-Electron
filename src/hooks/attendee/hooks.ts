import { useContext } from 'react';
import { AttendeeManagerContext } from './context';

// eslint-disable-next-line import/prefer-default-export
export const useAttendeeManager = () => {
  const context = useContext(AttendeeManagerContext);
  return context;
};
