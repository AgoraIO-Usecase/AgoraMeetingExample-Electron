import React, { useMemo } from 'react';
import SpeakerView from './speaker';
import GridView from './grid';
import { AttendeeLayoutType, useStore } from '../../../hooks';

const AttendeeView = () => {
  const { state } = useStore();
  const isSpeakerLayout = useMemo(
    () => state.attendeeLayout === AttendeeLayoutType.Speaker,
    [state.attendeeLayout]
  );

  return isSpeakerLayout ? <SpeakerView /> : <GridView />;
};

export default AttendeeView;
