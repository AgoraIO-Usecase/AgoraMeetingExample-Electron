import AppleScript from 'applescript';
import * as WorkerTimers from 'worker-timers';
import { spawn } from 'child_process';
import log from 'electron-log';
import { writeTempFile } from '../../../utils/tempfile';

const appleScript = `
tell application "Microsoft PowerPoint"
  ##coz slide index start from 1, so we use 1 as default page
	#set activedWindowCaption to ""
	#set activedWindowLeft to 0
	#set activedWindowTop to 0
	set activedSlideIndex to 1

	set activedWindow to active window
	set activedPresentation to active presentation
	if activedWindow is not missing value then
		# get properties of activedWindow
		#set activedWindowCaption to caption of activedWindow
		#set activedWindowLeft to left position of activedWindow
		#set activedWindowTop to top of activedWindow
		set activedSlideIndex to slide index of slide of view of activedWindow
	else if activedPresentation is not missing value then
		#get properties of activedPresentation
		#set activedWindowCaption to name of activedPresentation
		#set activedWindow to slide show window of activedPresentation
		#set activedWindowLeft to left position of activedWindow
		#set activedWindowTop to top of activedWindow
		set activedSlideIndex to slide index of slide of slide show view of activedWindow
	end if

	#get properties

	return activedSlideIndex
end tell
`;

const vbScript = `
''coz slide index start from 1, so we use 1 as default page
On Error Resume Next
Set objPPT = CreateObject("PowerPoint.Application")
If Err.Number <> 0 Then
WScript.Quit(1)
End If
Dim caption,posLeft,posTop,index

caption=""
posLeft=0
posTop=0
index=1

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

WScript.Quit(index)

`;

const startMacPPTMonitor = async (
  cb: (index: number) => void,
  interval: number
) => {
  return WorkerTimers.setInterval(() => {
    AppleScript.execString(appleScript, (err: any, rtn: string) => {
      if (err) {
        log.error('ppt monitor error:', err);
        return;
      }
      cb(Number.parseInt(rtn, 10));
    });
  }, interval) as number;
};

const startWinPPTMonitor = async (
  cb: (index: number) => void,
  interval: number
) => {
  const path = await writeTempFile(vbScript, '.vbs');
  return WorkerTimers.setInterval(() => {
    const res = spawn('cscript.exe', [path]);
    res.on('exit', (code) => {
      cb(code || 1);
    });
  }, interval) as number;
};

const startPPTMonitor = async (
  cb: (index: number) => void,
  interval = 1500
) => {
  if (process.platform === 'darwin') return startMacPPTMonitor(cb, interval);
  if (process.platform === 'win32') return startWinPPTMonitor(cb, interval);

  // not support for other platforms
  return undefined;
};

const stopPPTMonitor = (monitorHandler: number | undefined) => {
  if (monitorHandler !== undefined) WorkerTimers.clearInterval(monitorHandler);
};

export { startPPTMonitor, stopPPTMonitor };
