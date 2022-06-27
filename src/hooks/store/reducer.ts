import { ipcRenderer } from 'electron';
import log from 'electron-log';
import {
  DeviceType,
  MeetingConnection,
  ScreenShareState,
  WhiteBoardState,
} from '../manager';
import {
  StoreActionType,
  StoreAction,
  StoreState,
  StoreActionPayloadAttendee,
  StoreActionPayloadDevice,
  AttendeeLayoutType,
  StoreActionPayloadAttendeeReplace,
  StoreActionPayloadFocusMode,
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
      screenshareState: ScreenShareState.Idle,
      whiteboardState: WhiteBoardState.Idle,
      showScreenShare: false,
      focusMode: false,
      markable: false,
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

const onAttendeeReplace = (
  oldState: StoreState,
  payload: StoreActionPayloadAttendeeReplace
) => {
  const newAttendees = oldState.attendees || [];
  const { oldPosition, newPosition } = payload;

  // eslint-disable-next-line prefer-destructuring
  newAttendees[oldPosition] = newAttendees.splice(
    newPosition,
    1,
    newAttendees[oldPosition]
  )[0];

  return { ...oldState, attendees: newAttendees };
};

const onFocusMode = (
  oldState: StoreState,
  payload: StoreActionPayloadFocusMode
) => {
  const { focusMode, displayId } = payload;
  if (oldState.focusMode === focusMode) return oldState;

  ipcRenderer.invoke('focus-mode', focusMode, displayId);
  return { ...oldState, focusMode, markable: false };
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
    case StoreActionType.ACTION_TYPE_ATTENDEE_REPLACE:
      newState = onAttendeeReplace(
        state,
        action.payload as StoreActionPayloadAttendeeReplace
      );
      break;
    case StoreActionType.ACTION_TYPE_ATTENDEE_LAYOUT:
      newState = {
        ...state,
        attendeeLayout: action.payload as AttendeeLayoutType,
      };
      break;
    case StoreActionType.ACTION_TYPE_SCREENSHARE_STATE:
      newState = {
        ...state,
        screenshareState: action.payload as ScreenShareState,
      };
      break;
    case StoreActionType.ACTION_TYPE_WHITEBOARD_STATE: {
      const whiteboardState = action.payload as WhiteBoardState;
      newState = {
        ...state,
        whiteboardState,
        markable: whiteboardState === WhiteBoardState.Running,
        attendeeLayout:
          whiteboardState === WhiteBoardState.Running
            ? AttendeeLayoutType.Speaker
            : state.attendeeLayout,
      };
      break;
    }
    case StoreActionType.ACTION_TYPE_SHOW_SCREENSHARE:
      newState = {
        ...state,
        showScreenShare: action.payload as boolean,
      };
      break;
    case StoreActionType.ACTION_TYPE_FOCUS_MODE:
      newState = onFocusMode(
        state,
        action.payload as StoreActionPayloadFocusMode
      );
      break;
    case StoreActionType.ACTION_TYPE_MARKABLE:
      newState = {
        ...state,
        markable: action.payload as boolean,
      };
      break;
    default:
      log.error('reducer invalid action type', type, payload);
      break;
  }

  console.warn('reducer', type, state, newState);

  return newState;
};

export default {};
