<!-- #include virtual="/engine/pages/common/page_start.asp" -->
<!-- #include file="subroutines.asp" -->
<%

Dim rs, container_path

container_path = server.mappath("/courses")
db.clientCursor = False

Dim fold, subfold, container_id

' Match containers on Disk (authority) to DB
For Each Fold In Config.FileSys.GetFolder(container_path).SubFolders
	If db.Count("container", "name='" & fold.name & "'") = 0 Then
		container_id = db.insert2("container", Array("name", fold.name))
		LogAction "Inserted new container " & fold.name & " => " & container_id
	else
		container_id = db.getScalar("select id from container where name='" & fold.name & "'",0)
	end if
	
	LogAction "Finding courses in " & fold.name
	Response.Write "<ul>"
	For Each SubFold in Fold.SubFolders
		if db.count("courses", "folder='" & SubFold.Name & "'") = 0 Then
			
			Call InsertCourseIntoTheDatabase(container_id, fold.name, subfold.name, subfold.DateLastAccessed)

		end if
	Next
	Response.Write "</ul>"
Next

Sub LogAction(ByVal inp)
	Response.Write "<li>" & inp & "</li>"
End Sub

Sub LogActionPre(ByVal inp)
	LogAction "<pre>" & inp & "</pre>"
End Sub

Sub InsertCourseIntoTheDatabase(ByVal container, ByVal fold, ByVal subfold, byval subfolddate)
Dim path, settings, configuration, ins, touched, id
	'db.clientCursor = True
	id = -1
	path = Server.MapPath("/courses/" & fold & "/" & subfold)
	GetSettingsJSON path, settings
	touched = DateDiff("s", "01/01/1970 00:00:00", subfolddate)
	If Not settings is nothing then
		configuration = JSON.stringify(settings, null, 4)
		ins = Array("name", settings.course.name, "folder", subfold, "touched", touched, "engine", settings.engine.name, "layout", settings.layout.template, "stage", "inprogress", "container", container, "config", configuration)
		'LogActionPre join(ins,vbNewLine)
		id = db.insert2("courses", ins)
		LogAction "Inserted new course (" & settings.course.name & ") => " & id
	elseIf Config.FileSys.FolderExists(path & "\SCO1\configuration") Then
		ins = Array("name", subfold, "folder", subfold, "touched", touched, "engine", "", "layout", "", "stage", "inprogress", "container", container, "config", "", "locked", 1)
		id = db.insert2("courses", ins)
		LogAction "Inserted incomplete course (" & subfold & ") => " & id
	Else
		LogAction "Course insert failed => " & path
	end if
	'db.clientCursor = False
End Sub

%>
 
<!-- #include virtual="/engine/pages/common/page_end.asp" -->