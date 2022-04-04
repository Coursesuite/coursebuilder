<!-- #include virtual="/engine/lib/page_initialise.asp" -->

<%
Response.ContentType = "text/html"
Response.AddHeader "Content-Type", "text/html;charset=UTF-8"
Response.CodePage = 65001
Response.CharSet = "UTF-8"

Dim ACTION, FILE

FILE = LCase(request.querystring("file"))

	select case COMMAND
		case "image", "images", "zoomimage", "slideshow", "selectimage", "clickimage", "gridbg", "columnbg", "pagebg", "rightimages"
			ACTION = "image"
		case "xml"
			ACTION = "quiz"
		case "glossary"
			ACTION = "glossary"
		case "ref"
			ACTION = "reference"
		case else
			If InStr(ACTION, "image") > 0 Or InStr(ACTION,"bg") > 0 Then
				ACTION = "image"
			Else
				ACTION = "file"
			End If
	end select

%>
<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <title><%=Config.AppName%>: <%=ACTION%> browser</title>
            <meta name="author" content="Tim">

			<link href="//netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.min.css" rel="stylesheet">
			<link rel="stylesheet/less" type="text/css" href="/css/list.less" />
			<script>var less = {"env":"development","poll":99999};</script>
			<script type="text/javascript" src="/js/less-1.3.3.min.js"></script>
			<script>less.watch();</script>
			<!-- link href="/engine/layout/third-party/dropzone/dropzone.css" rel="stylesheet" -->

            <!-- link href="<%=BASE_PATH%>layout/css/tardproof.popup.css" rel="stylesheet" -->
            <link href="/css/list.css" rel="stylesheet">

        </head>

        <body id="list" class="<%=ACTION%>">
        
        <nav>
        	<h1><%=ACTION%> browser</h1>
        	<div id="item-feedback">0 items selected</div>
        	<ul id="actions">
        		<li class="dropdown">
        			<a data-action="resize" data-toggle="modal" data-target="#myModal"
 ><i class="icon-resize-small"></i> Resize</a>
        		</li>
        		<% If ACTION = "image" Then %>
        		<li><a data-action="edit"><i class="icon-edit"></i> Edit</a></li>
        		<% End If %>
        		<li><a data-action="rename"><i class="icon-random"></i> Rename</a></li>
        		<li><a data-action="delete"><i class="icon-trash"></i> Delete</a></li>
        		<li><a data-action="refresh"><i class="icon-refresh"></i> Refresh</a></li>
        	</ul>
        	<% if COMMAND <> "manage" Then %>
        	<button id="done" type="button">Done</button>
        	<% End If %>
        </nav>
        
 