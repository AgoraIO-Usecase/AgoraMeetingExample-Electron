import React, { FC, useEffect, useMemo, useReducer } from 'react';
import { useSnackbar, VariantType } from 'notistack';
import {
  AttendeeLayoutType,
  StoreActionPayloadDevice,
  StoreActionPayloadFocusMode,
  StoreActionPayloadScreenShare,
  StoreActionType,
  StoreContext,
  StoreReducer,
} from './store';
import {
  CommonManager,
  CommonManagerContext,
  MeetingConnection,
  ScreenShareState,
  ScreenShareStateReason,
  SeaxRole,
  WhiteBoardState,
} from './manager';
import { WhiteBoardError } from './manager/whiteboard';

export const RootProvider: FC = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(StoreReducer, {
    connection: MeetingConnection.Disconnected,
    attendees: [],
    screenshareState: ScreenShareState.Idle,
    screenshareTargetId: 0,
    screenshareIsDisplay: false,
    attendeeLayout: AttendeeLayoutType.Speaker,
    whiteboardState: WhiteBoardState.Idle,
    showScreenShare: false,
    focusMode: false,
    markable: false,
  });
  const commonManager = useMemo(() => new CommonManager(), []);
  const { enqueueSnackbar } = useSnackbar();

  const showNotification = (
    message: string,
    variant: VariantType = 'info',
    isInMeeting = true
  ) => {
    if (
      isInMeeting &&
      (!commonManager.isInMeeting() || commonManager.isDisconnecting())
    )
      return;

    enqueueSnackbar(message, { variant });
  };

  useEffect(() => {
    commonManager.on('connection', (connection, reason) => {
      dispatch({
        type: StoreActionType.ACTION_TYPE_CONNECTION,
        payload: connection,
      });
    });

    commonManager.on('deviceList', (deviceType, currentDeviceId, devices) => {
      const actionPayloadDevice: StoreActionPayloadDevice = {
        type: deviceType,
        currentDeviceId,
        devices,
      };

      dispatch({
        type: StoreActionType.ACTION_TYPE_DEVICE,
        payload: actionPayloadDevice,
      });
    });

    commonManager.on('attendeeNew', (position, attendee) => {
      dispatch({
        type: StoreActionType.ACTION_TYPE_ATTENDEE_NEW,
        payload: {
          position,
          attendees: [attendee],
        },
      });
    });
    commonManager.on('attendeeUpdate', (position, attendee) => {
      dispatch({
        type: StoreActionType.ACTION_TYPE_ATTENDEE_UPDATE,
        payload: {
          position,
          attendees: [attendee],
        },
      });
    });
    commonManager.on('attendeeRemove', (position) => {
      dispatch({
        type: StoreActionType.ACTION_TYPE_ATTENDEE_REMOVE,
        payload: {
          position,
          attendees: [],
        },
      });
    });
    commonManager.on('attendeeReplace', (oldPosition, newPosition) => {
      dispatch({
        type: StoreActionType.ACTION_TYPE_ATTENDEE_REPLACE,
        payload: {
          oldPosition,
          newPosition,
        },
      });
    });
    commonManager.on('screenshareState', (screenshareState, params, reason) => {
      if (screenshareState === ScreenShareState.Running)
        showNotification('screenshare begin', 'success');
      else if (screenshareState === ScreenShareState.Idle)
        showNotification('screenshare finished', 'info');

      dispatch({
        type: StoreActionType.ACTION_TYPE_SCREENSHARE_STATE,
        payload: {
          state: screenshareState,
          isDisplay: params.displayId !== undefined,
          targetId: params.displayId ? params.displayId : params.windowId,
        } as StoreActionPayloadScreenShare,
      });

      if (screenshareState === ScreenShareState.Running && params.focusMode) {
        dispatch({
          type: StoreActionType.ACTION_TYPE_FOCUS_MODE,
          payload: {
            focusMode: true,
            isDisplay: params.displayId !== undefined,
            targetId: params.displayId ? params.displayId : params.windowId,
          } as StoreActionPayloadFocusMode,
        });
      } else if (screenshareState === ScreenShareState.Idle) {
        dispatch({
          type: StoreActionType.ACTION_TYPE_FOCUS_MODE,
          payload: {
            focusMode: false,
            isDisplay: params.displayId !== undefined,
            targetId: params.displayId ? params.displayId : params.windowId,
          } as StoreActionPayloadFocusMode,
        });
      }
    });

    commonManager.on('screenshareError', (reason) => {
      let errorTips = 'error';
      switch (reason) {
        case ScreenShareStateReason.WindowMinimized:
          errorTips = 'window minimized';
          break;
        case ScreenShareStateReason.WindowClosed:
          errorTips = 'window closed';
          break;
        default:
          break;
      }
      showNotification(
        `screenshare error ${errorTips}(code:${reason as number})`,
        'error'
      );
    });

    commonManager.on('whiteboardState', (whiteboardState, error) => {
      let errorTips = '';
      switch (error) {
        case WhiteBoardError.CreateRoom:
          errorTips = 'create room failed';
          break;
        case WhiteBoardError.Exception:
          errorTips = 'exception';
          break;
        default:
          break;
      }

      if (whiteboardState === WhiteBoardState.Running)
        showNotification(
          'whiteboard begin, layout will change to speaker',
          'success'
        );
      else if (whiteboardState === WhiteBoardState.Idle) {
        if (errorTips === '') showNotification('whiteboard finished', 'info');
        else
          showNotification(
            `whiteboard finished with error ${errorTips}`,
            'error'
          );
      }

      dispatch({
        type: StoreActionType.ACTION_TYPE_WHITEBOARD_STATE,
        payload: whiteboardState,
      });
    });

    commonManager.on('seaxError', (uid, code) => {
      showNotification(`seax error ${uid} code: ${code}`, 'error');
    });
    commonManager.on('seaxState', (msg) => {
      // showNotification(`seax state: ${msg}`, 'info');
    });
    commonManager.on('seaxLocalRoleConfirmed', (role) => {
      showNotification(
        `seax role confirmed with ${role === SeaxRole.Host ? 'host' : 'clien'}`,
        'success'
      );
    });

    commonManager.initialize();

    return () => commonManager.release();
  }, []);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      <CommonManagerContext.Provider value={commonManager}>
        {children}
      </CommonManagerContext.Provider>
    </StoreContext.Provider>
  );
};

export default {};
