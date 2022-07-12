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
} from 'electron';
import log from 'electron-log';
import workerpool from 'workerpool';
import './utils/logtransports';
import './utils/crashreport';
import { spawn } from 'child_process';
import { appleScript, vbScript } from './utils/pptmonitor';
import { writeTempFile } from './utils/tempfile';

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

  private oldWindowBounds: Rectangle = { x: 0, y: 0, width: 1024, height: 768 };

  private pool: workerpool.WorkerPool = workerpool.pool(
    process.env.NODE_ENV === 'development'
      ? path.join(__dirname, 'worker.js')
      : path.join(process.resourcesPath, 'app.asar.unpacked/src/worker.js'),
    {
      workerType: 'process',
    }
  );

  private pptmonitorHandler: NodeJS.Timeout | undefined = undefined;

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
    //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
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

  private onFocusModeSwitch = (enable: boolean, displayId: number) => {
    log.info('app main ipc on focus-mode', enable, displayId);
    if (!this.mainWindow) return;

    if (enable) {
      this.oldWindowBounds = this.mainWindow.getBounds();

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
          x: this.oldWindowBounds.x,
          y: this.oldWindowBounds.y,
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
      this.mainWindow.setBounds(this.oldWindowBounds);
    }
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
  private onEnablePPTMonitor = async (enable: boolean) => {
    log.info('app main ipc on enable ppt monitor', enable);
    if (this.pptmonitorHandler !== undefined)
      clearInterval(this.pptmonitorHandler);

    if (enable) {
      if (process.platform === 'darwin')
        this.pptmonitorHandler = setInterval(() => {
          this.pool
            .exec('exec', [`osascript -e '${appleScript}'`])
            .then((result) => {
              const index = Number.parseInt(result, 10);
              this.mainWindow?.webContents.send('pptmonitor', index);
              return 0;
            })
            .catch((error) => {
              log.error('on pptmonitor script errorr', error);
            });
        }, 1000);
      else if (process.platform === 'win32') {
        const script = await writeTempFile(vbScript, '.vbs');
        this.pptmonitorHandler = setInterval(() => {
          this.pool
            .exec('spawn', ['cscript.exe', [script]])
            .then((result) => {
              this.mainWindow?.webContents.send('pptmonitor', result || 1);
              return 0;
            })
            .catch((error) => {
              log.error('on pptmonitor script error', error);
            });
        }, 1000);
      }
    } else {
      this.pptmonitorHandler = undefined;
    }
  };

  private registerIpc = () => {
    ipcMain.on(
      'focus-mode',
      (evt, ...args: [enable: boolean, displayId: number]) => {
        this.onFocusModeSwitch(args[0], args[1]);
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
