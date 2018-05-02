<%
Class FileIORoutines
	
	''
	''	given a folder path, return a list of files for a given file extension (one or more)
	''
	Function GetFileNamesForExt(byVal vPath, byVal ext)
		If InStr(vPath, ":\") = 0 Then vPath = Server.MapPath(vPath)
		If Not Config.FileSys.FolderExists(vPath) Then Exit Function
		Dim Fold : Set Fold = Config.FileSys.GetFolder(vPath)
		Dim fExt, i, ar : ReDim ar(Fold.Files.Count)
		i = 0
		For Each Fil in Fold.Files
			If InStr(Fil.Name, ".") > 0 Then
			fExt = Mid(Fil.Name, InStrRev(Fil.Name, "."))
			if InStr(lcase(ext), fExt) > 0 Then
				ar(i) = Fil.Name
				i = i + 1
			End If
			End If
		Next
		ReDim Preserve ar(i-1)
		GetFileNamesForExt = ar
		Set Fold = Nothing
	End Function

	Function GetListOfNonCourseFiles(byVal vPath)
		If InStr(vPath, ":\") = 0 Then vPath = Server.MapPath(vPath)
		If Not Config.FileSys.FolderExists(vPath) Then Exit Function
		Dim Fold : Set Fold = Config.FileSys.GetFolder(vPath)
		Dim fExt, i, ar : ReDim ar(3, Fold.Files.Count)
		i = 0
		For Each Fil in Fold.Files
			If InStr(Fil.Name, ".") > 0 Then
				fExt = Mid(Fil.Name, InStrRev(Fil.Name, "."))
				if instr(".html.xml.json.txt.", lcase(fExt)) = 0 Then
					ar(0, i) = Fil.Name
					ar(1, i) = fnUtils_formatBytes(Fil.Size)
					ar(2, i) = Mid(Fil.Name, InStrRev(Fil.Name, ".") + 1)
					ar(3, i) = NicerDate(Fil.DateLastModified)
					i = i + 1
				end if
			End If
		Next
		ReDim Preserve ar(3, i-1)
		GetListOfNonCourseFiles = ar
		Set Fold = Nothing
	End Function
	
	''
	''	recurse through a folder structure to build a file list as an array
	''
	Sub GetAVirtualFileListOfFolderAndPutItIntoArray(byval vpath, byref ar)
	Dim Fold, Obj, i
		Set fold = Config.FileSys.getFolder(server.mappath(vpath))
		For Each obj in Fold.SubFolders
			GetAVirtualFileListOfFolderAndPutItIntoArray vpath & "/" & Obj.Name, ar
		Next
		If Fold.Files.Count > 0 Then
			i = ubound(ar)
			ReDim Preserve Ar (i + Fold.Files.Count)
			For Each obj in Fold.Files
				ar(i) = vpath & "/" & obj.Name
				i = i + 1
			Next
		End If
		Set Fold = Nothing
	End Sub
	
	
	''
	'' return an array of folders in a path, sorted so the newest is first in the array
	''
	'Function LatestFolders(ByVal path)
	'Dim ar, i
	'	i = 0
	'	set fold = Config.FileSys.getFolder(path)
	'	ReDim ar(2, fold.subfolders.count)
	'	for each sf in fold.subfolders
	'		ar(0,i) = sf.name
	'		ar(1,i) = DateDiff("s", "01/01/1970 00:00:00", sf.DateLastAccessed)
	'		ar(2,i) = sf.DateLastModified
	'		i = i + 1
	'	next
	'	Set fold = Nothing
	'	LatestFolders = SortAlpha(ar,"desc",1)
	'End Function
	
	
	''
	''	saves a file as utf-8 including the byte-order-mark
	''
	Sub SaveFileStream(byval fileToSave, byval stringContents)
	Dim objStream
		Set objStream = Server.CreateObject("ADODB.Stream")
		objStream.Type = adTypeText
		objStream.Mode = adModeReadWrite
		objStream.Open
		objStream.Position = 0
		objStream.Charset = "UTF-8"
		objStream.WriteText stringContents
		objStream.SaveToFile fileToSave, adSaveCreateOverWrite
		objStream.Close
		Set objStream = nothing
	End Sub
	
	Sub WGet(ByVal whereToSave, fileUrl)
	Dim objXMLHTTP, objADOStream

		Set objXMLHTTP = CreateObject("MSXML2.ServerXMLHTTP")
		objXMLHTTP.open "GET", fileUrl, false
		objXMLHTTP.send()
 
		If objXMLHTTP.Status = 200 Then
			Set objADOStream = CreateObject("ADODB.Stream")
			objADOStream.Open
			objADOStream.Type = 1 'adTypeBinary
			objADOStream.Write objXMLHTTP.ResponseBody
			objADOStream.Position = 0    'Set the stream position to the start
			If Config.FileSys.Fileexists(whereToSave) Then Config.FileSys.DeleteFile whereToSave
			objADOStream.SaveToFile whereToSave
			objADOStream.Close
			Set objADOStream = Nothing
		End If
		Set objXMLHTTP = Nothing

	End Sub
	
	''
	''	loads a file as a stream and removes the BOM
	''
	Function LoadFileStream(byVal fileToLoad)
	Dim objStream, sBOM, ret
		If Not Config.FileSys.FileExists(fileToLoad) Then Exit Function
		Set objStream = server.CreateObject("adodb.stream")
	    objStream.Type = adTypeText
	    objStream.Mode = adModeReadWrite
	    objStream.Charset = "UTF-8"
		objStream.Open
		objStream.LoadFromFile fileToLoad
		If objStream.Size < 1 Then Exit Function ' nothing to do
		objStream.Position = 0
		ret = objStream.ReadText
		  On Error Resume Next
		If AscB(MidB(ret, 1, 1)) = 239 _
		        And AscB(MidB(ret, 2, 1)) = 187 _
		        And AscB(MidB(ret, 3, 1)) = 191 Then
			objStream.Position = 3 ' Start over, skip BOM
			ret = objStream.ReadText
		End If
		  On error Goto 0
		LoadFileStream = ret
		objStream.Close
		Set objStream = Nothing
	End Function
	
	'Function LoadFileStreamCopy(byval fileToLoad)
	'	If Not Config.FileSys.FileExists(fileToLoad) Then Exit Function
	'    Dim UTFStream : Set UTFStream = server.CreateObject("adodb.stream")
	'    UTFStream.Type = adTypeText
	'    UTFStream.Mode = adModeRead
	'    UTFStream.Charset = "UTF-8"
	'    UTFStream.Open
	'    UTFStream.LoadFromFile fileToLoad
	'	If AscB(MidB(ret, 1, 1)) = 239 _
	'	        And AscB(MidB(ret, 2, 1)) = 187 _
	'	        And AscB(MidB(ret, 3, 1)) = 191 Then
	'		UTFStream.Position = 3 ' skip BOM
	'	End If
	'
	'    Dim StreamCopy : Set StreamCopy = server.CreateObject("adodb.stream")
	'    StreamCopy.Type = adTypeBinary
	'    StreamCopy.Mode = adModeReadWrite
	'    StreamCopy.Open
	'	    UTFStream.CopyTo StreamCopy
	'		UTFStream.Flush
	'		UTFStream.Close
	'		Set UTFStream = Nothing
	'
	'	StreamCopy.Position = 0
	'	LoadFileStreamCopy = StreamCopy.ReadText
	'	StreamCopy.Close
	'	Set StreamCopy = Nothing
	'
	'End Function
	
	
	'Function LoadFileFSO(ByVal fileToLoad)
	'Dim s, i, j
	'	j = 1
	'	If Not Config.FileSys.FileExists(fileToLoad) Then Exit Function
	'	Set s = Config.FileSys.OpenTextFile(fileToLoad,1)
	'	LoadFileFSO = s.ReadAll
	'	s.close
	'	Set s = Nothing
	'	If AscB(MidB(LoadFileFSO, 1, 1)) = 239 And AscB(MidB(LoadFileFSO, 2, 1)) = 187 And AscB(MidB(LoadFileFSO, 3, 1)) = 191 Then
	'		LoadFileFSO = Mid(LoadFileFSO,4)
	'	End If
	'End Function
	
	''
	''	saves a file as utf-8 but without a byte-order-mark
	''
	Sub WriteUTF8WithoutBOM(byval fileToSave, byval stringContents)
	    Dim UTFStream : Set UTFStream = server.CreateObject("adodb.stream")
	    UTFStream.Type = adTypeText
	    UTFStream.Mode = adModeReadWrite
	    UTFStream.Charset = "UTF-8"
	    'UTFStream.LineSeparator = adLF
	    UTFStream.Open
	    UTFStream.WriteText stringContents
	
	
	    Dim BinaryStream : Set BinaryStream = server.CreateObject("adodb.stream")
	    BinaryStream.Type = adTypeBinary
	    BinaryStream.Mode = adModeReadWrite
	    BinaryStream.Open
	
	    'Strips BOM (first 3 bytes)
	    UTFStream.Position = 3
	
		' Checks that the start of file is <!doctype for html files
	    'Dim iTest, strTest : strTest = UTFStream.ReadText 100
	    'iTest = InStr(lcase(strTest),"<!doctype")
	    'If iTest > 1 Then
	    '	UTFStream.Position = iTest
	    'End If
	
	    UTFStream.CopyTo BinaryStream
	
	    ' WITH bom: UTFStream.SaveToFile fileToSave, adSaveCreateOverWrite
	    UTFStream.Flush
	    UTFStream.Close
	    ' response.write "<LI>saving to disk: " & fileToSave
	    on error resume next
	    BinaryStream.SaveToFile fileToSave, adSaveCreateOverWrite
	    if err then
	    	response.write "<p><b>Important failure:</b> IO.WriteUTF8WithoutBOM failed to write " & len(stringContents) & " bytes to <i>" & fileToSave & "</i>... which means 'What you tried to save, did not save'.</p>"
	    	response.end
	    end if
	    On error goto 0
	    BinaryStream.Flush
	    BinaryStream.Close
	End Sub
	
	''
	''	Save a file in ASCII format
	''
	'Sub SaveFileFSO(ByVal path, ByVal string)
	'Dim fil
	'	set fil = Config.FileSys.OpenTextFile(path, 8, true)
	'	fil.write string
	'	fil.close
	'End Sub
	
	
	
	''
	''	Return the contents of a file
	''	If it's not found, copy in the defaults file(s) first
	''
	Function GetFileString(byval filename, byval defaults)
	Dim data, ar, i, ret
		ret = ""
		If InStr(filename, ":") = 0 Then filename = server.mappath(filename) ' dont need unc support
		If defaults > "" And Not Config.FileSys.FileExists(filename) Then
			ar = Split(defaults, ",")
			For i = 0 to ubound(ar)
				Config.FileSys.CopyFile server.mappath(ar(i)), filename, true
			Next
		End If
		If Right(lcase(filename), 5) = ".json" Or Right(lcase(filename),4) = ".xml" Then
			'ret = LoadFileFSO(filename)
			ret = LoadFileStream(filename)
		Else
			If Config.FileSys.FileExists(filename) Then
				Set data = Config.FileSys.OpenTextFile(filename, 1, false)
				on error resume next ' if zero byte
				ret = data.ReadAll
				on error goto 0
				data.close
			End If
		End If
		GetFileString = ret
	End Function
	
	
	Function GetAllCourses(ByVal Kind)
	Dim Lists, Index, Total, Folders, Node, isArchive
		isArchive = Trim("" & LCase(Kind)) = "archive"
		If isArchive Then
			Set Folders = Config.FileSys.GetFolder(Config.ArchivePath).SubFolders
		Else
			Set Folders = Config.FileSys.GetFolder(Config.CoursesPath).SubFolders
		End If
		Total = Folders.Count
		ReDim Lists(1, Total-1)
		For Each Node In Folders
			Lists(0, Index) = Node.Name
			Lists(1, Index) = GetCourseName(Iif(isArchive, Config.ArchivePath & "\" & Node.Name, Config.CoursesPath & "\" & Node.Name))
			Index = Index + 1
		Next
		GetAllCourses = Lists
		Erase Lists
	End Function
	
	
	
	
	
	
	
	''
	''	Renames a file so that it doesn't contain bad file characters or clash with an existing filename.
	''	returns new filename
	''
	Function RenameSafeFileThenReturnNewName(byval folder, byval filename, byref isUpdated)
	Dim fileNewName, fileFixedName, fileExt, index, bFound
	
		index = 0
		if instr(filename, ".") = 0 Then
			fileFixedName = filename & ".txt"
			fileExt = ".txt"
		Else
			fileExt = Mid(filename, InStrRev(filename,".")) ' with .
			fileFixedName = filename
		End If
	
		If InStr(fileFixedName,".") > 0 Then
			fileFixedName = Left(fileFixedName,InStrRev(fileFixedName,".") - 1) ' crop any file extension
		End If
		fileFixedName = Replace(strClean("" & fileFixedName)," ", "_") ' remove non alphanum; replace space with underscore
		
		If Config.FileSys.FileExists(folder & filename) Then ' orig file exists?
		
			fileNewName = folder & fileFixedName & fileExt
			if fileNewName <> (folder & filename) Then
				bFound = Config.FileSys.FileExists(fileNewName)
				Do While bFound
					index = index + 1
					fileNewName = folder & fileFixedName & "_" & index & fileExt
					bFound = Config.FileSys.FileExists(fileNewName) ' becomes false when not a match
					if index > 10 then exit do ' best not trash the server if there's a problem ...
				Loop
				Config.FileSys.MoveFile folder & filename, fileNewName
				If Config.FileSys.FileExists (folder & replace(filename, ".html", ".xml")) Then ' rename quiz file too
					Config.FileSys.MoveFile folder & replace(filename, ".html", ".xml"), replace(fileNewName, ".html", ".xml")
				End If
				isUpdated = true
			End If
			RenameSafeFileThenReturnNewName = Mid(fileNewName, InStrRev(fileNewName,"\") + 1) ' discard path
	
		elseif Config.FileSys.FileExists(folder & fileFixedName & fileExt) Then ' orig does not exist but new file does - replaced pages.xml with backup?
	
			fileNewName = folder & fileFixedName & fileExt
			RenameSafeFileThenReturnNewName = Mid(fileNewName, InStrRev(fileNewName,"\") + 1)
			isUpdated = true
	
		else
	
			RenameSafeFileThenReturnNewName = filename
			' do not modify isUpdated
	
		end if
	
	End Function
	
	Function FindASafeFileNameThatIsntAlreadyUsed(ByVal mappedFile, ByVal prefix)
	Dim fileExt, outName, filename, filepath, bFound, outNameIndex, index
	
		filename = prefix & Mid(mappedFile, InStrRev(mappedFile, "\") + 1)
		filepath = Left(mappedFile, InStrRev(mappedFile, "\") - 1)
		fileExt = Mid(filename, InStrRev(filename,".")) ' with .
	
		outName = filename
		If InStr(outName,".") > 0 Then
			outName = Left(outName,InStrRev(outName,".") - 1) ' crop any file extension
		End If
		outName = Replace(strClean("" & outName)," ", "_") ' remove non alphanum; replace space with underscore
		outNameIndex = outName
	
		bFound = Config.FileSys.FileExists(filepath & "\" & outName & fileExt)
		Do While bFound
			index = index + 1
			outName = outNameIndex & "_" & index
			bFound = Config.FileSys.FileExists(filepath & "\" & outName & fileExt) ' becomes false when not a match
			if index > 10 then exit do ' best not trash the server if there's a problem ...
		Loop
		
		FindASafeFileNameThatIsntAlreadyUsed =  filepath & "\" & outName & fileExt
	
	End Function
	
	Function ArrayOfSubFolders(ByVal mappedPath)
	Dim sf, ar
		ar = Split("",",")
		For Each sf in Config.FileSys.GetFolder(mappedPath).SubFolders
			if not left(sf.name, 1) = "." then
				Push2Array ar, sf.Name
			end if
		Next
		ArrayOfSubFolders = ar
		Erase ar
	End Function
	
	Function ScanStructureAndReturnLatestDate(ByVal oDir, ByRef d)
	Dim sf, r
		For Each sf in oDir.SubFolders
			r = ScanStructureAndReturnLatestDate(sf, d)
		Next
		For Each sf in oDir.Files
			if left(sf.name, 1) <> "." Then ' skip dotfiles
				If DateDiff("s",d,sf.DateLastModified) > 0 Then
					d = sf.DateLastModified
				End If
			end if
		Next
		r = d
		ScanStructureAndReturnLatestDate = r
	End Function
	
	Function ZipFolder( myFolder, myZipFile )
	' This function recursively ZIPs an entire folder into a single ZIP file,
	' using only Windows' built-in ("native") objects and methods.
	'
	' Last Modified:
	' October 12, 2008
	'
	' Arguments:
	' myFolder   [string]  the fully qualified path of the folder to be ZIPped
	' myZipFile  [string]  the fully qualified path of the target ZIP file
	'
	' Return Code:
	' An array with the error number at index 0, the source at index 1, and
	' the description at index 2. If the error number equals 0, all went well
	' and at index 1 the number of skipped empty subfolders can be found.
	'
	' Notes:
	' [1] If the specified ZIP file exists, it will be overwritten
	'     (NOT APPENDED) without notice!
	' [2] Empty subfolders in the specified source folder will be skipped
	'     without notice; lower level subfolders WILL be added, wether
	'     empty or not.
	'
	' Based on a VBA script (http://www.rondebruin.nl/windowsxpzip.htm)
	' by Ron de Bruin, http://www.rondebruin.nl
	'
	' (Re)written by Rob van der Woude
	' http://www.robvanderwoude.com
	
	    ' Standard housekeeping
	    Dim intSkipped, intSrcItems
	    Dim objApp, objFolder, objFSO, objItem, objTxt
	    Dim strSkipped
	
	    Const ForWriting = 2
	
	    intSkipped = 0
	
	    ' Make sure the path ends with a backslash
	    If Right( myFolder, 1 ) <> "\" Then
	        myFolder = myFolder & "\"
	    End If
	
	    ' Use custom error handling
	    On Error Resume Next
	
	    ' Create an empty ZIP file
	    Set objFSO = server.CreateObject( "Scripting.FileSystemObject" )
	    Set objTxt = objFSO.OpenTextFile( myZipFile, ForWriting, True )
	    objTxt.Write "PK" & Chr(5) & Chr(6) & String( 18, Chr(0) )
	    objTxt.Close
	    Set objTxt = Nothing
	
	    ' Abort on errors
	    If Err Then
	        ZipFolder = Array( Err.Number, Err.Source, Err.Description )
	        Err.Clear
	        On Error Goto 0
	        Exit Function
	    End If
	    
	    ' Create a Shell object
	    Set objApp = server.CreateObject( "Shell.Application" )
	
	    ' Copy the files to the compressed folder
	    For Each objItem in objApp.NameSpace( myFolder ).Items
	        If objItem.IsFolder Then
	            ' Check if the subfolder is empty, and if
	            ' so, skip it to prevent an error message
	            Set objFolder = objFSO.GetFolder( objItem.Path )
	            If objFolder.Files.Count + objFolder.SubFolders.Count = 0 Then
	                intSkipped = intSkipped + 1
	            Else
	                objApp.NameSpace( myZipFile ).CopyHere objItem
	            End If
	        Else
	            objApp.NameSpace( myZipFile ).CopyHere objItem
	        End If
	    Next
	
	    Set objFolder = Nothing
	    Set objFSO    = Nothing
	
	    ' Abort on errors
	    If Err Then
	        ZipFolder = Array( Err.Number, Err.Source, Err.Description )
	        Set objApp = Nothing
	        Err.Clear
	        On Error Goto 0
	        Exit Function
	    End If
	
	    ' Keep script waiting until compression is done
	    intSrcItems = objApp.NameSpace( myFolder  ).Items.Count
	    Do Until objApp.NameSpace( myZipFile ).Items.Count + intSkipped = intSrcItems
	        WScript.Sleep 200
	    Loop
	    Set objApp = Nothing
	
	    ' Abort on errors
	    If Err Then
	        ZipFolder = Array( Err.Number, Err.Source, Err.Description )
	        Err.Clear
	        On Error Goto 0
	        Exit Function
	    End If
	
	    ' Restore default error handling
	    On Error Goto 0
	
	    ' Return message if empty subfolders were skipped
	    If intSkipped = 0 Then
	        strSkipped = ""
	    Else
	        strSkipped = "skipped empty subfolders"
	    End If
	
	    ' Return code 0 (no error occurred)
	    ZipFolder = Array( 0, intSkipped, strSkipped )
	End Function
	
	''
	'' XZip "C:\boot.ini", "C:\testzip.zip"
	''
	Function XZip( myFileSpec, myZip )
	' This function uses X-standards.com's X-zip component to add
	' files to a ZIP file.
	' If the ZIP file doesn't exist, it will be created on-the-fly.
	' Compression level is set to maximum, only relative paths are
	' stored.
	'
	' Arguments:
	' myFileSpec    [string] the file(s) to be added, wildcards allowed
	'                        (*.* will include subdirectories, thus
	'                        making the function recursive)
	' myZip         [string] the fully qualified path to the ZIP file
	'
	' Written by Rob van der Woude
	' http://www.robvanderwoude.com
	'
	' The X-zip component is available at:
	' http://www.xstandard.com/en/documentation/XZip/
	' For more information on available functionality read:
	' http://www.xstandard.com/printer-friendly.asp?id=C9891D8A-5390-44ED-BC60-2267ED6763A7
	    Dim objZIP
	    On Error Resume Next
	    Err.Clear
	    Set objZIP = Server.CreateObject( "XStandard.Zip" )
	    objZIP.Pack myFileSpec, myZip, , , 9
	    XZip = Err.Number
	    Err.Clear
	    Set objZIP = Nothing
	    On Error Goto 0
	End Function
	
	''
	'' XUnZip "C:\testzip.zip", "D:\", "*.ini"
	''
	Function XUnZip( myZip, myTargetDir, myFileSpec )
	' This function uses X-standards.com's X-zip component to extract files from a ZIP file.
	'
	' Arguments:
	' myZip         [string] the fully qualified path to the ZIP file
	' myTargetDir   [string] the directory where the extracted files will be located
	' myFileSpec    [string] the file(s) to be extracted, wildcards allowed
	'
	' Written by Rob van der Woude
	' http://www.robvanderwoude.com
	'
	' The X-zip component is available at:
	' http://www.xstandard.com/en/documentation/XZip/
	' For more information on available functionality read:
	' http://www.xstandard.com/printer-friendly.asp?id=C9891D8A-5390-44ED-BC60-2267ED6763A7
	    Dim objZIP
	    On Error Resume Next
	    Err.Clear
	    Set objZIP = Server.CreateObject( "XStandard.Zip" )
	    objZIP.UnPack myZip, myTargetDir, myFileSpec
	    XUnZip = Err.Number
	    Err.Clear
	    Set objZIP = Nothing
	    On Error Goto 0
	End Function
	
	' copies a default file if the reference string is empty
	' returns true if a file copy takes place.
	Function CopyDefaultIfEmpty(ByVal refString, ByVal destPath, ByVal defaultName)
		CopyDefaultIfEmpty = False
		If Trim("" & refString) = "" Then
			Dim defaultPath
			defaultPath = Server.MapPath("/engine/templates")
			If Config.FileSys.FileExists(defaultPath & "\" & defaultName) Then
				' response.write defaultPath & "\" & defaultName & "=>" & destPath & "\"
				Call Config.FileSys.CopyFile(defaultPath & "\" & defaultName, destPath & "\", true)
				CopyDefaultIfEmpty = True
			End If
		End If
	End Function
	
	function TemplateIsOverriden(byval course_id)
		Dim folderName : folderName = Config.LayoutsPath & "\." & md5er.hash(course_id)
		TemplateIsOverriden = Config.FileSys.FolderExists(folderName)
	end function
	
	''
	''	Return a list of courses [that we can see] that have custom theme folders
	''
	function GetOverriddenCourses(byval sExclude)
		
		Dim oObj, oJson, aObj, tempRS, arSql, filter_sql
		Set oJson = JSON.empty()
		aObj = Array()
		arSql = Array()
		
		' get the list of customised templates from the layoutspath. some of these won't look like md5, but they won't match in the sql
		For Each sf in Config.FileSys.GetFolder(Config.LayoutsPath).SubFolders
			if (left(sf.name, 1) = ".") AND (sf.Name <> sExclude) Then
				Push2Array arSql, "SELECT '" & sf.Name & "'"
			End If
		Next
		
		If uBound(arSql) > 0 Then
			filter_sql = "select concat('.', md5(id)) as hash, name from courses where"
			filter_sql = UserCourseContainerFilterSQL(filter_sql) ' either empty, or terminating with " and "
			filter_sql = filter_sql & " concat('.', md5(id)) in (" & Join(arSql," UNION ") & ")"
			Set tempRS = db.getRS(filter_sql, empty)
			If Not (tempRS.BOF and tempRS.EOF) Then
				Do While Not tempRS.EOF
					Set oObj = JSON.empty()
					oObj.set "hash", trim(tempRS("hash"))
					oObj.set "name", trim(tempRS("name"))
					PushObj2array aObj, oObj
					Set oObj = Nothing
					tempRS.MoveNext
				Loop
			End If
		End If
		oJson.set "courses", aObj
		Set GetOverriddenCourses = oJson
		Set oJson = Nothing
	end function
	
	sub CreateOverrideFolder(byval copy_from)
		Dim folderName : folderName = Config.LayoutsPath & "\." & md5er.hash(COURSE_ID)

		If Not Config.FileSys.FolderExists(folderName) then

			' Requires IUSR to have MODIFY permission on the layout folder -- wrong
			' Requires TARDPROOF_POOL to have FULL CONTROL on the c:\inetpub\tardproof\production\phpapp\layouts folder.
			Call Config.FileSys.CreateFolder(folderName)

			Dim xSource, xDest, xExclusionsFile, xCopyCommand, xCopyResult
			
			If copy_from > "" and Config.FileSys.FolderExists(Config.LayoutsPath & "\" & copy_from) then

				' copy everything from an existing override, don't worry about exclusions or reapplying the base

				xSource = Config.LayoutsPath & "\" & copy_from
				xDest = folderName
				xCopyCommand = "xcopy """ & xSource & """ """ & xDest & """ /Q /R /S /Y"
				Set xCopyResult = Config.Shell.Exec(xCopyCommand)

				Response.Write "<pre>" & xCopyCommand & vbNewLine & xCopyResult.StdOut.ReadAll() & "</pre>"
				Response.Write xCopyCommand & "<br>" & xCopyResult.StdOut.ReadAll() & "<br>"

			Else
			
				' Recursively copy all the files from the base template into this folder
				xSource = Config.BaselineThemePath
				xDest = folderName
				xExclusionsFile = Server.MapPath("/engine/lib/template_exclusions.txt")
				xCopyCommand = "xcopy """ & xSource & """ """ & xDest & """ /Q /R /S /Y /exclude:" & xExclusionsFile
				Set xCopyResult = Config.Shell.Exec(xCopyCommand)

				Response.Write "<pre>" & xCopyCommand & vbNewLine & xCopyResult.StdOut.ReadAll() & "</pre>"
				Response.Write xCopyCommand & "<br>" & xCopyResult.StdOut.ReadAll() & "<br>"

				Sleep 1
			
				' Delete the standard configuration folder
				If Config.FileSys.FolderExists(xDest & "\Configuration") Then
					Call Config.FileSys.DeleteFolder(xDest & "\Configuration", true)
				End If

				' create an Editor folder in the destination so the following xcopy updates it
				Call Config.FileSys.CreateFolder(xDest & "\editor")
				Call Touch(xDest & "\editor\template.txt")

				' Recursively copy the files from the current template into this folder, overwriting matching files, but not the /U option (so it creates missing folders)
				xSource = Config.LayoutsPath & "\" & SETTINGS_JSON.layout.template
				xCopyCommand = "xcopy """ & xSource & """ """ & xDest & """ /C /I /Q /R /U /S /Y /exclude:" & xExclusionsFile
				Set xCopyResult = Config.Shell.Exec(xCopyCommand)

				Response.Write "<pre>" & xCopyCommand & vbNewLine & xCopyResult.StdOut.ReadAll() & "</pre>"
				Response.Write xCopyCommand & "<br>" & xCopyResult.StdOut.ReadAll() & "<br>"

			End If
		
		End if
	end sub
	
	sub DeleteOverrideFolder()
		Dim folderName : folderName = Config.LayoutsPath & "\." & md5er.hash(COURSE_ID)
		If Config.FileSys.FolderExists(folderName) then
			Call Config.FileSys.DeleteFolder(foldername, true)
		end if
	end sub
	
	' used by jsTree to list the contents of a folder, limited to the files relative to the override folder for this course
	function GetOverriddenFilesForPath(ByVal relative_path)
		Dim rootPath : rootPath = Config.LayoutsPath & "\." & md5er.hash(COURSE_ID)
		Dim oJson : Set oJson = JSON.empty()
		Dim oAttr, oObj, fil, fold : Set fold = Config.FileSys.GetFolder(rootpath & replace(relative_path,"|","\"))
		Dim oArray : oArray = Array()
		For Each fil in fold.subfolders
			Set oObj = JSON.empty()
			oObj.set "data", fil.name
			oObj.set "state", "closed"
			oObj.set "children", true
			Set oAttr = JSON.empty()
			oAttr.set "id", "branch_" & md5er.hash(fil.name)
			oAttr.set "rel", "folder"
			oAttr.set "path", replace(relative_path & "\" & fil.name, "\", "|")
			oObj.set "attr", oAttr
			Set oAttr = Nothing
			PushObj2Array oArray, oObj
		Next
		For Each fil in fold.files
			Set oObj = JSON.empty()
			oObj.set "data", fil.name
			Set oAttr = JSON.empty()
			oAttr.set "id", "leaf_" & md5er.hash(fil.name)
			oAttr.set "rel", "default"
			oAttr.set "path", replace(relative_path & "\" & fil.name, "\", "|")
			oObj.set "attr", oAttr
			Set oAttr = Nothing
			PushObj2Array oArray, oObj
		Next

		oJson.set "result", oArray
		Set GetOverriddenFilesForPath = oJson
		Set oJson = Nothing
	end function
	
	' Touch an empty file
	function Touch(byval filename)
		Dim fn
		Set fn = Config.FileSys.CreateTextFile(filename, true)
		fn.write("")
		fn.Close
		Set fn = Nothing
	End Function

End Class

%>