<%@ Language=VBScript %>
<% 
option explicit 
Response.Expires = -1
response.buffer = false
Server.ScriptTimeout = 600
' All communication must be in UTF-8, including the response back from the request
'Session.CodePage  = 65001
%>
<!-- #include file="lib/page_initialise.asp" -->
<!-- #include file="lib/incASPUpload.asp" -->
<%

'Dim config : Set config = New clsConfig

'db.openDefault()

Dim deleteZip
deleteZip = true

if Request.ServerVariables("REQUEST_METHOD") <> "POST" then response.end

Dim Upload : Set Upload = New FreeASPUpload
Dim outName, outDiskName, contentPath, selectedRuntime, ncId
    
'	Handle BMJ XML file - GetOneFileName returns name of uploaded file before it is saved
If InStr(Upload.GetOneFileName, ".xml") = 0 then response.end


Dim mappedUploadPath : mappedUploadPath = Config.CoursesPath & "\bmj"
   
Call Upload.SaveOneRoutine(mappedUploadPath, 0, outName, outDiskName, deleteZip)

Dim bmjName : bmjName = JustFileNamePart(outDiskName)

contentPath = mappedUploadPath & "\" & bmjName
	
If Not Config.FileSys.folderExists(contentPath) Then
	Config.FileSys.createFolder(contentPath)
End If

' Copy in the base template COURSE for BMJ, the apply its template
Config.FileSys.CopyFolder Server.MapPath("/engine/templates/bmjcourse"), contentPath
Call fnSettings_ApplyLayout("coursesuite", Config.CoursesPathVirtual & "/bmj/" & bmjName, true)

' Convert the upload to files in the course folder
Call ConvertBMJCourse (contentPath, outDiskName) ' fnXML

' Tell the database about our new course, and edit it
ncId = CreateANewCourseRecord(bmjName, "bmj", "") ' settings will be fixed during edit
response.redirect ("/engine/pages/edit/?id=" & ncId)

Set Config = Nothing
%>