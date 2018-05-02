<%

Sub CheckThatTheFoldersOnDiskMatchWhatsInTheDatabase
	'Call CheckLegacyFolders() ' turn this off after "/courses/archive" is depreciated
	Call CheckCourseContainersToMakeSureTheyExistInTheDatabase()
	Call CheckContainerFolderCourses()
End Sub

''
''	There should be a container (db) for each folder in /courses/
''
Sub CheckCourseContainersToMakeSureTheyExistInTheDatabase
Dim sf
	For Each sf in Config.FileSys.GetFolder(Server.MapPath("/courses")).SubFolders
		If Not Left(sf.name,1) = "." Then
			Call db.insertIfEmpty("container", Array("name", sf.name), "`name`='" & db.SqlSafe(sf.name) & "'")
		End If
	Next
End Sub

''
'' Look through the containers and check the folders in these are in the db.
''
Sub CheckContainerFolderCourses
Dim rs
	set rs = db.getrs("select id,name from container", "")
	do while not rs.eof
		CheckSpecifiedFolderForNewCoursesAndEnterThemIntoTheDatabase rs("id"), server.mappath("/courses/" & rs("name"))
		rs.movenext
	loop
	Set rs = nothing
End Sub

''
''	The legacy course folders were called 'Archive' and 'Current'; this updates courses in these folders to the db
''
Sub CheckLegacyFolders
	Dim f, c, fold
	Dim fil, name, touched, folder, settings, rs, sql, layout, engine, stage, archived, configuration
	Dim pathA, pathI, path, rsCols, rsVals
	
	cntCourse = GetContainerId("current")
	cntArchive = GetContainerId("archive")
	
	f = 0
	' count folders
	pathA = Array(Config.CoursesPath,Config.ArchivePath)
	For pathI = 0 to UBound(pathA)
		path = pathA(pathI)
		set fold = config.filesys.getfolder(path)
		' TODO: actually iterate and check folders for an imsmanifest.xml
		f = f + fold.subfolders.count
		set fold = nothing
	next
	
	' folder exists in 'current' as well as 'archive'
	Set fold = config.filesys.getfolder(config.archivepath)
	for each fil in fold.subfolders
		if config.filesys.folderexists(config.coursespath & "\" & fil.name) then
			Config.FileSys.MoveFolder Config.ArchivePath & "\" & fil.name, Config.ArchivePath & "\" & fil.name & "_archived"
		end if
	next
	set fold = nothing

	if (f <> db.count("courses","")) Then
		For pathI = 0 to UBound(pathA)
			path = pathA(pathI)
			Set fold = Config.FileSys.getFolder(path)
			for each fil in fold.subfolders
				folder = fil.name
				touched = DateDiff("s", "01/01/1970 00:00:00", fil.DateLastAccessed) ' timestamp
				GetSettingsJSON path & "\" & folder, settings
				if settings is nothing then
					engine = "avide"
					layout = ""
					name = GetCourseNameFromSettingsXML(path)
					configuration = ""
					stage = "complete" ' most likely
				else
					engine = settings.engine.name
					layout = settings.layout.template
					name = settings.course.name
					configuration = JSON.stringify(settings, null, 4)
					stage = "inprogress" ' probably
				end if
				If name > "" Then ' it's got a course config of some kind
					container = iif(Path = Config.ArchivePath, cntArchive, cntCourse)
					rsVals = Array("name", name, "folder", folder, "touched", touched, "engine", engine, "layout", layout, "stage", stage, "container", container, "config", configuration, "locked", false)
					' response.write "<LI>name=" & name & " container=" & container & " path=" & path
					Call db.insertIfEmpty("courses", rsVals, "`folder` = '" & db.SQLSafe(folder) & "'")
				End If
			next
			set fold = nothing
		next
	end if

End Sub

Sub CheckSpecifiedFolderForNewCoursesAndEnterThemIntoTheDatabase(byval container, byval path)
Dim fil, folder, touched, settings, engine, layout, name, configuration, stage, rsVals
	if not config.filesys.folderexists(path) then exit sub
	Set fold = Config.FileSys.getFolder(path)
	for each fil in fold.subfolders
		folder = fil.name
		touched = DateDiff("s", "01/01/1970 00:00:00", fil.DateLastAccessed) ' timestamp
		GetSettingsJSON path & "\" & folder, settings
'		response.write "<li>importing " & folder
		if settings is nothing then
			engine = "avide"
			layout = ""
			name = GetCourseNameFromSettingsXML(path)
			configuration = ""
			stage = "complete" ' most likely
		else
			engine = settings.engine.name
			layout = settings.layout.template
			name = settings.course.name
			configuration = JSON.stringify(settings, null, 4)
			stage = "inprogress" ' probably
		end if
		If name > "" Then ' it's got a course config of some kind
			' response.write " - course = " & name
			rsVals = Array("name", name, "folder", folder, "touched", touched, "engine", engine, "layout", layout, "stage", stage, "container", container, "config", configuration, "locked", false)
response.write "<LI>name=" & name & " container=" & container & " path=" & path & " folder=" & db.SQLSafe(folder)
			Call db.insertIfEmpty("courses", rsVals, "`folder`='" & db.SQLSafe(folder) & "' and `container`=" & container)
		End If
	next
	set fold = nothing
End Sub

''
''	This draws the list of courses based on the sql handed in
''
Sub DrawCourseListRO(ByVal sql)
	Call Render_CourseList(sql,true)
End Sub
Sub DrawCourseList(ByVal sql)
	Call Render_CourseList(sql,false)
End Sub
Sub Render_CourseList(ByVal sql, ByVal readOnly)
	Dim pinIcon, trClass, i, folds, c, s, colour, rs, jLoop
	
	Dim name, folder, updated, engine, layout, stage, container, settings, configuration, locked, containerText, missing, coursePath
	Dim metaLayoutDates, metaLayoutVersion, metaEngineVersion, metaEngineObj, notmanaged

	metaLayoutDates = CalcLayoutDates()

	Call GetSettingsJSON(Config.RuntimesPath & "\textplayer\Configuration\settings.json", metaEngineObj)

	Response.Write "<table class='list-of-courses table table-striped table-bordered table-condensed'>"
	Response.Write "<thead><tr>"
	Response.Write "<th>Course</th>"
	Response.write "<th width='80'>Container</th>"
	response.write "<th width='80'>Theme</th>"
	if not readonly then response.write "<th width='200'>Tools</th>"
	response.write "<th width='100'>Updated</th>"
	Response.Write "</tr></thead>"
	Response.Write "<tbody>"
	
	set rs = db.getrs(sql, "")
	aItems = Array()
	If Not (rs.BOF AND rs.EOF) Then
		Do While Not rs.EOF
		
		name = Trim(rs("name") & "")
		folder = rs("folder")
		if (name = "") then name = folder
		updated = rs("updated")
		engine = rs("engine")
		layout = rs("layout")
		stage = rs("stage")
		container = rs("container")
		containerText = getContainerName(container)
		locked = rs("locked")

		' Config might not be set or have bad data
		On Error Resume Next
		Set configuration = JSON.parse(Join(Array(rs("config"))))
		If Err Then Set configuration = Nothing ' JSON.parse("{}")
		On Error Goto 0

		coursePath = GetCoursePath(rs("id"))
		if coursePath = "" Then
			missing = true
			notmanaged = false
		else
			missing = not config.filesys.folderexists(server.mappath(coursePath))
			notmanaged = not config.filesys.folderexists(server.mappath(coursepath & "/SCO1/"))
		End if
		
		response.write "<tr data-id='" & rs("id") & "' data-layout='" & layout & "'>" & vbNewLine 
			response.write "<td>"
			if readonly then
				response.write "<a href='/engine/action.asp?action=play&id=" & rs("id") & "&wrap=true' class='btn button course-play-button' target='course" & rs("id") & "'><span class='ui-icon ui-icon-play'></span></a> "
			elseif notmanaged Then
				response.write "<span class='badge badge-important' title='Not a TARD.is course'><i class='icon-exclamation-sign'></i></span> "
				response.write "<a href='#play' class='btn button course-play-button' title='Play (Shift-click to bypass SCORM debugger)' target='_blank'><span class='ui-icon ui-icon-play'></span></a> "
			elseif missing then
				response.write "<span class='badge badge-important' title='Missing from disk!'><i class='icon-exclamation'></i></span> "
				folder = "<b>Missing from:</b> " & coursePath ' shows where it should be
			else
				response.write "<a href='#play' class='btn button course-play-button' title='Play (Shift-click to bypass SCORM debugger)' target='_blank'><span class='ui-icon ui-icon-play'></span></a> "
			end if

			if locked or missing or notmanaged or readonly then
				response.write "<p class='pull-right'><span class='label" & GetLabelFromStage(rs("stage")) & "'>" & Capitalise(rs("stage")) & "</span></p>"
			else
				response.write "<p class='pull-right change-label'><a href='#' class='dropdown-toggle' data-toggle='dropdown'><span class='label" & GetLabelFromStage(rs("stage")) & "'>" & Capitalise(rs("stage")) & "</span></a></p>"
			end if

			response.write "<b>" & name & "</b><small>" & folder & "</small></td>"

			if readonly then
				response.write "<td>" & containerText & "</td>"
			else
				response.write "<td class='action-bar'><a href='#move' data-container='" & containerText & "' title='Change container / folder' class='btn btn-mini dropdown-toggle' data-toggle='dropdown'><i class='icon-paste'></i> " & containerText & "</a></td>"
			end if
			response.write "<td>" & layout & "</td>"
			
		if not readOnly then

			response.write "<td class='nowrap action-bar'>"
			If missing Then
				response.write "missing from disk"
			ElseIf notmanaged Then
				response.write "invalid structure"
			ElseIf locked then
				response.write "<a href='#unlock' title='Unlock' class='btn'><i class='icon-lock icon-2x'></i></a>"
			Else
				response.write "<div class='btn-group'>"
				response.write "<a href='#edit' title='Edit' class='btn'><i class='icon-pencil icon-2x'></i></a>"
				response.write "</div>"

				response.write "<div class='btn-group'>"
				' download from here is different to download from within a course - why?
				' response.write "<a href='#download' title='Download' class='btn'><i class='icon-download icon-2x'></i></a>"
				response.write "<a href='#clone' title='Clone' class='btn'><i class='icon-copy icon-2x'></i></a>"
				response.write "<a href='#lock' title='Lock' class='btn'><i class='icon-unlock icon-2x'></i></a>"
				If rs("stage") = "archived" then response.write "<a href='#delete' title='Delete (No Undo!)' class='btn confirm-trash'><i class='icon-trash icon-2x'></i></a>"
				response.write "</div>"
			end if
			response.write "</td>"

		end if

		response.write "<td class='nowrap'>" & NiceDate(updated) & "</td>"

		response.write "</tr>" & vbNewLine
		
		rs.movenext
		loop
	end if

	Response.Write "</tbody>"
	Response.Write "</table>"

End Sub

''
'' Things for the bottom of the screen!
''
Function RandomTip()
	
	Dim rs : set rs = db.getRS("SELECT * FROM tips", "")
	On Error Resume Next
	rs.Move CInt(db.count("tips", "") * Rnd())
	RandomTip = rs("tip")
	On Error Goto 0
	Set rs = nothing
End Function

''
''	Draws the course filter box
''
Sub DrawFilterBox(ByRef filter_sql)
	
	Dim selectOpts(), sLoop, sGroup, inpFilters, filterOrder, sf, rs, cookie, arFilters, j, k, id, mqkvx, inclsubs, filteredContainer
	ReDim selectOpts(2,0)

	inpFilters = Trim("" & request.form("filters"))
	filterOrder = Trim("" & request.form("order"))
	inclsubs = Trim("" & request.form("subs"))

	mqkvx = MyUserContainers()
	filteredContainer = (mqkvx <> "*")
	
	seek = Trim("" & request.form("seek"))
	If inpFilters = "" Then ' use the filters we had last time
		inpFilters = Trim("" & Request.Cookies("filters"))
		If inpFilters = "" Then 
			if mqkvx = "*" then mqkvx = "coursesuite"
			inpFilters = "courses.container=1,courses.layout='" & mqkvx & "'"
		End If
	end if
	if filterORder = "" Then filterOrder = "updated desc"
	if seek = "" then seek = "or"
	seek = " " & seek & " "
	
	Dim mine : mine = MyContainers(Server.MapPath("/courses"))
	For sLoop = 0 to ubound(mine)
		id = db.getScalarWithParams("select id from container where name={0}", mine(sLoop), "")
		AddOption selectOpts, "Container (Top level folder)", Capitalise(mine(sLoop)), "courses.container=" & id
	Next

	'Set rs = db.getRS("select id,name from container", "")
	'Do While Not rs.eof
	'	AddOption selectOpts, "Container (Top level folder)", Capitalise(rs("name")), "courses.container=" & rs("id")
	'	rs.MoveNext
	'Loop
	'Set rs = Nothing

	For Each sf In Config.FileSys.GetFolder(Server.MapPath("/layouts")).SubFolders
		AddOption selectOpts, "Theme", Capitalise(sf.name), "courses.layout='" & db.SQLSafe(sf.name) & "'"
	Next

	AddOption selectOpts, "Stage", "New", "courses.stage='new'"
	AddOption selectOpts, "Stage", "Started", "courses.stage='started'"
	AddOption selectOpts, "Stage", "In progress", "courses.stage='inprogress'"
	AddOption selectOpts, "Stage", "Almost done", "courses.stage='almostdone'"
	AddOption selectOpts, "Stage", "Complete", "courses.stage='complete'"
	AddOption selectOpts, "Stage", "Archived", "courses.stage='archived'"
	AddOption selectOpts, "Stage", "Any except archived", "courses.stage<>'archived'"
	
	cookie = ""
	arFilters = Split(inpFilters,",")
	
	filter_sql = "select * from courses where "
	
	filter_sql = UserCourseContainerFilterSQL(filter_sql)
	
	'response.write "<marquee>" & filter_sql & "</marquee>"
	
	Response.Write "<select id='filters' name='filters' multiple='multiple'>"
	For sLoop = 0 To UBound(selectOpts,2)
		if selectOpts(0,sLoop) > "" then
			If sGroup <> selectOpts(2,sLoop) Then
				If sGroup > "" Then Response.Write "</optgroup>"
				sGroup = selectOpts(2,sLoop)
				response.write "<optgroup label=""" & sGroup & """>"
			End If
			Response.Write "<option value=""" & selectOpts(0,sLoop) & """"
			k = 0
			For j = 0 to ubound(arFilters) ' see if this option matches a filter
				If selectOpts(0,sLoop) = trim(arFilters(j)) Then
					k = 1
					exit for
				End If
			Next
			If k = 1 Then ' InStr(inpFilters, selectOpts(0,sLoop)) > 0 Then
				cookie = cookie & selectOpts(0,sLoop) & ","
				response.write " selected"
				filter_sql = filter_sql & "(" & selectOpts(0,sLoop) & ")" & seek
			end if
			Response.Write ">" & selectOpts(1,sLoop) & "</option>"
		end if
	Next
	Erase selectOpts
	Response.Write "</optgroup>"
	if right(filter_sql, len(seek)) = seek Then filter_sql = Left(filter_sql, len(filter_sql)-4)

	if inclsubs = "hide" and not filteredContainer then
		filter_sql = filter_sql & " AND container NOT IN (select id FROM container WHERE name IN (SELECT container FROM plebs WHERE tier IS NOT NULL))"
	end if

	if (right(filter_sql, 5) = " and ") then
		filter_sql = left(filter_sql, len(filter_sql) - 5)
	end if

	filter_sql = filter_sql & " order by " & filterOrder
   	response.write "</select>"

	' response.write filter_sql
   	

   	response.cookies("filters") = cookie
   	response.cookies("filters").Expires = "1/1/2020"

End Sub

Sub AddOption (ByRef Opts, ByVal Stage, ByVal Text, ByVal Value)
Dim i : i = UBound(Opts,2) + 1
	ReDim Preserve Opts(2, i)
	Opts(0,i) = Value
	Opts(1,i) = Text
	Opts(2,i) = Stage
End Sub

Sub Render_StartANewCourse_Bar
	Dim folds, sf, visible
	Response.Write "<header class='template-header'>"
	Response.Write "<div class='centering'>"
	Response.Write "<div class='hinting'><h1>Start a new course</h1><h2>Drag here to upload</h2></div>"
	Response.Write "<div class='icons'>"
	Set folds = Config.FileSys.GetFolder(Server.MapPath("/engine/templates/courses")).SubFolders
	' length = CInt(13 / folds.count)
	For Each sf In folds
		visible = true
		if left(sf.name,1) = "_" then
			visible = false
		end if
		If visible Then
			Response.Write "<figure>"
			Response.Write "<a href='#" & sf.name & "'><img src='/engine/templates/courses/" & sf.name & "/" & sf.name & ".png'></a>"
			Response.Write "<figcaption><a href='#" & sf.name & "'>" & sf.name & "</a></figcaption>"
			Response.Write "</figure>"
		End If
	Next
	Response.Write "</div>"
	response.write "</div></header>"
End Sub

Sub Render_Search_Bar()
Dim my_containers : my_containers = MyUserContainers()
Dim search_term : search_term = Request.Cookies("search")
If trim(search_term) = "" Then search_term = "*"

	Response.Write "<header class='search-header'>"
	Response.Write "<form>"
	Response.Write "<div class='search-container'>"
	Response.Write "<i class='fa fa-search' aria-hidden='true'></i><input type='text' value='" & search_term & "' id='search' title='Search courses'>"
	Response.Write "<a href='javascript:;' id='clear-search' class='fa fa-times-circle' aria-hidden='true'></a>"
	Response.Write "</div>"
	if my_containers = "*" Then
		Response.Write "<div class='search-options'>"

		If ARCHIVE = "hide" Then
			response.write "<a href='/engine/pages/index/?archive=show' title='Courses in Archive container are hidden; click to show'><i class='fa fa-toggle-off'></i> Archived</a> "
		Else
			response.write "<a href='/engine/pages/index/?archive=hide' title='Courses in Archive container are shown; click to hide' class='on'><i class='fa fa-toggle-on'></i> Archived</a> "
		End If

		If SUBS = "hide" Then
			response.write "<a href='/engine/pages/index/?subs=show'><i class='fa fa-toggle-off' title='Hidden'></i> Subscriber courses</a>"
		Else
			response.write "<a href='/engine/pages/index/?subs=hide' class='on'><i class='fa fa-toggle-on' title='Visible'></i> Subscriber courses</a>"
		End If
		Response.Write "</div>"
	End if
	Response.Write "</form>"
	Response.Write "</header>"
End Sub

Sub Render_Courses()
	Response.Write "<section class='course-list'>"
	Dim bHide : bHide = (SUBS = "hide")
	Dim bArchived : bArchived = (ARCHIVE = "show")
	Dim mine : mine = MyContainerIds(Config.CourseRoot, bHide, bArchived)
	Dim multi : multi = (UBound(split(mine,",")) > 0)
	Dim name : name = ""
	' even though the container and these labels look to be in the same row, they are stacked so hiding headers doesn't hide the labels
	Response.Write "<div class='start-row'>"
		Response.Write "<div class='name'></div>"
		Response.write "<div class='stage'>Label</div>"
		Response.write "<div class='date'>Last modified</div>"
		Response.write "<div class='tools'>Actions</div>"
	Response.Write "</div>"
	' this orders the containers we can see by the most recent
	Dim cn, rs : Set cn = db.getrs("select n.id, n.name from courses c inner join container n on c.container = n.id where c.container in (" & mine & ") group by container order by max(updated) desc", "")
	If Not (cn.BOF AND cn.EOF) Then
		Do While Not cn.EOF
			' this lists the courses in the container by most recent
			Set rs = db.getrs("select id,name,stage,layout,engine,updated,folder,locked from courses where container={0} order by updated desc", array(cn("id")))
			if not (rs.eof and rs.bof) then
				response.write "<div class='header-row'>"
				response.write "<div class='name'>" & cn("name") & "</div>"
				response.write "</div>"
				do while not rs.eof
					name = trim("" & rs("name"))
					If name = "" Then name = "(untitled)"
					metadata = join(array(cn("name"), replace(name,"'",""), rs("stage"), rs("layout"), rs("engine")), ",")
					response.write "<div class='course-row' data-id='" & rs("id") & "' data-meta='" & lcase(metadata) & "'>"
					response.write "<div class='name'>"
					if rs("locked") = 1 then
						response.write "<b>" & name & "</b>"
					else
						response.write "<a href='/engine/pages/edit/?id=" & rs("id") & "'>" & name & "</a>"
					end if
					response.write "<small>" & rs("folder") & "</small>"
					response.write "</div>"
					response.write "<div class='stage'><span class='label" & GetLabelFromStage(rs("stage")) & "'>" & rs("stage") & "</span></div>"
					response.write "<div class='date'>" & NiceDate(rs("updated")) & "</div>"
					response.write "<div class='tools'>"
					if Config.FileSys.FolderExists(Config.CourseRoot & "\" & cn("name") & "\" & rs("folder")) Then
						if rs("locked") = 1 then
							response.write "<a href='#launch' class='btn btn-small' title='Play course'><i class='fa fa-fw fa-play'></i></a>"
							response.write "<a href='#unlock' class='btn btn-small btn-inverse' title='Unlock actions'><i class='fa fa-fw fa-unlock-alt'></i></a>"
							response.write "<a href='#delete' class='btn btn-small btn-danger' title='Delete forever'><i class='fa fa-fw fa-trash'></i></a>"
						else
							response.write "<a href='#play' class='btn btn-small' title='Play course'><i class='fa fa-fw fa-play'></i></a>"
							response.write "<a href='#clone' class='btn btn-small' title='Duplicate this course'><i class='fa fa-fw fa-clone'></i></a>"
							if multi then response.write "<a href='#move' class='btn btn-small' title='Move this course to a different folder'><i class='fa fa-fw fa-folder-o'></i></a>"
							response.write "<a href='#lock' class='btn btn-small' title='Lock actions'><i class='fa fa-fw fa-lock'></i></a>"
						end if
					else
						response.write "<a href='#trash' class='btn btn-small btn-danger' title='Delete forever'><i class='fa fa-fw fa-trash'></i></a>"
						Response.Write " (Missing)"
					End If
					response.write "</div>"
					response.write "</div>"
					rs.MoveNext
				Loop
			end if
			cn.MoveNext
		Loop
	End If
	Response.write "</section>"
End Sub

%>