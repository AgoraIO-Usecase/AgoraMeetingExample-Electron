export enum RtcConnection {
  Disconnected,
  Connecting,
  Connected,
  ReConnecting,
  Disconnecting,
}

export enum RtcConnectionReason {
  None,
  Error,
}

export enum RtcDeviceType {
  Camera,
  Microphone,
  Speaker,
}

export interface RtcDeviceInfo {
  deivceid: string;
  devicename: string;
}

export interface RtcUser {
  uid: number;
  nickname?: string;

  shareId?: number;
  parentId?: number;

  isSelf?: boolean;
  isCameraOn?: boolean;
  isAudioOn?: boolean;

  isCameraMuted?: boolean;
  isAudioMuted?: boolean;
}

export interface RtcJoinParams {
  channelName: string;
  uid: number;
  nickname: string;
  isCameraOn: boolean;
  isAudioOn: boolean;
}
