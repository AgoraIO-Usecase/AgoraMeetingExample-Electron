
' open named pipe

Dim fs,pipe
Set fs = CreateObject("Scripting.FileSystemObject")
On Error Resume Next
Set pipe = fs.OpenTextFile("\\.\pipe\AgoraMeeting",8,False,0)
IF Err.Number <> 0 Then
WSCript.Quit(1)
End If

If IsEmpty(pipe) Then
WScript.Quit(1)
End If

'coz slide index start from 1, so we use 1 as default page
On Error Resume Next
Set objPPT = CreateObject("PowerPoint.Application")
If Err.Number <> 0 Then
WScript.Quit(1)
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

pipe.Write(CStr(index))
WSCript(1000)
loop


WScript.Quit(index)
