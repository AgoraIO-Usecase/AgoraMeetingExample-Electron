import React, { useEffect, useMemo } from 'react';
import { Stack } from '@mui/material';

import { AttendeeInfo, useCommonManager } from '../../../hooks';
import useStyle from './style';
import VideoBox from '../videobox';

const WhiteBoardView = (props: { attendee: AttendeeInfo | undefined }) => {
  const style = useStyle();
  const commonManager = useCommonManager();
  const { attendee } = props;

  useEffect(() => {
    const dom = document.getElementById('whiteboard-view');
    commonManager.whiteboardSetView(dom! as HTMLDivElement);

    return () => commonManager.whiteboardSetView(null);
  }, []);

  return (
    <Stack className={style.wrapper}>
      {attendee && !attendee.isSelf && attendee.shareId !== 0 ? (
        <VideoBox
          uid={attendee.shareId}
          isSelf={attendee.isSelf || false}
          isMain
          isFit
        />
      ) : (
        <></>
      )}
      <Stack className={style.wrapper} id="whiteboard-view" />
    </Stack>
  );
};

export default WhiteBoardView;
