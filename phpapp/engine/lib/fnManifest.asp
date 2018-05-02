<%
''
''	Get SCO version from settings or manifest
''
Function GetSCO(ByVal path)
Dim s
	s = GetEngineSCO(path)
	If s = "" Then s = GetCurrentRuntimeFromManifest(path)
	GetSCO = s
End Function


''
''	given an ims manifest, work out its launch page and updated file list, etc. re-save it
'' DEPRECIATED
'' 		Look at using reApplySCORM(), etc.
''
Sub FixManifest(byval path, byval name, byval selected)
Dim ar, manifest, data
Dim lTemp, rTemp, i

	If Not Config.FileSys.FileExists(path & "\imsmanifest.xml") Then Exit Sub

	' get a list of all the files and paths used in the zip
	ReDim Ar(1)
	IO.GetAVirtualFileListOfFolderAndPutItIntoArray Config.CoursesPathVirtual & "/" & name, ar

	' get the manifest file
	set manifest = Config.FileSys.OpenTextFile(path & "\imsmanifest.xml", 1, false)
	data = manifest.ReadAll
	manifest.close

	' find old launcher page, replace that string with the new launcher page
	dim res : res = mid(data, instr(data, "<resource "), instr(instr(data, "<resource "), data, ">", vbBinaryCompare) - instr(data, "<resource "))
	dim href : href = replace(mid(res, instr(res, "href=")+5), chr(34),"")
	data = replace(data, " href=""" & href & """", " href=""SCO1/" & Config.getProperty(selected,"launch") & """", 1, -1, vbTextCompare) ' case insensitive global replace

	' update manifest urls with the list
	i = instr(data, "<resource ")
	lTemp = Left(data, instr(i,data,">",vbBinaryCompare)+1)
	rTemp = Mid(data, instr(len(lTemp),data,"</resource>",vbBinaryCompare))
	' replace files with their pathed versions, then chop out the unrequired paths
	data = Replace(lTemp & vbNewLine & vbTab & "<file href=""" & join(ar, """ />" & vbNewLine & vbTab & "<file href=""") & """ />" & vbNewLine & rTemp, vbTab & "<file href="""" />" & vbNewLine, "")
	data = replace(data, Config.CoursesPathVirtual & "/" & name & "/", "") ' / current / courses / foldername / => ""
	
	' and save the manifest back where it came from
	set manifest = Config.FileSys.OpenTextFile(path & "\imsmanifest.xml", 2, false)
	manifest.write data
	manifest.close
	
End Sub


''
''	work out the current scorm version for the folder based on what the imsmanifest thinks it is
''
Function GetCurrentRuntimeFromManifest(byref folder)
'	Dim oXml : Set oXml = New xmlObj
'	oXml.Path = Config.CoursesPath & "\" & folder & "\imsmanifest.xml"
'	oXml.Load
'	Dim runtime : runtime = oXml.NodeValue("/manifest/metadata/schemaversion")
'	If (Len(runtime) > 3) Then runtime = left(runtime, 4) ' "2004 4th Edition" => "2004"
'	GetCurrentRuntimeFromManifest = runtime
'	Set oXml = Nothing
'End Function

	If Trim(folder) = "" Then Exit Function
Dim path, manifest, data
	if instr(folder, "\") = 0 then
		path = Config.CoursesPath & "\" & folder
	else
		path = folder ' already a path
	end if
	If Config.FileSys.FileExists(path & "\imsmanifest.xml") Then
		set manifest = Config.FileSys.OpenTextFile(path & "\imsmanifest.xml", 1, false)
		data = manifest.ReadAll
		manifest.close
	End If
	If InStr(LCase("" & data), "<schemaversion>2004") > 0 Then
		GetCurrentRuntimeFromManifest = "2004"
	Else
		GetCurrentRuntimeFromManifest = "1.2"
	End If
End Function


Sub fnManifest_UpdateImageManifest(byval path)
Dim files, i, oJSON, oROW, aImages, w, h, img, ok
	If InStr(path, ":\") = 0 Then
		mappedFolder = Server.MapPath(path)
	Else
		mappedFolder = path
	End If

	If Not Config.FileSys.folderexists(mappedFolder & "\SCO1\Configuration\") Then Exit Sub

	If Config.FileSys.FolderExists(mappedFolder & "\SCO1\en-us\Content\media") Then
		files = IO.GetFileNamesForExt(mappedFolder & "\SCO1\en-us\Content\media", ".jpg.gif.png")
		Set oJSON = JSON.parse("{}")
		aImages = Array()
		for i = 0 to ubound(files)
			ok = true
			on error resume next
			img = GetImageDimensions(mappedFolder & "\SCO1\en-us\Content\media\" & files(i))
			if err then
				ok = false
			end if
			on error goto 0
			if ok then
				' response.write "<li>Adding " & files(i) & " to manifest"
				Set oROW = JSON.parse("{}")
				oROW.set "name", files(i)
				oROW.set "ext", LCase(Mid(files(i), InStrRev(files(i), ".") + 1))
				oROW.set "width", img(0)
				oROW.set "height", img(1)
				Set img = Nothing
				push2array aImages, JSON.stringify(oROW, null, 0) ' JSON.stringify(oROW, null, 4)
				Set oROW = Nothing
			else
				' response.write "<li>" & files(i) & " is a broken image - skipping"
			end if
		next
		oJSON.set "images", JSON.parse("[" & join(aImages,",") & "]")
		' response.write "<li>set image json"
	End If
	IO.WriteUTF8WithoutBOM mappedFolder & "\SCO1\Configuration\images.json", JSON.stringify(oJSON, null, 4)
	' response.write "<li>wrote manifest to disk"
	Set oJSON = Nothing
End Sub


%>