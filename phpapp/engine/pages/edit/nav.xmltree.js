function __init__xmltree(data) {
	_current_xml = data;
	var _revisions = 0,
		_ntr;

	htmlTree.push('<ul>')
	$(_current_xml).children().each(processPages); // bam, xml -> nested ul
	htmlTree.push('</ul>');
	var $xmlTree = $("#xmlTree");
	$xmlTree.append( htmlTree.join("") );

	// now turn the list into a tree control
	$xmlTree
		.bind("loaded.jstree", function (event, data) {
			var _totalcp = 0,
				_totalcn = 0,
				_totalsp = 0,
				_warnings = [];
  			$(".nav-warning").hide();
	  	    $('#xmlTree li').each(function (index, el) {
	  	    	if (index == 0) return true;
				var $el = $(el),
					_fn = $el.attr("filename"),
					_cn = $el.attr("contribute"),
					_cp = $el.attr("contributepercentage") - 0,
					_tp = $el.attr("type");
				if (_fn && _fn.indexOf(" ") != -1) { $("<i class='icon-warning-sign' title='Filename contains spaces!'></i>").insertAfter($("a:first ins", el)); _totalsp++; };
				if (_cn && _cp && (_cn != "n")) { _totalcp += _cp; _totalcn++; }
				if (_fn.indexOf("parse")==0 || _fn.indexOf("popup")==0 || _fn.indexOf("include")==0) $el.addClass("muted");
	  	    });
	  	    if (_totalsp != 0) _warnings.push("<li>Spaces in filenames can cause problems (" + _totalsp + " pages)</li>");
	  		if (_totalcp != 100) _warnings.push("<li>" + _totalcn + " pages contribute to passing score, but percentages only add up to " + _totalcp + "%</li>");
	  		if (__settings && _totalcp < __settings.course.passingScore) _warnings.push("<li>Total score is less than passing score (" + _totalcp + "&lt;" + __settings.course.passingScore + ")</p>");
	  		if (_warnings.length) {
	  			$("#nav-warning-text").html(_warnings.join(""));
	  			$(".nav-warning").show();
	  		}
	
		})
		.jstree({
	    	"themes" : {
	    	    "theme" : "classic",
	    	    "dots" : true,
	    	    "icons" : false
	    	},
		    "plugins" : [ "themes", "html_data", "ui", "crrm", "dnd", "contextmenu" ]
		});


		$(document).unbind("navtree.revisions").bind("navtree.revisions", function () {
			$.get("/engine/action.asp", {
				"id" : _courseid,
				"action" : "history_get",
				"filename" : _folder + '/SCO1/en-us/Pages.xml'
				},
				function(json) {
					if (_ntr) clearTimeout(_ntr);
					if (_revisions>0 && json.length>0 && _revisions != json.length) {
						$("#revised").show();
					};
					_revisions = json.length;
					$("#nav-revisions-block").html(Handlebars.getCompiledTemplate("tabs/content/revisions",{
						"revision": json,
						"area": "nav"
					}));
					$("a[href='#nav_revisions-help']").click(function(event) {
						event.preventDefault();
						bootbox.alert("<h4>Pages XML history</h4><p>Every time something saves the navigation, the CURRENT"+
							" XML file is backed up to the database before the CHANGES are saved (this includes 'fix' processes"+
							" that are done on the server).</p><p>Replacing this from the"+
							" revision history is currently a manual process.</p>");
					});
					$("#nav_select_revisions").change(function(event) {
						var _label = $("option:selected", this).text();
						$.get("/engine/action.asp", {
							"action": "revision_get",
							"filename": _folder + '/SCO1/en-us/Pages.xml',
							"timestamp": $(this).val()
						}, function(data) {
							var xmlstr = _current_xml.xml ? _current_xml.xml : (new XMLSerializer()).serializeToString(_current_xml);
							var _html = Handlebars.getCompiledTemplate("tabs/content/diff",{
								"revision": data,
								"label": _label,
								"current": xmlstr
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
					_ntr = setTimeout(function () {
						$(document).trigger("navtree.revisions");
					}, 30000);
				});
		});

	// now listen for drag, right-mouse and click events
	$("#xmlTree")
		.bind("move_node.jstree remove.jstree delete_node.jstree", function(e, data) { // general structure changes
			makeDirty();
			return this;
		})
		.bind("create_node.jstree", function (e, data) {
			setDefaultAttributes(data.rslt.obj); // data.rslt is the newly created node
			makeDirty();
			return this;
		})
		.bind("rename_node.jstree", function (e, data) {
			data.args[0].attr("title", data.args[1]); // also update title attribute so double-click editing works
			makeDirty();
			return this;
		})
		.delegate("a","dblclick", function(e) {
			var _this = this;
			$.cachedScript("/engine/pages/edit/tab.pages.js").done(function() {
				__init__pages(_this);
			});
		});
	
	// pages.xml save button
	$("#toXML").click(function (e) {
		e.preventDefault();
		handleSave();
	});
	
	$(document).trigger("navtree.revisions");


}