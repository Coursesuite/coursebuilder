<%

''
''	stub to call after an upload occurs (which happens inside an iframe)
''
Sub UploadFinished
	response.write "<script type='text/javascript'>parent.$('#dialog-message').dialog('close');parent.location=parent.location;</script>"
End Sub







''
''	Looks in DB to work out who (if any) flagged the course, returns that name
''
Function GetLabel(ByVal key)
Dim u
	GetLabel = ""
	Set u = db.getRS("select colour from label where `key` = '{0}'", key)
	If Not (u.bof and u.eof) then
		GetLabel = u("colour")
	end if
	set u = nothing
End Function






''
''	Does a course have a todo?
''
Function GetCourseTodoCount(ByVal course)
	GetCourseTodoCount = db.count("todo", "course = '" & db.SQLSafe(course) & "' and  (complete is null or complete = '' or complete = 0)")
End Function





Function PlayerEngineVersionIsOlderThanGlobal(CourseFolder)
	PlayerEngineVersionIsOlderThanGlobal = false
	Dim Settings : Call GetSettingsJSON(CourseFolder, Settings)
	If Not (Settings Is Nothing) Then
		If CLng(Replace(Settings.engine.version,".","")) < CLng(Replace(Config.TextPlayerTemplateVersion,".","")) Then
			PlayerEngineVersionIsOlderThanGlobal = True
		End If
		Set Settings = Nothing
	End If
End Function






''
'' Do any actions that we might need to before downloading (like turning off debugging, compiling less, etc)
''
Sub ChangeFilesForZipAndDownload(byval path, byref actions)
Dim i, fileString, strOutput
	If ubound(actions) > 0 Then ' means these actions were done, so we need to un-do what they did
		For i = 0 to ubound(actions)
			select case actions(i)
				case "less"
					fileString = IO.LoadFileStream(path & "\SCO1\en-us\Content.html")
					fileString = Replace(fileString, "<link rel=""stylesheet"" type=""text/css"" href=""../Layout/less/app.css"">", "<link rel=""stylesheet/less"" type=""text/css"" href=""../Layout/less/app.less"" />")
					strOutput = "<!-- libraries -->" & vbNewLine &_
								"		<script>less = {env: ""development"", poll: 5001}</script>" & vbNewLine &_
								"		<script type=""text/javascript"" src=""../Layout/js/libs/less-1.3.3.min.js""></script>" & vbNewLine &_
								"		<script>less.watch();</script>"
					fileString = Replace(fileString, "<!-- libraries -->", strOutput)
					Call IO.WriteUTF8WithoutBOM(path & "\SCO1\en-us\Content.html", fileString)

					fileString = IO.LoadFileStream(path & "\SCO1\en-us\Quiz.html")
					fileString = Replace(fileString, "<link rel=""stylesheet"" type=""text/css"" href=""../Layout/less/app.css"">", "<link rel=""stylesheet/less"" type=""text/css"" href=""../Layout/less/app.less"" />")
					strOutput = "<!-- libraries -->" & vbNewLine &_
								"		<script>less = {env: ""development"", poll: 5001}</script>" & vbNewLine &_
								"		<script type=""text/javascript"" src=""../Layout/js/libs/less-1.3.3.min.js""></script>" & vbNewLine &_
								"		<script>less.watch();</script>"
					fileString = Replace(fileString, "<!-- libraries -->", strOutput)
					Call IO.WriteUTF8WithoutBOM(path & "\SCO1\en-us\Quiz.html", fileString)
					
				case "minify"
					' delete core.js, content.js, quiz.js
					' copy in whole templates/textplayer/layout/js folder
					
				case "meta"
					fileString = IO.LoadFileStream(path & "\SCO1\en-us\Content.html")
					strOutput = "<meta http-equiv=""X-UA-Compatible"" content=""IE=8"">" & vbNewLine &_
								"		<title>"
					fileString = Replace(fileString, "<title>", strOutput)
					Call IO.WriteUTF8WithoutBOM(path & "\SCO1\en-us\Content.html", fileString)

			end select
		Next
	Else
		If Config.FileSys.FolderExists(path & "\SCO1\Layout\less") Then
			Push2Array actions, "less"
			CompileLessUsingNode_LessC path, strOutput
			
			fileString = IO.LoadFileStream(path & "\SCO1\en-us\Content.html")
			fileString = Replace(fileString, "<link rel=""stylesheet/less"" type=""text/css"" href=""../Layout/less/app.less"" />", "<link rel=""stylesheet"" type=""text/css"" href=""../Layout/less/app.css"">")
			fileString = Replace(fileString, "<script type=""text/javascript"" src=""../Layout/js/libs/less-1.3.3.min.js""></script>", "")
			fileString = Replace(fileString, "<script>less.watch();</script>", "")
			fileString = Replace(fileString, "<script>less = {env: ""development"", poll: 5001}</script>", "")
			Call IO.WriteUTF8WithoutBOM(path & "\SCO1\en-us\Content.html", fileString)

			fileString = IO.LoadFileStream(path & "\SCO1\en-us\Quiz.html")
			fileString = Replace(fileString, "<link rel=""stylesheet/less"" type=""text/css"" href=""../Layout/less/app.less"" />", "<link rel=""stylesheet"" type=""text/css"" href=""../Layout/less/app.css"">")
			fileString = Replace(fileString, "<script type=""text/javascript"" src=""../Layout/js/libs/less-1.3.3.min.js""></script>", "")
			fileString = Replace(fileString, "<script>less.watch();</script>", "")
			fileString = Replace(fileString, "<script>less = {env: ""development"", poll: 5001}</script>", "")
			Call IO.WriteUTF8WithoutBOM(path & "\SCO1\en-us\Quiz.html", fileString)
		End If
		
		fileString = IO.LoadFileStream(path & "\SCO1\en-us\Content.html")
		If InStr(fileString, "X-UA-Compatible") > 0 Then
			Push2Array actions, "meta"
			fileString = Replace(fileString, "<meta http-equiv=""X-UA-Compatible"" content=""IE=8"">", "")
			Call IO.WriteUTF8WithoutBOM(path & "\SCO1\en-us\Content.html", fileString)
		End If

		' Make sure image manifest is up to date
		fnManifest_UpdateImageManifest path
		
		' minify and combine jquery-1.6.2.min.js + jquery-ui-1.8.18.min.js + handlebars.js + plugins.js -> core.js
		' minify and combine avide.quiz.js + quiz.run.js -> replace in Quiz.html -> quiz.js
		' minify and combine avide.player.js + player.run.js -> replace in Content.html -> content.js
		
	End If
	
End Sub






''
''	Go through media in the content/media folder and resize large files
''
Sub FixMedia(byval folder, byval selected)
	Select Case lcase(Config.getProperty(selected, "runtime"))
		Case "textplayer", "mobile"

	End Select
End Sub






Function EnsureCourseNameUniqueness(Byval Name)
Dim c, i, s
	s = Name
	c = db.count("courses","name='" & db.sqlsafe(s) & "'")
	Do While c > 0
		s = Name & "_" & i
		i = i + 1
		c = db.count("courses","name='" & db.sqlsafe(s) & "'")
		if c = 0 then exit do
	loop
	EnsureCourseNameUniqueness = s
End Function



''
''	JSON2 doesn't set a count or length property on its keys, so you have to test for existance of a key
''
function JsonIsValid(byref obj)
	JsonIsValid = False
	if isempty(obj) then exit function
	if obj is nothing then exit function
	Dim z : For each z in obj.keys()
		If z > "" Then ' has a key
			JsonIsValid = true
			Exit For
		End if
	Next
End Function





Function CourseHasTodos(coursePath)
'	CourseHasTodos = Config.FileSys.FileExists(coursePath & ".todo")
End Function




''
''	Look for a course name in its settings file (which is either settings.json, or settings.xml, depending on the engine)
''
Function GetCourseName(ByVal path)
Dim str : str = ""
	Dim settings : Call GetSettingsJSON(path, settings)
	If Not (Settings Is Nothing) Then
		str = Settings.course.name
	End If
	If str = "" Then
		str = GetCourseNameFromSettingsXML(path)
	End If
	GetCourseName = str
End Function




Function GetCourseNameFromSettingsXML(byval filename)
Dim fso, fil, contents, str
	If Trim(filename) = "" Then exit function
	If InStr(lcase(filename),"course.xml") = 0 Then filename = filename & "\Course.xml"
	Set fso = server.createobject("scripting.filesystemobject")
	if fso.fileexists(filename) then
		set fil = fso.OpenTextFile(filename,1,false)
		contents = fil.ReadAll
		fil.close
		str = mid(contents, instr(contents,"<name>")+6)
		str = trim(left(str, instrrev(str,"</name>")-1))
		str = Replace(Replace(Replace(str, vbNewLine, ""), "<![CDATA[", ""), "]]>","")
		GetCourseNameFromSettingsXML = str
	end if
End Function







''
''	Compile the Less stylesheet into a standard CSS
''
Function CompileLessUsingNode_LessC (byval path)
Dim errCode

	path = path & "\SCO1\Layout\less"

	Dim inpPath : inpPath = path & "\app.less"
	
	If Not Config.FileSys.FileExists(inpPath) Then
		CompileLessUsingNode_LessC = 99
		Exit Function
	End If
	
	Dim outPath : outPath = path & "\app.css"
	Dim ComSpec : ComSpec = Config.Shell.ExpandEnvironmentStrings("%comspec%") & " /c "
	Dim nodeExe : nodeExe = Server.MapPath("/engine/bin/less.js-windows-v2.4.0/bin/node.exe")
	Dim nodeModule : nodeModule = Server.MapPath("/engine/bin/less.js-windows-v2.4.0/bin/node_modules/less/bin/lessc")
	Dim cmd : cmd = Quote(Join(Array(nodeExe,nodeModule,inpPath,outPath)," "))

	If Config.FileSys.FileExists(outPath & "\app.css") Then
		Call Config.FileSys.DeleteFile(outPath & "\app.css", true)
	End If

	errCode = Config.Shell.Run(ComSpec & cmd, 0, True)
	
	If errCode > 0 Then
		Response.Write "LessC: " & ComSpec & cmd
	End If
	
	CompileLessUsingNode_LessC = (errCode = 0)

End Function







Sub CheckSaveRevision(ByVal filepath, ByVal currentData)
Dim str, u
	If Config.FileSys.FileExists(filepath) Then
		str = IO.LoadFileStream(filepath)
		if Trim("" & currentData) <> Trim("" & str) Then ' only revise if different
			Call db.exec("INSERT INTO history (`key`,user,timestamp,data) VALUES ({0},{1},CURRENT_TIMESTAMP(),{2})", Array(filepath, MyUserName, str))
		End If
	End If
End Sub

Sub SaveRevision(ByVal filepath)
Dim str, u
	If Config.FileSys.FileExists(filepath) Then
		str = IO.LoadFileStream(filepath)
		Call db.exec("INSERT INTO history (`key`,user,timestamp,data) VALUES ({0},{1},CURRENT_TIMESTAMP(),{2})", Array(filepath, MyUserName, str))
	End If
End Sub






Function MyUserName
	' MyUserName = Trim("" & Session("Username"))
	MyUserName = Trim("" & Request.Cookies("Username"))
	'MyUserName = "caldridge"
	If MyUserName = "" Then MyUserName = "Unknown"
End Function


Function MyUserId
	MyUserId = db.getScalarWithParams("SELECT id FROM plebs WHERE name={0}", Array(MyUserName), 0)
End Function

Function MyUserContainers
	MyUserContainers = db.getScalarWithParams("SELECT container FROM plebs WHERE name={0}", Array(MyUserName), "")
End Function


Function MyContainers(byval root)
	Dim ul : ul = MyUserContainers()
	If InStr(ul,"*") = 0 Then
		MyContainers = Split(ul, ",")
	Else
		MyContainers = IO.ArrayOfSubFolders(root)
	End If
End Function


Function WhoToEmail(byval s)
	WhoToEmail = db.getScalarWithParams("SELECT email FROM plebs WHERE name={0}", array(s),"")
End Function




''
'' Sends an email
'' From = Config.MailFromAccount, uses ReplyTo set to sFrom
'' If sUrl is set uses that as the body, otherwise sMessage is used
'' sAttach can be mapped or relative
''
Function SendAnEmail(ByVal sFrom, ByVal sTo, ByVal sSubject, ByVal sMessage, ByVal sAttach, ByVal sUrl)
Dim Mail : Set Mail = CreateObject("CDO.Message")
	Mail.Configuration.Fields.Item ("http://schemas.microsoft.com/cdo/configuration/sendusing") = 2 
	Mail.Configuration.Fields.Item ("http://schemas.microsoft.com/cdo/configuration/smtpserver") ="mail.coursesuite.com.au"
	Mail.Configuration.Fields.Item ("http://schemas.microsoft.com/cdo/configuration/smtpserverport") = 25 ' 587
	Mail.Configuration.Fields.Item ("http://schemas.microsoft.com/cdo/configuration/smtpusessl") = False 
	Mail.Configuration.Fields.Item ("http://schemas.microsoft.com/cdo/configuration/smtpconnectiontimeout") = 60
	'Mail.Configuration.Fields.Item ("http://schemas.microsoft.com/cdo/configuration/smtpauthenticate") = 1 
	'Mail.Configuration.Fields.Item ("http://schemas.microsoft.com/cdo/configuration/sendusername") ="foo@coursesuite.com.au"
	'Mail.Configuration.Fields.Item ("http://schemas.microsoft.com/cdo/configuration/sendpassword") ="7f8ds7d9"
	Mail.Configuration.Fields.Update
	Mail.Subject = sSubject
	Mail.From = Config.MailFromAccount
	Mail.ReplyTo = sFrom
	Mail.To = sTo
	If sAttach > "" Then
		If InStr(sAttach,":\") = 0 Then sAttach = Server.MapPath(sAttach)
		If Config.FileSys.FileExists(sAttach) Then
			Mail.AddAttachment sAttach
		End If
	End If
	Dim rex : Set rex = New RegExp
	rex.pattern = "<[^>]*>"
	If sUrl > "" Then
		Mail.CreateMHTMLBody sUrl
	ElseIf Rex.test(sMessage) Then
		Mail.HtmlBody = sMessage
	Else
		Mail.TextBody = sMessage
	End If
	Set rex = Nothing
	On Error Resume Next
	Mail.Send
	If Err Then
		SendAnEmail = False
	Else
		SendAnEmail = True
	End If
	On Error Goto 0
	Set Mail = Nothing
End Function



Function GetContainerId(ByVal ContainerName)
	GetContainerId = db.getScalarWithParams("select id from container where name = {0}", Array(ContainerName), 0)
End Function



Function GetContainerName(ByVal ContainerId)
	GetContainerName = db.getScalarWithParams("select name from container where id = {0}", Array(ContainerId), "")
End Function


Function GetContainerNameFromCourseId(ByVal CourseId)
	GetContainerNameFromCourseId = db.getScalarWithParams("select c2.name from courses c1 inner join container c2 on c1.`container` = c2.id where c1.id = {0}", Array(CourseId), "")
End Function

Function GetCoursePath(ByVal CourseId)
	GetCoursePath = db.getScalarWithParams("select path from CourseFolder where id = {0}", array(CourseId), "")
End Function



Function GetCourseIdFromPath(ByVal CoursePath)
	GetCourseIdFromPath = db.getScalarWithParams("select id from CourseFolder where path = {0}", array(CoursePath), 0)
End Function



Function SetCourseStage(ByVal CourseId, ByVal Stage)
	Call db.connection.execute("update courses set stage='" & db.sqlsafe(stage) & "' where id=" & db.sqlsafe(courseid))
End Function



Function GetLabelFromStage(ByVal value)
	GetLabelFromStage = ""
	Select Case LCase(value)
		case "new"
		
		Case "started"
			GetLabelFromStage = " label-important"
		case "inprogress"
			GetLabelFromStage = " label-warning"
		case "almostdone"
			GetLabelFromStage = " label-success"
		case "complete"
			GetLabelFromStage = " label-info"
		case "archived"
			GetLabelFromStage = " label-inverse"
	End Select
End Function





Function ArrayOfAllCourses()
	' TODO: Check permissions
Dim c, ar, rs, i
	c = db.count("courses","")
	ReDim ar(2,c)
	i = 0
	Set rs = server.createobject("adodb.recordset")
	rs.open "select * from coursefolder order by path", db.connection, 1, 1
	do while not rs.eof
		ar(0,i) = rs("id")
		ar(1,i) = rs("name")
		ar(2,i) = rs("path")
		rs.movenext
		i = i + 1
	loop
	rs.close
	set rs = nothing
	ArrayOfAllCourses = ar
	erase ar

End Function



Function CreateANewCourseRecord(ByVal name, ByVal container, ByVal config)
Dim cfg
	cfg = "null"
	If config > "" Then cfg = "'" & db.sqlsafe(JSON.stringify(config, null, 4)) & "'"
' dbg "INSERT INTO courses (name,folder,touched,engine,layout,stage,container,config,locked) VALUES ('" & db.sqlsafe(name) & "','" & db.sqlsafe(name) & "'," & DateDiff("s", "01/01/1970 00:00:00", Now) & ",'textplayer','coursesuite','new'," & GetContainerId(container) & "," & cfg & ",0)"
	Call db.connection.execute("INSERT INTO courses (name,folder,touched,engine,layout,stage,container,config,locked) VALUES ('" & db.sqlsafe(name) & "','" & db.sqlsafe(name) & "'," & DateDiff("s", "01/01/1970 00:00:00", Now) & ",'textplayer','coursesuite','new'," & GetContainerId(container) & "," & cfg & ",0)", adExecuteNoRecords)
	CreateANewCourseRecord = db.LastInsertId("courses") ' db.getScalar("SELECT last_insert_rowid() FROM courses", 0)
End Function



Function CalcLayoutDatesJSON()
Dim ar, i, c, s
	s = "{"
	ar = CalcLayoutDates()
	c = ubound(ar,2)
	For i = 0 to c
		s = s & ar(0,i) & ":" & ar(1,i)
		if i < c then s = s & ","
	Next
	Erase ar
	CalcLayoutDatesJSON = s & "}"
End Function




Function CalcLayoutDates()
	Dim fold, sf, i, d, sJson, c : Set Fold = Config.FileSys.GetFolder(Server.MapPath("/layouts"))
	c = fold.subFolders.Count
	Dim ar : ReDim ar(1,c - 1)
	i = 0
	For each sf in fold.subfolders
		d = DateValue("1 Jan 1970 00:00:01")
		ar(0,i) = sf.name
		ar(1,i) = DateDiff("s", "01/01/1970 00:00:00", IO.ScanStructureAndReturnLatestDate(sf,d))
		i = i + 1
	Next
	Set Fold = Nothing
	CalcLayoutDates = ar	
End Function




Function UserCourseContainerFilterSQL(ByVal filter_sql)
	UserCourseContainerFilterSQL = filter_sql
	Dim ul : ul = MyUserContainers()
	Dim addAnd : addAnd = (InStr(filter_sql, " where ") > 0)
	If InStr(ul,"*") = 0 Then
		Dim str : str = Replace(ul, ",", "' or name = '")
		Dim app : app = " container in (select id from container where name='" & str & "')"
		filter_sql = filter_sql & Replace(app, " or name = ''", "")
		if addAnd Then filter_sql = filter_sql & " and "
		UserCourseContainerFilterSQL = filter_sql
	End If
End Function

%>
