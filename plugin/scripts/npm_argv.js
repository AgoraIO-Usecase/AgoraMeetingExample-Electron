const path = require('path');
const { logger } = require('just-task');

module.exports.getArgvFromPkgJson = () => {
  const pkgPath = path.join(process.env.INIT_CWD, 'package.json');
  logger.info('parent pkg path:', pkgPath);

  // eslint-disable-next-line import/no-dynamic-require, global-require
  const pkgMeta = require(`${pkgPath}`);
  if (!pkgMeta.agora_plugin) return {};
  return {
    electronVersion: pkgMeta.agora_plugin.electron_version,
    platform: pkgMeta.agora_plugin.platform,
    msvsVersion: pkgMeta.agora_plugin.msvs_version,
    debug: pkgMeta.agora_plugin.debug === true,
    silent: pkgMeta.agora_plugin.silent === true,
    arch: pkgMeta.agora_plugin.arch,
  };
};
