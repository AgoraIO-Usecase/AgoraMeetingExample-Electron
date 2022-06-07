import {
  AttendeeInfo,
  DeviceInfo,
  DeviceType,
  MeetingConnection,
  ScreenShareState,
} from '../manager';

export enum AttendeeLayoutType {
  Speaker,
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

export type StoreActionPayload =
  | string
  | MeetingConnection
  | StoreActionPayloadAttendee
  | StoreActionPayloadAttendeeReplace
  | StoreActionPayloadDevice
  | ScreenShareState
  | AttendeeLayoutType;

export type StoreAction = {
  type: StoreActionType;
  payload: StoreActionPayload;
};

export type Store = {
  state: StoreState;
  dispatch: React.Dispatch<StoreAction>;
};
