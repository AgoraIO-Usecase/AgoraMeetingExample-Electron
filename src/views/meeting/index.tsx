import React, { useEffect, useMemo } from 'react';
import log from 'electron-log';
import { useNavigate } from 'react-router-dom';
import { Stack } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined';
import MicOffOutlinedIcon from '@mui/icons-material/MicOffOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import VideocamOffOutlinedIcon from '@mui/icons-material/VideocamOffOutlined';
import ScreenShareOutlinedIcon from '@mui/icons-material/ScreenShareOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';

import HeaderBar from '../components/header';
import VideoBox from '../components/video';
import useStyle from './style';
import {
  MeetingConnectionState,
  useMeetingStore,
  useMeetingManager,
} from '../../hooks';

const MeetingView = () => {
  const navigate = useNavigate();
  const style = useStyle();
  const { state } = useMeetingStore();
  const { meetingManager } = useMeetingManager();
  const selfUser = useMemo(() => {
    if (
      state.connectionState === MeetingConnectionState.CONNECTED &&
      !state.users
    )
      throw Error('invalid context');

    return state.users[0];
  }, [state.users, state.connectionState]);

  useEffect(() => {
    log.debug('meeting view state changed:', state);
  }, [state]);

  useEffect(() => {
    if (state.connectionState === MeetingConnectionState.DISCONNECTED)
      navigate('/main');
  }, [state.connectionState]);

  const onMicrophoneClicked = () => {
    meetingManager?.enableAudio(!selfUser.isMicrophoneOn);
  };

  const onCameraClicked = () => {
    meetingManager?.enableVideo(!selfUser.isCameraOn);
  };

  const onScreenShareClicked = () => {};

  const onLeaveMeetingClicked = () => {
    meetingManager?.leaveMeeting();
  };

  return (
    <Stack
      className={style.mainWrapper}
      width="100%"
      height="100%"
      direction="column"
      justifyContent="center"
      alignItems="center"
    >
      <HeaderBar title="AgoraMeeting" fixed={false} layouts />
      <Stack className={style.viewContainer} width="100%" height="100%">
        <VideoBox fit />
      </Stack>
      <Stack
        className={style.toolBar}
        width="100%"
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={2}
      >
        <IconButton className={style.toolButton} onClick={onMicrophoneClicked}>
          {selfUser.isMicrophoneOn ? (
            <MicNoneOutlinedIcon color="primary" />
          ) : (
            <MicOffOutlinedIcon color="error" />
          )}
        </IconButton>
        <IconButton className={style.toolButton} onClick={onCameraClicked}>
          {selfUser.isCameraOn ? (
            <VideocamOutlinedIcon color="primary" />
          ) : (
            <VideocamOffOutlinedIcon color="error" />
          )}
        </IconButton>
        <IconButton className={style.toolButton} onClick={onScreenShareClicked}>
          {selfUser.isScreenSharing ? (
            <ScreenShareOutlinedIcon color="success" />
          ) : (
            <ScreenShareOutlinedIcon color="primary" />
          )}
        </IconButton>
        <IconButton
          className={style.toolButton}
          onClick={onLeaveMeetingClicked}
        >
          <LocalPhoneOutlinedIcon color="error" />
        </IconButton>
      </Stack>
    </Stack>
  );
};

export default MeetingView;
