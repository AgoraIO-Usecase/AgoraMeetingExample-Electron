import React, { useEffect } from 'react';
import { useAttendeeManager } from './hooks/attendee';
import { useCommonManager } from './hooks/common';

const App = () => {
  const { commonManager } = useCommonManager();
  const { attendeeManager } = useAttendeeManager();

  useEffect(() => {
    console.info('commonManager:', commonManager);
    if (commonManager) commonManager.trace();
  }, [commonManager]);

  useEffect(() => {
    console.info('attendeeManager:', attendeeManager);
    if (attendeeManager) attendeeManager.trace();
  }, [attendeeManager]);

  return (
    <div>
      <p>Hello</p>
    </div>
  );
};

export default App;
