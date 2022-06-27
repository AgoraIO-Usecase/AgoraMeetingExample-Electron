import {
  AttendeeInfo,
  DeviceInfo,
  DeviceType,
  MeetingConnection,
  ScreenShareState,
  WhiteBoardState,
} from '../manager';

export enum AttendeeLayoutType {
  Speaker,
  Grid4,
  Grid9,
  Grid25,
}

export enum StoreActionType {
  ACTION_TYPE_CONNECTION,
  ACTION_TYPE_DEVICE,
  ACTION_TYPE_ATTENDEE_NEW,
  ACTION_TYPE_ATTENDEE_UPDATE,
  ACTION_TYPE_ATTENDEE_REMOVE,
  ACTION_TYPE_ATTENDEE_REPLACE,
  ACTION_TYPE_ATTENDEE_LAYOUT,
  ACTION_TYPE_SCREENSHARE_STATE,
  ACTION_TYPE_WHITEBOARD_STATE,
  ACTION_TYPE_SHOW_SCREENSHARE,
  ACTION_TYPE_FOCUS_MODE,
  ACTION_TYPE_MARKABLE,
}

export type StoreState = {
  connection: MeetingConnection;
  attendees: AttendeeInfo[];

  currentCameraId?: string;
  currentSpeakerId?: string;
  currentMicrophoneId?: string;
  cameras?: DeviceInfo[];
  speakers?: DeviceInfo[];
  microphones?: DeviceInfo[];

  attendeeLayout: AttendeeLayoutType;
  screenshareState: ScreenShareState;

  whiteboardState: WhiteBoardState;

  showScreenShare: boolean;
  focusMode: boolean;
  markable: boolean;
};

export type StoreActionPayloadAttendee = {
  position: number;
  attendees: AttendeeInfo[];
};

export type StoreActionPayloadAttendeeReplace = {
  oldPosition: number;
  newPosition: number;
};

export type StoreActionPayloadDevice = {
  type: DeviceType;
  currentDeviceId: string;
  devices: DeviceInfo[];
};

export type StoreActionPayloadFocusMode = {
  focusMode: boolean;
  displayId: number;
};

export type StoreActionPayload =
  | string
  | MeetingConnection
  | StoreActionPayloadAttendee
  | StoreActionPayloadAttendeeReplace
  | StoreActionPayloadDevice
  | ScreenShareState
  | AttendeeLayoutType
  | WhiteBoardState
  | StoreActionPayloadFocusMode
  | boolean;

export type StoreAction = {
  type: StoreActionType;
  payload: StoreActionPayload;
};

export type Store = {
  state: StoreState;
  dispatch: React.Dispatch<StoreAction>;
};
