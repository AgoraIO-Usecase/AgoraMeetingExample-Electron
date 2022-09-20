/* eslint-disable react/display-name */
import React, { useEffect, useMemo, memo } from 'react';
import { ipcRenderer, Rectangle, remote } from 'electron';
import { Stack } from '@mui/material';
// import AgoraPlugin, { WindowMonitorEventType } from 'agora-plugin';

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

    console.warn('current whiteboard attendee ', attendee);

    return () => commonManager.whiteboardSetView(null);
  }, []);

  // useEffect(() => {
  //   const { screenshareIsDisplay, screenshareTargetId, focusMode } = state;
  //   const dom = document.getElementById('whiteboard-view');

  //   if (dom && focusMode && !screenshareIsDisplay) {
  //     const rect = AgoraPlugin.getWindowRect(screenshareTargetId);
  //     const offsetBounds = remote.getCurrentWindow().getBounds();
  //     const width = rect.right - rect.left;
  //     const height = rect.bottom - rect.top;
  //     dom.style.width = `${width}px`;
  //     dom.style.height = `${height}px`;
  //     dom.style.left = `${rect.left - offsetBounds.x}px`;
  //     dom.style.top = `${rect.top - offsetBounds.y}px`;

  //     commonManager.whiteboardUpdateRatio(height / width);

  //     ipcRenderer.on(
  //       'window-monitor',
  //       (evt, ...args: [event: WindowMonitorEventType, bounds: Rectangle]) => {
  //         const event: WindowMonitorEventType =
  //           args[0] as WindowMonitorEventType;
  //         const bounds: Rectangle = args[1] as Rectangle;
  //         if (
  //           event === WindowMonitorEventType.Moving ||
  //           event === WindowMonitorEventType.Moved ||
  //           event === WindowMonitorEventType.Resized
  //         ) {
  //           dom.style.left = `${bounds.x}px`;
  //           dom.style.top = `${bounds.y}px`;
  //           dom.style.width = `${bounds.width}px`;
  //           dom.style.height = `${bounds.height}px`;
  //           commonManager.whiteboardUpdateRatio(bounds.height / bounds.width);
  //         }
  //       }
  //     );
  //   }

  //   return () => {
  //     ipcRenderer.removeAllListeners('window-monitor');
  //     if (dom) {
  //       dom.style.left = '';
  //       dom.style.top = '';
  //       dom.style.width = '';
  //       dom.style.height = '';
  //     }
  //   };
  // }, [state]);

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
