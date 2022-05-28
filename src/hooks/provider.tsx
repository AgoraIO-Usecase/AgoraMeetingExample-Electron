import React, { FC, useEffect, useMemo, useReducer } from 'react';
import {
  StoreActionType,
  StoreContext,
  StoreReducer,
  StoreState,
} from './store';
import { CommonManager, CommonManagerContext, DeviceType } from './manager';

export const RootProvider: FC = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(StoreReducer, {});
  const commonManager = useMemo(() => new CommonManager(), []);

  useEffect(() => {
    commonManager.on('connection', (connection, reason) => {
      dispatch({
        type: StoreActionType.ACTION_TYPE_CONNECTION,
        payload: connection,
      });
    });
    commonManager.on('deviceList', (deviceType, currentDeviceId, devices) => {
      const newState: StoreState = {};
      switch (deviceType) {
        case DeviceType.Camera:
          newState.cameras = devices;
          newState.currentCameraId = currentDeviceId;
          break;
        case DeviceType.Speaker:
          newState.speakers = devices;
          newState.currentSpeakerId = currentDeviceId;
          break;
        case DeviceType.Microphone:
          newState.microphones = devices;
          newState.currentMicrophoneId = currentDeviceId;
          break;
        default:
          break;
      }
      dispatch({
        type: StoreActionType.ACTION_TYPE_INFO,
        payload: newState,
      });
    });
    commonManager.on('attendeeNew', (position, attendee) => {
      const attendees = state.attendees || [];
      attendees.splice(position, 1, attendee);
      dispatch({
        type: StoreActionType.ACTION_TYPE_INFO,
        payload: { attendees },
      });
    });
    commonManager.on('attendeeUpdate', (position, attendee) => {
      const attendees = state.attendees || [];
      attendees[position] = { ...attendees[position], ...attendee };

      dispatch({
        type: StoreActionType.ACTION_TYPE_INFO,
        payload: { attendees },
      });
    });
    commonManager.on('attendeeRemove', (position) => {
      const attendees = state.attendees || [];
      attendees.splice(position, 1);

      dispatch({
        type: StoreActionType.ACTION_TYPE_INFO,
        payload: { attendees },
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
