/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-nested-ternary */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Stack,
  Tooltip,
  ButtonGroup,
  IconButton,
  Popper,
  Grow,
  Paper,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
  ClickAwayListener,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined';
import MicOffOutlinedIcon from '@mui/icons-material/MicOffOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import VideocamOffOutlinedIcon from '@mui/icons-material/VideocamOffOutlined';
import ScreenShareOutlinedIcon from '@mui/icons-material/ScreenShareOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import DeveloperBoardOutlinedIcon from '@mui/icons-material/DeveloperBoardOutlined';
import BorderColorOutlinedIcon from '@mui/icons-material/BorderColorOutlined';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import Check from '@mui/icons-material/Check';

import { useNavigate } from 'react-router-dom';
import useStyle from './style';
import {
  ScreenShareState,
  SeaxRole,
  StoreActionType,
  useCommonManager,
  useStore,
  WhiteBoardState,
} from '../../../hooks';
import {
  useFocusHelper,
  useClearFocusMode,
  useSwitchMarkable,
} from '../../../utils/focushelper';

const ToolBar = () => {
  const style = useStyle();
  const navigate = useNavigate();
  const commonManager = useCommonManager();
  const { state, dispatch } = useStore();
  const focusHelper = useFocusHelper();
  const { clearFocusMode } = useClearFocusMode();
  const { switchMarkable } = useSwitchMarkable();
  const selfUser = useMemo(() => {
    if (state.attendees && state.attendees.length) return state.attendees[0];

    return { isAudioOn: false, isCameraOn: false, seaxRole: undefined };
  }, [state]);

  const disableWhiteBoard = useMemo(() => {
    return (
      state.whiteboardState === WhiteBoardState.Running &&
      !commonManager.whiteboardIsSelfCreator()
    );
  }, [state.whiteboardState]);

  const [whiteboardTrackPPTEnabled, setWhiteBoardTrackPPTEnabled] =
    useState(false);
  const whiteboardButtonRef = useRef<HTMLDivElement>(null);
  const [openWhiteBoardDropDown, setOpenWhiteBoardDropDown] = useState(false);
  const showWhiteBoardDropDown = useMemo(
    () =>
      state.screenshareState === ScreenShareState.Running &&
      state.whiteboardState === WhiteBoardState.Running &&
      state.focusMode === true,
    [state.whiteboardState, state.focusMode, state.screenshareState]
  );
  const [enableAudioDump, setEnableAudioDump] = useState(false);

  useEffect(() => {
    if (showWhiteBoardDropDown) return;

    if (openWhiteBoardDropDown) setOpenWhiteBoardDropDown(false);
    if (whiteboardTrackPPTEnabled) {
      commonManager.whiteboardEnableFollowPPT(false);
      setWhiteBoardTrackPPTEnabled(false);
    }
  }, [
    showWhiteBoardDropDown,
    openWhiteBoardDropDown,
    whiteboardTrackPPTEnabled,
  ]);

  const showMarkable = useMemo(() => {
    return state.focusMode && state.whiteboardState === WhiteBoardState.Running;
  }, [state.focusMode, state.whiteboardState]);

  const onMicrophoneClicked = () => {
    commonManager.enableAudio(!selfUser.isAudioOn);
  };

  const onAudioDumpClicked = () => {
    commonManager.enableAudioDump(!enableAudioDump);
    setEnableAudioDump(!enableAudioDump);
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

  const onTrackPowerPointClicked = () => {
    commonManager.whiteboardEnableFollowPPT(!whiteboardTrackPPTEnabled);
    setWhiteBoardTrackPPTEnabled(!whiteboardTrackPPTEnabled);
    setOpenWhiteBoardDropDown(false);
  };

  const onMarkableClicked = () => {
    switchMarkable();
  };

  const onLeaveMeetingClicked = useCallback(() => {
    if (state.focusMode) clearFocusMode();

    commonManager.leaveMeeting();
    navigate('/main');
  }, [state.focusMode]);

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
      {/* Microphone */}
      <Tooltip title={selfUser.isAudioOn ? 'Mute' : 'Unmute'} arrow>
        <LoadingButton
          onClick={onMicrophoneClicked}
          size="small"
          disabled={selfUser.seaxRole === SeaxRole.Client}
        >
          {selfUser.isAudioOn ? (
            <MicNoneOutlinedIcon
              color={selfUser.seaxRole === SeaxRole.Client ? 'gray' : 'primary'}
              fontSize="small"
            />
          ) : (
            <MicOffOutlinedIcon
              color={selfUser.seaxRole === SeaxRole.Client ? 'gray' : 'error'}
              fontSize="small"
            />
          )}
        </LoadingButton>
      </Tooltip>
      {/* AudioDump */}
      <Tooltip title={enableAudioDump ? 'Stop' : 'DumpAudio'} arrow>
        <LoadingButton onClick={onAudioDumpClicked} size="small">
          {enableAudioDump ? (
            <BugReportOutlinedIcon color="error" fontSize="small" />
          ) : (
            <BugReportOutlinedIcon color="primary" fontSize="small" />
          )}
        </LoadingButton>
      </Tooltip>
      {/* Camera */}
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
      {/* ScreenShare */}
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
      {/* WhiteBoard */}

      <ButtonGroup
        variant="outlined"
        ref={whiteboardButtonRef}
        aria-label="split button"
      >
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
        {showWhiteBoardDropDown ? (
          <IconButton
            size="small"
            aria-controls={
              openWhiteBoardDropDown ? 'split-button-menu' : undefined
            }
            aria-expanded={openWhiteBoardDropDown ? 'true' : undefined}
            aria-label="select merge strategy"
            aria-haspopup="menu"
            onClick={() => {
              setOpenWhiteBoardDropDown(!openWhiteBoardDropDown);
            }}
          >
            <ArrowDropDownIcon />
          </IconButton>
        ) : (
          <></>
        )}
      </ButtonGroup>
      <Popper
        style={{ zIndex: '9999' }}
        open={openWhiteBoardDropDown}
        anchorEl={whiteboardButtonRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener
                onClickAway={(event: Event) => {
                  if (
                    whiteboardButtonRef.current &&
                    whiteboardButtonRef.current.contains(
                      event.target as HTMLElement
                    )
                  ) {
                    return;
                  }

                  setOpenWhiteBoardDropDown(false);
                }}
              >
                <MenuList id="split-button-menu" autoFocusItem>
                  <MenuItem onClick={onTrackPowerPointClicked}>
                    {whiteboardTrackPPTEnabled ? (
                      <>
                        <ListItemIcon>
                          <Check />
                        </ListItemIcon>
                        Track PowerPoint
                      </>
                    ) : (
                      <ListItemText inset>Track PowerPoint</ListItemText>
                    )}
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
      {/* Markable */}
      {showMarkable ? (
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
      {/* Leave */}
      <Tooltip title="Leave" arrow>
        <LoadingButton onClick={onLeaveMeetingClicked}>
          <LocalPhoneOutlinedIcon color="error" />
        </LoadingButton>
      </Tooltip>
    </Stack>
  );
};

export default ToolBar;
