import { EventEmitter } from 'events';
import {
  createFastboard,
  FastboardApp,
  mount,
  RoomPhase,
} from '@netless/fastboard';
import log from 'electron-log';

import {
  WhiteBoardError,
  WhiteBoardConnection,
  WhiteBoardRoomInfo,
} from './types';
import { generateRoomToken, generateSdkToken } from './cert';
import { banRoom, createRoom } from './api';

export declare interface WhiteBoardManager {
  on(
    evt: 'connection',
    cb: (connection: WhiteBoardConnection, error: WhiteBoardError) => void
  ): this;
}

export class WhiteBoardManager extends EventEmitter {
  private props!: {
    isInitialized: boolean;
    connection: WhiteBoardConnection;

    token: string;
    isCreator: boolean;
    uuid: string;
    timespan: string;
    board: {
      app?: FastboardApp | undefined;
      mounted?:
        | {
            destroy: () => void;
          }
        | undefined;
    };
  };

  constructor() {
    super();

    this.props = {
      isInitialized: false,
      connection: WhiteBoardConnection.Disconnected,

      token: generateSdkToken(),
      isCreator: false,
      uuid: '',
      timespan: '',
      board: {},
    };
  }

  initialize = () => {
    if (this.props.isInitialized) return;

    log.info('whiteboard manager initialize');

    this.props.isInitialized = true;
  };

  release = () => {
    if (!this.props.isInitialized) return;

    log.info('whiteboard manager release');

    this.removeAllListeners();
    this.reset();

    this.props.isInitialized = false;
  };

  reset = async () => {
    try {
      await this.props.board.app?.destroy();
      this.props.board.mounted?.destroy();
    } catch (e) {
      console.warn('whiteboard reset ecxeption', e);
    } finally {
      this.props.board = {};
    }

    this.props.connection = WhiteBoardConnection.Disconnected;
    this.props.token = generateSdkToken();
    this.props.board = {};
    this.props.isCreator = false;
    this.props.uuid = '';
    this.props.timespan = '';
  };

  isConnected = () => this.props.connection === WhiteBoardConnection.Connected;

  isDisconnected = () =>
    this.props.connection === WhiteBoardConnection.Disconnected;

  isCreator = () => this.props.isCreator;

  getRoomInfo = (): WhiteBoardRoomInfo => {
    return {
      uuid: this.props.uuid,
      timespan: this.props.timespan,
    };
  };

  start = async () => {
    if (!this.isDisconnected()) return;

    log.info('whiteboard manager start');

    this.setConnection(WhiteBoardConnection.Connecting, WhiteBoardError.None);

    try {
      // create room
      const response = await createRoom(this.props.token);
      if (!response.status || response.status !== 201) {
        log.error('whiteboard manager create room failed', response);
        this.setConnection(
          WhiteBoardConnection.Disconnected,
          WhiteBoardError.CreateRoom
        );
      }

      // join room
      const { uuid, createdAt } = response.data;
      const app = await createFastboard({
        sdkConfig: {
          appIdentifier: process.env.AGORA_WHITEBOARD_APPID!,
          region: process.env.AGORA_WHITEBOARD_REGION || 'cn-hz',
        },
        joinRoom: {
          uid: String(Number(`${new Date().getTime()}`.slice(4))),
          uuid,
          roomToken: generateRoomToken(uuid),
          callbacks: {
            onPhaseChanged: this.onWhiteBoardPhaseChanged,
            onDisconnectWithError: this.onWhiteBoardDisconnectWithError,
            onKickedWithReason: this.onWhiteBoardKickedWithReason,
          },
        },
        managerConfig: {
          cursor: true,
        },
      });

      this.props.board.app = app;
      this.props.isCreator = true;
      this.props.uuid = uuid;
      this.props.timespan = createdAt;

      this.setConnection(WhiteBoardConnection.Connected, WhiteBoardError.None);
    } catch (error) {
      log.error('whiteboard start whiteboard throw an exception', error);
      this.setConnection(
        WhiteBoardConnection.Disconnected,
        WhiteBoardError.Exception
      );
    }
  };

  private join = async (uuid: string, timespan: string) => {
    if (!this.isDisconnected()) return;

    log.info('whiteboard manager join');

    this.setConnection(WhiteBoardConnection.Connecting, WhiteBoardError.None);

    try {
      // join room
      const app = await createFastboard({
        sdkConfig: {
          appIdentifier: process.env.AGORA_WHITEBOARD_APPID!,
          region: process.env.AGORA_WHITEBOARD_REGION || 'cn-hz',
        },
        joinRoom: {
          uid: String(Number(`${new Date().getTime()}`.slice(4))),
          uuid,
          roomToken: generateRoomToken(uuid),
          callbacks: {
            onPhaseChanged: this.onWhiteBoardPhaseChanged,
            onDisconnectWithError: this.onWhiteBoardDisconnectWithError,
            onKickedWithReason: this.onWhiteBoardKickedWithReason,
          },
        },
        managerConfig: {
          cursor: true,
        },
      });

      this.props.board.app = app;
      this.props.isCreator = false;
      this.props.uuid = uuid;
      this.props.timespan = timespan;

      this.setConnection(WhiteBoardConnection.Connected, WhiteBoardError.None);
    } catch (error) {
      log.error('whiteboard start whiteboard throw an exception', error);
      this.setConnection(
        WhiteBoardConnection.Disconnected,
        WhiteBoardError.Exception
      );
    }
  };

  stop = async () => {
    if (!this.props.board) return;

    log.info('whiteboard manager stop');

    try {
      await this.props.board.app?.destroy();
      this.props.board.mounted?.destroy();

      if (this.props.isCreator)
        await banRoom(this.props.token, this.props.uuid);
    } catch (e) {
      console.warn('whiteboard stop ecxeption', e);
    } finally {
      this.props.board = {};
      this.props.isCreator = false;
      this.props.uuid = '';
      this.props.timespan = '';
    }
  };

  setElement = (element: HTMLDivElement | null) => {
    if (!this.isConnected()) return;

    try {
      const { mounted, app } = this.props.board;

      // unmount old element
      if (mounted) mounted.destroy();

      if (element && app) {
        this.props.board.mounted = mount(app, element);
        log.info('whiteboard manager mounted with element ', element.id);
      }
    } catch (error) {
      log.error('whiteboard manager set element throw an exception', error);
    }
  };

  autoJoinOrStop = async (
    oldRoomInfo: WhiteBoardRoomInfo,
    newRoomInfo: WhiteBoardRoomInfo
  ) => {
    if (
      this.isDisconnected() &&
      newRoomInfo.uuid.length &&
      newRoomInfo.timespan.length
    ) {
      // should auto join
      log.info('whiteboard manager should auto join room', newRoomInfo);
      await this.join(newRoomInfo.uuid, newRoomInfo.timespan);
    } else if (
      this.isConnected() &&
      !newRoomInfo.uuid.length &&
      oldRoomInfo.uuid === this.props.uuid
    ) {
      // should auto stop, but the server will kick me out when
      // remote user baned room, so we do nothing here
      log.info('whiteboard manager should auto stop', oldRoomInfo);
    } else if (
      this.isConnected() &&
      newRoomInfo.uuid.length &&
      newRoomInfo.uuid !== this.props.uuid
    ) {
      const newRoomDate = new Date(newRoomInfo.timespan).getTime();
      const nowRoomDate = new Date(this.props.timespan).getTime();

      // only when new room info is created before old room we should stop and auto rejoin room
      if (newRoomDate > nowRoomDate) {
        log.warn(
          'whiteboard manager abandoned new room info',
          nowRoomDate,
          newRoomDate
        );
        return;
      }

      log.info('whiteboard manager should auto stop and rejoin a new room');

      await this.stop();
      await this.join(newRoomInfo.uuid, newRoomInfo.timespan);
    }
  };

  private onWhiteBoardPhaseChanged = (phase: RoomPhase) => {
    if (phase === 'disconnected') {
      this.setConnection(
        WhiteBoardConnection.Disconnected,
        WhiteBoardError.None
      );
    }

    log.info(`whiteboard manager on phase ${phase}`);
  };

  private onWhiteBoardDisconnectWithError = (error: any) => {
    log.error('whiteboard manager on disconnect with error', error);
    this.setConnection(
      WhiteBoardConnection.Disconnected,
      WhiteBoardError.Error
    );
    this.stop();
  };

  private onWhiteBoardKickedWithReason = (reason: string) => {
    log.error('whiteboard manager on kicked with reason', reason);
    this.setConnection(
      WhiteBoardConnection.Disconnected,
      WhiteBoardError.Kicked
    );
    this.stop();
  };

  private setConnection = (
    connection: WhiteBoardConnection,
    error: WhiteBoardError
  ) => {
    if (this.props.connection === connection) return;

    this.props.connection = connection;

    this.emit('connection', connection, error);
  };
}
