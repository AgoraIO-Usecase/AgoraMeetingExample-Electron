import React, { useMemo } from 'react';
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
import AttendeeView from './attendees';
import { useCommonManager, useStore } from '../../hooks';
import useStyle from './style';

const MeetingView = () => {
  const navigate = useNavigate();
  const style = useStyle();
  const { state } = useStore();
  const commonManager = useCommonManager();
  const selfUser = useMemo(() => {
    if (state.attendees && state.attendees.length) return state.attendees[0];

    return { isAudioOn: false, isCameraOn: false, isScreenSharing: false };
  }, [state]);

  const onMicrophoneClicked = () => {
    commonManager.enableAudio(!selfUser.isAudioOn);
  };

  const onCameraClicked = () => {
    commonManager.enableVideo(!selfUser.isCameraOn);
  };

  const onScreenShareClicked = () => {};

  const onLeaveMeetingClicked = () => {
    commonManager.leaveMeeting();

    navigate('/main');
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
      <HeaderBar title={commonManager.getChannelName()} fixed={false} />
      <AttendeeView />
      <Stack
        className={style.toolBar}
        width="100%"
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={2}
      >
        <IconButton className={style.toolButton} onClick={onMicrophoneClicked}>
          {selfUser.isAudioOn ? (
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
