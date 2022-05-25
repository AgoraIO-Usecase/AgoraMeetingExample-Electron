/* eslint-disable import/prefer-default-export */
import log from 'electron-log';
import { MeetingConnectionState, MeetingInfo, UserInfo } from '../types';
import { MeetingStoreActionType, MeetingStoreAction } from './context';

const onMeetingConnection = (
  state: MeetingInfo,
  connectionState: MeetingConnectionState
) => {
  // clear state when meeting connection state is connecting
  if (connectionState === MeetingConnectionState.CONNECTING)
    return { connectionState };

  return { ...state, connectionState };
};

const onMeetingInfo = (state: MeetingInfo, stateNew: MeetingInfo) => {
  return { ...state, ...stateNew };
};

const onUserNew = (state: MeetingInfo, user: UserInfo) => {
  const { users } = state;
  const newUsers = users || [];

  const index = newUsers.findIndex((item) => {
    return item.uid === user.uid;
  });

  if (index === -1) newUsers.push(user);
  else newUsers[index] = { ...newUsers[index], ...user };

  return { ...state, users: newUsers };
};

const onUserRemove = (state: MeetingInfo, uid: number) => {
  const { users } = state;
  if (!users) return state;

  const newUsers = [...users?.filter((item) => item.uid !== uid)];
  return { ...state, users: newUsers };
};

const onUserModify = (state: MeetingInfo, user: UserInfo) => {
  const { users } = state;
  if (!users) return state;

  const newUsers = users.map((item) => {
    if (item.uid === user.uid) return { ...item, ...user };
    return item;
  });

  return { ...state, users: newUsers };
};

export const MeetingStoreReducer = (
  state: MeetingInfo,
  action: MeetingStoreAction
): MeetingInfo => {
  const { type, payload } = action;
  switch (type) {
    case MeetingStoreActionType.ACTION_TYPE_CONNECTION:
      return onMeetingConnection(state, payload as MeetingConnectionState);
    case MeetingStoreActionType.ACTION_TYPE_INFO:
      return onMeetingInfo(state, payload as MeetingInfo);
    case MeetingStoreActionType.ACTION_TYPE_USER_NEW:
      return onUserNew(state, payload as UserInfo);
    case MeetingStoreActionType.ACTION_TYPE_USER_REMOVE:
      return onUserRemove(state, payload as number);
    case MeetingStoreActionType.ACTION_TYPE_USER_MODIFY:
      return onUserModify(state, payload as UserInfo);
    default:
      log.warn('meeting reducer invalid type of dipatcher', type, payload);
      return state;
  }
};
