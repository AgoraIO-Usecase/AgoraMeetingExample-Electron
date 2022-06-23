/* eslint-disable no-nested-ternary */
import React from 'react';
import { Stack, Tooltip } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined';
import MicOffOutlinedIcon from '@mui/icons-material/MicOffOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import VideocamOffOutlinedIcon from '@mui/icons-material/VideocamOffOutlined';
import ScreenShareOutlinedIcon from '@mui/icons-material/ScreenShareOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import DeveloperBoardOutlinedIcon from '@mui/icons-material/DeveloperBoardOutlined';

import useStyle from './style';
import { ScreenShareState, WhiteBoardState } from '../../../hooks';

export declare type ToolBarProps = {
  isAudioOn: boolean;
  isCamerOn: boolean;
  screenshareState: ScreenShareState;
  whiteboardState: WhiteBoardState;
  disableWhiteBoard: boolean;

  onMicrophoneClicked: () => void;
  onCameraClicked: () => void;
  onScreenShareClicked: () => void;
  onWhiteBoardClicked: () => void;
  onLeaveMeetingClicked: () => void;
};

const ToolBar = (props: ToolBarProps) => {
  const {
    isAudioOn,
    isCamerOn,
    screenshareState,
    whiteboardState,
    disableWhiteBoard,
    onMicrophoneClicked,
    onCameraClicked,
    onScreenShareClicked,
    onWhiteBoardClicked,
    onLeaveMeetingClicked,
  } = props;
  const style = useStyle();
  return (
    <Stack
      className={style.toolBar}
      width="100%"
      direction="row"
      justifyContent="center"
      alignItems="center"
      spacing={2}
    >
      <Tooltip title={isAudioOn ? 'Mute' : 'Unmute'} arrow>
        <LoadingButton onClick={onMicrophoneClicked}>
          {isAudioOn ? (
            <MicNoneOutlinedIcon color="primary" />
          ) : (
            <MicOffOutlinedIcon color="error" />
          )}
        </LoadingButton>
      </Tooltip>
      <Tooltip title={isCamerOn ? 'TurnOff Camera' : 'TurnOn Camera'} arrow>
        <LoadingButton onClick={onCameraClicked}>
          {isCamerOn ? (
            <VideocamOutlinedIcon color="primary" />
          ) : (
            <VideocamOffOutlinedIcon color="error" />
          )}
        </LoadingButton>
      </Tooltip>
      <Tooltip
        title={
          screenshareState === ScreenShareState.Running
            ? 'Stop ScreenShare'
            : 'Start ScreenShare'
        }
        arrow
      >
        <LoadingButton onClick={onScreenShareClicked}>
          {screenshareState === ScreenShareState.Running ? (
            <ScreenShareOutlinedIcon color="success" />
          ) : (
            <ScreenShareOutlinedIcon color="primary" />
          )}
        </LoadingButton>
      </Tooltip>
      <Tooltip
        title={
          whiteboardState === WhiteBoardState.Running
            ? 'Stop WhiteBoard'
            : 'Start WhiteBoard'
        }
        arrow
      >
        <LoadingButton
          onClick={onWhiteBoardClicked}
          loading={whiteboardState === WhiteBoardState.Waitting}
          loadingPosition="center"
          disabled={disableWhiteBoard}
        >
          {whiteboardState !== WhiteBoardState.Waitting ? (
            <DeveloperBoardOutlinedIcon
              color={
                disableWhiteBoard
                  ? 'disabled'
                  : whiteboardState === WhiteBoardState.Running
                  ? 'success'
                  : 'primary'
              }
            />
          ) : (
            <></>
          )}
        </LoadingButton>
      </Tooltip>
      <Tooltip title="Leave" arrow>
        <LoadingButton onClick={onLeaveMeetingClicked}>
          <LocalPhoneOutlinedIcon color="error" />
        </LoadingButton>
      </Tooltip>
    </Stack>
  );
};

export default ToolBar;
