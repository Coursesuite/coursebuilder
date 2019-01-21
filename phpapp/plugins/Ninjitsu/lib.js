
// determine what to do once a selection is made in the textarea editor's commands drop down
function doEditCommand(obj,region) {
	var $obj = $(obj),
		command = $obj.val(),
		pillEdit = $obj.find(":selected").attr("data-pill-edit") == "true";
	if (typeof region == 'undefined') region = "edit-area";
	if (!command) return;
	var selection = get_selection(region); // returns object {start, end, length, text}
	var justcommand = command.split(" ")[0].replace(/\{/,"");

	// unset selection from the control that told us what to do
	obj.selectedIndex = -1;

	// prompt user if the command requires text selected first
	if ((command.indexOf("%selection%")!=-1) && (selection.length==0)) {
		alert("You need to select some text first...");
		return;
	}
	if (pillEdit) {

		show_dialogue_pilledit(justcommand, region);

	} else if (command.indexOf("%ref%") != -1) {

		show_dialogue_references(region);

	} else if (command.indexOf("%term%") != -1) {

		show_dialogue_glossary(region);

	} else if (command.indexOf("zoom") != -1) {

		popWindow({
			command: "zoomimage",
			areaid: region
		});

	} else if (command.indexOf("{splitimage ") != -1) {

		popWindow({
			command: "splitimage",
			areaid: region
		});

	} else if (command.indexOf("{overstretch ") != -1) {

		popWindow({
			command: "overstretch",
			areaid: region
		});

	} else if ((command.indexOf("%image%") != -1) && (command.indexOf("{fullscreenvideoimage ") == -1)) {

		popWindow({
			command: justcommand,
			areaid: region,
			selection: selection.text
		});

	} else if (command.indexOf("{clickimage ") != -1) {

		popWindow({
			command: "clickimage",
			areaid: region
		});

	} else if (command.indexOf("%images%") != -1) {

		popWindow({
			command: "rightimages",
			areaid: region
		});

	} else if (command.indexOf("%anchor%") != -1) {

		popWindow({
			command: "glossary",
			areaid: region,
			selection: selection.text
		});

	} else if (command.indexOf("{parse ") != -1) {

		popWindow({
			command: "parse",
			areaid: region,
			selection: selection.text
		});

	} else if (command.indexOf("{popup ") != -1) {

		popWindow({
			command: "popup",
			areaid: region,
			selection: selection.text
		});

	} else if (command.indexOf("{popuptext ") != -1) {

		popWindow({
			command: "popuptext",
			areaid: region,
			selection: selection.text
		});

	} else if (command.indexOf("{load ") != -1) {

		popWindow({
			command: "load",
			areaid: region,
			selection: selection.text
		});

	} else if (command.indexOf("{parse ") != -1) {

		popWindow({
			command: "parse",
			areaid: region,
			selection: selection.text
		});

	} else if (command.indexOf("%linkurl%") != -1) {

		var size = 0,
			linkurl = "";
		var str = $("<div />")
				.append("<p>Paste in the video link (e.g. YouTube url, Vimeo url, TED Talks Url, etc):</p>")
				.append("<form><div class='controls'><input id='dialogue_videourl' class='input-block-level' type='text' placeholder='Paste in the video url here'></div></form>");
		var buttons = [{
			    "label" : "Ok",
			    "class" : "btn-primary",
			    "callback": function() {
			    	if (command.indexOf("{fullscreenvideoimage ") == -1) {
				    	nOEmbed($("#dialogue_videourl").val(), function(url) {
					    	replace_selection(region, "{fullscreenvideo " + url + "}");
						});
			    	} else {
				    	nOEmbed($("#dialogue_videourl").val(), function(url) {
					    	replace_selection(region, "{fullscreenvideo VideoButtonLabel|" + url + "}");
				    		setTimeout(function () { // give the textarea a bit of time to think
					    		// set_selection_to_string(region, "VideoButtonLabel");
								popWindow({
									command: "image",
									areaid: region,
									selection: set_selection_to_string(region, "VideoButtonLabel") // get_selection(region)
								});
							}, 234);
						});
			    	}
			    }
		}];
		if (command.indexOf("{inlinevideo ") != -1) {
			buttons = [];
			buttons.push({
				"label": "Cancel",
				"class": "pull-left"
			});
			buttons.push({
			    "label" : "560x315",
			    "class" : "btn-info",
			    "callback": function() {
			    	if ($("#dialogue_videourl").val())
			    	nOEmbed($("#dialogue_videourl").val(), function(url) {
				    	replace_selection(region, "{inlinevideo 1|" + url + "}");
			    	});
			    }
			});
			buttons.push({
			    "label" : "640x360",
			    "class" : "btn-info",
			    "callback": function() {
			    	if ($("#dialogue_videourl").val())
			    	nOEmbed($("#dialogue_videourl").val(), function(url) {
				    	replace_selection(region, "{inlinevideo 2|" + url + "}");
			    	});
			    }
			});
			buttons.push({
			    "label" : "853x480",
			    "class" : "btn-info",
			    "callback": function() {
			    	if ($("#dialogue_videourl").val())
			    	nOEmbed($("#dialogue_videourl").val(), function(url) {
				    	replace_selection(region, "{inlinevideo 3|" + url + "}");
			    	});
			    }
			});
			buttons.push({
			    "label" : "1280x720",
			    "class" : "btn-info",
			    "callback": function() {
			    	if ($("#dialogue_videourl").val())
			    	nOEmbed($("#dialogue_videourl").val(), function(url) {
				    	replace_selection(region, "{inlinevideo 4|" + url + "}");
			    	});
			    }
			});
		}
		bootbox.dialog(str, buttons);

	} else if (command.indexOf("%url%") != -1) {

		popWindow({
			command: function() {
				return command.split(" ")[0].replace(/\{/,"");
			},
			areaid: region,
			selection: selection.text
		});

	} else if (command.indexOf("%link%") != -1) {

		var r = window.prompt("Paste in the URL to link to", "http://www.google.com/");
		if (r != null) {
			replace_selection(region, command.replace("%link%", r).replace("%selection%", selection.text));
		}

	} else if (command.indexOf("%xml%") != -1) {

		popWindow({
			command: "xml",
			areaid: region
		});

	} else if (command.indexOf("%effect%") != -1) { // requires an effect type; ask user in a modal dialogue (built on-the-fly)

		var _sel = $("<select />").attr("id", "fxSel");
		$.each(_fx, function(index,value) { _sel.append($("<option />").attr("value",value).text(value)) });
		$("#fx").remove();
		$("<div />").attr({
				id: "fx",
				title: "Choose an effect"
			})
			.append($("<label />").attr("for","fxSel").text("Effect:"))
			.append(_sel)
			.appendTo("body")
			.dialog({
				modal: true,
            	buttons: {
                	Ok: function() {
						popWindow({
							command: "slideshow",
							areaid: region,
							selection: $("#fxSel").val()
						});
                    	$(this).dialog("close");
                	},
                	Cancel: function() {
                		$(this).dialog("close");
                	}
            	}
           });

	} else if (command.indexOf("%selection%") != -1) {

		replace_selection(region, command.replace("%selection%",selection.text));

	} else if (command == "//convertBLOCK//") {

		$.post("/engine/action.asp?id=" + window.CourseBuildr.Course.id + "&action=ajax_convertblock", {
			filename: _editing_file,
			content: get_selection(region).text
		}, function (filename) {

			var selNode = $("a.jstree-clicked","#xmlTree").closest("li").attr("id"),
				node = $("#xmlTree").jstree("create", node, "last", filename.replace(".html","").replace(".txt",""), null, false);
			setDefaultAttributes(node);
			node.attr("title",filename.replace(".html","").replace(".txt","")); // overwrite defaults
			node.attr("fileName",filename);

			replace_selection(region, "{parse " + filename + "}");

		});

	} else if (command == "//convertAUTO//") {

		var val = $("#" + region).val();

		// headings
		val = val.replace(/\<h([1-6])\>/gi,"{tag h$1|").replace(/\<\/h[1-6]\>/gi,"} ");

		// breaks
		val = val.replace(/\<br([\ ]?[\/]?)\>/gi,"{\/}");

		// bold, italic, underline
		val = val.replace(/\<([biu])>/gi,"{tag $1|").replace(/\<\/[biu]\>/gi,"} ");

		val = val.replace("<p class=\"centered\">","{centered ");
		val = val.replace("<a href=\"Content/popup","{popup popup");
		val = val.replace("\" rev=\"overlay\" class=\"rp-button-dialogue\">\n","|");
		// TODO: work out a few more of these
		$("#" + region).val(val).trigger("input");

	} else if (command == "//stripHTML//") {

		var val = $("#" + region).val(),
			out = [],
			inp = [];
		if (val.indexOf("</head>")!=-1) val = val.substring(val.indexOf("</head>") + 7);
		inp = val.replace(/<[^>]*>?/g, "").split("\n"); // strip html, then split on lines

		$.map(inp, function (val) {
			val = $.trim(val).replace("&nbsp;"," ").replace("&bull;", "*");
			//if (val.substring(0,1)=="{" && val.substring(val.length-1)=="}") val = "~@~" + val + "~@~"; // lines containing only commands
			if (val.length) out.push(val);
		});
		$("#" + region).val($.trim(out.join("\n\n").replace(/\n{3,}/g,"\n\n"))).trigger("input"); // doublespace, but no more than that

	} else if (command == "//stripHEAD//") {

		var val = $("#" + region).val();
		if (val.indexOf("</head>")!=-1) val = val.substring(val.indexOf("</head>") + 7).replace("</html>","");
		if (val.indexOf("<body")!=-1) val = val.replace("</body>","").replace("<body>","");
		$("#" + region).val($.trim(val)).trigger("input");

	} else if (command == "//insert-media//") {
		MediaOverlay.Show(region, selection.text);

	} else {

		// catch everything else and just dump the command value onto the selection / cursor
		replace_selection(region, command);

	}

	retriggerHighlighter(region);

}

// method (called by doEditCommand and from image selection popup) to re-bind the colouring after the content changes
function retriggerHighlighter(region) {
	$("#" + region).highlightTextarea("highlight");
}

// popup window to allow user to select one or more things
/*
data = {
	folder: _folder,
	command: command,
	selection: foo,
	containerid: blah,
	returnmode: blah,
	areaid: fofo
} */
function popWindow(data) {
	data.id = window.CourseBuildr.Course.id;
	var qs = $.param(data);
	PopupCenter("/engine/pages/list/?" + qs, "list", 1024, 644);
	// window.open("/engine/pages/list/?" + qs, "list", "scrolling=1,scrollbars=1,resizable=1,width=1024,height=644").focus();
}

function PopupCenter(url, title, w, h) {
    // Fixes dual-screen position                         Most browsers      Firefox
    var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
    var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

    width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    var left = ((width / 2) - (w / 2)) + dualScreenLeft;
    var top = ((height / 2) - (h / 2)) + dualScreenTop;
    var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left + ', resizable=1,scrollbars=1,scrolling=1');

    // Puts focus on the newWindow
    if (window.focus) {
        newWindow.focus();
    }
}

function openWindow(command, selection, containerid, returnmode) {
	var data = {
		"id": window.CourseBuildr.Course.id,
		"command": command,
		"selection": escape(selection),
		"containerid": escape(containerid),
		"returnmode": escape(returnmode),
		"areaid": escape(areaid)
	};
	// id=" + window.CourseBuildr.Course.id + "&command=" + command + "&selection=" + escape(selection) + "&containerid=" + escape(containerid) + "&returnmode=" + escape(returnmode) + "&areaid=" + escape(areaid)
	var qs = $.param(data);
	PopupCenter("/engine/pages/list/?" + qs, "list", 1220, 640);
	//var w = window.open("/engine/pages/list/?" + qs,"list","scrolling=1,scrollbars=1,resizable=1,width=1220,height=640");
	//w.focus();
}



// turns <ul><li>node<ul><li>sub-node</li></ul></ul> into <page>node<page>node</page></page>
// then sends data to server for further processing & saving
// function handleSave() {
// 	var copy = $("#xmlTree").clone();
// 	$("a", copy).each(function(index,node) {
// 		$(node).closest("li").attr("title", $(node).text());
// 	});
// 	$("a,ins", copy).remove();
// 	$("ul,li", copy).removeAttr("class").removeAttr("style");
// 	var html = $(copy).html()
// 		.replace(/\&nbsp\;/g,"")
// 		.replace(/\&amp\;/g,"&")
// 		.replace(/<ul>/g,"")
// 		.replace(/<\/ul>/g,"</page>")
// 		.replace(/<li\s/g,"<page ")
// 		.replace(/><\/li>/g," />")
// 		.replace(/<\/li>/g,"</page>")
// 		.replace(/<\/li\ \/>/g,"</page>")
// 		.replace(/<\/page\ \/>/g,"</page>")
// 		.replace(/\ id\=\"_/g," id=\"");


// 	$.post("/engine/action.asp?id=" + window.CourseBuildr.Course.id + "&action=ajaxSavePagesXML", {
// 		xml: html
// 	}, function (data) {
// 		$.jGrowl("Ok, Pages.xml has been saved");
// 		// $(document).trigger("navtree.revisions");
// 	});

// 	// unset dirty
// 	makeClean();
// }

// // runs through a <page> node in pages.xml and turns it into a <li> node that jsTree can then make a treeview out of
// function processPages(obj){
// 	var t = $(this);
// 	htmlTree.push("<li")
// 	if (!t.attr("title")) {
// 		htmlTree.push (" class='jstree-open'>");
// 	} else {
// 		htmlTree.push(" title='" + t.attr("title").safeForXml() + "'");
// 		htmlTree.push(" fileName='" + t.attr("fileName").safeForXml() + "'");
// 		htmlTree.push(" type='" + t.attr("type") + "'");
// 		htmlTree.push(" id='_" + t.attr("id") + "'");
// 		htmlTree.push(" contribute='" + t.attr("contribute") + "'");
// 		htmlTree.push(" contributeScore='" + t.attr("contributeScore") + "'");
// 		htmlTree.push(" contributePercentage='" + t.attr("contributePercentage") + "'");
// 		htmlTree.push(" nav='" + t.attr("nav") + "'");
// 		htmlTree.push(" template='" + t.attr("template") + "'>");
// 	}
// 	htmlTree.push("<a href='#'" + (_selected==t.attr("id") ? " class='jstree-hovered jstree-clicked'" : "") + ">" + ((t.attr("title")) ? t.attr("title") : "Course") + "</a>")
//     if( t.children().length>0 ){
//         htmlTree.push('<ul>');
//         t.children().each(processPages);
//         htmlTree.push('</ul>');
//     }else{
//        htmlTree.push('</li>');
//     }
// }

// helpers; dealing with selections in a textarea is different for each browser (of course).
// http://stackoverflow.com/questions/401593/understanding-what-goes-on-with-textarea-selection-with-javascript
function get_selection(the_id) {
    var e = document.getElementById(the_id);

    if('selectionStart' in e) { //Mozilla and DOM 3.0
        var l = e.selectionEnd - e.selectionStart;
        if (e.value.substr(e.selectionStart, l).endsWith(" ")) { e.selectionEnd--; l--;} // trim trailing space, update length
        return { start: e.selectionStart, end: e.selectionEnd, length: l, text: e.value.substr(e.selectionStart, l) };
    } else if(document.selection) { //IE
        e.focus();
        var r = document.selection.createRange();
        var tr = e.createTextRange();
        var tr2 = tr.duplicate();
        tr2.moveToBookmark(r.getBookmark());
        tr.setEndPoint('EndToStart',tr2);
        if (r == null || tr == null) return { start: e.value.length, end: e.value.length, length: 0, text: '' };
        var text_part = r.text.replace(/[\r\n]/g,'.'); //for some reason IE doesn't always count the \n and \r in the length
        var text_whole = e.value.replace(/[\r\n]/g,'.');
        var the_start = text_whole.indexOf(text_part,tr.text.length);
        return { start: the_start, end: the_start + text_part.length, length: text_part.length, text: r.text };
    }
    //Browser not supported
    else return { start: e.value.length, end: e.value.length, length: 0, text: '' };
}

function replace_selection(the_id,replace_str) {
    var e = document.getElementById(the_id);
    selection = get_selection(the_id);
    var start_pos = selection.start;
    if (replace_str.endsWith(" ")) replace_str = replace_str.trim();
    var end_pos = start_pos + replace_str.length;

    if (navigator.userAgent.indexOf("chrome") > -1) { // firefox has a bug https://bugzilla.mozilla.org/show_bug.cgi?id=1220696 - can't insertText twice; also doesn't yet support initTextEvent

	    if (document.createEvent) {
			var event = document.createEvent('TextEvent');
			event.initTextEvent('textInput', true, true, null, replace_str);
			e.dispatchEvent(event);
			set_selection(the_id,start_pos,end_pos);

	    } else if (document.execCommand) {
			set_selection(the_id,start_pos,end_pos);
	    	document.execCommand("insertText", false, replace_str);
	    }

	} else {
    	e.value = e.value.substr(0, start_pos) + replace_str + e.value.substr(selection.end, e.value.length);
		set_selection(the_id,start_pos,end_pos);
    }
    return {start: start_pos, end: end_pos, length: replace_str.length, text: replace_str};
}

function set_selection_to_string(the_id, to_find) {
    var el = document.getElementById(the_id),
    	val = el.value,
    	start_pos = val.indexOf(to_find);
    set_selection(the_id, start_pos, start_pos + to_find.length);
   	// el.setSelectionRange(start_pos, start_pos + to_find.length); // end pos is not length, its caret position
   	return get_selection(the_id);
}

function set_selection(the_id,start_pos,end_pos) {
    var e = document.getElementById(the_id);

    if ('selectionStart' in e) { //Mozilla and DOM 3.0
        e.focus();
        e.selectionStart = start_pos;
        e.selectionEnd = end_pos;
    } else if(document.selection) { //IE
        e.focus();
        var tr = e.createTextRange();

        //Fix IE from counting the newline characters as two seperate characters
        var stop_it = start_pos;
        for (i=0; i < stop_it; i++) if( e.value[i].search(/[\r\n]/) != -1 ) start_pos = start_pos - .5;
        stop_it = end_pos;
        for (i=0; i < stop_it; i++) if( e.value[i].search(/[\r\n]/) != -1 ) end_pos = end_pos - .5;

        tr.moveEnd('textedit',-1);
        tr.moveStart('character',start_pos);
        tr.moveEnd('character',end_pos - start_pos);
        tr.select();
    }
    makeDirty();
    return get_selection(the_id);
}

function wrap_selection(the_id, left_str, right_str, sel_offset, sel_length) {
    var the_sel_text = get_selection(the_id).text;
    var selection =  replace_selection(the_id, left_str + the_sel_text + right_str );
    if(sel_offset !== undefined && sel_length !== undefined) selection = set_selection(the_id, selection.start +  sel_offset, selection.start +  sel_offset + sel_length);
    else if(the_sel_text == '') selection = set_selection(the_id, selection.start + left_str.length, selection.start + left_str.length);
    return selection;
}

if(typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, '');
  }
}

if(typeof String.prototype.endsWith !== 'function') {
	String.prototype.endsWith = function(suffix) {
    	return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};
}

if (typeof String.prototype.extn !== 'function') {
	String.prototype.extn = function (inverse) {
		return (inverse || false) ? this.slice(0, Math.max(0, this.lastIndexOf(".")) || Infinity) : this.slice((Math.max(0, this.lastIndexOf(".")) || Infinity) + 1);
	}
}

// routine to detect selecting a keyword and expanding the selection to encompass the whole tag, which
// might contain nested tags. please feel free to go cross-eyed.
function checkIfWeNeedToExpandTheSelection(el) {
	var val = el.value,
		sel = "", op=[],cl=[],se=0;
	if (val.slice(el.selectionStart-1,el.selectionStart)=="{" && (val.slice(el.selectionEnd,el.selectionEnd+1)==" "||val.slice(el.selectionEnd,el.selectionEnd+1)=="\n")) {
		el.selectionStart = el.selectionStart - 1;
		el.selectionEnd = val.indexOf("}", el.selectionEnd) + 1;
		sel=val.slice(el.selectionStart,el.selectionEnd);
		op=sel.split("{");cl=sel.split("}");
		while(op.length>cl.length) {
			se=val.indexOf("}", el.selectionEnd) + 1;
			if(se<el.selectionStart)se=val.length;if(se>val.length)se=val.length;
			el.selectionEnd = se;
			sel=val.slice(el.selectionStart,el.selectionEnd);
			op=sel.split("{");cl=sel.split("}");
		}
	}
}

function pasteIntoInput(el, text) {
    el.focus();
    if (typeof el.selectionStart == "number") {
        var val = el.value;
        var selStart = el.selectionStart;
        el.value = val.slice(0, selStart) + text + val.slice(el.selectionEnd);
        el.selectionEnd = el.selectionStart = selStart + text.length;
    } else if (typeof document.selection != "undefined") {
        var textRange = document.selection.createRange();
        textRange.text = text;
        textRange.collapse(false);
        textRange.select();
    }
}

function allowTabChar(el) {
    $(el).keydown(function(e) {
        if (e.which == 9) {
            pasteIntoInput(this, "\t");
            return false;
        }
    });

    // For Opera, which only allows suppression of keypress events, not keydown
    $(el).keypress(function(e) {
        if (e.which == 9) {
            return false;
        }
    });
}

function find_in_json(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(find_in_json(obj[i], key, val));
        } else if (i == key && obj[key] == val) {
            objects.push(obj);
        }
    }
    return objects;
}

$.fn.extend( {
	uniqueId: ( function() {
		var uuid = 0;
		return function() {
			return this.each( function() {
				if ( !this.id ) {
					this.id = "ui-id-" + ( ++uuid );
				}
			} );
		};
	} )(),

	removeUniqueId: function() {
		return this.each( function() {
			if ( /^ui-id-\d+$/.test( this.id ) ) {
				$( this ).removeAttr( "id" );
			}
		} );
	},

	// tab normally changes focus, but we want it to draw a tab character
	allowTabChar: function() {
	    if (this.jquery) {
	        this.each(function() {
	            if (this.nodeType == 1) {
	                var nodeName = this.nodeName.toLowerCase();
	                if (nodeName == "textarea" || (nodeName == "input" && this.type == "text")) {
	                    allowTabChar(this);
	                }
	            }
	        })
	    }
	    return this;
	},

	// put hilighting on the textarea, and then bind the toolbar buttons and interactions
	attachEditor: function () {
	    this.each(function () {
		    if (this.nodeType == 1) {
			    if (this.nodeName.toLowerCase() == "textarea") {
			    	var $textarea = $(this), _loaded = this.dataset.isEditor||false, _id = $textarea.uniqueId().attr("id");
		    		if (_loaded === false) {

			    		var where = this.parentNode,
			    			data = JSON.parse(JSON.stringify(window.CourseBuildr.Toolbar)); // nodes are byref and we would cause side-effects, so we have to deep clone

			    		data["savable"] = (_id === "edit-area");

			    		// hide things that don't play nice when nested
			    		if (!data.savable) { // e.g. pill-edit
			    			var nodes = find_in_json(data, "nestable", false);

			    			// to do, find out the command mode of the editor
			    			// and compare the nestable node values to the command to see if we are nesting this command
			    			// also
			    			// we can't include commands that themselves cause pilledit

			    			[].forEach.call(nodes,function(obj){obj["hidden"]=true;});
			    		}

			    		var dom = document.createRange().createContextualFragment(Handlebars.getRuntimeTemplate("plugins-ninjitsu-edit-template-hbt", data)); // html -> dom nodes
			    		dom.querySelector("#ta-dom").appendChild(this); // move node
			    		where.appendChild(dom);

			    		this.dataset.isEditor = true; // so we can't double-init

				    	$textarea
							.attr("wrap","soft")
							.allowTabChar()
				    		.on("select", function(event) {
					    		checkIfWeNeedToExpandTheSelection(this);
				    		})
				    		.highlightTextarea()
				    		.autoLoad();

				    	// list of all possible commands in a select box (right)
			    		$(".command-block select", where).on("change", function() {
							doEditCommand(this, _id);
			    		});

			    		// buttons on the toolbar actually trigger the select box
			    		$(".editor-local-toolbar button[data-command]", where).on("click", function(e) {
				    		e.preventDefault();
				    		$(".command-block select", where).val($(this).attr("data-command")).trigger("change");
			    		});

		    		}
				}
		    }
	    });
	    return this;
	},

	// load a javascript file and cache it and execute it
	cachedScript: function(url, options) {
	    options = $.extend(options || {}, {
	        dataType: "script",
	        cache: true,
	        url: url
	    });
	    return $.ajax(options);
	},

	// fit text into a container
	fitText: function(kompressor, options) {
	    var compressor = kompressor || 1
	      , settings = $.extend({
	        'minFontSize': Number.NEGATIVE_INFINITY,
	        'maxFontSize': Number.POSITIVE_INFINITY
	    }, options);
	    return this.each(function() {
	        var $this = $(this);
	        var resizer = function() {
	            $this.css('font-size', Math.max(Math.min($this.width() / (compressor * 10), parseFloat(settings.maxFontSize)), parseFloat(settings.minFontSize)));
	        };
	        resizer();
	        $(window).on('resize', resizer);
	    });
	},

	sortablejs: function (options) {
        var retVal,
                args = arguments;

        this.each(function () {
                var $el = $(this),
                        sortable = $el.data('sortable');

                if (!sortable && (options instanceof Object || !options)) {
                        sortable = new Sortable(this, options);
                        $el.data('sortable', sortable);
                }

                if (sortable) {
                        if (options === 'widget') {
                                return sortable;
                        }
                        else if (options === 'destroy') {
                                sortable.destroy();
                                $el.removeData('sortable');
                        }
                        else if (typeof sortable[options] === 'function') {
                                retVal = sortable[options].apply(sortable, [].slice.call(args, 1));
                        }
                        else if (options in sortable.options) {
                                retVal = sortable.option.apply(sortable, args);
                        }
                }
        });

        return (retVal === void 0) ? this : retVal;
	},

	autoLoad: function() {
	    if (this.jquery) {
	        this.each(function() {
	            if (this.nodeType == 1) {
	                var nodeName = this.nodeName.toLowerCase();
	                if (nodeName === "textarea") {
	                	if ("loadedFilename" in this.dataset) return; // load file -> sets data-loaded-filename="filename.html"
	                	if (this.value.indexOf(" ")!==-1) return; // probably language
	                	if (this.value.indexOf("\n")!==-1 || this.value.indexOf("{")!==-1 || this.value.indexOf("<")!==-1) return; // markup of some kind
	                	if (this.value.indexOf(".")===-1) return; // can't be a filename
						if (this.value.indexOf(".html")!==-1 || this.value.indexOf(".md")!==-1 || this.value.indexOf(".txt")!==-1) {
							var el = this,
								name = el.value;
							el.value = "Loading content ... please wait";
							$.post('/app/edit/action/' + window.CourseBuildr.Course.id + '/page.contentbyfilename/', {
								filename: name
							}, function (obj) {
								if (obj.status !== "ok") {
									console.warn(obj);
									if (obj.error) alert(obj.error);
									el.value = name; // reset value
									return;
								} else {
									el.dataset.loadedFilename = name; // cache filename for future saves
									el.dataset.pageId = obj.id;
									el.value = obj.content;

									retriggerHighlighter(el.id);
								}
							})
						}
	                }
	            }
	        })
	    }
	    return this;
	}

} );

// return function called from /engine/pages/list/init.js to populate the selected image in the layout interface
function setting_SelectImage(path, obj) {
	$("#" + obj).html("<img src='" + _folder + "/SCO1/en-us/Content/media/" + path + "' lowsrc='Content/media/" + path + "' />");
	// __settings.headerleft.content = "Content/media/" + path;
	updateLayoutHeaderBg({"config": { "headerleft" : { "content" : "Content/media/" + path }}});
}

function doubleQuotedString(s) {
	if (typeof s === 'undefined') return String.fromCharCode(34) + String.fromCharCode(34);
	s = s.replace(/\"/g, String.fromCharCode(92) + String.fromCharCode(34));
	return String.fromCharCode(34) + s + String.fromCharCode(34);
	// return "\"" + s.replace("\"","\\\"") + "\"";
}





// function enable_drag_image_to_editor(container) {

//  	$("#" + container).filedrop({
// 	    fallback_id: 'manual_upload_off',	   // an identifier of a standard file input element, becomes the target of "click" events on the dropzone
// 	    url: '/engine/listUpload.asp?id=' + window.CourseBuildr.Course.id,     // upload handler, handles each file separately, can also be a function taking the file and returning a url
// 	    paramname: 'userfile',            // POST parameter name used on serverside to reference file, can also be a function taking the filename and returning the paramname
// 	    withCredentials: false,          // make a cross-origin request with cookies
// 	    data: {
// 	    	"stop": true
// 	    },
// 	    error: function(err, file) {
// 	    	alert(err);
// 	    	console.log("enable_drag_image_to_editor",err,file);
// 	    },
// 	    allowedfiletypes: ['image/jpeg','image/png','image/gif','application/pdf','application/x-pdf'],   // filetypes allowed by Content-Type.  Empty array means no restrictions
// 	    allowedfileextensions: ['.jpg','.jpeg','.png','.gif','.pdf'], // file extensions allowed. Empty array means no restrictions
// 	    maxfiles: 1,
// 	    maxfilesize: 20,
// 	    uploadFinished: function(i, file, response, time) {
// 		    if (file.type.indexOf("image/")!==-1) {
// 		        replace_selection(container, "{image box-shadow|" + file.name + "}");
// 		    } else {
// 			   //  replace_selection(container, "{external " + file.name + "|link to file}")
// 			    replace_selection(container, "{linkref hyperlink-text|" + file.name + "}");
// 		    }
// 	    }
// 	});
// }

// function show_dialogue_easyedit(command, region) {

// 	var selection = get_selection(region);

// 	$("<p>").text("Each line you enter below will be turned into a number or bullet").appendTo(dlg);
// 	$("<textarea>").attr({"wrap":"off","rows":8,"class":"input-block-level"}).appendTo(dlg);

// 	dlg.dialog({
// 		modal: true,
// 		maxHeight: $(window).height() - 100,
// 		maxWidth: $(window).width() - 200,
// 		width: $(window).width() / 2,
// 		open: function() {
// 			var $this = $(this);
// 			$this.dialog('option', {
// 				'maxHeight': $(window).height() - 100,
// 				'maxWidth': $(window).width() - 200
// 			});
// 			$("textarea", this).val(selection.text);
// 		},
// 		buttons: {
// 			"Save": function () {
// 				var $this = $(this);
// 				var out = [],
// 					cmd = (command.indexOf("bullets")==-1)?"numbers":"bullets",
// 					inp = $("textarea", dlg).val().replace(/<[^>]*>?/g, "").split("\n");
// 				$.map(inp, function (val, index) {
// 					if ($.trim(val) != "") out.push($.trim(val));
// 				});
// 				replace_selection(region, "{" + cmd + " " + out.join("|") + "}");
// 				$(this).dialog("close");
// 			},
// 			Cancel: function () {
// 				$(this).dialog("close");
// 			}
// 		}
// 	});
// }

/** Function that count occurrences of a substring in a string;
 * @param {String} string               The string
 * @param {String} subString            The sub string to search for
 * @param {Boolean} [allowOverlapping]  Optional. (Default:false)
 *
 * @author Vitim.us https://gist.github.com/victornpb/7736865
 * @see Unit Test https://jsfiddle.net/Victornpb/5axuh96u/
 * @see http://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string/7924240#7924240
 */
function occurrences(string, subString, allowOverlapping) {

    string += "";
    subString += "";
    if (subString.length <= 0) return (string.length + 1);

    var n = 0,
        pos = 0,
        step = allowOverlapping ? 1 : subString.length;

    while (true) {
        pos = string.indexOf(subString, pos);
        if (pos >= 0) {
            ++n;
            pos += step;
        } else break;
    }
    return n;
}

/*
* you want {bullets {slideshow vertical|page1.html|page2.html}|{slideshow horizontal|{center {bold hello} it's centered}|{left {italic it's} italic on the left}}} to split on | only on the same depth
* consume and store nestings of {...} until you are at the root using a key name that is unlikely to occur in the natural text
* then split the root
* then go back through and re-apply the stored values in reverse order
* the return array will be split without nesting

* todo: rewrite the runtime parsing engine to work on the same principal, rather than nesting the function
*/

function safeSplit(text) {

	var source = text.slice(text.indexOf(" ")+1,-1); // {foobar cat|dog} => cat|dog becasue a string is also an array
	if (source.indexOf("{")===-1) return source.split("|"); // bam!

	var _keys = [],
		current = 0x80, // ascii character 128; safe until around 159 (31 nested objects)
		result = [];

	for (var i = 0, len = source.split("{").length; i < len; i++) {
		var l = source.lastIndexOf("{"),
			r = source.indexOf("}",l)+1;
		if (l===-1) continue;
		var a = source.slice(0,l), b = source.slice(r), c = "%!" + current.toString(16) + "!%";
		_keys.push([c, source.slice(l,r)]);
		source = [a,c,b].join("");
		current++;
	}

	// what remains is the root array, so we can split on that
	result = source.split("|");

	// go back through - backwards
	for (i = _keys.length-1; i > -1; i--) {
		var r = result.map(function mapv(v) {
			return v.replace(_keys[i][0],_keys[i][1]);
		});
		result = r;
	}

	return result;

}


// in the editor double clicking a keyword expands the selection
// clicking a toolbar function then parses the selection back into the correct array
function parseSelection(text, cmd) {
	var ar = [{
			label: "Item 0",
			content: text || "First page content ... ",
			id: "tab_0" // the Tree id of the page represented here, which might be in the selection
		},{
			label: "Item 1",
			content: "Second page content ... ",
			id: "tab_1" // the Tree id of the page represented here, which might be in the selection
		}],
		h = "Multiple item editor",
		intro = "Each tab represents a single item in the list. Click tabs to edit contents, drag to re-order, &times; twice to remove an item, &plus; to add item.",
		k = cmd,
		modifier = "";

	// expand-to-selection should have found the matching tag end
	if (text.startsWith("{tabs ") && text.endsWith("}")) {
		h = "Tabs",
		intro = "Each tab represents a page with a label drawn as a tab. Click to edit contents, drag to re-order, &times; twice to remove an item, &plus; to add item. When saved, tabs will be stored as hidden sub-pages of the current navigation selection.",
		ar = [], content = safeSplit(text);
		for (var i=0,j=1; i<content.length; i+=2,j++) {
			ar.push({
				tab: "Tab " + j,
				label: content[i],
				content: content[i+1],
				id: "s" + content[i].replace(/[^a-zA-Z0-9]/g,"").slice(0,30).toLowerCase()
			});
		}

	} else if (text.startsWith("{accordion ") && text.endsWith("}")) {
		h = "Accordions",
		intro = "Each tab represents an expandable item beginning with a label. Click to edit contents, drag to re-order, &times; twice to remove an item, &plus; to add item. When saved, tabs will be stored as hidden sub-pages of the current navigation selection.",
		ar = [], content = safeSplit(text);
		for (var i=0,j=1; i<content.length; i+=2,j++) {
			ar.push({
				tab: "Section " + j,
				label: content[i],
				content: content[i+1],
				id: "s" + content[i].replace(/[^a-zA-Z0-9]/g,"").slice(0,30).toLowerCase()
			});
		}

	} else if (text.startsWith("{slidebox ") && text.endsWith("}")) {
		h = "Slide Box",
		intro = "Each tab represents a page in the slidebox. Click to edit contents, drag to re-order, &times; twice to remove an item, &plus; to add item. Choose whether the slidebox will be vertically or horizontally oriented.",
		ar = [], content = safeSplit(text);
		modifier = content[0]; // e.g. "horizontal" or "vertical"
		for (var i=1; i<content.length; i++) {
			ar.push({
				tab: "Slide " + i,
				label: "Slide " + i,
				content: content[i],
				id: "s" + content[i].replace(/[^a-zA-Z0-9]/g,"").slice(0,30).toLowerCase()
			});
		}

	} else if ((text.startsWith("{bullets ")||text.startsWith("{numbers ")) && text.endsWith("}")) {
		h = "List of " + cmd, // needs translation maybe
		intro = "Each tab represents an item in the list of " + cmd + ". Click to edit contents, drag to re-order, &times; twice to remove an item, &plus; to add item. Choose the type of list being created.",
		ar = [], content = safeSplit(text);
		if (text.startsWith("{numbers ")) k = "numbers";
		for (var i=0; i<content.length; i++) {
			ar.push({
				tab: "Item " + (i+1),
				label: "Item " + (i+1),
				content: content[i],
				id: "s" + content[i].replace(/[^a-zA-Z0-9]/g,"").slice(0,30).toLowerCase()
			});
		}

	}

	return {
		tabs: ar,
		header: h,
		intro: intro,
		kind: k,
		modifier: modifier
	}
}

function show_dialogue_pilledit(kind, region) {
	// 1. remove any previous dialogues
	// 2. figure out the data being passed by the selection
	// 3. Compile a new runtime template based on the new data and append it on the document
	// 4. Tell a dialogue control to show this content as a modal (https://github.com/benceg/vanilla-modal)
	// 5. Initialise any plugin code, such as tabs or editors
	// 6. Autoload any file contents on demand
	// 7. Add handlers for the save and cancel routines

	 var selection = get_selection(region),
		tmplJson = parseSelection(selection && selection.text, kind);

	$("#pill-edit-modal").remove(); // any previous
	var hh = $(Handlebars.getRuntimeTemplate("edit-pilledit-hbt", tmplJson)).appendTo(document.body);
	var dlg = new VanillaModal.default({
		closeKeys:[27],
		clickOutside:false,
		transitions:true,
		onOpen:function(e) {
			$(".pill-edit-tabs")
				.on("click","[data-action]", function (e) {
					e.preventDefault();
					switch (e.target.dataset.action) {
						case "select-tab":
							$(e.target).closest("li").removeClass("confirm-delete").addClass("active").siblings().removeClass("active");
							$(e.target.dataset.target).removeAttr("hidden").siblings("div").attr("hidden","");
							$("textarea", e.target.dataset.target).attachEditor();
						break;
						case "remove-tab":
							if(e.target.closest("li").classList.contains("confirm-delete")) {
								$(e.target.dataset.target).remove();
								$(e.target).closest("li").remove();
								$(".pill-edit-tabs>li:first").click();
							} else if ($(".pill-edit-tabs>li").length>3) {
								e.target.closest("li").classList.add("confirm-delete");
							}
						break;
						case "add-tab":
							var lis = $(".pill-edit-tabs>li"),
								idx = lis.length - 2;
							var $li = $('<li sortable><span class="pill-edit-tab"><a href="#" data-action="select-tab" data-target="#pillEditTab'+idx+'">Item '+idx+'</a><a href="#" data-action="remove-tab" data-target="pillEditTab'+idx+'">&times;</a></span></li>');
							var $div = $('<div class="pill-edit-bodies" id="pillEditTab'+idx+'" hidden></div>').html('<p>Label: <input type="text" value="Item '+idx+'"></p><textarea>Enter your content here</textarea>');
							$li.insertBefore(lis.filter(":nth-last-child(2)"));
							$div.insertAfter($(".pill-edit-bodies:last"));
							$li.find("a[data-action='select-tab']:eq(0)").click();
							$(".pill-edit-tabs").sortablejs("destroy").sortablejs();
							// add a hidden node to the tree underneath the selected item
						break;
					}
				})
				.sortablejs()
				.find("a[data-action='select-tab']:eq(0)").click();

			$(".pill-edit-modal > footer")
				.on("click","[data-modal-action]", function (e) {
					e.preventDefault();
					switch (e.target.dataset.modalAction) {
						case "save":
							var modifier = $(".pill-edit-modal input[name='modifier']:checked"),
								kind_modifier = $(".pill-edit-modal input[name='kindmodifier']:checked"),
								kind = e.target.dataset.modalKind,
								command = [],
								opqueue = [];
							if (modifier.length) command.push(modifier.val()); // {key modifier|value1|value2}
							if (kind_modifier.length) kind = kind_modifier.val(); // {key -> {newkey

							// each draggable tab, in on-screen order
							$(".pill-edit-tabs>li[sortable]").each(function(tabIndex) {

								// this <li> has a reference to the actual dom node that contains its body
								var dest = document.querySelector(this.querySelector("a[data-target]").dataset.target),
									ta = dest.querySelector("textarea"),
									inp = dest.querySelector("input");

								// textareas should push out to filenames if they contain line breaks OR were loaded dynamically
								if (/\r|\n/.exec(ta.value) || "loadedFilename" in ta.dataset) {

									if ("loadedFilename" in ta.dataset) {
										// the the textarea content was loaded from a filename then persist the content back to that filename
										opqueue.push({
											endpoint: 'page.savecontent',
											filename: ta.dataset.loadedFilename,
											content: ta.value,
											id: ta.dataset.pageId,
											sequence: tabIndex+1
										});
										// but ensure that the resulting command value then reflects the filename in situ
										ta.value = ta.dataset.loadedFilename;
									} else {
										var fn = 'parse' + CourseBuildr.Edit.Tree.CurrentModel().model.filename.extn(true) + '_' + tabIndex + '.html';
										// the textarea SHOULD BE set to a filename, so gather the data
										opqueue.push({
											endpoint: 'page.savepartial',
											filename: fn,
											content: ta.value,
											id: CourseBuildr.Edit.Tree.CurrentModel().model.id, // becomes parent
											sequence: tabIndex+1
										});
										// the textarea now has to reflect the new filename
										ta.value = fn;
									}

								}

								// need to create pages where we haven't already loaded from them, if the kind permits loading
								switch (kind) {
									case "tabs": case "accordion":
										command.push(inp.value); // name|value|...|name|value
										command.push(ta.value);
										break;

									case "bullets": case "numbers":
										command.push(ta.value); // value|...|value
										break;

									default:
										command.push(ta.value); // value|...|value
										break;

								}
							}); // each li[sortable]

							result = "{" + kind + " " + command.join("|") + "}";
							replace_selection(region,result);

							// persist the tab contents as needed
							CourseBuildr.Edit.Tree.Actions.SaveQueue(opqueue);

							dlg.destroy(); // or close
							break;

						case "cancel":
							dlg.destroy(); // or close
							break;
					}
				});
				// console.dir(document.querySelectorAll(".pill-edit-tabs>li:not([unsortable])"));

		},
		onBeforeClose:function(e) {
			// hilight here so you can see the changes as the close happens
			retriggerHighlighter("edit-area");
		},
		onClose:function(e) {

		}
	});
	dlg.open("#pill-edit-modal");

/*
	dlg
		.html(hh)
		.dialog({
			modal: true,
			maxHeight: $(window).height() - 200,
			maxWidth: $(window).width() - 200,
			width: $(window).width() - 200,
			height: $(window).height() - 200,
			open: function() {
				var $this = $(this);
				$this.dialog('option', {
					'maxHeight': $(window).height() - 100,
					'maxWidth': $(window).width() - 200
				});
				var tabs = $("#tabbed-editor")
					.tabs()
					.on( "click", "i.far fa-remove", function(e) {
						e.preventDefault();
						e.stopPropagation();
						if ($(this).closest("ul").find("li").length > 1) {
							var panelId = $( this ).closest( "li" ).remove().attr( "aria-controls" );
							$( "#" + panelId ).remove();
							tabs.tabs( "refresh" );
						}
				    })
					.find(".ui-tabs-nav").sortable({
						axis: "x",
						stop: function () {
							// tabs.tabs( "refresh" );
						}
					});
				$("#pillAdd", this).click(function(e) {
					e.preventDefault();
					addPill();
				});
				if (tmplJson.tabs.length == 0) addPill(); // add default
			},
			buttons: {
				"Save": function () {
					var $this = $(this);
					var out = [],
						cmd = (command.indexOf("tabs")!=-1) ? "tabs" : (command.indexOf("accordion")!=-1) ? "accordion" : (command.indexOf("columns")!=-1) ? "columns" : "error",
						inp = $("li", dlg.find("ul:first")),
						blob = [];
					inp.each(function (idx,el) {
						var a = $("a",el),
							filename = a.attr("href").replace(/[#]/,"") + ".txt", // .html",
							div = $(a.attr("href")),
							header = $.trim(div.find("input:text").val()),
							doc = $.trim(div.find("textarea").val());
						blob.push(["filename",filename].join("="));
						blob.push(["contents",escape(doc)].join("="));
						var selNode = $("a.jstree-clicked","#xmlTree").closest("li").attr("id"),
							node = $("#xmlTree").jstree("create", node, "last", header, null, false);
						setDefaultAttributes(node);
						node.attr("title",header); // overwrite defaults
						node.attr("fileName",filename);
						if (cmd == "columns") {
							out.push("{parse " + filename + "}");
						} else {
							out.push(header);
							out.push(filename);
						}
					});
					$.post("/engine/action.asp?id=" + window.CourseBuildr.Course.id + "&action=edit_post_tabeditmodal_saveall", blob.join("&"), function(data) {
						if (data != "ok") {
							alert("Uh oh. This did NOT save. Check the console for the error details.");
							console.log(data);
						}
					});
					replace_selection(region, "{" + cmd + " " + out.join("|") + "}");
					_global_tab_count = 0;
					$(this).dialog("close"); // .dialog("destroy");
					// $("#pill-edit").remove();
				},
				Cancel: function () {
					_global_tab_count = 0;
					$(this).dialog("close"); // .dialog("destroy");
					// $("#pill-edit").remove();
				}
			}
		});
*/
}

// in pill-edit-modal, clicking add (or initalising) adds a tab, based on the filename of the current select object
// function addPill() {
// 	var tabs = $("#tabbed-editor"),
// 		numPills = _global_tab_count++,
// 		tabFileName = ("parse" + $("a.jstree-clicked","#xmlTree").closest("li").attr("fileName").split(".")[0].replace(/[^a-zA-Z0-9_]/g,"") + "_" + numPills.toString()).replace(" ","_"),
// 		_ta = $("<textarea>")
// 					.addClass("input-block-level")
// 					.css("min-height", "400px")
// 					.attr({"rows": 15, "placeholder":"Here is where the markup for item " + numPills.toString() + " goes. This will get saved in a file called '" + tabFileName + ".txt' and appended as a child under the selected page in the treeview."});

// 	$("<li />")
// 		.append($("<a>").attr("href","#" + tabFileName).text("Item " + numPills).append("<i class='far fa-remove'></i>"))
// 		.appendTo($("ul",tabs));
// 	$("<div />")
// 		.hide()
// 		.attr("id", tabFileName)
// 		.append($("<input />").addClass("input-block-level").attr({"type": "text","placeholder": "Give your new item a title here..."}))
// 		.append(_ta)
// 		.appendTo(tabs);
// 	tabs.tabs("refresh");
// 	tabs.tabs( "option", "active", numPills );

// 	_ta.attachEditor(); // must be done after the textarea exists in DOM
// }

function updateLayoutHeaderBg(config) {
	var el = $("table.layout-edit.header-element");
	// console.log("updateLayoutHeaderBg",config);
	if (config.headerleft && config.headerleft.content) {
		var img = $(config.headerleft.content).attr("src");
		el.css("background-image", "url(" + _folder + "/SCO1/en-us/" + img + ")");
	}
	if (config.layout && config.layout.header) {
		if (config.layout.header.imagealign) el.css("background-position", config.layout.header.imagealign);
		if (config.layout.header.imagesize) el.css("background-size", config.layout.header.imagesize);
	}
}

// set an existing property
function setJsonProp(obj, prop, value) {
return;
	var props = prop.split('.');
	// console.log(obj, prop, value);
	return [obj].concat(props).reduce(function(a,b,i) {
		// console.log("reduce:", a, b, i);
		return i == props.length ? a[b] = value : a[b];
	});
}

// set a maybe existing property
function setJsonValue(obj, path, value) {
	return;
    path = path.split('.');
    var i;
	// console.log("json value", obj, path, value);
    for (i = 0; i < path.length - 1; i++) {
	    // console.log(i, obj, obj[path[i]], path[i]);
        obj = obj[path[i]];
    }

    obj[path[i]] = value;
}

	// shortcut.add("Ctrl+S",function() {
	//     $("#content-save").trigger("click");
	// });


// $(document).unbind("content.revisions").bind("content.revisions", function () {
// 	$.get("/engine/action.asp", {
// 		"id" : window.CourseBuildr.Course.id,
// 		"action" : "history_get",
// 		"filename" : _editing_file
// 		},
// 		function(jsn) {
// 			// console.log (typeof jsn);
// 			var o = {
// 				"revision": jsn,
// 				"area": "content"
// 			};
// 			var h = Handlebars.getCompiledTemplate("tabs/content/revisions", o);
// 			// console.log(o, h);
// 			$("#content-revisions-block").html(h);
// 			$("a[href='#content_revisions-help']").click(function(event) {
// 				event.preventDefault();
// 				bootbox.alert("<h4>File history</h4><p>Every time someone saves the file, the CURRENT"+
// 					" file is backed up to the database if/before the CHANGES are saved. You can use this" +
// 					" dropdown to show previous saved versions.</p><p>Selecting one of these will" +
// 					" show you the results in an overlay, from which you can copy what you need manually." +
// 					" It will not overwrite the current file.</p><p>You can also see the text difference" +
// 					" between the <i>selected version</i> and <i>current version</i>.</p>");
// 			});
// 			$("#content_select_revisions").change(function(event) {
// 				var _label = $("option:selected",this).text();
// 				$.get("/engine/action.asp", {
// 					"action": "revision_get",
// 					"filename": _editing_file,
// 					"timestamp": $(this).val()
// 				}, function(data) {
// 					var _html = Handlebars.getCompiledTemplate("tabs/content/diff",{
// 						"revision": data,
// 						"label": _label,
// 						"current": $("#edit-area").val()
// 					});
// 					bootbox.bigwindow(_html, function () {
// 						// containers look backwards but we want to compare revision as the old to current as the new
// 						$("#revision-diff").prettyTextDiff({
// 							"cleanup": true,
// 							"debug": false,
// 							"originalContainer": "#revision",
// 							"changedContainer": "#current",
// 							"diffContainer": "#diff-text"
// 						});
// 					});
// 				});
// 				this.selectedIndex = 0;

// 			});
// 		});
// }).trigger("content.revisions");

// _tab.on("click", "#content-save", function (e) {
// 	e.preventDefault();
// 	$.post("/engine/action.asp?id=" + window.CourseBuildr.Course.id + "&action=ajaxSaveFile", {
// 		filename: _editing_file,
// 		content: $("#edit-area").val()
// 	}, function (data) {
// 		$.jGrowl("Ok, <b>" + _editing_file.substring(_editing_file.lastIndexOf("/") +1) + "</b> has been updated");
// 		$(document).trigger("content.revisions");
// 	});
// }).on("click", "#page_grid li:not(.disabled) a", function (event) {
// 	event.preventDefault();
// 	$("#page_grid li:not(.disabled)").removeClass("active");
// 	$(this).parent().addClass("active");
// 	$editing_item.attr("template", $(this).attr("data-grid"));
// 	makeDirty(true);
// });


function hex2rgba(hx,a) {
	var m = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(hx),
		r = parseInt(m[1],16),
		g = parseInt(m[2],16),
		b = parseInt(m[3],16);
	return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}

var MediaOverlay = (function(window,document,$,undefined) {

	var active_region = null;

	var _show = function(region_name, current_selection) {
		window.scrollTo(0,0);
		var encoded_value = "";
		if (current_selection.length) {
			encoded_value = btoa(encodeURIComponent(current_selection).replace(/%([0-9A-F]{2})/g, function toSolidBytes(match, p1) {
		            return String.fromCharCode('0x' + p1);
		    })).replace('+','-').replace('/','_').replace('=',',') + "/"; // to match format expected by Text::base64dec()
		}
		active_region = region_name;
		var div = document.createElement("div");
		div.style = "position:fixed;top:0;left:0;right:0;bottom:0;background-color:rgba(0,0,0,.5);z-index:1091;";
		div.setAttribute("id","media-overlay");
		var iframe = document.createElement("iframe");
		iframe.style = "position:fixed;top:50px;left:50px;width:calc(100vw - 100px);height:calc(100vh - 100px);border:none;background-color:#fff;box-shadow:0 0 25px rgba(0,0,0,.5);";
		iframe.setAttribute("src", "/app/media/index/" + window.CourseBuildr.Course.id+ "/insert/" + region_name + "/" + encoded_value);
		div.appendChild(iframe);
		document.querySelector("body").appendChild(div);
		document.querySelector("body").className += " noscroll";
	}

	var _hide = function () {
		var mo = document.getElementById("media-overlay");
		if (mo) mo.style.display = "none";
		document.querySelector("body").className = document.querySelector("body").className.replace("noscroll","");
	}

	var _insert = function(source) {
		if (active_region) {
			replace_selection(active_region, source);
		}
		MediaOverlay.close();
	}

	var _close = function () {
		var mo = document.getElementById("media-overlay");
		if (mo) mo.parentNode.removeChild(mo);
		document.querySelector("body").className = document.querySelector("body").className.replace("noscroll","");
	}

	return {
		Show: _show,
		Hide: _hide,
		Close: _close,
		Insert: _insert
	}
})(window,document,jQuery);

function nOEmbed(url, callback) {
	$.getJSON("https://noembed.com/embed", {
		format: 'json',
		url: url
	}, function(data) {
		if (data.error) callback(data.url);
		var doc = document.implementation.createHTMLDocument("foo");
		doc.documentElement.innerHTML = data.html;
		callback(doc.querySelector("iframe[src]").getAttribute("src"));
	});
}

// https://github.com/blueimp/JavaScript-MD5/blob/master/js/md5.min.js
// var hash = md5("value"); // "2063c1608d6e0baf80249c42e2be5804"
!function(n){"use strict";function t(n,t){var r=(65535&n)+(65535&t);return(n>>16)+(t>>16)+(r>>16)<<16|65535&r}function r(n,t){return n<<t|n>>>32-t}function e(n,e,o,u,c,f){return t(r(t(t(e,n),t(u,f)),c),o)}function o(n,t,r,o,u,c,f){return e(t&r|~t&o,n,t,u,c,f)}function u(n,t,r,o,u,c,f){return e(t&o|r&~o,n,t,u,c,f)}function c(n,t,r,o,u,c,f){return e(t^r^o,n,t,u,c,f)}function f(n,t,r,o,u,c,f){return e(r^(t|~o),n,t,u,c,f)}function i(n,r){n[r>>5]|=128<<r%32,n[14+(r+64>>>9<<4)]=r;var e,i,a,d,h,l=1732584193,g=-271733879,v=-1732584194,m=271733878;for(e=0;e<n.length;e+=16)i=l,a=g,d=v,h=m,g=f(g=f(g=f(g=f(g=c(g=c(g=c(g=c(g=u(g=u(g=u(g=u(g=o(g=o(g=o(g=o(g,v=o(v,m=o(m,l=o(l,g,v,m,n[e],7,-680876936),g,v,n[e+1],12,-389564586),l,g,n[e+2],17,606105819),m,l,n[e+3],22,-1044525330),v=o(v,m=o(m,l=o(l,g,v,m,n[e+4],7,-176418897),g,v,n[e+5],12,1200080426),l,g,n[e+6],17,-1473231341),m,l,n[e+7],22,-45705983),v=o(v,m=o(m,l=o(l,g,v,m,n[e+8],7,1770035416),g,v,n[e+9],12,-1958414417),l,g,n[e+10],17,-42063),m,l,n[e+11],22,-1990404162),v=o(v,m=o(m,l=o(l,g,v,m,n[e+12],7,1804603682),g,v,n[e+13],12,-40341101),l,g,n[e+14],17,-1502002290),m,l,n[e+15],22,1236535329),v=u(v,m=u(m,l=u(l,g,v,m,n[e+1],5,-165796510),g,v,n[e+6],9,-1069501632),l,g,n[e+11],14,643717713),m,l,n[e],20,-373897302),v=u(v,m=u(m,l=u(l,g,v,m,n[e+5],5,-701558691),g,v,n[e+10],9,38016083),l,g,n[e+15],14,-660478335),m,l,n[e+4],20,-405537848),v=u(v,m=u(m,l=u(l,g,v,m,n[e+9],5,568446438),g,v,n[e+14],9,-1019803690),l,g,n[e+3],14,-187363961),m,l,n[e+8],20,1163531501),v=u(v,m=u(m,l=u(l,g,v,m,n[e+13],5,-1444681467),g,v,n[e+2],9,-51403784),l,g,n[e+7],14,1735328473),m,l,n[e+12],20,-1926607734),v=c(v,m=c(m,l=c(l,g,v,m,n[e+5],4,-378558),g,v,n[e+8],11,-2022574463),l,g,n[e+11],16,1839030562),m,l,n[e+14],23,-35309556),v=c(v,m=c(m,l=c(l,g,v,m,n[e+1],4,-1530992060),g,v,n[e+4],11,1272893353),l,g,n[e+7],16,-155497632),m,l,n[e+10],23,-1094730640),v=c(v,m=c(m,l=c(l,g,v,m,n[e+13],4,681279174),g,v,n[e],11,-358537222),l,g,n[e+3],16,-722521979),m,l,n[e+6],23,76029189),v=c(v,m=c(m,l=c(l,g,v,m,n[e+9],4,-640364487),g,v,n[e+12],11,-421815835),l,g,n[e+15],16,530742520),m,l,n[e+2],23,-995338651),v=f(v,m=f(m,l=f(l,g,v,m,n[e],6,-198630844),g,v,n[e+7],10,1126891415),l,g,n[e+14],15,-1416354905),m,l,n[e+5],21,-57434055),v=f(v,m=f(m,l=f(l,g,v,m,n[e+12],6,1700485571),g,v,n[e+3],10,-1894986606),l,g,n[e+10],15,-1051523),m,l,n[e+1],21,-2054922799),v=f(v,m=f(m,l=f(l,g,v,m,n[e+8],6,1873313359),g,v,n[e+15],10,-30611744),l,g,n[e+6],15,-1560198380),m,l,n[e+13],21,1309151649),v=f(v,m=f(m,l=f(l,g,v,m,n[e+4],6,-145523070),g,v,n[e+11],10,-1120210379),l,g,n[e+2],15,718787259),m,l,n[e+9],21,-343485551),l=t(l,i),g=t(g,a),v=t(v,d),m=t(m,h);return[l,g,v,m]}function a(n){var t,r="",e=32*n.length;for(t=0;t<e;t+=8)r+=String.fromCharCode(n[t>>5]>>>t%32&255);return r}function d(n){var t,r=[];for(r[(n.length>>2)-1]=void 0,t=0;t<r.length;t+=1)r[t]=0;var e=8*n.length;for(t=0;t<e;t+=8)r[t>>5]|=(255&n.charCodeAt(t/8))<<t%32;return r}function h(n){return a(i(d(n),8*n.length))}function l(n,t){var r,e,o=d(n),u=[],c=[];for(u[15]=c[15]=void 0,o.length>16&&(o=i(o,8*n.length)),r=0;r<16;r+=1)u[r]=909522486^o[r],c[r]=1549556828^o[r];return e=i(u.concat(d(t)),512+8*t.length),a(i(c.concat(e),640))}function g(n){var t,r,e="";for(r=0;r<n.length;r+=1)t=n.charCodeAt(r),e+="0123456789abcdef".charAt(t>>>4&15)+"0123456789abcdef".charAt(15&t);return e}function v(n){return unescape(encodeURIComponent(n))}function m(n){return h(v(n))}function p(n){return g(m(n))}function s(n,t){return l(v(n),v(t))}function C(n,t){return g(s(n,t))}function A(n,t,r){return t?r?s(t,n):C(t,n):r?m(n):p(n)}"function"==typeof define&&define.amd?define(function(){return A}):"object"==typeof module&&module.exports?module.exports=A:n.md5=A}(this);

// popup window centered PopupCenter(location,title,width,height)
function PopupCenter(a,d,b,c){var e=void 0!=window.screenLeft?window.screenLeft:screen.left,f=void 0!=window.screenTop?window.screenTop:screen.top;width=window.innerWidth?window.innerWidth:document.documentElement.clientWidth?document.documentElement.clientWidth:screen.width;height=window.innerHeight?window.innerHeight:document.documentElement.clientHeight?document.documentElement.clientHeight:screen.height;a=window.open(a,d,"scrollbars=yes, width="+b+", height="+c+", top="+(height/2-c/2+f)+", left="+
(width/2-b/2+e) + ', resizable=yes');window.focus&&a.focus()};
