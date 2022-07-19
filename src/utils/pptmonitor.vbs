' ScriptCryptor Project Options Begin
' HasVersionInfo: Yes
' Companyname: Agora
' Productname: AgoraPowerPointMonitor
' Filedescription: Agora PowerPoint Monitor
' Copyrights: agora
' Trademarks: agora
' Originalname: agora-pptmonitor.exe
' Comments: agora
' Productversion:  1. 1. 1. 1
' Fileversion:  1. 1. 1. 1
' Internalname:
' Appicon:
' AdministratorManifest: No
' ScriptCryptor Project Options End
' open named pipe


'Dim fs,pipe
'Set fs = CreateObject("Scripting.FileSystemObject")
'On Error Resume Next
'Set pipe = fs.OpenTextFile("\\.\pipe\AgoraMeeting",8,False,0)
'If Err.Number <> 0 Then
'WScript.StdErr.Write Err.Description
'WScript.Quit(1)
'End If

'If IsEmpty(pipe) Then
'WScript.Quit(1)
'End If

'coz slide index start from 1, so we use 1 as default page
On Error Resume Next
Set objPPT = CreateObject("PowerPoint.Application")
If Err.Number <> 0 Then
WScript.StdErr.Write Err.Description
WScript.Quit(2)
End If

' loop to get ppt slide index
do
Dim caption,posLeft,posTop,index

caption=""
posLeft=0
posTop=0
index=1

Set activePresentation = objPPT.ActivePresentation
On Error Resume Next
Set activePresentationSlideShowWindow = activePresentation.SlideShowWindow
If Err.Number = 0 Then
index = activePresentationSlideShowWindow.View.Slide.SlideIndex
posLeft = activePresentationSlideShowWindow.Left
posTop = activePresentationSlideShowWindow.Top
caption = activePresentation.Name
Else
On Error Resume Next
Set activeWindow = objPPT.ActiveWindow
If Err.Number = 0 Then
index = activeWindow.View.Slide.SlideIndex
posLeft = activeWindow.Left
posTop = activeWindow.Top
caption = activeWindow.Caption
End If
End If

WSCript.StdOut.Write(CStr(index))
'pipe.Write(CStr(index))
WSCript.Sleep(1000)
loop


WScript.Quit(0)
