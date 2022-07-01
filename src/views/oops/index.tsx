/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import { Stack, Typography } from '@mui/material';
import TitleBar from 'frameless-titlebar';
import AllInclusiveOutlinedIcon from '@mui/icons-material/AllInclusiveOutlined';
import { remote, ipcRenderer } from 'electron';

import useStyles from './style';

const currentWindow = remote.getCurrentWindow();

const Oops = () => {
  const style = useStyles();
  const [maximized, setMaximized] = useState(currentWindow.isMaximized());

  // add window listeners for currentWindow
  useEffect(() => {
    const onMaximized = () => setMaximized(true);
    const onRestore = () => setMaximized(false);
    currentWindow.on('maximize', onMaximized);
    currentWindow.on('unmaximize', onRestore);
    currentWindow.on('resized', onRestore);
    return () => {
      currentWindow.removeListener('maximize', onMaximized);
      currentWindow.removeListener('unmaximize', onRestore);
    };
  }, []);

  // used by double click on the titlebar
  // and by the maximize control button
  const handleMaximize = () => {
    if (maximized) {
      currentWindow.restore();
    } else {
      currentWindow.maximize();
    }
  };

  const handleDocsClicked = () => {
    ipcRenderer.send(
      'open-external',
      'https://docs.agora.io/cn/agora-meeting/agora-meeting-run-electron?platform=Electron#4-%E8%8E%B7%E5%8F%96-agora-%E4%BA%92%E5%8A%A8%E7%99%BD%E6%9D%BF%E6%9C%8D%E5%8A%A1%E7%9A%84-app-identifier-%E5%92%8C-sdk-token'
    );
  };

  return (
    <Stack
      className={style.wrapper}
      direction="column"
      justifyContent="center"
      alignItems="center"
    >
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: window.process.platform === 'darwin' ? -60 : 0,
          zIndex: 999,
          boxSizing: 'border-box',
          margin: process.platform === 'win32' ? '4px 4px' : '',
        }}
      >
        <TitleBar
          icon={<AllInclusiveOutlinedIcon color="primary" fontSize="small" />}
          title="Agora Meeting"
          currentWindow={currentWindow} // electron window instance
          platform={window.process.platform as any}
          onMinimize={() => currentWindow.minimize()}
          onMaximize={handleMaximize}
          // when the titlebar is double clicked
          onDoubleClick={handleMaximize}
          onClose={() => currentWindow.close()}
          // hide minimize windows control
          disableMinimize={false}
          // hide maximize windows control
          disableMaximize={false}
          // is the current window maximized?
          maximized={maximized}
          theme={{
            bar: {
              palette: 'light',
              height: window.process.platform === 'darwin' ? 36 : 28,
              // background: '#FFFFFFFF',
              borderBottom: '0px',
              title: {
                fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
                fontWeight: 800,
                color: 'black',
              },
            },
          }}
        />
      </div>
      <Typography variant="h1">Oops</Typography>
      <Typography variant="subtitle1" gutterBottom component="div">
        Please follow{' '}
        <a onClick={handleDocsClicked} href="#">
          docs
        </a>{' '}
        to create your env file
      </Typography>
    </Stack>
  );
};

export default Oops;
