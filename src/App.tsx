import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { MeetingProvider } from './hooks';
import MainView from './views/main';
import MeetingView from './views/meeting';

import './utils/logtransports';

const App = () => {
  return (
    <MeetingProvider>
      <HashRouter>
        <Routes>
          <Route path="/*" element={<MainView />} />
          <Route path="meeting" element={<MeetingView />} />
        </Routes>
      </HashRouter>
    </MeetingProvider>
  );
};

export default App;
