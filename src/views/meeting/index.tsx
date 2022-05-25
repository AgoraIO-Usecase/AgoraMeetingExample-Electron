import React, { useEffect } from 'react';
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
  useMeetingInfo,
  useMeetingManager,
} from '../../hooks';

const MeetingView = () => {
  const navigate = useNavigate();
  const style = useStyle();
  const { meetingInfo } = useMeetingInfo();
  const { meetingManager } = useMeetingManager();

  useEffect(() => {
    if (meetingInfo?.state === MeetingConnectionState.DISCONNECTED)
      navigate('/main');
  }, [meetingInfo?.state]);

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
        <VideoBox />
      </Stack>
      <Stack
        className={style.toolBar}
        width="100%"
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={2}
      >
        <IconButton className={style.toolButton}>
          {meetingInfo?.isCameraOn ? (
            <MicNoneOutlinedIcon color="primary" />
          ) : (
            <MicOffOutlinedIcon color="error" />
          )}
        </IconButton>
        <IconButton className={style.toolButton}>
          {meetingInfo?.isCameraOn ? (
            <VideocamOutlinedIcon color="primary" />
          ) : (
            <VideocamOffOutlinedIcon color="error" />
          )}
        </IconButton>
        <IconButton className={style.toolButton}>
          {meetingInfo?.isCameraOn ? (
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
