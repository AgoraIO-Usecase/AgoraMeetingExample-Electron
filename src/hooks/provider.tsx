/* eslint-disable import/prefer-default-export */
import React, { FC, useEffect, useState, useReducer } from 'react';

import AgoraRtcEngine from 'agora-electron-sdk';
import log from 'electron-log';

import { AttendeeManager, AttendeeManagerContext } from './attendee';
import { MeetingInfoDispatcher, MeetingInfoContext } from './info';
import { MeetingManager, MeetingManagerContext } from './manager';
import { MeetingInfo } from './types';

const MeetingInfoReducer = (
  info: MeetingInfo,
  action: MeetingInfoDispatcher
): MeetingInfo => {
  log.info('meeting info dispatch:', action);
  return info;
};

export const MeetingProvider: FC = (props) => {
  const { children } = props;
  const [rtcEngine, setRtcEngine] = useState<AgoraRtcEngine>();
  const [meetingManager, setMeetingManager] = useState<MeetingManager>();
  const [attendeeManager, setAttendeeManager] = useState<AttendeeManager>();
  const [info, infoDispatcher] = useReducer(MeetingInfoReducer, {});

  useEffect(() => {
    if (!rtcEngine) {
      const engine = new AgoraRtcEngine();
      setRtcEngine(engine);

      log.info('initialize engine...');
    }

    return () => {
      if (rtcEngine) {
        rtcEngine.release();
        setRtcEngine(undefined);

        log.info('release engine...');
      }
    };
  }, []);

  useEffect(() => {
    if (!meetingManager && rtcEngine) {
      const manager = new MeetingManager(rtcEngine);
      setMeetingManager(manager);

      log.info('initialize meeting manager...');
    }

    if (meetingManager && !rtcEngine) {
      setMeetingManager(undefined);
      log.info('release meeting manager...');
    }
  }, [rtcEngine]);

  useEffect(() => {
    if (!attendeeManager && rtcEngine) {
      const manager = new AttendeeManager(rtcEngine);
      setAttendeeManager(manager);

      log.info('initialize attendee manager...');
    }

    if (attendeeManager && !rtcEngine) {
      setAttendeeManager(undefined);
      log.info('release attendee manager...');
    }
  }, [rtcEngine]);

  return (
    <MeetingInfoContext.Provider
      value={{ meetingInfo: info, meetingInfoDispatcher: infoDispatcher }}
    >
      <MeetingManagerContext.Provider
        value={{
          meetingManager,
        }}
      >
        <AttendeeManagerContext.Provider value={{ attendeeManager }}>
          {children}
        </AttendeeManagerContext.Provider>
      </MeetingManagerContext.Provider>
    </MeetingInfoContext.Provider>
  );
};
