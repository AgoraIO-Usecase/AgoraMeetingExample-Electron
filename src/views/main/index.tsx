import React, { ChangeEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import log from 'electron-log';
import { Stack } from '@mui/material';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import { useCommonManager } from '../../hooks';

import HeaderBar from '../components/header';
import useStyle from './style';

const MainView = () => {
  const style = useStyle();
  const navigate = useNavigate();
  const { commonManager } = useCommonManager();
  const [isChannelNameInvalid, setChannelNameInvalid] = useState(false);
  const [isNickNameInvalid, setNickNameInvalid] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [nickName, setNickName] = useState('');
  const [isCameraOn, setCameraOn] = useState(false);
  const [isMicrophoneOn, setMicrophoneOn] = useState(false);

  const onChannelNameChanged = (value: string) => {
    setChannelName(value);

    if (value !== '' && isChannelNameInvalid) setChannelNameInvalid(false);
  };

  const onNickNameChanged = (value: string) => {
    setNickName(value);

    if (value !== '' && isNickNameInvalid) setNickNameInvalid(false);
  };

  const onSubmit = () => {
    let isInvalid = false;

    if (channelName === '') {
      setChannelNameInvalid(true);
      isInvalid = true;
    }

    if (nickName === '') {
      setNickNameInvalid(true);
      isInvalid = true;
    }

    log.info('submit', isInvalid);

    if (isInvalid) return;

    log.info('submit');
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
            placeholder="input your channel name"
            error={isChannelNameInvalid}
            helperText={isChannelNameInvalid ? '*invalid channel name' : ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChannelNameChanged(e.target.value)
            }
          />
        </div>
        <div>
          <TextField
            id="nickname"
            placeholder="input your nickname"
            error={isNickNameInvalid}
            helperText={isNickNameInvalid ? '*invalid nickname' : ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onNickNameChanged(e.target.value)
            }
          />
        </div>
        <div className={style.containerCheckBoxes}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isCameraOn}
                onChange={(_evt, checked: boolean) => {
                  setCameraOn(checked);
                }}
                name="camera"
              />
            }
            label="Camera"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isMicrophoneOn}
                onChange={(_evt, checked: boolean) => {
                  setMicrophoneOn(checked);
                }}
                name="microphone"
              />
            }
            label="Microphone"
          />
        </div>
        <div className={style.containerSubmit}>
          <Button fullWidth variant="contained" onClick={onSubmit}>
            Join
          </Button>
        </div>
      </Box>
    </Stack>
  );
};

export default MainView;
