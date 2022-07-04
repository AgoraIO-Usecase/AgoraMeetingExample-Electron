import { EventEmitter } from 'events';
import log from 'electron-log';
import { RtcManager, RtcUserType, RtcUser, RtcUserUpdateReason } from './rtc';
import { AttendeeInfo, AttendeeType } from './types';

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

  private findNewAttendeeIndex = (oldIndex: number, attendee: AttendeeInfo) => {
    // start from 1 coz first attendee always be self
    for (let i = 1; i < this.state.attendees.length; i += 1) {
      if (
        this.getAttendeePriority(attendee) <
        this.getAttendeePriority(this.state.attendees[i])
      ) {
        return i;
      }
    }

    return oldIndex;
  };

  private onRtcUserNew = (user: RtcUser) => {
    log.info('attendee manager on onRtcUserNew', user);
    const oldIndex = this.state.attendees.findIndex(
      (item) => item.uid === user.uid
    );

    if (oldIndex === -1) {
      const attendee = {
        ...user,
      } as AttendeeInfo;
      const newIndex = this.findNewAttendeeIndex(
        this.state.attendees.length,
        attendee
      );

      // eslint-disable-next-line prefer-destructuring
      this.state.attendees.splice(newIndex, 0, attendee);
      this.emit('new', newIndex, attendee);
    } else {
      const attendee = {
        ...this.state.attendees[oldIndex],
        ...user,
      } as AttendeeInfo;
      this.state.attendees[oldIndex] = attendee;
      this.emit('update', oldIndex, attendee);
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

    const oldIndex = this.state.attendees.findIndex(
      (item) => item.uid === newUser.uid
    );

    if (oldIndex === -1) return;

    const attendee = {
      ...this.state.attendees[oldIndex],
      ...newUser,
    } as AttendeeInfo;

    attendee.hasWhiteBoard =
      newUser.whiteboardUUID !== undefined &&
      newUser.whiteboardUUID.length > 0 &&
      newUser.whiteboardTimeSpan !== undefined &&
      newUser.whiteboardTimeSpan.length > 0;

    if (
      reason === RtcUserUpdateReason.Info ||
      oldIndex === 0 ||
      oldIndex === 1
    ) {
      this.state.attendees[oldIndex] = attendee;
      this.emit('update', oldIndex, attendee);
    } else {
      const newIndex = this.findNewAttendeeIndex(oldIndex, attendee);
      if (newIndex === oldIndex) {
        this.state.attendees[oldIndex] = attendee;
        this.emit('update', oldIndex, attendee);
        return;
      }

      // eslint-disable-next-line prefer-destructuring
      this.state.attendees[oldIndex] = this.state.attendees.splice(
        newIndex,
        1,
        attendee
      )[0];

      this.emit('update', oldIndex, attendee);
      this.emit('replace', oldIndex, newIndex);
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
    const { type, isSelf, isAudioOn, isCameraOn, hasWhiteBoard } = attendee;
    if (isSelf && type === AttendeeType.ScreenShare) return -9997;
    if (isSelf && type === AttendeeType.MediaPlayer) return -9998;
    if (isSelf) return -9999;

    let priority = 0;
    if (isAudioOn) priority -= 1;
    if (isCameraOn) priority -= 2;
    if (hasWhiteBoard) priority -= 4;

    return priority;
  };
}
