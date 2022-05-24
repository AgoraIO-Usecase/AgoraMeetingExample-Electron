/* eslint-disable import/prefer-default-export */
import { MeetingInfo } from '../types';
import { MeetingInfoDispatcher } from './context';

const MeetingInfoReducer = (
  info: MeetingInfo,
  action: MeetingInfoDispatcher
): MeetingInfo => {
  return { ...info, ...action.payload };
};

export { MeetingInfoReducer };
