import log from 'electron-log';
import { DeviceType, MeetingConnection } from '../manager';
import {
  StoreActionType,
  StoreAction,
  StoreState,
  StoreActionPayloadAttendee,
  StoreActionPayloadDevice,
} from './types';

const onMeetingConnection = (
  state: StoreState,
  connection: MeetingConnection
) => {
  // clear state when meeting connection state is connecting
  if (connection === MeetingConnection.Disconnected)
    return {
      ...state,
      connection,
      attendees: [],
    };

  return { ...state, connection };
};

const onDevice = (state: StoreState, payload: StoreActionPayloadDevice) => {
  const { type, currentDeviceId, devices } = payload;
  if (type === DeviceType.Camera) {
    state.currentCameraId = currentDeviceId;
    state.cameras = devices;
  } else if (type === DeviceType.Microphone) {
    state.currentMicrophoneId = currentDeviceId;
    state.microphones = devices;
  } else if (type === DeviceType.Speaker) {
    state.currentSpeakerId = currentDeviceId;
    state.speakers = devices;
  }

  return state;
};

const onAttendeeNew = (
  oldState: StoreState,
  payload: StoreActionPayloadAttendee
) => {
  const newAttendees = oldState.attendees || [];
  const { position, attendees } = payload;

  if (!attendees.length) return oldState;

  newAttendees.splice(position, 0, attendees[0]);

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

  return { ...oldState, attendees: newAttendees };
};

const onAttendeeRemove = (
  oldState: StoreState,
  payload: StoreActionPayloadAttendee
) => {
  const newAttendees = oldState.attendees || [];
  const { position } = payload;

  newAttendees.splice(position, 1);

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
      newState = onMeetingConnection(state, payload as MeetingConnection);
      break;
    case StoreActionType.ACTION_TYPE_DEVICE:
      newState = onDevice(state, payload as StoreActionPayloadDevice);
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
