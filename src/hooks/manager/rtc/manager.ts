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
  SIZE,
} from 'agora-electron-sdk/types/Api/native_type';

import {
  RtcConnection,
  RtcConnectionReason,
  RtcDeviceInfo,
  RtcDeviceType,
  RtcJoinParams,
  RtcVideoEncoderConfigurationType,
  RtcUser,
  RtcAudioVolumeIndication,
  RtcVersion,
  RtcDataStreamMessage,
  RtcScreenShareState,
  RtcScreenShareStateReason,
  RtcScreenShareSource,
  RtcVideoStreamType,
  RtcClientRole,
  RtcUserUpdateReason,
} from './types';
import { PresetEncoderConfigurations } from './recommend';
import { readImage } from './utils';
import { RtcScreenShareManager } from './screenshare';
import { generateRtcToken } from './cert';

export declare interface RtcManager {
  on(
    evt: 'connection',
    cb: (connection: RtcConnection, reason: RtcConnectionReason) => void
  ): this;
  on(evt: 'userNew', cb: (user: RtcUser) => void): this;
  on(
    evt: 'userUpdate',
    cb: (
      oldUser: RtcUser,
      newUser: RtcUser,
      reason: RtcUserUpdateReason
    ) => void
  ): this;
  on(evt: 'userRemove', cb: (uid: number) => void): this;
  on(
    evt: 'deviceList',
    cb: (
      deviceType: RtcDeviceType,
      currentDeviceId: string,
      devices: RtcDeviceInfo[]
    ) => void
  ): this;
  on(
    evt: 'volumeIndications',
    cb: (indications: RtcAudioVolumeIndication[]) => void
  ): this;
  on(
    evt: 'screenshareState',
    cb: (state: RtcScreenShareState, reason: RtcScreenShareStateReason) => void
  ): this;

  on(
    evt: 'screenshareError',
    cb: (reason: RtcScreenShareStateReason) => void
  ): this;

  on(evt: 'whiteboardInfo', cb: (uuid: string, timespan: string) => void): this;
}

export class RtcManager extends EventEmitter {
  private engine!: AgoraRtcEngine;
  private screenshareManager!: RtcScreenShareManager;

  private state: {
    isInitialized: boolean;

    uid: number;
    shareId: number;
    channelName: string;
    connection: RtcConnection;
    users: { [key: string]: RtcUser | undefined };
    dataStreamId: number;
    dataStreamTimerId?: NodeJS.Timeout;
    clientRole: RtcClientRole;
  } = {
    isInitialized: false,

    uid: 0,
    shareId: 0,
    channelName: '',
    connection: RtcConnection.Disconnected,
    users: {},
    dataStreamId: 0,
    dataStreamTimerId: undefined,
    clientRole: RtcClientRole.Host,
  };

  constructor() {
    super();
    this.engine = new AgoraRtcEngine();
    this.screenshareManager = new RtcScreenShareManager(this.engine);
  }

  initialize = (appId: string, logPath: string) => {
    if (this.state.isInitialized) return;

    log.info(`rtc manager initialize with appId length ${appId.length}`);
    log.info(`rtc manager initialize with logPath ${logPath}`);

    this.engine.initialize(appId, undefined, {
      level: 0x0001,
      filePath: `${logPath}rtc.log`,
      fileSize: 2000,
    });
    this.engine.setAddonLogFile(`${logPath}addon.log`);

    this.registerEngineEvents();
    this.preConfigEngine();
    this.refreshDeviceList(RtcDeviceType.Camera);
    this.refreshDeviceList(RtcDeviceType.Speaker);
    this.refreshDeviceList(RtcDeviceType.Microphone);

    this.state.uid = this.generateRtcUid();
    this.state.shareId = this.generateRtcScreenShareUid();
    this.initializeScreenShareManager(appId, logPath);

    this.state.isInitialized = true;
  };

  release = () => {
    if (!this.state.isInitialized) return;

    log.info('rtc manager release');

    if (this.isInChannel()) this.leaveChannel();

    this.removeAllListeners();
    this.reset();

    this.screenshareManager.release();
    this.engine.release();

    this.state.uid = 0;
    this.state.shareId = 0;
    this.state.isInitialized = false;
  };

  reset = () => {
    this.state.connection = RtcConnection.Disconnected;
    this.state.users = {};
  };

  isInitialized = () => {
    return this.state.isInitialized;
  };

  isInChannel = () => {
    return this.state.connection !== RtcConnection.Disconnected;
  };

  getVersion = () => this.engine.getVersion() as unknown as RtcVersion;

  joinChannel = (params: RtcJoinParams) => {
    if (this.isInChannel()) {
      log.warn('rtc manager join channel failed, already joined');
      return;
    }

    log.info('rtc manager join channel', params);

    const { channelName, nickname, isCameraOn, isAudioOn } = params;
    this.state.channelName = channelName;

    this.engine.enableAudioVolumeIndication(200, 3, false);
    this.engine.enableDualStreamMode(true);
    this.engine.enableLocalVideo(isCameraOn);

    // in case that enable local may hear a pause in the remote audio playback
    // https://docs.agora.io/cn/Video/API%20Reference/electron/classes/agorartcengine.html#enablelocalaudio
    this.engine.enableLocalAudio(true);

    const token = generateRtcToken(channelName, this.state.uid);
    // coz we do not have any backend service for now, we should auto subscribe remote audio and video
    this.engine.joinChannel(token, channelName, '', this.state.uid);

    // coz host will auto publish audio stream
    this.engine.muteLocalAudioStream(!isAudioOn);

    this.setConnection(RtcConnection.Connecting);
    this.addUser({
      uid: this.state.uid,
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

    if (this.screenshareManager.isRunning()) this.screenshareManager.stop();

    log.info('rtc manager leave channel');
    this.engine.leaveChannel();
    this.setConnection(RtcConnection.Disconnecting);
  };

  enableAudio = (enable: boolean) => {
    log.info('rtc manager enable audio', enable);
    this.engine.muteLocalAudioStream(!enable);

    this.updateUser(
      {
        ...this.getSelfUser(),
        isAudioOn: enable,
      },
      RtcUserUpdateReason.Media
    );

    this.autoChangeClientRole();
  };

  enableVideo = (enable: boolean) => {
    log.info('rtc manager enable video', enable);
    this.engine.enableLocalVideo(enable);

    this.updateUser(
      {
        ...this.getSelfUser(),
        isCameraOn: enable,
      },
      RtcUserUpdateReason.Media
    );

    this.autoChangeClientRole();
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

  setupLocalVideoRenderer = (
    view: Element,
    isFit: boolean,
    isAppend: boolean
  ) => {
    log.info('rtc manager setup local video renderer', view.id);
    this.engine.setupLocalVideo(view, { append: isAppend });

    // coz sdk can not set view mode by view
    // force to use fit for now
    this.engine.setupViewContentMode('local', isFit ? 1 : 1, undefined);
  };

  destroyLocalVideoRenderer = (view: Element) => {
    log.info('rtc manager destroy local video renderer', view.id);
    this.engine.destroyRenderView('local', undefined, view);

    // there is no workaround solution for stop trans frame from
    // c++ to js when there is no local renderer for now
    // so will get warn info like 'Can't find renderer for uid: 0'
  };

  setupRemoteVideoRenderer = (
    uid: number,
    view: Element,
    isFit: boolean,
    isAppend: boolean
  ) => {
    log.info(`rtc manager setup remote video renderer for ${uid} ${view.id}`);
    this.engine.setupRemoteVideo(uid, view, undefined, { append: isAppend });

    // coz sdk can not set view mode by view
    // force to use fit for now
    this.engine.setupViewContentMode(uid, isFit ? 1 : 1, undefined);
  };

  destroyRemoteVideoRenderer = (uid: number, view: Element) => {
    log.info(`rtc manager destroy remote video renderer ${uid} ${view.id}`);
    this.engine.destroyRenderView(uid, undefined, view);

    // this is a workaround solution
    // coz sdk can not auto stop trans frame from c++ to js when there is
    // no renderer for now
    // eslint-disable-next-line no-underscore-dangle
    const renderers = this.engine._getRenderers(1, uid, undefined);
    if (!renderers || renderers.length === 0) {
      this.engine.setupRemoteVideo(uid);
    }
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

  setSpeakerVolume = (volume: number) => {
    // log.info('rtc manager set speaker volume', volume);
    return this.engine.setAudioPlaybackVolume(volume);
  };

  getSpeakerVolume = () => this.engine.getAudioPlaybackVolume();

  setMicrophoneVolume = (volume: number) => {
    return this.engine.setAudioRecordingVolume(volume);
  };

  getMicrophoneVolume = () => this.engine.getAudioRecordingVolume();

  playEffect = (id: number, filePath: string, loopCount: number) => {
    log.info('rtc manager play effect', id, filePath);
    if (!this.isInChannel()) {
      log.error('rtc manager play effect failed, not in channel');
      return -1;
    }

    return this.engine.playEffect(id, filePath, loopCount, 1, 0, 100, false, 0);
  };

  stopEffect = (id: number) => {
    log.info('rtc manager stop effect', id);
    return this.engine.stopEffect(id);
  };

  setSpeakerTest = (enable: boolean, filePath?: string) => {
    if (enable) return this.engine.startAudioPlaybackDeviceTest(filePath!);

    return this.engine.stopAudioPlaybackDeviceTest();
  };

  setMicrophoneTest = (enable: boolean) => {
    if (enable) return this.engine.startAudioRecordingDeviceTest(200);

    return this.engine.stopAudioRecordingDeviceTest();
  };

  getScreenCaptureSources = async (
    thumbSize: SIZE,
    iconSize: SIZE,
    includeScreen: boolean
  ) => {
    const originSources = this.engine.getScreenCaptureSources(
      thumbSize,
      iconSize,
      includeScreen
    ) as {
      type: number;
      sourceId: number;
      sourceName: string;
      sourceTitle: string;
      processPath: string;
      primaryMonitor: boolean;
      iconImage?: { buffer: Uint8Array; width: number; height: number };
      thumbImage?: { buffer: Uint8Array; width: number; height: number };
    }[];

    const transformedSourceIconsPromise = originSources.map((item) => {
      if (item.iconImage) return readImage(item.iconImage.buffer);

      return new Promise((resolve, reject) => {
        resolve(undefined);
      });
    });

    const transformedSourceThumbPromise = originSources.map((item) => {
      if (item.thumbImage) return readImage(item.thumbImage.buffer);

      return new Promise((resolve, reject) => {
        resolve(undefined);
      });
    });

    const transformedSourceIcons = await Promise.all(
      transformedSourceIconsPromise
    );
    const transformedSourceThumb = await Promise.all(
      transformedSourceThumbPromise
    );

    const transformedSources: RtcScreenShareSource[] = [];

    originSources.map((item, index) => {
      transformedSources.push({
        id: item.sourceId,
        title: item.sourceTitle.length ? item.sourceTitle : item.sourceName,
        isDisplay: item.type === 1,
        isPrimaryDisplay: item.primaryMonitor,
        icon: transformedSourceIcons[index] as string,
        iconWidth: item.iconImage ? item.iconImage.width : 0,
        iconHeight: item.iconImage ? item.iconImage.height : 0,
        thumb: transformedSourceThumb[index] as string,
        thumbWidth: item.thumbImage ? item.thumbImage.width : 0,
        thumbHeight: item.thumbImage ? item.thumbImage.height : 0,
      });
      return item;
    });

    return transformedSources;
  };

  startScreenShare = (params: { windowId?: number; displayId?: number }) => {
    log.info('rtc manager start screenshare', params);

    this.screenshareManager.start(this.state.channelName, params);
  };

  stopScreenShare = () => {
    log.info('rtc manager stop screenshare');
    this.screenshareManager.stop();
  };

  setRemoteVideoStreamType = (uid: number, streamType: RtcVideoStreamType) => {
    log.info(
      'rtc manager set remote video stream type',
      uid,
      streamType === RtcVideoStreamType.High ? 'High' : 'Low'
    );
    this.engine.setRemoteVideoStreamType(
      uid,
      streamType === RtcVideoStreamType.High ? 0 : 1
    );
  };

  setLocalWhiteBoardInfo = (
    uuid: string | undefined,
    timespan: string | undefined
  ) => {
    const selfUser = this.getSelfUser();

    if (
      selfUser.whiteboardUUID !== uuid ||
      selfUser.whiteboardTimeSpan !== timespan
    )
      this.updateUser(
        {
          ...selfUser,
          whiteboardUUID: uuid,
          whiteboardTimeSpan: timespan,
        },
        RtcUserUpdateReason.Media
      );
  };

  private registerEngineEvents = () => {
    this.engine.on('joinedChannel', (channel, uid, elapsed) => {
      log.info(
        `rtc manager on joinedChannel: ${channel}  uid: ${uid}  version: ${JSON.stringify(
          this.engine.getVersion()
        )} elapsed: ${elapsed}`
      );

      // We recommend you do not use dataStream to sync meeting infos
      // coz too many users send message through dataStream will bring broadcasting storms
      this.startDataStreamSender();
      this.setConnection(RtcConnection.Connected);
    });

    this.engine.on('connectionStateChanged', (state, reason) => {
      // disconnected || failed
      if (state === 1 || state === 5) {
        this.stopDataStreamSender();
      }
    });

    this.engine.on('userJoined', (uid) => {
      log.info(`rtc manager on userJoined ---- ${uid}`);
      if (uid === this.state.shareId) {
        // un subscribe self screenshare stream
        // no need to do in electron sdk, already unscribed
        // this.engine.muteRemoteAudioStream(uid, true);
        // this.engine.muteRemoteVideoStream(uid, true);
        return;
      }

      // we should set remote video stream type to low for sdk
      // subscribe high stream by default
      this.setRemoteVideoStreamType(uid, RtcVideoStreamType.Low);

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
      // do not remove user when uid is self share id or
      // reason is remote become audience
      if (
        this.state.shareId === uid ||
        reason === 2 /* USER_OFFLINE_BECOME_AUDIENCE */
      )
        return;

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

        if (isOn !== this.getSelfUser().isCameraOn) {
          this.updateUser(
            {
              ...this.getSelfUser(),
              isCameraOn: isOn,
            },
            RtcUserUpdateReason.Media
          );
        }
      }
    );

    this.engine.on(
      'localAudioStateChanged',
      (state: LOCAL_AUDIO_STREAM_STATE, err: LOCAL_AUDIO_STREAM_ERROR) => {
        // LOCAL_AUDIO_STREAM_STATE.LOCAL_AUDIO_STREAM_STATE_STOPPED = 0
        // LOCAL_AUDIO_STREAM_STATE.LOCAL_AUDIO_STREAM_STATE_FAILED = 3
        const isOn = state !== 0 && state !== 3;

        log.info('local audio state changed,', state, err, isOn);

        // if (isOn !== this.getSelfUser().isAudioOn)
        //   this.updateUser({
        //     ...this.getSelfUser(),
        //     isAudioOn: isOn,
        //   }, RtcUserUpdateReason.Media);
      }
    );

    this.engine.on(
      'remoteVideoStateChanged',
      (
        uid: number,
        state: RemoteVideoState,
        reason: RemoteVideoStateReason
      ) => {
        if (uid === this.state.shareId) return;

        // REMOTE_VIDEO_STATE_STOPPED(0) REMOTE_VIDEO_STATE_FAILED(4)
        const isOn = state !== 0 && state !== 4;

        const oldUsaer = this.getUser(uid);
        if (oldUsaer && oldUsaer.isCameraOn !== isOn) {
          log.info('remote video state changed,', uid, state, reason, isOn);

          this.updateUser(
            {
              uid,
              isCameraOn: isOn,
            },
            RtcUserUpdateReason.Media
          );
        }
      }
    );

    this.engine.on(
      'remoteAudioStateChanged',
      (
        uid: number,
        state: RemoteAudioState,
        reason: RemoteAudioStateReason
      ) => {
        if (uid === this.state.shareId) return;

        // REMOTE_AUDIO_STATE_STOPPED(0) REMOTE_AUDIO_STATE_FAILED(4)
        const isOn = state !== 0 && state !== 4;

        const oldUsaer = this.getUser(uid);
        if (oldUsaer && oldUsaer.isAudioOn !== isOn) {
          log.info('remote audio state changed,', uid, state, reason, isOn);

          this.updateUser(
            {
              uid,
              isAudioOn: isOn,
            },
            RtcUserUpdateReason.Media
          );
        }
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

    this.engine.on(
      'groupAudioVolumeIndication',
      (speakers, speakerNumber, totalVolume) => {
        this.emit('volumeIndications', speakers as RtcAudioVolumeIndication[]);
      }
    );

    this.engine.on('streamMessage', (uid, streamId, msg, len) => {
      this.onDataStreamMessage(msg);
    });

    this.engine.on('clientRoleChanged', (oldRole, newRole) => {
      log.info(
        `rtc manager on client role changed from ${oldRole} to ${newRole}`
      );
    });

    // this.engine.on('clientRoleChangeFailed', (reason, role) => {
    //   log.info(
    //     `rtc manager on client role changed failed reason ${reason} current role ${role}`
    //   );

    //   // in case that set role as host failed
    //   if (this.state.clientRole === RtcClientRole.Host && role === 2) {
    //     this.enableAudio(false);
    //     this.enableVideo(false);

    //     // no need to change client role directly here.
    //     // Will change client role after enableAudio and enableVideo
    //     // in autoChangeClientRole
    //   }
    // });
  };

  private generateRtcUid = () => {
    return Number(`${new Date().getTime()}`.slice(7));
  };

  private generateRtcScreenShareUid = () => {
    return Number(`${new Date().getTime()}`.slice(5));
  };

  private preConfigEngine = () => {
    this.engine.setChannelProfile(1);
    this.engine.setClientRole(this.state.clientRole as number);
    this.engine.enableAudio();
    this.engine.enableVideo();

    // set video encoder configuration for low stream
    this.engine.setParameters(
      '{"che.video.lowBitRateStreamParameter":{"width":480,"height":360,"frameRate":10,"bitRate":200}}'
    );

    // disable fec for boradcast
    this.engine.setParameters('{"che.video.fec_outside_bw_ratio": 0}');
    this.engine.setParameters('{"che.video.harqScene": 0}');
  };

  private initializeScreenShareManager = (appId: string, logPath: string) => {
    this.screenshareManager.initialize(appId, logPath, this.state.shareId);
    this.screenshareManager.on('state', (state, reason) => {
      if (state === RtcScreenShareState.Running) {
        this.updateUser(
          { uid: this.state.uid, shareId: this.state.shareId },
          RtcUserUpdateReason.Info
        );
      } else if (state === RtcScreenShareState.Idle) {
        this.updateUser(
          { uid: this.state.uid, shareId: 0 },
          RtcUserUpdateReason.Info
        );
      }
      this.emit('screenshareState', state, reason);
    });
    this.screenshareManager.on('error', (reason) => {
      this.emit('screenshareError', reason);
    });
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
    return this.getUser(this.state.uid) || { uid: 0, isSelf: true };
  };

  private getUser = (uid: number) => {
    return this.state.users[uid];
  };

  private addUser = (user: RtcUser) => {
    this.state.users[user.uid] = { ...this.state.users[user.uid], ...user };

    this.emit('userNew', this.state.users[user.uid]);
  };

  private updateUser = (user: RtcUser, reason: RtcUserUpdateReason) => {
    const oldUser = this.state.users[user.uid];
    this.state.users[user.uid] = { ...this.state.users[user.uid], ...user };

    this.emit('userUpdate', oldUser, this.state.users[user.uid], reason);
  };

  private removeUser = (uid: number) => {
    const oldUser = this.getUser(uid);
    if (oldUser === undefined) return;

    this.state.users[uid] = undefined;

    this.emit('userRemove', uid);
  };

  private onDataStreamMessage = (msg: string) => {
    try {
      const data = JSON.parse(msg) as RtcDataStreamMessage;
      const { info } = data;

      const oldUser = this.getUser(info.uid);
      if (oldUser === undefined) return;

      if (
        oldUser.nickname !== info.nickname ||
        oldUser.parentId !== info.parentId ||
        oldUser.shareId !== info.shareId
      )
        this.updateUser(
          {
            uid: info.uid,
            nickname: info.nickname,
            parentId: info.parentId,
            shareId: info.shareId,
          },
          RtcUserUpdateReason.Info
        );

      if (
        oldUser.whiteboardUUID !== info.whiteboardUUID ||
        oldUser.whiteboardTimeSpan !== info.whiteboardTimeSpan
      )
        this.updateUser(
          {
            uid: info.uid,
            whiteboardUUID: info.whiteboardUUID,
            whiteboardTimeSpan: info.whiteboardTimeSpan,
          },
          RtcUserUpdateReason.WhiteBoard
        );

      // in case that sync info through datastream can not make effect 100%
      // so we emit whiteboardInfo here when we get a valid whiteboard room
      if (
        info.whiteboardUUID &&
        info.whiteboardUUID.length &&
        info.whiteboardTimeSpan &&
        info.whiteboardTimeSpan.length
      )
        this.emit(
          'whiteboardInfo',
          info.whiteboardUUID,
          info.whiteboardTimeSpan
        );

      // update share user
      if (info.shareId === undefined || info.shareId === 0) return;

      const shareUser = this.getUser(info.shareId);
      if (
        shareUser &&
        (shareUser.nickname !== info.nickname ||
          shareUser.parentId !== info.uid)
      )
        this.updateUser(
          {
            uid: info.shareId,
            nickname: info.nickname,
            parentId: info.uid,
          },
          RtcUserUpdateReason.Info
        );
    } catch (e) {
      log.error('rtc manager unpack data stream message failed', e, msg);
    }
  };

  private sendDataStreamMessage = () => {
    const msg = JSON.stringify({ info: this.getSelfUser() });

    if (this.isInChannel())
      this.engine.sendStreamMessage(this.state.dataStreamId, msg);
  };

  private startDataStreamSender = () => {
    this.state.dataStreamId = this.engine.createDataStreamWithConfig({
      syncWithAudio: false,
      ordered: true,
    });

    this.state.dataStreamTimerId = setInterval(() => {
      this.sendDataStreamMessage();
    }, 2000);
  };

  private stopDataStreamSender = () => {
    if (this.state.dataStreamTimerId)
      clearInterval(this.state.dataStreamTimerId);

    this.state.dataStreamTimerId = undefined;
  };

  private autoChangeClientRole = () => {
    // We need to use rtc user join event to manager users
    // coz there is no server for now and join channel as
    // a audience will not trigger userJoin event.
    //
    // const self = this.getSelfUser();
    // let newClientRole = RtcClientRole.Audience;
    // if (self.isAudioOn || self.isCameraOn) newClientRole = RtcClientRole.Host;
    // if (newClientRole !== this.state.clientRole) {
    //   this.engine.setClientRole(newClientRole as number);
    //   this.state.clientRole = newClientRole;
    // }
    // if (newClientRole === RtcClientRole.Host) {
    //   if (!self.isAudioOn) this.muteAudio(true);
    // }
  };
}
