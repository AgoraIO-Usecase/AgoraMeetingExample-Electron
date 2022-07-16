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

WScript.Echo index
WSCript.StdOut.Write index
pipe.Write(CStr(index))
WSCript.Sleep(1000)
loop


WScript.Quit(0)
