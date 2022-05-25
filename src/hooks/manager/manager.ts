/* eslint-disable import/prefer-default-export */
import log from 'electron-log';
import AgoraRtcEngine from 'agora-electron-sdk';
import {
  LOCAL_AUDIO_STREAM_ERROR,
  LOCAL_AUDIO_STREAM_STATE,
  LOCAL_VIDEO_STREAM_ERROR,
  LOCAL_VIDEO_STREAM_STATE,
  RtcStats,
} from 'agora-electron-sdk/types/Api/native_type';
import { JoinMeetingParams, MeetingConnectionState } from '../types';
import { MeetingInfoDispatcherType, MeetingInfoRedux } from '../info';

export class MeetingManager {
  engine!: AgoraRtcEngine;

  infoRedux!: MeetingInfoRedux;

  constructor(engine: AgoraRtcEngine, infoRedux: MeetingInfoRedux) {
    this.engine = engine;
    this.infoRedux = infoRedux;
    this.initializeRtcEngine();
    this.registerRtcEngineEvents();
  }

  private initializeRtcEngine = () => {
    const appid = process.env.AGORA_MEETING_APPID || '';
    const appLogPath = './log/rtc.log';

    log.info('initialize rtc engine with appid:', appid);
    this.engine.initialize(appid, undefined, {
      level: 0x0001,
      filePath: appLogPath,
      fileSize: 2000,
    });
    this.engine.setChannelProfile(1);
    this.engine.setClientRole(1);
    this.engine.enableAudio();
    this.engine.enableVideo();
  };

  private registerRtcEngineEvents = () => {
    this.engine.on('joinedChannel', (channel, uid, elapsed) => {
      log.info(
        `onJoinChannel success channel: ${channel}  uid: ${uid}  version: ${JSON.stringify(
          this.engine.getVersion()
        )})`
      );

      if (this.infoRedux.meetingInfoDispatcher)
        this.infoRedux.meetingInfoDispatcher({
          type: MeetingInfoDispatcherType.DISPATCHER_TYPE_CONNECTION,
          payload: { state: MeetingConnectionState.CONNECTED },
        });
    });

    this.engine.on('userJoined', (uid, elapsed) => {
      log.info(`userJoined ---- ${uid}`);

      // const { allUser: oldAllUser } = this.state;
      // const newAllUser = [...oldAllUser];
      // newAllUser.push({ isMyself: false, uid });
      // this.setState({
      //   allUser: newAllUser,
      // });
    });

    this.engine.on('userOffline', (uid, reason) => {
      log.info(`userOffline ---- ${uid}`);

      // const { allUser: oldAllUser } = this.state;
      // const newAllUser = [...oldAllUser.filter((obj) => obj.uid !== uid)];
      // this.setState({
      //   allUser: newAllUser,
      // });
    });

    this.engine.on('leavechannel', (rtcStats: RtcStats) => {
      log.info('leavechannel', rtcStats);

      // this.setState({
      //   isJoined: false,
      //   allUser: [],
      // });

      if (this.infoRedux.meetingInfoDispatcher)
        this.infoRedux.meetingInfoDispatcher({
          type: MeetingInfoDispatcherType.DISPATCHER_TYPE_CONNECTION,
          payload: { state: MeetingConnectionState.DISCONNECTED },
        });
    });

    this.engine.on('lastmileProbeResult', (result) => {
      log.info(`lastmileproberesult: ${JSON.stringify(result)}`);
    });

    this.engine.on('lastMileQuality', (quality) => {
      log.info(`lastmilequality: ${JSON.stringify(quality)}`);
    });

    this.engine.on(
      'audiovolumeindication',
      (
        uid: number,
        volume: number,
        speakerNumber: number,
        totalVolume: number
      ) => {
        log.info(
          `uid${uid} volume${volume} speakerNumber${speakerNumber} totalVolume${totalVolume}`
        );
      }
    );

    this.engine.on('error', (err) => {
      log.error(err);
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

        if (this.infoRedux.meetingInfoDispatcher)
          this.infoRedux.meetingInfoDispatcher({
            type: MeetingInfoDispatcherType.DISPATCHER_TYPE_INFO,
            payload: { isCameraOn: isOn },
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

        if (this.infoRedux.meetingInfoDispatcher)
          this.infoRedux.meetingInfoDispatcher({
            type: MeetingInfoDispatcherType.DISPATCHER_TYPE_INFO,
            payload: { isMicrophoneOn: isOn },
          });
      }
    );
  };

  joinMeeting = (params: JoinMeetingParams) => {
    log.info('join meeting', params);

    const { channelName, nickName, uid, isCameraOn, isMicrophoneOn } = params;

    this.engine.enableAudioVolumeIndication(200, 3, false);
    this.engine.enableDualStreamMode(true);
    this.engine.enableLocalAudio(isMicrophoneOn);
    this.engine.enableLocalVideo(isCameraOn);

    this.engine.joinChannel('', channelName, '', uid);

    if (this.infoRedux.meetingInfoDispatcher)
      this.infoRedux.meetingInfoDispatcher({
        type: MeetingInfoDispatcherType.DISPATCHER_TYPE_CONNECTION,
        payload: { state: MeetingConnectionState.CONNECTING },
      });
  };

  leaveMeeting = () => {
    log.info('leave meeting');
    this.engine.leaveChannel();
  };

  enableAudio = (enable: boolean) => {
    log.info('enable audio', enable);
    this.engine.enableLocalAudio(enable);
  };

  enableVideo = (enable: boolean) => {
    log.info('enable video', enable);
    this.engine.enableLocalVideo(enable);
  };

  muteAudio = (mute: boolean) => {
    log.info('mute audio', mute);
    this.engine.muteLocalAudioStream(mute);
  };

  muteVideo = (mute: boolean) => {
    log.info('mute video', mute);
    this.engine.muteLocalVideoStream(mute);
  };

  setupLocalVideoRenderer = (view: Element, isFit: boolean) => {
    log.info('setup local video renderer');
    this.engine.setupLocalVideo(view);
    this.engine.setupViewContentMode('local', isFit ? 1 : 0, undefined);
  };

  setupRemoteVideoRenderer = (uid: number, view: Element, isFit: boolean) => {
    log.info(`setup remote video renderer for ${uid}`);
    this.engine.setupRemoteVideo(uid, view);
    this.engine.setupViewContentMode(uid, isFit ? 1 : 0, undefined);
  };
}
