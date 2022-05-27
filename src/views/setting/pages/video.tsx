import React, { useEffect } from 'react';
import { MenuItem, Stack, FormControl } from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useCommonManager, useStore } from '../../../hooks';

const VideoPage = () => {
  const { state } = useStore();
  const commonManager = useCommonManager();

  const handleChange = (event: SelectChangeEvent) => {
    console.info('select changed:', event.target.value);
  };

  useEffect(() => {
    const dom = document.getElementById('videobox-preview');
    if (!commonManager.isInMeeting()) {
      commonManager.setVideoPreview(true);
      commonManager.setupLocalVideoRenderer(dom!, true);
    }

    return () => {
      if (!commonManager.isInMeeting()) commonManager.setVideoPreview(false);
    };
  });

  return (
    <Stack spacing={2}>
      <div
        id="videobox-preview"
        style={{ width: '320px', height: '240px', background: '#F3F3F3' }}
      />
      <FormControl fullWidth>
        <Select
          id="select-camera"
          value={state.currentCameraId}
          onChange={handleChange}
        >
          {state.cameras?.map((device) => (
            <MenuItem key={device.deviceid} value={device.deviceid}>
              {device.devicename}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
};

export default VideoPage;
