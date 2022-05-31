/* eslint-disable no-nested-ternary */
import React, { useEffect, useMemo } from 'react';
import { Stack, Typography } from '@mui/material';

import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ScreenShareOutlinedIcon from '@mui/icons-material/ScreenShareOutlined';

import { AttendeeInfo, useCommonManager } from '../../../../hooks';
import useStyle from './style';
import { generateVideoboxId } from '../utils';

export declare type VideoBoxProps = {
  uid?: number | undefined;
  isSelf: boolean;
  isMain?: boolean;
};

const VideoBox = (props: VideoBoxProps) => {
  const style = useStyle();
  const { uid, isSelf, isMain } = props;
  const commonManager = useCommonManager();
  const domId = useMemo(
    () => generateVideoboxId(uid || 0, isMain || false),
    [uid]
  );
  const otherDomId = useMemo(
    () => generateVideoboxId(uid || 0, !isMain),
    [uid]
  );

  useEffect(() => {
    const dom = document.getElementById(domId);
    const otherDom = document.getElementById(otherDomId);

    // videobox in main video container may create before in attendee list
    const isAppend = otherDom !== null;

    if (isSelf) {
      commonManager.setupLocalVideoRenderer(dom!, isMain || false, isAppend);
    } else {
      commonManager.setupRemoteVideoRenderer(
        uid!,
        dom!,
        isMain || false,
        isAppend
      );
    }
  }, [uid]);

  return <div className={style.videobox} id={domId} />;
};

export type AttendeeItemProps = {
  isMain?: boolean;
  attendee: AttendeeInfo;
};

const AttendeeItem = (props: AttendeeItemProps) => {
  const style = useStyle();
  const { isMain, attendee } = props;
  const { uid, nickname, isSelf, isCameraOn, isAudioOn, parentId } = attendee;
  const title = useMemo(
    () => (nickname && nickname.length ? nickname : uid),
    [nickname, uid]
  );

  return (
    <Stack className={style.wrapper}>
      <Stack className={style.container} justifyContent="flex-end">
        {!isCameraOn ? (
          <Stack
            width="100%"
            height="100%"
            justifyContent="center"
            alignItems="center"
          >
            <AccountCircleOutlinedIcon fontSize="large" />
          </Stack>
        ) : (
          <></>
        )}
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
          {isMain ? (
            <></>
          ) : (
            <Stack direction="row" spacing={1} alignItems="center">
              {isAudioOn ? <MicNoneOutlinedIcon color="primary" /> : <></>}
              {isCameraOn ? (
                parentId && parentId !== 0 ? (
                  <ScreenShareOutlinedIcon color="primary" />
                ) : (
                  <VideocamOutlinedIcon color="primary" />
                )
              ) : (
                <></>
              )}
            </Stack>
          )}
        </Stack>
        {isCameraOn ? (
          <VideoBox uid={uid} isSelf={isSelf || false} isMain={isMain} />
        ) : (
          <></>
        )}
      </Stack>
    </Stack>
  );
};

export default AttendeeItem;