/* eslint-disable import/prefer-default-export */
import { useContext } from 'react';
import { MeetingStoreContext } from './context';

export const useMeetingStore = () => {
  const context = useContext(MeetingStoreContext);
  if (!context) {
    throw Error('invalid context');
  }

  return context;
};
