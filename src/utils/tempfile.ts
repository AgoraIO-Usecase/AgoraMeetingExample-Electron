import tmp from 'tmp';
import fs from 'fs';

const writeTempFile = (context: string, postfix?: string | undefined) => {
  return new Promise<string>((resolve, reject) => {
    tmp.tmpName({ prefix: 'agora-', postfix }, (tmperr, path) => {
      if (tmperr) {
        reject(tmperr);
        return;
      }
      fs.writeFile(path, context, (writeError) => {
        if (writeError) {
          reject(writeError);
          return;
        }
        resolve(path);
      });
    });
  });
};

const deleteTempFile = (path: string) => {
  return new Promise<boolean>((resolve, reject) => {
    fs.unlink(path, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(true);
    });
  });
};

export { writeTempFile, deleteTempFile };
