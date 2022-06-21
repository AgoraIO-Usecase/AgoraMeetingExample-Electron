import { sdkToken, roomToken, taskToken, TokenPrefix, TokenRole } from './cert';

const ETA = 60 * 60 * 24 * 1000;

// We recommend you to generate sdk token with your web service not in app.
export const generateSdkToken = () =>
  sdkToken(
    process.env.AGORA_WHITEBOARD_AK!,
    process.env.AGORA_WHITEBOARD_SK!,
    ETA,
    {
      role: TokenRole.Admin,
    }
  );

// We recommend you to generate room token with your web service not in app.
export const generateRoomToken = (uuid: string) =>
  roomToken(
    process.env.AGORA_WHITEBOARD_AK!,
    process.env.AGORA_WHITEBOARD_SK!,
    ETA,
    { role: TokenRole.Admin, uuid }
  );

// We recommend you to generate task token with your web service not in app.
export const generateTaskToken = (uuid: string) =>
  taskToken(
    process.env.AGORA_WHITEBOARD_AK!,
    process.env.AGORA_WHITEBOARD_SK!,
    ETA,
    { role: TokenRole.Admin, uuid }
  );
