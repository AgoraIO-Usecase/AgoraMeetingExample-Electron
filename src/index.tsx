import React from 'react';
import { render } from 'react-dom';
import App from './App';
import { AttendeeManagerProvider } from './hooks/attendee';
import { CommonManagerProvider } from './hooks/common';
import { EngineProvider } from './hooks/engine';

render(
  <EngineProvider>
    <CommonManagerProvider>
      <AttendeeManagerProvider>
        <App />
      </AttendeeManagerProvider>
    </CommonManagerProvider>
  </EngineProvider>,
  document.getElementById('root')
);
