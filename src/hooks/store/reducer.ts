/* eslint-disable import/prefer-default-export */
import log from 'electron-log';
import { ConnectionType, EngineInfo, MeetingInfo, UserInfo } from '../types';
import { StoreActionType, StoreAction, StoreState } from './context';

const onMeetingConnection = (state: StoreState, connection: ConnectionType) => {
  // clear state when meeting connection state is connecting
  if (connection === ConnectionType.CONNECTING)
    return {
      ...state,
      meeting: {
        connection,
      },
    };

  return { ...state, meeting: { ...state.meeting, connection } };
};

const onMeetingInfo = (state: StoreState, info: MeetingInfo) => {
  return { ...state, meeting: { ...state.meeting, ...info } };
};

const onEngineInfo = (state: StoreState, info: EngineInfo) => {
  return { ...state, engine: { ...state.engine, ...info } };
};

const onUserNew = (state: StoreState, user: UserInfo) => {
  const { users } = state.meeting;
  const newUsers = users || [];

  const index = newUsers.findIndex((item) => {
    return item.uid === user.uid;
  });

  if (index === -1) newUsers.push(user);
  else newUsers[index] = { ...newUsers[index], ...user };

  return { ...state, meeting: { ...state.meeting, users: newUsers } };
};

const onUserRemove = (state: StoreState, uid: number) => {
  const { users } = state.meeting;
  if (!users) return state;

  const newUsers = [...users?.filter((item) => item.uid !== uid)];
  return { ...state, meeting: { ...state.meeting, users: newUsers } };
};

const onUserModify = (state: StoreState, user: UserInfo) => {
  const { users } = state.meeting;
  if (!users) return state;

  const newUsers = users.map((item) => {
    if (item.uid === user.uid) return { ...item, ...user };
    return item;
  });

  return { ...state, meeting: { ...state.meeting, users: newUsers } };
};

export const StoreReducer = (
  state: StoreState,
  action: StoreAction
): StoreState => {
  const { type, payload } = action;
  switch (type) {
    case StoreActionType.ACTION_TYPE_CONNECTION:
      return onMeetingConnection(state, payload as ConnectionType);
    case StoreActionType.ACTION_TYPE_MEETING_INFO:
      return onMeetingInfo(state, payload as MeetingInfo);
    case StoreActionType.ACTION_TYPE_ENGINE_INFO:
      return onEngineInfo(state, payload as EngineInfo);
    case StoreActionType.ACTION_TYPE_USER_NEW:
      return onUserNew(state, payload as UserInfo);
    case StoreActionType.ACTION_TYPE_USER_REMOVE:
      return onUserRemove(state, payload as number);
    case StoreActionType.ACTION_TYPE_USER_MODIFY:
      return onUserModify(state, payload as UserInfo);
    default:
      log.warn('meeting reducer invalid type of dipatcher', type, payload);
      return state;
  }
};
