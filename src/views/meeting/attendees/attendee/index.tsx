/* eslint-disable no-nested-ternary */
import React, { useMemo } from 'react';
import { Stack, Typography } from '@mui/material';

import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ScreenShareOutlinedIcon from '@mui/icons-material/ScreenShareOutlined';
import DeveloperBoardOutlinedIcon from '@mui/icons-material/DeveloperBoardOutlined';

import { AttendeeInfo } from '../../../../hooks';
import useStyle from './style';
import VideoBox from '../../../components/videobox';

export type AttendeeItemProps = {
  isMain?: boolean;
  isFit?: boolean;
  attendee: AttendeeInfo;
};

const AttendeeItem = (props: AttendeeItemProps) => {
  const style = useStyle();
  const { isMain, isFit, attendee } = props;
  const {
    uid,
    nickname,
    isSelf,
    isCameraOn,
    isAudioOn,
    parentId,
    hasWhiteBoard,
  } = attendee;
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
              {hasWhiteBoard ? (
                <DeveloperBoardOutlinedIcon color="primary" />
              ) : (
                <></>
              )}
            </Stack>
          )}
        </Stack>
        {isCameraOn ? (
          <VideoBox
            uid={uid}
            isSelf={isSelf || false}
            isMain={isMain || false}
            isFit={isFit || false}
          />
        ) : (
          <></>
        )}
      </Stack>
    </Stack>
  );
};

export default AttendeeItem;
