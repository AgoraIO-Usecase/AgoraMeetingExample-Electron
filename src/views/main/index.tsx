import React, { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import log from 'electron-log';
import { Stack } from '@mui/material';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import HeaderBar from '../components/header';
import useStyle from './style';
import {
  getNickName,
  setNickName,
  getUseCamera,
  setUseCamera,
  getUseMicrophone,
  setUseMicrophone,
} from '../../utils/localstorage';
import {
  useMeetingInfo,
  useMeetingManager,
  JoinMeetingParams,
  MeetingConnectionState,
} from '../../hooks';

const MainView = () => {
  const style = useStyle();
  const navigate = useNavigate();
  const { meetingInfo } = useMeetingInfo();
  const { meetingManager } = useMeetingManager();
  const [joinParams, setJoinParams] = useState<JoinMeetingParams>({
    channelName: '',
    nickName: getNickName(),
    streamId: Number(`${new Date().getTime()}`.slice(7)),
    isCameraOn: getUseCamera(),
    isMicrophoneOn: getUseMicrophone(),
  });
  const [isChannelNameInvalid, setChannelNameInvalid] = useState(false);
  const [isNickNameInvalid, setNickNameInvalid] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    log.info('mainview meeting info changed', meetingInfo);

    if (
      meetingInfo?.state === MeetingConnectionState.CONNECTING &&
      loading !== true
    ) {
      setLoading(true);
    } else if (loading === true) {
      setLoading(false);
    }

    if (meetingInfo?.state === MeetingConnectionState.CONNECTED) {
      const { nickName, isCameraOn, isMicrophoneOn } = joinParams;
      setNickName(nickName);
      setUseCamera(isCameraOn);
      setUseMicrophone(isMicrophoneOn);
      navigate('/meeting');
    }
  }, [meetingInfo, meetingInfo?.state]);

  const onChannelNameChanged = (value: string) => {
    setJoinParams({ ...joinParams, channelName: value });

    if (value !== '' && isChannelNameInvalid) setChannelNameInvalid(false);
  };

  const onNickNameChanged = (value: string) => {
    setJoinParams({ ...joinParams, nickName: value });

    if (value !== '' && isNickNameInvalid) setNickNameInvalid(false);
  };

  const onSubmit = () => {
    const { channelName, nickName } = joinParams;

    let isInvalid = false;

    if (channelName === '') {
      setChannelNameInvalid(true);
      isInvalid = true;
    }

    if (nickName === '') {
      setNickNameInvalid(true);
      isInvalid = true;
    }

    if (isInvalid) return;

    meetingManager?.joinMeeting(joinParams);
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
            defaultValue={joinParams.channelName}
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
            defaultValue={joinParams.nickName}
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
                checked={joinParams.isMicrophoneOn}
                onChange={(_evt, checked: boolean) => {
                  setJoinParams({ ...joinParams, isMicrophoneOn: checked });
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
