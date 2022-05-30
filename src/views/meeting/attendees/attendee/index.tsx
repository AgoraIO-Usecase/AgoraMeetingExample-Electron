import React, { useEffect, useMemo } from 'react';
import { Stack, Typography } from '@mui/material';

import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import { AttendeeInfo, useCommonManager } from '../../../../hooks';
import useStyle from './style';

export declare type VideoBoxProps = {
  uid?: number | undefined;
  isSelf: boolean;
  fit?: boolean;
};

const VideoBox = (props: VideoBoxProps) => {
  const style = useStyle();
  const { uid, isSelf, fit } = props;
  const commonManager = useCommonManager();
  const domId = useMemo(() => {
    return uid === undefined ? 'videobox-local' : `videobox-${uid as number}`;
  }, [uid]);

  useEffect(() => {
    const dom = document.getElementById(domId);
    if (isSelf) {
      commonManager.setupLocalVideoRenderer(dom!, fit === true);
    } else {
      commonManager.setupRemoteVideoRenderer(uid!, dom!, fit === true);
    }
  }, []);

  return <div className={style.videobox} id={domId} />;
};

export type AttendeeViewProps = {
  isMain: boolean;
  attendee: AttendeeInfo;
};

const AttendeeItem = (props: AttendeeViewProps) => {
  const style = useStyle();
  const { isMain, attendee } = props;
  const { uid, nickname, isSelf, isCameraOn, isAudioOn } = attendee;
  const title = useMemo(
    () => (nickname && nickname.length ? nickname : uid),
    [nickname, uid]
  );

  return (
    <Stack className={style.wrapper}>
      <Stack className={style.container} justifyContent="flex-end">
        <Stack
          className={style.toolbar}
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography
            style={{ userSelect: 'none' }}
            variant="subtitle2"
            display="block"
            color="white"
          >
            {title}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {isAudioOn ? <MicNoneOutlinedIcon color="primary" /> : <></>}
            {isCameraOn ? <VideocamOutlinedIcon color="primary" /> : <></>}
          </Stack>
        </Stack>
        {attendee.isCameraOn ? (
          <VideoBox
            uid={attendee.uid}
            isSelf={attendee.isSelf || false}
            fit={isMain}
          />
        ) : (
          <></>
        )}
      </Stack>
    </Stack>
  );
};

export default AttendeeItem;
