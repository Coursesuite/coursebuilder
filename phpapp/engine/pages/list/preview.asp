<!DOCTYPE html>
<html><style>body{white-space:pre-line;font-family: monospace;}</style><body>

<%
	dim fn : fn = unescape(request.querystring)
	Dim ext : ext = Mid(fn, InStrRev(fn,"."))

	if instr(".html.htm.md.txt.",ext) > 0 Then
		Set objStream = server.CreateObject("adodb.stream")
	    objStream.Type = adTypeText
	    objStream.Mode = adModeReadWrite
	    objStream.Charset = "UTF-8"
		objStream.Open
		objStream.LoadFromFile server.mappath(request.querystring)
		objStream.Position = 0
		ret = objStream.ReadText
		If AscB(MidB(ret, 1, 1)) = 239 _
		        And AscB(MidB(ret, 2, 1)) = 187 _
		        And AscB(MidB(ret, 3, 1)) = 191 Then
			objStream.Position = 3 ' Start over, skip BOM
			ret = objStream.ReadText
		End If
		response.write(ret)
		objStream.Close
		Set objStream = Nothing
	else
		Dim ref, fso : set fso = server.createobject("scripting.filesystemobject")
		Set fn = fso.getFile(server.mappath(fn))
		ref = "ref://" & myurlencode(fn.name)
		response.write "<p><b>Name: </b>" & fn.name & "</p>"
		response.write "<p><b>Size: </b>" &  FormatNumber(fn.size / (1024 * 1024), 2,0,0,0) & " Megs</p>"
		response.write "<p><b>Modified: </b>" & fn.DateLastModified & "</p>"
		response.write "<p><b>RefLink: </b><input type='text' size='" & len(ref) & "' value=""" & ref & """ onclick='this.select()'>"
		set fn = nothing
		set fso = nothing
	end if
	
function myurlencode(byval enc)
	enc = server.urlencode(enc)
	enc = replace(enc,"+","%20")
	enc = replace(enc,"%2E",".")
	myurlencode = enc
end function
%>
</body></html>