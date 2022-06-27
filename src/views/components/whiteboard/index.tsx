import React, { useEffect, useMemo } from 'react';
import { Stack } from '@mui/material';

import { AttendeeInfo, useCommonManager } from '../../../hooks';
import useStyle from './style';
import VideoBox from '../videobox';

const WhiteBoardView = (props: { attendee: AttendeeInfo | undefined }) => {
  const style = useStyle();
  const commonManager = useCommonManager();
  const { attendee } = props;

  const showVideoBox = useMemo(
    () =>
      attendee &&
      !attendee.isSelf &&
      attendee.shareId !== 0 &&
      attendee.isSharingDisplay &&
      attendee.isSharingFocusMode,
    [attendee]
  );

  useEffect(() => {
    const dom = document.getElementById('whiteboard-view');
    commonManager.whiteboardSetView(dom! as HTMLDivElement);

    return () => commonManager.whiteboardSetView(null);
  }, []);

  useEffect(() => {
    if (showVideoBox) {
    }
  }, [attendee, showVideoBox]);

  return (
    <Stack className={style.wrapper}>
      {showVideoBox ? (
        <VideoBox uid={attendee?.shareId} isSelf={false} isMain isFit />
      ) : (
        <></>
      )}
      <Stack className={style.wrapper} id="whiteboard-view" />
    </Stack>
  );
};

export default WhiteBoardView;
