import AgoraRtcEngine from 'agora-electron-sdk';
import { EventEmitter } from 'events';
import log from 'electron-log';

import { RtcScreenShareState, RtcScreenShareStateReason } from './types';

export interface RtcScreenShareManager {
  on(
    evt: 'state',
    cb: (state: RtcScreenShareState, reason: RtcScreenShareStateReason) => void
  ): this;

  on(evt: 'error', cb: (reason: RtcScreenShareStateReason) => void): this;
}

export class RtcScreenShareManager extends EventEmitter {
  private engine!: AgoraRtcEngine;

  private props: {
    isInitialized: boolean;

    displayId?: number | undefined;
    windowId?: number | undefined;
    state: RtcScreenShareState;
  } = {
    isInitialized: false,

    displayId: undefined,
    windowId: undefined,
    state: RtcScreenShareState.Idle,
  };

  constructor(engine: AgoraRtcEngine) {
    super();
    this.engine = engine;
  }

  initialize = (appId: string, logPath: string) => {
    if (this.props.isInitialized) return;

    log.info('screenshare manager intialize');

    this.engine.videoSourceInitialize(appId);
    this.engine.videoSourceSetLogFile(`${logPath}videosource.log`);
    this.engine.videoSourceSetAddonLogFile(`${logPath}videosource-addon.log`);
    this.engine.videoSourceEnableDualStreamMode(false);

    this.registerEngineEvents();

    this.props.isInitialized = true;
  };

  release = () => {
    if (!this.props.isInitialized) return;

    log.info('screenshare manager release');

    if (this.isRunning()) this.stop();

    this.engine.videoSourceRelease();

    this.props.displayId = undefined;
    this.props.windowId = undefined;
    this.props.isInitialized = false;
  };

  isRunning = () => this.props.state === RtcScreenShareState.Running;

  start = (
    channelName: string,
    uid: number,
    params: { windowId?: number; displayId?: number }
  ) => {
    if (this.isRunning()) return;

    this.props.windowId = params.windowId;
    this.props.displayId = params.displayId;

    this.setState(RtcScreenShareState.Waitting, RtcScreenShareStateReason.None);

    // there's a known limitation that, videosourcesetvideoprofile has to be called at least once
    // note although it's called, it's not taking any effect, to control the screenshare dimension, use captureParam instead
    this.engine.videoSourceSetVideoProfile(43, false);
    this.engine.videoSourceJoin('', channelName, '', uid, {
      autoSubscribeAudio: false,
      autoSubscribeVideo: false,
      publishLocalAudio: false,
      publishLocalVideo: true,
    });
  };

  stop = (
    reason: RtcScreenShareStateReason = RtcScreenShareStateReason.None
  ) => {
    if (!this.isRunning()) return;

    if (reason !== RtcScreenShareStateReason.None) this.emit('error', reason);

    this.stopScreenShare();

    this.engine.videoSourceLeave();
  };

  private startScreenShare = () => {
    const { displayId, windowId } = this.props;

    const captureParam = {
      width: 0,
      height: 0,
      bitrate: 2000,
      frameRate: 5,
      captureMouseCursor: true,
      windowFocus: false,
      excludeWindowList: [],
      excludeWindowCount: 0,
    };

    if (displayId) {
      this.engine.videoSourceStartScreenCaptureByDisplayId(
        { id: displayId, x: 0, y: 0, width: 0, height: 0 },
        { x: 0, y: 0, width: 0, height: 0 },
        captureParam
      );
    } else if (windowId) {
      this.engine.videoSourceStartScreenCaptureByWindow(
        windowId,
        { x: 0, y: 0, width: 0, height: 0 },
        captureParam
      );
    }
  };

  private stopScreenShare = () => {
    this.engine.stopScreenCapture2();
  };

  private setState = (
    state: RtcScreenShareState,
    reason: RtcScreenShareStateReason
  ) => {
    log.info('screenshare manager set state', state, reason);

    this.props.state = state;
    this.emit('state', this.props.state, reason);
  };

  private registerEngineEvents = () => {
    this.engine.on('videoSourceJoinedSuccess', (uid: number) => {
      log.info('screenshare manager on videoSourceJoinedSuccess', uid);

      this.startScreenShare();
    });

    this.engine.on('videoSourceLeaveChannel', () => {
      log.info('screenshare manager on videoSourceLeaveChannel');

      this.setState(RtcScreenShareState.Idle, RtcScreenShareStateReason.None);
    });

    this.engine.on('videoSourceLocalAudioStateChanged', () => {
      log.info('screenshare manager on videoSourceLocalAudioStateChanged');
    });

    this.engine.on('videoSourceLocalAudioStats', (stats) => {
      log.info('screenshare manager on videoSourceLocalAudioStats', stats);
    });

    this.engine.on('videoSourceLocalVideoStateChanged', (state, error) => {
      log.info(
        'screenshare manager on videoSourceLocalVideoStateChanged',
        state,
        error
      );

      // LOCAL_VIDEO_STREAM_ERROR_SCREEN_CAPTURE_WINDOW_CLOSED
      if (error === 12) {
        log.error('screenshare manager on specified window closed, auto stop');
        this.stop(RtcScreenShareStateReason.WindowClosed);
      }
    });

    this.engine.on('videoSourceLocalVideoStats', (stats) => {
      log.info('screenshare manager on videoSourceLocalVideoStats', stats);
    });

    this.engine.on('videoSourceRequestNewToken', () => {
      log.info('screenshare manager on videoSourceRequestNewToken');
    });

    this.engine.on('videoSourceScreenCaptureInfoUpdated', (info) => {
      log.info(
        'screenshare manager on videoSourceScreenCaptureInfoUpdated',
        info
      );
    });

    this.engine.on(
      'videoSourceVideoSizeChanged',
      (uid, width, height, rotation) => {
        log.info(
          'screenshare manager on videoSourceVideoSizeChanged',
          uid,
          width,
          height,
          rotation
        );
      }
    );
  };
}
