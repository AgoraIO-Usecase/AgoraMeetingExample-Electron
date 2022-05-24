export declare type JoinMeetingParams = {
  channelName: string;
  nickName: string;
  streamId: number;
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

export declare type MeetingInfo = {
  channelName?: string;
  state?: MeetingConnectionState;
  isCameraOn?: boolean;
  isMicrophoneOn?: boolean;
  isScreenSharing?: boolean;
};
