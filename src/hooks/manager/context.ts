/* eslint-disable import/prefer-default-export */
import { createContext } from 'react';
import { MeetingManager } from './manager';

export const MeetingManagerContext = createContext<{
  meetingManager?: MeetingManager | undefined;
}>({});
