var __courseConfigTimeout;
function __init__courseconfig() {
	// xmlsettings -> drawn like this
	// drawXmlSettings();

	var _tab = $("#tabs-0").html(Handlebars.getCompiledTemplate("tabs/course_config/template",{
		layouts: _layouts,
		lessDebug: true
	}));
	
	var _container = $("#tab-body", "#tabs-0");
	
	$("#config-save")
		.click(function (event) {
			event.preventDefault();
			$(".field-row", "#tab-body").each(function (index, el) {
				var $el = $(el),
					node = $el.attr("data-id"),
					nodetype = $el.attr("data-type"),
					inp = $el.find("input, textarea"),
					value = (nodetype == "boolean") ? inp.is(":checked") : (nodetype == "number") ? inp.val() : doubleQuotedString(inp.val());
					// value is now a typed variable of either boolean, numeric or string
					if (node.indexOf("strings")!=-1) { // special case for string sub-object which needs strings[n].text type formatting for eval
						node = node.replace(/[.](\d{1,})[.]/,"[$1].")
					}

					// ugly hack to copy updated value back to JSON, which is stored in __settings
					eval("__settings." + node + " = " + value);
			});
			__courseConfigTimeout = setTimeout(function () {
				alert("Something might have gone wrong saving the settings. Try reloading, making your changes, save again. If all else fails, log a bug.");
			}, 4567);
			$.post("/engine/action.asp?id=" + _courseid + "&action=ajaxsavecoursesettings", {
				"settings": JSON.stringify(__settings) // so JQuery doesn't transform the keys during POST
			}, function (data) {
				if (__courseConfigTimeout) clearTimeout(__courseConfigTimeout);
				if (data=="ok") $.jGrowl("The settings have been saved.");
			});
			return; 
		});

	//$.getJSON("/engine/action.asp?id=" + _courseid + "&action=ajaxloadcoursesettings", function (data) {
	//	__settings = data;

	function appendSettingRow(node,key,thispath) {
		var $row = $("<div />").addClass("field-row").attr({
			"data-id" : thispath,
			"data-type" : typeof node[key]
		}).appendTo(_container),
		$label = $("<label />").text(thispath).appendTo($row);
			switch (typeof node[key]) {
				case "string":
					if (node[key].length > 30) {
						$("<textarea />").attr({
							"class": "input-xlarge",
							"rows": 3,
							"readonly": (key === "key")
						})
						.text(node[key])
						.appendTo($row);
					} else {
						$("<input />").attr({
							"type": "text",
							"class": "input-xlarge",
							"value": node[key],
							"readonly": (key === "key")
						}).appendTo($row);
					}
					break;
					
				case "boolean":
					$("<input />").attr({
						"type": "checkbox",
						"value": node[key]
					}).attr("checked", (node[key]===true)).appendTo($row);
					break;

				case "number":
					$("<input />").attr({
						"type": "number",
						"class":"input-mini",
						"min": 0,
						"step": "any",
						"value": node[key]
					}).appendTo($row);
					break;
			}
		}

		// loop an entire json top to bottom and build paths -> root.branch.leaf
		function inside(node, path) {
			for (key in node) {
				var thispath = (path == "") ? key : [path,key].join(".");
				if (typeof node[key] === 'object') {
					inside(node[key], thispath);
				} else {
					appendSettingRow(node,key,thispath);
				}
			}
		}
		inside(__settings, "");
		$("label", _container).equaliseWidths();
		
		// load /runtimes/textplayer/Configuration/settings.json and use it to build a drop-down of possible keys, in case we need to add one
		// it only lists settings that aren't already visible. I didn't want to do a merge server-side in case it mucks up custom course layouts.
		// this is butt-ugly code because settings are stored on a js variable and eval'd to get or set the node. TODO: find a better way!
		$.getJSON("/engine/action.asp?id=" + _courseid + "&action=ajax_load_defaultsettings", function (__defaults) {
			var _select = $("<select>").attr("id","add-setting").on("change", function () {
				var $opt = $(_select).children(':selected'),
					val = $opt.val(), // type of string, determines renderer
					txt = $opt.text(); // stringified node name
				if (!val) return;
				switch (val) {
					case "string":
						eval("__settings." + txt + "=\"\";"); break;
					case "boolean":
						eval("__settings." + txt + "=false"); break;
					case "number":
						eval("__settings." + txt + "=0"); break;
				}
				var ar = txt.split(".");
				var node = eval("__settings." + ar.slice(0,ar.length-1).join(".")),
					key = ar.slice(-1).pop();
				appendSettingRow(node,key,txt);
				$("label", _container).equaliseWidths();
				$("label:last", _container).closest("div").get(0).scrollIntoView(true);
				$opt.remove(); // so you can't re-add it
				_select.val("");
			}).append($("<option/>").text("Select an option"));
			function loadjsonlist(node, path) {
				for (key in node) {
					var thispath = (path == "") ? key : [path,key].join(".");
					if (typeof node[key] === 'object') {
						loadjsonlist(node[key], thispath);
					} else if ($("#tab-body div[data-id='" + thispath + "']").length==0) {
						$("<option />").val(typeof node[key]).text(thispath).appendTo(_select);
					}
				}
			}
			loadjsonlist(__defaults,"");
			$("<div />").addClass("span6").append($("<label />").text("Add setting ").append(_select)).appendTo("#tab-toolbar");
		});
	//});
}