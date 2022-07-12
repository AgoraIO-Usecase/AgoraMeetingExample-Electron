const workerpool = require('workerpool');
const childprocess = require('child_process');

const spawn = async (commond, args) =>
  new Promise((resolve, reject) => {
    const res = childprocess.spawn(commond, args);
    res.on('error', (error) => {
      reject(error);
    });
    res.stdout.on('data', (data) => {
      resolve(data.toString());
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
      resolve(stdout);
    });
  });

workerpool.worker({
  spawn,
  spawnSync,
  exec,
});
