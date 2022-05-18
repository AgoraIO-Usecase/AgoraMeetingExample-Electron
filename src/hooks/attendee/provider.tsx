import React, { FC, useEffect, useState } from 'react';
import { AttendeeManagerContext } from './context';
import { AttendeeManager } from './types';

// eslint-disable-next-line import/prefer-default-export
export const AttendeeManagerProvider: FC = (props) => {
  const [manager, setManager] = useState<AttendeeManager>();
  const { children } = props;

  useEffect(() => {
    if (!manager) {
      const attendeeManager = new AttendeeManager();

      console.info('initialize attendee manager', attendeeManager);

      setManager(attendeeManager);
    }
  }, []);

  return (
    <AttendeeManagerContext.Provider value={{ attendeeManager: manager }}>
      {children}
    </AttendeeManagerContext.Provider>
  );
};
