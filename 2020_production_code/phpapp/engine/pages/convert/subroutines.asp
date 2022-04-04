<%
Function ImportElsevierCourseToDb(Byval aTemp)
Dim aParams, sManifest, sId
Dim sCourseVirtual, sCourseFolder, sCourseName
Dim oTemp, oConfig, oConfigTemplate, oNewConfig
Dim oInRef, oOutRef, ar, oKey
Dim i, oFold, oItem
Dim sContent, sContentName, sContentDiskName, sPageNode, pArray
Dim t, start, finish, lft, rgt, arLi, LINode

Dim obj, xp, counter, bSubs, Node

		' to store data for db insert
		aParams = Array()
		
		'Load the manifest
		sManifest = IO.LoadFileStream(aTemp & "\imsmanifest.xml")
		
		' Create the destination course folder and put things in it that we need
		sId = GetXMLNodeAttrib(sManifest, "manifest", "identifier")
		sCourseVirtual = "/courses/elsevier/" & sId

		push2array aParams, "engine"
		push2array aParams, "textplayer"

		push2array aParams, "layout"
		push2array aParams, "elsevier"

		push2array aParams, "stage"
		push2array aParams, "new"

		push2array aParams, "container"
		push2array aParams, 27 ' elsevier
		
		push2Array aParams, "folder"
		push2Array aParams, sId

		push2array aParams, "locked"
		push2array aParams, 0
		
		sCourseFolder = Server.MapPath(sCourseVirtual)
		If Not Config.FileSys.FolderExists(sCourseFolder) Then Config.FileSys.CreateFolder(sCourseFolder)
		If Not Config.FileSys.FolderExists(sCourseFolder & "\SCO1") Then Config.FileSys.CreateFolder(sCourseFolder & "\SCO1")
		If Not Config.FileSys.FolderExists(sCourseFolder & "\SCO1\en-us") Then Config.FileSys.CreateFolder(sCourseFolder & "\SCO1\en-us")
		If Not Config.FileSys.FolderExists(sCourseFolder & "\SCO1\en-us\Content") Then Config.FileSys.CreateFolder(sCourseFolder & "\SCO1\en-us\Content")
		If Not Config.FileSys.FolderExists(sCourseFolder & "\SCO1\en-us\Content\media") Then Config.FileSys.CreateFolder(sCourseFolder & "\SCO1\en-us\Content\media")
		If Not Config.FileSys.FolderExists(sCourseFolder & "\SCO1\Configuration") Then Config.FileSys.CreateFolder(sCourseFolder & "\SCO1\Configuration")

		' Course images to media
		On Error Resume Next
		Config.FileSys.MoveFile aTemp & "\data\courseimages\*", sCourseFolder & "\SCO1\en-us\Content\media\"
		On Error Goto 0

		' get the course name from the manifest
		sCourseName = GetXMLNodeText(sManifest, "title") ' luckily first title is //manifest/organizations/organization/title
		
		push2array aParams, "name"
		push2array aParams, sCourseName
		
		' minimal config - should merge later
		Set oTemp = JSON.parse("{}")
		oTemp.set "id", sId
		oTemp.set "name", sCourseName
		oTemp.set "description", "Course imported from Elsevier SCORM2004 package"
		oTemp.set "passingScore", 100
		Set oConfig = JSON.parse("{}")
		oConfig.set "course", oTemp
		Set oTemp = JSON.parse("{}")
		oTemp.set "name", "textplayer"
		oTemp.set "sco", "1.2"
		oConfig.set "engine", oTemp
		Set oTemp = JSON.parse("{}")
		oTemp.set "template", "elsevier"
		oTemp.set "basecolour", "#7A0E80"
		oTemp.set "altcolour", "#1C3A80"
		oTemp.set "altcolour2", "#929292"
		oConfig.set "layout", oTemp
		Set oTemp = JSON.parse("{}")
		oTemp.set "content", "&copy; Copyright 2014, Elsevier"
		oConfig.set "copyright", oTemp

		' our standard header
		Config.FileSys.CopyFile Server.MapPath("/engine/pages/convert/header.jpg"), sCourseFolder & "\SCO1\en-us\Content\media\", true
		Set oTemp = JSON.parse("{}")
		oTemp.set "content", "<img src='Content/media/header.jpg' alt='NursePoint by Elsevier' />"
		oConfig.set "headerleft", oTemp
		
		Set oConfigTemplate = JSON.parse(IO.LoadFileStream(Server.MapPath("/runtimes/textplayer/Configuration/settings.json")))
		Set oNewConfig = MergeJson(oConfigTemplate, oConfig)

		push2array aParams, "config"
		push2array aParams, JSON.stringify(oNewConfig)

		' Load the references file and convert it to our format
		Set oInRef = JSON.parse(IO.LoadFileStream(aTemp & "\data\course_references.json"))
		ar = Array()
		for each oKey in oInRef.keys()
			Set oTemp = JSON.parse("{}")
			oTemp.Set "uniqueid", oKey
			oTemp.Set "title", Replace(oKey, "ref", "") ' so its just the number - not ideal
			oTemp.Set "description", oInRef.get(oKey)
			oTemp.Set "hyperlink", ""
			pushObj2Array ar, oTemp
		next
		Set oInRef = Nothing
		Set oOutRef = JSON.parse("{}")
		oOutRef.set "references",  ar
		Erase ar

		push2array aParams, "references"
		push2array aParams, JSON.stringify(oOutRef)
		Set oOutRef = Nothing

		' start building pages.xml
		pArray = Array()
		push2Array pArray, "<?xml version=""1.0"" encoding=""UTF-8""?>"
		push2Array pArray, "<sco>"
		i = 1
		
		' process each page and save the pages to the course folder as well as building the pages xml file manually
		Set oFold = Config.FileSys.GetFolder(aTemp & "\data")
		For Each oItem in oFold.Files
			If oItem.name = "course_references.html" Then
				' Where's my damned Continue keyword, vbscript?
			ElseIf Right(LCase(oItem.name),4) = "html" Then
			
				bSubs = False
				counter = 0
			
				sContent = IO.LoadFileStream(aTemp & "\data\" & oItem.name)
				sContentName = GetXMLNodeText(sContent, "title")
				sContentDiskName = SafeName(sContentName)

				sPageNode = "<page title=""" & sContentName & """ fileName=""" & SafeName(sContentName) & ".txt"" type=""Information"" id=""item_" & i & """ contribute=""n"" contributeScore=""0"" contributePercentage=""100"" nav=""n"" template="""""

				Set Obj = Server.CreateObject("MSXML2.FreeThreadedDOMDocument")
				Obj.async = False

				sContent = GetXHTML(sContent)
				Obj.LoadXML(sContent)

				xp = "//table"
				For Each Node in Obj.SelectNodes(xp)
					If Not bSubs Then
						sPageNode = sPageNode & ">" & vbNewLine
						bSubs = True
					End If
					counter = counter + 1
					IO.SaveFileStream sCourseFolder & "\SCO1\en-us\Content\includeTable" & counter & sContentDiskName & ".html", Node.Xml ' raw
					If InStr(sContent, LTrimEx(Node.Xml)) = 0 Then ' somehow b's html and Node.Xml are different, so we have to stringle it
						t = Mid(Node.Xml, InStr(Node.Xml, "<td"))
						t = Left(t, InStr(t, "</td>"))
						If Not Node.SelectSingleNode(".//th") Is Nothing Then
							t = Node.SelectSingleNode(".//th").text
						Else
							t = Node.SelectSingleNode(".//td").text
						End If
						start = InStrRev(sContent, "<table ", InStr(sContent,t)) - 1
						finish = InStr(start, sContent, "</table>") + 8
						lft = Left(sContent, start)
						rgt = Mid(sContent, finish)
						sContent = lft & "{load includeTable" & counter & sContentDiskName & ".html}" & rgt
					Else
						sContent = Replace(sContent, LTrimEx(Node.Xml), "{load includeTable" & counter & sContentDiskName & ".html}")
					End If
					sPageNode = sPageNode & "<page title=""" & sContentName & " - Table " & counter & """ fileName=""includeTable" & counter & sContentDiskName & ".html"" type=""Information"" id=""item_" & i & "_" & counter & """ contribute=""n"" contributeScore=""0"" contributePercentage=""100"" nav=""n"" template="""" />" & vbNewLine
				Next

				xp = "//h2[@id='pageheading']"
				For Each Node in Obj.SelectNodes(xp)
					sContent = Replace(sContent, Node.Xml, "{h1 " & Node.Text & "}")
				Next
				
				xp = "//ul"
				For Each Node in Obj.SelectNodes(xp)
					arLi = Array()
					For Each LINode In Node.ChildNodes
						Push2Array arLi, UnWrap(LINode.Xml,"li") ' i.e. whatever is in it
					Next
					sContent = Replace(sContent, LTrimEx(Node.Xml), "{bullets " & Join(arLi,"|") & "}", 1, -1, 1)
				Next
				
				xp = "//ol"
				For Each Node in Obj.SelectNodes(xp)
					arLi = Array()
					For Each LINode In Node.ChildNodes
						Push2Array arLi, UnWrap(LINode.Xml,"li") ' i.e. whatever is in it
					Next
					sContent = Replace(sContent, LTrimEx(Node.Xml), "{numbers " & Join(arLi,"|") & "}", 1, -1, 1)
				Next

				xp = "//sup"
				For Each Node in Obj.SelectNodes(xp)
					sContent = Replace(sContent, Node.Xml, "{ref ref" & Node.Text & "}")
				Next
				
				xp = "//input"
				For Each Node in Obj.SelectNodes(xp)
					sContent = Replace(sContent, Replace(Node.Xml, Chr(34) & "/>", Chr(34) & " />"), "")
				Next
				
				xp = "//img"
				For Each Node in Obj.SelectNodes(xp)
					sContent = Replace(sContent, Replace(Node.Xml, "/>", " />"), "{image " & Replace(Node.GetAttribute("src"), "courseimages/", "") & "}")
				Next
							
				xp = "//textarea"
				For Each Node in Obj.SelectNodes(xp)
					sContent = Replace(sContent, Node.Xml, "{shortanswer " & Node.GetAttribute("name") & "}")
				Next

				sContent = Replace(sContent, "<em>", "{i ")
				sContent = Replace(sContent, "</em>", "} ")
				sContent = Replace(sContent, "{i } ", "")
				
				sContent = Replace(sContent, "<strong>", "{b ")
				sContent = Replace(sContent, "</strong>", "} ")
				sContent = Replace(sContent, "{b } ", "")
				
				sContent = Replace(sContent, "} |", "}|")
				sContent = Replace(sContent, "<br />", "{/}")
				sContent = Replace(sContent, "{/}{/}", "{/}")
				sContent = Replace(sContent, "--", "-")
				sContent = Replace(sContent, "<span style=""color: #ffffff;"">-</span>", "{-}")

				sContent = GetXHTML(sContent) ' reload
				Obj.LoadXML(sContent)

				xp = "//div[@id='accordion' or @class='accordion']"
				For Each Node in Obj.SelectNodes(xp)
					arLi = Array()
					If Not bSubs Then
						sPageNode = sPageNode & ">" & vbNewLine
						bSubs = True
					End If
					For Each LINode In Node.SelectNodes("//h3")
						counter = counter + 1

						Push2Array arLi, LINode.Text
						Push2Array arLi, "parseFile" & counter & sContentDiskName & ".txt"

						IO.SaveFileStream sCourseFolder & "\SCO1\en-us\Content\parseFile" & counter & sContentDiskName & ".txt", UnWrap(NextSibling(LINode).XML, "div")
						sPageNode = sPageNode & "<page title=""" & sContentName & " - Include " & counter & """ fileName=""parseFile" & counter & sContentDiskName & ".txt"" type=""Information"" id=""item_" & i & "_" & counter & """ contribute=""n"" contributeScore=""0"" contributePercentage=""100"" nav=""n"" template="""" />" & vbNewLine
					Next
					t = LTrimEx(Node.Xml)
					start = InStr(sContent, Split(t,Chr(13))(0)) - 1
					lft = Left(sContent, start)
					rgt = Mid(sContent, start + Len(t) + 2)
					sContent = lft & "{accordion " & Join(arLi,"|") & "}" & rgt
				Next

				sContent = Replace(sContent, "<p>", "")
				sContent = Rexplace(sContent, "</p>")				

				If bSubs Then
					sPageNode = sPageNode & "</page>"
				Else
					sPageNode = sPageNode & " />"
				End If
				
				' Everything else needs to be fixed in player, or will get html-stripped during playback
				
				IO.SaveFileStream sCourseFolder & "\SCO1\en-us\Content\" & SafeName(sContentName) & ".txt", sContent
				push2array pArray, sPageNode
				i = i + 1
			End If
		Next
		
		push2Array pArray, "</sco>"
		IO.SaveFileStream sCourseFolder & "\SCO1\en-us\Pages.xml", Join(pArray, vbNewLine)

		' Insert the course into the db and get its ID and write that as the page response
		ImportElsevierCourseToDb = db.insert("courses", aParams)

End Function

Function Rexplace(ByVal str, ByVal tag)
Dim rex
	Set rex = New RegExp
	rex.pattern = tag & "$"
	rex.global = true
	rex.multiline = true
	Rexplace = Rex.Replace(str, vbNewLine)
	Set Rex = Nothing
End Function

Function UnWrap(ByVal str, ByVal tag)
	str = Mid(str, InStr(str, "<" & tag & ">") + 2 + Len(tag))
	UnWrap = Left(str, Len(str) - Len(tag) - 3)
End Function

Function LTrimEx(ByVal str)
Dim rex
	Set rex = New RegExp
	rex.Pattern = "^\s*"
	rex.Multiline = True ' False
	rex.Global = True
	LTrimEx = rex.Replace(str, "")
	Set Rex = Nothing
End Function

Function NextSibling(ByRef node)
Dim n
	Set n = node.nextSibling
	Do While n.nodeType <> 1
		n = n.nextSibling
	Loop
	Set NextSibling = n
End Function

Function GetXHTML(Byval inp)
Dim TidyObj, i
	' this screws things up
	inp = Replace(inp, "’", "'")
	inp = Replace(inp, "•", "&bull;")
	inp = Replace(inp, "&bull;", "<li>") ' invalidates markup, but tidy fixes it again
	
	' no manual newline
	inp = Replace(inp, "<br>", vbNewLine)
	inp = Replace(inp, "<br />", vbNewLine)
	inp = Replace(inp, "<br/>", vbNewLine)

	' http://ablavier.pagesperso-orange.fr/TidyCOM/options.html
	Set TidyObj = CreateObject("TidyCOM.TidyObject")
	TidyObj.Options.Doctype = "strict"
	TidyObj.Options.DropFontTags = true
	TidyObj.Options.OutputXhtml = true
	TidyObj.Options.Indent = false ' 2 'AutoIndent
	TidyObj.Options.Wrap = false
	TidyObj.Options.TabSize = 4
	TidyObj.Options.NumericEntities = true
	TidyObj.Options.LogicalEmphasis = true
	TidyObj.Options.LiteralAttributes = False
	TidyObj.Options.WrapAttributes = False
	TidyObj.Options.BreakBeforeBr = False
	inp = TidyObj.TidyMemToMem(inp)
	Set TidyObj = Nothing

	inp = Mid(inp, InStr(inp, "<body"))
	inp = Left(inp, InStr(inp, "</body") + 7)

	inp = Replace(inp, "&#160;", " ") ' nbsp can stuff off
	inp = Replace(inp, "&#1#173;", "&#173;") ' invisible soft-hyphen breaks sometimes
	inp = Replace(inp, "&#173;", "-") ' Don't want them anyway
	
	inp = Replace(inp, " style=""text-align: left;""", "")		' I
	inp = Replace(inp, " style=""padding-left: 30px;""", "") 	' don't
	inp = Replace(inp, " style=""padding-left: 60px;""", "")	' care
	inp = Replace(inp, " style=""line-height: 1.4;""", "")		' about
	inp = Replace(inp, " style=""text-align: center;""", "")
	inp = Replace(inp, " style=""display: block; margin-left: auto; margin-right: auto;""", "")

	i = InStr(inp, "  ")
	Do While i > 0
		inp = Replace(inp, "  ", " ")
		i = InStr(inp, "  ")
	Loop

	inp = Replace(inp, ": <", ":<")
	inp = Replace(inp, ">" & vbNewLine & vbNewLine & "<", ">" & vbNewLine & "<")
	inp = Replace(inp, "</strong> <strong>", " ")

	GetXHTML = LTrimEx(inp)
End Function

%>