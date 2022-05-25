export declare type JoinMeetingParams = {
  uid: number;
  channelName: string;
  nickName: string;
  isCameraOn: boolean;
  isMicrophoneOn: boolean;
};

export enum MeetingConnectionState {
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

export declare type MeetingInfo = {
  channelName?: string;
  connectionState?: MeetingConnectionState;
  users?: UserInfo[];
};
