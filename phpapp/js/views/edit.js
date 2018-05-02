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
			dataSource = doc.documentElement.querySelector("[data-action-source]").getAttribute("data-action-source").replace(":id", CourseBuildr.ContextId);
			if (source.indexOf("data-source-init")!==-1) { // run this function after the source is loaded
				initAfterSource = doc.documentElement.querySelector("[data-source-init]").getAttribute("data-source-init");
			}
		}
		if (source.indexOf("data-init")!==-1) { // run this function after the node is rendered
			initSource = doc.documentElement.querySelector("[data-init]").getAttribute("data-init");
		}
		models[node.getAttribute("id")] = {"datasource": dataSource, "template": Handlebars.compile(source), "init": initSource, "initAfterSource": initAfterSource};
	});
	return models;
})();

var CurrentModel = {};

Handlebars.registerHelper('compare', function (lvalue, operator, rvalue, options) {
	var operators, result;
	if (arguments.length < 3) {
	    throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
	}
	if (options === undefined) {
	    options = rvalue;
	    rvalue = operator;
	    operator = "===";
	}
	operators = {
	    '==': function (l, r) { return l == r; },
	    '===': function (l, r) { return l === r; },
	    '!=': function (l, r) { return l != r; },
	    '!==': function (l, r) { return l !== r; },
	    '<': function (l, r) { return l < r; },
	    '>': function (l, r) { return l > r; },
	    '<=': function (l, r) { return l <= r; },
	    '>=': function (l, r) { return l >= r; },
	    '~': function (l, r) { return (r&&l&&r.toString().indexOf(l.toString()) != -1); },
	    '!~': function (l, r) { return (r&&l&&r.toString().indexOf(l.toString()) == -1); },
	    'typeof': function (l, r) { return typeof l == r; },
	    'is': function (l, r) {
	    	if (r === 'empty') { // returns true IF empty
		    	return ((typeof l == 'undefined') || (l.toString().length == 0));
	    	}
	    	if (typeof l == 'undefined') return false;
		    switch (r) {
			    case 'numeric': return $.isNumeric(l); break;
			    case 'boolean': return (l.toString()=='true' || l.toString()=='false'); break;
			    case 'string': return (l.toString().length != 0); break;
				case 'array': return Object.prototype.toString.call(l) === '[object Array]'; break;
			    default: return false;
		    }
	    },
	    'morethanone': function(node,property) {
		    var c = 0;
		    for (var i=0;i<node.length;i++) {
			    if (node[i].hasOwnProperty(property)) c++;
		    }
		    return (c>0);
	    }
	};
	if (!operators[operator]) {
	    throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
	}
	result = operators[operator](lvalue, rvalue);
    if (result) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

/*
	UI
	Relates to the runtime media functions such as switching tabs and selecting media and returning results ...
	Returns public methods
	protected functions are variables
	private functions are defined
*/
var UI = (function(window,document,$,undefined) {

	// Startup script called by ACTION.UPLOAD.HBT
	_init_dropfile = function (node,id,obj) {
		$("form",node).dropzone({
			"acceptedFiles": "*.zip",
			"dictDefaultMessage": "Drop Ninja Zip Packages or click here to upload",
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

	// ensure the center spinner shows and dissapears as we switch media functions
	_spinner = function(state) {
		_loading = state;
		if (state) {
			$workspace.addClass("loading");
		} else {
			$workspace.removeClass("loading");
		}
	}

	// construct
	_startup = function() {
		alert("start the interface");
	};

	// finalise
	_finalise = function() {
		alert("do a thing with the data we imported")
	}

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
			if (_starting_condition.selected.length) { // previously selected images/files
				$container = $("#media-action-workspace-tiles");
				_starting_condition.selected.forEach(function(value) {
					var $node = $("figure[data-name='" + value + "']",$container);
					if ($node.length) UI.Selection.Toggle($node);
				});
			}
		}
	}


	// change page function (e.g. upload or browse)
	_switch_tab = function (action) {
		if (_loading) return;
		var id = "media-" + action.replace(/\./,'-') + "-hbt"; // foo.bar => media-foo-bar-hbt
		var tab = CompiledModels[id]; // tab properties object
		var $output = $("#workspace").html(""); // start afresh
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
			//if (tab.init.indexOf(".")!==-1) {
			//	var result = tab.init.split(/\./g)
			//	            .reduce((o, k) => o[k], window)
			//	            .apply(this, [$output,id,tab]);
			//} else {
			//	var result = tab.init.call([$output,id,tab]);
			//}
		}
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

	// MAIN ENTRY POINT
	return {
		Action: {
			SetContext: _switch_tab,
		},
		Init: {
			DropFile: _init_dropfile,
			Start: _startup,
			Finalise: _finalise
		},
		Decoration: {
			Loading: _spinner
		}
	}


})(window,document,jQuery);


Dropzone.options.myAwesomeDropzone = {
	init: function() {
		this.on("success", function(file, response) {
			console.log("success", response);
		});
	}
}