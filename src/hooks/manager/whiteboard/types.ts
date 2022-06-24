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
  parentId: number;
  uuid: string;
  timespan: string;
};

export default {};
