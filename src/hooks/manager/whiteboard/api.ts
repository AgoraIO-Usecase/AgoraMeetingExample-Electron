import axios, { AxiosResponse } from 'axios';

const API_HOST = 'https://api.netless.link/v5';

axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.post.region =
  process.env.AGORA_WHITEBOARD_REGION || 'cn-hz';

export interface WhiteBoardRoomParams {
  uuid: string;
  teamUUID: string;
  appUUID: string;
  isRecord: boolean;
  isBan: boolean;
  createdAt: string;
  limit: number;
}

export const createRoom = (token: string) =>
  axios.post<any, AxiosResponse<WhiteBoardRoomParams>>(
    `${API_HOST}/rooms`,
    undefined,
    {
      headers: {
        token,
      },
    }
  );

export default {};
