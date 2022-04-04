<%
	dim shost : shost = Request.ServerVariables("SERVER_NAME")
	if instr(Request.ServerVariables("SERVER_NAME"),".server") > 0 then
		shost = "59.167.129.251:8888"
	end if
%>

<script type="text/javascript">
var _course_id = "<%=COURSE_ID%>";
var _media_path = "<%=COURSE%>/SCO1/en-us/Content/media";
var _folder = "<%=COURSE%>";
var _command = "<%=COMMAND%>";
var _selection = "<%=SELECTION%>";
var _containerid = "<%=CONTAINERID%>";
var _returnmode = "<%=RETURNMODE%>";
var _added = "<%=Request.QueryString("newfile")%>";
var _current_page = "<%=CURRENT_PAGE%>";
var _host = "<%=shost%>";
var _params = "<%=Request.QueryString%>&host=<%=shost%>";
</script>

<script src="/js/jquery-1.9.0.min.js" type="text/javascript"></script>
<script src="/js/jquery-migrate-1.1.1.js" type="text/javascript"></script>
<script src="/js/jquery-ui-1.10.0.custom.min.js" type="text/javascript"></script>
<script src="/js/bootstrap3.min.js"></script>

<script src="/js/jquery.xeyes-2.0.min.js"></script>

<script src="/js/core.js" type="text/javascript"></script>
<% If CURRENT_PAGE = "list" Then %>
<script src="/js/bootbox.4.min.js" type="text/javascript"></script>
<script src="/js/chrome_paste.js" type="text/javascript"></script>
<script src="/js/filedrop/jquery.filedrop.js" type="text/javascript"></script>
<!--script src="/engine/pages/list/pixlr.js" type="text/javascript"></script-->
<% End If %>
<script src="/engine/pages/<%=CURRENT_PAGE%>/init.js" type="text/javascript"></script>

</body>
</html>

<!-- #include virtual="/engine/lib/page_terminate.asp" -->
