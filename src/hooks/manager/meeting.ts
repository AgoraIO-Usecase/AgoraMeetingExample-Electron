import { EventEmitter } from 'events';
import log from 'electron-log';

import { RtcConnection, RtcConnectionReason, RtcManager } from './rtc';
import {
  MeetingConnection,
  MeetingConnectionReason,
  MeetingParams,
} from './types';

export declare interface MeetingManager {
  on(
    evt: 'connection',
    cb: (connection: MeetingConnection, reason: MeetingConnectionReason) => void
  ): this;
}

export class MeetingManager extends EventEmitter {
  private rtcManager!: RtcManager;

  private state: {
    isInitialized: boolean;

    channelName: string;
    connection: MeetingConnection;
  } = {
    isInitialized: false,

    channelName: '',
    connection: MeetingConnection.Disconnected,
  };

  constructor(rtcManager: RtcManager) {
    super();

    this.rtcManager = rtcManager;
  }

  initialize = () => {
    if (this.state.isInitialized) return;

    log.info('meeting manager initialize');

    this.registerRtcEvents();

    this.state.isInitialized = true;
  };

  release = () => {
    if (!this.state.isInitialized) return;

    log.info('meeting manager release');

    this.removeAllListeners();
    this.reset();

    this.state.isInitialized = false;
  };

  reset = () => {
    this.state.channelName = '';
    this.state.connection = MeetingConnection.Disconnected;
  };

  isInitialized = () => {
    return this.state.isInitialized;
  };

  isInMeeting = () => {
    return this.state.connection !== MeetingConnection.Disconnected;
  };

  joinMeeting = (params: MeetingParams) => {
    if (this.isInMeeting()) {
      log.warn('meeting manager join meeting failed, already joined');
      return;
    }

    const { channelName, nickname, isCameraOn, isAudioOn } = params;

    log.info('meeting manager join meeting with params:', params);

    this.state.channelName = channelName;
    this.rtcManager.joinChannel({
      channelName,
      uid: Number(`${new Date().getTime()}`.slice(7)),
      nickname,
      isCameraOn,
      isAudioOn,
    });
  };

  leaveMeeting = () => {
    if (!this.isInMeeting()) {
      log.warn('meeting manager leave meeting failed, not in meeting');
      return;
    }

    log.info('meeting manager leave meeting');

    this.rtcManager.leaveChannel();
  };

  getChannelName = () => this.state.channelName;

  private registerRtcEvents = () => {
    this.rtcManager.on(
      'connection',
      (connection: RtcConnection, reason: RtcConnectionReason) => {
        log.info('meeting manager on rtc connection', connection, reason);

        let meetingConnection = MeetingConnection.Disconnected;
        const meetingConnectionReason =
          reason === RtcConnectionReason.None
            ? MeetingConnectionReason.None
            : MeetingConnectionReason.RtcError;

        switch (connection) {
          case RtcConnection.Disconnected:
            meetingConnection = MeetingConnection.Disconnected;
            break;
          case RtcConnection.Connecting:
            meetingConnection = MeetingConnection.Connecting;
            break;
          case RtcConnection.Connected:
            meetingConnection = MeetingConnection.Connected;
            break;
          case RtcConnection.ReConnecting:
            meetingConnection = MeetingConnection.ReConnecting;
            break;
          case RtcConnection.Disconnecting:
            meetingConnection = MeetingConnection.Disconnecting;
            break;
          default:
            break;
        }

        this.setConnection(meetingConnection, meetingConnectionReason);
      }
    );
  };

  private setConnection = (
    connection: MeetingConnection,
    reason: MeetingConnectionReason = MeetingConnectionReason.None
  ) => {
    this.state.connection = connection;
    this.emit('connection', this.state.connection, reason);
  };
}
