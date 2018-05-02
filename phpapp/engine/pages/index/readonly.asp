<!-- #include virtual="/engine/lib/page_initialise.asp" -->
<!-- #include file="subroutines.asp" -->
<%

Response.ContentType = "text/html"
Response.AddHeader "Content-Type", "text/html;charset=UTF-8"
Response.CodePage = 65001
Response.CharSet = "UTF-8"
%>
<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <title>TardProof Course Player</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="description" content="a tool that lets avide load up scorm packages and preview or publish them">
            <meta name="author" content="Tim">

            <!-- Less, before anything so it initialises quickly -->
			<link rel="stylesheet/less" href="/engine/layout/css/tardproof.less" />
			<script type="text/javascript" src="/engine/layout/js/less-1.3.3.min.js"></script>

        </head>

        <body class="page-readonly">

        <!-- Navbar
        ================================================== -->
        <div class="navbar navbar-inverse navbar-fixed-top">
            <div class="navbar-inner">
                <div class="container">
                    <a class="brand" href="/">TardProof Course Player</a>
                </div>
            </div>
        </div>
        

		<div class="container well">
	        <p class='lead'>This app requires Chrome for editing capability. You can still play existing non-archived courses.</p>
		    <div id="courselist" class="row">
		    	<% DrawCourseListRO("select * from courses where (container not in (select id from container where name = 'archive')) and (config > ' ') order by name") %>
		    </div>
		</div>

<script src="/engine/layout/js/jquery-1.9.0.min.js" type="text/javascript"></script>
<script>jQuery.migrateMute = true;</script>
<script src="/engine/layout/js/jquery-migrate-1.1.1.js" type="text/javascript"></script>
<script src="/engine/layout/js/bootstrap.min.js" type="text/javascript"></script>
<script src="/engine/layout/js/jquery-ui-1.10.0.custom.min.js" type="text/javascript"></script>

<script src="/engine/layout/third-party/jquery.layout/jquery.layout-latest.min.js" type="text/javascript"></script>

<script src="/engine/pages/common/core.js" type="text/javascript"></script>

<script src="/engine/layout/js/bootbox.js" type="text/javascript"></script>
<script src="/engine/layout/third-party/chosen/chosen.jquery.min.js" type="text/javascript"></script>

<script>
$(function () {
	
});
</script>
</body>
</html>


<!-- #include virtual="/engine/lib/page_terminate.asp" -->