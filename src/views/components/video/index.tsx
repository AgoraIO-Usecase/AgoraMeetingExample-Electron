import React, { useEffect, useMemo } from 'react';
import { useMeetingManager } from '../../../hooks';

export declare type VideoBoxProps = {
  uid?: number | undefined;
};

const VideoBox = (props: VideoBoxProps) => {
  const { uid } = props;
  const { meetingManager } = useMeetingManager();
  const domId = useMemo(() => {
    return uid === undefined ? 'videobox-local' : `videobox-${uid as number}`;
  }, [uid]);

  useEffect(() => {
    const dom = document.getElementById(domId);
    if (uid === undefined) {
      meetingManager?.setupLocalVideoRenderer(dom!);
    } else {
      meetingManager?.setupRemoteVideoRenderer(uid, dom!);
    }
  }, []);

  return <div id={domId} />;
};

export default VideoBox;
