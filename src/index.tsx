import React from 'react';
import { render } from 'react-dom';
import { MeetingProvider } from './hooks';

import App from './App';

render(
  <MeetingProvider>
    <App />
  </MeetingProvider>,
  document.getElementById('root')
);
