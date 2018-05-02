<%
'' A handlebars-based page
class TardPage

	Private sPage
	Private oCourse
	Private oSettings
	
	Public Default Function Init(parameters)
		Select Case UBound(parameters)
			Case 0
				Set Init = InitNoCourse(parameters(0))
			Case 1
				Set Init = InitWithCourse(parameters(0), parameters(1))
			Case Else
				Set Init = Me
		End Select
	
		Set Init = Me
	End Function
	
	Private Function InitNoCourse(current_page)
		sPage = current_page
		Set InitNoCourse = Me
	End Function
	
	Private Function InitWithCourse(current_page, course_id)
		sPage = current_page
		Set oCourse = (new TardCourse)(db.getRS("SELECT * FROM Courses WHERE id={0}", course_id))
		Call fnSettings_getCourseJsonObj(course_id, "config", oSettings)
		Set InitWithCourse = Me
	End Function
	
	Public Property Set Settings(oJson)
		If oJson Is Nothing Then Exit Property
		Set oSettings = oJson
	End Property
	
	'' References the underlying data as strings, settable
	Public Property Get Course
		Set Course = oCourse
	End Property

	Public Property Get Settings
		If oSettings Is Nothing Then Exit Property
		Set Settings = oSettings
	End Property
	
	Public Sub Render
		If sPage = "" Then Exit Sub
		If oSettings Is Nothing Then Exit Sub
		Dim tmpl
		Set tmpl = Handlebars.compile(IO.GetFileString(Server.MapPath("/engine/pages/" & sPage & "/layout.hba"), ""))
		Response.Write tmpl(oSettings)
		Set tmpl = Nothing
	End Sub
	
	Public Sub Class_Terminate
		Set oCourse = Nothing
		Set oSettings = Nothing
	End Sub
	
End Class

Class TardCourse
	Private Id
	Public Name
	Public Folder
	Public Config
	Public Glossary
	Public References
	Public Help
	Public Layout
	Public Stage

	'' Constructor sets all fields	
	Public Default Function Init(course_row)
		If course_row Is Nothing Then Exit Function
		Id = course_row("id")
		Name = course_row("name")
		Folder = course_row("folder")
		Config = course_row("config")
		References = course_row("references")
		Help = course_row("help")
		Layout = course_row("layout")
		Stage = course_row("stage")
		Set Init = Me
	End Function
	
	'' Save all properties back to the database
	Public Sub Save
		Call db.exec("UPDATE courses SET `name`={1},`folder`={2},`config`={3},`glossary`={4},`help`={6},`layout`={7},`references`={5}, `stage`={8} WHERE id={0}", Array(Id, Name, Folder, Config, Glossary, References, Help, Layout, Stage))
	End Sub
	
	'' Save a single property back to the database
	Public Sub Update(prop, val)
		Call db.exec("UPDATE courses SET `" & prop & "`={1} WHERE id={0}", Array(Id, val))
	End Sub
	
End Class

%>