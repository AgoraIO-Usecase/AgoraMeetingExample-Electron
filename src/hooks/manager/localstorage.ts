import { VideoEncoderConfigurationType } from './types';

const LOCAL_STORAGE_VIDEO_ENCODER_CONFIGURATION_TYPE =
  'LOCAL_STORAGE_ENCODER_CONFIGURATION_TYPE';

const setNmber = (key: string, value: number) =>
  localStorage.setItem(key, String(value));

const getNumber = (key: string, defaultValue: number) => {
  const storagedValue = localStorage.getItem(key);
  if (storagedValue && storagedValue.length)
    return Number.parseInt(storagedValue, 10);

  return defaultValue;
};

const storage = {
  setVideoEncoderConfigurationType: (value: number) =>
    setNmber(LOCAL_STORAGE_VIDEO_ENCODER_CONFIGURATION_TYPE, value),

  getVideoEncoderConfigurationType: () =>
    getNumber(
      LOCAL_STORAGE_VIDEO_ENCODER_CONFIGURATION_TYPE,
      VideoEncoderConfigurationType.Medium
    ),
};

export default storage;
