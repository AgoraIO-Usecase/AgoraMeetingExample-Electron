export declare type AttendeeInfo = {
  uid: number;
  nickname?: string;

  shareId?: number;
  parentId?: number;

  isSelf?: boolean;
  isCameraOn?: boolean;
  isAudioOn?: boolean;

  isCameraMuted?: boolean;
  isAudioMuted?: boolean;
  isScreenSharing?: boolean;
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
