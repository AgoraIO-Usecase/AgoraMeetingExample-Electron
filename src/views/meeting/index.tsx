import React from 'react';
import { Stack } from '@mui/material';

import HeaderBar from '../components/header';
import AttendeeView from './attendees';
import ToolBar, { DraggableToolbar } from './toolbar';
import ScreenShareDialog from './screenshare';
import { useCommonManager, useStore, WhiteBoardState } from '../../hooks';
import useStyle from './style';

const MeetingView = () => {
  const style = useStyle();
  const { state } = useStore();
  const commonManager = useCommonManager();

  return (
    <Stack
      className={`${
        state.focusMode ? style.focusedMainWrapper : style.mainWrapper
      }  ${state.focusMode ? 'meetingwrapper-focus-mode' : ''} ${
        process.platform === 'win32' && !state.focusMode
          ? style.mainWrapperShadow
          : ''
      }`}
      direction="column"
      justifyContent="center"
      alignItems="center"
    >
      {state.focusMode ? (
        <></>
      ) : (
        <HeaderBar
          title={commonManager.getChannelName()}
          layouts={state.whiteboardState === WhiteBoardState.Idle}
          focus
        />
      )}
      <AttendeeView />
      {state.focusMode ? <DraggableToolbar /> : <ToolBar />}
      <ScreenShareDialog />
    </Stack>
  );
};

export default MeetingView;
