<% Option Explicit %>
<%
'-----------------------------------------
'constants
Const RESIZER_FILE_NAME="ShadowResizer.exe"
Const ORIGINAL_IMAGE_NAME="sample_picture.jpg"
Const THUMB_IMAGE_NAME="sample_picture_thumb.jpg"
'-----------------------------------------

'-----------------------------------------
'methods
Sub Resize()
	Dim objShell, strCommand
	Set objShell = Server.CreateObject("WScript.Shell")
	strCommand = Server.MapPath(RESIZER_FILE_NAME) & " " & Server.MapPath(ORIGINAL_IMAGE_NAME)
	If IsNumeric(Request("width")) Then
		strCommand = strCommand & " -width=" & Request("width")
	End If
	If IsNumeric(Request("height")) Then
		strCommand = strCommand & " -height=" & Request("height")
	End If
	strCommand = strCommand & " -saveas=" & Server.MapPath(THUMB_IMAGE_NAME)
	objShell.Run strCommand, 0, True
	Set objShell=Nothing
End Sub
'-----------------------------------------

'-----------------------------------------
'main
If Request("action")="1" Then
	Call Resize()
End If
'-----------------------------------------
%>
<html>
<head>
<title>Shadow Resizer Example</title>
</head>
<body>
Original image: <img src="<%=ORIGINAL_IMAGE_NAME%>" /><br />
<% If Request("action")="1" Then %>
New image: <img src="<%=THUMB_IMAGE_NAME%>" /><br />
<% End If %>
<form action="<%=Request.ServerVariables("Script_Name")%>">
<input type="hidden" name="action" value="1" />
Width: <input type="text" name="width" value="<%=Request("width")%>" />(empty to smart resize by height)<br />
Height: <input type="text" name="height" value="<%=Request("height")%>" />(empty to smart resize by width)<br />
<button type="submit">Resize</button>
</form>
</body>
</html>