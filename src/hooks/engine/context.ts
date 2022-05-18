import { createContext } from 'react';
import AgoraRtcEngine from 'agora-electron-sdk';

export declare interface RtcEngine {
  rtcEngine?: AgoraRtcEngine | undefined;
}

export const RtcEngineContext = createContext<RtcEngine>({});
