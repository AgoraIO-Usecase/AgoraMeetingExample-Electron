/* eslint-disable no-lonely-if */
/* eslint-disable global-require */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import {
  app,
  BrowserWindow,
  shell,
  globalShortcut,
  ipcMain,
  screen,
  Rectangle,
  systemPreferences,
} from 'electron';
import log from 'electron-log';
import workerpool from 'workerpool';
import './utils/logtransports';
import './utils/crashreport';
import { ChildProcess, execFile, ExecException } from 'child_process';
import AgoraPlugin, {
  WindowMonitorErrorCode,
  WindowMonitorEventType,
} from 'agora-plugin';
import { appleScript } from './utils/pptmonitor';
import { PipeServer } from './utils/pipe';

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

class AgoraMeeting {
  private mainWindow: BrowserWindow | null = null;

  private focusModeParams: {
    oldWindowBounds: Rectangle;
    isDisplay: boolean;
    targetId: number;
  } = {
    oldWindowBounds: { x: 0, y: 0, width: 1024, height: 768 },
    isDisplay: true,
    targetId: 0,
  };

  private pool: workerpool.WorkerPool = workerpool.pool(
    process.env.NODE_ENV === 'development'
      ? path.join(__dirname, 'worker.js')
      : path.join(process.resourcesPath, 'app.asar.unpacked/src/worker.js'),
    {
      workerType: 'process',
    }
  );

  private pptmonitor: {
    handler?: NodeJS.Timeout | undefined;
    pip?: PipeServer | undefined;
    cp?: ChildProcess | undefined;
  } = {};

  constructor() {
    this.initialize();
  }

  private initialize = () => {
    app.allowRendererProcessReuse = false;
  };

  private createMainWindow = () => {
    const RESOURCES_PATH = app.isPackaged
      ? path.join(process.resourcesPath, 'assets')
      : path.join(__dirname, '../assets');

    const getAssetPath = (...paths: string[]): string => {
      return path.join(RESOURCES_PATH, ...paths);
    };

    this.mainWindow = new BrowserWindow({
      show: false,
      width: 1024,
      height: 768,
      minWidth: 1024,
      minHeight: 768,
      icon: getAssetPath('icon.png'),
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
      },
      transparent: true,
      frame: false,
      enableLargerThanScreen: true,
      titleBarStyle: 'hiddenInset',
      backgroundColor: process.platform === 'win32' ? '#00000000' : '#000000',
    });

    if (process.env.NODE_ENV !== 'production')
      this.mainWindow.webContents.openDevTools({
        mode: 'detach',
        activate: true,
      });

    this.mainWindow.loadURL(`file://${__dirname}/index.html`);

    // @TODO: Use 'ready-to-show' event
    // https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
    this.mainWindow.webContents.on('did-finish-load', () => {
      if (!this.mainWindow) {
        throw new Error('"mainWindow" is not defined');
      }
      if (process.env.START_MINIMIZED) {
        this.mainWindow.minimize();
      } else {
        this.mainWindow.show();
        this.mainWindow.focus();
      }
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    this.mainWindow.setMenu(null);
  };

  private registerShortCut = () => {
    globalShortcut.register('ctrl+p', () => {
      this.mainWindow?.webContents.openDevTools({
        mode: 'detach',
        activate: true,
      });
    });
  };

  private switchFocusModeByDisplay = (enable: boolean, displayId: number) => {
    if (!this.mainWindow) return;

    if (enable) {
      this.focusModeParams.oldWindowBounds = this.mainWindow.getBounds();

      let display: Electron.Display;

      // Find target display by display id
      // There have a known issue here, coz displayId is just index value from
      // ::EnumDisplayMonitors in windows, and is not equal the display.id from electron
      // so find specified display by id in windows will always be null
      // we can find specified display by bounds when agora-sdk support return bounds
      if (displayId !== undefined) {
        // eslint-disable-next-line prefer-destructuring
        display = screen
          .getAllDisplays()
          .filter((item) => item.id === displayId)[0];
      } else {
        display = screen.getDisplayNearestPoint({
          x: this.focusModeParams.oldWindowBounds.x,
          y: this.focusModeParams.oldWindowBounds.y,
        });
      }

      log.info('app main ipc on focus-mode find specified display', display);

      if (!display) display = screen.getPrimaryDisplay();

      const { width, height, x, y } = display.bounds;
      this.mainWindow.setPosition(x, y);
      this.mainWindow.setSize(width, height);
    }

    if (process.platform === 'darwin') {
      if (enable) {
        app.dock.hide();
        this.mainWindow.setTrafficLightPosition({ x: -20, y: -20 });
      } else {
        app.dock.show();
        this.mainWindow.setTrafficLightPosition({ x: 0, y: 0 });
      }
      this.mainWindow.setFullScreenable(!enable);
      this.mainWindow.setVisibleOnAllWorkspaces(enable, {
        visibleOnFullScreen: true,
      });
      this.mainWindow.setBackgroundColor(enable ? '#00000000' : '#000000');
    }

    this.mainWindow.setHasShadow(!enable);
    this.mainWindow.setMovable(!enable);
    this.mainWindow.setResizable(!enable);
    this.mainWindow.setFullScreen(enable && process.platform !== 'darwin');
    BrowserWindow.fromWebContents(
      this.mainWindow.webContents
    )?.setIgnoreMouseEvents(enable, { forward: true });
    this.mainWindow.setAlwaysOnTop(enable, 'screen-saver');

    if (!enable) {
      this.mainWindow.setBounds(this.focusModeParams.oldWindowBounds);
    }
  };

  private switchFocusModeByWindow = (enable: boolean, windowId: number) => {
    if (!this.mainWindow) return;

    if (enable) {
      this.focusModeParams.oldWindowBounds = this.mainWindow.getBounds();
      const ret = AgoraPlugin.registerWindowMonitor(
        windowId,
        (winId, event, bounds) => {
          if (!this.mainWindow) return;

          if (event === WindowMonitorEventType.Moved) {
            let display: Electron.Display;
            display = screen.getDisplayMatching({
              x: bounds.left,
              y: bounds.top,
              width: bounds.right - bounds.left,
              height: bounds.bottom - bounds.top,
            });

            if (!display) display = screen.getPrimaryDisplay();

            const { width, height, x, y } = display.bounds;
            this.mainWindow.setPosition(x, y);
            this.mainWindow.setSize(width, height);
          }

          // convert bounds from screen postion to client position
          const windowBounds = this.mainWindow.getBounds();
          this.mainWindow.webContents.send('window-monitor', event, {
            x: bounds.left - windowBounds.x,
            y: bounds.top - windowBounds.y,
            width: bounds.right - bounds.left,
            height: bounds.bottom - bounds.top,
          });
        }
      );
      log.info('app register window monitor result ', ret);

      if (ret !== WindowMonitorErrorCode.Success) return;
    } else {
      AgoraPlugin.unregisterWindowMonitor(windowId);

      this.mainWindow.setBounds(this.focusModeParams.oldWindowBounds);
    }

    if (process.platform === 'darwin') {
      if (enable) {
        app.dock.hide();
        this.mainWindow.setTrafficLightPosition({ x: -20, y: -20 });
      } else {
        app.dock.show();
        this.mainWindow.setTrafficLightPosition({ x: 0, y: 0 });
      }
      this.mainWindow.setFullScreenable(!enable);
      this.mainWindow.setVisibleOnAllWorkspaces(enable, {
        visibleOnFullScreen: true,
      });
      this.mainWindow.setBackgroundColor(enable ? '#00000000' : '#000000');
    }

    this.mainWindow.setHasShadow(!enable);
    this.mainWindow.setMovable(!enable);
    this.mainWindow.setResizable(!enable);
    BrowserWindow.fromWebContents(
      this.mainWindow.webContents
    )?.setIgnoreMouseEvents(enable, { forward: true });
    this.mainWindow.setAlwaysOnTop(enable, 'screen-saver');
  };

  private onFocusModeSwitch = (
    enable: boolean,
    isDisplay: boolean,
    targetId: number
  ) => {
    log.info('app main ipc on focus-mode', enable, isDisplay, targetId);

    // in case that user leave meeting will trigger focus-mode without correct
    // parameters
    if (enable) {
      if (isDisplay) this.switchFocusModeByDisplay(true, targetId);
      else this.switchFocusModeByWindow(true, targetId);

      this.focusModeParams.isDisplay = isDisplay;
      this.focusModeParams.targetId = targetId;
    } else if (this.focusModeParams.isDisplay)
      this.switchFocusModeByDisplay(false, this.focusModeParams.targetId);
    else this.switchFocusModeByWindow(false, this.focusModeParams.targetId);
  };

  private onSetIgnoreMouseEvents = (ignore: boolean, forward: boolean) => {
    log.info('app main ipc on set-ignore-mouse-events', ignore, forward);
    this.mainWindow?.setIgnoreMouseEvents(ignore, { forward });
  };

  private onOpenExternal = (url: string) => {
    shell.openExternal(url);
  };

  // coz macos has bug here with spawn, spawn will spend a lot of time
  // in Big Sur with electron 12 so we use workerpool to work around
  // https://github.com/electron/electron/issues/26143
  // applescript can not use namedpipe so we call applescript directly
  private enablePPTMonitorMac = async (enable: boolean) => {
    if (this.pptmonitor.handler !== undefined)
      clearInterval(this.pptmonitor.handler);

    if (enable) {
      // do not know why, the pptMonitor works fine but
      // will not trigger the callback function
      // this.pool.exec('pptMonitor', [appleScript], {
      //   on: (payload: {
      //     signal: 'ppt-monitor-error' | 'ppt-monitor-index';
      //     error?: ExecException;
      //     index?: number;
      //   }) => {
      //     const { signal, error, index } = payload;
      //     log.info('on pptmonitor result', signal, error, index);
      //   },
      // });
      this.pptmonitor.handler = setInterval(() => {
        this.pool
          .exec('exec', [`osascript -e '${appleScript}'`])
          .then((result) => {
            const index = Number.parseInt(result, 10);
            log.info('on pptmonitor result', index);
            this.mainWindow?.webContents.send('pptmonitor', index);
            return 0;
          })
          .catch((error) => {
            log.error('on pptmonitor script errorr', error);
          });
      }, 1000);
    } else {
      this.pptmonitor.handler = undefined;
      this.pool.terminate(true);
    }
  };

  // spawn/exec/execFile will show hourglass mouse effect erveyr time
  // so we can use named pipe with vbs script process or write your
  // own native addon to replace execFile
  private enablePPTMonitorWin = async (enable: boolean) => {
    if (enable) {
      // we can not use pipe any moe coz:
      // 1.app need to run as admin
      // 2.vbs can not get ppt object when run admin
      // 3.vbs pipe can not connect to named pipe which is running as admin
      // this.pptmonitor.pip = new PipeServer();
      // this.pptmonitor.pip.listen('AgoraMeeting');
      // this.pptmonitor.pip.on('data', (data) => {
      //   const index = Number.parseInt(data, 10);
      //   this.mainWindow?.webContents.send('pptmonitor', index);
      // });

      // coz windows defender will treate vbs as virus
      // so we need to convert vbs to exe with scriptcrypto and sign it
      const script =
        process.env.NODE_ENV === 'development'
          ? path.join(__dirname, '../extraResources/agora-pptmonitor.exe')
          : path.join(
              process.resourcesPath,
              '/extraResources/agora-pptmonitor.exe'
            );

      // https://nodejs.org/api/child_process.html#child_processexecfilefile-args-options-callback
      this.pptmonitor.cp = execFile(script);
      this.pptmonitor.cp.stdout?.on('data', (data: string) => {
        const index = Number.parseInt(data, 10);
        // log.info('on pptmonitor data', index);
        this.mainWindow?.webContents.send('pptmonitor', index);
      });
    } else {
      if (this.pptmonitor.cp) this.pptmonitor.cp.kill();
      if (this.pptmonitor.pip) this.pptmonitor.pip.close();
      this.pptmonitor.pip = undefined;
      this.pptmonitor.cp = undefined;
    }
  };

  // maybe we can use addin, but have not found solutation to install addin
  // by script yet
  private onEnablePPTMonitor = async (enable: boolean) => {
    log.info('app main ipc on enable ppt monitor', enable);
    if (process.platform === 'darwin') await this.enablePPTMonitorMac(enable);
    else if (process.platform === 'win32')
      await this.enablePPTMonitorWin(enable);
    else
      log.error(
        'app main ipc on enable ppt monitor on invalid platform',
        process.platform
      );
  };

  private registerIpc = () => {
    ipcMain.on(
      'focus-mode',
      (evt, ...args: [enable: boolean, isDisplay: boolean, target: number]) => {
        this.onFocusModeSwitch(args[0], args[1], args[2]);
      }
    );

    ipcMain.on(
      'set-ignore-mouse-events',
      (evt, ...args: [ignore: boolean, opts: { forward: boolean }]) => {
        this.onSetIgnoreMouseEvents(args[0], args[1].forward);
      }
    );

    ipcMain.on('open-external', (event, url) => {
      this.onOpenExternal(url);
    });

    ipcMain.on('pptmonitor', (evt, enable: boolean) => {
      this.onEnablePPTMonitor(enable);
    });
  };

  public start = () => {
    app.on('ready', () => {
      log.info('app initialized..............');
      this.createMainWindow();
      this.registerShortCut();
      this.registerIpc();

      log.info(
        `preferences camera: ${systemPreferences.getMediaAccessStatus(
          'camera'
        )}`
      );
      log.info(
        `preferences mic: ${systemPreferences.getMediaAccessStatus(
          'microphone'
        )}`
      );
      log.info(
        `preferences screen: ${systemPreferences.getMediaAccessStatus(
          'screen'
        )}`
      );

      if (systemPreferences.askForMediaAccess) {
        // in newest macOS, we should ask for media access
        systemPreferences.askForMediaAccess('camera');
        systemPreferences.askForMediaAccess('microphone');
      }
    });
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (this.mainWindow === null) this.createMainWindow();
    });
    app.on('window-all-closed', () => {
      log.info('app uninitialized..............\r\n\r\n');
      // Respect the OSX convention of having the application in memory even
      // after all windows have been closed
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
  };
}

new AgoraMeeting().start();
