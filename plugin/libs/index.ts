const enum WindowMonitorEventType {
  Unknown = 0,
  Focused = 1,
  UnFocused = 2,
  Moved = 3,
  Moving = 4,
  Resized = 5,
  Shown = 6,
  Hide = 7,
  Minimized = 8,
  Maxmized = 9,
  Restore = 10,
}

const enum WindowMonitorErrorCode {
  Success = 0,
  NoRights = 1,
  AlreadyExist = 2,
  ApplicationNotFound = 3,
  WindowNotFound = 4,
  CreateObserverFailed = 5,
}

declare type WindowMonitorBounds = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

declare interface IAgoraPlugin {
  registerWindowMonitor: (
    winId: number,
    callback: (
      winId: number,
      event: WindowMonitorEventType,
      bounds: WindowMonitorBounds
    ) => void
  ) => WindowMonitorErrorCode;
  unregisterWindowMonitor: (winId: number) => void;
  getWindowRect: (winId: number) => WindowMonitorBounds;
}

const AgoraPlugin: IAgoraPlugin = require('../build/Release/agora_plugin.node');

export { WindowMonitorEventType, WindowMonitorErrorCode, WindowMonitorBounds };
export default AgoraPlugin;
