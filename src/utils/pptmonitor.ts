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
		set activedSlideIndex to slide index of slide of slide show view of slide show window of activedPresentation
	end if

	return activedSlideIndex
end tell
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

export { appleScript, startPPTMonitor, stopPPTMonitor };
