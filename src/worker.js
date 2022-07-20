const workerpool = require('workerpool');
const childprocess = require('child_process');

const spawn = async (commond, args) =>
  new Promise((resolve, reject) => {
    const res = childprocess.spawn(commond, args);
    res.on('error', (error) => {
      reject(error);
    });
    res.stdout.on('data', (code) => {
      resolve(code.toString());
    });
    res.stdin.end();
  });

const spawnSync = async (commond, args) =>
  new Promise((resolve, reject) => {
    const res = childprocess.spawnSync(commond, args);
    if (res.error) reject(res.error);
    resolve(res.stdout.toString());
  });

const exec = async (commond) =>
  new Promise((resolve, reject) => {
    childprocess.exec(commond, (error, stdout, stderror) => {
      if (error) reject(error);
      resolve(stdout.toString());
    });
  });

const execFile = async (file) =>
  new Promise((resolve, reject) => {
    try {
      const res = childprocess.execFile(file);
      res.on('error', (error) => {
        reject(error);
      });
      res.on('exit', (code) => {
        resolve(code);
      });
    } catch (error) {
      reject(error);
    }
  });

const pptMonitor = (scripts) => {
  setInterval(() => {
    childprocess.exec(
      `osascript -e '${scripts}'`,
      (error, stdout, stderror) => {
        if (error) {
          workerpool.workerEmit({
            signal: 'ppt-monitor-error',
            error,
          });
          return;
        }

        workerpool.workerEmit({
          signal: 'ppt-monitor-index',
          index: Number.parseInt(stdout, 10),
        });
      }
    );
  }, 1000);
};

workerpool.worker({
  spawn,
  spawnSync,
  exec,
  execFile,
  pptMonitor,
});
