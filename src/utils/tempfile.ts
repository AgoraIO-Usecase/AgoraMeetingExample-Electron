import tmp from 'tmp';
import fs from 'fs';
import { app, remote } from 'electron';
import path from 'path';

const writeTempFile = (context: string, postfix?: string | undefined) => {
  return new Promise<string>((resolve, reject) => {
    tmp.tmpName({ prefix: 'agora-', postfix }, (tmperr, destPath) => {
      if (tmperr) {
        reject(tmperr);
        return;
      }
      fs.writeFile(destPath, context, (writeError) => {
        if (writeError) {
          reject(writeError);
          return;
        }
        resolve(destPath);
      });
    });
  });
};

const writeFileToTemp = (context: string, name: string) => {
  return new Promise<string>((resolve, reject) => {
    const destPath = path.join(app.getPath('temp'), name);
    fs.writeFile(destPath, context, (writeError) => {
      if (writeError) {
        reject(writeError);
        return;
      }
      resolve(destPath);
    });
    resolve(destPath);
  });
};

const deleteTempFile = (destPath: string) => {
  return new Promise<boolean>((resolve, reject) => {
    fs.unlink(destPath, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(true);
    });
  });
};

export { writeTempFile, writeFileToTemp, deleteTempFile };
