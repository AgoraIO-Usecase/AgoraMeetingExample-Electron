import React, { useEffect } from 'react';
import log from 'electron-log';

import { useAttendeeManager } from './hooks/attendee';
import { useCommonManager } from './hooks/common';

const App = () => {
  const { commonManager } = useCommonManager();
  const { attendeeManager } = useAttendeeManager();

  useEffect(() => {
    log.info('commonManager:', typeof commonManager);
    if (commonManager) commonManager.trace();
  }, [commonManager]);

  useEffect(() => {
    log.info('attendeeManager:', typeof attendeeManager);
    if (attendeeManager) attendeeManager.trace();
  }, [attendeeManager]);

  return (
    <div>
      <p>Hello</p>
    </div>
  );
};

export default App;
