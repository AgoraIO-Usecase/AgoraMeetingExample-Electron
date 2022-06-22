import React, { FC, useEffect, useMemo, useReducer } from 'react';
import { useSnackbar, VariantType } from 'notistack';
import {
  AttendeeLayoutType,
  StoreActionPayloadDevice,
  StoreActionType,
  StoreContext,
  StoreReducer,
} from './store';
import {
  CommonManager,
  CommonManagerContext,
  MeetingConnection,
  ScreenShareState,
  WhiteBoardState,
} from './manager';

export const RootProvider: FC = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(StoreReducer, {
    connection: MeetingConnection.Disconnected,
    attendees: [],
    screenshareState: ScreenShareState.Idle,
    attendeeLayout: AttendeeLayoutType.Speaker,
    whiteboardState: WhiteBoardState.Idle,
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
    commonManager.on('screenshareState', (screenshareState, reason) => {
      if (screenshareState === ScreenShareState.Running)
        showNotification('screenshare begin', 'success');
      else if (screenshareState === ScreenShareState.Idle)
        showNotification('screenshare finished', 'info');

      dispatch({
        type: StoreActionType.ACTION_TYPE_SCREENSHARE_STATE,
        payload: screenshareState,
      });
    });
    commonManager.on('whiteboardState', (whiteboardState) => {
      if (whiteboardState === WhiteBoardState.Running)
        showNotification(
          'whiteboard begin, layout will change to speaker',
          'success'
        );
      else if (whiteboardState === WhiteBoardState.Idle)
        showNotification('whiteboard finished', 'info');

      if (whiteboardState === WhiteBoardState.Running)
        dispatch({
          type: StoreActionType.ACTION_TYPE_ATTENDEE_LAYOUT,
          payload: AttendeeLayoutType.Speaker,
        });

      dispatch({
        type: StoreActionType.ACTION_TYPE_WHITEBOARD_STATE,
        payload: whiteboardState,
      });
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
