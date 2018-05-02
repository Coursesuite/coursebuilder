<%@ Language=VBScript %>
<% 
option explicit 
Response.Expires = -1
response.buffer = false
Server.ScriptTimeout = 600
%>
<!-- #include virtual="/engine/lib/page_initialise.asp" -->
<!-- #include virtual="/engine/lib/incAspUpload.asp" -->
<%

Dim UPLOAD_PATH, qs, rd, xx, host

qs = "command=" & request.querystring("command")
qs = qs & "&id=" & request.querystring("id")
qs = qs & "&selection=" & request.querystring("selection")
qs = qs & "&areaid=" & request.querystring("areaid")

UPLOAD_PATH	= MAPPED_COURSE & "\SCO1\en-us\Content\media\"

if Request.ServerVariables("REQUEST_METHOD") = "POST" then

    Dim Upload : Set Upload = New FreeASPUpload
    Call Upload.Save(UPLOAD_PATH)
    Set Upload = Nothing

else

	io.WGet UPLOAD_PATH & "\" & request.querystring("title") & "." & request.querystring("type"), request.querystring("image")

End If

response.redirect "http://" & request.querystring("host") & "/engine/pages/list/?" & qs

%>

<!-- #include virtual="/engine/lib/page_terminate.asp" -->
