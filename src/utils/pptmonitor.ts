import { ipcRenderer } from 'electron';

const appleScript = `
tell application "Microsoft PowerPoint"
  ##coz slide index start from 1, so we use 1 as default page
	set activedSlideIndex to 1

	set activedWindow to active window
	set activedPresentation to active presentation
	if activedWindow is not missing value then
		set activedSlideIndex to slide index of slide of view of activedWindow
	else if activedPresentation is not missing value then
		set activedSlideIndex to slide index of slide of slide show view of activedWindow
	end if

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

const startPPTMonitor = async (cb: (index: number) => void) => {
  ipcRenderer.on('pptmonitor', (evt, index) => {
    cb(index);
  });
  ipcRenderer.send('pptmonitor', true);
};

const stopPPTMonitor = () => {
  ipcRenderer.removeAllListeners('pptmonitor');
  ipcRenderer.send('pptmonitor', false);
};

export { appleScript, vbScript, startPPTMonitor, stopPPTMonitor };
