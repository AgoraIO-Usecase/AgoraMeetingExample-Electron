import React from 'react';
import SpeakerView from './speaker';
import GridView from './grid';
import { AttendeeLayoutType, useStore } from '../../../hooks';

const AttendeeView = () => {
  const { state } = useStore();

  return state.attendeeLayout === AttendeeLayoutType.Speaker ? (
    <SpeakerView />
  ) : (
    <GridView type={state.attendeeLayout} />
  );
};

export default AttendeeView;
