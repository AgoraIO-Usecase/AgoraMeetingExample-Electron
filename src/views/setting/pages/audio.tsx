import React, { useCallback, useMemo } from 'react';
import {
  Grid,
  Typography,
  Stack,
  Select,
  MenuItem,
  Slider,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import VolumeUpOutlinedIcon from '@mui/icons-material/VolumeUpOutlined';
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined';
import AudiotrackOutlinedIcon from '@mui/icons-material/AudiotrackOutlined';
import RecordVoiceOverOutlinedIcon from '@mui/icons-material/RecordVoiceOverOutlined';
import { useCommonManager, useStore } from '../../../hooks';

const AudioPage = () => {
  const { state } = useStore();
  const commonManager = useCommonManager();

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

  const onSpeakerVolumeChanged = (
    event: Event,
    newValue: number | number[]
  ) => {
    commonManager.setSpeakerVolume(calculateVolume(newValue as number));
  };

  return (
    <Stack spacing={2} width="320px">
      <Stack />
      <Stack spacing={1}>
        <Stack>
          <Typography variant="body2" gutterBottom display="block">
            Speaker
          </Typography>
          <Select
            id="select-speaker"
            defaultValue={state.currentSpeakerId}
            fullWidth
          >
            {state.speakers?.map((device) => (
              <MenuItem key={device.deviceid} value={device.deviceid}>
                {device.devicename}
              </MenuItem>
            ))}
          </Select>
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
            <Tooltip placement="left" title="Play Effect">
              <IconButton>
                <AudiotrackOutlinedIcon />
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
        <Stack>
          <Typography variant="body2" gutterBottom display="block">
            Microphone
          </Typography>
          <Select
            id="select-speaker"
            defaultValue={state.currentSpeakerId}
            fullWidth
          >
            {state.speakers?.map((device) => (
              <MenuItem key={device.deviceid} value={device.deviceid}>
                {device.devicename}
              </MenuItem>
            ))}
          </Select>
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
            <Tooltip placement="left" title="Test Microphone">
              <IconButton>
                <RecordVoiceOverOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <MicNoneOutlinedIcon />
            </Grid>
            <Grid item xs>
              <LinearProgress
                variant="determinate"
                value={1}
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
