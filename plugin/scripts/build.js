const { logger } = require('just-task');
const shell = require('shelljs');
const path = require('path');

// workaround to find executable when install as dependency
const gypPath = `${path.resolve(
  __dirname,
  '../node_modules/node-gyp/bin/node-gyp.js'
)}`;
const gypExec = `node ${gypPath}`;

module.exports = ({
  electronVersion = '12.0.0',
  runtime = 'electron',
  platform = process.platform,
  packageVersion,
  debug = false,
  silent = false,
  msvsVersion = '2019',
  arch = 'ia32',
  distUrl = 'https://electronjs.org/headers',
  cb = () => {},
}) => {
  const command = [`${gypExec} configure`];
  // check platform
  if (platform === 'win32') {
    command.push(`--arch=${arch} --msvs_version=${msvsVersion}`);
  }
  if (platform === 'darwin' && arch === 'arm64') {
    command.push('--arch=arm64');
  }
  // check runtime
  if (runtime === 'electron') {
    command.push(`--target=${electronVersion} --dist-url=${distUrl}`);
  }

  // check debug
  if (debug) {
    command.push('--debug');
    if (platform === 'darwin') {
      // MUST AT THE END OF THE COMMAND ARR
      command.push('-- -f xcode');
    }
  }

  const commandStr = command.join(' ');

  /** start build */
  logger.info(commandStr, '\n');

  logger.info('Package Version:', packageVersion);
  logger.info('Platform:', platform);
  logger.info('Electron Version:', electronVersion);
  logger.info('Runtime:', runtime, '\n');

  logger.info('Build C++ addon for Agora Plugin...\n');

  shell.exec(`${gypExec} clean`, { silent }, (code, stdout, stderr) => {
    // handle error
    logger.info(`clean done ${stdout}`);
    if (code !== 0) {
      logger.error(stderr);
      process.exit(1);
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    shell.exec(commandStr, { silent }, (code, stdout, stderr) => {
      // handle error
      logger.info(`configure done ${stdout}`);
      if (code !== 0) {
        logger.error(stderr);
        process.exit(1);
      }

      if (debug) {
        // handle success
        logger.info('Complete, please go to `/build` and build manually');
        process.exit(0);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        shell.exec(`${gypExec} build`, { silent }, (code, stdout, stderr) => {
          // handle error
          if (code !== 0) {
            logger.error(stderr);
            process.exit(1);
          }

          if (platform === 'darwin') {
            logger.info(`patch loader path for mac build..`);
            const agoraPluginPath = `${path.resolve(
              __dirname,
              `../build/${debug ? 'Debug' : 'Release'}/agora_plugin.node`
            )}`;
            shell.exec(
              `install_name_tool -add_rpath "@loader_path" ${agoraPluginPath}`,
              { silent },
              // eslint-disable-next-line @typescript-eslint/no-shadow
              (code, stdout, stderr) => {
                if (code !== 0) {
                  logger.error(stderr);
                  process.exit(1);
                }

                cb(true);
              }
            );
          }
        });
      }
    });
  });
};
