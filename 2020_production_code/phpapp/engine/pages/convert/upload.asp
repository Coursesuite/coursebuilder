<%@ Language=VBScript %>
<% 
option explicit 
Response.Expires = -1
response.buffer = false
Server.ScriptTimeout = 600
%>
<!-- #include virtual="/engine/lib/page_initialise.asp" -->
<!-- #include virtual="/engine/lib/incAspUpload.asp" -->
<!-- #include file="subroutines.asp" -->
<%
Dim aTemp, vTemp, sFile, eStr, oTemp

if Request.ServerVariables("REQUEST_METHOD") = "POST" then

	If Not Config.FileSys.FolderExists(Server.MapPath("/temp/Convert")) Then Config.FileSys.CreateFolder(Server.MapPath("/temp/Convert"))

	vTemp = "/temp/Convert/" & NewRefId2(true,true)
	aTemp = Server.MapPath(vTemp)
	Config.FileSys.CreateFolder(aTemp)

    Dim Upload : Set Upload = New FreeASPUpload
    Call Upload.Save(aTemp)
    sFile = Upload.GetOneFileName()
    Set Upload = Nothing

	Dim unzip : unzip = Config.UnZipExe & " -o -qq " & QuoteOptional(aTemp & "\" & sFile) & " -d " & QuoteOptional(aTemp)
	Dim oExec : Set oExec = Config.Shell.Exec(unzip)
	Do While (Not oExec.StdOut.AtEndOfStream)
		oExec.StdOut.ReadAll()
	Loop
	Do While (Not oExec.StdErr.AtEndOfStream)
		eStr = eStr & oExec.StdErr.ReadAll()
	Loop
	If CLng(eStr) <> 0 then
		response.write "error uploading: " & eStr
		response.end
	Else
	
		Set oTemp = JSON.parse("{}")
		oTemp.set "courseid", ImportElsevierCourseToDb(aTemp)

		Response.ContentType = "application/json"
		Response.Write JSON.stringify(oTemp)
		Set oTemp = Nothing
		
	End If

End If


%>

<!-- #include virtual="/engine/lib/page_terminate.asp" -->
