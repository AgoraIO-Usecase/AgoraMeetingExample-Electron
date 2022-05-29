import React, { useEffect, useMemo } from 'react';
import { MenuItem, Stack, Typography } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  DeviceType,
  useCommonManager,
  useStore,
  VideoEncoderConfigurationType,
} from '../../../hooks';
import DeviceSelect from './deviceselect';

const VideoPage = () => {
  const { state } = useStore();
  const commonManager = useCommonManager();
  const currentVideoEncoderConfiguratyonType = useMemo(
    () => commonManager.getVideoEncoderConfigurationType() as number,
    []
  );

  const onCameraSelectChanged = (event: SelectChangeEvent) => {
    const deviceId = event.target.value;
    if (deviceId.length) commonManager.setDevice(DeviceType.Camera, deviceId);
  };

  const onVideoEncoderConfigurationSelectChanged = (
    event: SelectChangeEvent
  ) => {
    const newResolution = Number.parseInt(event.target.value, 10);

    commonManager.setVideoEncoderConfigurationType(
      newResolution as VideoEncoderConfigurationType
    );
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
  }, []);

  return (
    <Stack spacing={2}>
      <Stack spacing={1}>
        {commonManager.isInMeeting() ? (
          <></>
        ) : (
          <div
            id="videobox-preview"
            style={{ width: '320px', height: '240px', background: '#F3F3F3' }}
          />
        )}
        <Typography variant="body2" gutterBottom display="block">
          Camera
        </Typography>
        <DeviceSelect
          id="select-camera"
          defaultValue={state.currentCameraId}
          onChange={onCameraSelectChanged}
        >
          {state.cameras?.map((device) => (
            <MenuItem key={device.deviceid} value={device.deviceid}>
              {device.devicename}
            </MenuItem>
          ))}
        </DeviceSelect>
      </Stack>
      <Stack spacing={1}>
        <Typography variant="body2" gutterBottom display="block">
          Encoder Configuration
        </Typography>
        <DeviceSelect
          id="select-encoder-configuration"
          defaultValue={`${currentVideoEncoderConfiguratyonType}`}
          onChange={onVideoEncoderConfigurationSelectChanged}
        >
          <MenuItem value={0}>Low</MenuItem>
          <MenuItem value={1}>Medium</MenuItem>
          <MenuItem value={2}>High</MenuItem>
        </DeviceSelect>
      </Stack>
    </Stack>
  );
};

export default VideoPage;
