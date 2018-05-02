<!-- #include virtual="/engine/lib/page_initialise.asp" -->
<!-- #include file="subroutines.asp" -->

<%

Response.ContentType = "text/html"
Response.AddHeader "Content-Type", "text/html;charset=UTF-8"
Response.CodePage = 65001
Response.CharSet = "UTF-8"

If InStr(lcase(request.servervariables("HTTP_USER_AGENT")), "msie/") > 0 Then
	response.clear
	response.redirect "/engine/pages/index/readonly.asp"
End If

Dim SUBS : SUBS = Trim(Request.Cookies("subs"))
If SUBS = "" Then SUBS = "hide"
If Request.QueryString("subs") = "hide" then
	Response.cookies("subs") = "hide"
	response.cookies("subs").Expires = "1/1/2020"
	SUBS = "hide"
ElseIf Request.QueryString("subs") = "show" then
	Response.Cookies("subs") = "show"
	response.cookies("subs").Expires = "1/1/2020"
	SUBS = "show"
End If

Dim ARCHIVE : ARCHIVE = Trim(Request.Cookies("archive"))
If ARCHIVE = "" Then ARCHIVE = "hide"
If Request.QueryString("archive") = "hide" then
	Response.cookies("archive") = "hide"
	response.cookies("archive").Expires = "1/1/2020"
	ARCHIVE = "hide"
ElseIf Request.QueryString("archive") = "show" then
	Response.Cookies("archive") = "show"
	response.cookies("archive").Expires = "1/1/2020"
	ARCHIVE = "show"
End If

Dim CURRENT_PAGE_FRIENDLYNAME, BUGGR_TARGET, CUSTOM_CSS, CUSTOM_HEADER, CUSTOM_DATA

CUSTOM_DATA = fnUtils_getWhiteLabel()
CUSTOM_HEADER = CUSTOM_DATA(0)
CUSTOM_CSS = CUSTOM_DATA(1)

%>

<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <title><%=Config.AppName%></title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="description" content="a tool that lets avide load up scorm packages and preview or publish them">
            <meta name="author" content="Tim">

            <!-- Less, before anything so it initialises quickly -->
            <script>var less = {"env":"development"};</script>
			<link rel="stylesheet/less" href="/engine/layout/css/tardproof.less" />
			<script type="text/javascript" src="/engine/layout/js/less-1.3.3.min.js"></script>
			<!-- Font Awesome is served using a CDN using async loading -->
			<script src="https://use.fontawesome.com/c7c1c46f8a.js"></script>
            <link rel="shortcut icon" href="/engine/layout/ico/favicon.png">
            
<%
if CUSTOM_CSS > "" Then
	response.write "<style>" & CUSTOM_CSS & "</style>"
End if

%>

        </head>

        <body class="page-index">

<%
if CUSTOM_HEADER > "" then
    response.write "<div class=""navbar navbar-fixed-top""><div class=""navbar-inner"">"
	response.write CUSTOM_HEADER
    response.write "</div></div>"
else
%>
        <div class="navbar navbar-inverse navbar-fixed-top">
            <div class="navbar-inner">
                <div class="container-fluid">
                    <a class="brand" href="/"><div class="watchin"><div class="eyeball"><div class="iris"></div></div><div class="eyeball"><div class="iris"></div></div></div>  <%=Config.AppName%></a>
                        <div id="auth-interactions" class="pull-right">
						<button id="magnet-toggle" class="btn btn-mini btn-inverse">Fridge magnets are off!</button>
<% if false then %>
	                	<a href="/default.asp?who=tstclair" class="btn btn-error btn-mini">Log in as Tim</a>
	                	<a href="/default.asp?who=jaldridge" class="btn btn-error btn-mini">Log in as Julie</a>
	                	<a href="/default.asp?who=coursebuilderdemo" class="btn btn-error btn-mini">Log in as Demo</a>
	                	<a href="/default.asp?who=glarbl" class="btn btn-error btn-mini">Log in as Glarbl</a>
	                	<a href="/default.asp?who=apimatrix" class="btn btn-error btn-mini">Log in as MatrixAPI</a>
<%
end if
	Dim muc : muc = MyUserContainers()
	If InStr(muc,"*") > 0 Then %>
		<a target="_self" class="btn btn-info btn-small" href="/engine/pages/index/bmj.asp" title="BMJ Converter">BMJ Converter</a>
		<a class="btn btn-warning btn-small" href="/engine/pages/convert/"><i class="icon-stethoscope"></i> Elsevier converter</a>
<%
	end if
%>
                        </div>
                    </div>
                </div>
            </div>
        </div>
<% end if

Call Render_StartANewCourse_Bar()
Call Render_Search_Bar()
Call Render_Courses()

%>
<div id="word-adder">
	<div class="input-append">
	  <input class="input-large" id="appendedInputButton" type="text" placeholder="Add new words...">
	  <button class="btn" type="button" id="addAWord">Add 'em</button>
	  <button class="btn btn-inverse" type="button" id="randomiseXY">Shuffle!</button>
	</div>
</div>

<!-- #include virtual="/engine/pages/common/page_end.asp" -->