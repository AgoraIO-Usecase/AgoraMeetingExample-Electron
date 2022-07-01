import React from 'react';
import { render } from 'react-dom';
import App from './app';
import Oops from './views/oops';
import './app.global.scss';

const isEnvValid = () =>
  process.env.AGORA_MEETING_APPID !== undefined &&
  process.env.AGORA_MEETING_APPID.length &&
  process.env.AGORA_MEETING_CERT !== undefined &&
  process.env.AGORA_MEETING_CERT.length &&
  process.env.AGORA_WHITEBOARD_APPID !== undefined &&
  process.env.AGORA_WHITEBOARD_APPID.length &&
  process.env.AGORA_WHITEBOARD_AK !== undefined &&
  process.env.AGORA_WHITEBOARD_AK.length &&
  process.env.AGORA_WHITEBOARD_SK !== undefined &&
  process.env.AGORA_WHITEBOARD_SK.length &&
  process.env.AGORA_WHITEBOARD_REGION !== undefined &&
  process.env.AGORA_WHITEBOARD_REGION.length;

const getRootView = () => (isEnvValid() ? <App /> : <Oops />);

render(getRootView(), document.getElementById('root'));
