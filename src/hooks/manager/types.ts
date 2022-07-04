export type Version = {
  rtcVersion: string;
};

export type AttendeeInfo = {
  uid: number;
  nickname?: string;

  shareId?: number;
  parentId?: number;

  isSelf?: boolean;
  isCameraOn?: boolean;
  isAudioOn?: boolean;

  isCameraMuted?: boolean;
  isAudioMuted?: boolean;

  hasWhiteBoard?: boolean;
  isSharingDisplay?: boolean;
  isSharingFocusMode?: boolean;
};

export enum MeetingConnection {
  Disconnected,
  Connecting,
  Connected,
  ReConnecting,
  Disconnecting,
}

export enum MeetingConnectionReason {
  None,
  RtcError,
}

export declare type MeetingParams = {
  channelName: string;
  nickname: string;

  isCameraOn: boolean;
  isAudioOn: boolean;
};

export enum DeviceType {
  Camera,
  Microphone,
  Speaker,
}

export declare type DeviceInfo = {
  deviceid: string;
  devicename: string;
};

export enum VideoEncoderConfigurationType {
  Low = 0,
  Medium = 1,
  High = 2,
}

export enum EffectType {
  EffectSpeakerTest,
}

export type VolumeIndication = {
  uid: number;
  volume: number;
  vad: number;
};

export type ScreenShareParams = {
  windowId?: number | undefined;
  displayId?: number | undefined;
  focusMode?: boolean | undefined;
};

export enum ScreenShareState {
  Idle,
  Waitting,
  Running,
}

export enum ScreenShareStateReason {
  None,
  Error,
  WindowMinimized,
  WindowClosed,
}

export type ScreenShareSource = {
  id: number;
  title: string;
  isDisplay: boolean;
  isPrimaryDisplay: boolean;
  icon?: string;
  iconWidth: number;
  iconHeight: number;
  thumb: string;
  thumbWidth: number;
  thumbHeight: number;
};

export enum WhiteBoardState {
  Idle,
  Waitting,
  Running,
}
