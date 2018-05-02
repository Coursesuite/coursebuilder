<%

Function fnSettings_CourseIsLocked(ByVal courseId)
	fnSettings_CourseIsLocked = (db.GetScalarWithParams("Select `locked` from courses where id={0}", courseid, 0) = 1)
End Function

'' not really used; saving nav in editor rebuilds anyway
Sub fnSettings_DeOptimise(ByVal mappedFolder)
Dim xml, node
	Set xml = Server.CreateObject("MSXML2.FreeThreadedDOMDocument") ' Microsoft.XMLDOM")
	xml.async = false
	xml.load(mappedFolder & "\SCO1\en-us\Pages.xml")
	For each node in xml.documentElement.SelectNodes("//page")
		Call node.setAttribute("optimised", "false")
	Next
	xml.Save mappedFolder & "\SCO1\en-us\Pages.xml"
	Set xml = Nothing
End Sub

''
''	You run this every time you PLAY or DOWNLOAD the course
''		- Downloading also needs to run a Compilation step
''
Sub fnSettings_PrepareCourseFolder(ByVal course_id)
Dim mappedFolder, virtFolder
Dim xCopyCommand, xExclusionsFile, xSource, xDest, xCopyResult
Dim rsCourse, oSettings, strConfig, lessError
Dim dbGloss, dbRefs, dbHelp
Dim bHasCustomOverride

	virtFolder = GetCoursePath(course_id)
	mappedFolder = Server.MapPath(virtFolder)
	
	bHasCustomOverride = IO.TemplateIsOverriden(course_id)
	
	' Delete existing disk-based config
	If Config.FileSys.FolderExists(mappedFolder & "\SCO1\Configuration") Then
		Call Config.FileSys.DeleteFolder(mappedFolder & "\SCO1\Configuration", true)
		response.write "<li>deleted " & mappedFolder & "\SCO1\Configuration"
	End If

	' Delete existing disk-based Layout
	If Config.FileSys.FolderExists(mappedFolder & "\SCO1\Layout") Then
		Call Config.FileSys.DeleteFolder(mappedFolder & "\SCO1\Layout", true)
		response.write "<li>deleted " & mappedFolder & "\SCO1\Configuration"
	End If

	Sleep 1 ' wait for file delete to finish

	' Copy in the latest BASE engine, which includes config & other base files
	xSource = Config.BaselineThemePath
	xDest = mappedFolder & "\SCO1"
	xExclusionsFile = Server.MapPath("/engine/lib/exclusions.txt")
	' xCopyCommand = "xcopy """ & xSource & """ """ & xDest & """ /C /I /Q /R /S /Y /exclude:" & xExclusionsFile ' no /U
	xCopyCommand = "xcopy """ & xSource & """ """ & xDest & """ /Q /R /S /Y /exclude:" & xExclusionsFile
	Set xCopyResult = Config.Shell.Exec(xCopyCommand)
	Response.Write "<pre>" & xCopyCommand & vbNewLine & xCopyResult.StdOut.ReadAll() & "</pre>"
	Response.Write xCopyCommand & "<br>" & xCopyResult.StdOut.ReadAll() & "<br>"

	Sleep 1 ' Shell.Exec might be slow to release file locks after xcopy

	' Get to work on building the Configuration folder out of the database
	Set rsCourse = db.getRS("select `config`, `glossary`, `help`, `references` from courses where id={0}", course_id)
	
	dbGloss = Trim("" & rsCourse("glossary")) 
	dbRefs = Trim("" & rsCourse("references"))
	dbHelp = Trim("" & rsCourse("help"))

	If Not IO.CopyDefaultIfEmpty(dbGloss, mappedFolder & "\SCO1\Configuration", "glossary.json") Then ' if it was not copied
		Call IO.WriteUTF8WithoutBOM (mappedFolder & "\SCO1\Configuration\glossary.json", dbGloss)
		response.write "<li>Wrote glossary"
	End If
	If Not IO.CopyDefaultIfEmpty(dbRefs, mappedFolder & "\SCO1\Configuration", "references.json") Then
		Call IO.WriteUTF8WithoutBOM (mappedFolder & "\SCO1\Configuration\references.json", dbRefs)
		response.write "<li>Wrote references"
	End If
	If Not IO.CopyDefaultIfEmpty(dbHelp, mappedFolder & "\SCO1\Configuration", "help.txt") Then
		Call IO.WriteUTF8WithoutBOM (mappedFolder & "\SCO1\Configuration\help.txt", dbHelp)
		response.write "<li>Wrote help"
	End If
	strConfig = Trim("" & rsCourse("config"))
	Call IO.WriteUTF8WithoutBOM (mappedFolder & "\SCO1\Configuration\settings.json", strConfig)
	response.write "<li>Wrote settings"

	Call fnManifest_UpdateImageManifest(mappedFolder)
	response.write "<li>Wrote image manifest"

	' Get the current settings
	Set oSettings = JSON.parse(strConfig)

	' a custom override has already performed merging the base engine with its template
	If bHasCustomOverride then

		' Copy in the details from the override template in the same way you would apply the final template over the base
		xSource = Config.LayoutsPath & "\." & md5er.hash(course_id)
		xDest = mappedFolder & "\SCO1"
		xExclusionsFile = Server.MapPath("/engine/lib/exclusions.txt")
		xCopyCommand = "xcopy """ & xSource & """ """ & xDest & """ /C /I /Q /R /S /Y /exclude:" & xExclusionsFile ' removed /U - only files that exist in the destination
		Set xCopyResult = Config.Shell.Exec(xCopyCommand)
		Response.Write "<pre>" & xCopyCommand & vbNewLine & xCopyResult.StdOut.ReadAll() & "</pre>"
		Response.Write xCopyCommand & "<br>" & xCopyResult.StdOut.ReadAll() & "<br>"

		If Config.FileSys.FolderExists(mappedFolder & "\SCO1\editor") Then
			Call Config.FileSys.DeleteFolder(mappedFolder & "\SCO1\editor", true)
			response.write "<li>deleted " & mappedFolder & "\SCO1\editor"
		End If
		
	Else
	
		' Apply the layout from the current template
		xSource = Config.LayoutsPath & "\" & oSettings.layout.template
		xCopyCommand = "xcopy """ & xSource & """ """ & xDest & """ /C /I /Q /R /S /U /Y /exclude:" & xExclusionsFile
		Set xCopyResult = Config.Shell.Exec(xCopyCommand)
		Response.Write xCopyCommand & "<br>" & xCopyResult.StdOut.ReadAll() & "<br>"
		Response.Write "<pre>" & xCopyCommand & vbNewLine & xCopyResult.StdOut.ReadAll() & "</pre>"
	
	End If

	Sleep 1

	' Apply colours, etc from the settings to the template
	Call fnSettings_SynchroniseBaseColourFromSettings(mappedFolder, oSettings)
	response.write "<li>synchnronised colour settings"
	
	' Build the IMS Manifest & Scorm stuff
	Call ApplySCORMManifest(mappedFolder, oSettings.engine.sco, false)
	response.write "<li>applied manifest"
	
	' Compile LESS (don't link it yet)
	If Not CompileLessUsingNode_LessC(mappedFolder) Then
		response.write "<li>less failed to compile "
		' Response.Write "Less failed to compile..."
	End If
	
	' Clean up
	Set oSettings = Nothing
	Set rsCourse = Nothing
	
End Sub

''
'' Getter & Setter routines for course JSON
''
Sub fnSettings_getCourseJsonObj(ByVal courseId, ByVal sField, ByRef oJson)
	Dim strJson
	If InStr("config,help,references,glossary", LCase(sField)) = 0 Then Exit Sub
	strJson = db.getScalarWithParams("SELECT `" & sField & "` FROM Courses WHERE id={0}", Array(courseId), "{}")
	on error resume next
	Set oJson = JSON.parse(Join(Array(strJson)))
	if err > 0 and sField = "config" then ' try to fix it
		err.clear
		strJson = IO.GetFileString(Server.MapPath(GetCoursePath(courseId)) & "\SCO1\Configuration\settings.json", "")
		Set oJson = JSON.parse(Join(Array(strJson)))
		If err > 0 then
			' both the database and the disk are corrupt.
			strJson = IO.GetFileString(Server.MapPath("/runtimes/textplayer/Configuration/settings.json"), "")
			err.clear
			Set oJson = JSON.parse(Join(Array(strJson)))
			if err > 0 then
				' totally fucked at this point.
			else
				Call fnSettings_setCourseJsonObj(courseId, sField, oJson)
			end if
		Else
			Call fnSettings_setCourseJsonObj(courseId, sField, oJson)
		end if
	end if
	on error goto 0
	If Not JsonIsValid(oJson) Then Set oJson = Nothing
	
End Sub
Sub fnSettings_setCourseJsonObj(ByVal courseId, ByVal sField, ByRef oJson)
	If InStr("config,help,references,glossary", LCase(sField)) = 0 Then Exit Sub
Dim sJson
	sJson = JSON.stringify(oJson, null, 0)
	sJson = Replace(sJson, "\" & chr(34), "\\" & chr(34))
	Call db.Exec("UPDATE Courses SET `" & sField & "` = {1} WHERE id = {0}", Array(courseId, sJson))
	If LCase(sField) = "config" Then
		Call db.Exec("UPDATE Courses SET `name` = {1} WHERE id = {0}", Array(courseId, oJson.course.name))
	End If
End Sub


'' ===========================================================================================================================



''
'' this process can be called on an existing content folder to change from one runtime to another
''
Sub ApplyRuntime(ByVal ContentFolderPath, ByVal DiskName, ByVal SelectedRuntime, ByVal DeleteZip, ByVal CopyLess)
Dim sLessTemp, strTemp : sLessTemp = ""
	Dim TempFolderName : TempFolderName = Now
	TempFolderName = replace(TempFolderName, " ","")
	TempFolderName = replace(TempFolderName, ":", "")
	TempFolderName = replace(TempFolderName, "/", "")
	
	' If we are keeping LESS (/layout/less) then move it out somewhere to begin with
	If Config.FileSys.FolderExists(ContentFolderPath & "\SCO1\Layout\less") And (SelectedRuntime = "textplayer") And Not CopyLess Then
		sLessTemp = Config.TempPath & "\" & TempFolderName
		Config.FileSys.CreateFolder(sLessTemp)
		Config.FileSys.CreateFolder(sLessTemp & "\less")
		Config.FileSys.CopyFolder ContentFolderPath & "\SCO1\Layout\less", sLessTemp & "\less"
		Sleep 2 ' because FSO is slow at what it does, don't continue till the server has had time to finish file ops
	End If

	' delete .ds_store, thumbs.db, also existing player folder, html files that will be replaced
	Call CleanJunk(ContentFolderPath)
	
	Sleep 2 ' because FSO is slow at what it does, don't continue till the server has had time to finish file ops

	' copy files from the template version of the runtime into the package folder
	Call CopyInRuntime(ContentFolderPath, SelectedRuntime)
	
	If sLessTemp > "" Then ' Move less back into layout, also only set if selectedruntime = textplayer so we assume layout exists
		if config.filesys.folderexists(ContentFolderPath & "\SCO1\Layout\less") then
			config.filesys.deletefolder ContentFolderPath & "\SCO1\Layout\less", true
		end if
		config.filesys.createfolder(ContentFolderPath & "\SCO1\Layout\less")
		'response.write "<li>" &  sLessTemp & "\less"
		'response.write "<li>" & ContentFolderPath & "\SCO1\Layout"
		Config.FileSys.CopyFolder sLessTemp & "\less", ContentFolderPath & "\SCO1\Layout\less"
		' response.write "<li>copied from " & sLessTemp & " to " & ContentFolderPath & "\Layout"
	End If

	' go through the media folder and resize and compress things
	Call FixMedia(ContentFolderPath, SelectedRuntime)

	' builds the ims manifest based on the scorm version, otherwise generate it (assume we start at scorm 1.2)
	Call reApplySCORM(ContentFolderPath)

'	If Config.FileSys.FileExists(ContentFolderPath & "\imsmanifest.xml") Then 
'		Call FixManifest(ContentFolderPath, JustFileNamePart(DiskName), SelectedRuntime)
'	Else
'		strTemp = Mid(ContentFolderPath, InStrRev(ContentFolderPath, "\") + 1)
'		Call ApplySCORM(strTemp, "1.2")
'	End if

	' try to delete the original zip file (might be windows locked)
	If DeleteZip Then
		if config.filesys.fileexists(Config.CoursesPath & "\" & DiskName) Then Config.FileSys.DeleteFile (Config.CoursesPath & "\" & DiskName)
	End If

	' update the datetime on the content folder so that sort-by-most-recent works
	Call TouchFolder (ContentFolderPath)
	
End Sub

''
''	A routine for deleting layout & settings from a course and re-applying it from the baseline theme
''
Sub fnSettings_ApplyBaseline(ByVal VirtualFolder)
Dim MappedFolder
	MappedFolder = Server.MapPath(VirtualFolder)
	If Config.FileSys.FolderExists(MappedFolder & "\SCO1\Layout") Then
		Call Config.FileSys.DeleteFolder (MappedFolder & "\SCO1\Layout")
	End If
	Call FileCopy(Config.BaselineThemePath & "\en-us", MappedFolder & "\SCO1\en-us", "Content.html")
	Call FileCopy(Config.BaselineThemePath & "\en-us", MappedFolder & "\SCO1\en-us", "Quiz.html")
	Call FileCopy(Config.BaselineThemePath, MappedFolder & "\SCO1", "index.html")
	Call Config.FileSys.CopyFolder(Config.BaselineThemePath & "\Layout", MappedFolder & "\SCO1\Layout")
	
End Sub


''
'' Use the config definition of a "runtime" to work out which files are needed to run the content, and copy them in
'' CopyInRuntime "c:\web\courses\abc123", "textplayer"
''
Sub CopyInRuntime(byval path, byval selected)
Dim Engine, fold

	' Copy runtime engine folder (e.g. "/SCO1/layout/*")
	Engine = Config.RuntimesPath & "\" & selected & "\"
	fold = Engine & Config.getProperty(selected,"runtime")
	' response.write "<LI>" & Path & "\SCO1\" & Config.getProperty(selected,"runtime") & "|"
	
	If Not Config.FileSys.FolderExists(Path & "\SCO1\" & Config.getProperty(selected,"runtime")) Then
		Config.FileSys.CreateFolder(Path & "\SCO1\" & Config.getProperty(selected,"runtime"))
		Config.FileSys.CopyFolder fold, Path & "\SCO1\" & Config.getProperty(selected,"runtime")
	End If

	' Copy misc files that don't live in the runtime folder
	FileCopy Engine,				 		Path & "\SCO1\", 				Config.getProperty(selected,"launch")	
	FileCopy Engine & "en-us\", 			Path & "\SCO1\en-us\", 			Config.getProperty(selected,"content")	
	FileCopy Engine & "en-us\", 			Path & "\SCO1\en-us\", 			Config.getProperty(selected,"quiz")	
	if selected <> "textplayer" Then ' since we want it to be missing so that the next line catches
		FileCopy Engine & "Configuration\", 	Path & "\SCO1\Configuration\", 	Config.getProperty(selected,"settings")	
	end if
	
	' Convert/overwrite the settings and course xml files to a JSON objects (sets defaults too)
	ConvertSettingsToJSONIfMissing Path
	MakeSureSettingsJSONIsUpToDate Path
	
	' tell the setting file that it has the latest engine version (previous step skips settings.json if it exists)
	if selected = "textplayer" then
		UpdateVersionInJSONToMatchGlobal Path
	end if
	
End Sub


''
''	Hand-code any changes to settings.js here that we need to ensure exist (in case it exists but hasn't been copied in/updated)
''
Sub MakeSureSettingsJSONIsUpToDate(Byval Path)
	If Config.FileSys.FileExists(Path & "\SCO1\Configuration\settings.json") Then
	
		Dim DefaultSettings, DefaultVer
		Call GetSettingsJSON(Config.RuntimesPath & "\textplayer\Configuration\settings.json", DefaultSettings)
		' DefaultVer = CDbl(Replace(DefualtSettings.engine.version, ".", ""))

		Dim Settings, SettingsVer
		Call GetSettingsJSON(path, Settings)
		' SettingsVer = CDbl(Replace(Settings.engine.version, ".", ""))

		' Take DefaultsSettings and copy all existing Settings over it, return a new JSON object
		Dim newSettings : Set newSettings = MergeJson(DefaultSettings, Settings)

		' Make sure new settings has the updated engine version number
		' newSettings.engine.purge("version")
		newSettings.engine.set "version", DefaultSettings.engine.version

		Call SaveSettingsJson(path, newSettings)

		Set DefaultSettings = Nothing
		Set Settings = Nothing
		Set newSettings = Nothing

	End If
End Sub


''
''	Hands off the settings.json builder if it doesn't (yet) exist
''
Sub ConvertSettingsToJSONIfMissing(byval path)
	If Not Config.FileSys.FileExists(Path & "\SCO1\Configuration\settings.json") Then
		ConvertSettingsToJSON Path
	End If
End Sub

''
''	Updates the version of JSON runtime to match the current global version
''
Sub UpdateVersionInJSONToMatchGlobal(byval path)
	Dim Settings : Call GetSettingsJSON(path, Settings)
	Settings.engine.version = Config.TextPlayerTemplateVersion
	Call SaveSettingsJson(path, Settings)
	Set Settings = Nothing
End Sub


''
'' Takes the various xml files and reads properties from them to build the JSON settings file used by new players
''
Sub ConvertSettingsToJSON(byval path)
	Dim xSettings, xCourse, oJSON
	Set oJSON = JSON.parse("{}") ' empty container

	' ----------------  Process course.xml ----------------------

	xCourse = IO.GetFileString(Path & "\Course.xml", "")
	Dim sMenu, sGlossary, sResources, sHelp, sScore, sName, sDescription, sLanguage
	sMenu = GetXMLNodeAttrib(xCourse, "language", "menu")
	sGlossary = GetXMLNodeAttrib(xCourse, "language", "glossary")
	sResources = GetXMLNodeAttrib(xCourse, "language", "resources")
	sHelp = GetXMLNodeAttrib(xCourse, "language", "help")
	sLanguage = GetXMLNodeAttrib(xCourse, "language", "code")
	sScore = GetXMLNodeAttrib(xCourse, "language", "passingScore")
	sName = GetXMLNodeText(xCourse, "name")
	sDescription = GetXMLNodeText(xCourse, "description")
	
	' ----------------  Process settings.xml ----------------------
	
	xSettings = IO.GetFileString(Path & "\SCO1\Configuration\Settings.xml", "")
	Dim sHeaderLeft, sHeaderRight, sHeaderToc, sHeaderTocVisible, sCopyright, sPrev, sHome, sNext, sHomeUri, sHomeLabel, sArrows
	Dim sMaxZoom, sAutoHide, sHeaderType, sLanguageOverrides
	sHeaderRight = Default(GetXmlNodeText(xSettings, "headerright"), "")
	sHeaderLeft = Default(GetXmlNodeText(xSettings, "headerleft"), "")
	sHeaderToc = Default(GetXmlNodeText(xSettings, "tocheader"), "")
	sHeaderTocVisible = Default(GetXmlNodeAttrib(xSettings, "tocheader", "visible"), "false")
	sCopyright = Default(GetXmlNodeText(xSettings, "copyright"), "&copy CourseSuite Pty. Ltd.")
	sPrev = Default(GetXmlNodeAttrib(xSettings, "navigation", "previous"), "true")
	sHome = Default(GetXmlNodeAttrib(xSettings, "navigation", "home"), "true")
	sNext = Default(GetXmlNodeAttrib(xSettings, "navigation", "next"), "true")
	sHomeUri = Default(GetXmlNodeAttrib(xSettings, "navigation", "homeuri"), "")
	sHomeLabel = Default(GetXmlNodeAttrib(xSettings, "navigation", "homelabel"), "Home")
	sArrows = Default(GetXmlNodeAttrib(xSettings, "navigation", "arrows"), "true")
	sMaxZoom = Default(GetXmlNodeAttrib(xSettings, "layout", "maxzoom"), "1.0")
	sAutoHide = Default(GetXmlNodeAttrib(xSettings, "layout", "autohide"), "true")
	sHeaderType = Default(GetXmlNodeAttrib(xSettings, "layout", "header"), "description")
	sLanguageOverrides = Default(GetXmlNodeText(xSettings, "strings language=""en-us"""), IO.GetFileString(Server.MapPath("/engine/templates/languageoverrides.txt"), ""))

	' ----------------  build JSON ----------------------
	Dim oCourse : Set oCourse = JSON.parse("{}")
	oCourse.set "id", IdMaFy(sName)
	oCourse.set "name", sName
	oCourse.set "description", sDescription
	oCourse.set "language", sLanguage
	oCourse.set "passingScore", sScore
	oJson.set "course", oCourse
	Set oCourse = Nothing

	Dim oHeaderLeft : Set oHeaderLeft = JSON.parse("{}")
	oHeaderLeft.set "content", sHeaderLeft
	oHeaderLeft.set "visible", (sHeaderLeft > "")
	oJson.set "headerleft", oHeaderLeft
	Set oHeaderLeft = Nothing

	Dim oHeaderRight : Set oHeaderRight = JSON.parse("{}")
	oHeaderRight.set "content", sHeaderRight
	oHeaderRight.set "visible", (sHeaderRight > "")
	oJson.set "headerright", oHeaderRight
	Set oHeaderRight = Nothing

	Dim oHeaderToc : Set oHeaderToc = JSON.parse("{}")
	oHeaderToc.set "content", sHeaderToc
	oHeaderToc.set "visible", sHeaderTocVisible
	oJson.set "tocheader", oHeaderToc
	Set oHeaderToc = Nothing

	Dim oCopyright : Set oCopyright = JSON.parse("{}")
	oCopyright.set "content", sCopyright
	oCopyright.set "visible", (sCopyright > "")
	oJson.set "copyright", oCopyright
	Set oCopyright = Nothing

	Dim oNode, oNavigation : Set oNavigation = JSON.parse("{}")
		Set oNode = JSON.parse("{}")
		oNode.set "label", "Progress"
		oNode.set "visible", true
		oNavigation.set "progress", oNode	
		Set oNode = Nothing

		Set oNode = JSON.parse("{}")
		oNode.set "label", "Glossary"
		oNode.set "visible", sGlossary
		oNavigation.set "glossary", oNode	
		Set oNode = Nothing

		Set oNode = JSON.parse("{}")
		oNode.set "label", "Resources"
		oNode.set "visible", sResources
		oNavigation.set "resources", oNode	
		Set oNode = Nothing

		Set oNode = JSON.parse("{}")
		oNode.set "label", "Help"
		oNode.set "visible", sHelp
		oNavigation.set "help", oNode	
		Set oNode = Nothing

		Set oNode = JSON.parse("{}")
		oNode.set "label", "Previous"
		oNode.set "visible", sPrev
		oNavigation.set "previous", oNode	
		Set oNode = Nothing

		Set oNode = JSON.parse("{}")
		oNode.set "label", sHomeLabel
		oNode.set "visible", sHome
		oNode.set "uri", sHomeUri
		oNavigation.set "home", oNode	
		Set oNode = Nothing

		Set oNode = JSON.parse("{}")
		oNode.set "label", "Next"
		oNode.set "visible", sNext
		oNavigation.set "next", oNode	
		Set oNode = Nothing
		
		oNavigation.set "arrows", sArrows
	oJson.set "navigation", oNavigation
	Set oNavigation = Nothing

	Dim oLayout : Set oLayout = JSON.parse("{}")
	oLayout.set "basecolour", "#afcfa9"
	oLayout.set "maxzoom", sMaxZoom
	oLayout.set "autohide", sAutoHide
	oLayout.set "template", "coursesuite"
		Set oNode = JSON.parse("{}")
		oNode.set "north", 156
		oNode.set "south", 42
		oNode.set "west", 246
		oNode.set "east", 0
	oLayout.set "panesize", oNode
		Set oNode = Nothing

		Set oNode = JSON.parse("{}")
		oNode.set "style", sHeaderType
		oNode.set "visible", true
	oLayout.set "header", oNode
		Set oNode = Nothing

		Set oNode = JSON.parse("{}")
		oNode.set "visible", true
	oLayout.set "footer", oNode
		Set oNode = Nothing

	oJson.set "layout", oLayout
	Set oLayout = Nothing

	Dim oStrings
		' looks like <string var="PrTestLiteral">Test</string>
		' should be {"key":"PrTestLiteral","text": "Test"},
		sLanguageOverrides = Replace(sLanguageOverrides, "<string var=""", "{""key"":""")
		sLanguageOverrides = Replace(sLanguageOverrides, "</string>", """},")
		sLanguageOverrides = Replace(sLanguageOverrides, """>",""",""text"": """)
		sLanguageOverrides = Trim(sLanguageOverrides)
		sLanguageOverrides = Left(sLanguageOverrides, Len(sLanguageOverrides) -1)
		Set oStrings = JSON.parse("[" & sLanguageOverrides & "]")
	oJson.set "strings", oStrings ' array of objects
	Set oStrings = Nothing
	
	Dim oEngine : Set oEngine = JSON.parse("{}")
		oEngine.set "name", "textplayer"
		oEngine.set "version", 1.0
		oEngine.set "sco", GetCurrentRuntimeFromManifest(path)
	oJson.set "engine", oEngine
	Set oEngine = Nothing
	
	' when writing JSON, the correct method is utf-8 without a BOM
	IO.WriteUTF8WithoutBOM path & "\SCO1\Configuration\settings.json", JSON.stringify(oJson, null, 4)
	
	Set oJson = Nothing

End Sub




''
'' Get the name of the current engine (e.g. textplayer, leo, etc)
''
Function GetEngineName(byval path)
Dim settings, data
	GetEngineName = "?"
	'ConvertSettingsToJSONIfMissing path
	data = IO.GetFileString(Path & "\SCO1\Configuration\Settings.json", "")
	If data = "" Then Exit Function
	Set Settings = JSON.parse(join(array(data)))
	GetEngineName = Settings.Engine.Name
	Set Settings = Nothing
End Function

''
''	Update the settings JSON file with the name of the engine
''
Sub SetEngineName(ByVal path, byVal newValue)
Dim settings, data, obj
	ConvertSettingsToJSONIfMissing path
	data = IO.GetFileString(Path & "\SCO1\Configuration\Settings.json", "")
	Set Settings = JSON.parse(join(array(data)))
	Set obj = Settings.Engine
	obj.set "name", newValue
	IO.WriteUTF8WithoutBOM path, JSON.stringify(Settings, null, 4)
	Set Settings = Nothing
End Sub

''
''	Get the current scorm version from the settings.json file
''
Function GetEngineSCO(byval path)
Dim settings, data
	'ConvertSettingsToJSONIfMissing path
	data = IO.GetFileString(Path & "\SCO1\Configuration\Settings.json", "")
	If data = "" Then Exit Function
	Set Settings = JSON.parse(join(array(data)))
	GetEngineSco = Settings.Engine.sco
	Set Settings = Nothing
End Function

''
'' Set the current scorm version to the settings.json file
''
Sub SetEngineSCO(byval path, version)
Dim settings, data, obj
	ConvertSettingsToJSONIfMissing path
	data = IO.GetFileString(Path & "\SCO1\Configuration\Settings.json", "")
	Set Settings = JSON.parse(join(array(data)))
	Set obj = Settings.Engine
	obj.set "sco", version
	IO.WriteUTF8WithoutBOM path, JSON.stringify(Settings, null, 4)
	Set Settings = Nothing
End Sub


Sub GetSettingsJSON(byval path, byref oJSON)
	if InStr(path,".json") = 0 Then path = path & "\SCO1\Configuration\settings.json"
	Dim str : str = IO.GetFileString(path, "") ' which does IO.LoadFileStream for .json files, which skips BOM
	If str = "" Then str = "{}" ' empty object
	Set oJSON = JSON.parse(join(array(str)))
	If Not JsonIsValid(oJSON) Then Set oJSON = Nothing ' which we can test for with (oJSON Is Nothing)
End Sub
 
Sub SaveSettingsJson(byval path, byref oJSON)
	If Not (oJSON Is Nothing) Then
		Dim strJson
		Dim courseId
		strJson = JSON.stringify(oJSON, null, 4)

		IO.WriteUTF8WithoutBOM path & "\SCO1\Configuration\settings.json", strJson

		courseId = GetCourseIdFromPath(unMapCoursePath(path))
		If courseId > 0 Then

			Call db.exec("UPDATE courses SET config={0} WHERE id={1}", Array(strJson,CourseId))
		End If		
		
	End If
End Sub

Function ReturnSettingsJsonString(ByVal path)
	Dim o : Call GetSettingsJSON (path, o)
	ReturnSettingsJsonString = JSON.stringify(o, null, 4)
End Function


''
''	SynchroniseBaseColourFromSettings needs to update variables inside a LESS file. This is a helper for that
''
Sub InjectVariableValue(ByRef theString, ByVal theVariable, ByVal theValue)
Dim leftPart, rightPart

	If theValue > "" Then
		leftPart = Left(theString, InStr(theString, "@" & theVariable & ":") + Len(theVariable) + 1)
		rightPart = Mid(theString, InStr(Len(leftPart), theString, ";"))
		theString = leftPart & theValue & rightPart
	End If
	
End Sub

''
''	Sets the base colour in the app.less to match the colour stored in settings.json
''
Sub SynchroniseBaseColourFromSettings(byval path)
	Dim Settings : Call GetSettingsJSON(path, Settings)
	If Not (Settings Is Nothing) Then
		Call fnSettings_SynchroniseBaseColourFromSettings(path, Settings)
	End If
	Set Settings = Nothing
End Sub


Sub fnSettings_SynchroniseBaseColourFromSettings(ByVal mappedPath, ByVal Settings)
	If Config.FileSys.FolderExists( mappedPath & "\SCO1\Layout") Then
		Dim colour : colour = Settings.layout.basecolour

		Dim altcolour1, altcolour2, bodyheight, bodyunit, tocColour
		on error resume next ' may not exist yet
		altcolour1 = Settings.layout.altcolour
		altcolour2 = Settings.layout.altcolour2
		tocColour = Settings.layout.toccolour
		If tocColour = "" Then tocColour = colour ' default = primary
		bodyheight = Settings.layout.bodyheight
		bodyunit = Settings.layout.bodyunit
		on error goto 0
		
		If Trim("" & bodyheight) = "" Then bodyheight = "100"
		If bodyunit <> "px" Then bodyunit = "%"
		
		Dim page : page = Settings.layout.pagecolour
		Dim app, variables
		
		'response.write "<pre>"
		'response.write JSON.stringify(Settings, null, 4)
		'response.write "</pre>"
		'response.end
		
		variables = false
		
		app = IO.GetFileString(mappedPath & "\SCO1\Layout\less\app.less", "") ' the app.less file as a string

		If config.filesys.fileexists(mappedPath & "\SCO1\Layout\less\variables.less") Then
			variables = true
			app = IO.GetFileString(mappedPath & "\SCO1\Layout\less\variables.less", "") ' switcheroo
		end if
		
		Dim lStr, rStr

		if variables then ' 20140211+
		
			InjectVariableValue app, "primaryColour", colour
			InjectVariableValue app, "secondaryColour", altcolour1
			InjectVariableValue app, "tertiaryColour", altcolour2
			InjectVariableValue app, "tocColour", tocColour
			InjectVariableValue app, "pageBackground", page

			InjectVariableValue app, "bodyheight", bodyheight
			InjectVariableValue app, "bodyunit", "'" & bodyunit & "'"

			on error resume next
			InjectVariableValue app, "headerBackgroundAttachment", Settings.layout.header.imagealign
			InjectVariableValue app, "headerBackgroundRepeat", Settings.layout.header.imagerepeat
			InjectVariableValue app, "headerBackgroundSize", Settings.layout.header.imagesize
			on error goto 0

		else ' legacy

			lStr = Left(app, InStr(app, "@baseColour:") + 11) ' string up and including to @basecolour:
			rStr = Mid(app, InStr(Len(lStr), app, ";")) ' string from and including first semicolon after @basecolour:
			app = lStr & colour & rstr // replace primary colour

			lStr = Left(app, InStr(app, "@baseBackground:") + 15) ' string up and including to @baseBackground:
			rStr = Mid(app, InStr(Len(lStr), app, ";")) ' string from and including first semicolon after @baseBackground:
			app = lStr & page & rstr // replace background colour

		end if

		If InStr(app, "@headerBackgroundImage:") > 0 Then ' If Settings.layout.template = "coursesuite" Then
				Dim background, s : background = Settings.headerleft.content
			If InStr(background, "<img ") > 0 Then
				s = Mid(background, InStr(InStr(background, "<img "), background, " src=", vbTextCompare) + 6)
				s = Left(s, InStr(s, "'") - 1)
				background = "../../en-us/" & s
			End If

			InjectVariableValue app, "headerBackgroundImage", chr(34) & background & chr(34)

		End If

		if variables Then
			IO.WriteUTF8WithoutBOM mappedPath & "\SCO1\Layout\less\variables.less", app
		Else
			IO.WriteUTF8WithoutBOM mappedPath & "\SCO1\Layout\less\app.less", app
		end if

	End If
End Sub

''
'' Look up the engine type to work out the setting value
''
Function GetSettingValue(path, setting)
	Dim Settings : Call GetSettingsJSON(path, Settings)
	DIm enginename : enginename = "leo" ' assume oldest
	If Not (Settings Is Nothing) Then
		enginename = Settings.engine.name
		Set Settings = Nothing
	End If
	GetSettingValue = Config.getProperty(enginename, setting)
End Function


''
''	Takes CHANGES from LayoutsPath / Template and applies them over existing files in the course folder.
''
Sub fnSettings_ApplyLayout(byval layoutsTemplate, byval folder, byval synchColour)

	If Trim("" & layoutsTemplate) = "" Then Exit Sub
	If Trim("" & folder) = "" Then Exit Sub
	Dim mappedFolder : mappedFolder = Server.MapPath(folder)
	
	Dim xCopyCommand, xExclusionsFile, xSource, xDest, xCopyResult
	xSource = Config.LayoutsPath & "\" & layoutsTemplate
	xDest = mappedFolder & "\SCO1"
	xExclusionsFile = Server.MapPath("/engine/lib/exclusions.txt")
	
	' XCOPY does the grunt-work
	' /C - ignore errors
	' /I - assumes to be directories if not found
	' /Q - prevents output - remove if you want to read from obj.stdOut.ReadAll()
	' /R - copy read only files
	' /S - recursive, exclude empty folders
	' /U - only copy files from source that exist in destinaion already (overwrite with changes)
	' /Y - answer "yes" to any possible overwrite prompts
	' /exclude:FileSpec - FileSpec is a path to a file that contains names of files we want to always skip, such as .DS_Store
	
	' Apply settings.json from baseline
	Call fnSettings_CopySettingsFromAnotherCourse ( Config.BaselineThemePath, mappedFolder, true, false) ' source = baseline, dest = this folder, copy settings, don't delete layout
	
	
	xCopyCommand = "xcopy """ & xSource & """ """ & xDest & """ /C /I /Q /R /S /U /Y /exclude:" & xExclusionsFile
	Call Config.Shell.Exec(xCopyCommand)
	
	' How to debug ... 
	' Set xCopyResult = Config.Shell.Exec(xCopyCommand)
	' response.write xCopyResult.stdOut.ReadAll()
	' response.end
	
	' make sure app.less is up to date with settings
	If synchColour Then
		Call SynchroniseBaseColourFromSettings(mappedFolder)
	End If
	
	' make sure settings.json is updated with the settings name
	Call TellSettingsJSONAboutCurrentLayout(mappedFolder, layoutsTemplate)

	'  ensure JSON in the db matches what is on disk
	Call PushCurrentConfigToDatabase(folder)
	
End Sub


''
''	Loads the current config off disk and pushes it to the database
''
Sub PushCurrentConfigToDatabase(ByVal folder)
	Dim Settings
	GetSettingsJSON Server.MapPath(folder), Settings
	If Not Settings Is Nothing Then
		Call db.Exec("UPDATE courses SET config={0}, layout={2}, name={3} WHERE id={1}", Array(JSON.stringify(Settings, null, 4), GetCourseIdFromPath(folder), Settings.layout.template, Settings.course.name))
	End If
End Sub


''
''	Copies all the settings and engine from one course to another, optionally including settings.json
''
Sub CopySettingsFromAnotherCourse(ByVal sourceId, ByVal destinationId, ByVal mergeSettings)
Dim source, destination

	source = Server.MapPath(GetCoursePath(sourceId))
	destination = Server.MapPath(GetCoursePath(destinationId))

	Call fnSettings_CopySettingsFromAnotherCourse(source & "\SCO1", destination, mergeSettings, true)

End Sub

Sub fnSettings_CopySettingsFromAnotherCourse(ByVal source, ByVal destination, ByVal mergeSettings, ByVal CopyLayout)

	If Not Config.FileSys.FolderExists(source) Then Exit Sub
	If Not Config.FileSys.FolderExists(destination) Then Exit Sub
	
	If CopyLayout Then

		' Trash existing layout folder and replace it from source
		If Config.FileSys.FolderExists(destination & "\SCO1\Layout") Then
			Call Config.FileSys.DeleteFolder (destination & "\SCO1\Layout", true)
		End If

		Call Config.FileSys.CopyFolder (source & "\Layout", destination & "\SCO1\")
	
	End If
	
	If mergeSettings Then
	
		'' deleted maybe?
		If Not Config.FileSys.FileExists(destination & "\SCO1\Configuration\settings.json") Then
			ConvertSettingsToJSONIfMissing destination
		End If

		Dim destinationSettings : Call GetSettingsJSON(destination & "\SCO1\Configuration\settings.json", destinationSettings)
		Dim sourceSettings : Call GetSettingsJSON(source & "\Configuration\settings.json", sourceSettings)
		Dim sHeadLeft, sHeadRight, dVersion

		' remember some important settings
		sHeadLeft = destinationSettings.headerleft.content
		sHeadRight = destinationSettings.headerright.content
		dVersion = destinationSettings.engine.version
		
		'' delete the keys from the settings that we want to replace
		destinationSettings.purge("headerleft")
		destinationSettings.purge("headerright")
		destinationSettings.purge("tocheader")
		destinationSettings.purge("copyright")
		destinationSettings.purge("navigation")
		destinationSettings.purge("layout")
		destinationSettings.purge("strings")
		destinationSettings.purge("engine")
		
		'' Copy source settings over desintation : MergeJson (THIS with THAT) and return NEW
		Dim newSettings : Set newSettings = MergeJson(sourceSettings, destinationSettings)

		'' overwrite settings we need to keep
		newSettings.headerleft.set "content", sHeadLeft
		newSettings.headerright.set "content", sHeadRight
		newSettings.engine.set "version", dVersion
	
		'' Save our existing settings to the db as a revision
		Call SaveRevision (destination & "\SCO1\Configuration\settings.json")
		
		'' save merged settings over the top of the destination settings file
		Call SaveSettingsJson(destination, newSettings)
		
	End If
End Sub

Sub TellSettingsJSONAboutCurrentLayout(ByVal mappedfolder, ByVal sValue)
	Dim oJSON, ar, i
	Call GetSettingsJSON(mappedfolder & "\SCO1\Configuration\settings.json", oJSON)
	oJSON.layout.purge("template")
	oJSON.layout.set "template", "" & sValue
	
	' TODO: Caching!
	ar = CalcLayoutDates()
	for i = 0 to ubound(ar)
		if ar(0,i) = sValue Then
			oJSON.engine.purge("layoutVersion")
			oJSON.engine.set "layoutVersion", ar(1,i)
		end if
	next
	Erase ar
	
	Call SaveSettingsJson(mappedFolder, oJSON)
End Sub


Function SetCourseConfigData(ByVal COURSE_ID)	
Dim aRS, sql, MAPPED_COURSE, cfg
	MAPPED_COURSE = Server.MapPath(db.getScalar("select path from coursefolder where id=" & COURSE_ID, 0))
	Dim Settings : Call GetSettingsJSON(MAPPED_COURSE, Settings)
	cfg = JSON.stringify(Settings, null, 4)
	Call db.connection.execute("UPDATE courses SET config='" & db.sqlsafe(cfg) & "' where id=" & COURSE_ID, adExecuteNoRecords)

	'set aRS = server.createObject("ADODB.Recordset")
	'sql = "SELECT * FROM courses where id = " & COURSE_ID
	'aRS.open sql, db.connection, 3, 3
	'aRS("config") = cfg
	'Set Settings = Nothing
	'aRS.update
	'aRS.close()
	'set aRS = nothing
End Function




Function GetCourseProperty(ByVal folder, ByVal prop)
Dim path, contentStr, Settings
	If InStr(folder,":\") > 0 Then
		path = folder
	Else
		path = Config.CoursesPath & "\" & folder
	End If
	GetCourseProperty = ""
	Select case lcase(prop)
		case "lessdebug"
			contentStr = IO.GetFileString(Path & "\SCO1\en-us\" & GetSettingValue(path, "content"), "")
			If InStr(LCase(contentStr), "less.watch();") > 0 Then
				GetCourseProperty = "true"
			ElseIf InStr(contentStr, lessScript) = 0 Then
				GetCourseProperty = "unsupported"
			Else
				GetCourseProperty = "false"
			End If
		
		case "scoversion"
			 Call GetSettingsJSON(path, Settings)
			 If Not Settings Is Nothing Then
				 GetCourseProperty = Settings.engine.sco
		     End If
			 
		case "layout"
			 Call GetSettingsJSON(path, Settings)
			 If Not Settings Is Nothing Then
				 GetCourseProperty = Settings.layout.template
			 End If
			 
		case "layoutversion"
			Call GetSettingsJSON(path, Settings)
			If Not Settings Is Nothing Then
				On Error Resume Next
				GetCourseProperty = Settings.engine.layoutVersion
				On Error Goto 0
			End If

		case "engine"
			 Call GetSettingsJSON(path, Settings)
			 If Not Settings Is Nothing Then
				 GetCourseProperty = Settings.engine.name
			 End If
		
		case "scodebug"
			contentStr = IO.GetFileString(path & "\SCO1\" & GetSettingValue(path, "runtime") & "\js\scorm\sco_api.js" , "")
			GetCourseProperty = LCase("" & InStr(Lcase(contentStr), "var _bdebug = true;") > 0)
		
		case "flagged"
			GetCourseProperty = LCase("" & Config.FileSys.FileExists(Config.CoursesPath & "\" & folder & ".flag"))
		
	End Select
End Function



%>