<!-- #include virtual="/engine/lib/page_initialise.asp" -->
<%

Response.ContentType = "text/html"
Response.AddHeader "Content-Type", "text/html;charset=UTF-8"
Response.CodePage = 65001
Response.CharSet = "UTF-8"

'Dim page_start_auth_check : page_start_auth_check = Request.ServerVariables("HTTP_AUTHORIZATION")
'If IsNull(page_start_auth_check) Or IsEmpty(page_start_auth_check) Or page_start_auth_check = "" Then
'	response.write page_start_auth_check
'	response.end
	'Response.Redirect "/default.asp?auth=true"
'End If

If InStr(lcase(request.servervariables("HTTP_USER_AGENT")), "msie/") > 0 Then
	response.clear
	response.redirect "/engine/pages/index/readonly.asp"
End If

Dim CURRENT_PAGE_FRIENDLYNAME, BUGGR_TARGET, CUSTOM_CSS, CUSTOM_HEADER, CUSTOM_DATA

Select Case CURRENT_PAGE
	Case "index"
		CURRENT_PAGE_FRIENDLYNAME = "Courses"
		CURRENT_SMALL_PATH = Config.MOTD

	Case "edit"
	On Error Resume Next
		CURRENT_PAGE_FRIENDLYNAME = SETTINGS_JSON.course.name
		On Error Goto 0
		' CURRENT_PAGE_FRIENDLYNAME = getCourseName(MAPPED_COURSE)
		CURRENT_SMALL_PATH = ""

	case "profile"
		CURRENT_PAGE_FRIENDLYNAME = "Hi " & MyUserName & "!"
		CURRENT_SMALL_PATH = "Edit your logon type stuff here!"

	case "temp"
		CURRENT_PAGE_FRIENDLYNAME = "Testing Page"
		
	case "convert"
		CURRENT_PAGE_FRIENDLYNAME = "Elsevier SCORM Course Conversion"

	Case Else
		CURRENT_PAGE_FRIENDLYNAME = "You broke it."
		
End Select

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
			<link rel="stylesheet/less" href="/css/tardproof.less" />
			<script>var less = {"env":"development"}, poll = 66666;</script>
			<script type="text/javascript" src="/js/less-1.3.3.min.js"></script>
			<!--script>less.watch();</script-->
            <link rel="shortcut icon" href="/favicon.png">
            
<%
if CURRENT_PAGE = "edit" Then

	response.write "            <link rel='stylesheet' type='text/css' href='/js/tagit/jquery.tagit.css'>"

	Dim wallpaper, wpimage, bgsize
	on error resume next
	wpimage = SETTINGS_JSON.headerleft.get("content")
	bgsize = SETTINGS_JSON.layout.header.get("imagesize")
	on error goto 0
	If bgsize = "" Then bgsize = "cover"
	if wpimage > "" Then
		wallpaper = COURSE & "/SCO1/en-us/" & Replace(Replace(wpimage, "<img src='", ""), "' />", "")
		if instr(wallpaper,"undefined") > 0 then
			wallpaper = ""
		end if
	end if
	If wallpaper > "" then
	If Config.FileSys.FileExists(Server.MapPath(wallpaper)) Then
%>
            <style>
	            body.page-edit .jumbotron {
					background-image: url(<%=wallpaper%>) !important;
					background-size: <%=bgsize%> !important;
					background-repeat: no-repeat !important;
				}
            </style>
<%
	end if
	end if
End If

if CUSTOM_CSS > "" Then
	response.write "<style>" & CUSTOM_CSS & "</style>"
End if

%>

<% if false then %>		<script>
		  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
		
		  ga('create', 'UA-68767047-5', 'auto');
		  ga('send', 'pageview');
		
		</script><% end if %>

<!-- Piwik -->
<script type="text/javascript">
  var _paq = _paq || [];
  /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  (function() {
    var u="//stats.coursesuite.ninja/";
    _paq.push(['setTrackerUrl', u+'piwik.php']);
    _paq.push(['setSiteId', '4']);
    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
    g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'piwik.js'; s.parentNode.insertBefore(g,s);
  })();
</script>
<!-- End Piwik Code -->

        </head>

        <body class="page-<%=CURRENT_PAGE%>">

        <!-- Navbar
        ================================================== -->
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
                    <a class="brand" href="/"><div class="watchin"><div class="eyeball"><div class="iris"></div></div><div class="eyeball"><div class="iris"></div></div></div> <%=Config.FunAppName%></a>
                	<% If CURRENT_PAGE = "schmedit" Then %>
						<a href="/" class="btn btn-inverse btn-small"><i class='icon-circle-arrow-left'></i> Home</a>
                	<% End If %>
                        <div id="auth-interactions" class="pull-right">
<%
' <a target="_blank" class="btn btn-warning" href="http://buggr.coursesuite.ninja/" title="Found a problem? Log it in Buggr!" id="buggr"><i class="icon-bug"></i> Buggr! Helpdesk</a>
	Dim muc : muc = MyUserContainers()
	If InStr(muc,"*") > 0 Then %>
		<a target="_self" class="btn btn-info" href="/engine/pages/index/bmj.asp" title="BMJ Converter">BMJ Converter</a>
		<a class="btn btn-warning" href="/engine/pages/convert/"><i class="icon-stethoscope"></i> Elsevier converter</a>
<%
	end if
%>
                	<% if false then %>
							<!--a class="btn btn-inverse tooltip" href="/engine/pages/profile/" title='Manage your profile'><i class="icon-user"></i> <%=MyUserName %></a-->
                    <% end if %>
                        </div>
                    </div>
                </div>
            </div>
        </div>
<% end if %>
        
<% if false then %>
        <header id="bug-tracker-block">
	        <div id="loading-animation"><i class="icon-refresh icon-spin icon-light"></i></div>
        </header>
<% end if %>
        <!-- Subhead
        ================================================== -->
        <header class="jumbotron subhead" id="overview">
            <div class="container-fluid">
            	<div class="row-fluid"><div class="span7">
                <h1><%=CURRENT_PAGE_FRIENDLYNAME%></h1>
                <small><%=COURSE%><%=CURRENT_SMALL_PATH%><%
                If CURRENT_PAGE = "convert" Then
                	response.write "Drag the elseiver zip onto the big circle to begin the conversion"
                ElseIf CURRENT_PAGE = "edit" Then
                	response.write " <a target='" & replace(COURSE,"/","_") & "' href='" & COURSE & "/SCO1/index.html' title='Launch course without applying layout'><i class='icon-external-link'></i></a>"
                	response.write " <small>Hash: " & md5er.hash(COURSE_ID) & "</small>"
                End If
                %></small>
                </div><div class="span5">
					<div class="pull-right">
                <% If CURRENT_PAGE = "index" Then %>
					<button class="btn" id="create_new_course"><i class="icon-plus-sign icon-2x"></i><br>New course</button>
					<a href="#upModal" role="button" class="btn" data-toggle="modal" style="color:#666"><i class="icon-upload icon-2x"></i><br>Upload course</a>
					  <a href="https://guide.coursesuite.ninja/coursebuildr/catalogue-landing-page" class="btn btn-primary" title="Documentation" target="_blank"><i class='icon-question-sign icon-2x'></i><br/><small>Help</small></a>
				<% ElseIf CURRENT_PAGE = "edit" Then %>
					  <a href="/engine/action.asp?ID=<%=COURSE_ID%>&action=download&OptimiseIsChecked=1" class="btn btn-inverse" title="Download" id="hrefDownload" target="download"><i class='icon-download icon-3x'></i><br/><small>Zip</small></a>
					  <a href="/engine/action.asp?ID=<%=COURSE_ID%>&action=play" class="action-check-shift btn btn-success" title="Play" target="course<%=COURSE_ID%>"><i class='icon-play-circle icon-4x'></i><br/><small>Play</small></a>
					  <a href="https://guide.coursesuite.ninja/coursebuildr/course-landing-page" class="btn btn-primary" title="Documentation" target="_blank"><i class='icon-question-sign icon-4x'></i><br/><small>Help</small></a>
					  <a href="/" class="btn btn-danger" title="Close editor"><i class='icon-power-off icon-3x'></i><br/><small>Close</small></a><br />
					  <label title="Use with care, and check the download carefully; this is a work in progress"><input type="checkbox" id="cbOptimise" checked> Optimise ZIP</label>
                <% End If %>
					</div>
					<div class="fun-stuff">
						<button id="magnet-toggle">Fridge magnets are off!</button>
					</div>
                </div></div>
            </div>
        </header>
        
