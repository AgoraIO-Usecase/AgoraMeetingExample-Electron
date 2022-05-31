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

import { Image } from 'image-js';
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
} from './types';
import { PresetEncoderConfigurations } from './recommend';
import { readImage } from './utils';
import { RtcScreenShareManager } from './screenshare';

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
    users: RtcUser[];
    dataStreamId: number;
    dataStreamTimerId?: NodeJS.Timeout;
  } = {
    isInitialized: false,

    uid: 0,
    shareId: 0,
    channelName: '',
    connection: RtcConnection.Disconnected,
    users: [],
    dataStreamId: 0,
    dataStreamTimerId: undefined,
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
    this.state.users = [];
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
    this.engine.enableLocalAudio(isAudioOn);

    this.engine.joinChannel('', channelName, '', this.state.uid);

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

  setupLocalVideoRenderer = (
    view: Element,
    isFit: boolean,
    isAppend: boolean
  ) => {
    log.info('rtc manager setup local video renderer');
    this.engine.setupLocalVideo(view, { append: isAppend });
    this.engine.setupViewContentMode('local', isFit ? 1 : 0, undefined);
  };

  destroyLocalVideoRenderer = (view: Element) => {
    log.info('rtc manager destroy local video renderer');
    this.engine.destroyRenderView('local', undefined, view);
  };

  setupRemoteVideoRenderer = (
    uid: number,
    view: Element,
    isFit: boolean,
    isAppend: boolean
  ) => {
    log.info(`rtc manager setup remote video renderer for ${uid}`);
    this.engine.setupRemoteVideo(uid, view, undefined, { append: isAppend });
    this.engine.setupViewContentMode(uid, isFit ? 1 : 0, undefined);
  };

  destroyRemoteVideoRenderer = (uid: number, view: Element) => {
    log.info('rtc manager destroy remote video renderer');
    this.engine.destroyRenderView(uid, undefined, view);
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

  getScreenList = async () => {
    let myResolve: any;
    const promise = new Promise((resolve, reject) => {
      myResolve = resolve;
    });
    this.engine.getScreenDisplaysInfo((list) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore:next-line
      myResolve(list);
    });
    const list = (await promise) as {
      image: Uint8Array;
      displayId: {
        width: number;
        height: number;
        x: number;
        y: number;
        id: number;
      };
    }[];
    const imageListPromise = list.map((item) => readImage(item.image));
    const imageList = await Promise.all(imageListPromise);
    const screenInfoList = list.map(({ displayId }, index) => ({
      name: `Display ${index + 1}`,
      image: imageList[index],
      displayId,
    }));

    return screenInfoList;
  };

  getWindowList = async () => {
    let myResolve: any;
    const promise = new Promise((resolve, reject) => {
      myResolve = resolve;
    });

    this.engine.getScreenWindowsInfo((list) => {
      myResolve(list);
    });

    const list = (await promise) as {
      ownerName: string;
      name: string;
      windowId: number;
      image: Uint8Array;
    }[];

    const imageListPromise = list.map((item) => readImage(item.image));
    const imageList = await Promise.all(imageListPromise);

    const windowInfoList = list.map(({ ownerName, name, windowId }, index) => {
      return {
        ownerName,
        image: imageList[index],
        windowId,
        name,
      };
    });

    return windowInfoList;
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
      if (item.iconImage) return Image.load(item.iconImage.buffer);

      return new Promise((resolve, reject) => {
        resolve(undefined);
      });
    });

    const transformedSourceThumbPromise = originSources.map((item) => {
      if (item.thumbImage) return Image.load(item.thumbImage.buffer);

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

    const transformedSources = originSources.map((item, index) => {
      return {
        ...item,
        icon: transformedSourceIcons[index],
        thumb: transformedSourceThumb[index],
      };
    });

    return transformedSources;
  };

  getScreenCaptureSourcesNew = (
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

    const transformedSources = originSources.map((item, index) => {
      const icon = item.iconImage
        ? new Image(
            item.iconImage.width,
            item.iconImage.height,
            item.iconImage.buffer
          )
        : undefined;

      const thumb = item.thumbImage
        ? new Image(
            item.thumbImage.width,
            item.thumbImage.height,
            item.thumbImage.buffer
          )
        : undefined;
      return {
        ...item,
        icon,
        thumb,
      };
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

  private registerEngineEvents = () => {
    this.engine.on('joinedChannel', (channel, uid, elapsed) => {
      log.info(
        `rtc manager on joinedChannel: ${channel}  uid: ${uid}  version: ${JSON.stringify(
          this.engine.getVersion()
        )} elapsed: ${elapsed}`
      );

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
      if (uid === this.state.shareId) return;

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
      if (this.state.shareId === uid) return;

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

        if (isOn !== this.getSelfUser().isCameraOn)
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

        if (isOn !== this.getSelfUser().isAudioOn)
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
        if (uid === this.state.shareId) return;

        // REMOTE_VIDEO_STATE_STOPPED(0) REMOTE_VIDEO_STATE_FAILED(4)
        const isOn = state !== 0 && state !== 4;

        const userIndex = this.getUserIndex(uid);
        if (userIndex === -1 || this.state.users[userIndex].isCameraOn === isOn)
          return;

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
        if (uid === this.state.shareId) return;

        // REMOTE_AUDIO_STATE_STOPPED(0) REMOTE_AUDIO_STATE_FAILED(4)
        const isOn = state !== 0 && state !== 4;
        const userIndex = this.getUserIndex(uid);
        if (userIndex === -1 || this.state.users[userIndex].isAudioOn === isOn)
          return;

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

    this.engine.on(
      'groupAudioVolumeIndication',
      (speakers, speakerNumber, totalVolume) => {
        this.emit('volumeIndications', speakers as RtcAudioVolumeIndication[]);
      }
    );

    this.engine.on('streamMessage', (uid, streamId, msg, len) => {
      this.onDataStreamMessage(msg);
    });
  };

  private generateRtcUid = () => {
    return Number(`${new Date().getTime()}`.slice(7));
  };

  private generateRtcScreenShareUid = () => {
    return Number(`${new Date().getTime()}`.slice(3));
  };

  private preConfigEngine = () => {
    this.engine.setChannelProfile(1);
    this.engine.setClientRole(1);
    this.engine.enableAudio();
    this.engine.enableVideo();
  };

  private initializeScreenShareManager = (appId: string, logPath: string) => {
    this.screenshareManager.initialize(appId, logPath, this.state.shareId);
    this.screenshareManager.on('state', (state, reason) => {
      if (state === RtcScreenShareState.Running) {
        this.updateUser({ uid: this.state.uid, shareId: this.state.shareId });
      } else if (state === RtcScreenShareState.Idle) {
        this.updateUser({ uid: this.state.uid, shareId: 0 });
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
    if (!this.isInChannel()) return { uid: 0, isSelf: true };

    return this.state.users[0];
  };

  private getUserIndex = (uid: number): number =>
    this.state.users.findIndex((item) => item.uid === uid);

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

    // no user deleted
    if (this.state.users.length === newUsers.length) return;

    this.state.users = newUsers;

    this.emit('userRemove', uid);
  };

  private onDataStreamMessage = (msg: string) => {
    try {
      const data = JSON.parse(msg) as RtcDataStreamMessage;
      const { info, control } = data;

      const userIndex = this.getUserIndex(info.uid);
      if (userIndex === -1) return;

      if (
        this.state.users[userIndex].nickname !== info.nickname ||
        this.state.users[userIndex].parentId !== info.parentId ||
        this.state.users[userIndex].shareId !== info.shareId
      )
        this.updateUser({
          uid: info.uid,
          nickname: info.nickname,
          parentId: info.parentId,
          shareId: info.shareId,
        });

      // update share user
      if (info.shareId === undefined || info.shareId === 0) return;

      const shareUserIndex = this.getUserIndex(info.shareId);
      if (shareUserIndex === -1) return;
      if (
        this.state.users[shareUserIndex].nickname !== info.nickname ||
        this.state.users[shareUserIndex].parentId !== info.uid
      )
        this.updateUser({
          uid: info.shareId,
          nickname: info.nickname,
          parentId: info.uid,
        });
    } catch (e) {
      log.error('rtc manager unpack data stream message failed', e, msg);
    }
  };

  private sendDataStreamMessage = () => {
    const data: RtcDataStreamMessage = {
      info: this.getSelfUser(),
      control: {},
    };

    const msg = JSON.stringify(data);

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
    }, 1000);
  };

  private stopDataStreamSender = () => {
    if (this.state.dataStreamTimerId)
      clearInterval(this.state.dataStreamTimerId);

    this.state.dataStreamTimerId = undefined;
  };
}
