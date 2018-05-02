function __init__content() {
	
	// used contain the toolbar, now is detached in tabs/content/toolbar
	var _tab = $("#tabs-2").html(Handlebars.getCompiledTemplate("tabs/content/template", {}));

	// create variables to hold references to the filename, list element (in case selection changes while editing)
	var $editing_item = $("a.jstree-clicked","#xmlTree").closest("li"),
		$tab_body = $("#tab-body","#tabs-2");

	_editing_file = _folder + "/SCO1/en-us/Content/" + $editing_item.attr("fileName");
		
	// makes the editing control
	function makeTheEditAreaBox(value) {
		
		var page_editor = $("<textarea id='edit-area'></textarea>")
    		.text(value)
			.appendTo($tab_body)
			.attachEditor();
			
		enable_drag_image_to_editor("edit-area");

	}

	// ctrl-s to save
	// http://stackoverflow.com/questions/93695/best-cross-browser-method-to-capture-ctrls-with-jquery/93836#93836
	shortcut.add("Ctrl+S",function() {
	    $("#content-save").trigger("click");
	});

	// load the html file into an editor; create a dummy file if there's a 404
	$.get(_editing_file + "?cache=" + Math.random(),
		{},
        function(data) {
        	makeTheEditAreaBox(data);
		})
		.error(function() {
			// fill the new page with some hipster spam!
			$.get("/engine/action.asp?action=ajax_get_hipster", function (data) {
				makeTheEditAreaBox("Oops! " + $editing_item.attr("fileName") + " was empty. Here's some nonsense instead.\n\n" + data);
			});
			// DYK there's a service for hipster spam?
			//$.getJSON('http://hipsterjesus.com/api/?type=hipster-centric&html=false&paras=1', function(data) {
			//	makeTheEditAreaBox("Untitled page\n\n" + data.text.replace(/\n/g,"\n\n"));
			//});
        });
	
	$(document).unbind("content.revisions").bind("content.revisions", function () {
		$.get("/engine/action.asp", {
			"id" : _courseid,
			"action" : "history_get",
			"filename" : _editing_file
			},
			function(jsn) {
				// console.log (typeof jsn);
				var o = {
					"revision": jsn,
					"area": "content"
				};
				var h = Handlebars.getCompiledTemplate("tabs/content/revisions", o);
				// console.log(o, h);
				$("#content-revisions-block").html(h);
				$("a[href='#content_revisions-help']").click(function(event) {
					event.preventDefault();
					bootbox.alert("<h4>File history</h4><p>Every time someone saves the file, the CURRENT"+
						" file is backed up to the database if/before the CHANGES are saved. You can use this" +
						" dropdown to show previous saved versions.</p><p>Selecting one of these will" +
						" show you the results in an overlay, from which you can copy what you need manually." +
						" It will not overwrite the current file.</p><p>You can also see the text difference" +
						" between the <i>selected version</i> and <i>current version</i>.</p>");
				});
				$("#content_select_revisions").change(function(event) {
					var _label = $("option:selected",this).text();
					$.get("/engine/action.asp", {
						"action": "revision_get",
						"filename": _editing_file,
						"timestamp": $(this).val()
					}, function(data) {
						var _html = Handlebars.getCompiledTemplate("tabs/content/diff",{
							"revision": data,
							"label": _label,
							"current": $("#edit-area").val()
						});
						bootbox.bigwindow(_html, function () {
							// containers look backwards but we want to compare revision as the old to current as the new
							$("#revision-diff").prettyTextDiff({
								"cleanup": true,
								"debug": false,
								"originalContainer": "#revision",
								"changedContainer": "#current",
								"diffContainer": "#diff-text"
							});
						});
					});
					this.selectedIndex = 0;
					
				});
			});
	}).trigger("content.revisions");
	
	_tab.on("click", "#content-save", function (e) {
		e.preventDefault();
		$.post("/engine/action.asp?id=" + _courseid + "&action=ajaxSaveFile", {
			filename: _editing_file,
			content: $("#edit-area").val()
		}, function (data) {
			$.jGrowl("Ok, <b>" + _editing_file.substring(_editing_file.lastIndexOf("/") +1) + "</b> has been updated");
			$(document).trigger("content.revisions");
		});
	}).on("click", "#page_grid li:not(.disabled) a", function (event) {
		event.preventDefault();
		$("#page_grid li:not(.disabled)").removeClass("active");
		$(this).parent().addClass("active");
		$editing_item.attr("template", $(this).attr("data-grid"));
		makeDirty(true);
	});
}

