/* eslint-disable import/prefer-default-export */
import React, { createContext } from 'react';
import { MeetingInfo } from '../types';

export enum MeetingInfoDispatcherType {
  DISPATCHER_TYPE_CONNECTION,
  DISPATCHER_TYPE_INFO,
}

export type MeetingInfoDispatcher = {
  type: MeetingInfoDispatcherType;
  payload?: MeetingInfo;
};

export type MeetingInfoRedux = {
  meetingInfo?: MeetingInfo;
  meetingInfoDispatcher?: React.Dispatch<MeetingInfoDispatcher>;
};

export const MeetingInfoContext = createContext<MeetingInfoRedux>({});
