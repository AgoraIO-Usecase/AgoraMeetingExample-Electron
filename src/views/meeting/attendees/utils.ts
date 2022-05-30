export const generateVideoboxId = (uid: number, isMain: boolean) => {
  return `${isMain ? 'videobox-main' : 'videobox'}-${uid}`;
};

export default {};
