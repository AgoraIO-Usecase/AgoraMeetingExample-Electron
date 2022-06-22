import { EventEmitter } from 'events';
import log from 'electron-log';
import { RtcManager, RtcUser, RtcUserUpdateReason } from './rtc';
import { AttendeeInfo } from './types';

export interface AttendeeManager {
  on(evt: 'new', cb: (position: number, attendee: AttendeeInfo) => void): this;
  on(
    evt: 'update',
    cb: (position: number, attendee: AttendeeInfo) => void
  ): this;
  on(evt: 'remove', cb: (position: number) => void): this;
  on(
    evt: 'replace',
    cb: (oldPosition: number, newPosition: number) => void
  ): this;
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

  private onRtcUserUpdate = (
    oldUser: RtcUser,
    newUser: RtcUser,
    reason: RtcUserUpdateReason
  ) => {
    log.info(
      'attendee manager on onRtcUserUpdate',
      JSON.stringify(oldUser),
      JSON.stringify(newUser),
      reason
    );

    const index = this.state.attendees.findIndex(
      (item) => item.uid === newUser.uid
    );

    if (index === -1) return;

    const attendee = { ...this.state.attendees[index], ...newUser };
    if (reason === RtcUserUpdateReason.Info || index === 0 || index === 1) {
      this.state.attendees[index] = attendee;
      this.emit('update', index, attendee);
    } else {
      let newIndex = index;
      for (let i = 1; i < this.state.attendees.length; i += 1) {
        if (
          this.getAttendeePriority(attendee) <
          this.getAttendeePriority(this.state.attendees[i])
        ) {
          newIndex = i;
          break;
        }
      }

      if (newIndex === index) {
        this.state.attendees[index] = attendee;
        this.emit('update', index, attendee);
      }

      // eslint-disable-next-line prefer-destructuring
      this.state.attendees[index] = this.state.attendees.splice(
        newIndex,
        1,
        attendee
      )[0];

      this.emit('update', index, attendee);
      this.emit('replace', index, newIndex);
    }
  };

  private onRtcUserRemove = (uid: number) => {
    log.info('attendee manager on onRtcUserRemove', uid);

    let oldIndex = -1;
    const newUsers = this.state.attendees.filter((item, index) => {
      if (item.uid === uid) oldIndex = index;
      return item.uid !== uid;
    });
    this.state.attendees = newUsers;

    if (oldIndex === -1) return;

    this.emit('remove', oldIndex);
  };

  private registerRtcEvents = () => {
    this.rtcManager.on('userNew', this.onRtcUserNew);
    this.rtcManager.on('userUpdate', this.onRtcUserUpdate);
    this.rtcManager.on('userRemove', this.onRtcUserRemove);
  };

  private getAttendeePriority = (attendee: AttendeeInfo) => {
    const { isSelf, isAudioOn, isCameraOn } = attendee;
    if (isSelf) return -9999;

    let priority = 0;
    if (isAudioOn) priority -= 1;
    if (isCameraOn) priority -= 2;

    return priority;
  };
}
