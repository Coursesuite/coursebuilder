<%

''
'' Changes the SCORM runtime from 1.2 to 2004 or vice versa.
'' Causes a full rebuild of the imsmanifest.xml
''
Sub ApplySCORM(ByVal folder, ByVal SelectedRuntime)
	ApplySCORMManifest folder, SelectedRuntime, true
End Sub

Sub ApplySCORMManifest(ByVal folder, ByVal SelectedRuntime, ByVal generateNewRefIds)
Dim fold, fil, scoFolders, scoFiles, fol, manifestData, courseData, ContentFolder
Dim name, description, res, href, ar, sFiles
Dim orgId, refId, itemId
Dim scoFolder, Settings, ContentFolderRelative

	ContentFolder = Replace(folder, "\\", "\")
	ContentFolderRelative = Replace("/courses" & Replace(Replace(folder, Server.MapPath("/courses"), ""), "\", "/"), "//", "/")

	' Since we are going to re-build the manifest, make sure we start without any junk files
	' 'Lite' version does not touch the existing javascript engine stuff
	' TODO: refactor into common function
	CleanJunkLite(ContentFolder)

	scoFolder = server.mappath("/scorm/" & SelectedRuntime)
	scoFolders = " vocab unique extend common "
	scoFiles = " imsmd_rootv1p2p1.xsd imscp_rootv1p1p2.xsd adlcp_rootv1p2.xsd adlcp_v1p3.xsd adlnav_v1p3.xsd adlseq_v1p3.xsd datatypes.dtd imscp_v1p1.xsd imsssp_v1p0.xsd imsss_v1p0.xsd imsss_v1p0auxresource.xsd imsss_v1p0control.xsd imsss_v1p0delivery.xsd imsss_v1p0limit.xsd imsss_v1p0objective.xsd imsss_v1p0random.xsd imsss_v1p0rollup.xsd imsss_v1p0seqrule.xsd imsss_v1p0util.xsd ims_xml.xsd lom.xsd xml.xsd xmlschema.dtd "

	' Clear out existing manifest files so we can replace them with the new version
	Set fold = Config.FileSys.GetFolder (ContentFolder)
	For Each fol in Fold.SubFolders
		If InStr(scoFolders, Lcase(fol.Name)) > 0 Then fol.Delete
	Next
	For Each fil in Fold.Files
		If InStr(scoFiles, Lcase(fil.Name)) > 0 Then fil.Delete
	Next
	Set fold = Nothing

	' Work out the names of the course and some existing settings we need
	If Config.FileSys.FileExists(ContentFolder & "\SCO1\Configuration\settings.json") Then
		Call GetSettingsJSON(ContentFolder & "\SCO1\Configuration\settings.json", Settings)
		If not Settings is nothing Then
			href = "index.html"
			name = Settings.course.name
			description = Settings.course.description
		End if
		Set Settings = Nothing

	ElseIf Config.FileSys.FileExists(ContentFolder & "\imsmanifest.xml") Then
		set fil = Config.FileSys.OpenTextFile(ContentFolder & "\imsmanifest.xml", 1, false)
		manifestData = fil.ReadAll
		fil.close
		res = mid(manifestData, instr(manifestData, "<resource "), instr(instr(manifestData, "<resource "), manifestData, ">", vbBinaryCompare) - instr(manifestData, "<resource "))
		href = replace(mid(res, instr(res, "href=")+5), chr(34),"") ' -> @@LAUNCH@@
		name = GetXMLNodeText(manifestData, "name") ' -> @@TITLE@@
		description = GetXMLNodeText(manifestData, "description") ' -> @@DESCRIPTION@@

	Elseif Config.FileSys.FileExists(ContentFolder & "\Course.xml") Then
		set fil = Config.FileSys.OpenTextFile(ContentFolder & "\imsmanifest.xml", 1, false)
		manifestData = fil.ReadAll
		fil.close
		name = GetXMLNodeText(manifestData, "name") ' -> @@TITLE@@
		description = GetXMLNodeText(manifestData, "description") ' -> @@DESCRIPTION@@
	End If

	If href = "" Then
		href = "index.html" ' probably
		If Config.FileSys.FileExists(ContentFolder & "\SCO1\launch.html") Then
			href = "launch.html"
		End If
	End If

	' Make up new unique identifiers for the internal objects (in case host uses this id for content versioning)
	If generateNewRefIds Then
		orgId = NewRefId(true)	' -> @@ORGID@@
		refId = NewRefId(true)	' -> @@REFID@@
		itemId = NewRefId(true)	' -> @@ITEMID@@
	Else
		If manifestData > "" Then ' already read it
		Else
			manifestData = IO.GetFileString(ContentFolder & "\imsmanifest.xml", "")
			orgid = IO.GetFileString(ContentFolder & "\imsmanifest.xml", "")
		End If
		' can't read as xml because of bugs in microsoft's xml parser when there are namespaces
		orgId = Replace(GetXMLNodeAttrib(manifestData, "organizations", "default"),"ORG-","")
		If orgId = "@@ORGID@@" or orgId = "" Then orgId = NewRefId(true)
		refId = Replace(GetXMLNodeAttrib(manifestData, "item", "identifierref"),"RES-","")
		If refId = "@@REFID@@" or refId = "" Then refId = NewRefId(true)
		itemId = Replace(GetXMLNodeAttrib(manifestData, "item", "identifier"),"ITEM-","")
		If itemId = "@@ITEMID@@" or itemId = "" Then itemId = NewRefId(true)
	End If
	
	' copy in the files out of the appropriate scorm folder (which will overwrite the imsmanifest.xml with a template)
	Set fol = Config.FileSys.GetFolder(scoFolder)
	For each fold in fol.subfolders
		Config.FileSys.CopyFolder fold.path, ContentFolder & "\"
	Next
	For Each fil in fol.files
		fil.Copy ContentFolder & "\"
	Next
	
	' generate the file references
	ReDim Ar(1)
	
	' work out virtual path for files
	
	
	IO.GetAVirtualFileListOfFolderAndPutItIntoArray ContentFolderRelative, ar 
	sFiles = Replace(vbTab & "<file href=""" & join(ar, """ />" & vbNewLine & vbTab & "<file href=""") & """ />" & vbNewLine, vbTab & "<file href="""" />" & vbNewLine, "")
	sFiles = Replace(sFiles, "&", "&amp;")
	sFiles = Replace(sFiles, ContentFolderRelative & "/", "", vbTextCompare) ' -> @@FILELIST@@

	' grab the manifest template
	set fil = Config.FileSys.OpenTextFile(scoFolder & "\imsmanifest.xml", 1, false)
	manifestData = fil.ReadAll
	fil.close
	
	' href might not have the SCO1/ prefix
	If InStr(href, "SCO1/") = 0 Then href = "SCO1/" & href

	If IsNull(name) Then name = "unnammed"
	If IsNull(description) Then description = "unnammed"
	
	' apply the data we just collected to the template
	manifestData = replace(manifestData, "@@LAUNCH@@", href)
	manifestData = replace(manifestData, "@@TITLE@@", name)
	manifestData = replace(manifestData, "@@DESCRIPTION@@", description)
	manifestData = replace(manifestData, "@@ORGID@@", orgId)
	manifestData = replace(manifestData, "@@REFID@@", refId)
	manifestData = replace(manifestData, "@@ITEMID@@", itemId)
	manifestData = replace(manifestData, "@@FILELIST@@", sFiles)

	' save the new manifest over the old one
	set fil = Config.FileSys.OpenTextFile(ContentFolder & "\imsmanifest.xml", 2, false)
	fil.write manifestData
	fil.close
	
	'If Config.FileSys.FileExists(ContentFolder & "\SCO1\Configuration\Settings.json") Then
	'	On Error Resume Next
	'	SetEngineSCO ContentFolder, SelectedRuntime
	'	On Error Goto 0
	'End If

End Sub

'' Derifivitve of above; work out the current runtime then reapply it
Sub reApplySCORM(ByVal mappedFolder)
Dim scoFolders, fold, fol, runtime
	runtime = "1.2"
	scoFolders = " vocab unique extend common "
	Set fold = Config.FileSys.GetFolder (mappedFolder)
	For Each fol in Fold.Files
		If InStr(scoFolders, Lcase(fol.Name)) > 0 Then runtime = "2004"
	Next
	ApplySCORMManifest mappedFolder, runtime, false
End Sub

%>