<%
Class clsConfig
	Dim g_configDB, g_TextPlayerVersion

	Public CoursesPathVirtual
	Public AppName
	Public FunAppName
	Public CoursesPath
	Public CourseRoot
	Public ArchivePath
	Public ProductionPath
	Public ProductionPathVirtual
	Public RuntimesPath
	Public BaselineThemePath
	Public UnZipExe
	Public ZipExe
	Public FileSys
	Public Shell
	Public ShellApp
	Public TempPath
	Public LessCompiler
	Public LayoutsPath
	Public MailFromAccount
	Public MOTD
	Public ComSpec

	Private Sub Class_Initialize()
		g_TextPlayerVersion = 0
		set g_configDB = server.createobject("scripting.dictionary")
		Dim config, val, str, row
		config = Array("textplayer|Layout,index.html,Settings.json,Content.html,Quiz.html","leo|Player,launch.html,,launch.html,","avide|Player,Launch.html,Settings.xml,Content.html,","book|Player,launch.html,Settings.xml,launch.html,","mobile|Layout,index.html,settings.xml,content.html,Quiz.html")
		For each val in config
			Set row = server.createObject("scripting.dictionary")
			str = split(Mid(val,Instr(val,"|")+1),",")
			row.add "runtime", str(0)
			row.add "launch", str(1)
			row.add "settings", str(2)
			row.add "content", str(3)
			row.add "quiz", str(4)
			g_configDB.Add Mid(val, 1, InStr(val,"|")-1), row
			Set row = Nothing
		next
		MailFromAccount = "info@coursesuite.com.au"
		CourseRoot = Server.MapPath("/courses/")
		CoursesPathVirtual = "/courses"
		ProductionPathVirtual = "/courses/production"
		CoursesPath = Server.MapPath(CoursesPathVirtual)
		ArchivePath = Server.MapPath("/courses/archive")
		ProductionPath = Server.MapPath(ProductionPathVirtual)
		UnZipExe = server.mappath("/engine/zip") & "\unzip.exe"
		ZipExe = server.mappath("/engine/zip") & "\zip.exe"
		Set FileSys = server.createobject("scripting.filesystemobject")
		Set Shell = server.createobject("WScript.Shell")
		Set ShellApp = Server.CreateObject("Shell.Application")
		' LessCompiler = server.mappath("/engine/bin/less_js/lessc.cmd")
		'LessCompiler = "CMD /C " & server.mappath("/engine/bin/less.js-windows-v1.6.2/lessc.cmd")
		ComSpec = "%comspec% /c"
		LessCompiler = Server.MapPAth("/engine/bin/less.js-windows-v2.4.0/lessc.cmd")
		RuntimesPath = Server.MapPath("/runtimes")
		BaselineThemePath = RuntimesPath & "\textplayer"
		LayoutsPath = Server.MapPath("/layouts")
		TempPath = "C:\Temp"
		AppName = "CourseBuilder" ' "Proteus 0.9a"
		FunAppName = AppName ' RandomName
		MOTD = "" ' Now with added Fridge Magnets!"
	End Sub
	
	Private Function RandomName
		Dim possibleNames
		possibleNames = Array("ReTardEd;","Tard.Is","The Masters' Tardis","Course Whizz Pro Ultra 2000 +","Magic Bullet","Randomised Name #6", "Course Thingy Pro","Unfinished editor","Whizzy Pro","Tardproof","Untitled-1", "+++ Out of cheese error +++","Proteus", "Beer!")
		Randomize Timer
		RandomName = possibleNames(Int(Rnd * UBound(possibleNames)))
	End Function
	
	Public Function TextPlayerTemplateVersion
	Dim obj, fil
		If g_TextPlayerVersion = 0 Then
			set fil = FileSys.OpenTextFile(Server.MapPath("/runtimes/textplayer/Configuration/settings.json"), 1, false)
			Set obj = JSON.parse(join(array(fil.ReadAll)))
			Set fil = Nothing
			g_TextPlayerVersion = obj.engine.version
			Set obj = Nothing
		End If
		TextPlayerTemplateVersion = g_TextPlayerVersion
	End Function

	Private Sub Class_Terminate()
		set g_configDB = nothing
		set FileSys = nothing
		set Shell = nothing
		Set shellapp = nothing
	End Sub

	Public Function getProperty(byval runtime, byval prop)
		getProperty = g_configDB(lcase(runtime))(lcase(prop))
	End Function

End Class
%>