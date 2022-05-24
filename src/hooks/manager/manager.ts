/* eslint-disable import/prefer-default-export */
import log from 'electron-log';
import AgoraRtcEngine from 'agora-electron-sdk';
import { RtcStats } from 'agora-electron-sdk/types/Api/native_type';
import { JoinMeetingParams } from '../types';

export class MeetingManager {
  engine!: AgoraRtcEngine;

  constructor(engine: AgoraRtcEngine) {
    this.engine = engine;
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
  };

  private registerRtcEngineEvents = () => {
    this.engine.on('joinedChannel', (channel, uid, elapsed) => {
      log.info(
        `onJoinChannel success channel: ${channel}  uid: ${uid}  version: ${JSON.stringify(
          this.engine.getVersion()
        )})`
      );
      // const { allUser: oldAllUser } = this.state;
      // const newAllUser = [...oldAllUser];
      // newAllUser.push({ isMyself: true, uid });
      // this.setState({
      //   isJoined: true,
      //   allUser: newAllUser,
      // });
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
  };

  joinMeeting = (params: JoinMeetingParams) => {
    log.info('join meeting', params);

    const { channelName, nickName, streamId } = params;
    this.engine.joinChannel(
      '006b8590cc94c0d429a92137f33a44820deIACxaWjIFUWQ0dUdwn70sI9iD5eY8dWW5a83R71ecsNmRiy7EcwAAAAAEADTxV3A/OCNYgEAAQD84I1i',
      channelName,
      '',
      streamId
    );
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
}
