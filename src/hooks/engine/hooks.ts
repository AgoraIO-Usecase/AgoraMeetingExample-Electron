import { useContext } from 'react';
import { RtcEngineContext } from './context';

// eslint-disable-next-line import/prefer-default-export
export const useEngineContext = () => {
  const engine = useContext(RtcEngineContext);
  return engine;
};
