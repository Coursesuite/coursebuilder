function __init__overrides() {
	
	// load and apply the template for this tab
	var h = Handlebars.getCompiledTemplate("tabs/templates/template",{
		id: _courseid,
		overridden: _template_is_overriden,
		layouts: _layouts,
		settings: __settings,
		copyfrom: typeof _layouts_copyfrom === 'undefined' ? '' : _layouts_copyfrom
	});
	var _tab = $("#tabs-6").html(h);
	
	var _overrides = $(".template-filetree-container").jstree({
    	"themes" : {
    	    "theme" : "classic",
    	    "dots" : true,
    	    "icons" : true
    	},
	    "json_data" : {
		    "ajax": {
			    "url": "/engine/action.asp",
			    "data": function(n) {
				    return {
					    "id": _courseid,
					    "action": "override_browse",
					    "path": n === -1 ? "" : n.attr("path")
				    }
			    }
		    }
		},
		"cookies": {
			"save_opened" : "jstree_o_" + _courseid,
			"save_selected": "jstree_s_" + _courseid,
			"auto_save": true
		},
	    "plugins" : [ "themes","json_data","ui","cookies" ]
	});
	_overrides.delegate("a", "dblclick", function(event) {
		var node = $(event.target).closest("li");
		if (node.attr("rel") === "default") {
			edit_file(node.attr("path"));
		} else if (node.attr("rel") === "folder") {
			show_upload_form(node.attr("path"));
		}
	});
	
	function show_upload_form(path) {
		$(".template-codemirror-container").html(Handlebars.getCompiledTemplate("tabs/templates/upload", {
			id: _courseid,
			file: path
		}));
	}	
	
	function edit_file(path) {
		
		var _file_mode = (function() {
				if (path.indexOf(".less")!==-1) {
					return '"text/x-less"';
				} else if (path.indexOf(".txt")!==-1) {
					return '{name: "handlebars", base: "text/html"}';
				} else if (path.indexOf(".woff")!==-1||path.indexOf(".cur")!==-1||path.indexOf(".eot")!==-1||path.indexOf(".ttf")!==-1||path.indexOf(".ico")!==-1||path.indexOf(".swf")!==-1||path.indexOf(".otf")!==-1) {
					return 'file';
				} else if (path.indexOf(".png")!==-1||path.indexOf(".gif")!==-1||path.indexOf(".jpg")!==-1||path.indexOf(".svg")!==-1) {
					return 'image';
				} else if (path.indexOf(".css")!==-1) {
					return '"text/css"';
				} else if (path.indexOf(".js")!==-1) {
					return '"text/javascript"';
				} else {
					return '{name: "htmlmixed"}';
				}
			})(),
			_virtual_path = (function () {
				return "/layouts/." + md5(_courseid) + (path.replace(/\|/g,'/'));
			})();
		if (_file_mode === "image" || _file_mode === "file") {

			$(".template-codemirror-container").html(Handlebars.getCompiledTemplate("tabs/templates/" + _file_mode, {
				id: _courseid,
				file: path,
				virtual_path: _virtual_path,
				templates: []
			}));
		} else {
			// console.log("_virtual_path",_virtual_path);
			$.get(_virtual_path, function(_file_contents) {
				$(".template-codemirror-container").html(Handlebars.getCompiledTemplate("tabs/templates/codemirror", {
					content: _file_contents,
					mode: _file_mode,
					id: _courseid,
					file: path,
					templates: _alllayouts
				}));
				$("button[data-action='overrides-diff']").on("click", function (el) {
					el.preventDefault();
					doDiff(el.target.dataset.file, el.target.dataset.mode);
 				});
 				$("select#overrides-diff").on("change", function (el) {
	 				if (el.target.selectedIndex === 0) return;
	 				el.preventDefault();
	 				doDiff(el.target.dataset.file, el.target.dataset.mode, el.target.value);
	 				el.target.selectedIndex = 0;
 				});
			}, "text"); // important to note it as text to stop jquery trying to parse the result
		}
	}
	
	function doDiff(file,mode,folder) {
		$.get("/engine/action.asp", {
			"action": "override_diff",
			"file": file,
			"mode": mode,
			"id": _courseid,
			"folder": folder
		}, function(data) {
			var _html = Handlebars.getCompiledTemplate("tabs/templates/filediff",{
				"revision": data.revision,
				"current": data.current
			});
			if (data.notfound) {
				alert("File " + file.replace(/\|/g,'/') + " has no matching source to compare to");
			} else {
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
			}
		
		});
	}

}