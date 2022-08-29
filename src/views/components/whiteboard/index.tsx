/* eslint-disable react/display-name */
import React, { useEffect, useMemo, memo } from 'react';
import { ipcRenderer, Rectangle } from 'electron';
import { Stack } from '@mui/material';
import { WindowMonitorEventType } from 'agora-plugin';

import {
  AttendeeInfo,
  AttendeeType,
  useCommonManager,
  useStore,
} from '../../../hooks';
import useStyle from './style';
import VideoBox from '../videobox';

const WhiteBoardView = memo((props: { attendee: AttendeeInfo | undefined }) => {
  const style = useStyle();
  const { state } = useStore();
  const commonManager = useCommonManager();
  const { attendee } = props;

  const showVideoBox = useMemo(
    () =>
      attendee &&
      !attendee.isSelf &&
      attendee.shareId !== 0 &&
      attendee.isSharingFocusMode,
    [attendee]
  );

  useEffect(() => {
    const dom = document.getElementById('whiteboard-view');
    commonManager.whiteboardSetView(dom! as HTMLDivElement);

    return () => commonManager.whiteboardSetView(null);
  }, []);

  useEffect(() => {
    ipcRenderer.on(
      'window-monitor',
      (evt, ...args: [event: WindowMonitorEventType, bounds: Rectangle]) => {
        const dom = document.getElementById('whiteboard-view');
        const event: WindowMonitorEventType = args[0] as WindowMonitorEventType;
        const bounds: Rectangle = args[1] as Rectangle;
        if (
          dom &&
          (event === WindowMonitorEventType.Moving ||
            event === WindowMonitorEventType.Moved ||
            event === WindowMonitorEventType.Resized)
        ) {
          dom.style.left = `${bounds.x}px`;
          dom.style.top = `${bounds.y}px`;
          dom.style.width = `${bounds.width}px`;
          dom.style.height = `${bounds.height}px`;

          console.warn('whitebaord view move to', event, bounds);
        }
      }
    );
  }, []);

  return (
    <Stack className={style.wrapper}>
      {showVideoBox ? (
        <VideoBox
          uid={attendee?.shareId}
          isSelf={false}
          isMain
          isFit
          type={AttendeeType.ScreenShare}
        />
      ) : (
        <></>
      )}
      <Stack
        className={`${
          state.focusMode ? style.whiteboardFocused : style.whiteboard
        } ${
          state.focusMode && !state.screenshareIsDisplay
            ? 'meetingwrapper-focus-mode'
            : ''
        }`}
        id="whiteboard-view"
      />
    </Stack>
  );
});

export default WhiteBoardView;
