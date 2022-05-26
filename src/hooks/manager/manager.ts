/* eslint-disable import/prefer-default-export */
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
import { DeviceInfo, JoinParams, ConnectionType, UserInfo } from '../types';
import { StoreActionType, Store } from '../store';

export class MeetingManager {
  engine!: AgoraRtcEngine;

  store!: Store;

  selfUser!: UserInfo;

  constructor(engine: AgoraRtcEngine, store: Store) {
    this.engine = engine;
    this.store = store;
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

    this.refreshDevices('camera');
    this.refreshDevices('speaker');
    this.refreshDevices('mic');
  };

  private registerRtcEngineEvents = () => {
    this.engine.on('joinedChannel', (channel, uid, elapsed) => {
      log.info(
        `onJoinChannel success channel: ${channel}  uid: ${uid}  version: ${JSON.stringify(
          this.engine.getVersion()
        )})`
      );

      this.store.dispatch({
        type: StoreActionType.ACTION_TYPE_CONNECTION,
        payload: ConnectionType.CONNECTED,
      });
    });

    this.engine.on('userJoined', (uid, elapsed) => {
      log.info(`userJoined ---- ${uid}`);

      const selfUser: UserInfo = {
        uid,
        shareId: 0,
        parentId: 0,
        nickName: `unknown(${uid})`,
        isSelf: false,
        isCameraOn: false,
        isMicrophoneOn: false,
        isScreenSharing: false,
      };
      this.store.dispatch({
        type: StoreActionType.ACTION_TYPE_USER_NEW,
        payload: selfUser,
      });
    });

    this.engine.on('userOffline', (uid, reason) => {
      log.info(`userOffline ---- ${uid}  reason: ${reason}`);

      this.store.dispatch({
        type: StoreActionType.ACTION_TYPE_USER_NEW,
        payload: uid,
      });
    });

    this.engine.on('leavechannel', (rtcStats: RtcStats) => {
      log.info('leavechannel', rtcStats);

      this.store.dispatch({
        type: StoreActionType.ACTION_TYPE_CONNECTION,
        payload: ConnectionType.DISCONNECTED,
      });
    });

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

        if (this.isInMeeting() && this.selfUser.isCameraOn !== isOn) {
          this.selfUser.isCameraOn = isOn;
          this.store.dispatch({
            type: StoreActionType.ACTION_TYPE_USER_MODIFY,
            payload: this.selfUser,
          });
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

        if (this.isInMeeting() && this.selfUser.isMicrophoneOn !== isOn) {
          this.selfUser.isMicrophoneOn = isOn;
          this.store.dispatch({
            type: StoreActionType.ACTION_TYPE_USER_MODIFY,
            payload: this.selfUser,
          });
        }
      }
    );

    this.engine.on(
      'remoteVideoStateChanged',
      (
        uid: number,
        state: RemoteVideoState,
        reason: RemoteVideoStateReason,
        elapsed: number
      ) => {
        const isOn = state !== 0 && state !== 3 && state !== 4;

        log.info('remote video state changed,', uid, state, reason, isOn);

        this.store.dispatch({
          type: StoreActionType.ACTION_TYPE_USER_MODIFY,
          payload: {
            uid,
            isCameraOn: isOn,
          },
        });
      }
    );

    this.engine.on(
      'remoteAudioStateChanged',
      (
        uid: number,
        state: RemoteAudioState,
        reason: RemoteAudioStateReason,
        elapsed: number
      ) => {
        const isOn = state !== 0 && state !== 3 && state !== 4;

        log.info('remote audio state changed,', uid, state, reason, isOn);

        this.store.dispatch({
          type: StoreActionType.ACTION_TYPE_USER_MODIFY,
          payload: {
            uid,
            isMicrophoneOn: isOn,
          },
        });
      }
    );

    this.engine.on(
      'videoDeviceStateChanged',
      (deviceId: string, deviceType: number, deviceState: number) => {
        if (deviceType !== 3) return; // MediaDeviceType.VIDEO_CAPTURE_DEVICE
        this.refreshDevices('camera');
      }
    );

    this.engine.on(
      'audioDeviceStateChanged',
      (deviceId: string, deviceType: number, deviceState: number) => {
        if (deviceType === 0) this.refreshDevices('speaker');
        if (deviceType === 1) this.refreshDevices('mic');
      }
    );
  };

  private refreshDevices = (type: 'camera' | 'speaker' | 'mic') => {
    switch (type) {
      case 'camera':
        {
          const devices = this.engine.getVideoDevices() as DeviceInfo[];
          const currentDevice = this.engine.getCurrentVideoDevice() as string;
          this.store.dispatch({
            type: StoreActionType.ACTION_TYPE_ENGINE_INFO,
            payload: {
              cameras: devices,
              currentCameraId: currentDevice,
            },
          });
        }
        break;
      case 'speaker':
        {
          const devices = this.engine.getAudioPlaybackDevices() as DeviceInfo[];
          const currentDevice =
            this.engine.getCurrentAudioPlaybackDevice() as string;

          this.store.dispatch({
            type: StoreActionType.ACTION_TYPE_ENGINE_INFO,
            payload: {
              speakers: devices,
              currentSpeakerId: currentDevice,
            },
          });
        }
        break;
      case 'mic':
        {
          const devices =
            this.engine.getAudioRecordingDevices() as DeviceInfo[];
          const currentDevice =
            this.engine.getCurrentAudioRecordingDevice() as string;

          this.store.dispatch({
            type: StoreActionType.ACTION_TYPE_ENGINE_INFO,
            payload: {
              microphones: devices,
              currentMicrophoneId: currentDevice,
            },
          });
        }
        break;
      default:
        log.error('revresh device with invalid device type');
    }
  };

  isInMeeting = () => {
    const { meeting } = this.store.state;
    return meeting.connection !== ConnectionType.DISCONNECTED;
  };

  joinMeeting = (params: JoinParams) => {
    log.info('join meeting', params);

    const { channelName, nickName, uid, isCameraOn, isMicrophoneOn } = params;

    this.engine.enableAudioVolumeIndication(200, 3, false);
    this.engine.enableDualStreamMode(true);
    this.engine.enableLocalAudio(isMicrophoneOn);
    this.engine.enableLocalVideo(isCameraOn);

    this.engine.joinChannel('', channelName, '', uid);

    this.store.dispatch({
      type: StoreActionType.ACTION_TYPE_CONNECTION,
      payload: ConnectionType.CONNECTING,
    });

    this.selfUser = {
      uid,
      shareId: 0,
      parentId: 0,
      nickName,
      isSelf: true,
      isCameraOn,
      isMicrophoneOn,
      isScreenSharing: false,
    };
    this.store.dispatch({
      type: StoreActionType.ACTION_TYPE_USER_NEW,
      payload: this.selfUser,
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

  setVideoPreview = (enable: boolean) => {
    if (enable) this.engine.startPreview();
    else this.engine.stopPreview();
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
