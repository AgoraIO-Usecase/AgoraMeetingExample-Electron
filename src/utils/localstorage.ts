const LOCAL_STORAGE_NICKNAME = 'LOCAL_STORAGE_NICKNAME';
const LOCAL_STORAGE_USE_CAMERA = 'LOCAL_STORAGE_USE_CAMERA';
const LOCAL_STORAGE_USE_MICROPHONE = 'LOCAL_STORAGE_USE_MICROPHONE';

export const getNickName = () => {
  const nickname = localStorage.getItem(LOCAL_STORAGE_NICKNAME);
  if (nickname === null) return '';
  return nickname;
};

export const setNickName = (nickname: string) => {
  localStorage.setItem(LOCAL_STORAGE_NICKNAME, nickname);
};

export const getUseCamera = () => {
  return localStorage.getItem(LOCAL_STORAGE_USE_CAMERA) === 'true';
};

export const setUseCamera = (useCamera: boolean) => {
  localStorage.setItem(LOCAL_STORAGE_USE_CAMERA, String(useCamera));
};

export const getUseMicrophone = () => {
  return localStorage.getItem(LOCAL_STORAGE_USE_MICROPHONE) === 'true';
};

export const setUseMicrophone = (useMicrophone: boolean) => {
  localStorage.setItem(LOCAL_STORAGE_USE_MICROPHONE, String(useMicrophone));
};
