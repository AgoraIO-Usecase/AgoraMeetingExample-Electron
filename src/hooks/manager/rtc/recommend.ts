import { VideoEncoderConfiguration } from 'agora-electron-sdk/types/Api/native_type';

export const PresetEncoderConfigurations: VideoEncoderConfiguration[] = [
  {
    width: 1920,
    height: 1080,
    frameRate: 15,
    minFrameRate: -1, // DEFAULT VALUE
    bitrate: 2560,
    minBitrate: 1, // DEFAULT VALUE
    orientationMode: 0, // OrientationMode.ORIENTATION_MODE_ADAPTIVE,
    degradationPreference: 2, // DegradationPreference.MAINTAIN_BALANCED,
    mirrorMode: 0, // VideoMirrorModeType.AUTO,
  },
  {
    width: 960,
    height: 720,
    frameRate: 15,
    minFrameRate: -1, // DEFAULT VALUE
    bitrate: 1228,
    minBitrate: 1, // DEFAULT VALUE
    orientationMode: 0, // OrientationMode.ORIENTATION_MODE_ADAPTIVE,
    degradationPreference: 2, // DegradationPreference.MAINTAIN_BALANCED,
    mirrorMode: 0, // VideoMirrorModeType.AUTO,
  },
  {
    width: 640,
    height: 480,
    frameRate: 15,
    minFrameRate: -1, // DEFAULT VALUE
    bitrate: 800,
    minBitrate: 1, // DEFAULT VALUE
    orientationMode: 0, // OrientationMode.ORIENTATION_MODE_ADAPTIVE,
    degradationPreference: 2, // DegradationPreference.MAINTAIN_BALANCED,
    mirrorMode: 0, // VideoMirrorModeType.AUTO,
  },
];

export default {};
