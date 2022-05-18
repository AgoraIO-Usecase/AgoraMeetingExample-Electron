import AgoraRtcEngine from 'agora-electron-sdk';
import React, { FC, useEffect, useState } from 'react';
import { RtcEngineContext } from './context';

// eslint-disable-next-line import/prefer-default-export
export const EngineProvider: FC = (props) => {
  const [engine, setEngine] = useState<AgoraRtcEngine>();
  const { children } = props;

  useEffect(() => {
    if (!engine) setEngine(new AgoraRtcEngine());
    return () => {
      if (engine) engine.release(true);
    };
  }, []);

  return (
    <RtcEngineContext.Provider value={{ rtcEngine: undefined }}>
      {children}
    </RtcEngineContext.Provider>
  );
};
