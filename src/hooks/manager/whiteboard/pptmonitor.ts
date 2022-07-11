import AppleScript from 'applescript';
import * as WorkerTimers from 'worker-timers';
import log from 'electron-log';

const appleScript = `
tell application "Microsoft PowerPoint"
	set activedWindowCaption to ""

	set activedWindow to active window
	set activedPresentation to active presentation
	if activedWindow is not missing value then
		set activedSlideIndex to slide index of slide of view of activedWindow
	else if activedPresentation is not missing value then
		set activedSlideIndex to slide index of slide of slide show view of activedWindow
	end if

	#get properties

	return activedSlideIndex
end tell
`;

const vbScript = `
Set objPPT = CreateObject("PowerPoint.Application")
Dim caption,posLeft,posTop,index

caption=""
posLeft=0
posTop=0
index=-1

On Error Resume Next
Set activeWindow = objPPT.ActiveWindow
If Err.Number = 0 Then
index = activeWindow.View.Slide.SlideIndex
posLeft = activeWindow.Left
posTop = activeWindow.Top
caption = activeWindow.Caption
Else
Set activePresentation = objPPT.ActivePresentation
index = activePresentation.SlideShowWindow.View.Slide.SlideIndex
posLeft = activePresentation.SlideShowWindow.Left
posTop = activePresentation.SlideShowWindow.Top
caption = activePresentation.Name
End If

'MsgBox index

WScript.Quit index
`;

const startMacPPTMonitor = (cb: (index: number) => void, interval: number) => {
  return WorkerTimers.setInterval(() => {
    AppleScript.execString(appleScript, (err: any, rtn: string) => {
      if (err) {
        log.error('ppt monitor error:', err);
        return;
      }
      cb(Number.parseInt(rtn, 10));
    });
  }, interval);
};

const startWinPPTMonitor = (cb: (index: number) => void, interval: number) => {
  return undefined;
};

const startPPTMonitor = (cb: (index: number) => void, interval = 1500) => {
  if (process.platform === 'darwin') return startMacPPTMonitor(cb, interval);
  if (process.platform === 'win32') return startWinPPTMonitor(cb, interval);

  // not support for other platforms
  return undefined;
};

const stopPPTMonitor = (monitorHandler: number | undefined) => {
  if (monitorHandler !== undefined) WorkerTimers.clearInterval(monitorHandler);
};

export { startPPTMonitor, stopPPTMonitor };
