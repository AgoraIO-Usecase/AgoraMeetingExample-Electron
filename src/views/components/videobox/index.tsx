import React, { useMemo, useEffect } from 'react';
import { AttendeeType, useCommonManager } from '../../../hooks';
import { generateVideoboxId } from '../../../utils/generate';
import useStyle from './style';

export declare type VideoBoxProps = {
  uid?: number | undefined;
  type: AttendeeType;
  isSelf: boolean;
  isMain: boolean;
  isFit: boolean;
};

const VideoBox = (props: VideoBoxProps) => {
  const style = useStyle();
  const { uid, type, isSelf, isMain, isFit } = props;
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

    if (isMain && !isSelf && uid !== undefined) {
      commonManager.setRemoteVideoStreamType(uid, true);
    }

    if (isSelf) {
      if (type === AttendeeType.Media)
        commonManager.setupLocalVideoRenderer(dom!, isFit, isAppend);
      else if (type === AttendeeType.ScreenShare)
        commonManager.setupScreenShareRenderer(dom!, isFit, isAppend);
    } else {
      commonManager.setupRemoteVideoRenderer(uid!, dom!, isFit, isAppend);
    }

    console.warn(
      'attendee videobox initialize for ',
      uid,
      dom!.id,
      isSelf,
      type
    );

    return () => {
      // there has a known issue here
      // can not switch renderer mode from fit to stretch after
      // main attendee destroyed
      if (isMain && !isSelf && uid !== undefined) {
        commonManager.setRemoteVideoStreamType(uid, false);
      }

      if (isSelf) {
        if (type === AttendeeType.Media)
          commonManager.destroyLocalVideoRenderer(dom!);
        else if (type === AttendeeType.ScreenShare)
          commonManager.destroyScreenShareRenderer(dom!);
      } else {
        commonManager.destroyRemoteVideoRenderer(uid!, dom!);
      }

      console.warn(
        'attendee videobox uninitialize for ',
        uid,
        dom!.id,
        isSelf,
        type
      );
    };
  }, [uid]);

  return <div className={style.wrapper} id={domId} />;
};

export default VideoBox;
