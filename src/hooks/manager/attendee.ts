import { EventEmitter } from 'events';
import log from 'electron-log';
import { RtcManager, RtcUser, RtcUserUpdateReason } from './rtc';
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
  on(evt: 'main', cb: (attendee: AttendeeInfo | undefined) => void): this;
}

export class AttendeeManager extends EventEmitter {
  private rtcManager!: RtcManager;

  private state: {
    isInitialized: boolean;
    mainAttendeeDetermined: boolean;
    mainAttendee: AttendeeInfo | undefined;
    attendees: AttendeeInfo[];
  } = {
    isInitialized: false,
    mainAttendeeDetermined: false,
    mainAttendee: undefined,
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
    this.state.mainAttendeeDetermined = false;
    this.state.mainAttendee = undefined;
    this.state.attendees = [];
  };

  isInitialized = () => {
    return this.state.isInitialized;
  };

  setMainAttendee = (attendee: AttendeeInfo) => {
    this.state.mainAttendeeDetermined = true;
    this.determineMainAttendee(attendee);
  };

  private determineMainAttendee = (attendee: AttendeeInfo) => {
    console.warn('determineMainAttendee', attendee);
    this.state.mainAttendee = attendee;
    this.emit('main', attendee);
  };

  private determineMainAttendeeByUpdate = (attendee: AttendeeInfo) => {
    const { attendees, mainAttendee, mainAttendeeDetermined } = this.state;
    if (
      !mainAttendee ||
      (mainAttendeeDetermined && mainAttendee.uid !== attendee.uid)
    )
      return;

    let newAttendee: AttendeeInfo | undefined;

    if (mainAttendeeDetermined && mainAttendee.uid === attendee.uid)
      newAttendee = attendee;
    else if (mainAttendee.uid === attendee.uid) {
      // if camera is disabled need to find a new main attendee
      if (!attendee.isCameraOn) {
        this.determineMainAttendeeByRemove(attendee.uid);
        return;
      }
      // info or other media status changed
      newAttendee = attendee;
    } else if (
      (mainAttendee.isSelf && attendee.isCameraOn) ||
      (!attendee.isSelf &&
        this.getAttendeePriority(attendee) <
          this.getAttendeePriority(mainAttendee))
    ) {
      newAttendee = attendee;
      console.warn('determineMainAttendeeByUpdate find new main attendee');
    } else return;

    console.warn('determineMainAttendeeByUpdate', attendee, newAttendee);

    this.determineMainAttendee(newAttendee || attendees[0]);
  };

  private determineMainAttendeeByRemove = (uid: number) => {
    const { attendees, mainAttendee } = this.state;
    if (!mainAttendee || uid !== mainAttendee.uid) return;

    this.state.mainAttendeeDetermined = false;

    let newAttendee: AttendeeInfo | undefined;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < attendees.length; i++) {
      const attendee = attendees[i];
      if (!attendee.isSelf && attendee.isCameraOn) {
        newAttendee = attendee;
        break;
      }

      // no media user
      if (!attendee.isSelf && !attendee.isCameraOn && !attendee.isAudioOn)
        break;
    }

    console.warn('determineMainAttendeeByRemove', newAttendee);

    // if no media user found set local to main attendee
    this.determineMainAttendee(newAttendee || attendees[0]);
  };

  private findNewAttendeeIndex = (
    oldIndex: number,
    oldPriority: number,
    newPriority: number
  ) => {
    if (oldPriority === newPriority) return oldIndex;
    // start from 1 coz first attendee always be self
    for (
      let index = newPriority < oldPriority ? 1 : oldIndex;
      index < this.state.attendees.length;
      index += 1
    ) {
      if (
        newPriority <= this.getAttendeePriority(this.state.attendees[index])
      ) {
        // if new priority is not bigger than priority of next attendee
        // no need to change position
        if (index === oldIndex + 1) return oldIndex;
        return index;
      }
    }

    return this.state.attendees.length - 1;
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
      let newIndex = this.state.attendees.length;

      if (attendee.isSelf && attendee.type === AttendeeType.ScreenShare)
        newIndex = 1;

      // eslint-disable-next-line prefer-destructuring
      this.state.attendees.splice(newIndex, 0, attendee);
      this.emit('new', newIndex, attendee);

      if (newIndex === 0) this.determineMainAttendee(attendee);
    } else {
      const attendee = {
        ...this.state.attendees[oldIndex],
        ...user,
      } as AttendeeInfo;
      this.state.attendees[oldIndex] = attendee;
      this.triggerUpdate(oldIndex, attendee);
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

    if (reason === RtcUserUpdateReason.Info || attendee.isSelf) {
      this.state.attendees[oldIndex] = attendee;
      this.triggerUpdate(oldIndex, attendee);
    } else {
      const newIndex = this.findNewAttendeeIndex(
        oldIndex,
        this.getAttendeePriority(this.state.attendees[oldIndex]),
        this.getAttendeePriority(attendee)
      );

      if (newIndex === oldIndex) {
        this.state.attendees[oldIndex] = attendee;
        this.triggerUpdate(oldIndex, attendee);
        return;
      }

      // eslint-disable-next-line prefer-destructuring
      this.state.attendees[oldIndex] = this.state.attendees.splice(
        newIndex,
        1,
        attendee
      )[0];

      this.triggerUpdate(oldIndex, attendee);
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

    this.determineMainAttendeeByRemove(uid);
  };

  private registerRtcEvents = () => {
    this.rtcManager.on('userNew', this.onRtcUserNew);
    this.rtcManager.on('userUpdate', this.onRtcUserUpdate);
    this.rtcManager.on('userRemove', this.onRtcUserRemove);
  };

  private getAttendeePriority = (attendee: AttendeeInfo) => {
    const { type, isSelf, isAudioOn, isCameraOn, hasWhiteBoard, isSpeaking } =
      attendee;
    if (isSelf && type === AttendeeType.ScreenShare) return -9997;
    if (isSelf && type === AttendeeType.MediaPlayer) return -9998;
    if (isSelf) return -9999;

    let priority = 0;
    if (isAudioOn) priority -= 2;
    if (isCameraOn && type === AttendeeType.Media) priority -= 4;
    if (isCameraOn && type === AttendeeType.ScreenShare) priority -= 8;
    if (isSpeaking) priority -= 16;
    if (hasWhiteBoard) priority -= 200;

    return priority;
  };

  private triggerUpdate = (oldIndex: number, attendee: AttendeeInfo) => {
    this.emit('update', oldIndex, attendee);

    this.determineMainAttendeeByUpdate(attendee);
  };
}
