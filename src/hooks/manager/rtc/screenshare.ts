import AgoraRtcEngine from 'agora-electron-sdk';
import { EventEmitter } from 'events';
import log from 'electron-log';
import { SIZE } from 'agora-electron-sdk/types/Api/native_type';

import {
  RtcScreenShareParams,
  RtcScreenShareSource,
  RtcScreenShareState,
  RtcScreenShareStateReason,
} from './types';
import { generateRtcToken } from './cert';
import { readImage } from './utils';

export interface RtcScreenShareManager {
  on(
    evt: 'state',
    cb: (
      state: RtcScreenShareState,
      reason: RtcScreenShareStateReason,
      params: RtcScreenShareParams
    ) => void
  ): this;

  on(evt: 'error', cb: (reason: RtcScreenShareStateReason) => void): this;
  on(evt: 'size', cb: (width: number, height: number) => void): this;
}

export class RtcScreenShareManager extends EventEmitter {
  private engine!: AgoraRtcEngine;

  private props: {
    isInitialized: boolean;
    uid: number;
    channelName: string;

    state: RtcScreenShareState;
    params: RtcScreenShareParams;
    excludeWindowIds: number[];

    width: number;
    height: number;
  } = {
    isInitialized: false,
    uid: 0,
    channelName: '',

    state: RtcScreenShareState.Idle,
    params: {},
    excludeWindowIds: [],

    width: 0,
    height: 0,
  };

  constructor(engine: AgoraRtcEngine) {
    super();
    this.engine = engine;
  }

  initialize = (appId: string, logPath: string, uid: number) => {
    if (this.props.isInitialized) return;

    log.info('screenshare manager intialize with ', uid, logPath);

    this.engine.videoSourceInitialize(appId);
    this.engine.videoSourceSetLogFile(`${logPath}videosource.log`);
    this.engine.videoSourceSetAddonLogFile(`${logPath}videosource-addon.log`);
    this.engine.videoSourceEnableDualStreamMode(false);
    this.engine.videoSourceSetParameters(
      JSON.stringify({ 'che.video.mutigpu_exclude_window': true })
    );

    this.registerEngineEvents();

    this.props.uid = uid;
    this.props.isInitialized = true;
  };

  release = () => {
    if (!this.props.isInitialized) return;

    log.info('screenshare manager release');

    if (this.isRunning()) this.stop();

    this.engine.videoSourceRelease();

    this.props.params = {};

    this.removeAllListeners();

    this.props.uid = 0;
    this.props.isInitialized = false;
  };

  isRunning = () => this.props.state === RtcScreenShareState.Running;

  isSharingDisplay = () => this.props.params.displayId !== undefined;

  isFocusMode = () => this.props.params.focusMode || false;

  getUid = () => this.props.uid;

  getSourceSize = () => {
    return { width: this.props.width, height: this.props.height };
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

    this.props.excludeWindowIds = originSources
      .filter(
        (source) =>
          source.sourceName === 'Electron' ||
          source.sourceName === 'Agora Meeting' ||
          source.sourceName === 'AgoraMeetingExample-Electron'
      )
      .map((source) => source.sourceId as number);

    log.info('current exclude window id list: ', this.props.excludeWindowIds);

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

  start = (channelName: string, params: RtcScreenShareParams) => {
    if (this.isRunning()) return;

    this.props.params = params;

    this.setState(RtcScreenShareState.Waitting, RtcScreenShareStateReason.None);

    // there's a known limitation that, videosourcesetvideoprofile has to be called at least once
    // note although it's called, it's not taking any effect, to control the screenshare dimension, use captureParam instead
    this.engine.videoSourceSetVideoProfile(43, false);

    log.info(
      `screenshare manager join ${channelName} with uid ${this.props.uid}`
    );

    const token = generateRtcToken(channelName, this.props.uid);
    this.engine.videoSourceJoin(token, channelName, '', this.props.uid, {
      autoSubscribeAudio: false,
      autoSubscribeVideo: false,
      publishLocalAudio: false,
      publishLocalVideo: true,
    });

    this.props.channelName = channelName;
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
    const { displayId, windowId } = this.props.params;

    const captureParam = {
      width: 0,
      height: 0,
      bitrate: 1024,
      frameRate: 5,
      captureMouseCursor: true,
      windowFocus: false,
      excludeWindowList: [] as number[],
      excludeWindowCount: 0,
    };

    let ret = 0;
    if (displayId !== undefined) {
      captureParam.excludeWindowList = this.props.excludeWindowIds;
      captureParam.excludeWindowCount = this.props.excludeWindowIds.length;
      log.info(
        'screenshare manager start screen capture by display',
        captureParam
      );
      ret = this.engine.videoSourceStartScreenCaptureByDisplayId(
        { id: displayId },
        { x: 0, y: 0, width: 0, height: 0 },
        captureParam
      );
    } else if (windowId !== undefined) {
      log.info(
        'screenshare manager start screen capture by window',
        captureParam
      );
      ret = this.engine.videoSourceStartScreenCaptureByWindow(
        windowId,
        { x: 0, y: 0, width: 0, height: 0 },
        captureParam
      );
    }

    if (ret === 0)
      this.setState(
        RtcScreenShareState.Running,
        RtcScreenShareStateReason.None
      );
    else {
      this.stop(RtcScreenShareStateReason.Error);
    }
  };

  private stopScreenShare = () => {
    this.engine.stopScreenCapture2();
    this.props.params = {};
    this.props.width = 0;
    this.props.height = 0;
  };

  private setState = (
    state: RtcScreenShareState,
    reason: RtcScreenShareStateReason
  ) => {
    log.info('screenshare manager set state', state, reason);

    this.props.state = state;
    this.emit('state', this.props.state, reason, this.props.params);
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
      // log.info('screenshare manager on videoSourceLocalVideoStats', stats);
    });

    this.engine.on('videoSourceRequestNewToken', () => {
      log.warn('screenshare manager on videoSourceRequestNewToken');
      const token = generateRtcToken(this.props.channelName, this.props.uid);
      this.engine.videoSourceRenewToken(token);
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

        if (this.props.width !== width || this.props.height !== height) {
          this.props.width = width;
          this.props.height = height;
          this.emit('size', width, height);
        }
      }
    );
  };
}
