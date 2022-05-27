/* eslint-disable @typescript-eslint/lines-between-class-members */
import { EventEmitter } from 'events';

import log from 'electron-log';
import { RtcManager } from './rtc';
import { MeetingManager } from './meeting';
import { AttendeeManager } from './attendee';
import {
  AttendeeInfo,
  DeviceInfo,
  DeviceType,
  MeetingConnection,
  MeetingConnectionReason,
  MeetingParams,
} from './types';

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

  initialize = () => {
    if (this.state.isInitialized) return;

    log.info('common manager initialize');

    this.rtcManager.on('deviceList', (deviceType, currentDeviceId, devices) => {
      this.emit('deviceList', deviceType, currentDeviceId, devices);
    });
    this.rtcManager.initialize(
      process.env.AGORA_MEETING_APPID || '',
      './log/rtc.log'
    );

    this.meetingManager.on('connection', (connection, reason) => {
      // should adjust connection with other situations in future
      this.emit('connection', connection, reason);
    });
    this.meetingManager.initialize();

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
}
