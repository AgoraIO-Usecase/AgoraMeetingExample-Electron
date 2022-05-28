/* eslint-disable @typescript-eslint/lines-between-class-members */
import { EventEmitter } from 'events';

import log from 'electron-log';
import { RtcManager, RtcVideoEncoderConfigurationType } from './rtc';
import { MeetingManager } from './meeting';
import { AttendeeManager } from './attendee';
import {
  AttendeeInfo,
  DeviceInfo,
  DeviceType,
  MeetingConnection,
  MeetingConnectionReason,
  MeetingParams,
  VideoEncoderConfigurationType,
} from './types';
import storage from './localstorage';

export interface CommonManager {
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
    evt: 'attendeeNew',
    cb: (position: number, attendee: AttendeeInfo) => void
  ): this;
  on(
    evt: 'attendeeUpdate',
    cb: (position: number, attendee: AttendeeInfo) => void
  ): this;
  on(evt: 'attendeeRemove', cb: (position: number) => void): this;
}

export class CommonManager extends EventEmitter {
  private rtcManager!: RtcManager;
  private meetingManager!: MeetingManager;
  private attendeeManager!: AttendeeManager;

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
  }

  private initializeRtcManager = () => {
    this.rtcManager.on('deviceList', (deviceType, currentDeviceId, devices) => {
      this.emit('deviceList', deviceType, currentDeviceId, devices);
    });
    this.rtcManager.initialize(
      process.env.AGORA_MEETING_APPID || '',
      './log/rtc.log'
    );
    this.rtcManager.setVideoEncoderConfiguration(
      this.transVideoEncoderConfigruationType(
        this.getVideoEncoderConfigurationType()
      )
    );
  };

  private initializeMeetingManager = () => {
    this.meetingManager.on('connection', (connection, reason) => {
      // should adjust connection with other situations in future
      this.emit('connection', connection, reason);
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
    this.attendeeManager.initialize();
  };

  initialize = () => {
    if (this.state.isInitialized) return;

    log.info('common manager initialize');

    this.initializeRtcManager();
    this.initializeMeetingManager();
    this.initializeAttendeeManager();

    this.state.isInitialized = true;
  };

  release = () => {
    if (!this.state.isInitialized) return;

    this.attendeeManager.release();

    this.meetingManager.release();

    this.rtcManager.release();

    this.state.isInitialized = false;
  };

  joinMeeting = (params: MeetingParams) => {
    this.rtcManager.reset();
    this.meetingManager.reset();
    this.attendeeManager.reset();

    log.info('common manager join meeting with params:', params);

    // only join rtc for now
    const { channelName, nickname, isCameraOn, isAudioOn } = params;
    this.rtcManager.joinChannel({
      channelName,
      uid: Number(`${new Date().getTime()}`.slice(7)),
      nickname,
      isCameraOn,
      isAudioOn,
    });
  };

  leaveMeeting = () => {
    this.meetingManager.leaveMeeting();
  };

  isInMeeting = () => {
    return this.meetingManager.isInMeeting();
  };

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

  setupLocalVideoRenderer = (view: Element, isFit: boolean) => {
    log.info('common manager setup local video renderer');
    this.rtcManager.setupLocalVideoRenderer(view, isFit);
  };

  setupRemoteVideoRenderer = (uid: number, view: Element, isFit: boolean) => {
    log.info(`common manager setup remote video renderer for ${uid}`);
    this.rtcManager.setupRemoteVideoRenderer(uid, view, isFit);
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
}
