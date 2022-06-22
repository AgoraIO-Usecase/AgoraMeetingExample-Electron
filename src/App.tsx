import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Grow } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import MainView from './views/main';
import MeetingView from './views/meeting';

import './utils/logtransports';
import { RootProvider } from './hooks';

const App = () => {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
      TransitionComponent={Grow}
      autoHideDuration={3000}
    >
      <RootProvider>
        <HashRouter>
          <Routes>
            <Route path="/*" element={<MainView />} />
            <Route path="meeting" element={<MeetingView />} />
          </Routes>
        </HashRouter>
      </RootProvider>
    </SnackbarProvider>
  );
};

export default App;
