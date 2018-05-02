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

if Request.ServerVariables("REQUEST_METHOD") <> "POST" then
  ' nothing to do, we haven't been initialised properly
Else
    Dim Upload : Set Upload = New FreeASPUpload
    Dim outName, outDiskName, contentPath, selectedRuntime, ncId
    

	' Handle BMJ XML file - GetOneFileName returns name of uploaded file before it is saved
    'If InStr(Upload.GetOneFileName, ".xml") > 0 then
	'    
	'    Dim bmjPath, bmjName
	'    bmjPath = Server.MapPath("/courses/bmj")
	'    Call Upload.SaveOneRoutine(bmjPath, 0, outName, outDiskName, deleteZip)
	'    bmjName = JustFileNamePart(outDiskName)
    '	contentPath = bmjPath & "\" & bmjName
    '	
    '	If Not Config.FileSys.folderExists(contentPath) Then
    '		Config.FileSys.createFolder(contentPath)
    '	End If
'
'		' Copy in the base template COURSE for BMJ, the apply its template
'		Config.FileSys.CopyFolder Server.MapPath("/engine/templates/bmjcourse"), contentPath
'		Call ApplyLayout("bmj", "/courses/bmj/" & bmjName, true)
'
'		' Convert the upload to files in the course folder
'		Call ConvertBMJCourse (contentPath, outDiskName) ' fnXML
'
'		' Tell the database about our new course, and edit it
'		ncId = CreateANewCourseRecord(bmjName, "bmj", "") ' settings will be fixed during edit
'		response.write "<script type='text/javascript'>parent.location='/engine/pages/edit/?id=" & ncId & "';</script>"
'		response.end
'
'    Else

	Dim myUploadCOntainer : myUploadCOntainer = MyUserContainers() ' incMain
	If myUploadCOntainer = "*" then
		myUploadCOntainer = MyUserName ' "demo"
	End If

	Dim mappedUploadPath : mappedUploadPath = Config.CoursesPath & "\" & myUploadCOntainer

	Call Upload.SaveOneRoutine(mappedUploadPath, 0, outName, outDiskName, deleteZip)

	If outDiskName > "" Then
		
		outname = JustFileNamePart(outName)

    	selectedRuntime = lcase("" & Upload.Form("runtime"))
    
    	contentPath = mappedUploadPath & "\" & JustFileNamePart(outDiskName)

    	If Not Config.FileSys.folderExists(contentPath) Then
    		Config.FileSys.createFolder(contentPath)
    	End If
        
    	Dim estr, oExec
    	Dim unzip : unzip = Config.UnZipExe & " -o -qq " & QuoteOptional(mappedUploadPath & "\" & outDiskName) & " -d " & QuoteOptional(NoTrailingSlash(contentPath))
    	Set oExec = Config.Shell.Exec(unzip)
    	Do While (Not oExec.StdOut.AtEndOfStream)
    		oExec.StdOut.ReadAll()
    	Loop
    	Do While (Not oExec.StdErr.AtEndOfStream)
    		estr = estr & oExec.StdErr.ReadAll()
    	Loop
    	If CLng(estr) <> 0 then
    		' error unzipping
    		response.write "error uploading: " & estr
    		response.end
    	Else
    	
		'If selectedRuntime <> "zip" Then

			ApplyRuntime contentPath, outDiskName, "textplayer", true, true ' deleteZip, true

		'End If
		
		
			Dim uplConfig : uplConfig = IO.GetFileString(contentPath & "\SCO1\Configuration\settings.json", "")
			
			ncId = CreateANewCourseRecord(outName, myUploadCOntainer, uplConfig) ' name, container, config

			Set Config = Nothing
			Response.Redirect "/engine/pages/edit/?id=" & ncId

		'Call UploadFinished

    	End If
    End If

End If

Set Config = Nothing
%>