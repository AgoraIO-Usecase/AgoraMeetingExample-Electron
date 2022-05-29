import log from 'electron-log';
import { MeetingConnection } from '../manager';
import {
  StoreActionType,
  StoreAction,
  StoreState,
  StoreActionPayloadAttendee,
} from './types';

const onMeetingConnection = (
  state: StoreState,
  connection: MeetingConnection
) => {
  // clear state when meeting connection state is connecting
  if (connection === MeetingConnection.Connecting)
    return {
      ...state,
      connection,
      attendees: [],
    };

  return { ...state, connection };
};

const onAttendeeNew = (
  oldState: StoreState,
  payload: StoreActionPayloadAttendee
) => {
  const newAttendees = oldState.attendees || [];
  const { position, attendees } = payload;

  if (!attendees.length) return oldState;

  console.warn('attendeeNew', position, oldState.attendees);

  newAttendees.splice(position, 0, attendees[0]);

  console.warn(
    'attendeeNew',
    position,
    newAttendees[0],
    newAttendees[1],
    newAttendees.length
  );

  return { ...oldState, attendees: newAttendees };
};

const onAttendeeUpdate = (
  oldState: StoreState,
  payload: StoreActionPayloadAttendee
) => {
  const newAttendees = oldState.attendees || [];
  const { position, attendees } = payload;

  if (!attendees.length) return oldState;

  newAttendees[position] = { ...newAttendees[position], ...attendees[0] };

  console.warn(
    'attendeeUpdate',
    position,
    oldState.attendees,
    newAttendees,
    newAttendees.length
  );

  return { ...oldState, attendees: newAttendees };
};

const onAttendeeRemove = (
  oldState: StoreState,
  payload: StoreActionPayloadAttendee
) => {
  const newAttendees = oldState.attendees || [];
  const { position } = payload;

  newAttendees.splice(position, 1);

  console.warn(
    'attendeeRemove',
    position,
    oldState.attendees,
    newAttendees,
    newAttendees.length
  );

  return { ...oldState, attendees: newAttendees };
};

export const StoreReducer = (
  state: StoreState,
  action: StoreAction
): StoreState => {
  const { type, payload } = action;
  let newState = state;

  switch (type) {
    case StoreActionType.ACTION_TYPE_CONNECTION:
      console.warn('meetingConnection', payload);
      newState = onMeetingConnection(state, payload as MeetingConnection);
      break;
    case StoreActionType.ACTION_TYPE_INFO:
      console.warn('meetingInfo');
      newState = { ...state, ...(action.payload as StoreState) };
      break;
    case StoreActionType.ACTION_TYPE_ATTENDEE_NEW:
      newState = onAttendeeNew(
        state,
        action.payload as StoreActionPayloadAttendee
      );
      break;
    case StoreActionType.ACTION_TYPE_ATTENDEE_UPDATE:
      newState = onAttendeeUpdate(
        state,
        action.payload as StoreActionPayloadAttendee
      );
      break;
    case StoreActionType.ACTION_TYPE_ATTENDEE_REMOVE:
      newState = onAttendeeRemove(
        state,
        action.payload as StoreActionPayloadAttendee
      );
      break;
    default:
      log.error('reducer invalid action type', type, payload);
      break;
  }

  console.warn('reducer', type, state, newState);

  return newState;
};

export default {};
