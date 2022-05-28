import log from 'electron-log';
import { MeetingConnection } from '../manager';
import { StoreActionType, StoreAction, StoreState } from './types';

const onMeetingConnection = (
  state: StoreState,
  connection: MeetingConnection
) => {
  // clear state when meeting connection state is connecting
  if (connection === MeetingConnection.Connecting)
    return {
      ...state,
      connection,
      users: [],
    };

  return { ...state, connection };
};

export const StoreReducer = (
  state: StoreState,
  action: StoreAction
): StoreState => {
  const { type, payload } = action;
  let newState = state;

  switch (type) {
    case StoreActionType.ACTION_TYPE_CONNECTION:
      newState = onMeetingConnection(state, payload as MeetingConnection);
      break;
    case StoreActionType.ACTION_TYPE_INFO:
      newState = { ...state, ...(action.payload as StoreState) };
      break;
    default:
      log.error('reducer invalid action type', type, payload);
      break;
  }

  return newState;
};

export default {};
