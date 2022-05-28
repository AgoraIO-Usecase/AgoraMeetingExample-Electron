/* eslint-disable @typescript-eslint/lines-between-class-members */
import { EventEmitter } from 'events';
import log from 'electron-log';
import AgoraRtcEngine from 'agora-electron-sdk';
import {
  LOCAL_AUDIO_STREAM_ERROR,
  LOCAL_AUDIO_STREAM_STATE,
  LOCAL_VIDEO_STREAM_ERROR,
  LOCAL_VIDEO_STREAM_STATE,
  RemoteAudioState,
  RemoteAudioStateReason,
  RemoteVideoState,
  RemoteVideoStateReason,
  RtcStats,
} from 'agora-electron-sdk/types/Api/native_type';

import {
  RtcConnection,
  RtcConnectionReason,
  RtcDeviceInfo,
  RtcDeviceType,
  RtcJoinParams,
  RtcVideoEncoderConfigurationType,
  RtcUser,
} from './types';
import { PresetEncoderConfigurations } from './recommend';

export declare interface RtcManager {
  on(
    evt: 'connection',
    cb: (connection: RtcConnection, reason: RtcConnectionReason) => void
  ): this;
  on(evt: 'userNew', cb: (user: RtcUser) => void): this;
  on(evt: 'userUpdate', cb: (user: RtcUser) => void): this;
  on(evt: 'userRemove', cb: (uid: number) => void): this;
  on(
    evt: 'deviceList',
    cb: (
      deviceType: RtcDeviceType,
      currentDeviceId: string,
      devices: RtcDeviceInfo[]
    ) => void
  ): this;
}

export class RtcManager extends EventEmitter {
  private engine!: AgoraRtcEngine;

  private state: {
    isInitialized: boolean;
    connection: RtcConnection;
    users: RtcUser[];
  } = {
    isInitialized: false,
    connection: RtcConnection.Disconnected,
    users: [],
  };

  constructor() {
    super();
    this.engine = new AgoraRtcEngine();
  }

  initialize = (appId: string, logPath: string) => {
    if (this.state.isInitialized) return;

    log.info(`rtc manager initialize with ${appId}`);

    this.engine.initialize(appId, undefined, {
      level: 0x0001,
      filePath: logPath,
      fileSize: 2000,
    });
    this.registerEngineEvents();
    this.preConfigEngine();
    this.refreshDeviceList(RtcDeviceType.Camera);
    this.refreshDeviceList(RtcDeviceType.Speaker);
    this.refreshDeviceList(RtcDeviceType.Microphone);

    this.state.isInitialized = true;
  };

  release = () => {
    if (!this.state.isInitialized) return;

    log.info('rtc manager release');

    this.removeAllListeners();
    this.reset();

    this.engine.release();

    this.state.isInitialized = false;
  };

  reset = () => {
    this.state.connection = RtcConnection.Disconnected;
    this.state.users = [];
  };

  isInitialized = () => {
    return this.state.isInitialized;
  };

  isInChannel = () => {
    return this.state.connection !== RtcConnection.Disconnected;
  };

  joinChannel = (params: RtcJoinParams) => {
    if (this.isInChannel()) {
      log.warn('rtc manager join channel failed, already joined');
      return;
    }

    log.info('rtc manager join channel', params);

    const { channelName, nickname, uid, isCameraOn, isAudioOn } = params;

    this.engine.enableAudioVolumeIndication(200, 3, false);
    this.engine.enableDualStreamMode(true);
    this.engine.enableLocalVideo(isCameraOn);
    this.engine.enableLocalAudio(isAudioOn);

    this.engine.joinChannel('', channelName, '', uid);

    this.setConnection(RtcConnection.Connecting);
    this.addUser({
      uid,
      nickname,
      shareId: 0,
      parentId: 0,
      isSelf: true,
      isCameraOn,
      isAudioOn,
      isCameraMuted: false,
      isAudioMuted: false,
    });
  };

  leaveChannel = () => {
    if (!this.isInChannel()) {
      log.warn('rtc manager leave channel failed, not in channel');
      return;
    }

    log.info('rtc manager leave channel');
    this.engine.leaveChannel();
    this.setConnection(RtcConnection.Disconnecting);
  };

  enableAudio = (enable: boolean) => {
    log.info('rtc manager enable audio', enable);
    this.engine.enableLocalAudio(enable);
  };

  enableVideo = (enable: boolean) => {
    log.info('rtc manager enable video', enable);
    this.engine.enableLocalVideo(enable);
  };

  muteAudio = (mute: boolean) => {
    log.info('rtc manager mute audio', mute);
    this.engine.muteLocalAudioStream(mute);
  };

  muteVideo = (mute: boolean) => {
    log.info('rtc manager mute video', mute);
    this.engine.muteLocalVideoStream(mute);
  };

  setVideoPreview = (enable: boolean) => {
    log.info('rtc manager set video preview', enable);
    if (enable) this.engine.startPreview();
    else this.engine.stopPreview();
  };

  setupLocalVideoRenderer = (view: Element, isFit: boolean) => {
    log.info('rtc manager setup local video renderer');
    this.engine.setupLocalVideo(view);
    this.engine.setupViewContentMode('local', isFit ? 1 : 0, undefined);
  };

  setupRemoteVideoRenderer = (uid: number, view: Element, isFit: boolean) => {
    log.info(`rtc manager setup remote video renderer for ${uid}`);
    this.engine.setupRemoteVideo(uid, view);
    this.engine.setupViewContentMode(uid, isFit ? 1 : 0, undefined);
  };

  setCurrentCamera = (deviceId: string) => this.engine.setVideoDevice(deviceId);

  setCurrentMicrophone = (deviceId: string) =>
    this.engine.setAudioRecordingDevice(deviceId);

  setCurrentSpeaker = (deviceId: string) =>
    this.engine.setAudioPlaybackDevice(deviceId);

  setVideoEncoderConfiguration = (
    configurationType: RtcVideoEncoderConfigurationType
  ) => {
    log.info(
      'rtc manager set video encoder configuration with type',
      configurationType
    );

    this.engine.setVideoEncoderConfiguration(
      PresetEncoderConfigurations[configurationType]
    );
  };

  private registerEngineEvents = () => {
    this.engine.on('joinedChannel', (channel, uid, elapsed) => {
      log.info(
        `rtc manager on joinedChannel: ${channel}  uid: ${uid}  version: ${JSON.stringify(
          this.engine.getVersion()
        )} elapsed: ${elapsed}`
      );

      this.setConnection(RtcConnection.Connected);
    });

    this.engine.on('userJoined', (uid) => {
      log.info(`rtc manager on userJoined ---- ${uid}`);
      this.addUser({
        uid,
        nickname: '',

        shareId: 0,
        parentId: 0,

        isSelf: false,
        isCameraOn: false,
        isAudioOn: false,

        isCameraMuted: false,
        isAudioMuted: false,
      });
    });

    this.engine.on('userOffline', (uid, reason) => {
      log.info(`rtc manager on userOffline ---- ${uid}  reason: ${reason}`);
      this.removeUser(uid);
    });

    this.engine.on('leavechannel', (rtcStats: RtcStats) => {
      log.info('rtc manager on leavechannel', rtcStats);

      this.setConnection(RtcConnection.Disconnected);
    });

    this.engine.on('error', (err: number, msg: string) => {
      log.error('rtc manager on error', err, msg);
    });

    this.engine.on(
      'localVideoStateChanged',
      (
        localVideoState: LOCAL_VIDEO_STREAM_STATE,
        err: LOCAL_VIDEO_STREAM_ERROR
      ) => {
        // LOCAL_VIDEO_STREAM_STATE.LOCAL_VIDEO_STREAM_STATE_STOPPED = 0
        // LOCAL_VIDEO_STREAM_STATE.LOCAL_VIDEO_STREAM_STATE_FAILED = 3
        const isOn = localVideoState !== 0 && localVideoState !== 3;

        log.info('local video state changed,', localVideoState, err, isOn);

        this.updateUser({
          ...this.getSelfUser(),
          isCameraOn: isOn,
        });
      }
    );

    this.engine.on(
      'localAudioStateChanged',
      (state: LOCAL_AUDIO_STREAM_STATE, err: LOCAL_AUDIO_STREAM_ERROR) => {
        // LOCAL_AUDIO_STREAM_STATE.LOCAL_AUDIO_STREAM_STATE_STOPPED = 0
        // LOCAL_AUDIO_STREAM_STATE.LOCAL_AUDIO_STREAM_STATE_FAILED = 3
        const isOn = state !== 0 && state !== 3;

        log.info('local audio state changed,', state, err, isOn);

        this.updateUser({
          ...this.getSelfUser(),
          isAudioOn: isOn,
        });
      }
    );

    this.engine.on(
      'remoteVideoStateChanged',
      (
        uid: number,
        state: RemoteVideoState,
        reason: RemoteVideoStateReason
      ) => {
        const isOn = state !== 0 && state !== 3 && state !== 4;

        log.info('remote video state changed,', uid, state, reason, isOn);

        this.updateUser({
          uid,
          isCameraOn: isOn,
        });
      }
    );

    this.engine.on(
      'remoteAudioStateChanged',
      (
        uid: number,
        state: RemoteAudioState,
        reason: RemoteAudioStateReason
      ) => {
        const isOn = state !== 0 && state !== 3 && state !== 4;

        log.info('remote audio state changed,', uid, state, reason, isOn);

        this.updateUser({
          uid,
          isAudioOn: isOn,
        });
      }
    );

    this.engine.on(
      'videoDeviceStateChanged',
      (deviceId: string, deviceType: number, deviceState: number) => {
        log.info(
          'rtc manager on videoDeviceStateChanged,',
          deviceId,
          deviceType,
          deviceState
        );
        if (deviceType !== 3) return; // MediaDeviceType.VIDEO_CAPTURE_DEVICE
        this.refreshDeviceList(RtcDeviceType.Camera);
      }
    );

    this.engine.on(
      'audioDeviceStateChanged',
      (deviceId: string, deviceType: number, deviceState: number) => {
        log.info(
          'rtc manager on audioDeviceStateChanged,',
          deviceId,
          deviceType,
          deviceState
        );
        if (deviceType === 0) this.refreshDeviceList(RtcDeviceType.Speaker);
        if (deviceType === 1) this.refreshDeviceList(RtcDeviceType.Microphone);
      }
    );
  };

  private preConfigEngine = () => {
    this.engine.setChannelProfile(1);
    this.engine.setClientRole(1);
    this.engine.enableAudio();
    this.engine.enableVideo();
  };

  private refreshDeviceList = (deviceType: RtcDeviceType) => {
    let devices: RtcDeviceInfo[] = [];
    let currentDeviceId = '';
    switch (deviceType) {
      case RtcDeviceType.Camera:
        devices = this.engine.getVideoDevices() as RtcDeviceInfo[];
        currentDeviceId = this.engine.getCurrentVideoDevice() as string;
        break;
      case RtcDeviceType.Speaker:
        devices = this.engine.getAudioPlaybackDevices() as RtcDeviceInfo[];
        currentDeviceId = this.engine.getCurrentAudioPlaybackDevice() as string;
        break;
      case RtcDeviceType.Microphone:
        devices = this.engine.getAudioRecordingDevices() as RtcDeviceInfo[];
        currentDeviceId =
          this.engine.getCurrentAudioRecordingDevice() as string;

        break;
      default:
        log.error('rtc manager refresh device list with invalid device type');
    }

    this.emit('deviceList', deviceType, currentDeviceId, devices);
  };

  private setConnection = (
    connection: RtcConnection,
    reason: RtcConnectionReason = RtcConnectionReason.None
  ) => {
    this.state.connection = connection;
    this.emit('connection', this.state.connection, reason);
  };

  private getSelfUser = (): RtcUser => {
    if (!this.isInChannel()) return { uid: 0, isSelf: true };
    return this.state.users[0];
  };

  private addUser = (user: RtcUser) => {
    const index = this.state.users.findIndex((item) => item.uid === user.uid);
    if (index === -1) this.state.users.push(user);
    else this.state.users[index] = { ...this.state.users[index], ...user };

    this.emit('userNew', user);
  };

  private updateUser = (user: RtcUser) => {
    this.state.users = this.state.users.map((item) => {
      if (item.uid === user.uid) return { ...item, ...user };
      return item;
    });
    this.emit('userUpdate', user);
  };

  private removeUser = (uid: number) => {
    const newUsers = this.state.users.filter((item) => item.uid !== uid);
    this.state.users = newUsers;

    this.emit('userRemove', uid);
  };
}
