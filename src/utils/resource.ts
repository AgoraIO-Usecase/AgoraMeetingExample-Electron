import path from 'path';

export const getResourcePath = (filePath = './') => {
  if (process.env.NODE_ENV === 'development') {
    return path.resolve(`${__dirname}`, '../extraResources/', filePath);
  }
  return path.resolve(`${process.resourcesPath}/extraResources`, filePath);
};

export default {};
