import { EventEmitter } from 'events';
import { createFastboard, FastboardApp, mount } from '@netless/fastboard';
import log from 'electron-log';

import { WhiteBoardError, WhiteBoardConnection } from './types';
import { generateRoomToken, generateSdkToken } from './cert';
import { createRoom, WhiteBoardRoomParams } from './api';

export declare interface WhiteBoardManager {
  on(
    evt: 'connection',
    cb: (
      connection: WhiteBoardConnection,
      room: string,
      error: WhiteBoardError
    ) => void
  ): this;
}

export class WhiteBoardManager extends EventEmitter {
  private props!: {
    isInitialized: boolean;
    connection: WhiteBoardConnection;

    token: string;
    params?: WhiteBoardRoomParams | undefined;
    board: {
      app?: FastboardApp | undefined;
      element?:
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
      params: undefined,
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

  reset = () => {
    if (this.props.board.app) this.props.board.app.destroy();
    if (this.props.board.element) this.props.board.element.destroy();

    this.props.connection = WhiteBoardConnection.Disconnected;
    this.props.token = generateSdkToken();
    this.props.params = undefined;
    this.props.board = {};
  };

  isRunning = () => this.props.connection !== WhiteBoardConnection.Disconnected;

  start = async (container: HTMLDivElement) => {
    if (this.isRunning()) return;

    this.setConnection(WhiteBoardConnection.Connecting, WhiteBoardError.None);

    try {
      // create room
      const response = await createRoom(this.props.token);
      if (!response.status || response.status !== 201) {
        log.error('whiteboard create room failed', response);
        this.setConnection(
          WhiteBoardConnection.Disconnected,
          WhiteBoardError.CreateRoom
        );
      }

      // join room
      this.props.params = response.data;
      const { uuid, teamUUID, appUUID } = this.props.params;
      const app = await createFastboard({
        sdkConfig: {
          appIdentifier: process.env.AGORA_WHITEBOARD_APPID!,
          region: process.env.AGORA_WHITEBOARD_REGION || 'cn-hz',
        },
        joinRoom: {
          uid: '',
          uuid,
          roomToken: generateRoomToken(uuid),
        },
        managerConfig: {
          cursor: true,
        },
      });

      this.props.board.app = app;

      this.props.board.element = mount(app, container);

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

    this.props.board.element?.destroy();
    await this.props.board.app?.destroy();

    this.setConnection(WhiteBoardConnection.Disconnected, WhiteBoardError.None);
  };

  private setConnection = (
    connection: WhiteBoardConnection,
    error: WhiteBoardError
  ) => {
    this.props.connection = connection;

    this.emit('connection', connection, this.props.params?.uuid, error);
  };
}
