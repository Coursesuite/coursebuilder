var CompiledModels = (function() {
	models = [];
	[].forEach.call(document.querySelectorAll("script[type='text/x-handlebars-template']"),function(node) {
		var source = node.innerHTML,
			dataSource = false,
			initSource = null,
			initAfterSource = null;
		var doc = document.implementation.createHTMLDocument("temp");
		doc.documentElement.innerHTML = source;
		if (source.indexOf("data-action-source")!==-1) { // load this source once the node is rendered
			dataSource = doc.documentElement.querySelector("[data-action-source]").dataset.actionSource.replace(":id", CourseBuildr.ContextId);
			if (source.indexOf("data-source-init")!==-1) { // run this function after the source is loaded
				initAfterSource = doc.documentElement.querySelector("[data-source-init]").dataset.sourceInit;
			}
		}
		if (source.indexOf("data-init")!==-1) { // run this function after the node is rendered
			initSource = doc.documentElement.querySelector("[data-init]").dataset.init;
		}
		models[node.getAttribute("id")] = {
			"datasource": dataSource,
			"template": Handlebars.compile(source),
			"init": initSource,
			"initAfterSource": initAfterSource
		};
	});
	return models;
})();

var CurrentModel = {};
var SelectionMode = "single";
var Destination = (function() {
	return location.pathname.replace(/^\/|\/$/g, '').split("/").pop();
})();







/*
	UI
	Relates to the runtime media functions such as switching tabs and selecting media and returning results ...
	Returns public methods
	protected functions are variables
	private functions are defined
*/
var UI = (function(window,document,$,undefined) {

	// regexp for matching ninjitsu; param[0] is the command, param[1] is the value array
	var _re = /\{(\w+)\ (?:(.*)\|?)+\}/g;

	// our global variables
	var _timeout;
	var _loading = false;
	var $workspace = $("#media-action-workspace-tiles");
	var _currentCommand = null;
	var _current_classifiers = [{"key":"Class", "value":"box-shadow"}, {"key":"Effect","value":"fade"}]; // default
	var _editor_id = Destination;
	var _starting_condition = {"executed":false};

	// get an array of javascript objects that match a named property value
	function __get__objects(obj, key, val) {
	    var objects = [];
	    for (var i in obj) {
	        if (!obj.hasOwnProperty(i)) continue;
	        if ( Array.isArray(obj[i]) && obj[i].indexOf(val) !== -1 ) {
		        objects.push(obj);
	        } else if (typeof obj[i] == 'object') {
	            objects = objects.concat(__get__objects(obj[i], key, val));
	        } else
	        //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not) or the key matches and the object is an array that contains the value
	        if (i == key && obj[i] == val || i == key && val == '') { //
	            objects.push(obj);
	        } else if (obj[i] == val && key == ''){
	            //only add if the object is not already in the array
	            if (objects.lastIndexOf(obj) == -1){
	                objects.push(obj);
	            }
	        }
	    }
	    return objects;
	}

	// call a named function, which can either be in "UI.Class.Function" format, or just "do_thing".
	// params MUST be an array, even if there is only one value
	function __call__named__function(string_name, param_array) {
		if (string_name.indexOf(".")!==-1) {
			return string_name.split(/\./g)
				            .reduce((o, k) => o[k], window)
				            .apply(this, param_array);
		} else {
			return string_name.call(param_array);
		}
	}

	// set the window launch parameters into global variables (fires pre startup)
	_set_params = function (field_name, current_value) {
		_editor_id = field_name;

		_startup_value = decodeURIComponent(atob(current_value.replace(',','=').replace('_','/').replace('-','+')).split('').map(function(c) {
	        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
	    }).join(''));
	    if (_startup_value.length) {
		    var result = _re.exec(_startup_value);
		    var command = result[1],
		    	params = result[2].split("|"),
		    	classifierValue = "";
		    if (params[0].indexOf(".")===-1) {
			    classifierValue = params.shift();
		    }
			_starting_condition["selected"] = params;
			_starting_condition["classifier"] = classifierValue;
			_starting_condition["command"] = command;
	    }
	}

	// set the starting parameters which might be used later after other actions complete
	_startup = function() {
		// do we want to start up with a specific command selected?
		var filt = ":first", action = "images";
		if (_starting_condition.command) {
			filt = "[data-command='" + _starting_condition.command + "']";
			if (!$("a", "#media-action-selection").filter(filt).length) filt = ":first"; //reset
			switch (_starting_condition.command) {
				case "link":
					action = "files";
					break;
			}
		}
		$("a[data-action='command']").filter(filt).get(0).click();
		$("[data-action='action'][data-value='" + action + "']").get(0).click();
	}

	// set the selection after a tab's SOURCE is loaded, e.g. ACTION.SHOWMEDIA.HBT -> ajax-load-data -> UI.Selection.Start()
	_set_initial_selection = function () {
		if (_starting_condition.executed===false) {
			_starting_condition.executed = true; // prevents re-firing after changing actions
			if (_starting_condition.classifier) { // previously selected classifier
				var node = __get__objects(window.CourseBuildr.Media.Actions[_starting_condition.command].classifiers,"items",_starting_condition.classifier)[0]; // classifier contains an item that matches our expectation; this is that node
				if (node) {
					var cn = __get__objects(_current_classifiers,"key",node.label)[0];
					cn["value"] = _starting_condition.classifier;
				}
			}
			if (_starting_condition.selected && _starting_condition.selected.length) { // previously selected images/files
				$container = $("#media-action-workspace-tiles");
				_starting_condition.selected.forEach(function(value) {
					var $node = $("figure[data-name='" + value + "']",$container);
					if ($node.length) UI.Selection.Toggle($node);
				});
			}
		}
	}

	// ensures you can't select any more than the required number of tiles
	_validate_selection_mode = function () {
		var selection = $("figure.selected","#media-action-workspace-tiles");
		if (SelectionMode === "single" && selection.length > 1) for (var i=selection.length;i>0;i--) $(selection[i]).removeClass("selected");
		if (SelectionMode === "two" && selection.length > 2) for (var i=selection.length;i>1;i--) $(selection[i]).removeClass("selected");
	}

	// select an activity from the left hand menu
	_switch_command = function(action) {
		var node = window.CourseBuildr.Media.Actions[action];
		_currentCommand = node;
		SelectionMode = node.selection;
		UI.Selection.Validate();
		UI.Selection.ReBuild();
	}

	// ensure the center spinner shows and dissapears as we switch media functions
	_spinner = function(state) {
		_loading = state;
		if (state) {
			$workspace.addClass("loading");
		} else {
			$workspace.removeClass("loading");
		}
	}

	// ensure the property save spinner and subsequent toast appears and disappears
	_savespinner = function (start) {
		if (start) {
			$("#save-status").addClass("visible loading"); // > .saved is not visible
		} else {
			$("#save-status").removeClass("loading").find(".saved").addClass("visible");
			setTimeout(function(){$("#save-status").removeClass("visible").find(".saved").removeClass("visible");},2500);
		}
	}

	// change page function (e.g. upload or browse)
	_switch_tab = function (action) {
		if (_loading) return;
		var id = "media-action-" + action.replace(/\./,'-') + "-hbt"; // foo.bar => media-foo-bar-hbt
		var tab = CompiledModels[id]; // tab properties object
		var $output = $("#media-action-workspace-tiles").html(""); // start afresh
		if (tab.datasource) { // we need to load a model
			UI.Decoration.Loading(true);
			$.get(window.CourseBuildr.BaseUrl + "/" + tab.datasource).done(function(result) {
				UI.Decoration.Loading(false);
				CurrentModel = result;
				$output.html(tab.template(CurrentModel));
				if (tab.initAfterSource) {
					__call__named__function(tab.initAfterSource, []);
				}
			});
		} else { // there was no model
			$output.html(tab.template({"context":window.CourseBuildr.ContextId}));
		}
		if (tab.init) { // data-init="UI.Init.DropFile" or data-init="myFunctionName"
			__call__named__function(tab.init, [$output,id,tab]);
		}
	}

	/* change the sort order using an animation for visual feedback
	 * adapted from https://codepen.io/osublake/pen/gaQNLK?editors=1111
	 * sorting using flex order via https://github.com/Sjeiti/TinySort
	 */
	_change_order = function (order) {
		var nodes = document.querySelectorAll("#media-action-workspace-tiles>section>figure"),
			boxes = [],
			ease = Power1.easeInOut,
			total = nodes.length;
		for (var i = 0; i < total; i++) {
			var node = nodes[i];
			TweenLite.set(node, { x: 0, y:0 });
			boxes[i] = {
				transform: node._gsTransform,
				x: node.offsetLeft,
				y: node.offsetTop,
				node
			};
		}
		tinysort(nodes,{data:order,forceStrings:true,useFlex:true})
			.forEach(function(elm,i) {
				var box = boxes[i],
					lastX = box.x, lastY = box.y;
				box.x = box.node.offsetLeft;
				box.y = box.node.offsetTop;
				if (lastX === box.x && lastY === box.y) return;
				var x = box.transform.x + lastX - box.x;
				var y = box.transform.y + lastY - box.y;
				TweenLite.fromTo(box.node, 0.75, { x, y }, { x: 0, y: 0, ease });
			});
	}

	// tick a box and then build the resulting return command (if required)
	_toggle_selection = function (node) {
		var $node = $(node);
		$node.toggleClass("selected");
		if (SelectionMode==="single") {
			$node.siblings().removeClass("selected");
		} else if (SelectionMode==="two") {
			var friends = $node.siblings(".selected");
			if (friends.length > 1) for (var i=friends.length;i>0;i--) $(friends[i]).removeClass("selected");
		}
		if ($node.hasClass("selected")) {
			var model = __get__objects(CurrentModel,"name",$node.attr("data-name"))[0];
			var properties = [];
			properties.push(CompiledModels["media-props-details-hbt"].template(model));
			properties.push(CompiledModels["media-props-metadata-hbt"].template(model));
			$("#media-action-workspace-properties").html(properties.join(""));
		}
		UI.Selection.Build($workspace.find("figure.selected"));
	}

	// shortcut to building the return command
	_rebuild_command = function() {
		UI.Selection.Build($workspace.find("figure.selected"));
	}

	// Startup script called by ACTION.UPLOAD.HBT
	_init_dropfile = function (node,id,obj) {
		$("form",node).dropzone({
			"acceptedFiles": "image/*,application/pdf,text/*",
			"dictDefaultMessage": "Drop files or click here to upload",
			"init": function() {
				var totalFiles = 0,
					completeFiles = 0,
					files = [];
				this.on("addedfile", function(file) {
					totalFiles += 1;
				});
				this.on("removedfile", function(file) {
					totalFiles -= 1;
				});
				this.on("complete", function(file) {
					completeFiles +=1;
					files.push(file);
					if (completeFiles===totalFiles) { // switch to the most appropriate tab
						var image = false;
						for (var i=0;i<files.length;i++) {
							var file = files[i];
							if (file.type.indexOf("image/")!==-1) image = true;
						}
						if (image) {
							$("a[href='#action.showmedia']", "#tabs").get(0).click();
						} else {
							$("a[href='#action.showfiles']", "#tabs").get(0).click();
						}
					}
				});
			}
		});
	}

	// build the visual command editor and any possible classifier handlers
	_build_command = function(selection) {
		if (_currentCommand === null) return;
		var str = [], files = [];
		str.push("<span>{</span><b>" + _currentCommand.name + "</b> ");
		for (var i=0;i<_currentCommand.classifiers.length;i++) {
			var v = __get__objects(_current_classifiers,"key", _currentCommand.classifiers[i].label)[0].value || "++error++";
			var href = " <a href='#!' onclick='UI.Selection.Classifier(this)'"
						+" data-label='" + _currentCommand.classifiers[i].label + "'"
						+" data-values='" + _currentCommand.classifiers[i].items.join("|") + "'"
						+">" + v + "</a>"
						+"<span>|</span>";
			str.push(href);
		}
		selection.each(function(index,element) {
			files.push(element.getAttribute("data-name"));
		});
		str.push(files.join("<span>|</span>"));
		str.push("<span>}</span>");
		$("#command-output").html(str.join(""));
	}

	// routine to return the final command back to the editor then close the media overlay
	_finalise_action = function() {
		var final_command = $("#command-output").text().replace(/\-\|/g,'').replace(/\s{2,}/g,' ') || '';
		parent.replace_selection(_editor_id, final_command);
		parent.retriggerHighlighter(_editor_id);
		parent.MediaOverlay.Close();
	}

	// hide the pop-over classifier box
	_hide_classifier = function () {
		$(".classifier select").off(); // turn off listener
		$(".classifier").remove();
	}

	// show the pop-over classifier box
	_show_classifier = function(href) {
		if ($(".classifier").length) {
			_hide_classifier();
			return;
		}
		var $href = $(href),
			_items = $href.attr("data-values").split("|"),
			_label = $href.attr("data-label"),
			_current = __get__objects(_current_classifiers,"key", _label),
			_template = CompiledModels["media-props-classifier-hbt"].template;
		document.body.appendChild(document.createRange().createContextualFragment(_template({
			"id": "classifier",
			"label": _label,
			"items": _items,
			"current": _current[0].value
		})));
		var div = document.querySelector("div.classifier"),
			rekt = href.getBoundingClientRect();
		div.style.left = (rekt.left + (rekt.width/2) - (div.offsetWidth / 2)) + "px";
		$("select", div).on("change",function() {
			var obj = $(this),
				value = obj.val(),
				label = obj.attr("data-label");
			var storage = __get__objects(_current_classifiers,"key", label);
			storage[0].value = value;
			UI.Selection.ReBuild();
			_hide_classifier();
		});
	}

	function _do_preview(node) {
		var $node = $(node);
		console.dir(node);
	}

	// global button/link clicking consumer
	$(document).on("click", "[data-action]", function (e) {
		var tgt = e.target.closest("[data-action]"); // in case of bubbling
		e.preventDefault();
		switch (tgt.dataset.action) {

			case "action": // change the tile selector
				$(tgt).addClass("active").siblings("button").removeClass("active");
				_switch_tab( tgt.dataset.value );
				break;

			case "sort": // change the sorting of tiles
				$(tgt).addClass("active").siblings("button").removeClass("active");
				_change_order( tgt.dataset.value );
				break;

			case "command": // change the data command being returned by the modal
				$(tgt).addClass("active").siblings("a").removeClass("active");
				_switch_command( tgt.dataset.value );
				break;

			case "finalise": // insert the final value back into the opening editor
				_finalise_action();
				break;

			case "close": // close window without saving changes
				parent.MediaOverlay.Close();
				break;

			case "select": // select a tile
				_toggle_selection(tgt);
				break;
		}

	});

	// MAIN ENTRY POINT
	return {
		Selection: {
			Toggle: _toggle_selection,
			Validate: _validate_selection_mode,
			Build: _build_command,
			ReBuild: _rebuild_command,
			Classifier: _show_classifier,
			Start: _set_initial_selection
		},
		Init: {
			DropFile: _init_dropfile,
			SetParams: _set_params,
			Start: _startup
		},
		Decoration: {
			Loading: _spinner,
			Saving: _savespinner
		}
	}

})(window,document,jQuery);

$(function () {
	UI.Init.Start();

	$(document).on("change", "form.attachment-details :input", function(e) {
		UI.Decoration.Saving(true);
		$.post(window.CourseBuildr.Route + '/media/meta/' + window.CourseBuildr.ContextId, $("form.attachment-details").serialize()).done(function(result) {
			UI.Decoration.Saving(false);
			console.log("nothing has really saved yet, but I heard", result);
		});
	});

});