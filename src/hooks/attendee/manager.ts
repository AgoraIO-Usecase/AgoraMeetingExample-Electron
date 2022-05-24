/* eslint-disable import/prefer-default-export */
import log from 'electron-log';
import AgoraRtcEngine from 'agora-electron-sdk';

export class AttendeeManager {
  engine!: AgoraRtcEngine;

  constructor(engine: AgoraRtcEngine) {
    this.engine = engine;
  }

  trace = () => {
    log.info('I am attendee manager.');
  };
}
