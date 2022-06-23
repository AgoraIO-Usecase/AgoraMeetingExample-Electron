/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-nested-ternary */
import React, { useCallback, useMemo } from 'react';
import { Stack, Tooltip } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined';
import MicOffOutlinedIcon from '@mui/icons-material/MicOffOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import VideocamOffOutlinedIcon from '@mui/icons-material/VideocamOffOutlined';
import ScreenShareOutlinedIcon from '@mui/icons-material/ScreenShareOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import DeveloperBoardOutlinedIcon from '@mui/icons-material/DeveloperBoardOutlined';
import BorderColorOutlinedIcon from '@mui/icons-material/BorderColorOutlined';
import CropFreeOutlinedIcon from '@mui/icons-material/CropFreeOutlined';

import { useNavigate } from 'react-router-dom';
import useStyle from './style';
import {
  ScreenShareState,
  StoreActionType,
  useCommonManager,
  useStore,
  WhiteBoardState,
} from '../../../hooks';
import {
  useFocusHelper,
  useSwitchFocusMode,
  useSwitchMarkable,
} from '../../../utils/focushelper';

const ToolBar = () => {
  const style = useStyle();
  const navigate = useNavigate();
  const commonManager = useCommonManager();
  const { state, dispatch } = useStore();
  const focusHelper = useFocusHelper();
  const { switchFocusMode } = useSwitchFocusMode();
  const { switchMarkable } = useSwitchMarkable();
  const selfUser = useMemo(() => {
    if (state.attendees && state.attendees.length) return state.attendees[0];

    return { isAudioOn: false, isCameraOn: false, isScreenSharing: false };
  }, [state]);

  const disableWhiteBoard = useMemo(() => {
    return (
      state.whiteboardState === WhiteBoardState.Running &&
      !commonManager.whiteboardIsSelfCreator()
    );
  }, [state.whiteboardState]);

  const onMicrophoneClicked = () => {
    commonManager.enableAudio(!selfUser.isAudioOn);
  };

  const onCameraClicked = () => {
    commonManager.enableVideo(!selfUser.isCameraOn);
  };

  const onScreenShareClicked = () => {
    if (state.screenshareState === ScreenShareState.Idle)
      dispatch({
        type: StoreActionType.ACTION_TYPE_SHOW_SCREENSHARE,
        payload: true,
      });
    else if (state.screenshareState === ScreenShareState.Running)
      commonManager.stopScreenShare();
  };

  const onWhiteBoardClicked = () => {
    if (state.whiteboardState === WhiteBoardState.Idle)
      commonManager.whiteboardStart();
    else if (state.whiteboardState === WhiteBoardState.Running)
      commonManager.whiteboardStop();
  };

  const onMarkableClicked = () => {
    switchMarkable();
  };

  const onLeaveMeetingClicked = useCallback(() => {
    if (state.focusMode) switchFocusMode();

    commonManager.leaveMeeting();
    navigate('/main');
  }, [state.focusMode]);

  const onFocusModeClicked = () => {
    switchFocusMode();
  };

  return (
    <Stack
      className={style.toolBar}
      width="100%"
      direction="row"
      justifyContent="center"
      alignItems="center"
      spacing={2}
      {...focusHelper}
    >
      <Tooltip title={selfUser.isAudioOn ? 'Mute' : 'Unmute'} arrow>
        <LoadingButton onClick={onMicrophoneClicked} size="small">
          {selfUser.isAudioOn ? (
            <MicNoneOutlinedIcon color="primary" fontSize="small" />
          ) : (
            <MicOffOutlinedIcon color="error" fontSize="small" />
          )}
        </LoadingButton>
      </Tooltip>
      <Tooltip
        title={selfUser.isCameraOn ? 'TurnOff Camera' : 'TurnOn Camera'}
        arrow
      >
        <LoadingButton onClick={onCameraClicked}>
          {selfUser.isCameraOn ? (
            <VideocamOutlinedIcon color="primary" />
          ) : (
            <VideocamOffOutlinedIcon color="error" />
          )}
        </LoadingButton>
      </Tooltip>
      <Tooltip
        title={
          state.screenshareState === ScreenShareState.Running
            ? 'Stop ScreenShare'
            : 'Start ScreenShare'
        }
        arrow
      >
        <LoadingButton onClick={onScreenShareClicked}>
          {state.screenshareState === ScreenShareState.Running ? (
            <ScreenShareOutlinedIcon color="success" />
          ) : (
            <ScreenShareOutlinedIcon color="primary" />
          )}
        </LoadingButton>
      </Tooltip>
      <Tooltip
        title={
          state.whiteboardState === WhiteBoardState.Running
            ? 'Stop WhiteBoard'
            : 'Start WhiteBoard'
        }
        arrow
      >
        <LoadingButton
          onClick={onWhiteBoardClicked}
          loading={state.whiteboardState === WhiteBoardState.Waitting}
          loadingPosition="center"
          disabled={disableWhiteBoard}
        >
          {state.whiteboardState !== WhiteBoardState.Waitting ? (
            <DeveloperBoardOutlinedIcon
              color={
                disableWhiteBoard
                  ? 'disabled'
                  : state.whiteboardState === WhiteBoardState.Running
                  ? 'success'
                  : 'primary'
              }
            />
          ) : (
            <></>
          )}
        </LoadingButton>
      </Tooltip>
      {state.focusMode && state.whiteboardState === WhiteBoardState.Running ? (
        <Tooltip
          title={state.markable ? 'Reset Markable' : 'Set Markable'}
          arrow
        >
          <LoadingButton onClick={onMarkableClicked}>
            {state.markable ? (
              <BorderColorOutlinedIcon color="success" />
            ) : (
              <BorderColorOutlinedIcon color="primary" />
            )}
          </LoadingButton>
        </Tooltip>
      ) : (
        <></>
      )}
      <Tooltip title="Leave" arrow>
        <LoadingButton onClick={onLeaveMeetingClicked}>
          <LocalPhoneOutlinedIcon color="error" />
        </LoadingButton>
      </Tooltip>
      {state.focusMode ? (
        <Tooltip arrow title="Exit Focus Mode">
          <LoadingButton onClick={onFocusModeClicked}>
            <CropFreeOutlinedIcon color="success" fontSize="small" />
          </LoadingButton>
        </Tooltip>
      ) : (
        <></>
      )}
    </Stack>
  );
};

export default ToolBar;
