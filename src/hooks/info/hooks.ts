/* eslint-disable import/prefer-default-export */
import { useContext } from 'react';
import { MeetingInfoContext } from './context';

export const useMeetingInfo = () => {
  const context = useContext(MeetingInfoContext);
  return context;
};
