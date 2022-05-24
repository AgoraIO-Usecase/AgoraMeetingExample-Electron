/* eslint-disable import/prefer-default-export */
import { useContext } from 'react';
import { MeetingManagerContext } from './context';

export const useMeetingManager = () => {
  const context = useContext(MeetingManagerContext);
  return context;
};
