<%@ Language=VBScript %>
<% 
option explicit 
Response.Expires = -1
response.buffer = true
Server.ScriptTimeout = 600
%>
<!-- #include file="lib/page_initialise.asp" -->
<!-- #include file="lib/Parsers/textplayer.asp" -->
<%

Dim courseid, folder, mappedfolder, headerFolder
Dim sSettings, sGlossary, sImages, sReferences, xml, node
Dim fileName, template, pageType, pageData, sOptimalData, bSave
Dim idx, sCaptions

' notes
' this file is a hack and needs to be rewritten in a single language
' currently it loads the main files using vbscript and sends that to functions
' in jscript to do the work (because it uses parts of the runtime for rendering)
' we really need to rewrite this whole page to use jscript
' come to that, we could rewrite most of tardproof in jscript
' which might make conversion to node easier.
'
' it's currently executed using a server.execute, which DOES create its own scope
' and therefore includes and variables are safe.

db.openDefault()

bSave = False
courseid = 0
If IsNumeric(request.querystring("id")) Then
	courseid = cint(request.querystring("id"))
End If

headerFolder = Session("TempFolder") ' Request.ServerVariables("HTTP_TEMPFOLDER")

if courseid > 0 then

	folder = GetCoursePath(courseid)
	mappedfolder = Server.MapPath(folder)

	' we want to work from the temp folder which is a copy of the live course folder
	If headerFolder > "" Then
		mappedFolder = Server.MapPath("/temp/" & headerFolder & "/files/")
		Debug_Write("Shifted folder mapping to " & mappedFolder)
	End If

	Call js_setfolder (folder, mappedfolder)
	
	sGlossary = IO.LoadFileStream(mappedFolder & "\SCO1\Configuration\glossary.json")
	sImages = IO.LoadFileStream(mappedFolder & "\SCO1\Configuration\images.json")
	sCaptions = IO.LoadFileStream(mappedFolder & "\SCO1\Configuration\captions.json")
	sReferences = IO.LoadFileStream(mappedFolder & "\SCO1\Configuration\references.json")
	sSettings = IO.LoadFileStream(mappedFolder & "\SCO1\Configuration\settings.json")

	Call js_initSettings (sSettings, sImages, sGlossary, sReferences)
	
	Set xml = Server.CreateObject("MSXML2.FreeThreadedDOMDocument") ' Microsoft.XMLDOM")
	xml.async = false
	xml.load(mappedFolder & "\SCO1\en-us\Pages.xml")

	' we need an ordered array of the filenames	for calculating indexes of internal links
	idx = 0
	Dim fileNames : fileNames = Split("",",") ' something
	For each node in xml.documentElement.SelectNodes("//page")

		fileName = node.getAttribute("fileName")
		if Left(fileName,5) = "popup" Or left(fileName,7) = "include" Or Left(fileName, 5) = "parse" Or Left(fileName, 4) = "load" Then
			' continue
			push2array fileNames, "~" ' create an empty index
		Else
			push2array fileNames, fileName
		End If
	Next
	fileNames = Join(fileNames,";") ' rather than passing an array and dicking about with it to make it work in JS
	Debug_Write(fileNames)
	
	bSave = false
	
	For each node in xml.documentElement.SelectNodes("//page")

		Call node.setAttribute("index", idx)
		idx = idx + 1
	
		fileName = node.getAttribute("fileName")
		template = node.getAttribute("template")
		if template = "" then template = "auto"
		pageType = node.getAttribute("type")
		
		If LCase(pageType) = "information" Then
			if (left(filename, 5) = "parse") Or (left(fileName, 4) = "load") Or (left(filename, 5) = "popup") Or (left(filename, 7) = "include") Then
				' don't process hidden pages, they will get loaded internally (or aren't used)
				Call node.setAttribute("optimised", "false")
			Else
				Debug_Write("Processing file " & filename & ", template=" & template)
				If js_canBeOptimised(mappedFolder & "\SCO1\en-us\Content\" & fileName) Then
					sOptimalData = js_optimisePage(mappedFolder & "\SCO1\en-us\Content\" & fileName, template, fileNames)
					bSave = true
					Call node.setAttribute("optimised", "true")
					Call IO.WriteUTF8WithoutBOM(mappedFolder & "\SCO1\en-us\Content\" & NoExtension(fileName) & ".htm", sOptimalData)
				End If
			End If
		Else
			Debug_Write(pageType & " can't be optimised (" & filename & ")")
			Call node.setAttribute("optimised", "false")
		End If
		
		Response.Flush
		
	Next

	Debug_Write("Save? " & bSave)
	
	If bSave Then
		
		Debug_Write("Save xml ->" & mappedFolder & "\SCO1\en-us\Pages.xml</li>")
	
		xml.Save mappedFolder & "\SCO1\en-us\Pages.xml"
	
	End If

End If
set config = nothing

Function NoExtension(ByVal name)
	NoExtension = Left(name, InStrRev(name, ".") - 1)
End Function

%>
<!-- #include file="lib/page_terminate.asp" -->