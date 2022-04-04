// rough test to see if a tag is inline
function is_inline(tag) {
	var inline_tags = "b,big,i,small,tt,abbr,acronym,cite,code,dfn,em,kbd,strong,samp,var,a,bdo,br,img,map,object,q,script,span,sub,sup,button,input,label,select,textarea";
	return (inline_tags.indexOf(tag.toLowerCase())!=-1);
}

// the core of the engine. do NOT recurse this routine!
// strFile: raw html or text
// gridToUse: name of the grid template to load
// applyHeader: whether to process headers (e.g sub-pages = false)
// also handles multi-columns
function processString(strFile, gridToUse, applyHeader) {

	if (strFile.length == 0) return '';

	// we don't care about the head, if this is html
	if (strFile.indexOf("</head>")!=-1) strFile=strFile.substring(strFile.indexOf("</head>") + 7);
	
	// preprocessing - allow line breaks inside tags to be considered array elements
	strFile = (function() {
		var file = strFile,
			m = 0,
			iLoop = file.split("{").length;
		if (iLoop == file.split("}").length) {
			do {
				var l = file.lastIndexOf("{"), r = file.indexOf("}", l),
					bs = file.substring(0,l), as = file.substring(r+1),
					s = file.substring(l,r+1);
				if (s.length) {
					s = s.substring(1,s.length-1).replace(/\n{2,}/g,"\n").replace(/\n/g,"|"); // assume all lines are array splits
					// {image|box-shadow|foo.gif} => {image box-shadow|foo.gif}
					// {clear|both} => {clear both}
					if (s.indexOf(" ")==-1 || s.indexOf(" ") > s.substring(0, s.indexOf("|")).length) {
						s = s.replace(/[|]/," "); 
					}
					file = bs + "\1" + s + "\2" + as; // raw escape { => \1, } => \2, avoid re-matching this tag
				}
				m++;
			} while (m < iLoop);
			// {image box-shadow|foo.gif|} => {image box-shadow|foo.gif}
			// raw unescape \2 => }, \1 => {
			file = file.replace(/\x01/g,"{").replace(/[|]\x02/g,"\2").replace(/\x02/g,"}");
		}
		return file;
	})();
	

	// check for column/fold marker so we can handle book layout
	var bl = (strFile.indexOf("<|>")!=-1),
		fl = (strFile.indexOf("<->")!=-1),
		columns = strFile.split(/<[|-]>/,2), // will be length==1 if neither is found, so we still loop
		leftPage = "",
		rightPage = "";
	
	for (var c=0;c<columns.length;c++) {

		// check for a grid layout instruction & modify grid for this column if present
		var gl = columns[c].indexOf("<layout "),
			myGrid = gridToUse;
		if (gl != -1) { // grid statement for this column is set, extract it
			var gr = columns[c].indexOf(">", gl+1);
			myGrid = columns[c].substring(gl, gr).replace("<layout ","");
		}
	
		// now we can strip remaining html and start processing the lines
		var cache = get_raw_lines(columns[c]);
		var left = [], right = [], header = "", inset = false, len=0;
		for (var i=0,ii=cache.length;i<ii;i++) {
			var line = $.trim(cache[i]); // old safari compatible, IE doesn't match non-breaking spaces with \s, jQuery does it better
			if (line.length) { // skip blank lines
				// process line for commands & determine template
				if ((line.indexOf("}")!=-1) && line.indexOf("}")>line.indexOf("{")) {
					val = processLine(line);
					if (val[2] && val[2]=="inset") inset = true;
					if (val[1]=="right") {
						right.push(val[0]);
					} else {
						if (line.lastIndexOf("}")===line.length-1) {
							// line terminates with a command, but value is already a tag
							var val0_s = val[0].indexOf("<"),
								val0_e = val[0].lastIndexOf(">"),
								val0_t = val[0].lastIndexOf("<");
							if (
								((val0_s==0) && (val0_e==val[0].length-1) && (is_inline(val[0].substring(val0_t+2,val0_e)))) // line ends with an inline tag
								|| 
								(!(val0_s==0) && (val0_e==val[0].length-1)) // line ends with a command
							) {
								val[0] = "<p>" + val[0] + "</p>"; 
							}
						}
						
						if (!((val[0].indexOf("<")==0) && (val[0].lastIndexOf(">")==val[0].length-1))) {
							val[0] = "<p>" + val[0] + "</p>"; 
						}
						left.push(val[0]);
					}
				} else {
					if (len++==0 && applyHeader && line.length<100) {
						header = line;
					} else {
						left.push("<p>" + line + "</p>");
					}
				}
				
			}
		}
		left = (function() {
			return left.join("").split("<p></p>").join("").split("<p><p>").join("<p>").split("<p><p ").join("<p ").split("</p></p>").join("</p>");
		})();
		right = (function() {
			return right.join("").split("<p></p>").join("").split("<p><p>").join("<p>").split("<p><p ").join("<p ").split("</p></p>").join("</p>");
		})();

		if (c==0) {
			leftPage = $.trim(Handlebars.getCompiledTemplate("grids/" + myGrid,{
				"left" : left, // .join(""),
				"right" : right, // .join(""),
				"title" : header,
				"inset": inset
			}));
			if (leftPage.length == 0) { leftPage = "<p> </p>"; }

		} else {
			rightPage = $.trim(Handlebars.getCompiledTemplate("grids/" + myGrid,{
				"left" : left, // .join(""),
				"right" : right, // .join(""),
				"title" : header,
				"inset": inset
			}));
			if (rightPage.length == 0) { rightPage = "<p> </p>"; }
		}
	}
	
	if (fl == true) { // is a book, since we encountered a column marker
		return Handlebars.getCompiledTemplate("grids/fold", {
			"top" : leftPage,
			"bottom" : rightPage
		});
	} else if (bl == true) { // is a book, since we encountered a column marker
		return Handlebars.getCompiledTemplate("grids/book", {
			"left" : leftPage,
			"right" : rightPage
		});
	} else {
		return leftPage;
	}


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


function imageProperties(filename) {
	return find_in_json(__settings.images, "name", filename)[0];
}

function isValidImage(filename) {
	return (find_in_json(__settings.images, "name", filename).length != 0);
}

function globalise(hyperlink) {
	return (hyperlink.indexOf("ref://") !== -1) ? __global_root + "/en-us/Content/" + hyperlink : (hyperlink.indexOf("://")!==-1) ? hyperlink : __global_root + "/en-us/Content/" + hyperlink;
}


// takes a line of input and processes the most internal command, loops until there are no commands left
// returns: [processed string, container name: "left" or "right"]
function processLine(inp) {

	// do nothing if there's no instructions
	if ((inp.indexOf("{")==-1) && (inp.indexOf("}", inp.indexOf("{")+1)==-1)) return [inp,"left"];

	var loops = 0,
		maxLoops = 10,
		returnAr = [];
	if (inp.split("{").length===inp.split("}").length) maxLoops = inp.split("{").length;
	do {
		var p1 = inp.lastIndexOf("{"),
			p2 = inp.indexOf("}", p1+1) + 1,
			container = "left",
			inset = false,
			wholecommand = inp.substring(p1, p2),
			command = wholecommand.substring(1, wholecommand.indexOf(" ")).toLowerCase().split(".")[0], // {p foo} or {p.class foo}
			className = wholecommand.substring(1, wholecommand.indexOf(" ")).split("."),
			instruction = wholecommand.substring(wholecommand.indexOf(" ") + 1, wholecommand.length - 1).split("|"),
			missing = "<i style='color:red'><b>missing command:</b> " + command + "; <b>instruction:</b> " + instruction + "</i>", 
			tag = [];
		className.shift();
		className = className.join(" ");
			
		if (wholecommand == "{/}") {
			// skip it
			// tag.push("<p> </p>");

		} else if (wholecommand == "{br}") {
			tag.push("<br />");

		} else if (wholecommand == "{-}") {
			tag.push("<hr />");

		} else {
			//TODO: standardise order so that it's first-item = label, second-item = action
			switch (command) {
				case "iframe": // iframe, with html5 sandboxing set so that you can use services like twitter
								// html5rocks ~ sandboxed-iframes
					var h = isNaN(parseInt(instruction[0],10)) ? 500 : parseInt(instruction[0],10);
					tag.push("<iframe src='" + instruction[1] + "' allowtransparency='true' frameborder='0' scrolling='auto' width='100%' height='" + h + "' seamless sandbox='allow-same-origin allow-scripts allow-popups allow-forms'></iframe>");
					break;

				case "xml":
					var h = isNaN(parseInt(instruction[0],10)) ? 250 : parseInt(instruction[0],10),
						xml = isNaN(parseInt(instruction[0],10)) ? instruction[0] : instruction[1];
						//  seamless sandbox='allow-same-origin allow-scripts allow-popups allow-forms'
					tag.push("<iframe name='FRM_CONTENT' src='" + __global_root + "/en-us/Quiz.html?filename=" + xml + "' allowtransparency='true' frameborder='0' scrolling='auto' width='100%' height='" + h + "'></iframe>");
					break;
			
				case "link": // hyperlink
					//var fileId = getIdByFileName(instruction[1]);
					tag.push("<a href='javascript:LoadContentByFileName(\"" + instruction[1] + "\")'>" + instruction[0] + "</a>");
					break;
					
				case "linkref": // hyperlink to a file in Content, in a new window
					tag.push("<a href='" + globalise(instruction[1]) + "' target='_blank'>" + instruction[0] + "</a>");
					break;

				case "external": // external target hyperlink with icon
// console.log("external", instruction);
					var re = /\b(?:(?:https?|ftp|file)\:\/\/|www\.|ftp\.)/;
					if (re.test(instruction[0])) {
						// console.log("appears to be external", instruction[0]);
						if (instruction[0].indexOf("\:\/\/")===-1) instruction[0] = "http://" + instruction[0];
					} else {
						instruction[0] = globalise(instruction[0]);
					}
					tag.push("<a target='_blank' href='" + instruction[0] + "'><i class='icon-external-link'></i> " + instruction[1] + "</a>");
					break;
	
				case "fullscreenvideo": // optionally has ability to name
					var content = "<i class='icon-play'></i> Play video",
						url = instruction[0],
						classes = "rp-fullscreenvideo";
					if (instruction[1]) { // override
						content = instruction[0];
						url = instruction[1];
						classes = ""; // don't want one, might get specified in content
					}
					//console.log("full screen video", content, url, classes, "<a href='#' video-iframe='" + url + "' class='" + classes + "'>" + content + "</a>");
					tag.push("<a href='#' video-iframe='" + url + "' class='" + classes + "'>" + content + "</a>");
					break;
	
				case "inlinevideo":
					tag.push(videoPlayerCode(instruction[1],instruction[0],0,0,false));
					break;
					
				case "load": // load an external page but do not parse it (e.g. to load a table, image map stored in an external html file, etc)
				case "url":
					var href = (instruction[0].indexOf("://") == -1) ? __global_root + "/en-us/Content/" + instruction[0] : instruction[0],
						hmime = href.endsWith(".js") ? "text/javascript" : href.endsWith(".css") ? "text/css" : "text/html";
					tag.push("<link href='" + href + "' type='" + hmime + "'>");
					//	tagwrap = href.endsWith(".js") ? "<x-js>" : href.endsWith(".css") ? "<x-css>" : "";
					//$.ajax({
					//	url: (instruction[0].indexOf(":\/\/") == -1) ? __global_root + "/en-us/Content/" + instruction[0] + "?" + Math.random() : instruction[0],
					//	success: function (response) {
					//		var bhtml = (response.indexOf("<body") == -1) ? response : response.substring(response.indexOf(">", response.indexOf("<body") + 4) + 1, response.lastIndexOf("</body"));
					//		bhtml = tagwrap + bhtml + tagwrap.replace("<x","</x");
					//		tag.push( bhtml );
					//	},
					//	async: false
					//});
					break;
	
				case "parse": // load external page and parse it
					$.ajax({
						url: (instruction[0].indexOf(":\/\/") == -1) ? __global_root + "/en-us/Content/" + instruction[0] + "?" + Math.random() : instruction[0],
						success: function (response) {
							tag.push(processString(response, "auto", false));
						},
						async: false
					});
					break;
				
				case "overlay": // frumbox overlay using an iframe, doesn't actually load content until clicked
				case "popup":
					var href = (instruction[1].indexOf("://") == -1) ? __global_root + "/en-us/Content/" + instruction[1] : instruction[1];
					tag.push("<a href='" + href + "' rev='overlay' class='rp-button-dialogue'><i class='icon-info-sign'></i> " + instruction[0] + "</a>");
					break;
	
				case "popuptext":
					var pptText = (instruction[0] == "noicon") ? instruction[1] : instruction[0],
						pptLink = (instruction[0] == "noicon") ? instruction[2] : instruction[1],
						pptIcon = (instruction[0] == "noicon") ? "" : " <i class='icon-search icon-super'></i>",
						pptClass = (instruction[0] == "noicon") ? "" : " class='overlay-textlink'",
						href = (pptLink.indexOf("://") == -1) ? __global_root + "/en-us/Content/" + pptLink : pptLink;
					tag.push("<a href='" + href + "' rev='overlay'" + pptClass + ">" + pptText + pptIcon + "</a>");
					break;
					
				case "centered": // centered block
				case "center":
					tag.push(renderTag(instruction,"div","centered"));
					break;

				case "centerp": // centered paragraph
					tag.push(renderTag(instruction,"p","centered"));
					break;
					
				case "fastfact": // right hand bounce-in box
					var myUniqueId = _nPageCurrent + "_" + _global_increment;
					tag.push(Handlebars.getCompiledTemplate("fastfact", {
						"uniqueid": myUniqueId,
						"title": (instruction[0].length?instruction[0]:"Fast Fact"),
						"content": instruction[1]
					}));
					container = "right";
					_global_increment++;
					break;
	
				case "zoomimage": // click / hover image to show larger version, handles single or double images
					if (instruction.length==3) { // classes, image(small), image(large)
						tag.push("<span class='img-zoom" + (_sniff_isTablet ? " tablet" : " desktop") + "'>")
						tag.push("<span>" + (_sniff_isTablet ? "grab" : "hover") + "</span>")
						tag.push(imageTag(instruction[2], instruction[0], {
							"data-url": __global_root + "/en-us/Content/media/" + instruction[2]
						}));
						tag.push("</span>");
					} else if (instruction.length==2) {
						if (instruction[0].indexOf(".")!=-1) { // image(small), image(large)
							tag.push("<span class='img-zoom" + (_sniff_isTablet ? " tablet" : " desktop") + "'>")
							tag.push("<span>" + (_sniff_isTablet ? "grab" : "hover") + "</span>")
							tag.push(imageTag(instruction[0], "", {
								"data-url": __global_root + "/en-us/Content/media/" + instruction[1]
							}));
							tag.push("</span>");
						} else { // classes, image(large)
							tag.push(imageTag(instruction[1], "rp-zoomable " + instruction[0]));
						}
					} else { // image(large), no class, might be a mistake, wrap a handler class
						tag.push(imageTag(instruction[0], "rp-zoomable default-max-width"));
					}
					break;
					
				case "float": // div (not span!) float wrapper
					tag.push("<div style='float:" + instruction[0] + "'>" + instruction[1] + "</div>");
					break;
					
				case "image": // single inline image
					var classes = "rp-image" + (instruction[1] ? " " + instruction[0] : "");
					var filename = (instruction[1] ? instruction[1] : instruction[0]);
					tag.push(imageTag(filename, classes));
					break;
					
				case "list":
					tag.push("<ul class'" + className + "'>");
					for (var i=0; i<instruction.length; i++) {
						tag.push("<li>" + instruction[i] + "</li>");
					}
					tag.push("</ul>");
					break;
					
				case "dl":
					tag.push("<dl class'" + className + "'>");
					for (var i=0; i<instruction.length; i+=2) {
						tag.push("<dt>" + instruction[i] + "</dt>");
						tag.push("<dd>" + instruction[i+1] + "</dd>");
					}
					tag.push("</dl>");
					break;
	
				case "bullets": // dot-point list
					tag.push("<ul class='rp-bullets " + className + "'>");
					for (var i=0; i<instruction.length; i++) {
						tag.push("<li>" + instruction[i] + "</li>");
					}
					tag.push("</ul>");
					break;
	
				case "numbers": // numeric list
					tag.push("<ol class='rp-numbers " + className + "'>");
					for (var i=0; i<instruction.length; i++) {
						tag.push("<li>" + instruction[i] + "</li>");
					}
					tag.push("</ol>");
					break;
	
				case "rightimages": // right hand fade-in images (one or more)
				case "images": // right hand fade-in images (one or more)
					var classes = "rp-fadeinfast full-max-width",
						firstItem = 0;
					inset = true;
					if (instruction[0].indexOf(".") == -1) { // first item is not an image
						classes += " " + instruction[0];
						firstItem = 1;
						inset = false;
					}
					for (var i=firstItem; i<instruction.length; i++) {
						tag.push(imageTag(instruction[i], classes));
					}
					container = "right";
					break;
					
				case "backstretch":
					container = "right";
					tag.push(imageTag(instruction[0], "backstretch hide"))
					break;

				case "columnbg":
					var pbg_c = "col-backstretch hide", pbg_i = instruction[0];
					if (instruction[1] && instruction[0] == "contain") {
						pbg_i = instruction[1];
						pbg_c += " bg-contain";
					}
					tag.push(imageTag(pbg_i, pbg_c));
					break;

				case "gridbg":
					var pbg_c = "grid-backstretch hide", pbg_i = instruction[0];
					if (instruction[1] && instruction[0] == "contain") {
						pbg_i = instruction[1];
						pbg_c += " bg-contain";
					}
					tag.push(imageTag(pbg_i, pbg_c));
					break;

				case "pagebg":
					var pbg_c = "page-backstretch hide", pbg_i = instruction[0];
					if (instruction[1] && instruction[0] == "contain") {
						pbg_i = instruction[1];
						pbg_c += " bg-contain";
					}
					tag.push(imageTag(pbg_i, pbg_c));
					break;
					
				case "right": // tell whatever content to load in the secondary column
					container = "right";
					if (instruction.length > 1 && instruction[0] == "inset") {
						inset = true;
						tag.push(instruction[1]);
					} else if (instruction.length > 1) {
						tag.push("<div class='" + instruction[0] + "'>" + instruction[1] + "</div>");
					} else {
						tag.push(instruction[0]);
					}
					break;
	
				case "bold": // bold tag
				case "strong":
				case "b":
					tag.push(renderTag(instruction,"strong",className));
					break;
	
				case "italic": // italic tag
				case "em":
				case "i":
					tag.push(renderTag(instruction,"em",className));
					break;
	
				case "quote": // block quote tag
				case "q":
					tag.push(Handlebars.getCompiledTemplate("blockquote", {
						"value": instruction[0]
					}));
					break;
					
				case "p": case "h1": case "h2": case "h3": case "h4": case "h5": case "h6": case "div": case "span":
					tag.push(renderTag(instruction, command, className));
					break;

				case "tag": // any html tag
					tag.push(renderTag(instruction));
					break;
					
				case "ref": // reference
					tag.push("<sup data-id='" + instruction[0] + "' title='Tap to show " + __settings.navigation.resources.label + "'><i class='icon-tag'></i></sup>");
					break;
					
				case "term": // glossary
					var glossary = appendSettings("glossary"),
						term = ""; // blocking load if not yet initialised
					$.each(__settings.glossary.terms, function(i,t) {
						if (t.term==instruction[0]) term = t.definition;
					});
					if (term.length) {
						tag.push("<a href='#' class='glossary-term' data-tip='" + escape(term) + "'>" + instruction[0] + " <i class='icon-question-sign icon-super'></i></a>");
					} else {
						tag.push(instruction[0]); // nothing to do, maybe bugged?
					}
					// tag.push("<dfn data='" + instruction[1] + "'>" + instruction[0] + "</dfn>");
					break;
					
				case "clickimage": // checkbox over image type interaction
					// format is imageN|textN|imageN+1|textN+1 etc
					var myUniqueId =   + "_" + _global_increment,
						_opts = [], _feedback = [],
						_oData = getState("rpqiz_" + myUniqueId).split(_avideSep)
					for (var i=0,j=0; i<instruction.length; i+=2) {
						_opts.push({
							"media": __global_root + "/en-us/Content/media/" + instruction[i],
							"props": imageProperties(instruction[i]),
							"label": instruction[i+1],
							"selected": ($.inArray(j+'', _oData) != -1)
						});
						if ($.inArray(j+'', _oData) != -1) _feedback.push(instruction[i+1]);
						j++;
					}
					//console.log("opts", _opts);
					tag.push(Handlebars.getCompiledTemplate("clickimage", {
						"uniqueid": myUniqueId,
						"option": _opts,
						"count": _opts.length,
						"feedback": _feedback.join(", ")
					}));
					_global_increment++;
					break;
					
				case "clickcheck": // checkbox next to text type interaction
					// format is textN|textN+1 etc
					var myUniqueId = _nPageCurrent + "_" + _global_increment,
						_opts = [], _feedback = [],
						_oData = getState("rpqiz_" + myUniqueId).split(_avideSep);
					for (var i=0; i<instruction.length; i++) {
						_opts.push({
							"label": instruction[i],
							"selected": ($.inArray(i+'', _oData) != -1)
						});
						if ($.inArray(i+'', _oData) != -1) _feedback.push(instruction[i]);
					}
					tag.push(Handlebars.getCompiledTemplate("clickcheck",{
						"uniqueid": myUniqueId,
						"option": _opts,
						"feedback": _feedback.join(", ")
					}));
					_global_increment++;
					break;

				case "clicktf": // checkbox next to text type interaction
					// format is positive-text|negative-text|text1|text2|textN etc
					var myUniqueId = _nPageCurrent + "_" + _global_increment,
						_opts = [],
						_oData = getState("rpqiz_" + myUniqueId).split(_avideSep);
					for (var i=2; i<instruction.length; i++) {
						_opts.push({
							"label": instruction[i],
							"selected": ($.inArray((i-2).toString(), _oData) != -1)
						});
					}
					tag.push(Handlebars.getCompiledTemplate("clicktf",{
						"uniqueid": myUniqueId,
						"option": _opts,
						"positive": instruction[0],
						"negative": instruction[1],
						"feedback": (_oData[0] > "" ? "Your answers have been saved" : "")
					}));
					_global_increment++;
					break;
					
				case "survey": // 1-N type ranged radio button survey
					// numeric-range|text1|text2|text3
					var myUniqueId = _nPageCurrent + "_" + _global_increment,
						_opts = [], _range = [],
						_oData = getState("rpqiz_" + myUniqueId).split(_avideSep);
						//console.log(_oData);
					for (var i=1; i<instruction.length; i++) {
						_opts.push({
							"label": instruction[i],
							"selected": parseInt(_oData[i-1],10)
						});
					}
					for (var i=0; i<instruction[0]; i++) _range.push({ "label": i+1 });
					tag.push(Handlebars.getCompiledTemplate("clicksurvey",{
						"uniqueid": myUniqueId,
						"row": _opts,
						"range": _range,
						"feedback": (_oData[0] > "")
					}));
					_global_increment++;
					break;

				case "shortanswer":
					var myUniqueId = _nPageCurrent + "_" + _global_increment,
						_oData = LZString.decompress(getState("rpsa_" + myUniqueId)),
						_len = _oData ? _oData.length : 0;
					tag.push(Handlebars.getCompiledTemplate("shortanswer",{
						"uniqueid": myUniqueId,
						"question": instruction[0],
						"value": _oData,
						"remaining": (160 - _len),
						"feedback": (_len > 0)
					}));
					_global_increment++;
					break;
				
				case "wrap": // span wrapper with classname
					// classname, text
					tag.push("<span class='" + instruction[0] + "'>" + instruction[1] + "</span>");
					break;

				case "block": // div wrapper with classname
					// classname, text
					tag.push("<div class='" + instruction[0] + "'>" + instruction[1] + "</div>");
					break;
					
				case "clear": // inline style to apply a clear; e.g. {clear both}
					tag.push("<div style='clear:" + instruction[0] + "'><span ></span></div>");
					break;
					
				case "tabsequence": // jqueryui tabs, except only actionable using a {next} and {previous} buttons, rather than clickable
				case "tabs": // jqueryui tabs
				case "accordion": // jqueryui accordion
					// titleN|hrefN|titleN+1|hrefN+1
					var myUniqueId = _nPageCurrent + "_" + _global_increment,
						_tab = [];
					for (var i=0; i<instruction.length; i+=2) {
						if (instruction[i+1].endsWith(".html") || instruction[i+1].endsWith(".txt")) {
							$.ajax({
								url:  __global_root + "/en-us/Content/" + instruction[i+1],
								success: function (response) {
									//console.log("loading file for tabs", response);
									_tab.push({
										"title": instruction[i],
										"content": processString(response, "auto", false)
									});
								},
								error: function () {
									_tab.push({
										"title": instruction[i],
										"content": "<p class='error'>Error loading " + instruction[i+1] + "</p>"
									});
								},
								async: false
							});
						} else {
							_tab.push({
								"title": instruction[i],
								"content": instruction[i+1]
							});
						}
					}
					// command = template, e.g. tabs.txt, accordion.txt etc; data format is the same
					tag.push(Handlebars.getCompiledTemplate(command,{
						"uniqueid": myUniqueId,
						"tab": _tab
					}));
					_global_increment++;
					break;
					
				case "tipbutton":
					if (instruction.length==3) {
						tag.push("<button class='tipbutton' data-tip='" + escape(instruction[2]) + "' data-title='" + escape(instruction[1]) + "'><i class='icon-comment'></i> " + instruction[0] + "</button>");
					} else {
						tag.push("<button class='tipbutton' data-tip='" + escape(instruction[1]) + "'><i class='icon-comment'></i> " + instruction[0] + "</button>");
					}
					break;
	
				case "tiptext":
					if (instruction.length == 3 && instruction[0] == "noicon") {
						tag.push("<a href='#' class='tiptext no-tiptext-icon' data-tip='" + escape(instruction[2]) + "'>" + instruction[1] + "</a>");
					} else if (instruction.length == 3) {
						tag.push("<a href='#' class='tiptext " + instruction[0] + "' data-tip='" + escape(instruction[2]) + "'>" + instruction[1] + "</a>");
					} else {
						tag.push("<a href='#' class='tiptext' data-tip='" + escape(instruction[1]) + "'>" + instruction[0] + " <i class='icon-search icon-super'></i></a>");
					}
					break;
					
				case "goto":
					tag.push("<a href='#' class='goto' data-destination='" + instruction[0] + "'>" + instruction[1] + "</a>");
					break;
	
				case "balloon": // tipTip, depreciated, use tiptext
					// {balloon ip this is my popup text|this is my visible text}
					tag.push("<span class='tooltip' title='" + instruction[1] + "'>" + instruction[0] + "</span>");
					break;
					
				case "flip": // click-flip cards
					// side_1_N|side_2_N|side_1_N+1|side_2_N+1
					var myUniqueId = _nPageCurrent + "_" + _global_increment,
						_card = [];
					for (var i=0; i<instruction.length; i+=2) {
						_card.push({
							"front": (instruction[i].indexOf("{")!=-1) ? processString(instruction[i],"auto",false) : instruction[i],
							"back": (instruction[i+1].indexOf("{")!=-1) ? processString(instruction[i+1],"auto",false) : instruction[i+1]
						});
					}
					tag.push(Handlebars.getCompiledTemplate("flipcards",{
						"uniqueid": myUniqueId,
						"card": _card
					}));
					_global_increment++;
					break;
	
				case "ifcomplete": // if is complete/passed, show statement 1 otherwise show statement 2
				    if (isComplete(checkCourseCompletion())) {
				    	tag.push(instruction[0]);
				    } else {
				    	tag.push(instruction[1]);
				    }
				    break;

				case "passedfailed":
				case "passfailed":
				case "passedfail":
				case "passfail": // page that shows the pass/fail statement (kinda like the completion statement but commits on fails too)
				    var sLearnerName = getLearnerName(),
				    	aMonths = _sMonths.split(","),
				    	d = new Date(),
				    	sCompletionStatus = checkCourseCompletion(true),
				    	userScore = Math.min(100,Math.round(getOverallScore())),
				    	bIsCourseCompleted = (sCompletionStatus == "passed" || (sCompletionStatus == "completed" && userScore >= __settings.course.passingScore)),
				    	sTemplate = (bIsCourseCompleted) ? "passed" : "failed";
				    tag.push(Handlebars.getCompiledTemplate("completion\/" + sTemplate, {
					"title": bIsCourseCompleted ? instruction[0] : instruction[1],
					"score": userScore,
					"passingScore": __settings.course.passingScore,
					"completionMessage": __settings.course.completionMessage,
					"status": sCompletionStatus,
					"name": (sLearnerName != "" ? sLearnerName : _sTextLearnerName),
					"date": aMonths[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear()
				    }));
				    break;

				case "completion": // page that shows the completed statement
				    var sLearnerName = getLearnerName(),
				    	aMonths = _sMonths.split(","),
				    	d = new Date(),
				    	sCompletionStatus = checkCourseCompletion(),
					    bIsCourseCompleted = isComplete(sCompletionStatus),
				    	sTemplate = (bIsCourseCompleted) ? "competent" : "notyetcompetent";
					tag.push(Handlebars.getCompiledTemplate("completion\/" + sTemplate, {
						"title": bIsCourseCompleted ? instruction[0] : instruction[1],
						"score": Math.min(100,Math.round(getOverallScore())),
						"passingScore": __settings.course.passingScore,
						"completionMessage": __settings.course.completionMessage,
						"status": sCompletionStatus,
						"name": (sLearnerName != "" ? sLearnerName : _sTextLearnerName),
						"date": aMonths[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear()
					}));
					break;
					
				case "slideshow": // malsup cycle plugin
					var myUniqueId = _nPageCurrent + "_" + _global_increment,
						_slide = [],
						_fx = instruction.shift(), // consume effect,
						_delay = 5;
					if (instruction[0].isANumber()) { // not numeric, set default
						_delay = parseInt(instruction.shift(),10); // consume delay from instruction
					}
					for (var i=0,j=instruction.length; i<j; i++) {
						if (instruction[i].endsWith(".html") || instruction[i].endsWith(".txt")) {
							$.ajax({
								url:  __global_root + "/en-us/Content/" + instruction[i],
								success: function (response) {
									_slide.push({
										"type": "string",
										"text": processString(response,"auto",false)
									});
								},
								error: function () {
									_slide.push({
										"type": "string",
										"text": "<p class='error'>Error loading " + instruction[i] + "</p>"
									});
								},
								async: false
							});
						} else if (isValidImage(instruction[i])) {
							_slide.push({
								"type": "image",
								"uri": instruction[i],
								"props": imageProperties(instruction[i])
							});
						} else {
							_slide.push({
								"type": "string",
								"text": processString(instruction[i],"auto",false)
							});
						}
					}
					tag.push(Handlebars.getCompiledTemplate("slideshow",{
						"delay": _delay,
						"navigation": (_delay == 0),
						"uniqueid": myUniqueId,
						"effect": _fx,
						"slide": _slide
					}));
					_global_increment++;
					break;
					
				case "columns": // even grid supporting 2/3/4/5 columns
					tag.push(Handlebars.getCompiledTemplate("grids/ngrid",{
						"total": instruction.length,
						"column": instruction,
						"classname": className
					}));
					break;
                
              	case "colcount": // use css to make columns
                	var count = instruction.shift();
                	tag.push("<div class='css-cols' style='column-count:" + count + "'>" + instruction + "</div>");
                    break;
					
				case "caption":
					var theme = (instruction.length==3) ? instruction[0] : "theme",
						img = (instruction.length==3) ? instruction[1] : instruction[0],
						val = (instruction.length==3) ? instruction[2] : instruction[1];
					tag.push("<figure class='image-caption " + theme + "'>" + imageTag(img) + "<figcaption>" + val + "</figcaption></figure>");
					break;
					
				case "splitimage":
					tag.push("<figure class='split-image' id='split_" + (_global_increment++) + "'>");
					tag.push("<div>" + imageTag(instruction[0]) + "</div>"); //<img src='" + __global_root + "/en-us/Content/media/" + instruction[0] + "'></div>");
					tag.push("<div>" + imageTag(instruction[1]) + "</div>"); //<img src='" + __global_root + "/en-us/Content/media/" + instruction[1] + "'></div>");
					tag.push("</figure>");
					break;
					
				case "slidebox":
					tag.push("<div class='slide-box " + className + "' data-orientation='" + instruction[0] + "'>");
						tag.push("<div class='pages'>");
						for (var i=1; i<instruction.length; i++) {
							if (instruction[i].endsWith(".html") || instruction[i].endsWith(".txt")) {
								$.ajax({
									url:  __global_root + "/en-us/Content/" + instruction[i],
									success: function (response) {
										tag.push("<div class='page'>" + processString(response,"auto",false) + "</div>");
									},
									error: function () {
										tag.push("<div class='page'><p class='error'>Error loading " + instruction[i] + "</p></div>");
									},
									async: false
								});
							} else if (instruction[i].endsWith(".gif") || instruction[i].endsWith(".png") || instruction[i].endsWith(".jpg")) {
								tag.push("<div class='page'>" + imageTag(instruction[0]) + "</div>");
							} else {
								tag.push("<div class='page'>" + instruction[i] + "</div>"); // should have already parsed it
							}
						}
						tag.push("</div>");
						tag.push("<div class='navigator'>");
							tag.push("<div class='action-minus'><i class='icon-hand-"+(instruction[0]=='vertical'?"up":"left")+"'></i></div>");
							tag.push("<span>Page 1 of " + (instruction.length-1) + "</span>");
							tag.push("<div class='action-plus'><i class='icon-hand-"+(instruction[0]=='vertical'?"down":"right")+"'></i></div>");
						tag.push("</div>")

						// tag.push("<div class='swipe-hint'><i class='icon-info-sign'></i> " + (_sniff_isTablet ? "Swipe this area" : "Hover over") + " the area" + (_sniff_isTablet ? (instruction[0]=='vertical' ? " up & down" : "left & right") : " above") + " for more ...</div>");

					tag.push("</div>");
					break;
					
				case "match":
					var myUniqueId = _nPageCurrent + "_" + _global_increment,
						//_oData = getState("rpqiz_" + myUniqueId).split(_avideSep),
						k = (instruction.length % 2 === 0) ? 0 : 1, // if we have save overlays then skip first array entry
						quest = [], ans = [], pair = [],
						options = (instruction.length % 2 === 0) ? [""] : instruction[0].split("#");
					for (var i=k,j=instruction.length; i<j; i+=2) {
						quest.push({order:k, text:instruction[i]});
						ans.push({order:k++,text:instruction[i+1]});
					}
					fy(ans); // fisher-yates shuffle
					for (var i=0,j=quest.length;i<j;i++) {
						pair.push({q:quest[i],a:ans[i]});
					}
					tag.push(Handlebars.getCompiledTemplate("activitymatch",{
						"uniqueid": myUniqueId,
						"user": getState("rpqiz_" + myUniqueId), // _oData
						"pair": pair,
						"logic": options[0],
						"dropcol": options[1] || "Your Answer",
						"dragcol": options[2] || "Possible answers"
					}));
					_global_increment++;
					break;

				case "matchset":
					var myUniqueId = _nPageCurrent + "_" + _global_increment,
						quest = [], ans = {},
						inc = 1, // first answer is index 1, because index 0 is "not yet answered"
						k = (instruction.length % 2 === 0) ? 0 : 1; // if we have save overlays then skip first array entry
		for (var i=k,j=instruction.length; i<j; i+=2) if (!ans.hasOwnProperty(instruction[i+1])) ans[instruction[i+1]] = inc++;
		for (var i=k,j=instruction.length; i<j; i+=2) quest.push({order:k++, text:instruction[i], answer: ans[instruction[i+1]]});
		// for (var i=0,j=instruction.length; i<j; i+=2) {
		// 	if (!ans.hasOwnProperty(instruction[i+1])) ans[instruction[i+1]] = k++;
		// }
		// k = 0;
		// for (var i=0,j=instruction.length; i<j; i+=2) {
		// 	quest.push({order:k++, text:instruction[i], answer: ans[instruction[i+1]]});
		// }
					//fy(quest); // fisher-yates shuffle
					tag.push(Handlebars.getCompiledTemplate("activitymatchset",{
						"uniqueid": myUniqueId,
						"user": getState("rpqiz_" + myUniqueId),
						"answers": ans,
						"questions": quest,
						"logic": (instruction.length % 2 === 0) ? "" : instruction[0]
					}));
					_global_increment++;
					break;

				case "matchcols": // both these use the same data structure
				case "matchrows":
					var myUniqueId = _nPageCurrent + "_" + _global_increment,
						quest = {}, ans = [],
						k = (instruction.length % 2 === 0) ? 0 : 1, // if we have save overlays then skip first array entry,
						options = (instruction.length % 2 === 0) ? [""] : instruction[0].split("#");
		for (var i=k,j=instruction.length, l=0; i<j; i+=2) if (!quest.hasOwnProperty(instruction[i])) quest[instruction[i]] = l++;
		for (var i=k,j=instruction.length; i<j; i+=2) ans.push({order:k++, text:instruction[i+1], answer: quest[instruction[i]]});
					fy(ans); // fisher-yates shuffle
					tag.push(Handlebars.getCompiledTemplate("activity"+command,{
						"uniqueid": myUniqueId,
						"user": getState("rpqiz_" + myUniqueId),
						"answers": ans,
						"questions": quest,
						"total": Object.keys(quest).length,
						"logic": options[0],
						"dropcol": options[1] || "Your Answers",
						"dragcol": options[2] || "Options"
					}));
					_global_increment++;
					break;

                case "setscore": // tell the page that you want a score to be set (basically a hidden activity)
					var myUniqueId = _nPageCurrent + "_" + _global_increment,
						score = ~~instruction[0];
					tag.push("<div data-action='setscore' data-value='" + score + "' data-scormid='rpqiz_" + myUniqueId + "'></div>");
					_global_increment++;
					break;
					
				default: // no matched instruction
					tag.push(missing);
					break;

			}
		}
		
		inp = inp.replace(wholecommand, tag.join(""));
		// NOW replace lines containing {/} with proper paragraphs
		if (inp.indexOf("{/}") != -1) {
			inp = (function() {
				return $.map(inp.split("{/}"), function(c) { if (c.length) return '<p>' + c + '</p>'; }).join("");
			})();
		}

	} while ((inp.indexOf("{")!=-1) && (inp.indexOf("}", inp.indexOf("{")+1)!=-1) && (loops++<maxLoops)); // max tag recursion
	returnAr = [inp,container]; // inp.replace("\\ ","<br></maxLoops>")
	if (inset) returnAr.push("inset");
	return returnAr;
}

function renderTag(instruction, tagName, cssTag) {
	if (typeof tagName === 'undefined') tagName = instruction[0].split('.')[0]; // e.g. p.small => p
	if (typeof cssTag === 'undefined') cssTag = (instruction[0].indexOf(".") === -1) ? "" : instruction[0].split(".").slice(-1).join(" "), instruction.shift(); // e.g. p.small => small
	if (cssTag.length) cssTag = " class='" + cssTag + "'";
	// prioritise instruction position 1 over zero, depending on how renderTag was called
	return "<" + tagName + cssTag + ">" + instruction.join("") + "</" + tagName + ">";
}

function videoPlayerCode(url, sze, custW, custH, ytEmbed) {
var size = parseInt(sze,10);
	var sizes = [
			[custW,custH],
			[560,315],
			[640,360],
			[853,480],
			[1280,720]
		];
	var w = sizes[size][0],
		h = sizes[size][1],
		strWH = "width='" + w + "' height='" + h + "' ";
	if (url.indexOf("vimeo.com") != -1) {
		if (url.indexOf("player.vimeo.com")===-1) url = url.replace("vimeo.com","player.vimeo.com/video");
		if (url.indexOf("?")===-1) url += "?byline=0&portrait=0&color=" + __settings.layout.basecolour.replace(/\#/,"");
		return "<iframe src='" + url + "?byline=0&portrait=0&color=" + __settings.layout.basecolour.replace(/\#/,"") + "' " + strWH + " frameborder='0' webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>";
	} else if (url.indexOf("youtube.") != -1) {
		if (ytEmbed) return "<div id='ytvideo'></div>"; // EmbedAndPlay_Youtube
		url = url.split("?")[0].replace("youtube.","youtube-nocookie.");
		url = url.replace("watch?v=","embed/").replace("http://","//").replace("https://","//"); // security avoidance, try to avoid different port / protocol
		url = url + "?rel=0&showinfo=0" + ((size==0)?"&fs=1":"");
		return "<iframe " + strWH + " src='" + url + "' frameborder='0' allowfullscreen allow='autoplay; encrypted-media'></iframe>";

		// https://www.youtube.com/embed/b6yWgpsrJzQ?feature=oembed
		// <iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/7B9FgUkh1c0?rel=0&showinfo=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

	} else if (url.indexOf("ted.") != -1) {
		return "<iframe src='" + url + "' " + strWH + " frameborder='0' scrolling='no' webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>";
	} else {
		return "unsupported video url";
	}
}
