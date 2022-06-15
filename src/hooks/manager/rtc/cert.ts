import { RtcRole, RtcTokenBuilder } from 'agora-access-token';

const ETA = 60 * 60 * 24;

export const generateRtcToken = (channelName: string, uid: number) => {
  return RtcTokenBuilder.buildTokenWithUid(
    process.env.AGORA_MEETING_APPID!,
    process.env.AGORA_MEETING_CERT!,
    channelName,
    uid,
    RtcRole.PUBLISHER,
    Date.now() / 1000 + ETA
  );
};

export default {};
