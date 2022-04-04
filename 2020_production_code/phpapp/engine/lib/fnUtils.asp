<%



Function GetImageDimensions(ByVal path)
Dim img, w, h, fmt
	If InStr(path,":\") = 0 Then path = server.mappath(path)
	If Not Config.FileSys.FileExists(path) Then Exit Function
	Set img = Server.CreateObject("CxImageATL.CxImage")
	Select Case LCase(Mid(path, InStrRev(path,".") + 1))
		case "png"
			fmt = 4
		case "jpg", "jpeg"
			fmt = 3
		case "gif"
			fmt = 2
		case else
			exit function
	End Select
	Call img.Load(path,fmt)
	GetImageDimensions = Array(img.GetWidth(), img.GetHeight())
	Set img = Nothing
End Function
	
Function HexToRgba(byval hx, byval a)
Dim r,g,b
	hx = replace(hx,"#","")
	r = CLng("&H" & Mid(hx,1,2))
	g = CLng("&H" & Mid(hx,3,2))
	b = CLng("&H" & Mid(hx,5,2))
	HexToRgba = "rgba(" & r & "," & g & "," & b & "," & a & ")"
End Function

Function ReplaceTag(ByVal str, ByVal fromTag, ByVal toTag)
	str = Replace(str, "</" & fromTag & ">", "</" & toTag & ">")
	str = Replace(str, "<" & fromTag & ">", "<" & toTag & ">")
	' do this if/when I require attrib
	' Dim rex : set rex = New RegExp
	' rex.global = true
	' rex.pattern = "<" & fromTag &"\s(.*?)>"
	' str = rex.replace(str,toTag & "\1")
	ReplaceTag = str
End Function

Function WrapTag(ByVal str, ByVal tag)
	WrapTag = "<" & tag & ">" & str & "</" & tag & ">"
End Function

Function UnWrapTag(ByVal str, ByVal tag)
	str = Replace(str, "<" & tag & ">", "")
	str = Replace(str, "</" & tag & ">", "")
	str = Replace(str, "<p/>", "") ' dumb tags
	UnWrapTag = str
End Function


Function NoLineBreaks(ByVal val)
	val = replace(val,vbTab,"")
	val = replace(val,vbCr,vbLf)
	val = replace(val,vbLf,vbCrLf)
	val = replace(val,vbCrLf,vbNewLine)
	NoLineBreaks = replace(val,vbNewLine,"")
End Function

Function CleanupTag(ByVal str)
	str = Replace(str, "\r\n\t\t", "")
	str = Replace(str, "\r\n\t", "")
	str = Replace(str, "<p><p>", "<p>")
	str = Replace(str, "<p></p>", "")
	str = Replace(str, "<p/>", "") ' dumb tags
	str = Replace(str, "\" & chr(34), chr(34))
	CleanupTag = str
End Function

Function ConvertTagsToTards(ByRef oXmlNode)
Dim list, li, code, ar, refs, ref, refNode, k, n

	if TypeName(oXmlNode) = "IXMLDOMElement" Then

		' Convert lists to arrays (later we will change containers)
		For Each list in oXmlNode.SelectNodes(".//ul | .//ol") ' .// means any from current, not // as you would think. damned vbscript
			ar = array()
			for each li in list.selectNodes("li")
				push2array ar, trim(li.text)
			next
			list.text = NoLineBreaks(join(ar,"|"))
		Next
	
		' Now convert to html and process it as a string to fix remaining problems
		set n = oXmlNode.SelectSingleNode(".//main-html")
		If not n is nothing then
			code = n.xml
		else
			code = oXmlNode.xml
		End if
		'If oXmlNode.ChildNodes.Item(0).nodeName = "main-html" Then
		'	code = oXmlNode.ChildNodes.Item(0).xml 'nodeValue
		'Else
		'	code = oXmlNode.xml 'nodeValue
		'End If

	End If
	code = Replace(code,"<ol>","{numbers ")
	code = Replace(code,"<ul>","{bullets ")
	code = Replace(code,"</ol>","}")
	code = Replace(code,"</ul>","}")
	
	' Convert headers to tagged blocks
	For k = 1 to 6
		code = Replace(code, "<h" & k & ">", "{tag h" & k & "|")
		code = Replace(code, "</h" & k & ">", "}")
	Next

	ConvertTagsToTards = code
		
End Function

Function GetTagValue(ByVal str, ByVal tag)
Dim rex, val, o : Set rex = New RegExp
	rex.pattern = "<" & tag & "\s(.*?)>"
	Set val = rex.Execute(str)
	For each o in val
		str = Mid(str, o.firstIndex)
		str = Mid(str, InStr(str, ">") + 1)
		str = Left(str, InStr(str, "</" & tag & ">"))
	next
	Set rex = Nothing
End Function


''
''	Clean up hidden files, cache & mac folders
''
Sub CleanJunkLite(byval path)
Dim sf, fl, fold
	set fold = Config.FileSys.getfolder(path)
	for each sf in fold.subfolders
		on error resume next
		if left(sf.name,1) = "." then
			sf.delete
		elseif (lcase(sf.name) = "__macosx") then
			sf.delete
		else
			CleanJunkLite(path & "\" & sf.name)
		end if
		on error goto 0
	next
	for each fl in fold.files
		on error resume next
		if left(fl.name,1) = "." then
			fl.delete
		else
			select case lcase(fl.name)
				case "thumbs.db"
					fl.delete
				case ".ds_store"
					fl.delete 
			end select
		end if
		on error goto 0
	next
	Set fold = Nothing
End Sub

''
''	thoroughly scrub a folder and remove the exiting javascript player and any set-up files (like launch pages)s
''
Sub CleanJunk(byval path)
Dim sf, fl, fold, fso
	set fold = Config.FileSys.getfolder(path)
	for each sf in fold.subfolders
		if left(sf.name,1) = "." then
			on error resume next
			sf.delete
			on error goto 0
		elseif (lcase(sf.name) = "__macosx" or lcase(sf.name) = "player") or lcase(sf.name) = "layout" then
			Set fso = server.createobject("scripting.filesystemobject") ' different instance to config.filesys
			on error resume next
			fso.deletefolder path & "\" & sf.name, true
			on error goto 0
			set fso = nothing
			' sf.delete
		else
			CleanJunk(path & "\" & sf.name)
		end if
	next
	for each fl in fold.files
		if left(fl.name,1) = "." then
			on error resume next
			fl.delete
			on error goto 0
		else
			on error resume next
			select case lcase(fl.name)
				case "thumbs.db"
					fl.delete
				case ".ds_store"
					fl.delete
				case "quiz.html"
					fl.delete
				case "content.html"
					fl.delete
				case "launch.html"
					fl.delete
				case "index.html"
					fl.delete
				case "settings.xml"
					fl.delete
			end select
			on error goto 0
		end if
	next
	Set fold = Nothing
End Sub

Sub Sleep(byval sec)
	Dim dteWait
	dteWait = DateAdd("s", sec, Now())
	Do Until (Now() > dteWait)
	Loop
End Sub


''
''	Becasue vbscript doesn't have push
''
Sub Push2Array(byref arr, byval value)
	redim preserve arr (ubound(arr) + 1)
	arr(ubound(arr)) = value
End Sub


Sub PushObj2Array(byref arr, byval value)
	redim preserve arr (ubound(arr) + 1)
	Set arr(ubound(arr)) = value
End Sub


''
'' update the date modified timestamp on a folder - doesn't work but should
''
Sub TouchFolder(byval path)
	If Trim("" & path) = "" Then Exit Sub
	If Right(path, 1) = "\" Then path = Left(path, Len(path) - 1)
	If Config.FileSys.FolderExists(path) Then
		Dim ar : ar = Split(path,"\")
		Dim fold : Set fold = Config.ShellApp.NameSpace(Config.FileSys.GetFolder(path).parentfolder & "\")
	    fold.Items.Item(ar(ubound(ar))).ModifyDate = Now
		Set fold = Nothing
	End If
End Sub

''
'' copy a single file from one path to another
''	
Sub FileCopy(byval inpPath, byval outPath, byval name)
Dim obj
	If not Config.FileSys.fileexists(inpPath & name) Then exit sub
	If Config.FileSys.fileexists(outPath & "\" & name) Then
		Set obj = Config.FileSys.getFile(outPath & name)
		obj.delete
		Set obj = Nothing
	End If
	Config.FileSys.copyFile inpPath & name, outPath
end Sub

''
''	put quotes around a string, if it's not empty
''
function QuoteOptional(byval str)
	if instr(str," ") > 0 then
		QuoteOptional = Quote(str)
	else
		QuoteOptional = str
	end if
End Function

function Quote(ByVal str)
	Quote = chr(34) & str & chr(34)
End Function

function DoubleQuote(ByVal str)
	DoubleQuote = Quote(Quote(str))
end function

''
''	take off the \ at the end of a string
''
Function NoTrailingSlash(byval str)
	If right(str,1) = "\" Then
		NoTrailingSlash = left(str, len(str) -1)
	else
		NoTrailingSlash = str
	end if
end function

''
''	take off a file extension from a string
''
Function JustFileNamePart(byval str)
	If InStr(str, ".") > 0 Then
		JustFileNamePart = Left(str, InStrRev(str,".")-1)
	Else
		JustFileNamePart = str
	End If
End Function

function arraySort( arToSort, sortBy, compareDates )
	Dim c, d, e, smallestValue, smallestIndex, tempValue
	For c = 0 To uBound( arToSort, 2 ) - 1
		smallestValue = arToSort( sortBy, c )
		smallestIndex = c
		For d = c + 1 To uBound( arToSort, 2 )
			if not compareDates then
				if strComp( arToSort( sortBy, d ), smallestValue ) < 0 Then
					smallestValue = arToSort( sortBy, d )
					smallestIndex = d
				End if
			else
				if not isDate( smallestValue ) then
					arraySort = arraySort( arToSort, sortBy, false)
					exit function
				else
					if dateDiff( "d", arToSort( sortBy, d ), smallestValue ) > 0 Then
						smallestValue = arToSort( sortBy, d )
						smallestIndex = d
					End if
				end if
			end if
		Next
		if smallestIndex <> c Then 
			For e = 0 To uBound( arToSort, 1 )
				tempValue = arToSort( e, smallestIndex )
				arToSort( e, smallestIndex ) = arToSort( e, c )
				arToSort( e, c ) = tempValue
			Next
		End if
	Next
	arraySort = arToSort
End Function

'' for n = 0 to ubound(sortedarray,2)
''   response.write(sortedarray(0,n)&" "&sortedarray(1,n)&" "&sortedarray(2,n)&"<br />")
'' next
function SortAlpha(ary, direction, indexnum)
    Dim StopWork
    Dim i
    Dim i2
    Dim firstval()
    Dim secondval()
    
    redim firstval(ubound(ary,1))
    redim secondval(ubound(ary,1))
        
    StopWork=False
    Do Until StopWork=True
        StopWork=True
        For i = 0 To UBound(ary,2)
            if i=UBound(ary,2) Then Exit For
            if UCase(Direction) = "DESC" Then
                if isdate(ary(indexnum,i)) then compare = datediff("s",ary(indexnum,i),now()) < datediff("s",ary(indexnum,i+1),now()) else compare = ary(indexnum,i) < ary(indexnum,i+1)
                if compare Then
                    For i2 = 0 To ubound(firstval)
                        firstval(i2) = ary(i2,i)
                        secondval(i2) = ary(i2,i+1)
                        ary(i2,i) = secondval(i2)
                        ary(i2,i+1) = firstval(i2)                                    
                    Next
                    StopWork=False
                End if
            Else
                if isdate(ary(indexnum,i)) then compare = datediff("s",ary(indexnum,i),now()) > datediff("s",ary(indexnum,i+1),now()) else compare = ary(indexnum,i) > ary(indexnum,i+1)
                if compare then
                    For i2 = 0 To ubound(firstval)
                        firstval(i2) = ary(i2,i)
                        secondval(i2) = ary(i2,i+1)
                        ary(i2,i) = secondval(i2)
                        ary(i2, i+1) = firstval(i2)                    
                    Next
                    StopWork=False
                End if
            End if
        Next
    Loop
    SortAlpha=ary
End function


''
'' inline if
''
Function IIf(byval obj, byval yes, byval no)
	if (obj) then
		iif = yes
	else
		iif = no
	end if
end function

''
'' readable date
''
Function NiceDate(byval cd)
If not isdate(cd) then exit function
Dim s, d
	d = Day(cd)
	If d = 1 Then
		s = "1st "
	ElseIf d = 2 Then
		s = "2nd "
	ElseIf d = 3 then
		s = "3rd "
	Else
		s = d & "th "
	End If
	s = s & MonthName(Month(cd), true) & " "
	If Year(Now) <> Year(cd) Then s = s & Year(cd) & " "

	If Hour(cd) > 12 Then
		s = s & Right ("0" & Hour(cd)-12, 2) & ":"
		s = s & Right ("0" & Minute(cd), 2) & "p"
	Else
		s = s & Right ("0" & Hour(cd), 2) & ":"
		s = s & Right ("0" & Minute(cd), 2)
	End If
		
	NiceDate = s
	
end function

Function NicerDate(byval cd)
If not isdate(cd) then exit function
Dim s, d, m, y
	d = Day(cd)
	m = Month(cd)
	y = Year(cd)
	If Day(now) = d and Month(now) = m And year(now) = y Then
		s = "Today "
	ElseIf DateAdd("d",-1,now) = dateadd("d",0,cd) Then
		s = "Yesterday "
	ElseIf d = 1 Then
		s = "1st "
	ElseIf d = 2 Then
		s = "2nd "
	ElseIf d = 3 then
		s = "3rd "
	Else
		s = d & "th "
	End If
	
	If (Month(Now) = m And Year(now) = y) Then
		' skippit
	Else
		s = s & MonthName(m, true) & " "
		If Year(Now) <> y Then s = s & y & " "
	End If

	If Hour(cd) > 12 Then
		s = s & Right ("0" & Hour(cd)-12, 2) & ":"
		s = s & Right ("0" & Minute(cd), 2) & "&nbsp;p"
	Else
		s = s & Right ("0" & Hour(cd), 2) & ":"
		s = s & Right ("0" & Minute(cd), 2)
	End If
		
	NicerDate = s
	
end function


''
''	make a new guid and strip out the non hex characters
''
Function NewRefId(byval clean) 
	NewRefId = NewRefId2(clean,false)
End Function

Function NewRefId2(byval clean, byval short) 
Dim s, o
	Set o = Server.CreateObject("Scriptlet.TypeLib") 
	if (short) Then
		s = Left(CStr(o.Guid), 9)
	Else
		s = Left(CStr(o.Guid), 38)
	End If
	If (clean) then
		s = replace(s, "-","")
		s = replace(s, "{","")
		s = replace(s, "}","")
	end if
	Set o = Nothing 
	NewRefId2 = s
End Function 


''
''	If a string is empty, return its default value, otherwise return the original string
''
Function Default(byval Original, byval Value)
	If Trim("" & Original) = "" Then
		Default = Value
	Else
		Default = Original
	End If
End Function


''
'' return a random node from an single dimension array
''
Function RandomArrayNode(ByVal aArray)
	Randomize Timer
	RandomArrayNode = aArray(Int((UBound(aArray) - LBound(aArray) + 1) * Rnd + LBound(aArray)))
End Function

''
''	Random bit of crap for making up a thing that looks like an ID
''
Function idMaFy(byval name)
	Dim s
	s = UCase(Replace(name, " ", ""))
	s = Replace(s, "_","")
	s = Replace(s, "-","")
	s = Replace(s, "A","")
	s = Replace(s, "E","")
	s = Replace(s, "I","")
	s = Replace(s, "O","")
	s = Replace(s, "U","")
	idMaFy = s & Right("0" & Second(Now), 2)
End Function


''
'' debug helper for form data display
''
Function FormData()
	Dim a, b, c, d, e
	a = Request.Form.Count
	if a = 0 Then Exit function
	e = "<OL>"
	For b = 1 To a
		e = e & "<LI>" & Server.HTMLEncode(Request.Form.Key(b))
		c = Request.Form(b).Count
		if c = 1 Then
			e = e & " = " & Server.HTMLEncode(Request.Form.Item(b))
		Else
			e = e & "<OL>"
			For d = 1 To c
				e = e & "<LI>" & Server.HTMLEncode(Request.Form(b)(d)) & "</LI>"
			Next
			e = e & "</OL>"
		End if
		e = e & "</LI>"
	Next
	e = e & "</OL>"
	FormData = e
End function


''
''	utility to clean a filename
''
Function strClean (strtoclean)
	Dim objRegExp, outputStr
	Set objRegExp = New Regexp

	objRegExp.IgnoreCase = True
	objRegExp.Global = True
	objRegExp.Pattern = "[(?*"",\\<>&#~%{}+.@:\/!;]+"
	outputStr = objRegExp.Replace(strtoclean, "_")

	objRegExp.Pattern = "\_+"
	outputStr = objRegExp.Replace(outputStr, "_")

	strClean = outputStr
End Function


Function Capitalise(ByVal str)
Dim ar, i
	str = Trim("" & str)
	ar = Split(str, " ")
	For i = 0 To UBound(ar)
		ar(i) = UCase(Left(ar(i),1)) & LCase(Mid(ar(i),2))
	Next
	Capitalise = Join(ar," ")
End Function

''
''	Filter out silly filename characters from a string
''
Function SafeName(byval s)
Dim a, b, c : b = "<>:/\|&?*!$',." & chr(34)
	s = Trim("" & s)
	For a = 1 to Len(b)
		c = Mid(b,a,1)
		s = replace(s,c,"")
	Next
	SafeName = replace(s, " ", "_")
End Function

Function SafeXml(ByVal str)
	str = replace(str,"&","&amp;")
	str = replace(str,"'","&apos;")
	SafeXml = str
End Function

Function DateToTimeStamp(ByVal dte)
	DateToTimeStamp = CLng(DateDiff("s", "01/01/1970 00:00:00", CDate(dte)))
End Function

Function TimeStampToDate(ByVal ts)
	TimeStampToDate = DateAdd("s", ts, cDate("01/01/1970 00:00:00"))
End Function

Function tmp1(byval v)
	dim s , d
	s = clng(v)
	d = cdate("01/01/1970 00:00:00")
	v = DateAdd("s",s,d)
	tmp1 = NiceDate(v)
End Function

Function unMapCoursePath(ByVal mappedPath)
	unMapCoursePath = "/courses" & replace(Mid(mappedPath, Len(server.MapPath("/courses")) + 1), "\", "/")
End Function

function fnUtils_getWhiteLabel()
Dim u,h,c
h = null
c = null
Set u = db.getRS("SELECT custom_header, custom_css FROM Plebs WHERE name='{0}'", MyUserName)
	If Not (u.bof and u.eof) then
		h = u("custom_header")
		c = u("custom_css")
	end if
	fnUtils_getWhiteLabel = array(h,c)
end function

Function fnUtils_formatBytes(byteSize) 
	dim Size
	Size = byteSize
	
	Do While InStr(Size,",") 'Remove commas from size 
		CommaLocate = InStr(Size,",") 
		Size = Mid(Size,1,CommaLocate - 1) & _ 
		Mid(Size,CommaLocate + 1,Len(Size) - CommaLocate) 
	Loop
	
	Suffix = " Bytes" 
	If Size >= 1024 Then suffix = " KB" 
	If Size >= 1048576 Then suffix = " MB" 
	If Size >= 1073741824 Then suffix = " GB" 
	If Size >= 1099511627776 Then suffix = " TB" 
	
	Select Case Suffix 
		Case " KB" Size = Round(Size / 1024, 1) 
		Case " MB" Size = Round(Size / 1048576, 1) 
		Case " GB" Size = Round(Size / 1073741824, 1) 
		Case " TB" Size = Round(Size / 1099511627776, 1) 
	End Select
	
	fnUtils_formatBytes = Size & Suffix 
End Function

%>