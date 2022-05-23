import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined';
import MicOffOutlinedIcon from '@mui/icons-material/MicOffOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import VideocamOffOutlinedIcon from '@mui/icons-material/VideocamOffOutlined';
import ScreenShareOutlinedIcon from '@mui/icons-material/ScreenShareOutlined';
import StopScreenShareOutlinedIcon from '@mui/icons-material/StopScreenShareOutlined';
import PhoneDisabledOutlinedIcon from '@mui/icons-material/PhoneDisabledOutlined';

import HeaderBar from '../components/header';
import useStyle from './style';

const MeetingView = () => {
  const navigate = useNavigate();
  const style = useStyle();

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
        <div />
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
          <MicNoneOutlinedIcon color="primary" />
        </IconButton>
        <IconButton className={style.toolButton}>
          <VideocamOutlinedIcon color="primary" />
        </IconButton>
        <IconButton className={style.toolButton}>
          <ScreenShareOutlinedIcon color="primary" />
        </IconButton>
        <IconButton className={style.toolButton}>
          <PhoneDisabledOutlinedIcon color="error" />
        </IconButton>
      </Stack>
    </Stack>
  );
};

export default MeetingView;
