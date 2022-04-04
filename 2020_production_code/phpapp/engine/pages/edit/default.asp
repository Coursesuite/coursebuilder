<!-- #include virtual="/engine/pages/common/page_start.asp" -->
<!-- #include file="subroutines.asp" -->
<%

CheckCourse
CheckPermissions
CheckCourseName

%>
    <div class="container-fluid">
    
    	<div class="row-fluid">

    		<div class="span3">
    			<div id="cs">
		            <h2>Navigation</h2>
	            </div>
				<div class="well shrunken-padding">
					<div id="xmlTree"></div>
					<div class="nav-toolbar">
						<a href="#" class="btn btn-info" id="toXML"><i class='icon-circle-blank'></i> Nav unchanged</a>
						<a href="#" class="btn btn-danger" id="revised" title='Navigation has had revisions added - perhaps by another user? Use the difference page to consider the changes.'><i class='icon-exclamation-sign'></i></a>
					</div>
				</div>
				<h3 class="nav-warning">Warnings</h3>
				<div class="nav-warning well shrunken-padding">
					<ul id="nav-warning-text"></ul>
				</div>
	  			<h4>Nav revisions</h4>
	  			<div id='nav-revisions-block'>[No revisions yet]</div>
			</div>
			<div class="span9">
				<h2 id="page-title">Properties</h2>
				<div id="tabs">
	              <ul>
	                <li><a href="#tabs-0">Advanced</a></li>
	                <li><a href="#tabs-3">Settings</a></li>
	                <li><a href="#tabs-4">Tools</a></li>
	                <li><a href="#tabs-1">Page</a></li>
	                <li><a href="#tabs-2">Content</a></li>
	                <li><a href="#tabs-5">Quiz</a></li>
	                <li><a href="#tabs-6">Overrides</a></li>
	              </ul>
	              <div id="tabs-0"></div>
	              <div id="tabs-1"></div>
	              <div id="tabs-2"></div>
	              <div id="tabs-3"></div>
	              <div id="tabs-4"></div>
	              <div id="tabs-5"></div>
	              <div id="tabs-6"></div>
	            </div>
			</div>

		</div>

	</div>

<!-- #include virtual="/engine/pages/common/page_end.asp" -->
