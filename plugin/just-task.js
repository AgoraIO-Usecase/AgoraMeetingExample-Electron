/* eslint-disable promise/no-nesting */
/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
const { task, option, logger } = require('just-task');
const path = require('path');
const shell = require('shelljs');
const fs = require('fs');
const build = require('./scripts/build');
const cleanup = require('./scripts/cleanup');
const { getArgvFromPkgJson } = require('./scripts/npm_argv');

option('electron_version', { default: '12.0.0' });
option('runtime', { default: 'electron', choices: ['electron', 'node'] });
option('platform', {
  default: process.platform,
  choices: ['darwin', 'win32', 'linux'],
});
// option('packageVersion');
option('debug', { default: false, boolean: true });
option('silent', { default: false, boolean: true });
option('msvs_version', { default: '2019' });

const packageVersion = require('./package.json').version;

const buildWindowMonitor = async () => {
  logger.info('build depends window-monitor...');
  const params = {
    ...getArgvFromPkgJson(),
    arch: getArgvFromPkgJson().arch || process.arch,
    packageVersion,
  };

  const monitorPrefix = path.join(__dirname, 'window-monitor');

  const monitorBuildPath = path.join(monitorPrefix, 'build');
  const monitorInstallPath = path.join(monitorPrefix, 'install');
  await cleanup(monitorBuildPath);
  await cleanup(monitorInstallPath);
  fs.mkdirSync(monitorBuildPath);

  shell.cd(monitorBuildPath);

  let ret = shell.exec(
    `cmake ..${process.platform === 'win32' ? ' -A Win32' : ''}`
  );
  if (ret.code !== 0) {
    logger.error('build depends window-monitor result', ret.stderror);
    process.exit(ret.code);
  }

  ret = shell.exec(
    `cmake --build . --config=${params.debug === true ? 'Debug' : 'Release'}`
  );
  if (ret.code !== 0) {
    logger.error('build depends window-monitor result', ret.stderror);
    process.exit(ret.code);
  }

  ret = shell.exec('cmake --install .');
  if (ret.code !== 0) {
    logger.error('build depends window-monitor result', ret.stderror);
    process.exit(ret.code);
  }

  shell.cd(__dirname);

  await cleanup(monitorBuildPath);

  logger.info('build depends window-monitor finished');
};

// trigger when run npm install
task('install', async () => {
  await buildWindowMonitor();
  await cleanup(path.join(__dirname, './build'));
  const params = {
    ...getArgvFromPkgJson(),
    arch: getArgvFromPkgJson().arch || process.arch,
    packageVersion,
  };
  return build(params);
});

task('depends', async () => {
  await buildWindowMonitor();
});
