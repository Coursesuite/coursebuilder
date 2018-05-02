<%

'' a class for reading and writing existing XML documents
'' set foo = new xmlObj
'' foo.Path = "d:\mapped\path\to.xml"
'' foo.Load
'' response.write foo.nodevalue("/xpath/command[@to='select']")
'' foo.attribvalue(/xpath/command[@to='select']","attributeName") = "attributeValue"
'' foo.save
'' set foo = nothing
Class xmlObj
	Private Obj
	Private File
	Private XmlString
	
	Public Property Let Path(ByVal sPath)
		File = sPath
	End Property

	Public Property Let SetXML(ByVal sString)
		XmlString = sString
	End Property
	
	Public Sub Class_Initialize
		Set Obj = Server.CreateObject("MSXML2.FreeThreadedDOMDocument")
		Obj.async = False
	End Sub
	Public Sub Class_Terminate
		Set Obj = Nothing
	End Sub
	
	Public Sub Load
		If XmlString > "" Then
			Call Obj.LoadXML(XmlString)
		Else
			Call Obj.Load(File)
		End If
	End Sub
	Public Sub Save
		If Obj Is Nothing Then Exit Sub
		Call Obj.Save(File)
	End Sub
	
	Public Property Get Xml
		If Obj Is Nothing Then Exit Property
		Xml = Obj.Xml
	End Property
	
	Public Property Get NodeValue(ByVal xPath)
		If Obj Is Nothing Then Exit Property
		If trim(xPath) = "" Then exit property
		'response.write obj.SelectSingleNode(xpath).length
		For each node in obj.SelectNodes(xPath) '  & "/text()")
			NodeValue = node.nodeValue
		Next
		'NodeValue = Obj.SelectSingleNode(xPath & "/text()").nodeValue
	End Property
	Public Property Let NodeValue(ByVal xPath, ByVal sText)
		If Obj Is Nothing Then Exit Property
		Obj.SelectSingleNode(xPath & "/text()").nodeValue = sText
	End Property

	Public Property Get AttribValue(ByVal xPath, ByVal sAttrib)
		If Obj Is Nothing Then Exit Property
		AttribValue = Obj.SelectSingleNode(xPath & "/@" & sAttrib).nodeValue
	End Property
	Public Property Let AttribValue(ByVal xPath, ByVal sAttrib, ByVal sValue)
		If Obj Is Nothing Then Exit Property
		Dim Node : Set Node = Obj.SelectSingleNode(xPath)
		If Node Is Nothing Then Exit Property
		Call Node.SetAttribute(sAttrib, sValue)
		Set Node = Nothing
	End Property
	
End Class


''
''	Use string methods to get the text of a xml node
''
Function GetXMLNodeText(byref xml, byval tagname)
	Dim s
	s = GetXMLNodeCdata(xml, tagname)
	s = replace(s, "<![CDATA[","")
	s = replace(s, "]]>", "")
	s = replace(s, vbNewLine, "")
	s = replace(s, vbCr, "")
	s = replace(s, vbLf, "")
	s = replace(s, vbCrLf, "")
	s = replace(s, vbTab, "")
	GetXMLNodeText = Trim(s)
End Function

''
''	using string methods get the cdata of an xml node
''
Function GetXMLNodeCdata(byref xml, byval tagname)
	Dim s, i, j, endtag
	endtag = tagname
	If InStr(xml, "<" & tagname & ">") = 0 Then Exit Function ' node not found
	i = InStr(xml, "<" & tagname & ">")
	if instr(tagname, " ") > 0 then
		endtag = trim(left(tagname, instr(tagname, " ")))
	end if
	j = InStr(i, xml, "</" & endtag & ">")
	s = Mid(xml, i + len(tagname) + 2, j - i - len(tagname) - 2)
	GetXMLNodeCdata = s
End Function

''
''	using string methods get the value of an attribute from an xml node
''
Function GetXMLNodeAttrib(byref data, byval tagname, byval attrib)
Dim r
	r = ""
	If InStr(data, "<" & tagname & " ") > 0 Then
		dim res : res = mid(data, instr(data, "<" & tagname & " "), instr(instr(data, "<" & tagname & " "), data, ">", vbBinaryCompare) - instr(data, "<" & tagname & " "))
		Dim ar, br : ar = split(res, " ")
		Dim i : for i = lbound(ar) to ubound(ar)
			br = split(ar(i), "=")
			if br(0) = attrib then
				r = replace(br(1),chr(34),"")
				exit for
			end if
			erase br
		Next
		erase ar
	End If
	If IsNumeric(r) Then
		r = cdbl(r)
	ElseIf (r = "true") Then
		r = true
	ElseIf (r = "false") Then
		r = false
	End If
	GetXMLNodeAttrib = r
End Function


''
''	encode a value (non cdata) for an xml node
''
Function XmlSafeText(byval s)
	s = replace(s, "&", "&amp;")
	s = replace(s, "<", "&lt;")
	s = replace(s, ">", "&gt;")
	s = replace(s, Chr(34), "&quot;")
	XmlSafeText = s
End Function



''
''	Reads a bmj xml file and unpacks it into a new course
''
Sub ConvertBMJCourse (ByVal coursePath, ByVal fileNameOfXmlSource)
Dim contentPath
Dim ncSettings, bmjXml, bmj, pagesXml, rex, pages, c, screens, screen, tag, html, pageid, xmlNs
Dim strObjectives, strContributors, strNotes, strImage, strHtml, bmjQuiz, quizQuestions, ar, hr, node
Dim passmark, scored, question, answer, prompt, label, correct, reason, tmpl, oRefs, oRef, aRefs, refId, refNum

	contentPath = coursePath & "\SCO1\en-us\Content\"

	' Load the bmj xml templates and files to string
	bmjXml = IO.GetFileString(Config.CoursesPath & "\bmj\" & fileNameOfXmlSource, "")
	pagesXml = IO.GetFileString(coursePath & "\SCO1\en-us\Pages.xml", "")
	' pagesXml = Replace(pagesXml, "ï»¿", "") ' may be loading with bom for some reason

	' Update the settings with the name, etc
	Call GetSettingsJSON(coursePath, ncSettings)

	' xml namespaces confuse microsoft xpath implementations, discard them before we start
	xmlNs = Array("xmlns:xi=`http://www.w3.org/2001/XInclude`","xmlns:xsi=`http://www.w3.org/2001/XMLSchema-instance`"," xsi:noNamespaceSchemaLocation=`bmj-learning-module.xsd`")
	For c = 0 to ubound(xmlNs)
		bmjXml = Replace(bmjXml, Replace(xmlNs(c),"`",Chr(34)), "")
	Next

	' process the xml and apply different formatting based on tag name
	Set bmj = Server.CreateObject("MSXML2.FreeThreadedDOMDocument") ' Microsoft.XMLDOM")
	bmj.async = false
	bmj.loadXML(bmjXml)
	
	' Build references json and replace matched tags as we find them
	Set oRefs = JSON.parse("{}")
	aRefs = Array()
	For each node in bmj.documentElement.SelectNodes("//article-reference")
		refId = NewRefId2(true,true)
		Set oRef = JSON.parse("{}")
		oRef.set "uniqueid", refId
		oRef.set "pubmedid", Trim(node.SelectSingleNode(".//pubmed-id").text)
		oRef.set "citation", CleanupTag(UnWrapTag(node.SelectSingleNode(".//citation").xml, "citation"))
		oRef.set "title", Trim(node.SelectSingleNode(".//resource-title").text)
		oRef.set "description", CleanupTag(UnWrapTag(node.SelectSingleNode(".//resource-text").xml,"resource-text"))
		oRef.set "hyperlink",Trim(node.SelectSingleNode(".//url").text)
		PushObj2Array aRefs, oRef ' SET array(int) = value
		refNum = node.getAttribute("id")
		If IsNumeric(refNum) Then ' some are "change-me"; we can capture them, but they are not yet linked in a html-screen
			For each tag in bmj.documentElement.SelectNodes("//reference-link[@id='" & refNum & "']")
				tag.text = "{ref " & refId & "}"
			Next
		End If
	Next
	oRefs.set "references", aRefs
	IO.WriteUTF8WithoutBOM coursePath & "\SCO1\Configuration\references.json", JSON.stringify(oRefs, null, 4)
	
	c = 0
	pages = Array()
	for each node in bmj.documentElement.childNodes
		Select Case node.nodeName
			case "objectives"
				strObjectives = ConvertTagsToTards(node)
				strObjectives = "{tag h1|Objectives}" & vbNewLine & strObjectives

			case "contributors"
				strContributors = node.xml
				strContributors = Replace(strContributors, "<contributor ", "<fieldset ")
				strContributors = Replace(strContributors, "</contributor>", "</fieldset>")
				strContributors = ReplaceTag(strContributors, "name","legend")
				strContributors = UnWrapTag(strContributors, "description") ' leaves "<p>"
				strContributors = ReplaceTag(strContributors, "disclosure","cite")

				Push2Array pages, Replace("<page title=`includeContributors` fileName=`includeContributors.html` type=`Information` id=`" & c & "` contribute=`n` contributeScore=`99` contributePercentage=`100` nav=`n` template=`` />", "`", chr(34))
				IO.WriteUTF8WithoutBOM contentPath & "includeContributors.html", strContributors
				strContributors = "{load includeContributors.html}"

			case "notes"
				strNotes = ConvertTagsToTards(node)

			case "title"
				ncSettings.course.name = node.text ' nodeValue ' <key name="seo-title" value=??

			case "description"
				ncSettings.course.description = node.text ' nodeValue ' <key name="seo-meta-description" value=??
			
			case "homepage-image"
				If node.childNodes.length > 0 Then
					strImage = node.childNodes.item(0).getAttribute("src")
				End If
				If strImage > "" Then
					strImage = "{image pull-right|" & strImage & "}" & vbNewLine
				End If
			
			case "html-screen"
				strHtml = ConvertTagsToTards(node)
				pageid = "Page_" & node.getAttribute("id")
				IO.WriteUTF8WithoutBOM contentPath & pageid & ".html", strHtml
				Push2Array pages, Replace("<page title=`" & pageid & "` fileName=`" & pageid & ".html` type=`Information` id=`" & node.getAttribute("id") & "` contribute=`n` contributeScore=`0` contributePercentage=`100` nav=`n` template=`` />", "`", chr(34))
				
			case "question-set"
				pageid = "Quiz_" & node.getAttribute("id")
				bmjQuiz = IO.GetFileString(Server.MapPath("/engine/templates/bmjQuiz.xml"), "")
				ar = Split(bmjQuiz,"----")
				quizQuestions = ar(1)
				bmjQuiz = ar(0)
				Erase ar
				ar = Array()
				passmark = node.getAttribute("pass-mark")
				scored = (node.getAttribute("scoreable") = "true")
				For each question in node.SelectNodes("question") ' SelectNode xpath works
					prompt = question.SelectSingleNode(".//question-text").text ' SelectSingleNode xpath is buggy, you have to do this
					tmpl = Replace(quizQuestions,"@@PROMPT@@", prompt)
					tmpl = Replace(tmpl,"@@QUESTIONID@@", question.getAttribute("id"))
					hr = Array()
					For each answer in question.SelectNodes("answer")
						label = answer.SelectSingleNode(".//answer-text").text
						correct = (answer.getAttribute("correct") = "true")
						reason = Trim(answer.SelectSingleNode(".//correct-reason").text)
						If reason > "" Then
							tmpl = Replace(tmpl, "@@REASON@@", UnWrapTag(Trim(answer.SelectSingleNode(".//correct-reason").xml),"correct-reason"))
						End If
						If correct Then
							push2Array hr, "      <choice correct=""true""><![CDATA[" & label & "]]></choice>"
						Else
							push2Array hr, "      <choice><![CDATA[" & label & "]]></choice>"
						End If
					Next
					tmpl = Replace(tmpl, "@@CHOICES@@", join(hr,vbNewLine))
					Push2Array ar, tmpl
				Next
				bmjQuiz = Replace(bmjQuiz, "@@INTRO@@", pageid) ' think of something better!
				bmjQuiz = Replace(bmjQuiz, "@@QUESTIONS@@", Join(ar,vbNewLine))
				IO.WriteUTF8WithoutBOM contentPath & pageid & ".xml", bmjQuiz
				Push2Array pages, Replace("<page title=`" & pageid & "` fileName=`" & pageid & ".html` type=`Quiz` id=`" & node.getAttribute("id") & "` contribute=`" & IIf(scored,"p","c") & "` contributeScore=`" & passmark & "` contributePercentage=`" & IIf(scored,"100","0") & "` nav=`n` template=`` />", "`", chr(34))

		End Select
		c = c + 1
	Next

	' Create intro page	
	IO.WriteUTF8WithoutBOM contentPath & "Introduction.html", strImage & strObjectives & strNotes ' strContributors seems replicated on 2nd anyway

	' ensure title is name of course
	ncSettings.layout.titleheader.set "text", "name"
	ncSettings.layout.set "template", "bmj"

	' save all final config settings
	Call SaveSettingsJson(coursePath, ncSettings)
	Set ncSettings = Nothing

	' Create pages.xml
	html = Join(pages,vbNewLine)
	IO.WriteUTF8WithoutBOM coursePath & "\SCO1\en-us\Pages.xml", Replace(pagesXml, "@@PAGES@@", html)

End Sub

%>