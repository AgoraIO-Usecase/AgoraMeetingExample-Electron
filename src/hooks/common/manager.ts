import log from 'electron-log';

// eslint-disable-next-line import/prefer-default-export
export class CommonManager {
  trace = () => {
    log.info('I am common manager.');
  };
}
