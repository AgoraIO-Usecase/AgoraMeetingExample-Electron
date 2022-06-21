import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack, Tooltip } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined';
import MicOffOutlinedIcon from '@mui/icons-material/MicOffOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import VideocamOffOutlinedIcon from '@mui/icons-material/VideocamOffOutlined';
import ScreenShareOutlinedIcon from '@mui/icons-material/ScreenShareOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import DeveloperBoardOutlinedIcon from '@mui/icons-material/DeveloperBoardOutlined';

import HeaderBar from '../components/header';
import AttendeeView from './attendees';
import ToolBar from './toolbar';
import ScreenShareDialog from './screenshare';
import {
  ScreenShareState,
  useCommonManager,
  useStore,
  WhiteBoardState,
} from '../../hooks';
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
  const [openScreenShareDialog, setOpenScreenShareDialog] = useState(false);

  const onMicrophoneClicked = () => {
    commonManager.enableAudio(!selfUser.isAudioOn);
  };

  const onCameraClicked = () => {
    commonManager.enableVideo(!selfUser.isCameraOn);
  };

  const onScreenShareClicked = () => {
    if (state.screenshareState === ScreenShareState.Idle)
      setOpenScreenShareDialog(true);
    else if (state.screenshareState === ScreenShareState.Running)
      commonManager.stopScreenShare();
  };

  const onWhiteBoardClicked = () => {
    if (state.whiteboardState === WhiteBoardState.Idle)
      commonManager.whiteboardStart(
        document.getElementById('root')! as HTMLDivElement
      );
    else if (state.whiteboardState === WhiteBoardState.Running)
      commonManager.whiteboardStop();
  };

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
      <HeaderBar title={commonManager.getChannelName()} fixed={false} layouts />
      <AttendeeView />
      <ToolBar
        isAudioOn={selfUser.isAudioOn || false}
        isCamerOn={selfUser.isCameraOn || false}
        screenshareState={state.screenshareState}
        whiteboardState={state.whiteboardState}
        onMicrophoneClicked={onMicrophoneClicked}
        onCameraClicked={onCameraClicked}
        onScreenShareClicked={onScreenShareClicked}
        onWhiteBoardClicked={onWhiteBoardClicked}
        onLeaveMeetingClicked={onLeaveMeetingClicked}
      />
      <ScreenShareDialog
        open={openScreenShareDialog}
        onClose={() => setOpenScreenShareDialog(false)}
      />
    </Stack>
  );
};

export default MeetingView;
