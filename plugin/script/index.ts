declare enum WindowMonitorEventType {
  Unknown = 0,
  Focused = 1,
  UnFocused = 2,
  Moved = 3,
  Moving = 4,
  Resizing = 5,
  Resized = 6,
  Shown = 7,
  Hide = 8,
  Minimized = 9,
  Maxmized = 10,
  FullScreen = 11,
  Restore = 12,
}

declare enum WindowMonitorErrorCode {
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
}

const AgoraPlugin: IAgoraPlugin = require('../build/Release/agora_plugin.node');

export { WindowMonitorEventType, WindowMonitorErrorCode, WindowMonitorBounds };

export default AgoraPlugin;
