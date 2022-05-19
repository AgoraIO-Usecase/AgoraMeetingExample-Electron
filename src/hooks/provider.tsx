import React, { FC, useEffect, useState } from 'react';

import AgoraRtcEngine from 'agora-electron-sdk';
import { AttendeeManager, AttendeeManagerContext } from './attendee';
import { CommonManager, CommonManagerContext } from './common';

// eslint-disable-next-line import/prefer-default-export
export const MeetingProvider: FC = (props) => {
  const { children } = props;
  const [rtcEngine, setRtcEngine] = useState<AgoraRtcEngine>();
  const [commonManager, setCommonManager] = useState<CommonManager>();
  const [attendeeManager, setAttendeeManager] = useState<AttendeeManager>();

  useEffect(() => {
    if (!rtcEngine) {
      const engine = new AgoraRtcEngine();
      setRtcEngine(engine);

      console.info('initialize engine...');
    }

    return () => {
      if (rtcEngine) {
        rtcEngine.release();
        setRtcEngine(undefined);

        console.info('release engine...');
      }
    };
  }, []);

  useEffect(() => {
    if (!commonManager && rtcEngine) {
      const manager = new CommonManager();
      setCommonManager(manager);

      console.info('initialize common manager...');
    }

    if (commonManager && !rtcEngine) {
      setCommonManager(undefined);
      console.info('release common manager...');
    }
  }, [rtcEngine]);

  useEffect(() => {
    if (!attendeeManager && rtcEngine) {
      const manager = new AttendeeManager();
      setAttendeeManager(manager);

      console.info('initialize attendee manager...');
    }

    if (attendeeManager && !rtcEngine) {
      setAttendeeManager(undefined);
      console.info('release attendee manager...');
    }
  }, [rtcEngine]);

  useEffect(() => {}, [rtcEngine]);

  return (
    <CommonManagerContext.Provider value={{ commonManager }}>
      <AttendeeManagerContext.Provider value={{ attendeeManager }}>
        {children}
      </AttendeeManagerContext.Provider>
    </CommonManagerContext.Provider>
  );
};
