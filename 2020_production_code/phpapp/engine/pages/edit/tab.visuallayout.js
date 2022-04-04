function __init__visuallayout () {

	function _getDescendantProp (obj, desc) {
		var arr = desc.split('.');
		while (arr.length && (obj = obj[arr.shift()]));
		return obj;
	}
	// routine to create the node to store a setting, in case it is undefined.
	function _createDescendantProps(obj, prop) {
		var props = prop.split('.');
		return [obj].concat(props).reduce(function(a,b,i) {
		if (a[b] === undefined) a[b] = JSON.parse("{}"); 
		return a[b];
		});
	}

	// load and apply the template for this tab
	var h = Handlebars.getCompiledTemplate("tabs/visual_layout/template",{
		layouts: _layouts,
		settings: __settings,
		lessDebug: true
	});
	var _tab = $("#tabs-3").html(h);
	
	var _template = $("#template-switcher").change(function (event) {
		$(document).trigger("entab-layout-load-template", $(this).val());
	});
	
	$("#scorm-version", "#tabs-3").click(function(event) {
		event.preventDefault();
		__settings.engine.sco = $(event.target).text();
		$(event.target).closest(".btn-group").find("button").removeClass("btn-primary");
		$(event.target).addClass("btn-primary");
		console.log(__settings);
	});

	$("#scorm-debug", "#tabs-3").click(function(event) {
		event.preventDefault();
		__settings.engine.scodebug = ($(event.target).text() == "On");
		$(event.target).closest(".btn-group").find("button").removeClass("btn-primary");
		$(event.target).addClass("btn-primary");
	});

	$("#tab-save").click(function (event) {
		event.preventDefault();
		// pretty much the same routine as "settings" tab - but we need extra processing on some items like images
		$("[data-id]", _tab).each(function (index, el) {
			var $el = $(el),
				node = $el.attr("data-id"),
				nodetype = $el.attr("data-type"),
				value = doubleQuotedString("");
				switch (nodetype) {
					case "booleanvalue":
						if ($el.is(":checked")) value = doubleQuotedString($el.val());
						break;
					case "boolean":
						value = $el.is(":checked");
						break;
					case "number":
						value = parseInt($el.val(),10);
						break;
					case "image":
						if ($("img",$el).attr("lowsrc") != "undefined") value = doubleQuotedString("<img src='" + $("img",$el).attr("lowsrc") + "' />");
						break;
					default:
						value = doubleQuotedString($el.val());
						break;
				}

				// ugly hack to copy updated value back to JSON, which is stored at runtime in __settings
				if (_getDescendantProp(__settings, node) === undefined) {
					_createDescendantProps(__settings,node);
				}
				eval("try{__settings." + node + " = " + value + "}catch(ex){console.log(ex);}");
		});

		// console.log(__settings, JSON.stringify(__settings));

		// we can just hook the same save-settings as Course Config ... since it's doing the same thing
		$.post("/engine/action.asp?id=" + _courseid + "&action=ajaxsavecoursesettings", {
			"settings": JSON.stringify(__settings) // so JQuery doesn't transform the keys during POST
		}, function (data) {
			if (data=="ok") $.jGrowl("The settings have been saved.");
		});
		return; 
	});
	
	$("#less-compile").click(function(event) {
		event.preventDefault();
		$.post("/engine/action.asp?id=" + _courseid + "&action=compileless", function (data) {
			if (data == "0") {
				$.jGrowl("app.css was compiled and is located in the file\n\n~/" + _folder + "/SCO1/Layout/less/app.css\n\nIt has NOT been linked to the course yet.");
			} else {
				$.jGrowl("LessC returned this meaningless error code: " + data);
			}
		});
	});
	
	$("#template-apply").click(function (event) {
		event.preventDefault();
		$.post("/engine/action.asp?id=" + _courseid + "&action=applylayout", {
			layout: $("#template-switcher").val()
		}, function (data) {
			__settings = data;
			$.jGrowl("The layout appears to have been saved properly!");
		})
	})
	
	$("#less-edit, #less-toggle").click(function (event) {
		event.preventDefault();
		bootbox.alert("Not yet functioning");
	});

	$(document).unbind("entab-layout-load-template").bind("entab-layout-load-template", function (event, param1) {
		//$.getJSON("/engine/action.asp?id=" + _courseid + "&action=ajaxloadcoursesettings", function (json) {
		// $.getJSON(_root + "/" + _folder + "/SCO1/Configuration/settings.json?" + Math.random(), function(data) {
			// set the template handler
			var tmpl = (param1.length) ? param1 : __settings.layout.template;
			// if ("tardproof" == tmpl) tmpl = "lucidity"; // rename
			if (_template.val() != tmpl) _template.val(tmpl); // set
			
			// load the settings layout
			var h = Handlebars.getCompiledTemplate("/layouts/" + tmpl + "/editor/template",__settings);
			// console.log("load the settings layout", h);
			$("#tab-body","#tabs-3").html(h);

			$("input[placeholder]", _tab).each(function () {
				$(this).attr("title",$(this).attr("placeholder"));
			});
			
			// don't want data-id on each radio, so we have a hidden proxy field
			$(":radio").change(function (event) {
				var inp = $(this).parent().parent().find(".radio-listener");
				if (inp.length) {
					inp.val($(this).val());
					var cfg = {"config":null};
					setJsonValue(cfg, "config." + inp.attr("data-id"), inp.val());
					updateLayoutHeaderBg(cfg);
				};
			});

			// images will be in the wrong path, so shim those
			var _sel = $("img", _tab);
			_sel.each(function (index, el) {
				var $img = $(el),
					s = _folder + "/SCO1/" + __settings.course.language + "/" + $img.attr("src");
				$img.attr("lowsrc", $img.attr("src"));
				$img.attr("src", s);
			});

			function updateColourCSS() {
				$(".pri-colour").css("background-color", __settings.layout.basecolour);
				$(".pri-colour-text").css("color", __settings.layout.basecolour);
				$(".sec-colour").css("background-color", __settings.layout.altcolour);
				$(".sec-colour-text").css("color", __settings.layout.altcolour);
				$(".ter-colour").css("background-color", __settings.layout.altcolour2);
				$(".ter-colour-text").css("color", __settings.layout.altcolour2);
				$(".toc-colour").css("background-color", __settings.layout.toccolour);
				$(".toc-colour-text").css("color", __settings.layout.toccolour);
				$(".page-colour").css("background-color", __settings.layout.pagecolour);
			}
			
			updateColourCSS();

			// update any visuals on the settings layout
			// console.log("__settings",__settings);
			updateLayoutHeaderBg(__settings);

			$("input[id$='-colour']").spectrum({
				//color: "#179082",
				preferredFormat: "hex",
				showAlpha: false,
				showPalette: true,
				hideAfterPaletteSelect: true,
				clickoutFiresChange: true,
				change: function(color,obj) {
					console.log(color.toHex());
					switch (this.getAttribute("id")) {
						case "primary-colour":
							__settings.layout.basecolour = "#" + color.toHex();
							break;
						case "secondary-colour":
							__settings.layout.altcolour = "#" + color.toHex();
							break;
						case "tertiary-colour":
							__settings.layout.altcolour2 = "#" + color.toHex();
							break;
						case "toc-colour":
							__settings.layout.toccolour = "#" + color.toHex();
							break;
						case "page-colour":
							__settings.layout.pagecolour = "#" + color.toHex();
							break;
					}
					updateColourCSS();
				},
				palette: [
					["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
					["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
					["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
					["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
					["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
					["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
					["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
					["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
				],
				showInput: true
			});			
			
			// change the nav box bg to match the colour inside primary-colour
			/*
			$("#primary-colour")
				.bind("pri-colour-update", function () {
					$(".pri-colour").css("background-color",$(this).val());
					$(".pri-text-colour").css("color",$(this).val());
				})
				.change(function() {
					$(this).trigger("pri-colour-update");
				})
				.trigger("pri-colour-update")
				.colorpicker().on('changeColor', function(ev) {
					$(this).val(ev.color.toHex()).trigger("change");
				});

			$("#secondary-colour")
				.bind("sec-colour-update", function () {
					$(".sec-colour").css("background-color",$(this).val());
					$(".sec-text-colour").css("color",$(this).val());
				})
				.change(function() {
					$(this).trigger("sec-colour-update");
				})
				.trigger("sec-colour-update")
				.colorpicker().on('changeColor', function(ev) {
					$(this).val(ev.color.toHex()).trigger("change");
				});

			$("#tertiary-colour")
				.bind("ter-colour-update", function () {
					$(".ter-colour").css("background-color",$(this).val());
					$(".ter-text-colour").css("color",$(this).val());
				})
				.change(function() {
					$(this).trigger("ter-colour-update");
				})
				.trigger("ter-colour-update")
				.colorpicker().on('changeColor', function(ev) {
					$(this).val(ev.color.toHex()).trigger("change");
				});

			$("#toc-colour")
				.bind("toc-colour-update", function () {
					$(".toc-colour").css("background-color",$(this).val());
					$(".toc-text-colour").css("color",$(this).val());
				})
				.change(function() {
					$(this).trigger("toc-colour-update");
				})
				.trigger("toc-colour-update")
				.colorpicker().on('changeColor', function(ev) {
					$(this).val(ev.color.toHex()).trigger("change");
				});

			$("#page-colour")
				.bind("page-colour-update", function () {
					$(".page-colour").css("background-color",$(this).val());
				})
				.change(function () {
					$(this).trigger("page-colour-update");
				})
				.trigger("page-colour-update")
				.colorpicker().on('changeColor', function (ev) {
					$(this).val(ev.color.toHex()).trigger("change");
				});
			*/
			
			// clicking an image location browses to select a single image for that location
			$(".browse-image", _tab).click(function(event) {
				event.stopPropagation();
				var w = window.open("/engine/pages/list/?id=" + _courseid + "&containerid=" + $(this).attr("id") + "&command=selectimage", "list", "scrolling=1,scrollbars=1,resizable=1,width=1220,height=640");
				w.focus();
			});
		//});
	});
	$(document).trigger("entab-layout-load-template", "");
}