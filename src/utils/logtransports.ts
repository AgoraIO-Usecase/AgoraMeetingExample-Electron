import log from 'electron-log';

// https://www.npmjs.com/package/electron-log

// console transports
log.transports.console.level = 'debug';
log.transports.console.format =
  '[{y}{m}{d} {h}:{i}:{s}.{ms}][{level}]{scope}{text}';

// file transports
// By default, it writes logs to the following locations:
// on Linux: ~/.config/{app name}/logs/{process type}.log
// on macOS: ~/Library/Logs/{app name}/{process type}.log
// on Windows: %USERPROFILE%\AppData\Roaming\{app name}\logs\{process type}.log
log.transports.file.level = 'debug';
log.transports.file.fileName = 'main.log';
log.transports.file.format = '[{y}{m}{d} {h}:{i}:{s}.{ms}][{level}]{text}';
log.transports.file.maxSize = 1048576;
