<%@ Language=VBScript %>
<% 
option explicit 
Response.Expires = -1
response.buffer = false
Server.ScriptTimeout = 600
%>
<!-- #include virtual="/engine/lib/page_initialise.asp" -->
<!-- #include virtual="/engine/lib/incASPUpload.asp" -->
<%
if Request.ServerVariables("REQUEST_METHOD") <> "POST" then

Else
	Response.ContentType = "application/json"
	Dim Upload : Set Upload = New FreeASPUpload
	Dim my_personal_container_name : my_personal_container_name = Trim("" & Request.Cookies("username"))
	Dim containerPath : containerPath = Server.MapPath("/courses/" & my_personal_container_name)
	If Not Config.FileSys.FolderExists(containerPath) then
		Call Config.FileSys.CreateFolder(containerPath)
	End If

	Dim outName, outDiskName, index, outNameCopy
	Call Upload.SaveOneRoutine(containerPath, 0, outName, outDiskName, true)
	Set Upload = Nothing

	If outDiskName > "" Then
		outName = JustFileNamePart(outName)
		outNameCopy = outName
		index = 1
		While Config.FileSys.FolderExists(containerPath & "\" & outName)
			outName = outNameCopy & "_" & index
			index = index + 1
		Wend

		If Not Config.FileSys.FolderExists(containerPath & "\" & outName) then
			Call Config.FileSys.CreateFolder(containerPath & "\" & outName)
		End If
		
		Dim estr, stdout, oExec
		Dim unzip : unzip = Config.UnZipExe & " -o -qq " & QuoteOptional(containerPath & "\" & outDiskName) & " -d " & QuoteOptional(NoTrailingSlash(containerPath & "\" & outName))
		Set oExec = Config.Shell.Exec(unzip)
		
		Do While (Not oExec.StdOut.AtEndOfStream)
			stdout = stdout & oExec.StdOut.ReadAll()
		Loop
		Do While (Not oExec.StdErr.AtEndOfStream)
			estr = estr & oExec.StdErr.ReadAll()
		Loop

		' delete the zip
		Call Config.FileSys.DeleteFile (containerPath & "\" & outDiskName)

		If CLng(estr) <> 0 then
			Response.Write "{""StdErr"":" & estr & ",""StdOut"": """ & stdout & """}"
			Response.End
		Else
			Dim ncId : ncId = CreateANewCourseRecord(outName, my_personal_container_name, null)
			Response.Write "{""courseid"":" & ncId & ",""StdErr"":" & estr & ",""StdOut"": """ & stdout & """}"
			Response.End
		End If
	End If

End If

Set Config = Nothing
%>