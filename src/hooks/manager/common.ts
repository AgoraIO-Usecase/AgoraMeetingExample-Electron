/* eslint-disable @typescript-eslint/lines-between-class-members */
import { EventEmitter } from 'events';

import log from 'electron-log';
import { remote } from 'electron';
import {
  RtcManager,
  RtcScreenShareParams,
  RtcUserUpdateReason,
  RtcVideoEncoderConfigurationType,
  RtcVideoStreamType,
} from './rtc';
import { MeetingManager } from './meeting';
import { AttendeeManager } from './attendee';
import {
  AttendeeInfo,
  DeviceInfo,
  DeviceType,
  EffectType,
  MeetingConnection,
  MeetingConnectionReason,
  MeetingParams,
  ScreenShareParams,
  ScreenShareSource,
  ScreenShareState,
  ScreenShareStateReason,
  Version,
  VideoEncoderConfigurationType,
  VolumeIndication,
  WhiteBoardState,
} from './types';
import storage from './localstorage';
import { getResourcePath } from '../../utils/resource';
import { WhiteBoardConnection, WhiteBoardManager } from './whiteboard';

export interface CommonManager {
  // common events
  on(
    evt: 'connection',
    cb: (connection: MeetingConnection, reason: MeetingConnectionReason) => void
  ): this;
  on(
    evt: 'deviceList',
    cb: (
      deviceType: DeviceType,
      currentDeviceId: string,
      devices: DeviceInfo[]
    ) => void
  ): this;
  on(
    evt: 'volumeIndications',
    cb: (indications: VolumeIndication[]) => void
  ): this;

  // attendee events
  on(
    evt: 'attendeeNew',
    cb: (position: number, attendee: AttendeeInfo) => void
  ): this;
  on(
    evt: 'attendeeUpdate',
    cb: (position: number, attendee: AttendeeInfo) => void
  ): this;
  on(evt: 'attendeeRemove', cb: (position: number) => void): this;
  on(
    evt: 'attendeeReplace',
    cb: (oldPosition: number, newPosition: number) => void
  ): this;

  // screenshare events
  on(
    evt: 'screenshareState',
    cb: (
      state: ScreenShareState,
      params: ScreenShareParams,
      reason: ScreenShareStateReason
    ) => void
  ): this;
  on(
    evt: 'screenshareError',
    cb: (reason: ScreenShareStateReason) => void
  ): this;

  // whiteboard events
  on(evt: 'whiteboardState', cb: (state: WhiteBoardState) => void): this;
}

export class CommonManager extends EventEmitter {
  private rtcManager!: RtcManager;
  private meetingManager!: MeetingManager;
  private attendeeManager!: AttendeeManager;
  private whiteboardManager!: WhiteBoardManager;

  private state: {
    isInitialized: boolean;
  } = {
    isInitialized: false,
  };

  constructor() {
    super();

    this.rtcManager = new RtcManager();
    this.meetingManager = new MeetingManager(this.rtcManager);
    this.attendeeManager = new AttendeeManager(this.rtcManager);
    this.whiteboardManager = new WhiteBoardManager();
  }

  private initializeRtcManager = () => {
    this.rtcManager.on('deviceList', (deviceType, currentDeviceId, devices) => {
      this.emit('deviceList', deviceType, currentDeviceId, devices);
    });
    this.rtcManager.on('volumeIndications', (indications) => {
      this.emit('volumeIndications', indications as VolumeIndication[]);
    });
    this.rtcManager.on('screenshareState', (state, params, reason) => {
      log.info('common manager on screenshareState', state, reason);
      this.emit('screenshareState', state, params as ScreenShareParams, reason);
    });
    this.rtcManager.on('screenshareError', (reason) => {
      log.error('common manager on screenshareError', reason);
      this.emit('screenshareError', reason);
    });
    this.rtcManager.on('userUpdate', (oldUser, newUser, reason) => {
      if (reason !== RtcUserUpdateReason.WhiteBoard || newUser.isSelf) return;

      this.whiteboardManager.autoJoinOrStop(
        {
          parentId: oldUser.uid,
          uuid: oldUser.whiteboardUUID || '',
          timespan: oldUser.whiteboardTimeSpan || '',
          ratio:
            oldUser.whiteboardRatio || this.whiteboardManager.getDefaultRatio(),
        },
        {
          parentId: newUser.uid,
          uuid: newUser.whiteboardUUID || '',
          timespan: newUser.whiteboardTimeSpan || '',
          ratio:
            oldUser.whiteboardRatio || this.whiteboardManager.getDefaultRatio(),
        }
      );
    });

    this.rtcManager.on('userRemove', (uid) => {
      // in case that remote user crashed or disconnected
      // should auto stop whiteboard if parentId == uid && isRunning
      if (
        this.whiteboardManager.isConnected() &&
        this.whiteboardManager.getRoomInfo().parentId === uid
      )
        this.whiteboardManager.stop();
    });

    this.rtcManager.on('whiteboardInfo', (parentId, uuid, timespan, ratio) => {
      this.whiteboardManager.autoJoinOrStop(
        { parentId: 0, uuid: '', timespan: '', ratio: 0 },
        { parentId, uuid, timespan, ratio }
      );
    });

    this.rtcManager.initialize(
      process.env.AGORA_MEETING_APPID || '',
      `${remote.app.getPath('logs')}/`
    );
    this.rtcManager.setVideoEncoderConfiguration(
      this.transVideoEncoderConfigruationType(
        this.getVideoEncoderConfigurationType()
      )
    );
  };

  private initializeMeetingManager = () => {
    this.meetingManager.on('connection', (connection, reason) => {
      this.emit('connection', connection, reason);

      if (connection === MeetingConnection.Disconnected) {
        this.whiteboardManager.reset();
        this.meetingManager.reset();
        this.attendeeManager.reset();
        this.rtcManager.reset();
      }
    });

    this.meetingManager.initialize();
  };

  private initializeAttendeeManager = () => {
    this.attendeeManager.on('new', (position, attendee) => {
      this.emit('attendeeNew', position, attendee);
    });
    this.attendeeManager.on('update', (position, attendee) => {
      this.emit('attendeeUpdate', position, attendee);
    });
    this.attendeeManager.on('remove', (position) => {
      this.emit('attendeeRemove', position);
    });
    this.attendeeManager.on('replace', (oldPosition, newPosition) => {
      this.emit('attendeeReplace', oldPosition, newPosition);
    });
    this.attendeeManager.initialize();
  };

  private initializeWhiteBoardManager = () => {
    this.whiteboardManager.on('connection', (connection, error) => {
      let state = WhiteBoardState.Idle;
      switch (connection) {
        case WhiteBoardConnection.Disconnected:
          state = WhiteBoardState.Idle;
          break;
        case WhiteBoardConnection.Connecting:
          state = WhiteBoardState.Waitting;
          break;
        case WhiteBoardConnection.Connected:
          state = WhiteBoardState.Running;
          break;
        default:
          break;
      }

      if (
        state === WhiteBoardState.Running &&
        this.whiteboardManager.isCreator()
      ) {
        const { uuid, timespan } = this.whiteboardManager.getRoomInfo();
        const ratio = this.whiteboardManager.getRatio();
        this.rtcManager.setLocalWhiteBoardInfo(uuid, timespan, ratio);
      } else
        this.rtcManager.setLocalWhiteBoardInfo(undefined, undefined, undefined);

      this.emit('whiteboardState', state);
    });

    this.whiteboardManager.initialize();
  };

  initialize = () => {
    if (this.state.isInitialized) return;

    log.info('common manager initialize');

    this.initializeWhiteBoardManager();
    this.initializeRtcManager();
    this.initializeMeetingManager();
    this.initializeAttendeeManager();

    this.state.isInitialized = true;
  };

  release = () => {
    if (!this.state.isInitialized) return;

    this.whiteboardManager.release();

    this.attendeeManager.release();

    this.meetingManager.release();

    this.rtcManager.release();

    this.state.isInitialized = false;
  };

  getVersion = (): Version => {
    const rtcVersion = this.rtcManager.getVersion();
    const version: Version = {
      rtcVersion: `${rtcVersion.version}.${rtcVersion.build}`,
    };
    return version;
  };

  joinMeeting = (params: MeetingParams) => {
    log.info('common manager join meeting with params:', params);

    this.whiteboardManager.setNickName(params.nickname);
    this.meetingManager.joinMeeting(params);
  };

  leaveMeeting = () => {
    if (this.whiteboardManager.isConnected()) this.whiteboardManager.stop();

    this.meetingManager.leaveMeeting();
  };

  isInMeeting = () => {
    return this.meetingManager.isInMeeting();
  };

  isDisconnecting = () => {
    return this.meetingManager.isDisconnecting();
  };

  getChannelName = () => this.meetingManager.getChannelName();

  enableAudio = (enable: boolean) => {
    log.info('common manager enable audio', enable);
    this.rtcManager.enableAudio(enable);
  };

  enableVideo = (enable: boolean) => {
    log.info('common manager enable video', enable);
    this.rtcManager.enableVideo(enable);
  };

  setVideoPreview = (enable: boolean) => {
    log.info('common manager set video preview', enable);
    this.rtcManager.setVideoPreview(enable);
  };

  setupLocalVideoRenderer = (
    view: Element,
    isFit: boolean,
    isAppend: boolean
  ) => {
    this.rtcManager.setupLocalVideoRenderer(view, isFit, isAppend);
  };

  destroyLocalVideoRenderer = (view: Element) => {
    this.rtcManager.destroyLocalVideoRenderer(view);
  };

  setupScreenShareRenderer = (
    view: Element,
    isFit: boolean,
    isAppend: boolean
  ) => {
    this.rtcManager.setupScreenShareRenderer(view, isFit, isAppend);
  };

  destroyScreenShareRenderer = (view: Element) => {
    this.rtcManager.destroyScreenShareRenderer(view);
  };

  setupRemoteVideoRenderer = (
    uid: number,
    view: Element,
    isFit: boolean,
    isAppend: boolean
  ) => {
    this.rtcManager.setupRemoteVideoRenderer(uid, view, isFit, isAppend);
  };

  destroyRemoteVideoRenderer = (uid: number, view: Element) => {
    this.rtcManager.destroyRemoteVideoRenderer(uid, view);
  };

  setDevice = (deviceType: DeviceType, deviceId: string) => {
    if (deviceType === DeviceType.Camera)
      this.rtcManager.setCurrentCamera(deviceId);
    else if (deviceType === DeviceType.Microphone)
      this.rtcManager.setCurrentMicrophone(deviceId);
    else if (deviceType === DeviceType.Speaker)
      this.rtcManager.setCurrentSpeaker(deviceId);
  };

  getVideoEncoderConfigurationType = () =>
    storage.getVideoEncoderConfigurationType() as VideoEncoderConfigurationType;

  private transVideoEncoderConfigruationType = (
    configurationType: VideoEncoderConfigurationType
  ) => {
    switch (configurationType) {
      case VideoEncoderConfigurationType.Low:
        return RtcVideoEncoderConfigurationType.Low;
      case VideoEncoderConfigurationType.Medium:
        return RtcVideoEncoderConfigurationType.Medium;
      case VideoEncoderConfigurationType.High:
        return RtcVideoEncoderConfigurationType.High;
      default:
        return RtcVideoEncoderConfigurationType.Medium;
    }
  };

  setVideoEncoderConfigurationType = (
    configurationType: VideoEncoderConfigurationType
  ) => {
    this.rtcManager.setVideoEncoderConfiguration(
      this.transVideoEncoderConfigruationType(configurationType)
    );

    storage.setVideoEncoderConfigurationType(configurationType as number);
  };

  setSpeakerVolume = (volume: number) => {
    this.rtcManager.setSpeakerVolume(volume);
  };

  getSpeakerVolume = () => this.rtcManager.getSpeakerVolume();

  private getEffectSourceByType = (effectType: EffectType) => {
    switch (effectType) {
      case EffectType.EffectSpeakerTest:
        return getResourcePath('audioeffect.mp3');
      default:
        return '';
    }
  };

  setEffect = (effectType: EffectType, play: boolean, loopCount = -1) => {
    this.rtcManager.playEffect(
      effectType as number,
      this.getEffectSourceByType(effectType),
      loopCount
    );
  };

  setSpeakerTest = (enable: boolean) =>
    this.rtcManager.setSpeakerTest(
      enable,
      this.getEffectSourceByType(EffectType.EffectSpeakerTest)
    );

  setMicrophoneTest = (enable: boolean) =>
    this.rtcManager.setMicrophoneTest(enable);

  getScreenCaptureSources = async () => {
    const sources = await this.rtcManager.getScreenCaptureSources(
      { width: 480, height: 480 },
      { width: 32, height: 32 },
      true
    );

    return sources as ScreenShareSource[];
  };

  startScreenShare = (params: ScreenShareParams) => {
    this.rtcManager.startScreenShare(params as RtcScreenShareParams);
  };

  stopScreenShare = () => {
    this.rtcManager.stopScreenShare();
  };

  setRemoteVideoStreamType = (uid: number, isHigh: boolean) => {
    this.rtcManager.setRemoteVideoStreamType(
      uid,
      isHigh ? RtcVideoStreamType.High : RtcVideoStreamType.Low
    );
  };

  whiteboardStart = async () => {
    const isScreenSharing = this.rtcManager.isScreenSharing();
    const isScreenSharingDisplay = this.rtcManager.isScreenSharingDisplay();
    const isScreenSharingFocusMode = this.rtcManager.isScreenSharingFocusMode();
    const { width, height } = this.rtcManager.getScreenShareSourceSize();

    let ratio = this.whiteboardManager.getDefaultRatio();
    if (
      isScreenSharing &&
      isScreenSharingDisplay &&
      isScreenSharingFocusMode &&
      width !== 0 &&
      height !== 0
    )
      ratio = height / width;

    await this.whiteboardManager.start(ratio);
  };

  whiteboardStop = async () => {
    await this.whiteboardManager.stop();
  };

  whiteboardSetView = (element: HTMLDivElement | null) => {
    this.whiteboardManager.setElement(element);
  };

  whiteboardIsSelfCreator = () => this.whiteboardManager.isCreator();

  whiteboardGetRoomInfo = () => this.whiteboardManager.getRoomInfo();

  whiteboardUpdateRatio = (ratio: number) =>
    this.whiteboardManager.updateRatio(ratio);

  whiteboardEnableFollowPPT = async (enable: boolean) => {
    await this.whiteboardManager.enableFollowPPT(enable);
  };
}
