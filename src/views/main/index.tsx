import React, { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import log from 'electron-log';
import { Stack } from '@mui/material';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import FormLabel from '@mui/material/FormLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import useStyle from './style';

const MainView = () => {
  const style = useStyle();
  const navigate = useNavigate();
  const [isChannelNameInvalid, setChannelNameInvalid] = useState(false);
  const [isNickNameInvalid, setNickNameInvalid] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [nickName, setNickName] = useState('');

  const onChannelNameChanged = (value: string) => {
    setChannelName(value);

    if (value !== '' && isChannelNameInvalid) setChannelNameInvalid(false);
  };

  const onNickNameChanged = (value: string) => {
    setNickName(value);

    if (value !== '' && isNickNameInvalid) setNickNameInvalid(false);
  };

  const onSubmit = () => {
    log.info('submit');
    if (channelName === '') {
      setChannelNameInvalid(true);
    }

    if (nickName === '') {
      setNickNameInvalid(true);
    }
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
      <Stack
        className={style.titleBar}
        direction="row"
        justifyContent="flex-end"
        alignItems="center"
      >
        <IconButton onClick={() => {}}>
          <SettingsIcon />
        </IconButton>
      </Stack>
      <Box
        component="form"
        sx={{
          '& .MuiTextField-root': { m: 1, width: '25ch' },
        }}
        noValidate
        autoComplete="off"
        onSubmit={onSubmit}
      >
        {/* <FormLabel component="legend">ChannelName</FormLabel> */}
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
        {/* <FormLabel component="legend">NickName</FormLabel> */}
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
              <Checkbox checked={false} onChange={() => {}} name="camera" />
            }
            label="Camera"
          />
          <FormControlLabel
            control={
              <Checkbox checked={false} onChange={() => {}} name="microphone" />
            }
            label="Microphone"
          />
        </div>
        <div className={style.containerSubmit}>
          <Button fullWidth type="submit" variant="contained">
            Join
          </Button>
        </div>
      </Box>
    </Stack>
  );
};

export default MainView;
