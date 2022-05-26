import React, { createContext } from 'react';
import { EngineInfo, MeetingInfo } from '../types';

export enum StoreActionType {
  ACTION_TYPE_CONNECTION,
  ACTION_TYPE_MEETING_INFO,
  ACTION_TYPE_ENGINE_INFO,
  ACTION_TYPE_USER_NEW,
  ACTION_TYPE_USER_REMOVE,
  ACTION_TYPE_USER_MODIFY,
}

export type StoreAction = {
  type: StoreActionType;
  payload: unknown;
};

export type StoreState = {
  meeting: MeetingInfo;
  engine: EngineInfo;
};

export type Store = {
  state: StoreState;
  dispatch: React.Dispatch<StoreAction>;
};

export const StoreContext = createContext<Store | undefined>(undefined);
