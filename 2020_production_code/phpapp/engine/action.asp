<%@ Language=VBScript %>
<%
option explicit
Response.Expires = -1
response.buffer = true
Server.ScriptTimeout = 600
' All communication must be in UTF-8, including the response back from the request
'Session.CodePage  = 65001
%>
<!-- #include file="lib/page_initialise.asp" -->
<!-- #include file="lib/incAspUpload.asp" -->
<%
Const UTF8_BOM = "ï»¿"

' Fucken option explicit!
Dim action, folder, fold, fil, redirectTo, wrap, archived, courseid, mappedFolder
Dim objStream, path, contentStr
Dim crsc,c,j,k,l,text, bool

Dim lessScript : lessScript = "		<script type=""text/javascript"" src=""../Layout/js/less-1.3.3.min.js""></script>"
Dim lessDevScript : lessDevScript = "		<script>less = {env: ""development"", poll: 5001}</script>" & vbNewLine &_
									"		<script type=""text/javascript"" src=""../Layout/js/less-1.3.3.min.js""></script>" & vbNewLine &_
									"		<script>less.watch();</script>"
Dim oCourse, oSettings
Dim oTodo, aTodo
Dim aItems, oItem, oTemp
dim layoutsTemplate
Dim smfLoop, smfFile, smfDoc
Dim scormVersion
Dim i, filename, xpath, value, valuetype
Dim courseXml, settingsXml
Dim sJSON, oJSON, colour
Dim CourseRS, TodoRS, HistoryRS
Dim tempRS, tempJSON
Dim courseFrom, courseTo
Dim sShim
Dim img, fmt, ext


Dim filData, filName, xmlData, tEngine, zipPath, zipName, sourcePath, zResult, arrActions, intSize, vPath, aPath, data, res, href, bUpdated
Dim wrapScoVersion, selectedRuntime, contentPath, copyLess, cloneName, newName, strOutput, tempStr1, tempStr2, tempStr3, copyLayout, copyConfig
DIm strTempFolder

Dim myEmail, theirEmail, containerName, containerPath
Dim ncId, ncVals, ncSettings, sql, tix


db.openDefault()

redirectTo = "/"
archived = (request.querystring("archive") = "true")
action = request.querystring("action")
folder = Trim(request.querystring("folder"))

courseid = 0
If IsNumeric(request.querystring("id")) Then
	courseid = cint(request.querystring("id"))
End If

If folder > "" then mappedFolder = Server.MapPath(folder)
if courseid > 0 then
	folder = GetCoursePath(courseid)
	mappedfolder = Server.MapPath(folder)
	' folder = db.getScalar("select folder from courses where id=" & courseid,"")
end if


select case lcase(action)


	case "ajax_get_hipster"
		tempStr1 = IO.GetFileString("/engine/templates/hipster.txt", "")
		aItems = Split(tempStr1, vbNewLine)
		Randomize Timer
		i = int((rnd * ubound(aItems)))
		response.write aItems(i)
		Erase aItems
		EndPage("")





	case "ajax_setstage"
		Dim ss_stage : ss_stage = trim("" & request("stage"))
		Call db.exec("update courses set stage={0} where id={1}", array(ss_stage,courseid))

		'Dim ss_stage : ss_stage = trim("" & request("stage"))
		'call SetCourseStage(courseid, ss_stage)
		'response.write "<span class='label" & GetLabelFromStage(ss_stage) & "'>" & Capitalise(ss_stage) & "</span>"
		endpage("")

	case "ajax_pastedimage"
	    Set filData = New FreeASPUpload ' cus we are dealing with multipart/form-data
	    Call filData.Prepare() ' hack to populate form object
	    vPath = Trim(filData.form("path"))
	    If vPath = "" Then vPath = "/buggr/attachments"
		Response.Write SaveBase64ToFile (filData.form("base64"), filData.form("extn"), vPath)
	    set filData = Nothing
		EndPage("")




	'case "trash" ' delete a course from the database (e.g. missing on disk)
	'	Call db.exec("DELETE FROM courses WHERE id={0}", courseid)
	'	Response.Write "<meta http-equiv='refresh' content='0; url=" & "/app/index/'>"
	'	EndPage("")


	'case "post-profile-setpassword"
	'	if Trim(request("newPassword")) > "" Then
	'		Call db.exec("UPDATE plebs SET password={0} WHERE id={1}", Array(md5er.hash(request("newPassword")), MyUserId))
	'	End If
	'	EndPage("/engine/pages/profile/")

	'case "post-profile-setemail"
	'	if Trim(request("newEmail")) > "" Then
	'		Call db.exec("UPDATE plebs SET email={0} WHERE id={1}", Array(request("newEmail"), MyUserId))
	'	End If
	'	EndPage("/engine/pages/profile/")












	case "htmlencode"
		response.write "<pre>"
		response.write server.htmlencode(IO.GetFileString(server.mappath(request("file")),""))
		response.write "</pre>"
		endpage("")






	case "magnet_randomise"
		Call db.connection.execute("UPDATE words SET x=(abs(floor(rand() * 1150)+50)),  y=(abs(floor(rand() * 850)+50))", adExecuteNoRecords)
		endpage("")

	case "magnet_move"
		i = clng(int(request("id")))
		j = clng(int(request("x")))
		k = clng(int(request("y")))
		l = clng(int(request("z")))
		Call db.exec("UPDATE words SET x={1}, y={2}, z={3} WHERE id={0}", array(i,j,k,l))
		endpage("")

	case "magnet_ping"
		set tempRS = db.getrs("select * from words", empty)
		aItems = Array()
		If Not (tempRS.BOF AND tempRS.EOF) Then
			Do While Not tempRS.EOF
				Set oJSON = JSON.parse("{}")
				oJSON.set "id", clng(tempRS("id"))
				oJSON.set "x", clng(tempRS("x"))
				oJSON.set "y", clng(tempRS("y"))
				oJSON.set "z", clng(tempRS("z"))
				oJSON.set "word", trim(tempRS("word"))
				Call Push2Array(aItems, JSON.stringify(oJSON))
				tempRS.moveNext
			Loop
		End If
		response.contentType = "application/json"
		Response.Write "[" & Join(aItems,",") & "]"
		endpage("")

	case "magnet_add"
		data = split(trim(request("word")), " ")
		for i = 0 to ubound(data)
			text = data(i)
			Randomize Timer
			j = Int( ( 900 - 10 + 1 ) * Rnd + 10 )
			Randomize Timer
			k = Int( ( 800 - 10 + 1 ) * Rnd + 10 )
			Randomize Timer
			l = Int( ( 10 - 2 + 1 ) * Rnd + 2 )
			Call db.exec("INSERT INTO words (x,y,z,word) VALUES ({0},{1},{2},{3})", array(j,k,l,text))
		next
		endpage("")











	case "ajax_loadquizxml"
		Dim quiz_xml : quiz_xml = trim(request("xml"))
		If Right(quiz_xml, 4) = ".txt" Then
			quiz_xml = Replace(quiz_xml,".txt",".xml")
		End If
		Dim quiz_fn : quiz_fn = mappedfolder & "\SCO1\en-us\Content\" & quiz_xml
		If Not config.filesys.fileexists(quiz_fn) Then ' copy in the default one as this name
			Call Config.FileSys.CopyFile(Server.MapPath("/scorm") & "\Quiz_1.xml", quiz_fn)
		End If
		Set oItem = Server.CreateObject("MSXML2.FreeThreadedDOMDocument")
		oItem.async = False
		oItem.Load(quiz_fn)
		Response.ContentType = "text/xml"
		response.write oItem.xml ' SafeXml(oItem.xml)
		Set oItem = Nothing
		endpage("")

	case "ajax_savequizxml"
		Dim sqx_xml, sqx_json, sqx_fn
		sqx_xml = request.form("xml")
		sqx_json = request.form("json")
		sqx_fn = request.form("filename")
		If Right(sqx_fn, 4) = ".txt" Then
			sqx_fn = Replace(sqx_fn,".txt",".xml")
		End If

		filName = mappedFolder & "\SCO1\en-us\Content\" & sqx_fn
		SaveRevision filName
		IO.SaveFileStream filName, sqx_xml
		IO.SaveFileStream replace(filName,".xml",".json"), sqx_json
		response.write filName
		endpage("")





	case "ajax_pagesxml_lastchanged"
		Response.Write DateToTimeStamp(Config.FileSys.GetFile(mappedFolder & "\SCO1\en-us\Pages.xml").DateLastModified)
		endpage("")

	case "ajax_loadfix_pagesxml"
		Set oItem = Server.CreateObject("MSXML2.FreeThreadedDOMDocument")
		oItem.async = False
		filName = mappedFolder & "\SCO1\en-us\Pages.xml"
		oItem.Load(filName)
		For each oTemp in oItem.SelectNodes("//page/@fileName") '  & "/text()")
			oTemp.text = IO.RenameSafeFileThenReturnNewName(mappedFolder & "\SCO1\en-us\Content\", oTemp.text, bUpdated)
		Next
		If bUpdated Then
			SaveRevision filName
			IO.SaveFileStream filName, oItem.xml
		End If

		' oItem.Save(mappedFolder & "\SCO1\en-us\Pages.xml") ' sometimes causes zero-byte file
		Response.ContentType = "text/xml"
		response.write SafeXml(oItem.xml)
		Set oItem = Nothing
		endpage("")


	case "ajax_method_renamemanyfiles"
		aItems = Array()
		for i = 1 to request.form("filename").count
			tempStr1 = request.form("filename")(i)
			Call Push2Array(aItems, IO.RenameSafeFileThenReturnNewName(mappedFolder & "\SCO1\en-us\Content\", request.form("filename")(i)), bUpdated)
		next
		response.write Join(aItems,",")
		endpage("")

	case "copysettingsfromanothercourse"
		' copy TO me
		Call CopySettingsFromAnotherCourse(Request("source"), CourseId, true)
		
		EndPage("/engine/pages/edit/?id=" & CourseId)

	case "renamephysicalfile", "ajax_renamephysicalfile"
		tempStr1 = Request("currentFilename")
		tempStr2 = Trim("" & Request("newFilename"))
		sShim = ""
		If (Request("media") = "y") Then
			sShim =  "media\"
		End If

		If InStr(tempStr2,".") > 0 Then
			tempStr2 = Left(tempStr2,InStrRev(tempStr2,".") - 1) ' crop any file extension
		End If
		tempStr2 = Replace(strClean("" & tempStr2)," ", "_") ' ensure there's no spaces in the renamed file
		tempStr2 = tempStr2 & Mid(tempStr1, InStrRev(tempStr1,".")) ' append original filename
		If Config.FileSys.FileExists(mappedFolder & "\SCO1\en-us\Content\" & sShim & tempStr1) Then
			If Config.FileSys.FileExists(mappedFolder & "\SCO1\en-us\Content\" & sShim & tempStr2) Then
				Response.Write "That filename (" & tempStr2 & ") already exists."
			else
				Config.FileSys.MoveFile mappedFolder & "\SCO1\en-us\Content\" & sShim & tempStr1, mappedFolder & "\SCO1\en-us\Content\" & sShim & tempStr2
				Response.Write "ok|" & tempStr2
			End If
		else
			Response.Write "The source file doesn't exist (yet?)\n" & mappedFolder & "\SCO1\en-us\Content\" & sShim & tempStr1
		End If
		EndPage("")

	case "ajax_deletephysicalfile"
		tempStr1 = Request("currentFilename")
		sShim = ""
		If (Request("media") = "y") Then
			sShim =  "media\"
		End If
		If Config.FileSys.FileExists(mappedFolder & "\SCO1\en-us\Content\" & sShim & tempStr1) Then
			Call Config.FileSys.DeleteFile(mappedFolder & "\SCO1\en-us\Content\" & sShim & tempStr1)
			Response.Write "ok"
		end if
		EndPage("")

	case "ajax_resizeclone"
		tempStr1 = Request("image")
		sShim = ""
		If (Request("media") = "y") Then
			sShim = "media\"
		End If
		tempStr2 = mappedFolder & "\SCO1\en-us\Content\" & sShim & tempStr1
		If Config.FileSys.FileExists(tempStr2) Then
			Set img = Server.CreateObject("CxImageATL.CxImage")
			ext = LCase(Mid(tempStr1, InStrRev(tempStr1,".") + 1))
			Select Case ext
				case "png"
					fmt = 4
				case "jpg", "jpeg"
					fmt = 3
				case "gif"
					fmt = 2
				case else
					EndPage("")
			End Select
			Call img.Load(tempStr2,fmt)
			Call img.Resample(Request("width"), Request("height"), 2)
			tempStr3 = Left(tempStr1, len(tempStr1) - len(ext) - 1) & "_" & Request("width") & "_" & Request("height") & "." & ext
			Call img.Save(mappedFolder & "\SCO1\en-us\Content\" & sShim & tempStr3, fmt)
			Set img = Nothing
			Response.Write tempStr3
		End If
		EndPage("")





	case "edit_ajax_load_help"
		response.write db.getScalarWithParams("select `help` from courses where id={0}", array(courseId), "{h1 Help unavailable}\nSorry, there is no help on this item.")
		EndPage("")

	case "edit_ajax_save_help"
		call db.exec("update courses set `help`={1} where id={0}", array(courseId, request.form("data")))
		response.write "ok"
		EndPage("")

	case "edit_ajax_load_references"
		Response.ContentType = "application/json"
		Call fnSettings_getCourseJsonObj(courseId, "references", oSettings)
		if oSettings Is Nothing Then
			response.write "{""references"":[{""uniqueid"":""7df3842f"",""title"":""Google /ˈɡuːɡəl/ n trademark"",""description"":"""",""hyperlink"":""http://www.wordreference.com/definition/google""}]}"
		Else
			Response.Write JSON.stringify(oSettings, null, 4)
		End If
		EndPage("")

	case "edit_ajax_save_references"
		Set oSettings = JSON.parse(join(array(Request.Form("data"))))
		Call fnSettings_setCourseJsonObj(courseId, "references", oSettings)
		response.write "ok"
		EndPage("")

	case "edit_ajax_load_glossary"
		Response.ContentType = "application/json"
		Call fnSettings_getCourseJsonObj(courseId, "glossary", oSettings)
		if oSettings Is Nothing Then
			Response.Write "{""terms"":[]}"
		Else
			Response.Write JSON.stringify(oSettings, null, 4)
		End If
		EndPage("")

	case "edit_ajax_save_glossary"
		Set oSettings = JSON.parse(join(array(Request.Form("data"))))
		Call fnSettings_setCourseJsonObj(courseId, "glossary", oSettings)
		Response.Write "ok"
		endpage("")

	case "edit_post_tabeditmodal_saveall"
		for smfLoop = 1 to Request.Form("filename").Count
			smfFile = request.form("filename")(smfLoop)
			smfDoc = request.form("contents")(smfLoop)
			IO.SaveFileStream mappedFolder & "\SCO1\en-us\Content\" & smfFile, smfDoc
		Next
		response.write "ok"
		EndPage("")





	case "history_get"
		text = db.SQLSafe(server.mappath(request("filename")))
		Set HistoryRS = db.getrs("select `user`,`timestamp` from history where `key`='{0}' order by timestamp desc", text)
		If Not (HistoryRS.BOF and HistoryRS.EOF) Then
			Response.ContentType = "application/json"
			' this next line is unreadable, but it avoids recordset looping by doing it inside ado, and only works because we only have two fields returning
			response.write Replace("[{""user"":""" & HistoryRS.getString(2,-1, """,""timestamp"":""","""},{""user"":""", vbNull) & "}]", ",{""user"":""}]", "]")
		End If
		Set HistoryRS = Nothing
		endpage("")

	case "revision_get"
		tempStr1 = cdate(request("timestamp"))
		tempStr2 = Year(tempStr1) & "-" & Right("0" & Month(tempStr1), 2) & "-" & Right("0" & Day(tempStr1), 2) & " " & Right("0" & Hour(tempStr1), 2) & ":" & Right("0" & Minute(tempStr1), 2) & ":" & Right("0" & Second(tempStr1), 2)
		response.write db.getScalarWithParams("select `data` from history where `key`={0} and `timestamp`={1}", Array(server.mappath(request("filename")), tempStr2), "")
		EndPage("")

	case "revision_delete"
		call db.exec("delete from history where `key`={0} and timestamp={1}", Array(server.mappath(request("filename")), cdate(request("timestamp"))))
		endpage("")







    case "ajaxloadcoursesettings"
		Call fnSettings_getCourseJsonObj(courseId, "config", oSettings)
		Response.Write JSON.stringify(oSettings, null, 0)
   		EndPage("")

	case "ajaxsavecoursesettings", "ajax_savecoursesettings"
		Set oSettings = JSON.parse(join(array(Request.Form("settings"))))
		Call fnSettings_setCourseJsonObj(courseId, "config", oSettings)
		Response.Write "ok"
		EndPage("")






	case "ajax_convertblock"
		filName = request.form("filename")
		text = request.form("content")
		filename = IO.FindASafeFileNameThatIsntAlreadyUsed(server.mappath(filName), "parse")
		IO.SaveFileStream filename, text
		response.write Mid(filename, InStrRev(filename, "\") + 1)
		endpage("")

	case "ajaxsavefile"
		filData = Request.Form("content")
		filName = Request.Form("filename")
		If InStr(filName,":\") = 0 Then filName = Server.MapPath(filName)
		CheckSaveRevision filName, filData
		IO.SaveFileStream filName, filData
		response.write " "
		EndPage("")

	case "contentexists"
		filName = mappedFolder & "\SCO1\en-us\Content\" & Request.querystring("filename")
		If Config.FileSys.FileExists(filName) Then
			response.write "true"
		else
			response.write "false"
		end if
		EndPage("")

	case "ajaxsavepagesxml"
		xmlData = request.form("xml")

		xmlData = Mid(xmlData, InStr(6, xmlData, "<")) ' skip first <page>
		xmlData = Left(xmlData, Len(xmlData) - 14) ' strip last two </page>s; because of replacing </ul> with </page>
		xmlData = "<?xml version=""1.0"" encoding=""UTF-8""?>" & vbNewLine & "<sco>" & vbNewLine & xmlData & vbNewLine & "</sco>"

		' ensure correct attribute casing
		xmlData = Replace(xmlData, "&", "&amp;")
		xmlData = Replace(xmlData, " filename=", " fileName=")
		xmlData = Replace(xmlData, " classname=", " className=")
		xmlData = Replace(xmlData, " contributescore=", " contributeScore=")
		xmlData = Replace(xmlData, " contributepercentage=", " contributePercentage=")

		xmlData = Replace(xmlData, "/><page ", "/>" & vbNewLine & "<page ")
		xmlData = Replace(xmlData, "><page ", ">" & vbNewLine & "<page ")
		xmlData = Replace(xmlData, "></page>", ">" & vbNewLine & "</page>")

		filName = mappedFolder & "\SCO1\en-us\Pages.xml"
		SaveRevision filName
		IO.SaveFileStream filName, xmlData
		EndPage("")









	'case "unlock"
	'	Call db.exec("UPDATE courses SET `locked` = 0 WHERE id = {0}", courseid)
	'	Response.Write "<meta http-equiv='refresh' content='0; url=/app/index/'>"
	'	EndPage("")

	'case "lock"
	'	Call db.exec("UPDATE courses SET `locked` = 1 WHERE id = {0}", courseid)
	'	Response.Write "<meta http-equiv='refresh' content='0; url=" & "/app/index/'>"
	'	EndPage("")
	'	// EndPage("/engine/pages/index/")

	'case "delete"
	'	Call db.exec("DELETE FROM courses WHERE id = {0}", courseid)
	'	set fold = Config.FileSys.getfolder(mappedfolder)
	'	fold.delete
	'	Response.Write "<meta http-equiv='refresh' content='0; url=" & "/app/index/'>"
	'	// EndPage("/engine/pages/index/")

	case "download"
		Dim xDest, xClusions, xCopy, xResult, OptimiseIsChecked
		
		OptimiseIsChecked = (Request("OptimiseIsChecked") = "1")

		Call fnSettings_PrepareCourseFolder(courseid)

		newName = db.GetScalarWithParams("Select `name` from courses where id={0}", courseid, "avide e-learning")
		zipName = SafeName(newName)
		strTempFolder = DateToTimeStamp(Now)

		' Copy to temp folder
		xDest = Server.MapPath("/temp") & "\" & strTempFolder
		Call Config.FileSys.CreateFolder(xDest)
		Call Config.FileSys.CreateFolder(xDest & "\files")
		Call Config.FileSys.CopyFolder (mappedFolder, xDest & "\files", true)

		Sleep 1
		
		Dim iLoop, modifyLess : modifyLess = Array("Content.html","Quiz.html")
		If Config.FileSys.FileExists(xDest & "\files\SCO1\Layout\less\app.css") Then ' e.g. if less compilation worked

			For iLoop = 0 To Ubound(modifyLess)
				
				tempStr1 = ""
	
				tempStr1 = IO.LoadFileStream(xDest & "\files\SCO1\en-us\" & modifyLess(iLoop))
				tempStr1 = Replace(tempStr1, "<title>CourseSuite.com.au</title>", "<title>" & newName & "</title>")
				tempStr1 = Replace(tempStr1, "<title>Course</title>", "<title>" & newName & "</title>")
				tempStr1 = Replace(tempStr1, "<title>%%template-title%%</title>", "<title>" & newName & "</title>")
				
				tempStr1 = Replace(tempStr1, "<link rel=""stylesheet/less"" type=""text/css"" href=""../Layout/less/app.less"" />", "<link rel=""stylesheet"" type=""text/css"" href=""../Layout/less/app.css"">")
		
				if instr(tempStr1, "<!-- begin_less -->") > 0 Then
					tempStr2 = Left(tempStr1, InStr(tempStr1, "<!-- begin_less -->") - 1)
					tempStr3 = Mid(tempStr1, InStr(tempStr1, "<!-- end_less -->") + 17)
					tempStr1 = tempStr2 & tempStr3
				End If
		
				Call IO.WriteUTF8WithoutBOM(xDest & "\files\SCO1\en-us\" & modifyLess(iLoop), tempStr1)
			Next

			For Each oItem in Config.FileSys.GetFolder(xDest & "\files\SCO1\Layout\less").Files
				If InStr(oItem.Name, ".less") > 0 Then oItem.Delete
			Next

			For Each oItem in Config.FileSys.GetFolder(xDest & "\files\SCO1\Layout\less").SubFolders
				oItem.Delete
			Next

		End If

		If OptimiseIsChecked Then
			Sleep 1

			' Optimise the output files and modify pages.xml
			Response.Clear
			' Response.AddHeader "TempFolder", strTempFolder
			Session("TempFolder") = strTempFolder ' THIS line is why we have sessions?  but I can't think of a better way
			Server.Execute("/engine/optimise.asp")
			Session("TempFolder") = ""
			Response.Clear
			'response.end

		End If
		
		Response.Clear
		'Response.Redirect "/app/download/save/" & strTempFolder & "/" & zipName
		Response.Write "<meta http-equiv='refresh' content='0; url=" & "/app/download/save/" & strTempFolder & "/" & zipName & "'>"
		Response.Write "<p>You can close this window after the download completes.</p>"
'		Response.End
 
'		sourcePath = xDest & "\files\*.*"
'
'		zResult = IO.XZip( sourcePath, xDest & "\" & zipName & ".zip" )
'		If zResult = 0 Then
'			response.clear
'			On Error Resume Next
'			response.contenttype = "application/octet-stream"
'			response.addheader "Content-Disposition", "attachment; filename=" & "/temp/" & strTempFolder & "/" & zipName & ".zip"
'			response.redirect "/temp/" & strTempFolder & "/" & zipName & ".zip"
'			If Err Then
'				Response.Write "<h1>Download link.</h1>"
'				Response.Write "<p>For some reason, the automatic download has failed. Right-click and save-as the link below.</p>"
'				response.write "<p><a href='/temp/" & strTempFolder & "/" & zipName & ".zip'>" & zipName & ".zip</a></p>"
'				response.write "<p>Then you can close this window.</p>"
'				'Response.Write "<p>After you have downloaded it, press Back on the browser to go back to the editor.</p>"
'			End If
'			On Error Goto 0
'			'response.write "<h1>Download is ready.</h1><p>Download it by clicking the link below.</p>"
'			'response.write "<p><a href='/temp/" & tempStr2 & "/" & zipName & ".zip'>/temp/" & tempStr2 & "/" & zipName & ".zip</a></p>"
'			'response.write "<p>This will eventually download automatically, once I work out what went wrong.</p>"
'			'response.end
'		Else
'			Response.Write "Unable to zip " & sourcePath & ", XZip returned " & zResult
'		End If
		EndPage("")

	case "play", "launch"
		response.write "<body style='color:#eee; background: #333 url(img/ajax-loader.gif) no-repeat center;'>"

		If Not fnSettings_CourseIsLocked(courseid) Then
			'response.write "<li>not locked"
			Call fnSettings_PrepareCourseFolder(courseid)
			'response.write "<li>prepared course folder"
			Call fnSettings_getCourseJsonObj(courseId, "config", oSettings)
			'response.write "<li>got config"
		Else
			sJSON = IO.GetFileString(Server.MapPath(GetCoursePath(courseId)) & "\SCO1\Configuration\settings.json", "")
			Set oSettings = JSON.parse(Join(Array(sJSON)))
		End If
		RedirectTo = folder & "/SCO1/index.html"

		' De-Optimise the output files and modify pages.xml
		Call fnSettings_DeOptimise(Server.MapPath(folder))
			'response.write "<li>de-optimised " & folder

		If (request.querystring("wrap") > "") Then
			If oSettings.Engine.sco = "1.2" Then
				RedirectTo = "../scorm/scorm12testwrap.asp?sco=" & Server.UrlEncode(RedirectTo)
			Else
				RedirectTo = "../scorm/scorm2004testwrap.asp?sco=" & Server.UrlEncode(RedirectTo)
			End If
		End If
		response.write "<meta http-equiv=""refresh"" content=""2; url=" & RedirectTo & """></body>"
		EndPage("") ' RedirectTo)

	case "edit"
		redirectTo = "/engine/pages/edit/?id=" & courseid





	case "applylayout"
		layoutsTemplate = request("layout")
		Call fnSettings_ApplyLayout(layoutsTemplate, folder, true)
		response.contenttype = "application/json"
		response.write ReturnSettingsJsonString(mappedfolder)
		EndPage("")

	case "ajax_load_defaultsettings"
		response.write ReturnSettingsJsonString(server.mappath("/runtimes/textplayer/Configuration/settings.json"))
		EndPage("")






'	case "clone"
'		' cloneName = SafeName(Request("newname"))
'		cloneName = EnsureCourseNameUniqueness("Copy of " & db.getScalarWithParams("select name from courses where id={0}", array(courseid), "(untitled)"))
'		newName = db.getScalarWithParams("select folder from courses where id={0}", array(courseid), cloneName)
'		If cloneName > " " Then
'			path = Config.CourseRoot & "\" & GetContainerNameFromCourseId(courseid)
'			Config.FileSys.CopyFolder mappedFolder, path & "\" & newName
'			Call db.connection.execute("INSERT INTO courses (name,folder,touched,engine,layout,stage,container,config,locked) SELECT '" & db.sqlsafe(cloneName) & "' as name,'" & db.sqlsafe(newName) & "' as folder,touched,engine,layout,stage,container,config,locked FROM courses WHERE id=" & db.sqlsafe(courseid), adExecuteNoRecords)
'			' response.write db.LastInsertId("courses") ' db.getScalar("SELECT last_insert_rowid() FROM courses", 0)
'		End If
'		Response.Write "<meta http-equiv='refresh' content='0; url=" & "/app/index/'>"
'		EndPage("")
'		' EndPage("/engine/pages/index/") '' back to self, we could also directly edit, but i don't trust that lastinsertid in a multiuser system ... to be fixed




'	case "newcourse"
'		newName = SafeName(Request("name"))
'		newName = EnsureCourseNameUniqueness(newName)
'		if newName > " " then
'
'			Dim my_personal_container_name : my_personal_container_name = Trim("" & Request.Cookies("aspname"))
'
'			containerPath = Server.MapPath("/courses/" & my_personal_container_name) ' my personal course location
'			if not Config.FileSys.FolderExists(containerPath) then
'				Config.FileSys.CreateFolder(containerPath)
'			End if
'			containerPath = containerPath & "\" & newName
'			If Not Config.FileSys.FolderExists(containerPath) Then
'				Config.FileSys.CreateFolder(containerPath)
'			End If
'			
'			Dim template : template = Server.MapPath("/engine/templates/courses/" & Request("template") & "/template.zip")
'			Dim estr, oExec
'			If Config.FileSys.FileExists(template) Then
'				Dim unzip : unzip = Config.UnZipExe & " -o -qq " & QuoteOptional(template) & " -d " & QuoteOptional(NoTrailingSlash(containerPath))
'				Set oExec = Config.Shell.Exec(unzip)
'				Do While (Not oExec.StdOut.AtEndOfStream)
'					oExec.StdOut.ReadAll()
'				Loop
'				Do While (Not oExec.StdErr.AtEndOfStream)
'					estr = estr & oExec.StdErr.ReadAll()
'				Loop
'			End If
'			If CLng(estr) <> 0 then
'				response.write "error unzipping: " & estr
'				response.end
'			Else
'				Dim uplConfig : uplConfig = IO.GetFileString(containerPath & "\SCO1\Configuration\settings.json", "")
'				If uplConfig > "" Then
'					Set oSettings = JSON.parse(Join(Array(uplConfig)))
'					oSettings.course.set "id", ucase(replace(strClean(newName)," ", "")) & Year(now) & Month(now) & Day(now)
'					oSettings.course.set "name", newName
'					oSettings.course.set "description", "This course was created using the CourseSuite CourseBuilder's " & Request("template") & " template."
'					oSettings.copyright.set "content", "&copy; " & Year(now) & " " & my_personal_container_name
'				Else
'					Set oSettings = Nothing
'				End If
'				
'				ncId = CreateANewCourseRecord(newName, my_personal_container_name, oSettings) ' name, container, config
'				Set Config = Nothing
'				Response.Redirect "/engine/pages/edit/?id=" & ncId
'			End if
'	end if







'	case "ajax_newcourse"
'   		newName = SafeName(Request.Form("name"))
'   		If newName > " " Then
'	   		Config.FileSys.CopyFolder Server.MapPath("/engine/templates/newcourse"), Config.CoursesPath & "\" & newName
'			Call GetSettingsJSON(Config.CoursesPath & "\" & newName, ncSettings)
'			ncSettings.course.name = Trim(Request.Form("name"))
'			Call SaveSettingsJson(Config.CoursesPath & "\" & newName, ncSettings)
'			Set ncSettings = Nothing
'   		End If
'   		response.write newName
'   		EndPage("")

'	case "post_newcourse"
'			newName = SafeName(Request.Form("course"))
'			containerName = Request.Form("container")
'			newName = EnsureCourseNameUniqueness(newName)
'			containerPath = Server.MapPath("/courses/" & containerName)
'			If Not Config.FileSys.FolderExists(containerPath) Then
'				Config.FileSys.CreateFolder(containerPath)
'			End If
'			If newName > " " Then
'				Config.FileSys.CopyFolder Server.MapPath("/engine/templates/newcourse"), containerPath & "\" & newName
'				' sleep 1
'				Call GetSettingsJSON(containerPath & "\" & newName, ncSettings)
'				ncSettings.course.name = Trim(Request.Form("course")) ' not safe
'				Call SaveSettingsJson(containerPath & "\" & newName, ncSettings)
'				ncId = CreateANewCourseRecord(newName, containerName, ncSettings)
'				Set ncSettings = Nothing
'				EndPage("/engine/pages/edit/?id=" & ncId)
'			End If

'	case "ajax_movecontainer"
'		containerName = Request.Form("container")
'		containerPath = Server.MapPath("/courses/" & containerName) ' after move
'		path = GetCoursePath(courseid) ' before move
'		Config.FileSys.MoveFolder server.mappath(path), containerPath & "\"
'		Call db.exec("UPDATE courses SET container={0} where id={1}", Array(GetContainerId(containerName),courseid))
'		' Response.Write "The course has been moved to " & containerName
'		EndPage("")









   	case "renamefolder"
   		newName = SafeName(Request.Form("rename"))
   		If newName > " " Then
   			containerPath = Left(mappedFolder, InStrRev(mappedFolder, "\"))
	   		Config.FileSys.MoveFolder mappedFolder, containerpath & "\" & newName
	   		Call db.exec("UPDATE courses SET folder={0} where id={1}", Array(newName, courseid))
	   	End If
   		EndPage("/engine/pages/edit/?id=" & courseid)




   	case "override_reset"
   		Call IO.DeleteOverrideFolder()
   		EndPage("/engine/pages/edit/?id=" & courseid & "#tabs-6")

   	case "override_create"
   		Call IO.CreateOverrideFolder(Request.Form("copy_from"))
   		EndPage("/engine/pages/edit/?id=" & courseid & "#tabs-6")

   	case "override_overwrite"
   		Call IO.CreateOverrideFolder2(Request.Form("copy_from"), true)
   		EndPage("/engine/pages/edit/?id=" & courseid & "#tabs-6")


   	case "override_browse"
		'Call fnSettings_getCourseJsonObj(courseId, "config", oSettings)
		
   		response.contenttype = "application/json"
   		Set data = IO.GetOverriddenFilesForPath(Request("path"))
   		Response.Write JSON.stringify(data.result)
  		EndPage("")
  		
  	case "override_save"
  		data = Request.Form("code")
  		contentPath = Config.LayoutsPath & "\." & md5er.hash(COURSE_ID) & replace(Request.Form("file"), "|", "\")
  		Call IO.WriteUTF8WithoutBOM(contentPath, data)
  		EndPage("/engine/pages/edit/?id=" & courseid & "#tabs-6")

  	case "override_delete"
  		contentPath = Config.LayoutsPath & "\." & md5er.hash(COURSE_ID) & replace(Request.Form("file"), "|", "\")
  		if Config.FileSys.FileExists(contentPath) Then
  			Call Config.FileSys.DeleteFile(contentPath, true)
  		End If
  		EndPage("/engine/pages/edit/?id=" & courseid & "#tabs-6")
  		
  	case "override_diff"

		Call fnSettings_getCourseJsonObj(courseId, "config", oSettings)
		Set data = JSON.parse("{}")

		response.contenttype = "application/json"
		tempStr3 = Request("mode")
		newName = Request("folder")
  		contentPath = Config.LayoutsPath & "\." & md5er.hash(COURSE_ID) & replace(Request("file"), "|", "\")
  		if Config.FileSys.FileExists(contentPath) Then
	  		tempStr1 = IO.LoadFileStream(contentPath)
	  	else
		  	tempStr1 = "File not found"
	  	end if

	  	if tempStr3 = "folder" then
		  	contentPath = Config.LayoutPath & "\" & newName & replace(Request("file"), "|", "\")
	  	elseif tempStr3 = "core" then
	  		contentPath = Config.BaselineThemePath & replace(Request("file"), "|", "\")
		elseif tempStr3 = "template" then
	  		contentPath = Config.LayoutsPath & "\" & oSettings.layout.template & replace(Request("file"), "|", "\")
		end if
	  	
  		if Config.FileSys.FileExists(contentPath) Then
	  		tempStr2 = IO.LoadFileStream(contentPath)
	  	else 
			data.set "notfound", true
	  	end if
	  	
		data.set "revision", tempStr2
		data.set "current", tempStr1
	  	Response.Write JSON.stringify(data)
		Set data = Nothing
  		EndPage("")
	  	


end select

set config = nothing
response.redirect (redirectTo)

Function WorkOutAndUpdateXML(ByRef fileString, byVal xPath, byVal valueToSet)
Dim attrib, attribNew, attribOld
Dim tag, nodeOrig, nodeValue, nodeNew, ar
Dim isCdata

	If InStr(xPath, "/@") > 0 Then
		ar = Split(xPath, "/@")
		attrib = ar(1)
		attribNew = " " & attrib & "=" & chr(34) & valueToSet & chr(34)
		xPath = Replace(xPath, "/@" & attrib, "")
	End If
	xPath = Mid(xPath, InStr(3, xPath, "/")) ' crop first param, we don't care and it might clash
	Tag = Mid(xPath, InStrRev(xPath, "/") + 1)
	If InStr(Tag, "[@") > 0 Then
		Tag = Mid(Tag, 1, InStrRev(Tag, "[@") - 1)
	End If
	If attrib > "" Then
		nodeOrig = Mid(fileString, InStr(fileString, "<" & Tag & " ") - 1)
		nodeOrig = Mid(nodeOrig, 1, InStr(nodeOrig, ">"))
		attribOld = Mid(nodeOrig, InStr(nodeOrig, attrib & "="))
		attribOld = " " & Mid(attribOld, 1, InStr(Len(attrib) + 3, attribOld, chr(34)))

		' Build a repacement node
		nodeNew = Replace(nodeOrig, attribOld, attribNew)

	Else
		nodeOrig = Mid(fileString, InStr(fileString, "<" & Tag))
		nodeOrig = Mid(nodeOrig, 1, InStr(nodeOrig, "</" & Tag & ">") + 3 + Len(Tag))

		' get the inner portion of the node (the text to replace)
		nodeValue = Replace(Replace(nodeValue, "<![CDATA[", ""), "]]>","")
		nodeValue = Mid(nodeOrig, InStr(InStr(nodeOrig, "<" & tag), nodeOrig, ">") + 1)
		nodeValue = Trim(Mid(nodeValue, 1, InStrRev(nodeValue, "</" & tag)-1))


		isCData = (InStr(valueToSet, "<") > 0) or (InStr(valueToSet, "&") > 0)
		If isCData Then
			nodeNew = Replace(nodeOrig, nodeValue, "<![CDATA[" & valueToSet & "]]>")
		Else
			nodeNew = Replace(nodeOrig, nodeValue, valueToSet)
		End If

	End If

	' Update the original filestring (byref) to store changed value
	fileString = Replace(fileString, nodeOrig, nodeNew)

	if false then
		response.write "Tag=" & tag & "|" & vbnewline
		response.write "Attrib=" & attrib & "|" & vbnewline
		response.write "attribNew=" & attribNew & "|" & vbnewline
		response.write "attribOld=" & attribOld & "|" & vbNewLine
		response.write "nodeOrig=" & server.htmlencode(nodeOrig) & "|" & vbnewline
		response.write "nodeValue=" & server.htmlencode(nodeValue) & "|" & vbnewline
		response.write "nodeNew=" & server.htmlencode(nodeNew) & "|" & vbnewline
		response.write "-----------------------------------------------------------" & vbnewline
	End If

End Function


Function URLDecode(sConvert)
    Dim aSplit
    Dim sOutput
    Dim I
    If IsNull(sConvert) Then
       URLDecode = ""
       Exit Function
    End If

    ' convert all pluses to spaces
    sOutput = REPLACE(sConvert, "+", " ")

    ' next convert %hexdigits to the character
    aSplit = Split(sOutput, "%")

    If IsArray(aSplit) Then
      sOutput = aSplit(0)
      For I = 0 to UBound(aSplit) - 1
        sOutput = sOutput & _
          Chr("&H" & Left(aSplit(i + 1), 2)) &_
          Right(aSplit(i + 1), Len(aSplit(i + 1)) - 2)
      Next
    End If

    URLDecode = sOutput
End Function


Sub FormDataDump(bolShowOutput, bolEndPageExecution)
  Dim sItem

  'What linebreak character do we need to use?
  Dim strLineBreak
  If bolShowOutput then
    'We are showing the output, so set the line break character
    'to the HTML line breaking character
    strLineBreak = "<br>"
  Else
    'We are nesting the data dump in an HTML comment block, so
    'use the carraige return instead of <br>
    'Also start the HTML comment block
    strLineBreak = vbCrLf
    Response.Write("<!--" & strLineBreak)
  End If


  'Display the Request.Form collection
  Response.Write("DISPLAYING REQUEST.FORM COLLECTION" & strLineBreak)
  For Each sItem In Request.Form
    Response.Write(sItem)
    Response.Write(" - [" & server.htmlencode(Request.Form(sItem)) & "]" & strLineBreak)
  Next


  'Display the Request.QueryString collection
  Response.Write(strLineBreak & strLineBreak)
  Response.Write("DISPLAYING REQUEST.QUERYSTRING COLLECTION" & strLineBreak)
  For Each sItem In Request.QueryString
    Response.Write(sItem)
    Response.Write(" - [" & server.htmlencode(Request.QueryString(sItem)) & "]" & strLineBreak)
  Next


  'If we are wanting to hide the output, display the closing
  'HTML comment tag
  If Not bolShowOutput then Response.Write(strLineBreak & "-->")

  'End page execution if needed
  If bolEndPageExecution then EndPage("")
End Sub

Sub EndPage(ByVal redirectTo)
	If not db is nothing then
		db.close()
		set db = nothing
	end if
	if not str is nothing then set str = nothing
	if not lib is nothing then
		set lib.logger = nothing
		set lib = nothing
	end if
	If redirectTo > "" Then
		response.redirect (redirectTo)
	else
		Response.End
	end if
End Sub

''
''	Used by paste-upload, this decodes base64 it binary and saves a new file
'' returns: virtual path to file
'' fun fact: msxml2 has a base64 decoder in it!
''
Function SaveBase64ToFile(byval data, byval extn, byval vpath)
Dim objXML, objDocElem, objStream, strNameV, strNameA
	Set objXML = CreateObject("MSXml2.DOMDocument")
	Set objDocElem = objXML.createElement("Base64Data")
	objDocElem.DataType = "bin.base64"
	objDocElem.text = data
	Set objStream = CreateObject("ADODB.Stream")
	objStream.Type = adTypeBinary
	objStream.Open()
	strNameV = vpath & "/" & NewRefId(true) & "." & extn
	strNameA = Server.MapPath(strNameV)
	objStream.Write objDocElem.NodeTypedValue
	objStream.SaveToFile strNameA, adSaveCreateOverWrite
	SaveBase64ToFile = strNameV
	Set objXML = Nothing
	Set objDocElem = Nothing
	Set objStream = Nothing
End Function

%>

<!-- #include file="lib/page_terminate.asp" -->
