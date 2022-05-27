import { AttendeeInfo, DeviceInfo, MeetingConnection } from '../manager';

export enum StoreActionType {
  ACTION_TYPE_CONNECTION,
  ACTION_TYPE_INFO,
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

export type StoreAction = {
  type: StoreActionType;
  payload: MeetingConnection | StoreState;
};

export type Store = {
  state: StoreState;
  dispatch: React.Dispatch<StoreAction>;
};
