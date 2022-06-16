import React, { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack } from '@mui/material';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import HeaderBar from '../components/header';
import useStyle from './style';
import {
  getNickname,
  setNickname,
  getUseCamera,
  setUseCamera,
  getUseMicrophone,
  setUseMicrophone,
} from '../../utils/localstorage';
import {
  MeetingConnection,
  MeetingParams,
  useCommonManager,
  useStore,
} from '../../hooks';

const MainView = () => {
  const style = useStyle();
  const navigate = useNavigate();
  const { state } = useStore();
  const commonManager = useCommonManager();
  const [joinParams, setJoinParams] = useState<MeetingParams>({
    channelName: '',
    nickname: getNickname(),
    isCameraOn: getUseCamera(),
    isAudioOn: getUseMicrophone(),
  });
  const [isChannelNameInvalid, setChannelNameInvalid] = useState(false);
  const [isNicknameInvalid, setNicknameInvalid] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state.connection === MeetingConnection.Connecting && loading !== true) {
      setLoading(true);
    } else if (loading === true) {
      setLoading(false);
    }

    if (state.connection === MeetingConnection.Connected) {
      const { nickname, isCameraOn, isAudioOn } = joinParams;
      setNickname(nickname);
      setUseCamera(isCameraOn);
      setUseMicrophone(isAudioOn);
      navigate('/meeting');
    }
  }, [state.connection]);

  const onChannelNameChanged = (value: string) => {
    const tmpValue = value.replace(/[^\da-zA-Z]/g, '').toUpperCase();

    setJoinParams({ ...joinParams, channelName: tmpValue });

    if (tmpValue !== '' && isChannelNameInvalid) setChannelNameInvalid(false);
  };

  const onNicknameChanged = (value: string) => {
    const tmpValue = value.replace(/[^\da-zA-Z]/g, '');

    setJoinParams({ ...joinParams, nickname: tmpValue });

    if (tmpValue !== '' && isNicknameInvalid) setNicknameInvalid(false);
  };

  const onSubmit = () => {
    const { channelName, nickname } = joinParams;

    let isInvalid = false;

    if (channelName === '') {
      setChannelNameInvalid(true);
      isInvalid = true;
    }

    if (nickname === '') {
      setNicknameInvalid(true);
      isInvalid = true;
    }

    if (isInvalid) return;

    commonManager?.joinMeeting(joinParams);
  };

  return (
    <Stack
      className={style.mainWrapper}
      width="100%"
      height="100%"
      direction="column"
      justifyContent="center"
      alignItems="center"
    >
      <HeaderBar fixed />
      <Box
        component="form"
        sx={{
          '& .MuiTextField-root': { m: 1, width: '25ch' },
        }}
        noValidate
        autoComplete="off"
      >
        <div>
          <TextField
            id="channelname"
            placeholder="Enter your channel name"
            error={isChannelNameInvalid}
            helperText={isChannelNameInvalid ? '*invalid channel name' : ''}
            value={joinParams.channelName}
            inputProps={{ maxLength: 18 }}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChannelNameChanged(e.target.value)
            }
          />
        </div>
        <div>
          <TextField
            id="nickname"
            defaultValue={joinParams.nickname}
            placeholder="Enter your nickname"
            error={isNicknameInvalid}
            helperText={isNicknameInvalid ? '*invalid nickname' : ''}
            inputProps={{ maxLength: 12 }}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onNicknameChanged(e.target.value)
            }
          />
        </div>
        <div className={style.containerCheckBoxes}>
          <FormControlLabel
            control={
              <Checkbox
                checked={joinParams.isCameraOn}
                onChange={(_evt, checked: boolean) => {
                  setJoinParams({ ...joinParams, isCameraOn: checked });
                }}
                name="camera"
              />
            }
            label="Camera"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={joinParams.isAudioOn}
                onChange={(_evt, checked: boolean) => {
                  setJoinParams({ ...joinParams, isAudioOn: checked });
                }}
                name="microphone"
              />
            }
            label="Microphone"
          />
        </div>
        <div className={style.containerSubmit}>
          <LoadingButton
            fullWidth
            loading={loading}
            variant="contained"
            onClick={onSubmit}
          >
            Join
          </LoadingButton>
        </div>
      </Box>
    </Stack>
  );
};

export default MainView;
