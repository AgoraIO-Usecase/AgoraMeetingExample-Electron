import { AttendeeInfo, DeviceInfo, MeetingConnection } from '../manager';

export enum StoreActionType {
  ACTION_TYPE_CONNECTION,
  ACTION_TYPE_INFO,
  ACTION_TYPE_ATTENDEE_NEW,
  ACTION_TYPE_ATTENDEE_UPDATE,
  ACTION_TYPE_ATTENDEE_REMOVE,
}

export type StoreState = {
  connection?: MeetingConnection;
  attendees?: AttendeeInfo[];

  currentCameraId?: string;
  currentSpeakerId?: string;
  currentMicrophoneId?: string;
  cameras?: DeviceInfo[];
  speakers?: DeviceInfo[];
  microphones?: DeviceInfo[];
};

export type StoreActionPayloadAttendee = {
  position: number;
  attendees: AttendeeInfo[];
};

export type StoreActionPayload =
  | MeetingConnection
  | StoreState
  | string
  | number
  | StoreActionPayloadAttendee;

export type StoreAction = {
  type: StoreActionType;
  payload: StoreActionPayload;
};

export type Store = {
  state: StoreState;
  dispatch: React.Dispatch<StoreAction>;
};
