import React, { useEffect, useMemo } from 'react';
import { useMeetingManager } from '../../../hooks';

export declare type VideoBoxProps = {
  uid?: number | undefined;
  fit?: boolean;
};

const VideoBox = (props: VideoBoxProps) => {
  const { uid, fit } = props;
  const meetingManager = useMeetingManager();
  const domId = useMemo(() => {
    return uid === undefined ? 'videobox-local' : `videobox-${uid as number}`;
  }, [uid]);

  useEffect(() => {
    const dom = document.getElementById(domId);
    if (uid === undefined) {
      meetingManager?.setupLocalVideoRenderer(dom!, fit === true);
    } else {
      meetingManager?.setupRemoteVideoRenderer(uid, dom!, fit === true);
    }
  }, []);

  return <div id={domId} style={{ width: '100%', height: '100%' }} />;
};

export default VideoBox;
