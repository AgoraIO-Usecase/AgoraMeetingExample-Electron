export declare type JoinMeetingParams = {
  channelName: string;
  nickName: string;
  streamId: number;
};

export enum MeetingConnectionState {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
}

export declare type MeetingInfo = {
  channelName?: string;
  state?: MeetingConnectionState;
};
