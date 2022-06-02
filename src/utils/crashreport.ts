import { app, crashReporter } from 'electron';
import log from 'electron-log';

if (process.env.NODE_ENV === 'production') {
  const crashPath = `${app.getPath('logs')}/crashes`;
  app.setPath('crashDumps', crashPath);

  log.info(`initialize crash reporter with dump file path ${crashPath}`);

  crashReporter.start({
    productName: 'meeting-example',
    companyName: 'meeting-example',
    submitURL:
      'https://submit.backtrace.io/meeting-example/74c462a300c09d461d2e477370df4b77d3a033effdada38355732676ca9e5a3a/minidump',
    uploadToServer: true,
  });
}

export default {};
