<% if CURRENT_PAGE = "index" Then %>
<footer class="logo-copyright-help">
    <p><a href="https://guide.coursesuite.ninja/coursebuildr" target="_blank">Documentation</a></p>
	<p><a href="https://www.coursesuite.ninja/" target="_blank"><img src="/engine/layout/img/coursesuite_252x45_white.png"></a></p>
	<p>&copy; 2012 - <%=Year(now)%></p>
</footer>
<% End If %>

<!-- #include file="modal_namehelp.asp" -->
<!-- #include file="modal_easyedit.asp" -->
<!-- #include file="modal_pilledit.asp" -->
<%
' include file="modal_jsonedit.asp"
' include file="modal_bugadder.asp"
' include file="modal_help.asp"
' include file="modal_notes.asp"
%>

<script type="text/handlebars" id="editor-template">
	<div class='editor-wrapper'>
		{{#if savable}}
		<div class='optional-toolbar flexible'>
			<div class='grids-toolbar flex'><ul class='nav nav-pills' id='page_grid'>
				<li class='pull-left disabled'><a href='#'>Page Grid:</a></li>
				{{#each grids}}
					<li{{#compare value ../grid}} class='active'{{/compare}}><a href='#' data-grid='{{value}}'>{{{label}}}</a></li>
				{{/each}}
			</ul></div>
			<div class="save-toolbar">
				<button id='content-save' class='btn btn-primary'><i class='icon-save'></i> Save</button>
			</div>
		</div>
		{{/if}}
		<div class='toolbar-buttons'>
			<div class='btn-group'>
			<button data-command='//insert-media//' class='btn'><i class='icon-picture'></i> Add media...</button>
			{{#each purpose}}{{#each group}}{{#each commands}}
			{{#if icon}}{{#unless hidden}}<button data-command='{{command}}' class='btn' title='{{text}}'><i class='{{icon}}'></i></button>{{/unless}}{{/if}}
			{{/each}}{{/each}}{{/each}}
			</div>
		</div>
		<div class='editor-surface-wrapper flexible'>
			<div class='flex' id='ta-dom'></div>
			<div class='command-block'><select size="20">
			{{#each purpose}}
			{{#each group}}
				<optgroup label='{{label}}' class='formatter-group'>
					{{#each commands}}
					<option value='{{command}}'{{#if easyedit}} data-easy-edit='true'{{/if}}{{#if pilledit}} data-pill-edit='true'{{/if}}{{#compare nestable false}} data-nestable='false'{{/compare}}>{{text}}</option>
					{{/each}}
				</optgroup>
				<optgroup label='' class='spacer'></optgroup>
			{{/each}}
			{{/each}}
		</select>
		</div>
	</div>
</script>

<script type="text/javascript">
<%
response.write "var _uid = """ & MyUserName & """;" & vbNewLine
response.write "var _folder = """ & COURSE & """;" & vbNewLine
response.write "var _courseid = " & CLng(COURSE_ID) & ";" & vbNewLine
response.write "var _selected = '';" & vbnewline
response.write "var _layouts = [""" & Join(IO.ArrayOfSubFolders(Config.LayoutsPath), """,""") & """];" & vbNewLine
response.write "var _containers = [""" & Join(MyContainers(Server.MapPath("/courses")), """,""") & """];" & vbNewLine
If CURRENT_PAGE = "edit" Then
	response.write "var __settings = " & JSON.stringify(SETTINGS_JSON) & ";" & vbNewLine
	response.write "var _editing_file = '';" & vbNewLine

	Dim tmpl_is_overridden : tmpl_is_overridden = IO.TemplateIsOverriden(CLng(COURSE_ID))
	response.write "var _template_is_overriden = " & lcase(tmpl_is_overridden) & ";" & vbNewLine
	if not tmpl_is_overridden Then
		Response.Write "var _layouts_copyfrom = " & JSON.stringify(IO.GetOverriddenCourses("." & md5er.hash(CLng(COURSE_ID))).courses) & ";" & vbNewLine
	End If
End If

%>
(function(){
        var i;
        var cookiesArr;
        var cItem;

        cookiesArr = document.cookie.split("; ");
        for (i = 0; i < cookiesArr.length; i++) {
            cItem = cookiesArr[i].split("=");
            if (cItem.length > 0 && cItem[0].indexOf("ASPSESSIONID") == 0) {
                deleteCookie(cItem[0]);
            }
        }

        function deleteCookie(name) {
            var expDate = new Date();
            expDate.setTime(expDate.getTime() - 86400000); //-1 day
            var value = "; expires=" + expDate.toGMTString() + ";path=/";
            document.cookie = name + "=" + value;
        }
    })()
</script>

<script src="/js/jquery-1.9.0.min.js" type="text/javascript"></script>
<script>jQuery.migrateMute = true;</script>
<script src="/js/jquery-migrate-1.1.1.js" type="text/javascript"></script>
<script src="/js/bootstrap.min.js" type="text/javascript"></script>
<script src="/js/jquery-ui-1.10.0.custom.min.js" type="text/javascript"></script>
<!-- script src="/engine/layout/third-party/jQuery-UI-FileInput/js/enhance.min.js" type="text/javascript"></script -->
<!-- script src="/engine/layout/third-party/jQuery-UI-FileInput/js/fileinput.jquery.js" type="text/javascript"></script -->

<!-- script src="/engine/layout/third-party/jquery.layout/jquery.layout-latest.min.js" type="text/javascript"></script -->
<!-- script src="/engine/layout/third-party/tagit/tag-it.js" type="text/javascript"></script -->

<script src="/js/core.js" type="text/javascript"></script>
<script src="/js/jquery.xeyes-2.0.min.js"></script>

<script src="/js/bootbox.js" type="text/javascript"></script>
<script src="/js/bootstrap-colorpicker.js" type="text/javascript"></script>
<script src="/js/bootstrap-slider.js" type="text/javascript"></script>
<script src="/js/chosen/chosen.jquery.min.js" type="text/javascript"></script>
<script src="/js/filedrop/jquery.filedrop.js" type="text/javascript"></script>
<script src="/js/chrome_paste.js" type="text/javascript"></script>

<% If CURRENT_PAGE = "edit" Then %>
<script src="/js/tagit/tag-it.js" type="text/javascript"></script>
<script src="/js/diff_match_patch.js" type="text/javascript"></script>
<script src="/js/jquery.pretty-text-diff.js" type="text/javascript"></script>
<script src="/js/jquery.cookie.js" type="text/javascript"></script>
<script src="/js/jstree/jquery.jstree.js" type="text/javascript"></script>
<script src="/js/shortcut.js" type="text/javascript"></script>
<script src="/js/jquery.tinysort.min.js"></script>

<script src="/js/jquery.highlighttextarea.lite.js"></script>
<script src="/js/spectrum.js"></script>

<!-- codemirror stuff -->
<link rel="stylesheet" href="/js/codemirror-5.33.0/lib/codemirror.css">
<link rel="stylesheet" href="/js/codemirror-5.33.0/theme/ambiance.css">
<link rel="stylesheet" href="/js/codemirror-5.33.0/addon/hint/show-hint.css">

<script type="text/javascript" src="/js/codemirror-5.33.0/lib/codemirror.js"></script>
<script type="text/javascript" src="/js/codemirror-5.33.0/addon/fold/xml-fold.js"></script>
<script type="text/javascript" src="/js/codemirror-5.33.0/addon/edit/matchtags.js"></script>
<script type="text/javascript" src="/js/codemirror-5.33.0/addon/edit/matchbrackets.js"></script>
<script type="text/javascript" src="/js/codemirror-5.33.0/addon/selection/active-line.js"></script>
<script type="text/javascript" src="/js/codemirror-5.33.0/addon/hint/show-hint.js"></script>
<script type="text/javascript" src="/js/codemirror-5.33.0/addon/hint/css-hint.js"></script>
<script type="text/javascript" src="/js/codemirror-5.33.0/addon/mode/multiplex.js"></script>
<script type="text/javascript" src="/js/codemirror-5.33.0/addon/mode/simple.js"></script>
<script type="text/javascript" src="/js/codemirror-5.33.0/mode/xml/xml.js"></script>
<script type="text/javascript" src="/js/codemirror-5.33.0/mode/javascript/javascript.js"></script>
<script type="text/javascript" src="/js/codemirror-5.33.0/mode/css/css.js"></script>
<script type="text/javascript" src="/js/codemirror-5.33.0/mode/handlebars/handlebars.js"></script>
<script type="text/javascript" src="/js/codemirror-5.33.0/mode/htmlmixed/htmlmixed.js"></script>
<% End If %>
<script src="/engine/layout/third-party/jGrowl/jquery.jgrowl.js"></script>
<script src="/engine/pages/<%=CURRENT_PAGE%>/init.js" type="text/javascript"></script>

</body>
</html>


<!-- #include virtual="/engine/lib/page_terminate.asp" -->
