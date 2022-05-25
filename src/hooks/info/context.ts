import React, { createContext } from 'react';
import { MeetingConnectionState, MeetingInfo, UserInfo } from '../types';

export enum MeetingStoreActionType {
  ACTION_TYPE_CONNECTION,
  ACTION_TYPE_INFO,
  ACTION_TYPE_USER_NEW,
  ACTION_TYPE_USER_REMOVE,
  ACTION_TYPE_USER_MODIFY,
}

export type MeetingStoreAction = {
  type: MeetingStoreActionType;
  payload?:
    | MeetingInfo
    | UserInfo
    | number
    | MeetingConnectionState
    | undefined;
};

export type MeetingStore = {
  state: MeetingInfo;
  dispatch: React.Dispatch<MeetingStoreAction>;
};

export const MeetingStoreContext = createContext<MeetingStore | undefined>(
  undefined
);
