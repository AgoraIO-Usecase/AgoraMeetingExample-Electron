import { EventEmitter } from 'events';
import log from 'electron-log';
import { RtcManager, RtcUser } from './rtc';
import { AttendeeInfo } from './types';

export interface AttendeeManager {
  on(evt: 'new', cb: (position: number, attendee: AttendeeInfo) => void): this;
  on(
    evt: 'update',
    cb: (position: number, attendee: AttendeeInfo) => void
  ): this;
  on(evt: 'remove', cb: (position: number) => void): this;
}

export class AttendeeManager extends EventEmitter {
  private rtcManager!: RtcManager;

  private state: {
    isInitialized: boolean;
    attendees: AttendeeInfo[];
  } = {
    isInitialized: false,
    attendees: [],
  };

  constructor(rtcManager: RtcManager) {
    super();

    this.rtcManager = rtcManager;
  }

  initialize = () => {
    if (this.state.isInitialized) return;

    log.info('attendee manager initialize');

    this.registerRtcEvents();

    this.state.isInitialized = true;
  };

  release = () => {
    if (!this.state.isInitialized) return;

    log.info('attendee manager release');

    this.removeAllListeners();
    this.reset();

    this.state.isInitialized = false;
  };

  reset = () => {
    this.state.attendees = [];
  };

  isInitialized = () => {
    return this.state.isInitialized;
  };

  private onRtcUserNew = (user: RtcUser) => {
    log.info('attendee manager on onRtcUserNew', user);
    const index = this.state.attendees.findIndex(
      (item) => item.uid === user.uid
    );

    if (index === -1) {
      const attendee = { ...user };
      this.state.attendees.push(attendee);
      this.emit('new', this.state.attendees.length - 1, attendee);
    } else {
      const attendee = { ...this.state.attendees[index], ...user };
      this.state.attendees[index] = attendee;
      this.emit('update', index, attendee);
    }
  };

  private onRtcUserUpdate = (user: RtcUser) => {
    log.info('attendee manager on onRtcUserUpdate', user);

    const index = this.state.attendees.findIndex(
      (item) => item.uid === user.uid
    );

    if (index === -1) return;

    const attendee = { ...this.state.attendees[index], ...user };
    this.state.attendees[index] = attendee;
    this.emit('update', index, attendee);
  };

  private onRtcUserRemove = (uid: number) => {
    log.info('attendee manager on onRtcUserRemove', uid);

    let oldIndex = -1;
    const newUsers = this.state.attendees.filter((item, index) => {
      if (item.uid === uid) oldIndex = index;
      return item.uid !== uid;
    });
    this.state.attendees = newUsers;

    this.emit('remove', oldIndex);
  };

  private registerRtcEvents = () => {
    this.rtcManager.on('userNew', this.onRtcUserNew);
    this.rtcManager.on('userUpdate', this.onRtcUserUpdate);
    this.rtcManager.on('userRemove', this.onRtcUserRemove);
  };
}
