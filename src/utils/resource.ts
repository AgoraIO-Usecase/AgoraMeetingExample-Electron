import path from 'path';
import { shell } from 'electron';

// do not call this in main process
export const getResourcePath = (filePath = './') => {
  if (process.env.NODE_ENV === 'development') {
    return path.resolve(`${__dirname}`, '../extraResources', filePath);
  }
  return path.resolve(`${process.resourcesPath}/extraResources`, filePath);
};

export const exploreToFile = (filePath: string) =>
  shell.showItemInFolder(filePath);

export default {};
