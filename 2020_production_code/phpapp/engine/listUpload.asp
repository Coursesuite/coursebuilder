<%@ Language=VBScript %>
<% 
option explicit 
Response.Expires = -1
response.buffer = false
Server.ScriptTimeout = 600
%>
<!-- #include virtual="/engine/lib/page_initialise.asp" -->
<!-- #include file="lib/incAspUpload.asp" -->
<%

Dim UPLOAD_PATH, qs, rd

SELECTION	= request.querystring("selection")
UPLOAD_PATH	= MAPPED_COURSE & "\SCO1\en-us\Content\media\"

qs = lib.getQueryString(Array())
rd = true

if Request.ServerVariables("REQUEST_METHOD") = "POST" then
    Dim Upload : Set Upload = New FreeASPUpload
    Dim fn : fn = Upload.GetOneFileName
    Dim ft : ft = Upload.GetOneFileType
    If InStr(ft,"image/") = 0 Then
		UPLOAD_PATH	= MAPPED_COURSE & "\SCO1\en-us\Content\"
	End If
    Call Upload.Save(UPLOAD_PATH)
	qs = lib.getQueryString(Array("newfile", fn))

    If Upload.Form("stop") > "" Then
	    response.contenttype = "application/json"
		response.write "{""success"":""" & fn & """}"
		rd = false
    End If

    Set Upload = Nothing
End If

If rd Then response.redirect "/engine/pages/list/?" & qs 

%>

<!-- #include virtual="/engine/lib/page_terminate.asp" -->
