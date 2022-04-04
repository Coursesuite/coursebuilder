<%


Sub CheckCourseName
Dim rs, configuration, dbName, confName
	set rs = db.getRS("select name, config from courses where id={0}", COURSE_ID)

	On Error Resume Next
	Set configuration = JSON.parse(Join(Array(rs("config"))))
	If Err Then Set configuration = Nothing ' JSON.parse("{}")
	On Error Goto 0 
	
	if not configuration is nothing then
		dbName = rs("name")
		confName = configuration.course.name
		if instr(confName, " Template") > 0 then ' config name ends in Template
			If instr(dbName, " Template") = 0 then ' db name does NOT end in Template (e.g. is different)

				configuration.course.set "name", dbName
				
				Call SaveSettingsJson(MAPPED_COURSE, configuration)
				' header is already written with this configuration name, so reload the config by reloading the page
				response.write "<scr"&"ipt type=""text/javascript"">location.href=location.href</scr"&"ipt>"
			end if
		end if
	end if

	Set rs = Nothing

End Sub 

Sub CheckCourse
	
	Call CheckAncillaryFiles(MAPPED_COURSE, COURSE_ID)	

	' Check to make sure we have a media folder (needed by /list/)
	if Not Config.FileSys.FolderExists(MAPPED_COURSE & "\SCO1\en-us\Content\media") Then
		Config.FileSys.CreateFolder(MAPPED_COURSE & "\SCO1\en-us\Content\media")
	End If
	
	If Not Config.FileSys.FolderExists(MAPPED_COURSE & "\SCO1\Configuration") Then 
		Config.FileSys.CreateFolder(MAPPED_COURSE & "\SCO1\Configuration")
	End If 
	
	' Make sure we have a settings.json, it's handy
	ConvertSettingsToJSONIfMissing (MAPPED_COURSE)

	' If the config record is bum then re-synch it
	Dim c : c = db.count("courses", "id=" & COURSE_ID & " and (config = 'null' or config is null or config = '')")
	If c > 0 then
		SetCourseConfigData(COURSE_ID)
	End If
	
	' Clean shit left by windows and mac
	CleanJunkLite MAPPED_COURSE

End Sub

Sub CheckPermissions

End Sub

Sub CheckAncillaryFiles(ByVal coursePath, ByVal courseId)

	' check config files from disk
	Dim rs, glossary, references, help, media, strFile
	set rs = db.getrs("select `glossary`,`references`,`help`,`media` from courses where `id`={0}", Array(courseId))
	glossary = Trim("" & rs("glossary"))
	references = Trim("" & rs("references"))
	help = Trim("" & rs("help"))
	media = Trim("" & rs("media"))

	if glossary = ""Then
		If Config.FileSys.FileExists(coursePath & "\SCO1\Configuration\glossary.json") Then
			strFile = IO.GetFileString(coursePath & "\SCO1\Configuration\glossary.json", "")
			strFile = Replace(strFile, "\" & chr(34), "\\" & chr(34))
			Call db.exec("update courses set `glossary` = {0} where id = {1}", array(strFile, courseId))
		End If
	end if

	if references = "" Then
		If Config.FileSys.FileExists(coursePath & "\SCO1\Configuration\references.json") Then
			strFile = IO.GetFileString(coursePath & "\SCO1\Configuration\references.json", "")
			strFile = Replace(strFile, "\" & chr(34), "\\" & chr(34))
			Call db.exec("update courses set `references` = {0} where id = {1}", array(strFile, courseId))
		End If
	end if

	if help = "" Then
		If Config.FileSys.FileExists(coursePath & "\SCO1\Configuration\help.txt") Then
			strFile = IO.GetFileString(coursePath & "\SCO1\Configuration\help.txt", "")
			strFile = Replace(strFile, "\" & chr(34), "\\" & chr(34))
			Call db.exec("update courses set `help` = {0} where id = {1}", array(strFile, courseId))
		End If
	end if

	If media = "" Then
		If Config.FileSys.FileExists(coursePath & "\SCO1\Configuration\images.json") Then
			strFile = IO.GetFileString(coursePath & "\SCO1\Configuration\images.json", "")
			strFile = Replace(strFile, "\" & chr(34), "\\" & chr(34))
			Call db.exec("update courses set `media` = {0} where id = {1}", array(strFile, courseId))
		End If
	end if

End Sub

%>