export declare type JoinParams = {
  uid: number;
  channelName: string;
  nickName: string;
  isCameraOn: boolean;
  isMicrophoneOn: boolean;
};

export enum ConnectionType {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
  RECONNECTING,
  DISCONNECTING,
}

export declare interface UserInfo {
  uid: number;
  shareId?: number;
  parentId?: number;
  nickName?: string;

  isSelf?: boolean;
  isCameraOn?: boolean;
  isMicrophoneOn?: boolean;
  isScreenSharing?: boolean;
}

export declare type DeviceInfo = {
  deviceid: string;
  devicename: string;
};

export declare type EngineInfo = {
  currentCameraId?: string;
  currentSpeakerId?: string;
  currentMicrophoneId?: string;
  cameras?: DeviceInfo[];
  speakers?: DeviceInfo[];
  microphones?: DeviceInfo[];
};

export declare type MeetingInfo = {
  channelName?: string;
  connection?: ConnectionType;
  users?: UserInfo[];
};
