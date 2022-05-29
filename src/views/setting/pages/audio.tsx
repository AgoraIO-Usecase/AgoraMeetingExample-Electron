import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Grid,
  Typography,
  Stack,
  MenuItem,
  Slider,
  LinearProgress,
  IconButton,
  Tooltip,
  SelectChangeEvent,
} from '@mui/material';
import VolumeUpOutlinedIcon from '@mui/icons-material/VolumeUpOutlined';
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined';
import AudiotrackOutlinedIcon from '@mui/icons-material/AudiotrackOutlined';
import RecordVoiceOverOutlinedIcon from '@mui/icons-material/RecordVoiceOverOutlined';
import DeviceSelect from './deviceselect';
import {
  DeviceType,
  MeetingConnection,
  useCommonManager,
  useStore,
  VolumeIndication,
} from '../../../hooks';

const AudioPage = () => {
  const { state } = useStore();
  const commonManager = useCommonManager();
  const [effectPlaying, setEffectPlaying] = useState(false);
  const [microphoneTesting, setMicrophoneTesting] = useState(false);
  const [microphoneVolume, setMicrophoneVolume] = useState(0);

  const translateVolume = useCallback(
    (volume: number) => Math.min(Math.ceil((volume / 255) * 100), 100),
    []
  );

  const calculateVolume = useCallback(
    (volume: number) => Math.min(Math.ceil((volume / 100) * 255), 255),
    []
  );

  const defaultSpeakerVolume = useMemo(
    () => translateVolume(commonManager.getSpeakerVolume()),
    []
  );

  const onVolumeIndications = useCallback((indications: VolumeIndication[]) => {
    indications.map((indication) => {
      // local microphone
      if (indication.uid === 0)
        setMicrophoneVolume(translateVolume(indication.volume));
      return indication;
    });
  }, []);

  useEffect(() => {
    commonManager.on('volumeIndications', onVolumeIndications);

    return () => {
      commonManager.setSpeakerTest(false);
      commonManager.setMicrophoneTest(false);
      commonManager.off('volumeIndications', onVolumeIndications);
    };
  }, []);

  const onSpeakerVolumeChanged = useCallback(
    (event: Event, newValue: number | number[]) => {
      commonManager.setSpeakerVolume(calculateVolume(newValue as number));
    },
    []
  );

  const onPlayEffectClicked = useCallback(() => {
    commonManager.setSpeakerTest(!effectPlaying);
    setEffectPlaying(!effectPlaying);
  }, [effectPlaying]);

  const onTestMicrophoneClicked = useCallback(() => {
    commonManager.setMicrophoneTest(!microphoneTesting);
    setMicrophoneTesting(!microphoneTesting);
    setMicrophoneVolume(0);
  }, [microphoneTesting]);

  const onSpeakerSelectChanged = (event: SelectChangeEvent) => {
    const deviceId = event.target.value;
    if (deviceId.length) commonManager.setDevice(DeviceType.Speaker, deviceId);
  };

  const onMicrophoneSelectChanged = (event: SelectChangeEvent) => {
    const deviceId = event.target.value;
    if (deviceId.length)
      commonManager.setDevice(DeviceType.Microphone, deviceId);
  };

  return (
    <Stack spacing={2} width="320px">
      <Stack spacing={1}>
        <Stack spacing={1}>
          <Typography variant="body2" gutterBottom display="block">
            Speaker
          </Typography>
          <DeviceSelect
            id="select-speaker"
            defaultValue={state.currentSpeakerId}
            fullWidth
            onChange={onSpeakerSelectChanged}
          >
            {state.speakers?.map((device) => (
              <MenuItem key={device.deviceid} value={device.deviceid}>
                {device.devicename}
              </MenuItem>
            ))}
          </DeviceSelect>
        </Stack>
        <Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="body2" gutterBottom display="block">
              Volume
            </Typography>
            <Tooltip
              placement="left"
              title={effectPlaying ? 'Stop Effect' : 'Play Effect'}
            >
              <IconButton onClick={onPlayEffectClicked}>
                <AudiotrackOutlinedIcon
                  color={effectPlaying ? 'success' : 'info'}
                />
              </IconButton>
            </Tooltip>
          </Stack>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <VolumeUpOutlinedIcon />
            </Grid>
            <Grid item xs>
              <Slider
                defaultValue={defaultSpeakerVolume}
                size="small"
                onChange={onSpeakerVolumeChanged}
                valueLabelDisplay="auto"
              />
            </Grid>
          </Grid>
        </Stack>
      </Stack>
      <Stack />
      <Stack spacing={1}>
        <Stack spacing={1}>
          <Typography variant="body2" gutterBottom display="block">
            Microphone
          </Typography>
          <DeviceSelect
            id="select-speaker"
            defaultValue={state.currentSpeakerId}
            fullWidth
            onChange={onMicrophoneSelectChanged}
          >
            {state.speakers?.map((device) => (
              <MenuItem key={device.deviceid} value={device.deviceid}>
                {device.devicename}
              </MenuItem>
            ))}
          </DeviceSelect>
        </Stack>
        <Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="body2" gutterBottom display="block">
              Volume
            </Typography>
            {!commonManager.isInMeeting() ? (
              <Tooltip
                placement="left"
                title={microphoneTesting ? 'Stop' : 'Test Microphone'}
              >
                <IconButton onClick={onTestMicrophoneClicked}>
                  <RecordVoiceOverOutlinedIcon
                    color={microphoneTesting ? 'success' : 'info'}
                  />
                </IconButton>
              </Tooltip>
            ) : (
              <></>
            )}
          </Stack>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <MicNoneOutlinedIcon />
            </Grid>
            <Grid item xs>
              <LinearProgress
                variant="determinate"
                value={microphoneVolume}
                valueBuffer={100}
              />
            </Grid>
          </Grid>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default AudioPage;
