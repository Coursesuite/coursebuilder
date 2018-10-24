// determine what to do once a selection is made in the textarea editor's commands drop down
function doEditCommand(obj,region) {
	var $obj = $(obj),
		command = $obj.val(),
		_easyedit = ($obj.find(":selected").attr("data-easy-edit") == "true"),
		_pilledit = ($obj.find(":selected").attr("data-pill-edit") == "true");
	if (typeof region == 'undefined') region = "edit-area";
	if (!command) return;
	var selection = get_selection(region); // returns object {start, end, length, text}
	var justcommand = command.split(" ")[0].replace(/\{/,"");

	// console.log("doeditcommand", obj,region);

	// unset selection from the control that told us what to do
	obj.selectedIndex = 0;

	// prompt user if the command requires text selected first
	if ((command.indexOf("%selection%")!=-1) && (selection.length==0)) {
		alert("You need to select some text first...");
		return;
	}

	// popWindow called with various parameters to tell ASP file how to draw itself
	if (_easyedit) {

		show_dialogue_easyedit(command, region);

	} else if (_pilledit) {

		show_dialogue_pilledit(command, region);

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

		/* bootbox.prompt("Paste in the URL to link to", function (r) {
			if (r != null) {
				replace_selection(region, command.replace("%link%", r).replace("%selection%", selection.text));
			}
		}); */

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

		$.post("/engine/action.asp?id=" + _courseid + "&action=ajax_convertblock", {
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
		$("#" + region).val(val);

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
		$("#" + region).val($.trim(out.join("\n\n").replace(/\n{3,}/g,"\n\n"))); // doublespace, but no more than that

	} else if (command == "//stripHEAD//") {

		var val = $("#" + region).val();
		if (val.indexOf("</head>")!=-1) val = val.substring(val.indexOf("</head>") + 7).replace("</html>","");
		if (val.indexOf("<body")!=-1) val = val.replace("</body>","").replace("<body>","");
		$("#" + region).val($.trim(val));

	} else if (command == "//insert-media//") {
		MediaOverlay.Show(_courseid, region, selection.text);

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
	data.id = _courseid;
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
		"id": _courseid,
		"command": command,
		"selection": escape(selection),
		"containerid": escape(containerid),
		"returnmode": escape(returnmode),
		"areaid": escape(areaid)
	};
	// id=" + _courseid + "&command=" + command + "&selection=" + escape(selection) + "&containerid=" + escape(containerid) + "&returnmode=" + escape(returnmode) + "&areaid=" + escape(areaid)
	var qs = $.param(data);
	PopupCenter("/engine/pages/list/?" + qs, "list", 1220, 640);
	//var w = window.open("/engine/pages/list/?" + qs,"list","scrolling=1,scrollbars=1,resizable=1,width=1220,height=640");
	//w.focus();
}

// prompt the user if they need to save
function setConfirmUnload(on) {
	window.onbeforeunload = (on) ? unloadMessage : null;
}

// message to show user as they navigate away
function unloadMessage() {
     return 'Reloading, or navigating away at this point might' +
        ' mean you lose stuff...';
}

// un-set the dirty flag on window unload (stops prompt to save on unload)
function makeClean() {
	$("#toXML").removeClass("ui-button-warning").addClass("ui-button-success").html("<i class='icon-save'></i> Nav saved");
	setConfirmUnload(false);

	_revisions = 0; // reset number of revisions so that navtree revision check starts afresh
	$("#revised").hide(); // because it's no longer a valid status

	$(document).trigger("navtree.revisions");

}

// set the dirty flag on window unload (prompts user to confirm no-save)
function makeDirty() {
	$("#toXML").removeClass("ui-button-success").addClass("ui-button-warning").html("<i class='icon-exclamation-sign'></i> Nav not saved!");
	setConfirmUnload(true);
}

// turns <ul><li>node<ul><li>sub-node</li></ul></ul> into <page>node<page>node</page></page>
// then sends data to server for further processing & saving
function handleSave() {
	var copy = $("#xmlTree").clone();
	$("a", copy).each(function(index,node) {
		$(node).closest("li").attr("title", $(node).text());
	});
	$("a,ins", copy).remove();
	$("ul,li", copy).removeAttr("class").removeAttr("style");
	var html = $(copy).html()
		.replace(/\&nbsp\;/g,"")
		.replace(/\&amp\;/g,"&")
		.replace(/<ul>/g,"")
		.replace(/<\/ul>/g,"</page>")
		.replace(/<li\s/g,"<page ")
		.replace(/><\/li>/g," />")
		.replace(/<\/li>/g,"</page>")
		.replace(/<\/li\ \/>/g,"</page>")
		.replace(/<\/page\ \/>/g,"</page>")
		.replace(/\ id\=\"_/g," id=\"");


	$.post("/engine/action.asp?id=" + _courseid + "&action=ajaxSavePagesXML", {
		xml: html
	}, function (data) {
		$.jGrowl("Ok, Pages.xml has been saved");
		// $(document).trigger("navtree.revisions");
	});

	// unset dirty
	makeClean();
}

// runs through a <page> node in pages.xml and turns it into a <li> node that jsTree can then make a treeview out of
function processPages(obj){
	var t = $(this);
	htmlTree.push("<li")
	if (!t.attr("title")) {
		htmlTree.push (" class='jstree-open'>");
	} else {
		htmlTree.push(" title='" + t.attr("title").safeForXml() + "'");
		htmlTree.push(" fileName='" + t.attr("fileName").safeForXml() + "'");
		htmlTree.push(" type='" + t.attr("type") + "'");
		htmlTree.push(" id='_" + t.attr("id") + "'");
		htmlTree.push(" contribute='" + t.attr("contribute") + "'");
		htmlTree.push(" contributeScore='" + t.attr("contributeScore") + "'");
		htmlTree.push(" contributePercentage='" + t.attr("contributePercentage") + "'");
		htmlTree.push(" nav='" + t.attr("nav") + "'");
		htmlTree.push(" template='" + t.attr("template") + "'>");
	}
	htmlTree.push("<a href='#'" + (_selected==t.attr("id") ? " class='jstree-hovered jstree-clicked'" : "") + ">" + ((t.attr("title")) ? t.attr("title") : "Course") + "</a>")
    if( t.children().length>0 ){
        htmlTree.push('<ul>');
        t.children().each(processPages);
        htmlTree.push('</ul>');
    }else{
       htmlTree.push('</li>');
    }
}

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

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

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

	attachEditor: function () {
	    this.each(function () {
		    if (this.nodeType == 1) {
			    if (this.nodeName.toLowerCase() == "textarea") {
			    	var $textarea = $(this), _loaded = false, _id = $textarea.uniqueId().attr("id");
		    		if (_loaded === false) {

			    		var where = this.parentNode,
			    			n = document.querySelector("#plugins-ninjitsu-edit-template-hbt"),
			    			tmpl = Handlebars.compile(n.innerHTML),
			    			data = toolbarjson;
			    	//	console.log(where, _id);
			    		data["savable"] = (_id === "edit-area");
			    		if (!data.savable) {
				    		data.purpose[1].group[1].commands[8]["hidden"] = true;
				    		data.purpose[1].group[1].commands[9]["hidden"] = true;
				    		data.purpose[2].group[0].commands[12]["hidden"] = true;
			    		}
	//		    		console.log("data",data);

			    		var dom = document.createRange().createContextualFragment(tmpl(data)); // innerhtml -> dom node
			    		dom.querySelector("#ta-dom").appendChild(this); // move node
			    		where.appendChild(dom);

			    		_loaded = true;

				    	$textarea
							.attr("wrap","soft")
							.allowTabChar()
				    		.on("select", function(event) {
					    		checkIfWeNeedToExpandTheSelection(this);
				    		})
				    		.highlightTextarea();

			    		$(".command-block select", where).on("change", function() {
							doEditCommand(this, _id);
							this.selectedIndex = -1;
			    		});
			    		$(".toolbar-buttons button[data-command]", where).on("click", function(e) {
				    		e.preventDefault();
				    		$(".command-block select", where).val($(this).attr("data-command")).trigger("change");
			    		});

		    		}
				}
		    }
	    });
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


function saveQuiz(fn) {

	var pools = [];
	$("[data-grouping='questionPool']", "#tabs-5").each(function(pIndex, el) {
		var questions = [];

		// each fieldset contains a question in this pool
		$("fieldset",$(el)).each(function (qIndex, qObj) {
			var choices = [],
				choicesA = [],
				choicesB = [],
				feedback = [],
				$obj = $(qObj),
				data = {},
				type = $obj.attr("data-question-type");

			data["type"] = type;
			data["id"] = "q" + pIndex + "." + qIndex;
			if ($(":input[data-attribute='randomize']",$obj).length) {
				data["randomize"] = $(":input[data-attribute='randomize']",$obj).is(":checked");
			}
			data["layout"] = $(":input[data-attribute='layout']",$obj).val();
			if ($(":input[data-attribute='media']", $obj).length) {
				data["media"] = $(":input[data-attribute='media']",$obj).val();
			}
			data["prompt"] = $(":input[data-attribute='prompt']",$obj).val();
			if (type == "QuestionMatching") {
				$("tbody tr", $obj).each(function(trIndex, tr) {
					choicesA.push($(":input[data-attribute='choiceA']",tr).val());
					choicesB.push($(":input[data-attribute='choiceB']",tr).val());
				});
				data["choicesA"] = choicesA;
				data["choicesB"] = choicesB;
			} else {
				$("tbody tr", $obj).each(function(trIndex, tr) {
					var opts = {};
					opts["value"] = $(":input[data-attribute='choice']",tr).val(); // all question types have a choice
					switch (type) {
						case "QuestionRankInOrder": // adds nothing, but skip default
						case "QuestionFillIn": // adds nothing, but skip default
							break;

						case "QuestionDragToList": // drag contains a list name
							opts["list"] = $(":input[data-attribute='list']",tr).val();
							break;

						case "QuestionChoice":
							feedback.push($(":input[data-attribute='feedback']",tr).val()); // single choice has feedback
							// DON'T break, also appends default

						default: // determine if choice is correct using checkbox
							opts["correct"] = $("input:checkbox",tr).is(":checked");
							break;
					}
					choices.push(opts); // append THIS distractor
				});
				if (feedback.length) data["feedback"] = feedback;
				data["choices"] = choices;
			}
			data["feedbackCorrect"] = $(":input[data-attribute='feedbackCorrect']",$obj).val();
			data["feedbackIncorrect"] = $(":input[data-attribute='feedbackIncorrect']",$obj).val();
			data["review"] = $(":input[data-attribute='review']",$obj).val();
			questions.push(data);
		});

		// add the current questions to the pool
		pools.push({
			deliver: $(":input[data-id='questionPool." + pIndex + ".deliver']").val(),
			order: $(":input[data-id='questionPool." + pIndex + ".order']:checked").val(),
			question: questions
		});
	});

	// console.log("inputs with data ids", $(":input[data-id]"));

	// create the test object container that contains the entire test
	var oJson = {
		"test": {
			id: "",
			timeLimit: $(":input[data-id='test.timeLimit']").val(),
			maxAttempts: $(":input[data-id='test.maxAttempts']").val(),
			showStatus: $(":checkbox[data-id='show-status']").is(":checked"),
			revealAnswers: $(":input[data-id='revealAnswers']").val(),
			restartable: $(":input[data-id='restartable']").val(),
			indexLayout: $(":input[data-id='indexLayout']").val(),

			quizTitle: $(":input[data-id='quizTitle']").val(),
			introduction: $(":input[data-id='introduction']").val(),
			passedMessage: $(":input[data-id='passedMessage']").val(),
			failedMessage: $(":input[data-id='failedMessage']").val(),
			incompleteMessage: $(":input[data-id='incompleteMessage']").val(),
			completedMessage: $(":input[data-id='completedMessage']").val(),
			attemptsMessage: $(":input[data-id='attemptsMessage']").val(),
			checkQuestionVisible: $(":input[data-id='checkQuestionVisible']").val(),
			exitButtonVisible: $(":input[data-id='exitButtonVisible']").is(":checked"),
			exitButtonLabel:  $(":input[data-id='exitButton']").val(),
			maxAttemptsReachedMessage: $(":input[data-id='maxAttemptsReachedMessage']").val(),
			questionPool: pools
		}
	}

	// console.log("generating xml to save", oJson);

	// Generate the XML using a Handlebars template (shortcut)
	var xml = Handlebars.getCompiledTemplate("tabs/quiz/quizxml",oJson).split("\n").map($.trim).filter(function(line) { return line != "" }).join("\n");

	// console.log("quiz save", xml, oJson);

	// tell the server to store the quiz data (we send both the xml and the json
	// a future version may use JSON format for quiz data
	$.post("/engine/action.asp?id=" + _courseid + "&action=ajax_saveQuizXML", {
		xml: xml,
		json: JSON.stringify(oJson),
		filename: fn
	}, function (ok) {
		$.jGrowl("Quiz XML has been updated.")
	});


}


function enable_drag_image_to_editor(container) {

 	$("#" + container).filedrop({
	    fallback_id: 'manual_upload_off',	   // an identifier of a standard file input element, becomes the target of "click" events on the dropzone
	    url: '/engine/listUpload.asp?id=' + _courseid,     // upload handler, handles each file separately, can also be a function taking the file and returning a url
	    paramname: 'userfile',            // POST parameter name used on serverside to reference file, can also be a function taking the filename and returning the paramname
	    withCredentials: false,          // make a cross-origin request with cookies
	    data: {
	    	"stop": true
	    },
	    error: function(err, file) {
	    	alert(err);
	    	console.log("enable_drag_image_to_editor",err,file);
	    },
	    allowedfiletypes: ['image/jpeg','image/png','image/gif','application/pdf','application/x-pdf'],   // filetypes allowed by Content-Type.  Empty array means no restrictions
	    allowedfileextensions: ['.jpg','.jpeg','.png','.gif','.pdf'], // file extensions allowed. Empty array means no restrictions
	    maxfiles: 1,
	    maxfilesize: 20,
	    uploadFinished: function(i, file, response, time) {
		    if (file.type.indexOf("image/")!==-1) {
		        replace_selection(container, "{image box-shadow|" + file.name + "}");
		    } else {
			   //  replace_selection(container, "{external " + file.name + "|link to file}")
			    replace_selection(container, "{linkref hyperlink-text|" + file.name + "}");
		    }
	    }
	});
}


function show_dialogue_glossary(editor) {

	function showTermEditor(event, ui) {

		var _editObj = $("#termEdit"),
			_tagObj = $("#termTags");
		_editObj.show();
		_tagObj.hide();

		var li = $(event.srcElement).closest("li"),
			tagLabel = ui.tagLabel,
			inpTerm = $("input[name='term']", _editObj),
			inpDefn = $("textarea", _editObj),
			obj = find_in_json(__glossary_json.terms, "term", tagLabel)[0];

		if (typeof obj !== "undefined") {
			inpTerm.val(obj.term);
			inpDefn.val(obj.definition);
		} else {
			inpTerm.val(tagLabel);
			inpDefn.val("");
		}

		$("input[type='button']", _editObj).unbind("click").click(function () {
			li.removeClass("tagit-selected");
			var current_text = inpTerm.val(),
				current_defn = inpDefn.val().replace(/\n/g,"\\n"),
				found = false;
			for (var key in __glossary_json.terms) {
				if (__glossary_json.terms[key].term == current_text) {
					__glossary_json.terms[key].definition = current_defn;
					found = true;
				}
			}
			if (!found) {
				__glossary_json.terms.push({
					"term": current_text,
					"definition": current_defn
				});
				_tagObj.tagit("createTag", current_text, "", true, true);
			}

			_editObj.hide();
			_tagObj.show();

		});
	}

	$("#dialogue-glossary").remove();
	$("<div />")
		.attr({
			"id":"dialogue-glossary",
			"title":"Glossary"
		})
		.appendTo("body");

	$.get("/engine/action.asp?id=" + _courseid + "&action=edit_ajax_load_glossary&q=" + Math.random(), function (data) {
		if (typeof editor !== "undefined") {
			data['returnmode'] = true;
		}
		// sort the glossary
		__glossary_json = data;

		$("#dialogue-glossary")
			.html(Handlebars.getCompiledTemplate("glossary",__glossary_json))
			.dialog({
				modal: true,
				maxHeight: $(window).height() - 100,
				maxWidth: $(window).width() - 200,
				width: $(window).width() / 2,
				open: function() {
					$(this).dialog('option', {
						'maxHeight': $(window).height() - 100,
						'maxWidth': $(window).width() - 200
					});
					$("#termEdit", this).hide();
					$("#termTags", this).tagit({
						allowSpaces: true,
						caseSentitive: false,
						removeConfirmation: true,
						onTagClicked: function(event,ui) {
							var tgt = $(event.srcElement),
								li = tgt.closest("li");
							li.siblings().removeClass("tagit-selected");
							if (li.hasClass("tagit-selected")) {
								showTermEditor(event,ui);
							} else {
								li.addClass("tagit-selected");
							}
						},
						afterTagAdded: function(event, ui) {
							if (!ui.duringInitialization) {
								var tgt = $(event.srcElement),
									li = tgt.closest("li").addClass("tagit-selected");
								li.siblings().removeClass("tagit-selected");
								showTermEditor(event, ui);
							}
						},
						afterTagRemoved: function (event, ui) {
							for (var key in __glossary_json.terms) {
								if (__glossary_json.terms[key].term == ui.tagLabel) {
									__glossary_json.terms.removeValue("term", ui.tagLabel);
								}
							}
						}
					});
				},
				buttons: {
					"Save": function () {
						var $this = $(this);

						// sort the terms alphabetically
						__glossary_json.terms = __glossary_json.terms.sort( function(a,b) { return (a.term.toLowerCase()<b.term.toLowerCase()) ? -1 : (a.term.toLowerCase()>b.term.toLowerCase()) ? 1 : 0 } );
						delete __glossary_json.returnmode;
						__glossary_json.label = __settings.navigation.glossary.label;

						$.post("/engine/action.asp?id=" + _courseid + "&action=edit_ajax_save_glossary", {
							data: JSON.stringify(__glossary_json)
						}, function (ret) {
							if (ret == "ok") {

								// apply the selection before the dialogue closes
								if (typeof editor !== "undefined") {
									if ($this.find(".tagit-selected").length) {
										replace_selection(editor, "{term " + [$this.find(".tagit-selected").find(".tagit-label").text()].join("|") + "}")
									}
								}

								$this.dialog("close");
								$.jGrowl("Your glossary has been saved.");

							} else {
								alert("Something stuffed up saving the glossary. Check the console.");
								console.log("Error saving glossary", ret);
							}
						});
					},
					Cancel: function () {
						$(this).dialog("close");
					}
				}
			});
	});
}

function show_dialogue_references(editor) {

	$("#dialogue-references").remove();
	$("<div />")
		.attr({
			"id":"dialogue-references",
			"title":"Citiations / References"
		})
		.appendTo("body");

	$.get("/engine/action.asp?id=" + _courseid + "&action=edit_ajax_load_references&q=" + Math.random(), function (data) {
		if (typeof editor !== "undefined") {
			data['returnmode'] = true;
		}
		$("#dialogue-references")
			.html(Handlebars.getCompiledTemplate("reference",data))
			.dialog({
				modal: true,
				maxHeight: $(window).height() - 100,
				maxWidth: $(window).width() - 200,
				width: $(window).width() / 2,
				open: function() {
					var $this = $(this);
					$this.dialog('option', {
						'maxHeight': $(window).height() - 100,
						'maxWidth': $(window).width() - 200
					});
					$("<button><i class='icon-plus-circle'></i> Add item</button>").click(function () {
						var tbl = $this.find("table").filter(":first"),
							copy = tbl.clone();
							copy.find(":text").val("");
							copy.attr("data-id", getUID().toString());
							copy.insertBefore(tbl);

							$this.dialog('option', {
								'maxHeight': $(window).height() - 100,
								'maxWidth': $(window).width() - 200
							});

					}).button().appendTo(".ui-dialog-buttonpane");
					$(this).on("click", "a[href=#remove]", function (event) {
						event.preventDefault();
						$(this).closest("table").remove();
					});
				},
				buttons: {
					"Save": function () {
						var $this = $(this);
						var out = {"references":[]},
							inp = $("table", this);
						inp.each(function(index, el) {
							var $el = $(el),
								_ref = $.trim($el.find(":text[name='reference']").val()),
								_link = "", _desc = "";
							if (_ref.indexOf("://")==-1) { _desc=_ref; _link="#"} else { _desc=""; _link=_ref; }
							out.references.push({
								"uniqueid": either($el.attr("data-id"),getUID().toString()),
								"title": $.trim($el.find(":text[name='cite']").val()),
								"description": _desc,
								"hyperlink": _link
							});
						});
						$.post("/engine/action.asp?id=" + _courseid + "&action=edit_ajax_save_references", {
							data: JSON.stringify(out)
						}, function (ret) {
							if (ret == "ok") {

								// apply the selection before the dialogue closes
								if (typeof editor !== "undefined") {
									replace_selection(editor, "{ref " + [$this.find(":checked").val()].join("|") + "}")
								}

								$this.dialog("close");
								$.jGrowl("The references have been saved.");


							} else {
								alert("Something stuffed up saving the references. Check the console.");
								console.log("Error saving references", ret);
							}
						});
					},
					Cancel: function () {
						$(this).dialog("close");
					}
				}
			});
		$(".sortable-elements", "#dialogue-references").sortable({
			handle: ".icon-resize-vertical",
			axis: "y"
		})
	});
}

function show_dialogue_help() {

	$("#dialogue-help").remove();
	$("<div />")
		.attr({
			"id":"dialogue-help",
			"title":"Editing the help file"
		})
		.appendTo("body");

	$.get("/engine/action.asp?id=" + _courseid + "&action=edit_ajax_load_help&q=" + Math.random(), function (data) {
		$("#dialogue-help")
			.html(Handlebars.getCompiledTemplate("help",{content: data}))
			.dialog({
				modal: true,
				maxHeight: $(window).height() - 100,
				maxWidth: $(window).width() - 200,
				width: $(window).width() - ($(window).width() / 4),
				open: function() {
					var $this = $(this);
					$this.dialog('option', {
						'maxHeight': $(window).height() - 100,
						'maxWidth': $(window).width() - 200
					});
					$this.find("textarea").attachEditor();
				},
				buttons: {
					"Save": function () {
						var $this = $(this);
						// console.log("help save", $("textarea", this).val());
						$.post("/engine/action.asp?id=" + _courseid + "&action=edit_ajax_save_help", {
							data: $("textarea", this).val()
						}, function (ret) {
							if (ret == "ok") {
								$this.dialog("close");
								$.jGrowl("The help file has been saved.");
							} else {
								alert("Something stuffed up saving the help file. Check the console.");
								console.log("Error saving help", ret);
							}
						});
					},
					Cancel: function () {
						$(this).dialog("close");
					}
				}
			});
	});
}

function show_dialogue_easyedit(command, region) {

	$("#easy-edit").remove();
	var selection = get_selection(region),
		dlg = $("<div />")
			.attr({
				"id":"easy-edit",
				"title":"Insert a list of items"
			})
			.appendTo("body");

	$("<p>").text("Each line you enter below will be turned into a number or bullet").appendTo(dlg);
	$("<textarea>").attr({"wrap":"off","rows":8,"class":"input-block-level"}).appendTo(dlg);

	dlg.dialog({
		modal: true,
		maxHeight: $(window).height() - 100,
		maxWidth: $(window).width() - 200,
		width: $(window).width() / 2,
		open: function() {
			var $this = $(this);
			$this.dialog('option', {
				'maxHeight': $(window).height() - 100,
				'maxWidth': $(window).width() - 200
			});
			$("textarea", this).val(selection.text);
		},
		buttons: {
			"Save": function () {
				var $this = $(this);
				var out = [],
					cmd = (command.indexOf("bullets")==-1)?"numbers":"bullets",
					inp = $("textarea", dlg).val().replace(/<[^>]*>?/g, "").split("\n");
				$.map(inp, function (val, index) {
					if ($.trim(val) != "") out.push($.trim(val));
				});
				replace_selection(region, "{" + cmd + " " + out.join("|") + "}");
				$(this).dialog("close");
			},
			Cancel: function () {
				$(this).dialog("close");
			}
		}
	});
}

function show_dialogue_pilledit(command, region) {

	$("#pill-edit").remove();
	var selection = get_selection(region),
		dlg = $("<div />")
			.attr({
				"id":"pill-edit",
				"title":"Author multi-page item"
			})
			.appendTo("body"),
		tmplJson = {"tabs":[]};

	if (selection.text) {
		// TODO: break up the selected data if its a tab, accordion or columns, and feed this back into the template as json
		tmplJson = {"tabs":[
			{
				"label": "Item 0",
				"content": selection.text,
				"filename": ("parse" + $("a.jstree-clicked","#xmlTree").closest("li").attr("fileName").split(".")[0].replace(/[^a-zA-Z0-9_]/g,"") + "_0").replace(" ","_")
			}
		]};
		_global_tab_count = tmplJson.tabs.length;
	}

	dlg
		.html(Handlebars.getCompiledTemplate("tabs/content/pilledit", tmplJson))
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
					.on( "click", "i.icon-remove", function(e) {
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
					$.post("/engine/action.asp?id=" + _courseid + "&action=edit_post_tabeditmodal_saveall", blob.join("&"), function(data) {
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

}

// in pill-edit-modal, clicking add (or initalising) adds a tab, based on the filename of the current select object
function addPill() {
	var tabs = $("#tabbed-editor"),
		numPills = _global_tab_count++,
		tabFileName = ("parse" + $("a.jstree-clicked","#xmlTree").closest("li").attr("fileName").split(".")[0].replace(/[^a-zA-Z0-9_]/g,"") + "_" + numPills.toString()).replace(" ","_"),
		_ta = $("<textarea>")
					.addClass("input-block-level")
					.css("min-height", "400px")
					.attr({"rows": 15, "placeholder":"Here is where the markup for item " + numPills.toString() + " goes. This will get saved in a file called '" + tabFileName + ".txt' and appended as a child under the selected page in the treeview."});

	$("<li />")
		.append($("<a>").attr("href","#" + tabFileName).text("Item " + numPills).append("<i class='icon-remove'></i>"))
		.appendTo($("ul",tabs));
	$("<div />")
		.hide()
		.attr("id", tabFileName)
		.append($("<input />").addClass("input-block-level").attr({"type": "text","placeholder": "Give your new item a title here..."}))
		.append(_ta)
		.appendTo(tabs);
	tabs.tabs("refresh");
	tabs.tabs( "option", "active", numPills );

	_ta.attachEditor(); // must be done after the textarea exists in DOM
}

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
// 		"id" : _courseid,
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
// 	$.post("/engine/action.asp?id=" + _courseid + "&action=ajaxSaveFile", {
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


var toolbarjson = {
	"purpose": [
		{
			"name": "Elements",
			"group": [
				{
					"label":"Images, Video & Audio",
					"commands": [
						{"text":"right-hand images" , "command":"{rightimages %images%}"},
						{"text":"single image" , "command":"{image %image%}"},
						{"text":"slideshow" , "command":"{slideshow %effect%|%pictures%}"},
						{"text":"Video (inline)", "command":"{inlinevideo %videosize%|%linkurl%}", "icon":"icon-youtube"},
						{"text":"Video (fullscreen), Play button", "command":"{fullscreenvideo %linkurl%}"},
						{"text":"Video (fullscreen), Image button", "command": "{fullscreenvideoimage %image%|%linkurl%}"},
						// {"text":"stretch right image", "command": "{backstretch %image%}"},
						{"text":"Captioned image", "command": "{caption black|%image%|%selection%}", "helper":"selector", "values":["black","white","theme"]}
					]
				},
				{
					"label":"Background images",
					"commands": [
						{"text":"page background", "command":"{pagebg %image%}"},
						{"text":"grid background", "command":"{gridbg %image%}"},
						{"text":"column background", "command":"{columnbg %image%}"}
					]
				},
				{
					"label": "Data loaders",
					"commands": [
						//{"text":"load a quiz" , "command":"{quiz 500|%xml%}", "helper":"height", "nestable": false},
						{"text":"load and parse external file" , "command":"{parse %url%}"},
						{"text":"load but do not parse external file" , "command":"{load %url%}"},
						{"text":"iframe", "command": "{iframe 500|%link%}", "helper":"height"},
						{"text":"slidebox (vertical)", "command": "{slidebox vertical|text, image or url for first page|text, image or url for subsequent pages}", "helpers": ["select"], "values": ["horizontal","vertical"]},
						{"text":"slidebox (horizontal)", "command": "{slidebox horizontal|text, image or url for first page|text, image or url for subsequent pages}", "helpers": ["select"], "values": ["horizontal","vertical"]}
					]
				},
				{
					"label": "Utilities",
					"commands": [
						{"text":"any html tag" , "command":"{tag tag|%selection%}"},
						{"text":"any html tag (with css class)" , "command":"{tag tag.className|%selection%}"},
						{"text":"clearfix" , "command":"{clear both}"},
						{"text":"line break (br)" , "command":"{br}"},
						{"text":"line split (p)" , "command":"{/}"},
						{"text":"classname (inline)" , "command":"{wrap classname|%selection%}"},
						{"text":"classname (block)" , "command":"{block classname|%selection%}"},
						{"text":"Strip all HTML from source code", "command":"//stripHTML//", "icon":"icon-bolt"},
						{"text":"Strip all except BODY from source code", "command":"//stripHEAD//", "icon":"icon-bookmark-empty"},
						{"text":"Try to convert stuff automatically", "command":"//convertAUTO//", "icon":"icon-bookmark"},
						{"text":"Insert media", "command":"//insert-media//"},
						{"text":"use right column", "command":"{right %selection%}"},
						{"text":"Convert selection to parse include", "command":"//convertBLOCK//", "icon":"icon-file-text"}
					]
				}
			]
		},
		{
			"name": "Interactions",
			"group": [
				{
					"label": "Overlays & Popups",
					"commands": [
						//{"text":"balloon popup" , "command":"{balloon %selection%|tip-text}", "icon":"icon-comment-alt"},
						{"text":"lightbox popup (button)" , "command":"{popup %selection%|%url%}", "icon":"icon-external-link"},
						{"text":"lightbox popup (text)" , "command":"{popuptext %selection%|%url%}"},
						{"text":"tip (button)" , "command":"{tipbutton %selection%|title box text|tip text in here}"},
						{"text":"tip (text)" , "command":"{tiptext %selection%|tip text in here}"},
						{"text":"glossary term" , "command":"{term %term%}"},
						{"text":"reference number" , "command":"{ref %ref%}"}
					]
				},
				{
					"label": "Interactions",
					"commands": [
						{"text":"fastfact" , "command":"{fastfact Fast Fact|%selection%}"},
						{"text":"flip cards" , "command":"{flip front-1|rear-1|front-N|rear-N}"},
						{"text":"scorm checkbox selection" , "command":"{clickcheck label 1|label ..|label N}"},
						{"text":"scorm true/false selection" , "command":"{clicktf true|false|label 1|label ..|label N}", "helpers":["select"],"values":["true","false"]},
						{"text":"scorm image selection" , "command":"{clickimage %images%}"},
						{"text":"scorm match activity" , "command":"{match Question 1|Answer 1|Question 2|Answer 2|Question N|Answer N}"},
						{"text":"scorm match-set activity" , "command":"{matchset Question 1|Answer 1|Question 2|Answer 2|Question N|Answer N}"},
						{"text":"survey" , "command":"{survey no-options|question 1|question ..|question N}"},
						{"text":"accordion", "command":"{accordion title 1|url 1|title ..|url ..|title N|url N}", "pilledit": true, "helpers": ["pilledit"], "icon": "icon-reorder", "nestable": false},
						{"text":"tab bar" , "command":"{tabs title 1|url 1|title ..|url ..|title N|url N}", "pilledit": true, "helpers": ["pilledit"], "icon": "icon-folder-close-alt", "nestable": false},
						{"text":"zoom-image" , "command":"{zoomimage %thumbnail%|%image%}"},
						{"text":"Split image", "command": "{splitimage %left%|%right%}"}
					]
				},
				{
					"label": "Pages",
					"commands": [
						{"text":"completion page" , "command":"{completion You-have-completed...|You-have-not-yet-completed...}"},
						{"text":"ifcomplete switch" , "command":"{ifcomplete complete-text|incomplete-text}"}
					]
				}
			]
		},
		{
			"name": "Formatters",
			"group": [
				{
					"label": "Formatting",
					"commands": [
						{"text":"h1" , "command":"{tag h1|%selection%}"},
						{"text":"h2" , "command":"{tag h2|%selection%}"},
						{"text":"bold" , "command":"{bold %selection%}", "icon":"icon-bold"},
						{"text":"italic" , "command":"{italic %selection%}", "icon":"icon-italic"},
						{"text":"numbered list" , "command":"{numbers item 1|item ..|item N}", "icon":"icon-list-ol", "easyedit": true, "helpers": ["textlist"]},
						{"text":"bulleted list" , "command":"{bullets point 1|point ..|point N}", "icon":"icon-list-ul", "easyedit": true, "helpers": ["textlist"]},
						{"text":"centered (div)" , "command":"{centered %selection%}", "icon":"icon-align-center"},
						{"text":"centered (p)" , "command":"{centerp %selection%}"},
						{"text":"link (go to page)" , "command":"{link %url%|%selection%}", "icon":"icon-link"},
						{"text":"link (reference)" , "command":"{linkref %url%|%selection%}"},
						{"text":"link (open in new window)" , "command":"{external %link%|%selection%}"},
						{"text":"block quote" , "command":"{quote %selection%}"},
						{"text":"columns", "command":"{columns column 1|column ..|column 5}", "pilledit": true, "helpers": ["pilledit"]},
						{"text":"float left", "command":"{float left|%selection%}"},
						{"text":"float right", "command":"{float right|%selection%}"},
						// {"text":"Line break", "command":"{/}"},
						// {"text":"Blank single line", "command":"{/blank-line/}"},
						{"text":"Horizontal line", "command":"{-}"}
					]
				},
				{
					"label": "Formatter blocks",
					"commands": [
						{"text":"Column splitter", "command":"<|>"},
						{"text":"Fold splitter", "command":"<->"},
						{"text":"Grid 3414", "command":"<layout grid3414>"},
						{"text":"Grid 3525", "command":"<layout grid3525>"},
						{"text":"Grid 1212 L", "command":"<layout grid1212L>"},
						{"text":"Grid 1212 R", "command":"<layout grid1212R>"}
					]
				}
			]
		}
	],
	"grid": $("a.jstree-clicked","#xmlTree").closest("li").attr("template"),
	"grids": [
		{"value":"", "label": "<i class='icon-th-large'></i> Auto"},
		{"value":"grid3414", "label": "<i class='icon-columns'></i> <u>&frac34;</u> : &frac14;"},
		{"value":"grid3525", "label": "<i class='icon-columns'></i> <u>&frac35;</u> : &frac25;"},
		{"value":"grid1212l", "label": "<i class='icon-columns'></i> <u>&frac12;</u> : &frac12;"},
		{"value":"grid1212r", "label": "<i class='icon-columns'></i> &frac12; : <u>&frac12;</u>"},
		{"value":"grid0", "label": "<i class='icon-check-empty'></i> None"}
	]
};

var MediaOverlay = (function(window,document,$,undefined) {

	var active_region = null;

	var _show = function(course_id, region_name, current_selection) {
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
		iframe.setAttribute("src", "/app/media/index/" + course_id + "/insert/" + region_name + "/" + encoded_value);
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
