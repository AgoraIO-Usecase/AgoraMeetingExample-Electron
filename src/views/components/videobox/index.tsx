import React, { useMemo, useEffect } from 'react';
import { useCommonManager } from '../../../hooks';
import { generateVideoboxId } from '../../../utils/generate';
import useStyle from './style';

export declare type VideoBoxProps = {
  uid?: number | undefined;
  isSelf: boolean;
  isMain: boolean;
  isFit: boolean;
};

const VideoBox = (props: VideoBoxProps) => {
  const style = useStyle();
  const { uid, isSelf, isMain, isFit } = props;
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
      commonManager.setupLocalVideoRenderer(dom!, isFit, isAppend);
    } else {
      commonManager.setupRemoteVideoRenderer(uid!, dom!, isFit, isAppend);
    }

    console.warn('attendee videobox initialize for ', uid);

    return () => {
      // there has a known issue here
      // can not switch renderer mode from fit to stretch after
      // main attendee destroyed
      if (isMain && !isSelf && uid !== undefined) {
        commonManager.setRemoteVideoStreamType(uid, false);
      }

      if (isSelf) {
        commonManager.destroyLocalVideoRenderer(dom!);
      } else {
        commonManager.destroyRemoteVideoRenderer(uid!, dom!);
      }

      console.warn('attendee videobox uninitialize for ', uid, dom!.id);
    };
  }, [uid]);

  return <div className={style.wrapper} id={domId} />;
};

export default VideoBox;
