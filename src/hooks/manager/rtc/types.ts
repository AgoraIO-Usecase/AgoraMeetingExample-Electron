export type RtcVersion = {
  build: number;
  version: string;
};

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

export enum RtcUserType {
  Media,
  ScreenShare,
  MediaPlayer,
}

export interface RtcUser {
  uid: number;
  nickname?: string;

  type?: RtcUserType;
  shareId?: number;
  parentId?: number;

  isSelf?: boolean;
  isCameraOn?: boolean;
  isAudioOn?: boolean;

  isCameraMuted?: boolean;
  isAudioMuted?: boolean;

  whiteboardUUID?: string;
  whiteboardTimeSpan?: string;
  whiteboardRatio?: number;

  isSharingDisplay?: boolean;
  isSharingFocusMode?: boolean;

  isSpeaking?: boolean;
}

export enum RtcUserUpdateReason {
  Info,
  Media,
  WhiteBoard,
}

export interface RtcJoinParams {
  channelName: string;
  nickname: string;
  isCameraOn: boolean;
  isAudioOn: boolean;
}

export enum RtcVideoEncoderConfigurationType {
  Low = 0,
  Medium = 1,
  High = 2,
}

export interface RtcAudioVolumeIndication {
  uid: number;
  volume: number;
  vad: number;
}

export type RtcDataStreamMessage = {
  info: RtcUser;
};

export enum RtcScreenShareState {
  Idle,
  Waitting,
  Running,
}

export enum RtcScreenShareStateReason {
  None,
  Error,
  WindowMinimized,
  WindowClosed,
}

export type RtcScreenShareParams = {
  windowId?: number | undefined;
  displayId?: number | undefined;
  focusMode?: boolean | undefined;
};

export type RtcScreenShareSource = {
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

export enum RtcVideoStreamType {
  Low,
  High,
}

export enum RtcClientRole {
  Host = 1,
  Audience = 2,
}
