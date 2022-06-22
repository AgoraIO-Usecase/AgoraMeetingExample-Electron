export enum WhiteBoardConnection {
  Disconnected,
  Connecting,
  Connected,
}

export enum WhiteBoardError {
  None,
  Exception,
  CreateRoom,
  Error,
  Kicked,
}

export type WhiteBoardRoomInfo = {
  uuid: string;
  timespan: string;
};

export default {};
