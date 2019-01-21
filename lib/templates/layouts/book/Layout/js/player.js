var __global_root = window.location.href.split("?")[0].split("#")[0],
	_loader = null; 

//!important
// prefix all links with this root to make them compatible with Moodle virtual filesystem
__global_root = __global_root.substring(0, __global_root.lastIndexOf('/en-us'));

/* =========================================================================================================
 *
 * 	The SCORM engine, layout and file loader portions of the player
 *	Heavily modified from original; http://www.e-learningconsulting.com/products/authoring/authoring.html
 *	Most of this file is copyright: avide e-learning, coursesuite pty ptd
 *	Programmer: tim.stclair@gmail.com, http://about.me/timstclair
 *
 * ========================================================================================================= */	

var _sVersion = "2.1";               // this is the version number of this template - will be recorded in suspend data
var _oPages;                         // keeps the pages within the current language.
var _sLanguage = "en-us";    		 // the selected language, example en-us
var _nNodes = 0;					 // the number of nodes in the course
var _nPageCurrent;			 		 // the current page id, example 1, 2, 3
var _nBookmark = 0;				     // the bookmark
var _bSilentExit = false;			 // true if we do not want to warn pop up an alert when the course closes
var _bDragging = false;				 // true when the TOC resize bar is dragged
var _sTocWidth;						 // the current size of the TOC
var _sCourseTitle;					 // course title
var _sStatusRestore = "";			 // data from suspend_data
var _sSep   = "{{";					 // separates information within suspend_data
var _aRestoredStatus = new Array();	 // the restored status
var _aNodeStatus = new Array();      // an array to hold the status for each node in the course
var _aState = new Array();	 		 // holds the state data
var _wProgress;                      // 'progress' popup
var _sNavigateFailMsg;               // holds the warning message when a specific page cannot be navigated
var _bTocAutoClose = true;          // true if Table of Contents sections should auto-close
var _global_increment = 0;			// for generating id's

// instance : store details about a node
function NodeStatus(sId, sTocPath, sTitle, sHtmlFileName, bExpanded, bHasChildren, nParentId, sStatus, nScore, sContribute, sType, sTemplate) {
	this.sId = sId; // node
	this.sTocPath = sTocPath; // node path as a underscore-seperated heirarchy
	this.sTitle = sTitle; // title of the page
	this.sHtmlFileName = sHtmlFileName; // filename of the page
	this.bExpanded = bExpanded; // internal node for tree, is the node expanded?
	this.bHasChildren = bHasChildren; // internal node for the tree, does the node have child nodes?
	this.nParentId = nParentId; // backreference to this nodes parent (or null)
	this.sStatus = sStatus; // n:none, p:passed, i:incomplete, c:completed
	this.nScore = nScore; // score for this page is out of if it has a quiz
	this.sContribute = sContribute; // percentge of overall score this page contributes
	this.sType = sType; // node type (i.e. page, quiz, etc)
	this.sTemplate = sTemplate; // base grid to use for this page
}

// ## LOCALIZED STRINGS - the strings are defined in Language.xml in the Configuration folder
var _sProgressCompletionStatus;
var _sProgressComplete;
var _sProgressIncomplete;
var _sButtonNext;
var _sButtonPrevious;
var _sIncompleteCourseBoth;
var _sIncompleteCourse;
var _sButtonGlossary;
var _sButtonResources;
var _sButtonHelp;
var _sButtonProgress;
var _sButtonExitProgress;

// ## START AND END SCO SESSION
// this function is called when the SCO is loaded
// perform tasks to initialize the launch of the SCO
function initSCO() {

    // remember the start time so we can record the duration of this session when the SCO session ends
	startSessionTime();
	
	// see if this is the first launch of the SCO by this learner
	if (isFirstLaunch()) {
		// it is, set the status to incomplete so the LMS knows the learner is not done with this SCO yet
		if (getCompletionStatus() == "not attempted") setCompletionStatus("incomplete");
		
	}

	// we will need to get the bookmark in the next session so tell the LMS that the learner may return in the future
	learnerWillReturn(true);
	
	// get the state information for the entire SCO - need to do this because we reload pages to switch languages
	loadState();
	
	// get the bookmark (the bookmark was set in a previous session)
	_nBookmark = getBookmark();
	
	// get the node status, it is stored in X,Y:X,Y:... X is the visited status, Y is the time
	_sStatusRestore = getState("PATHMARK");
	// see if we have any node status
	if (_sStatusRestore != "") {
		// we do, break it apart
		var aParts = _sStatusRestore.split(":");
		
		// get the length of the array
		var nLen = aParts.length;
		
		// loop through the array
		for (var i=0; i<nLen; i++) {
			// break apart the pair data
			var aStatus = aParts[i].split(",");
			// get a new 'restoredStatus' object
			var restoredStatus = new Object();
			restoredStatus.sStatus = aStatus[0];
			restoredStatus.nScore = aStatus[1] - 0;
			
			// assign the visited and time status elements to global arrays
			_aRestoredStatus[i + 1] = restoredStatus;
			
		}
	}
}

// terminate the SCO session
// TODO: consider using https://github.com/kangax/iseventsupported
var __global__termsco__hasrun = false; // TODO: avoid this!
function termSCO() {
	if (__global__termsco__hasrun) return;
	if (frames["FRM_CONTENT"] && frames["FRM_CONTENT"].termQuiz) frames["FRM_CONTENT"].termQuiz();
    saveState();
    checkCourseCompletion();
	setSessionTime(_timeSessionStart);
	termCommunications();
	__global__termsco__hasrun = true;
}

// check to see if the course is complete
function checkCourseCompletion() {
    // Get current course completion status
    var sCompletion = getCompletionStatus();
    
	// see if this course is not complete
    if (!isComplete(sCompletion)) {
        // the course is not complete, loop through all of the nodes to check their status - return if the completion criteria for any page is not met
        for (var i = 1; i <= _nNodes; i++) {
            // check the contribution type
            switch (_aNodeStatus[i].sContribute) {
                // user must pass  
                case "p":
                    // user must visit
                case "v":
                    // user must complete
                case "c":
                    if (_aNodeStatus[i].sStatus != "c") return sCompletion;
                    break;
            }
        }

        sCompletion = "completed";
        // all pages required to be visited, completed or passed are done, so set the course as complete and say the user does not plan to return
        setCompletionStatus(sCompletion);

        // get the overall score
        var nOverallScore = Math.min(100,getOverallScore()); // in case of rounding errors / exceeding max score for scorm

        // see if exists an overall score
        if (nOverallScore != null) {
            // exists, report an overall score to the LMS
            setScore(nOverallScore / 100);

            // see if the user passed the course
            if (nOverallScore >= __settings.course.passingScore) {
                // it is passed
                setPassFail("passed");
            }
            else {
                // it is failed
                setPassFail("failed");
            }
        }

        // learner does not need to return
        learnerWillReturn(false);
    }

    return sCompletion;
}

// ask SCORM if the course is complete
function isComplete(sCompletionStatus) {
	// return true if the status us completed
	// this SCO package assumes completed/passed equivalency
    return (sCompletionStatus == "completed" || sCompletionStatus == "passed") ? true : false;
}

function initCourse() {
    try {
	    netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    } catch (e) {}
    
    // get the state data for the SCO
	initSCO();
	
    // load the 'Pages.xml' file
    var oXMLPages = getXmlDocument("Pages.xml");

    // get the pages within the SCO node.
    _oPages = oXMLPages.getElementsByTagName("sco")[0].childNodes;

    // load the language strings
    loadLanguage();
}


/*
 * Recursive routine to draw the menu bar
 * Expands current nodes children by examining "TocPath"
//	oXML - the XML of this level
//	nLevel - the level in the XML, example 1
//	sTocPath - the node's path, example 1_2_3

 */
function tocJSON(oXML, nLevel, sTocPath) {
    var sTitle, sContribute, sId, sType, sTemplate;
	var sEffect, sPath, sVisible; // tim's extensions

	var nodes = [];
	
	// init s to hold the DHTML - storing as array using s[s.length] is faster than s.push and much, much faster than s += ""
	var jTocIncrementor = 0;

	var tempTocPath = sTocPath; // remember the toc path before looping
	var nParentId = _nNodes; // remember parent id
	
	// loop through the items in this level
	for (var j=0; j<oXML.length; j++) {

		if (oXML[j].nodeType != 1) continue;
		var currentElem = oXML[j],
			node = {},
			sTemplate = "grid1212l"; // currentElem.getAttribute("template");

		node["filename"] = currentElem.getAttribute("fileName");
		node["hidden"] = ((node.filename.indexOf("popup")==0) || (node.filename.indexOf("include")==0) || (node.filename.indexOf("parse")==0));

		if (node.hidden) continue;

		node["title"] = currentElem.getAttribute("title");

        sTocPath = (tempTocPath == "") ? (jTocIncrementor++).toString() : [tempTocPath,jTocIncrementor++].join("_");
		node["path"] = sTocPath;

		if ($.trim(sTemplate)==="") sTemplate='auto'
		node["template"] = sTemplate;

		node["contribute"] = currentElem.getAttribute("contribute");
		node["type"] = currentElem.getAttribute("type");
		node["id"] = currentElem.getAttribute("id");

        _nNodes++;
		node["number"] = _nNodes;
    
        // get visited visited status
        var sStatus = "n", nScore = 0;
        if (_aRestoredStatus[_nNodes] != undefined)
        {
            // get status values from the restored array
            sStatus = _aRestoredStatus[_nNodes].sStatus;
            // get the page score from the restored status array
            nScore = _aRestoredStatus[_nNodes].nScore;
        }

        // initialize the new node by adding it in the nodes array.
        _aNodeStatus[_nNodes] = new NodeStatus(sId, sTocPath, node["title"], node["filename"], true, false, nParentId, sStatus, nScore, node["contribute"], node["type"], node["template"]);
        _aNodeStatus[_nNodes].nContributeScore = currentElem.getAttribute("contributeScore") - 0;
        _aNodeStatus[_nNodes].nContributePercentage = currentElem.getAttribute("contributePercentage") - 0;
        _aNodeStatus[_nNodes].sNavigation = currentElem.getAttribute("nav");
        _aNodeStatus[_nNodes].nNavigationScore = currentElem.getAttribute("contributeScore") - 0;

		node["status"] = {
			"value": sStatus,
			"text": getStatusImageTitle(_nNodes),
			"icon": getNodeStatusIcon(_nNodes)
		}

		node["page"] = false;
		var oChildren = currentElem.childNodes;
		if (getTotalChildrenLength(oChildren) > 0) {
		    setPageHasChildren(_nNodes, true);
			node["page"] = tocJSON(oChildren, nLevel + 1, sTocPath);
		}
		nodes.push(node); // {"page":node});

	}

	return nodes;
}

// gets the number of xml elements (exclude line breaks, whitespaces) in node.
function getChildrenLength(oXML)
{
    var nCount = 0;
    for (var i = 0; i < oXML.length; i++) {
        // check if the node is an 'element', example 1
        if (oXML[i].nodeType == 1) {
			var fName = oXML[i].getAttribute("fileName");
			if ((fName.indexOf("popup")==0) || (fName.indexOf("include")==0) || (fName.indexOf("parse")==0)) continue; // skip hidden children
            nCount++;
        }
    }
    // return length
    return nCount;
}
function getTotalChildrenLength(oXML)
{
    var nCount = 0;
    for (var i = 0; i < oXML.length; i++) {
        // check if the node is an 'element', example 1
        if (oXML[i].nodeType == 1) {
            nCount++;
        }
    }
    // return length
    return nCount;
}

// ## PAGE NAVIGATION

// request to go to the next page
function NextPage() {
	if ($("a[data-action].Next").filter(":first").hasClass('NavLink')) {
		LoadContent(_nPageCurrent + 1);
	}
}

// navigate to the previous page
function PreviousPage() {
	if ($("a[data-action].Previous").filter(":first").hasClass('NavLink')) {
	// navigate to the new page
	    LoadContent(_nPageCurrent - 1);
	}
}

// navigate to the home page
function HomePage() {
	if (__settings.navigation.home.uri == "") {
		LoadContent(1); // index is 1 based for some reason
	} else {
		document.location.href = __settings.navigation.home.uri;
	}
}

// go to specified file name
function gotoPage(sHtmlFileName) {
   var nId = getIdByFileName(sHtmlFileName);
   if (nId == 0) {
        alert('Page ' + sHtmlFileName + ' cannot be found');
        return;
   }
   LoadContent(nId);
}

// animate page turn left or right
function triggerBookPageTurnAnim(dir) {
	var $old = $("#book-clone"),
		$new = $("#book");
	if ($old.length) {
		var w = $new.width(),
			l = (dir * (w/2));
		$old.css({"width":w}).animate({
			opacity: 0,
			left: l
		}, 250, function () {
			$old.remove();
		});
	}
}


// finishes the current page, then goes to the index of the requested page
function LoadContent(nID, avoidHistory) {

	console.log("current page", _nPageCurrent, "new page", nID);

	var _direction = (_nPageCurrent < nID) ? -1 : 1;

	console.log("direction", _direction);
	
    // calculate current test status
    if (frames["FRM_CONTENT"]) {
    	if (frames["FRM_CONTENT"].termQuiz) frames["FRM_CONTENT"].termQuiz();
    	$("#contentContainer").css("overflow","auto"); // reset overflow
	    $("#FRM_CONTENT").remove(); // unloads frame from memory
	    $(window).unbind("resize.iframe");
    }

    // check if the requested page can be naviagated
    if (canNavigatePage(nID) == false) {
        // display an aler message
        alert(_sNavigateFailMsg);
        // skip page loading
        return;
    }

	// reset the global increment
	_global_increment = 0;

	// get the file name for the current id
	var fileName = getPageHtmlFileName(nID);
	
	// reference to the name of this page
	var pageTitle = getPageTitle(nID);
	
	//get the type of file that we are going to work with
	var fileType = getPageType(nID);
	
	//get the grid template for this item
	var sGrid = "auto"; // getPageTemplate(nID);

	// close any submenus that might be lurking about
	$(document).trigger("hide_submenus");

	var $oldbook = $("#book"),
		$content = $("#contentContainer").scrollTop(0); // empty().
		
	if ($oldbook.length) {
		$oldbook.attr("id","book-clone").css({"z-index":4,"position":"absolute"});
		$oldbook = $("#book-clone");
	}
	
	// $content.append("<div style='position:absolute;left:48%;top:48%;z-index:99' id='loading'><i class='icon-spinner icon-spin icon-4x icon-muted'></i></div>"); // }, 789);
	
	if (fileType == "quiz" || fileType == "test" || (fileType.indexOf("question") != -1)) { // until we can do better; avoids scope problems
		$content.css({
			"overflow":"hidden",
			"padding-right": "0"
		});
		_cWidth = $content.width(); _cHeight = $content.height();
        if (avoidHistory !== true) history.pushState( {id: nID}, pageTitle, location.href); // href never changes
		var $iframe = $("<iframe />").attr({
				title: "Quiz content",
				width: "100%",
				scrolling: "no",
				height: "100%",
				frameborder: "0",
				src: __global_root + "/en-us/Quiz.html?filename=" + fileName + "&w=" + _cWidth + "&h=" + _cHeight,
				id: "FRM_CONTENT",
				name: "FRM_CONTENT",
				allowTransparency: "true"
			})
			.css({
				width: _cWidth,
				height: _cHeight,
				visibility: "hidden"
			})
			.appendTo($("<div id='book' />").appendTo($content));
		$(window).bind("resize.iframe", function () {
			resizeIframe();
		});
		
	} else {
		
		// load the file's body to a dummy object (filename space search notation)
		$.get(__global_root + "/en-us/Content/" + fileName + "?" + Math.random(), function (response, status, xhr) {
			
			if (status != "error") {
			
				// $content.css("padding-right","1em");
				
				// actually, push state to history now that we know we have navigated to a loadable place
				// so next/prev and hyperlink clicks all come through this one spot
		        if (avoidHistory !== true) history.pushState( {id: nID}, pageTitle, location.href); // href never changes
		        // update window title
		        document.title = __settings.course.name + ": " + pageTitle;
				
				// here's the guts of the string processing engine, which returns the ready-to-use HTML template
				$content.html(processString(response, sGrid, true));

				// console.log(fileName, "left",leftPage, "right",rightPage,"end");
		
	
				// re-bind any jquery on these objects for events that we might have just bound to (ideally use live/on, needs refactor)
				reBindThingsThatMightBeDynamicallyLoaded();
				
			} else {
				if (_loader) clearTimeout(_loader);
				$content.html("<p class='error'>Problem loading page - " + fileName + "</p>");
			}
			
		});
	} // quiz
	
	// remmeber this page as the current page
	_nPageCurrent = nID - 0;
	
	// set the prev/next button visibility
	setPrevNext();
	
	// mark this new node as visited, this will update the visited state of the parents
	markTocNode(_nPageCurrent, "Visited");
	updateCurrentPageStatus();
	
	// tell the TOC to select this node and parents
	tocSelect(_nPageCurrent);
	
	// update the bookmark
	setBookmarkInfo(_nPageCurrent);
	
// the core of the engine. do NOT recurse this routine!
// strFile: raw html or text
// gridToUse: name of the grid template to load
// applyHeader: whether to process headers (e.g sub-pages = false)
// also handles multi-columns
function processString(strFile, gridToUse, applyHeader) {

	// we don't care about the head, if this is html
	if (strFile.indexOf("</head>")!=-1) strFile=strFile.substring(strFile.indexOf("</head>") + 7);
	
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
		var cache = $("<div>").html("<pre>" + columns[c] + "</pre>").text().split(/(\r\n|\n\r|\r|\n)+/);
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
							if (!(val[0].indexOf("<")==0) && (val[0].lastIndexOf(">")==line.length-1)) {
								val[0] = "<p>" + val[0] + "</p>"; // wrap lines that terminate with a command
							}
						}
						left.push(val[0]);
					}
				} else {
					if (len++==0 && applyHeader) {
						header = line;
					} else {
						left.push("<p>" + line + "</p>");
					}
				}
				
			}
		}
		if (c==0) {
			leftPage = $.trim(Handlebars.getCompiledTemplate("grids/" + myGrid,{
				"left" : left.join(""),
				"right" : right.join(""),
				"title" : header,
				"inset": inset
			}));
			if (leftPage.length == 0) { leftPage = "<p>&nbsp;</p>"; }

		} else {
			rightPage = $.trim(Handlebars.getCompiledTemplate("grids/" + myGrid,{
				"left" : left.join(""),
				"right" : right.join(""),
				"title" : header,
				"inset": inset
			}));
			if (rightPage.length == 0) { rightPage = "<p>&nbsp;</p>"; }
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
			command = wholecommand.substring(1, wholecommand.indexOf(" ")).toLowerCase(),
			instruction = wholecommand.substring(wholecommand.indexOf(" ") + 1, wholecommand.length - 1).split("|"),
			missing = "<i style='color:red'><b>missing command:</b> " + command + "; <b>instruction:</b> " + instruction + "</i>", 
			tag = [];
			
		if (wholecommand == "{/}") {
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
					var fileId = getIdByFileName(instruction[1]);
					tag.push("<a href='Content/" + instruction[1] + "' data-toc='" + fileId + "'>" + instruction[0] + "</a>");
					break;
	
				case "external": // external target hyperlink with icon
					if (instruction[0].indexOf(":\/\/")==-1) { instruction[0] = "Content/" + instruction[0] }
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
					$.ajax({
						url: (instruction[0].indexOf(":\/\/") == -1) ? __global_root + "/en-us/Content/" + instruction[0] + "?" + Math.random() : instruction[0],
						success: function (response) {
							tag.push( (response.indexOf("<body") == -1) ? response : response.substring(response.indexOf(">", response.indexOf("<body") + 4) + 1, response.lastIndexOf("</body")) );
						},
						async: false
					});
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
					var href = (instruction[1].indexOf("://") == -1) ? __global_root + "/en-us/Content/" + instruction[1] : instruction[1];
					tag.push("<a href='" + href + "' rev='overlay' class='overlay-textlink'>" + instruction[0] + " <i class='icon-search icon-super'></i></a>");
					break;
					
				case "centered": // centered paragraph
				case "center":
					tag.push("<p class='centered'>" + instruction[0] + "</p>");
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
						tag.push("<img src='" + __global_root + "/en-us/Content/media/" + instruction[2] + "' data-url='" + __global_root + "/en-us/Content/media/" + instruction[2] + "' class='" + instruction[0] + "' />");
						tag.push("</span>");
					} else if (instruction.length==2) {
						if (instruction[0].indexOf(".")!=-1) { // image(small), image(large)
							tag.push("<span class='img-zoom" + (_sniff_isTablet ? " tablet" : " desktop") + "'>")
							tag.push("<span>" + (_sniff_isTablet ? "grab" : "hover") + "</span>")
							tag.push("<img src='" + __global_root + "/en-us/Content/media/" + instruction[0] + "' data-url='" + __global_root + "/en-us/Content/media/" + instruction[1] + "' />");
							tag.push("</span>");
						} else { // classes, image(large)
							tag.push("<img src='" + __global_root + "/en-us/Content/media/" + instruction[1] + "' class='rp-zoomable " + instruction[0] + "' />");
						}
					} else { // image(large), no class, might be a mistake, wrap a handler class
						tag.push("<img src='" + __global_root + "/en-us/Content/media/" + instruction[0] + "' class='rp-zoomable default-max-width' />");
					}
					break;
					
				case "float": // div (not span!) float wrapper
					tag.push("<div style='float:" + instruction[0] + "'>" + instruction[1] + "</div>");
					break;
					
				case "image": // single inline image
					var classes = "rp-image" + (instruction[1] ? " " + instruction[0] : "");
					var filename = (instruction[1] ? instruction[1] : instruction[0]);
					tag.push("<img src='" + __global_root + "/en-us/Content/media/" + filename + "' class='" + classes + "' />");
					break;
	
				case "bullets": // dot-point list
					tag.push("<ul class='rp-bullets'>");
					for (var i=0; i<instruction.length; i++) {
						tag.push("<li>" + instruction[i] + "</li>");
					}
					tag.push("</ul>");
					break;
	
				case "numbers": // numeric list
					tag.push("<ol class='rp-numbers'>");
					for (var i=0; i<instruction.length; i++) {
						tag.push("<li>" + instruction[i] + "</li>");
					}
					tag.push("</ol>");
					break;
	
				case "rightimages": // right hand fade-in images (one or more)
				case "images": // right hand fade-in images (one or more)
					var classes = "rp-fadeinfast",
						firstItem = 0;
					inset = true
					if (instruction[0].indexOf(".") == -1) { // first item is not an image
						classes += " " + instruction[0];
						firstItem = 1;
						inset = false;
					}
					for (var i=firstItem; i<instruction.length; i++) {
						tag.push("<img src='" + __global_root + "/en-us/Content/media/" + instruction[i] + "' class='" +  classes + "' />");
					}
					container = "right";
					break;
					
				case "backstretch":
					container = "right";
					tag.push("<img src='" + __global_root + "/en-us/Content/media/" + instruction[0] + "' class='backstretch hide' />");
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
					tag.push("<strong>" + instruction[0] + "</strong>");
					break;
	
				case "italic": // italic tag
				case "em":
				case "i":
					tag.push("<em>" + instruction[0] + "</em>");
					break;
	
				case "quote": // block quote tag
				case "q":
					tag.push(Handlebars.getCompiledTemplate("blockquote", {
						"value": instruction[0]
					}));
					break;
					
				case "tag": // any html tag
					tag.push("<" + instruction[0] + ">" + instruction[1] + "</" + instruction[0] + ">");
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
					var myUniqueId = _nPageCurrent + "_" + _global_increment,
						_opts = [], _feedback = [],
						_oData = getState("rpqiz_" + myUniqueId).split(_avideSep)
					for (var i=0,j=0; i<instruction.length; i+=2) {
						_opts.push({
							"media": __global_root + "/en-us/Content/media/" + instruction[i],
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
				
				case "wrap": // span wrapper with classname
					// classname, text
					tag.push("<span class='" + instruction[0] + "'>" + instruction[1] + "</span>");
					break;

				case "block": // div wrapper with classname
					// classname, text
					tag.push("<div class='" + instruction[0] + "'>" + instruction[1] + "</div>");
					break;
					
				case "clear": // inline style to apply a clear; e.g. {clear both}
					tag.push("<div style='clear:" + instruction[0] + "'><span /></div>");
					break;
					
				case "tabs": // jqueryui tabs
				case "accordion": // jqueryui accordion
					// titleN|hrefN|titleN+1|hrefN+1
					var myUniqueId = _nPageCurrent + "_" + _global_increment,
						_tab = [];
					for (var i=0; i<instruction.length; i+=2) {
						if (instruction[i+1].indexOf(".html") == -1) {
							_tab.push({
								"title": instruction[i],
								"content": instruction[i+1]
							});
						} else {
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
					tag.push("<a href='#' class='tiptext' data-tip='" + escape(instruction[1]) + "'>" + instruction[0] + " <i class='icon-search icon-super'></i></a>");
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
							"front": processString(instruction[i],"auto",false),
							"back": processString(instruction[i+1],"auto",false)
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
				    	tag.push(processString(instruction[0],"auto",false));
				    } else {
				    	tag.push(processString(instruction[1],"auto",false));
				    }
				    break;
					
				case "completion": // page that shows the completed statement
				    var sLearnerName = getLearnerName(),
				    	aMonths = _sMonths.split(","),
				    	d = new Date(),
				    	sCompletionStatus = checkCourseCompletion(),
					    bIsCourseCompleted = isComplete(sCompletionStatus),
				    	sTemplate = (bIsCourseCompleted) ? "competent" : "notyetcompetent";
				    //	score = Math.round(getOverallScore());
				    //if (score > __settings.course.passingScore) score = __settings.course.passingScore;
					tag.push(Handlebars.getCompiledTemplate("completion\/" + sTemplate, {
						"title": bIsCourseCompleted ? instruction[0] : instruction[1],
						"score": Math.min(100,Math.round(getOverallScore())),
						"passingScore": __settings.course.passingScore,
						"status": sCompletionStatus,
						"name": (sLearnerName != "" ? sLearnerName : _sTextLearnerName),
						"date": aMonths[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear()
					}));
					break;
					
				case "slideshow": // malsup cycle plugin
					var myUniqueId = _nPageCurrent + "_" + _global_increment,
						_slide = [];
					for (var i=1; i<instruction.length; i++) {
						_slide.push({
							"uri": instruction[i]
						});
					}
					tag.push(Handlebars.getCompiledTemplate("slideshow",{
						"uniqueid": myUniqueId,
						"effect": instruction[0],
						"slide": _slide
					}));
					_global_increment++;
					break;
					
				case "columns": // even grid supporting 2/3/4/5 columns
					tag.push(Handlebars.getCompiledTemplate("grids/ngrid",{
						"total": instruction.length,
						"column": instruction
					}));
					break;
					
				case "caption":
					var theme = (instruction.length==3) ? instruction[0] : "theme",
						img = (instruction.length==3) ? instruction[1] : instruction[0],
						val = (instruction.length==3) ? instruction[2] : instruction[1];
					tag.push("<figure class='image-caption " + theme + "'><img src='" + __global_root + "/en-us/Content/media/" + img + "'><figcaption>" + val + "</figcaption></figure>");
					break;
					
				case "splitimage":
					tag.push("<figure class='split-image' id='split_" + (_global_increment++) + "'>");
					tag.push("<div><img src='" + __global_root + "/en-us/Content/media/" + instruction[0] + "'></div>");
					tag.push("<div><img src='" + __global_root + "/en-us/Content/media/" + instruction[1] + "'></div>");
					tag.push("</figure>");
					break;
					
				case "slidebox":
					tag.push("<div class='slide-box' data-orientation='" + instruction[0] + "'>");
						tag.push("<div class='pages'>");
						for (var i=1; i<instruction.length; i++) {
							if (instruction[i].endsWith(".html")) {
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
								tag.push("<div class='page'><img src='" + __global_root + "/en-us/Content/media/" + instruction[i] + "'></div>");
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
					
				default: // no matched instruction
					tag.push(missing);
					break;

			}
		}
		
		inp = inp.replace(wholecommand, tag.join(""));

	} while ((inp.indexOf("{")!=-1) && (inp.indexOf("}", inp.indexOf("{")+1)!=-1) && (loops++<maxLoops)); // max tag recursion
	returnAr = [inp.replace("\\ ","<br/>"),container];
	if (inset) returnAr.push("inset");
	return returnAr; // \space means line break
}

/* replaced with processString(response, "auto", false)
function processHTML(response) {
	var cache = (response.indexOf("<body") == -1) ? response : response.substring(response.indexOf(">", response.indexOf("<body") + 4) + 1, response.lastIndexOf("</body"));
	var lines = $("<div>").html(cache).text().split("\n"),
		outp = [];
	for (var i=0;i<lines.length;i++) {
		var line = $.trim(lines[i]);
		if (line.length) {
console.log("line",line);
			if ((line.indexOf("}")!=-1) && line.indexOf("}")>line.indexOf("{")) {
				val[0] = processLine(line); // parse process ignores right column content for now
			console.log("processHTML processLine",val[0]);
				// TODO: probably could reapply a gridauto template
				if (line.lastIndexOf("}")===line.length-1) { // line terminates with a command, but value is already a tag
					if (!(val[0].indexOf("<")==0) && (val[0].lastIndexOf(">")==line.length-1)) {
						val[0] = "<p>" + val[0] + "</p>"; // wrap lines that terminate with a command
					}
				}
				outp.push(val[0]);
			} else {
				outp.push("<p>" + line + "</p>");
			}
		}
	}
	return outp.join("");
} */
}

// check if the user can navigate to the requested page
function canNavigatePage(nIndex) {
    var bCanNavigate = true;
    // reset navigate fail message
    _sNavigateFailMsg = "";
    // scan course pages to current index
    for (var i = 1; i < nIndex; i++) {
        // get the current page navigation
        // example 'n' - none, 'v' - visit 'c' - complete, 'p' - pass
        var sNavigation = getPageNavigation(i);
        // get the status of the page
        var sStatus = getPageStatus(i);

        // switch through every navigation type
        switch (sNavigation) {
            case 'n':
                continue; // continue to the next page
            case 'v':
                // check to see if status is' none'
                if (sStatus == 'n') {
                    // its is, the user cannot navigate to the requested page
                    bCanNavigate = false;
                    // build the navigation fail message
                    _sNavigateFailMsg = _sNavFailVisit.replace(/%%page/g, getPageTitle(i));
                }
                break;
            case 'c':
                // check if status is 'none' or 'incomplete'
                if (sStatus == 'n' || sStatus == 'i') {
                    // it is, the user cannot go on
                    bCanNavigate = false;
                    // build the navigation fail message
                    _sNavigateFailMsg = _sNavFailComplete.replace(/%%page/g, getPageTitle(i));
                }
                break;
            case 'p':
                // check if the status is diffrent then 'complete' 
                // or page score is less than wanted navigation score
                if (sStatus != 'c' || getPageScore(i) < getPageNavigationScore(i)) {
                    // it is, the user cannot go on
                    bCanNavigate = false;
                    // build the navigation fail message
                    _sNavigateFailMsg = _sNavFailPass.replace(/%%page/g, getPageTitle(i));
                }
                break;
        }

        // if this page cannot be navigated, exit loop
        if (bCanNavigate == false) break;
    }

    return bCanNavigate;
}

// updates page status and node style when a test is closed
function updatePageStatus(nPageId, sTestStatus, nTestScore) {
    // get the 'contribute' value
    var sContribute = getPageContribute(nPageId);
    // check to see if the 'contribute' is 'complete'
    if (sContribute == "c") {
        // it is, check to see if the test status is 'incomplete'
        if (sTestStatus == "I") {
            // it is, mark the page as 'incomplete'
            setPageStatus(nPageId, "i");
        } else {
            // set the page status as 'complete'
            setPageStatus(nPageId, "c");
        }
    } else if (sContribute == "p") {
        // the contribute is not 'pass
        if (sTestStatus == "P") {
            // mark the page as completed when test status is 'P' (passed)
            setPageStatus(nPageId, "c");
        } else {
            // set the page as 'incompleted' if test status is 'I' (incomplete) or 'F' (failed)
            setPageStatus(nPageId, "i");
        }
    } else {
        // in all other cases mark the page as 'completed'
        setPageStatus(nPageId, "c");
    }

    // set page score
    setPageScore(nPageId, nTestScore);

    // update page status image
    updatePageStatusIcon(nPageId);
}

// select the page and its parents in the TOC
function tocSelect(nID) {
	// keep track of the original page, we will need this to handle scrolling
	var nOrig = nID;
	
	// clean previous menu selection state classes
	$("[id^=toc_]").removeClass("active active-parent state-Selected");
	var node = $("#toc_" + nID).addClass("active");
	if (node.length) {
		node.parents(".ui-layout-north").each(function() {if (this.nodeName.toUpperCase()=="LI") $(this).addClass("active-parent")})
		node.scrollIntoView();
	}

	// select this page
	markTocNode(nID, "Selected");
	
	// get the parent id of the current page
    var nParentId = getPageParentId(nID);
	
	// loop until we have visited all of the parents
    while (nParentId != 0) {
		$("#toc_" + nParentId).addClass("active-parent");
        nParentId = getPageParentId(nParentId);
    }

}

// set the previous/next functionality - previous is greyed on the first page, next is greyed on the last page
function setPrevNext() {
	$('a[data-action].Previous, a[data-action].Next').removeClass('NavLinkDisabled NavLink'); // start afresh

	if(_nPageCurrent == 1 && _nPageCurrent == _nNodes) { // is single page course
		$('a[data-action].Previous, a[data-action].Next').addClass('NavLinkDisabled');
		
	} else if (_nPageCurrent == 1) { // is first page
		$('a[data-action].Previous').addClass('NavLinkDisabled');
		$('a[data-action].Next').addClass('NavLink');

	} else if (_nPageCurrent == _nNodes) { // is last page
		$('a[data-action].Next').addClass('NavLinkDisabled');
		$('a[data-action].Previous').addClass('NavLink');

	} else { // is somewhere in the middle
		$('a[data-action].Previous').addClass('NavLink');
		$('a[data-action].Next').addClass('NavLink');
	}
}

// mark the toc node state
//	nID - the node ID, example 1
//	sState - "", "Passed", "Incomplete", "Complete", "Visited" or "Selected"
// Note: Visited does not get removed when changing to other states
function markTocNode(nID, sState) {
	$("#toc_" + nID).removeClass("state-Passed state-Incomplete state-Complete").addClass("state-" + sState);
	updatePageStatusIcon(nID);
}

// updates page status image
// nID - the page id
function updatePageStatusIcon(nID) {
	$("#node-status-" + nID)
		.attr("title", getNodeStatusText(nID))
		.find("i").replaceWith(getNodeStatusIcon(nID));
}



// get the XML document from a file name
function getXmlDocument(sFile) {
	var xmlHttp, oXML;
	
	// try to use the native XML parser
	try {
		xmlHttp = new XMLHttpRequest();
		xmlHttp.open("GET", sFile, false); // Use syncronous communication
		xmlHttp.send(null);
		oXML = xmlHttp.responseXML;
	} catch(e) {
		// can't use the native parser, use the ActiveX instead
		xmlHttp = getXMLObject();
		xmlHttp.async = false;            // Use syncronous communication
		xmlHttp.resolveExternals = false;
		xmlHttp.load(sFile);
		oXML = xmlHttp;
	}
	
	// return the XML document object
	return oXML;
}

// get the best ActiveX object that can read XML
function getXMLObject() {
	// create an array with the XML ActiveX versions
	var aVersions = new Array("Msxml2.DOMDocument.6.0", "Msxml2.DOMDocument.3.0");
	
	// loop through the array until we can create an activeX control
	for (var i=0; i<aVersions.length; i++) {
		// return when we can create the activeX control
		try {
			var oXML = new ActiveXObject(aVersions[i]);
			return oXML;
		} 
		catch(e) {
		}
	}
	
	// could not create an activeX, return a null
	return null;
}

// load in Language.xml which contains the language strings, apply them as js vars using eval
function loadLanguage() {
	var oXML = getXmlDocument(__global_root + "/Configuration/Language_" + _sLanguage + ".xml"),
		oTemplate = oXML.getElementsByTagName("template"),
		oStrings = oTemplate[0].getElementsByTagName("string");
	for (var i = 0, nLen = oStrings.length; i<nLen; i++) {
		eval(oStrings[i].getAttribute("var") + " = \"" + oStrings[i].firstChild.data + "\"");
	}
	//overrideLanguage();
}

// for each string/text in settings, override existing variable as required
/*
function overrideLanguage() {
	var oXML = getXmlDocument("../Configuration/Settings.xml");
	var oNodes = oXML.getElementsByTagName("string");
	var oNodeL = oNodes.length;
	for (var i=0; i<oNodeL; i++) {
		if (oNodes[i].getAttribute("language")==_sLanguage) {
			var oStrings = oNodes[i].getElementsByTagName("string");
			var nLen = oStrings.length;
			for (var i = 0; i<nLen; i++) {
				eval(oStrings[i].getAttribute("var") + " = \"" + oStrings[i].firstChild.data + "\"");
			}
			break;
		}
	}
}
*/

// ## STATE MANAGEMENT

// this function sets the bookmark info
function setBookmarkInfo(nBookmark) {
	// remember this bookmark information so we can save it
	_nBookmark = nBookmark;
	
	// SET THE BOOKMARK IN SCORM
	setBookmark(nBookmark);
}

// get the state
function getState(sId) {
	// console.log("GET: current state", _aState);
	// see if there is an ID in the state array
	if (_aState[sId]) {
		// there is, return it
		return _aState[sId];
	} else {
		// there is no ID, return an empty string
		return "";
	}
}

// set the state
function setState(sId,sValue) {
	// set the state in our state array
	_aState[sId] = sValue;
	// console.log("SET: current state", _aState);
}

// Load the suspend data into our state array
function loadState() {
	// get the suspend_data
	var sSuspend = getSuspendData();

	// console.log ("Load: SCORM suspend", sSuspend);
	
	// load the data into a temp array
	var aParts = sSuspend.split(_sSep);
	
	/* loop through the array */
	for (var i=0; i<aParts.length; i=i+2) {
		// see if we have an id
		if (aParts[i] != "") {
			// we do, copy the data to the state array
			_aState[ aParts[i] ] = aParts[i+1];
		}
	}
}

// Set the state in suspend data  - we do this by flattening the data stored in the state array
function saveState() {
    // save the state of the current opened question
    if (frames["FRM_CONTENT"] && frames["FRM_CONTENT"].termQuiz) frames["FRM_CONTENT"].termQuiz();
    
    // tell scorm about the node status
	setState("PATHMARK", getPageStatusString());
	
	// record the version in suspend data
	_aState["VERSION"] = _sVersion;
	
	// buffer for the state array
	var sSuspend = "";
	
	// loop through the array
	for (var i in _aState) {
		sSuspend += i + _sSep + _aState[i] + _sSep;
	}

	// console.log ("Save: SCORM suspend", sSuspend);
	// see if there is any data to set
	if (sSuspend != "") {	
		// there is, store this with SCORM
		setSuspendData(sSuspend);

		// force the upload of the data to the server
		scormCommit();
	}
}

function getProgressJSON() {
	var aPages = [],
		aInteractions = [],
		nPass = 0,
		nVisit = 0,
		nComplete = 0,
		bComplete = isComplete(checkCourseCompletion());
		
	// console.log("Arrays", _nNodes, _aRestoredStatus, _aNodeStatus, _aState);

    for (i=0; i<_nNodes; i++) {
        if (getPageContribute(i + 1) == 'n') continue;
        var sStatus = _aNodeStatus[i + 1].sStatus,
        	sTitle = getPageTitle((i + 1)),
        	sLang = "",
        	sIcon = "";
        switch (sStatus) {
            case "c":
            case "p":
	            sLang = _sStatusComplete;
				sIcon = "icon-ok-sign icon-colour-complete";
	            break;
            case "i":
	            sLang = _sStatusIncomplete;
				sIcon = "icon-remove-sign icon-colour-incomplete";
	            break;
            default:
	            sLang = _sStatusNotAttempted;
				sIcon = "icon-circle-blank icon-colour-notattempted";
	            break;
	    }
	    if (sStatus != "c") {
	        switch (_aNodeStatus[i + 1].sContribute) {
	            case "p":
	                nPass++;
	                break;
	            case "v":
	                nVisit++;
	                break;
	            case "c":
	                nComplete++;
	                break;
	        }
	    }
	    aPages.push({
	    	"title": sTitle,
	    	"status": sLang,
	    	"raw": sStatus,
	    	"icon": sIcon
	    });
    }

	// a shame we have to re-process the page to gather this info
	//TODO: modularise the load process so it can preprocess and cache pages to avoid this duplication
	var sParent = window.location.href;
	sParent = sParent.substring(0, sParent.lastIndexOf('/'));
	var path =  sParent + "/Content/";
    for (var value in _aState) {
		// console.log("checking suspend data");
      if (value.indexOf("rpqiz") > -1) {
      	var idx = value.split("_")[1]; // rpqiz_X_Y; x = page id, y = interaction on page id
      	// console.log("loading index",idx, path + getPageHtmlFileName(idx));
      	jQuery.ajax({
      		url: path + getPageHtmlFileName(idx),
			success: function(result) {
				// TODO: here's a thing, the interaction on page doesn't contain its index in "value", so how do we match the Nth interaction?
				// assume one per page is shortsighted, but will do for now.
				var cache = $("<div>").html(result).text().split("\n");
				for (var cacheloop=0,cachelength=cache.length;cacheloop<cachelength;cacheloop++) {
					var line = $.trim(cache[cacheloop]);
					if (line.length && (line.indexOf("{clickimage ") != -1 || line.indexOf("{clickcheck ") != -1 || line.indexOf("{survey ") != -1 || line.indexOf("{clicktf ") != -1)) {
						var p1 = line.lastIndexOf("{clickimage") || line.lastIndexOf("{clickcheck ") || line.lastIndexOf("{survey ") || line.lastIndexOf("{clicktf "),
							p2 = line.indexOf("}", p1+1) + 1,
							wholecommand = line.substring(p1, p2),
							command = wholecommand.substring(1, wholecommand.indexOf(" ")).toLowerCase(),
							instruction = wholecommand.substring(wholecommand.indexOf(" ") + 1, wholecommand.length - 1).split("|"),
							stored = _aState[value].split(_avideSep),
							strings = [];
							
						switch (command) {
							case "clickcheck": // every matching string
								for (var i=0,j=instruction.length; i<j; i++) {
									if ($.inArray(i.toString(), stored) != -1) strings.push({
										"label": instruction[i]
									});
								}
								break;
							
							case "clickimage": // list every second param (string) that matches
								for (var i=0,j=instruction.length,k=0; i<j; i+=2) {
									if ($.inArray(k.toString(), stored) != -1) strings.push({
										"label": instruction[i+1]
									});
									k++;
								}
								break;

							case "clicktf": // list every second param (string) that matches
								for (var i=2,j=instruction.length,k=0; i<j; i++) {
									strings.push({
										"label": instruction[i] + ": " + (($.inArray(k.toString(), stored) != -1) ? instruction[0] : instruction[1])
									});
									k++;
								}
								break;
													
							case "survey": // list all with scores
								for (var i=1,j=instruction.length; i<j; i++) {
									strings.push({
										"label": instruction[i],
										"score": parseInt(stored[i-1],10) + 1,
										"total": instruction[0]
									});
								}
								break;
							
						}
						aInteractions.push({
							"type": command,
							"title": getPageTitle(idx),
							"strings": strings
						});
					}
				}
            },
			async: false
		});   
      }
    }
    
    return {
		"status": {
			"complete": bComplete,
			"label": (bComplete) ?  _sProgressComplete : _sProgressIncomplete
		},
		"pagestopass": nPass,
		"pagestovisit": nVisit,
		"pagestocomplete": nComplete,
		"pages" : aPages,
		"interactions" : aInteractions
	}
}


// ## _aNodeStatus getters and setters
//TODO: refactor this to a JSON object; maybe need to refac pages.xml too

function getPageHasChildren(nIndex) { return _aNodeStatus[nIndex].bHasChildren; }
function setPageHasChildren(nIndex, bHasChildren) { _aNodeStatus[nIndex].bHasChildren = bHasChildren; }

function getPageContribute(nIndex) { return _aNodeStatus[nIndex].sContribute; }

function getPageStatus(nIndex) { return _aNodeStatus[nIndex].sStatus; }
function setPageStatus(nIndex, sStatus) { _aNodeStatus[nIndex].sStatus = sStatus; }

function getPageScore(nIndex) { return _aNodeStatus[nIndex].nScore; }
function setPageScore(nIndex, nScore) { _aNodeStatus[nIndex].nScore = nScore - 0; }

function getPageTitle(nIndex) { return _aNodeStatus[nIndex].sTitle; }
function getPageNavigation(nIndex) { return _aNodeStatus[nIndex].sNavigation; }
function getPageContributePercentage(nIndex) { return _aNodeStatus[nIndex].nContributePercentage; }
function getPageHtmlFileName(nIndex) { return _aNodeStatus[nIndex].sHtmlFileName; }
function getPageTocPath(nIndex) { return _aNodeStatus[nIndex].sTocPath; }
function getPageParentId(nIndex) { return _aNodeStatus[nIndex].nParentId; }
function getPageType(_nId) { return _aNodeStatus[_nId].sType.toLowerCase(); }
function getPageNavigationScore(nIndex) { return _aNodeStatus[nIndex].nNavigationScore; }
function getPageTemplate(nIndex) { return _aNodeStatus[nIndex].sTemplate; }

function getCurrentPageContribute() { return _aNodeStatus[_nPageCurrent].sContribute; }
function getCurrentPageId() { return _aNodeStatus[_nPageCurrent].sId; }
function getCurrentPageType() { return _aNodeStatus[_nPageCurrent].sType; }
function getCurrentPageContributeScore() { return _aNodeStatus[_nPageCurrent].nContributeScore; }

function getIdForFirstQuiz() {
    for (var i = 1; i < _aNodeStatus.length; i++) {
    	var s = _aNodeStatus[i].sType.toLowerCase();
    	if (s == "quiz" || s == "test") {
	    	return i;
    	}
    }
	return 0;
}

function getIdByFileName(sHtmlFileName) {
    var nID = 0;
    for (var i = 1; i < _nNodes+1; i++) {
    	if (getPageHtmlFileName(i).toLowerCase() == sHtmlFileName.toLowerCase()) {
            nID  = i;
            break;
        }
    }
    return nID;
}

function getNodeStatusIcon(i) {
	switch (getPageStatus(i)) {
		case "i": // incomplete
			return "<i class='icon-adjust icon-small icon-muted'></i>";
			break;
		case "c": // complete
			return "<i class='icon-circle icon-small icon-muted'></i>";
			break;
		default: // not visited
			return "<i class='icon-circle-blank icon-small icon-muted'></i>";
			break;
	}
}
function getNodeStatusText(i) {
	switch (getPageStatus(i)) {
		case "i": // incomplete
			return _sTipPageIncomplete;
			break;
		case "c": // complete
			return _sTipPageComplete;
			break;
		default: // not visited
			return _sTipPageNotVisited;
			break;
	}
}


// gets the page status text, example: Incomplete, Complete, Passed
function getStatusImage(nIndex) {
    // get page status
    var status = getPageStatus(nIndex);
    // get the default file name
    var statusFile = "toc-not-visited.png";

    // if page status is 'incomplete'
    if (status == "i") {
        statusFile = "toc-incomplete.png";
    }
    else if (status == "c") {
        statusFile = "toc-complete.png";
    }
    
    return statusFile;
}

// gets the page status title
function getStatusImageTitle(nIndex) {
    // get page status
    var status = getPageStatus(nIndex);
    // get the default title
    var statusTitle = _sTipPageNotVisited;
    
    // if page status is 'incomplete'
    if (status == "i") {
        statusTitle = _sTipPageIncomplete;
    }
    else if (status == "c") {
        statusTitle = _sTipPageComplete;
    }
    
    return statusTitle;
}



// update the node status for this node and its parents
function updateCurrentPageStatus() {
    // get page current status
    var sStatus = getPageStatus(_nPageCurrent);

    // if the page is alraedy passed/completed, don't change the status
    if (sStatus == "c" || sStatus == "p") return;
    
	// get the 'contribute' value
    var sContribute = getPageContribute(_nPageCurrent);
	// initialize a new status
	
	// detect 'contribute' cases
	switch (sContribute)
	{
	    case "n":   // the page does not contribute to the course completion or pass/fail
	    case "v": { // learner must visit this page
	            // set the status as 'complete'
	            sStatus = "c";
	        } break;
	    case "c":
	    case "p": {
	            // set the status as 'incomplete'
	            sStatus = "i";
	        } break;
	}
	
	// set the node status for this node
	setPageStatus(_nPageCurrent, sStatus);
}

// get a string containing the node status
function getPageStatusString() {
	// init the return string
	var sRet = "";
	// loop through the node status array
	for (var i in _aNodeStatus) {
		// see if there is an X,Y pair
		if (sRet != "") {
			// there is, add a colon separator
			sRet += ":";
		}
		// get the string 'score'
		var sScore = _aNodeStatus[i].nScore + "";
		// add the visited status and score status
		sRet += _aNodeStatus[i].sStatus + "," + sScore;
	}
	return sRet;
}

// calculates the overall score
function getOverallScore() {
    var nTotalScore = null;
    // calculate the overall score
    for (var i = 1; i <= _nNodes; i++) {
        // get the state of the current page
        var sState = getState(i);
        
        // get the contribute of the page
        var sContribute = getPageContribute(i);
        
        if (sState != "" && sContribute != "n") {
            /* break the data apart */
            var aAll = sState.split('::');
            // calculate the total score
            nTotalScore += (aAll[1] - 0) * (getPageContributePercentage(i)/100);
        }
    }
    
    return (nTotalScore != null) ? nTotalScore : null;
}




/*
function findPosY(obj) {
	var curtop = 0;
	if(obj.offsetParent)
		while(1) {
			curtop += obj.offsetTop;
			if(!obj.offsetParent)
				break;
			obj = obj.offsetParent;
		}
	else if(obj.y)
		curtop += obj.y;
	return curtop;
}
function findPosX(obj) {
	var curleft = 0;
	if(obj.offsetParent)
		while(1) {
			curleft += obj.offsetLeft;
			if(!obj.offsetParent)
				break;
			obj = obj.offsetParent;
		}
	else if(obj.x)
		curleft += obj.x;
	return curleft;
}
*/

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
		url = "http://player.vimeo.com/video/" + url.substr(url.lastIndexOf("/")+1); // e.g. http://vimeo.com/13533846
		return "<iframe src='" + url + "?byline=0&amp;portrait=0&amp;color=" + __settings.layout.basecolour.replace(/\#/,"") + "' " + strWH + " frameborder='0' webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>";
	} else if (url.indexOf("youtube.") != -1) {
		if (ytEmbed) return "<div id='ytvideo'></div>"; // EmbedAndPlay_Youtube
		url = url.replace("watch?v=","embed/").replace("http://","//").replace("https://","//"); // security avoidance, try to avoid different port / protocol
		return "<iframe " + strWH + " src='" + url + "?rel=0" + ((size==0)?"&fs=1":"") + "' frameborder='0' allowfullscreen></iframe>";
	} else if (url.indexOf("ted.") != -1) {
		return "<iframe src='" + url + "' " + strWH + " frameborder='0' scrolling='no' webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>";
	} else {
		return "unsupported video url";
	}
}

// loads JSON from a file and appends it as its own node to the global __settings object
function appendSettings(node) {
	if (!Object.prototype.hasOwnProperty.call(__settings, node)) {
		// console.log("needing to load json", node);
		var json = (function() {
			var json = null;
			$.ajax({
				'async':false,
				'global':false,
				'dataType':'json',
				'success': function (data) {
					json = data;
				},
				'url': __global_root + '/Configuration/' + node + '.json'
			});
			return json;
		})();
		__settings[node] = json; // seems easiest
	}
	return __settings[node]; // return ( new Function( 'return ' + __settings + '.' + result ) )()
}

// appends JSON to the global __settings object
function appendSettingsJSON(node,json) {
	if (!Object.prototype.hasOwnProperty.call(__settings,node)) {
		__settings[node] = json;
	}
	return __settings[node];
}

/* =========================================================================================================
 *
 * 	The [mostly] jQuery part of the player
 *	Author: tim.stclair@gmail.com
 *
 * ========================================================================================================= */

var pageLayout; // used by jquery.layout.min.js
var _avideSep = "#~"; // used by avide quiz / scorm suspend data persistance
var _isTop = false; // is this the top frame?
var __settings,
	_hasAutoClosed = false,
	_$ct = null;

// note: file executes in the /en-us/ folder; configuration etc stored as siblings to this folder

//	window.onerror = function () {
//		alert(document.location.href);
//	}

// helper extensions & plugins
Array.max = function( array ) {
    return Math.max.apply( Math, array );
};
Array.min = function( array ) {
    return Math.min.apply( Math, array );
};

// listener for popstate event triggered by pressing back/forward in browser
// in our case we don't have a href, so only work if there's a state.id stored
$( window ).bind( "popstate", function( e ) {
    var state = history.state;
    if (state && state.id) LoadContent(state.id - 0, true); // since clickLevel is doing this anyway
});

$(document).ready(function () {
	
	function main() {
	
		overrideLanguage(__settings);
		
		$(document).bind("hide_submenus", function () {
			if ($("#toc_submenu").length)
				$("#toc_submenu").fadeOut(50, function () { $(this).remove() });
		});
		
		// test handler for wait plugin
		$("blink").waitUntilExists(function () {
			var $t = $(this), _t;
			function blink() {
				$t.css("visibility", $t.css("visibility")=="hidden"?"visible":"hidden");
				clearTimeout(_t);
				_t = setTimeout(function () {
					blink();
				}, 1000);
			}
			blink();
		});
	
	
		// Handle all action buttons
		$("a[data-action]").click(function (event) {
			event.preventDefault();
			var actionNode = (event.target.nodeName.toUpperCase() == "I") ? $(event.target).parent() : $(event.target); // click on icon inside hyperlink
			var btnAction = actionNode.attr("data-action");
			switch (btnAction) {
			
				case "toc-expand":
					if ($("#toc_submenu").length) {
						$(document).trigger("hide_submenus");
					} else {
						var submenu = $("<div />")
									.attr("id","toc_submenu")
									.addClass("toc-submenu")
									.append(actionNode.next("ul").clone(true))
									.css({
										position: "absolute",
										top: parseInt($(".ui-layout-north").height(),10),  // (actionNode.offset().top + actionNode.outerHeight(true)),
										left: actionNode.closest("li").offset().left,
										width: "256px",
										display: "none",
										"z-index": 10,
										"background-color": "#fff"
									})
									.appendTo("body")
									.fadeIn(200);
						submenu.find("a[data-action='toc-expand']").remove();
						submenu.find("ul").addClass("icons-ul");
						submenu.find("li").prepend("<i class='icon-li icon-caret-right'></i>");
					}
					break;

				case "pan-left":
					break;
	
				case "pan-right":
					break;
	
				case "toc-node":
					gotoPage(actionNode.attr("href"));
					break;

				case "forward":
					NextPage();
					break;
					
				case "back":
					PreviousPage();
					break;

				case "home":
					HomePage();
					break;

				case "progress":
					var t = $(this);
					triggerFrumbox(null, Handlebars.getCompiledTemplate(btnAction, getProgressJSON()), {
						t: t.offset().top,
						l: t.offset().left,
						w: t.width(),
						h: t.height()
					}, {
                        top: $(document).scrollTop() + 50, 
                        left: $(document).scrollLeft() + 50,
                        width: ($(document).width() - 100) + 10,
                        height: ($(document).height() - 100) + 10
                    }, function() {
						$(".jqueryui-tabs", "#frumbox-iframe").tabs();
					}, {                // overlay appearance
                        opacity: 0.5,
                        colour: "#000000",
                        speed: 250
                    });
					break;

				case "glossary":
				case "references":
					var json = appendSettings(btnAction), // load once and cache
						t = $(this);
					triggerFrumbox(null, Handlebars.getCompiledTemplate(btnAction, json), {
						t: t.offset().top,
						l: t.offset().left,
						w: t.width(),
						h: t.height()
					}, null, function() {
						$(".jqueryui-tabs", "#frumbox-iframe").tabs();
					});
					break;
					
				case "help":
					var t = $(this);
					$.get(__global_root + "/Configuration/help.txt", function (data) {
						triggerFrumbox(null, Handlebars.getCompiledTemplate(btnAction, {
							helpfile: processString(data, "auto", false)
						}), {
							t: t.offset().top,
							l: t.offset().left,
							w: t.width(),
							h: t.height()
						});
					});
					break;
			}
			this.blur();
		});		

		pageLayout = $('body').layout({
			applyDefaultStyles:		false,
			showErrorMessages:		false,
			slidable:				true,
			fxName:					"slide",		// none, slide, drop, scale
			fxSpeed_open:			750,
			fxSpeed_close:			1500,
			fxSettings_open:		{ easing: "easeOutBounce" },
			fxSettings_close:		{ easing: "easeOutQuint" },
			north: {
				size : __settings.layout.panesize.north,
				spacing_open : 0,
				closable : false,
				resizable : false
			},
			south: {
				size : __settings.layout.panesize.south,
				closable : false,
				resizable : false,
				spacing_open: 0
			},
			east: {
				size : __settings.layout.panesize.east,
				togglerLength_closed: 0,
				togglerLength_open: 0,
				initClosed: false, // not supported in Book
				onopen_end: function () {
					resizeIframe();
				},
				onclose_end: function () {
					resizeIframe();
				},
				resizable: false,
				spacing_open: 0,
				spacing_closed: 16,
				slideTrigger_open: "click",
				slideDelay_open: 0,
				hideTogglerOnSlide: true
			},
			west: { // the east pane is a dummy that we use to set the correct margins on content
				size: __settings.layout.panesize.west,
				initClosed: false,
				spacing_open: 0,
				closable: false,
				resizable: false,
			}
		});

		

		$(document).bind("check.pager", function () {
			var $pane = $(".ui-layout-north"),
				_w = 0,
				$left = $(".pan-left",$pane), $right = $(".pan-right",$pane);
			$pane.css({
				"padding-left": $left.outerWidth(),
				"padding-right": $right.outerWidth()
			});
			$([$left,$right]).each(function(){_w+=parseInt($(this).outerWidth(true),10)})
		}).trigger("check.pager");

		// init the top carousel
		$(".ui-layout-north > ul").carouFredSel({
		    circular: false,
		    infinite: false,
		    width: "100%",
		    align: false,
		    height: "auto",
		    items: "variable",
		    auto: false,
		    swipe: true,
		    next: $(".pan-right",".ui-layout-north"),
		    prev: $(".pan-left",".ui-layout-north")
		});
		
		$(window).smartresize(function(){
			$(document).trigger("check.book").trigger("check.pager");
		});
		
		// change the scale of the page so that re-orienting the mobile device causes a scaling change, toggles menus, etc
		// TODO: may need to extend this for other tablets?
		if (__settings.layout.maxzoom != null && _sniff_isTablet) $('meta[name="viewport"]').attr("content","width=device-width, minimum-scale=1.0, maximum-scale=" + __settings.layout.maxzoom + ", initial-scale=1.0");

		if (__settings.layout.autohide && _sniff_isTablet) {

			// auto close the nav index in vertical orientation if Settings.xml allows it
			$(window).bind('orientationchange', function(event) {
				if(window.orientation % 180 == 0) {
					pageLayout.close("east");
				} else {
					pageLayout.open("east");
				}
			});

			// close left pane initially if orientation isn't set
			if (window.orientation % 180 == 0) {
				setTimeout(function () {
					pageLayout.close("east");
				}, 888); // delay allows page to draw
			}
		}
		
		// $(document).trigger("check.width");
				
		// bind stuff on this page
		reBindThingsThatMightBeDynamicallyLoaded();
	}

	function overrideStrings(json) {
		$.each(json.strings, function (index, value) {
			eval(value.key + "= \"" + value.text + "\"");
		});
	}
	
	// load begins with bringing in the config data, which is stored in a fixed location
	// them applying it to the template - Handlebars does the rest
	$.getJSON(__global_root + "/Configuration/settings.json", function (json) {
		__settings = json;
		overrideStrings(__settings);

	    // see if a bookmark is set
		if(_nBookmark == "") {
			// it has not been set, set it to show the first page of the first section
			_nBookmark = 1;
		}
	
	    // set the current page to the bookmark
	    _nPageCurrent = _nBookmark - 0;
    
	    // TOC is not drawn in this layout, handled inside handlebars in this player
		__settings.navigation["page"] = tocJSON(_oPages, 1, "");
		
		// get the layout
		$("body").append(Handlebars.getCompiledTemplate("player",__settings));

	    // load the current / bookmarked page
	    LoadContent(_nPageCurrent);

		main();
	});
	
	// load PIE.js on demand, if required (note shared run.js file)
	Modernizr.load({
    	test: Modernizr.borderradius,
        nope: __global_root + '/Layout/js/PIE.js',
	    complete: applyPIE
    });
	
});

function bindSlideBoxes ($owner) {
	$(".slide-box",$owner).each(function (index,el) {
		$(el).imagesLoaded().always(function (instance) {
			var $obj = $(instance.elements[0]).addClass("clearfix"),
				$container = $(".pages", $obj),
				$navigator = $(".navigator", $obj),
				$pages = $(".page", $container),
				$first = $pages.eq(0),
				orientation = $obj.attr("data-orientation"),
				_currentPage = 0,
				gotoPane = function(index,d) {
					if (index<0 || index>$pages.length-1) return;
					_currentPage = index;
					var $this = $pages.eq(index),
						_x = 0- parseInt($this.attr("data-position-x"),10),
						_y = 0- parseInt($this.attr("data-position-y"),10);
					$("span", $navigator).text("Page " + (_currentPage+1) + " of " + $pages.length);
					$first.animate({"margin-left":_x,"margin-top":_y},200);
				}

			var _w = $obj.parent().width();
			$pages
				.append($("<div/>").addClass("clearblock")) // each .page
				.width(_w)
				.equaliseHeights()
				.each(function (i,o) {
					// if (i==0 && orientation=='vertical') $(o).css({"margin-top":0,"padding-top":0}); // -o.offsetTop);
					$(o).attr("data-position-x", (orientation=="vertical" ? 0 : i*_w)).attr("data-position-y", (orientation=="vertical" ? parseInt(o.offsetTop,10) : 0));
				});
			var _h = $first.height();
			$container.height(_h).width(_w); // .pages
			$obj.addClass('unselectable'); // .height(_h + $navigator.outerHeight()).width(_w); // .slide-box
			if ($.browser.msie && $.browser.version < 10) makeUnselectable($obj.get(0)); // TODO: fix betterer
			$obj.swipe({
				swipe: function(event, direction, distance, duration, fingerCount) {
					switch (direction) {
						case "up":
						case "left":
							gotoPane(_currentPage+1,direction);
							break;
						case "down":
						case "right":
							gotoPane(_currentPage-1,direction);
							break;
					}
				}
			});
			$(".action-minus", el).swipe({
				tap: function () {
					gotoPane(_currentPage-1);
				}
			});
			$(".action-plus", el).swipe({
				tap: function () {
					gotoPane(_currentPage+1);
				}
			});
		});
	});
}

function reBindThingsThatMightBeDynamicallyLoaded() {

	var $book = $("#book"); // we might have a clone we are still animating out, so only bind to the active

	function toggleFeedback(el, ar) {
		var $div = $(".feedback", el).hide();
		if (ar.length === 0) return;
		$div.removeClass("hide").find("span").text(ar.join(", "));
		$div.fadeIn(1500);
	}

	// set the height of the book to be as high as the content area
	$(document).unbind("check.book").bind("check.book", function () {
		$book.height($("#contentContainer").css("overflow","hidden").height())
			 .width($("#contentContainer").width());
		var $left = $(".left-page",$book), _left = $left.get(0),
			$right = $(".right-page", $book), _right = $right.get(0);
		$(".left-page,.right-page",$book).height($book.height());
		if (_left && (_left.offsetHeight<_left.scrollHeight)) {
			$left.css("overflow-y","scroll"); // implement a flick scroller / button
		}
		if (_right && (_right.offsetHeight<_right.scrollHeight)) {
			$right.css("overflow-y","scroll"); // implement a flick scroller / button
		}
	}).trigger("check.book");
	
	$(".split-image",$book).each(function (index, el) {
		imagesLoaded(el).on('progress', function (instance,image) {
			if (image.isLoaded) {
				$(image.img).attr({
					"height": $(image.img).height(),
					"width": $(image.img).width(),
				});
			}
		}).on('fail', function (instance) {
			$(instance.elements[0]).hide();
		}).on('done', function (instance) {
			$(instance.elements[0]).splitImage({
				handle: __global_root + "/Layout/media/handle.png",
				colour: __settings.layout.basecolour
			});
		});
	});
	
	bindSlideBoxes($book);
		
	$(".backstretch",$book).each(function (index,el) {
		var $img = $(el),
			$parent = $img.closest("div"),
			path = $img.attr("src");
		$img.remove();
		$parent.backstretch(path);
	});
	
	// load back any data already stored by a quick quiz, assumes one per page
	$("div.inline-checklist,div.inline-checkimage",$book).each(function (index, el) {
		var $el = $(el),
			_feedback = [],
			_isImage = $el.hasClass("inline-checkimage");
		$("a[href='#save']", $el).click(function (event) {
			event.preventDefault();
			var _sData = [], _msg = [];
		    $("input:checked", $el).each(function () {
		    	var inp = $(this);
		    	_sData.push(inp.val());
				_msg.push(_isImage ? inp.attr("data-label") : $.trim(inp.next().text()));
		    });
		    setState($el.attr("data-scormid"), _sData.join(_avideSep));
		    toggleFeedback($el,_msg);
		});
	});

	$("div.inline-checktf",$book).each(function (index, el) {
		var $el = $(el),
			_feedback = [];
		$("a[href='#save']", $el).click(function (event) {
			event.preventDefault();
			var _sData = [];
		    $("input:checked", $el).each(function () {
		    	var $this = $(this);
		    	if ($this.val() == 1) {
		    		_sData.push($(this).closest("div").attr("data-index")); // radios have different values for the same name group, so we have to store the index
		    	}
		    });
		    setState($el.attr("data-scormid"), _sData.join(_avideSep));
		    toggleFeedback($el,[(_sData > "" ? "Your answers have been saved" : "")]);
		});
	});


	//TODO: clean up
	$("div.inline-survey div.range div.label",$book).equaliseWidths();
	$("div.inline-survey div.range",$book).buttonset(); // jquery-ui
	$("div.inline-survey",$book).each(function(index,el) {
		var $el = $(el);
		$("a[href='#save']", $el).click(function (event) {
			event.preventDefault();
			var _sData = [];
		    $("div.range", $el).each(function (ind,div) {
		    	_sData.push($(div).find(":checked").val()); // so _sData[@index] becomes value of selected radio
		    });
		    // console.log("survey", $el.attr("data-scormid"), _sData.join(_avideSep))
		    setState($el.attr("data-scormid"), _sData.join(_avideSep));
		    toggleFeedback($el,[""]);
		});
	});
	
	//collagePlus needs to work off fully loaded images, so use imagesLoaded to wait for them to load
	// best height is height of frame minus any margin which (for us) depends on the layout
	var imgLoad = $(".fit-images",$book)
		.imagesLoaded(function () {
			var th = $("#contentContainer").height();
			if ($(".display-right img", ".grid.header-inset").length) th -= $(".display-right img:first").css("marginTop");
			if ($(".display-right img", ".grid:not(.header-inset)").length) th -= $("header:first","#contentContainer").height();
			if ($(".col-2-5 img.box-shadow, .col-1-2 img.box-shadow, .col-1-4 img.box-shadow").length == 1) $(".col-2-5 img.box-shadow, .col-1-2 img.box-shadow, .col-1-4 img.box-shadow").css("cssText","margin-bottom: 0 !important"); // cssText to apply !important
			imgLoad.collagePlus({
				targetHeight: th
			});
		});
	// $(".display-right, .fit-images").collagePlus({targetHeight:200});

	// sequenced fadein
    $(".rp-fadein",$book).hide().each(function(index, el){
    	setTimeout(function () {
    		$(el).fadeIn(1234)
		}, 500 * (index+1));
	});

    $(".rp-fadeinfast",$book).hide().each(function(index, el){
    	setTimeout(function () {
    		$(el).fadeIn(250)
		}, 200 * (index+1));
	});

	// sequenced fadein for list items
    $(".rp-fancylist li",$book).css("opacity",0).each(function(index, el){
    	setTimeout(function () {
    		$(el).animate({
    			"opacity" : 1
    		},250)
		}, 750 * (index+1));
	});

	// sequenced slide in
    $(".rp-slidein",$book).hide().each(function(index, el){
    	setTimeout(function () {
    		$(el).slideDown(258)
		}, 250 * (index+1));
	});

	// sequenced bounce in
    $(".rp-bouncein",$book).hide().each(function(index, el){
    	setTimeout(function () {
    		$(el).effect("bounce", 123,
    		function () {
				if (window.PIE) {$(el).css("background-color","#fff"); PIE.attach(el) }; 
			});
		}, 250 * (index+1));
	});
	
	// sequenced blind show
	$(".rp-blindin",$book).hide().each(function(index, el){
    	setTimeout(function () {
    		$(el).effect("blind", {mode: "show"}, 567)
		}, 250 * (index+1));
	});
		
	function showQtip(event) {
		var $el = (event.target.nodeName != "A") ? $(event.target).closest("a, button") : $(event.target),
			_button = (event.target.nodeName == "BUTTON" || event.target.parentNode.nodeName == "BUTTON"),
			_qtip = {
				show: {
					ready: true,
					modal: {
						on: true,
						blur: true
					}
				},
				hide: 'unfocus',
				style: 'qtip-bootstrap',
				position: {
					at: 'center ' + (_button ? 'top':'right'),
					my: 'center left',
					viewport: $('#contentContainer'),
					adjust: { method: 'flipinvert shift' },
					target: $el
				},
				content: {
					text : function() {
						return unescape($el.attr("data-tip"));
					}
				}				
			};
		if (_button) {
			_qtip.content['title'] = function () {
				var _title = $el.attr("data-title");
				if (_title && _title.length) return unescape(_title);
				return $el.text();
			}
		}
		$("<div />").qtip(_qtip).qtip('api');
	}
	
	// buttons that pop up a qTip
	$(".tiptext, .tipbutton",$book).click(function (event) {
		// console.log("qtip",event);
		showQtip(event);
		event.preventDefault();
	})

	$(".glossary-term",$book).qtip({
		show: 'click',
		hide: 'unfocus',
		style: 'qtip-default qtip-rounded qtip-shadow',
		position: {
			at: 'bottom center',
			my: 'top left',
			adjust: {mouse: true },
			viewport: $(window)
		},
		content: {
			text : function() {
				return unescape($(this).attr("data-tip"));
			}
		},
       show: {
            effect: function() {
                $(this).slideDown();
            }
        },
        hide: {
            effect: function() {
                $(this).slideUp();
            }
        }
	});
	
	$(".img-zoom").each(function (ind,el) {
		$(el)
			.zoom({
				url: $(el).find("img").attr("data-url"),
				on: (_sniff_isTablet ? "grab" : "mouseover")
			});
	});
	
	// scales an image to fill the viewport, click to close again
	$(".rp-zoomable",$book).click(function() {
		var elm = $(this);
		var cM = 25;
		var sT = $("#contentContainer").scrollTop();
		var sL = $("#contentContainer").scrollLeft();
		var aH = $("#contentContainer").height(); //$(document).height();
		var aW = $("#contentContainer").width(); // $(document).width();
		var cH = aH-(cM*2);
		var cW = (elm.width()/elm.height()) * cH;
		var clone = elm.clone().removeClass("rp-zoomable").appendTo(elm.parent()).css({
			position: "absolute",
			zIndex: 9999,
			top: elm.offset().top + sT,
			left: elm.offset().left + sL,
			opacity: 0,
			display: "block",
			"max-width": cW,
			"background-color":"#ffffff"
		}).click(function () {
			// "fall" out of frame
			$(this).animate({
				top: (aH - cH)/2 + (cH/4) + sT,
				opacity: 0
			}, 250, function () {
				$(this).remove();
			});
		}).animate({
			top: (aH - cH)/2 + sT,
			left: Math.max((aW/2),(cW/2)) - Math.min((aW/2),(cW/2)) + sL,
			width: cW,
			height: cH,
			opacity: 1
		}, "fast");
	});

	// causes an overlay effect (frumbox) to appear
	$("a[rev=overlay], .jDialogButton, .rp-button-dialogue, a[video-iframe]",$book).click(function (event) {
		event.preventDefault();
		var t = $(this),
			href = t.attr("href");
		t.blur();
		if ($("#contentContainer").length) {
			if (href.toLowerCase().indexOf("en-us/content/parse") != -1) { // local content; ajax load so styles apply
				$.get(href, function (data) {
					triggerFrumbox(null, processString(data, "auto", false), {
						t: t.offset().top,
						l: t.offset().left,
						w: t.width(),
						h: t.height()
					},null,function () {
						// !Apply jquery tabs to parsed content, may need other functions here too 
						$(".jqueryui-tabs","#frumbox-inner").tabs();
						$(".jqueryui-accordion","#frumbox-inner").accordion({
							header: "h3",
							active: false,
							collapsible: true,
							alwaysOpen: false,
							autoHeight: false,
							heightStyle: "content"
						});
						bindSlideBoxes("#frumbox-inner");
					});
					
				});
			} else if (t.attr('video-iframe') !== undefined) { // full screen video
					var playerCode = videoPlayerCode(t.attr('video-iframe'), 0, $(document).width() - 130, $(document).height() - 130);

					triggerFrumbox(null, playerCode, {
						t: t.offset().top,
						l: t.offset().left,
						w: t.width(),
						h: t.height()
					}, {
                        top: $(document).scrollTop() + 50, 
                        left: $(document).scrollLeft() + 50,
                        width: ($(document).width() - 100) + 10,
                        height: ($(document).height() - 100) + 10
                    },
                    function() {
                    	if (playerCode.indexOf("ytvideo")) {
                    		var url = t.attr('video-iframe').split("watch?v=").pop().split("&")[0];
	                    	EmbedAndPlay_Youtube(url, "#frumbox-iframe");
                    	}
	                    $("#frumbox-iframe").css({
		                    "overflow":"hidden",
		                    "overflow-x":"hidden",
		                    "overflow-y":"hidden"
	                    });
                    }
					, {                // overlay appearance
                        opacity: 0.5,
                        colour: "#000000",
                        speed: 250
                    });

			} else {
				triggerOverlay(href, {
					t: t.offset().top,
					l: t.offset().left,
					w: t.width(),
					h: t.height()
				});
			}
		} else {
			var sz = null;
			if (t.hasClass("wider-popup")) {
			    var __W;
				try { __W = $(top.window); } catch (ex) { __W = $(window); }
				sz = {
					top: __W.scrollTop() + (__W.height()/4),
					left: __W.scrollLeft() + (__W.width()/6),
					width: __W.width()/1.5,
					height: __W.height()/2
				}				
			}
			parent.triggerOverlay(t.attr("href"), {
				t: t.offset().top + $("#FRM_CONTENT", parent.document).offset().top,
				l: t.offset().left + $("#FRM_CONTENT", parent.document).offset().left,
				w: t.width(),
				h: t.height()
			}, sz);
		}
    }); //.prepend(" ");
    
    if ($("sup",$book).length) {
		var refs = appendSettings("references"); // load once
	    $("sup",$book).each(function (index, el) {
	    	var t = $(el);
	    	t.click(function (event) {
		    	event.preventDefault();
				triggerFrumbox(null, Handlebars.getCompiledTemplate("references", __settings.references), {
					t: t.offset().top,
					l: t.offset().left,
					w: t.width(),
					h: t.height()
				}, null, function() {
					try {
		    			var li = $("li[data-id='" + t.attr("data-id") + "']", "#frumbox-iframe");
		    			if (li.length) {
		    				li.addClass("add-highlight");
							li.scrollIntoView();
						}
		    		} catch (ex) {
			    		console.log("Exception", ex);
		    		}
		    	})
			});
	    });
	}
	
	if (jQuery.isFunction(jQuery.fn.tipTip)) {
		$(".tooltip",$book).tipTip({
			activation: _sniff_isTablet ? "click" : "hover",	// touch devices
			keepAlive: _sniff_isTablet ? true : false,		// click to remove
			maxWidth: "auto",
			enter: function (el) {
				if (_sniff_isTablet) {
					$("#tiptip_holder").unbind("click").click(function () {
						el.deactive_tiptip();
					});
				}
			}
		});
	}
		
	// make jquery-ui tabs
	if (jQuery.isFunction(jQuery.fn.tabs)) {
		// console.log("making tabs");
		$("#tabs, .jqueryui-tabs",$book).tabs();
	}
	
	// make jquery-ui accordions
	if (jQuery.isFunction(jQuery.fn.accordion)) {
		$("#accordion, .jqueryui-accordion",$book).accordion({
			header: "h3",
			active: false,
			collapsible: true,
			alwaysOpen: false,
			autoHeight: false,
			heightStyle: "content"
		});
	}
	
	// make radio groups work like buttons
	if (jQuery.isFunction(jQuery.fn.buttonset)) {
		$(".rp-survey-radiogroup",$book).buttonset();
	}
	
	// popups, highlighting on image maps
	$("img[usemap]",$book).each(function(index,el) {
		$(el).maphilight();
		$(el).parent().find("area").each(function(i,o) {
			var $o = $(o),
				$target = $($o.attr("href")).hide();
			$o.qtip({
				content: function () {
					return $target.html();
				},
				position: {
					target: 'mouse',
					adjust: { mouse: false },
					at: "center right",
					viewport: $(window)
				},
				style: "qtip-bootstrap"
			});
		})
	});

	// prepare flip-cards, also left-to-right slidein for quickflips
	if (jQuery.isFunction(jQuery.fn.quickFlip)) {
		// calculate max size of hidden elments
		var maxAH = 0, maxAW = 0, maxDH = 0, maxDW = 0;
		$("div[class^='flip-side']",
			$(".rp-flip",$book).each(function(index,el) {
				var d = $(el).actualSize();
				if (d[0] > maxDW) maxDW = d[0];
				if (d[1] > maxDH) maxDH = d[1];
			})
		).each(function(index,el) {
			var d = $(el).find("a").actualSize();
			if (d[0] > maxAW) maxAW = d[0];
			if (d[1] > maxAH) maxAH = d[1];
		});
	    var _qf = $(".rp-flip",$book).hide().each(function(index, el) {
	    	$(el).css({
	    		"height": maxDH,
	    		"width": maxDW
	    	}).find("a").css({
	    		"height": Math.max(maxAH, maxDH),
	    		"width": Math.max(maxAW, maxDW),
	    		"display":"table-cell",
	    		"vertical-align":"middle",
	    		"align":"center"
	    	});
	    	$(el).quickFlip({
				noResize: true
	    	});
	    	setTimeout(function () {
	    		$(el).show('slide',{direction:'left'},258);
			}, 250 * (index+1));
		});
		// $(".rp-flip a").equaliseHeights();
	}

	// prepare transitions
	// can be one of
	// blindX blindY blindZ cover curtainX curtainY fade fadeZoom growX growY
	// scrollUp scrollDown scrollLeft scrollRight scrollHorz scrollVert
	// shuffle slideX  slideY toss turnUp turnDown turnLeft turnRight uncover wipe zoom
	if (jQuery.isFunction(jQuery.fn.cycle)) {
		$(".rp-slideshow",$book).each(function(index,el) {
			var _effect = $(el).attr("data-effect");
			$(el).cycle({
				fx: _effect
			});
		})
	}
	
	// make sure we don't still have a spinner
	$("#loading").remove();
	
	// apply PIE for content
	applyPIE();
		
}


// PIE normally initialised by Modernizr
function applyPIE() {

	if (window.PIE && !Modernizr.borderradius) {

		$(".navigation-button-wrapper").each(function () {
			PIE.attach(this);
		});

        // jqueryui that we CAN handle, albeit with fixed border size
        $(".ui-corner-all").each(function () {
        	var t = $(this);
			t.css({
				"position":"relative", // hack needed for this doctype
        		"border-radius":"4px 4px 4px 4px"
        	});
        	PIE.attach(this);
        })
    }
}

// utility: change the height of the iframe to fit the layout container
function resizeIframe() {
	if (_$ct) clearTimeout(_$ct);
	_$ct = setTimeout(function () {
		var _frm = frames["FRM_CONTENT"], $frm = $("#FRM_CONTENT");
		if (_frm) {
			var $container = $("#book"); // contentContainer
			$frm.css({
				"width":$container.width(),
				"height":$container.height()
			});
			_frm.$("[data='rp-quiz-layout']").css({
				"width":$container.width(),
				"height":$container.height()
			}).layout("resizeAll");
		}
	}, 234);
}

// utility to open lightbox
function triggerOverlay(uri, pos, size, fnAfter) {
	triggerFrumbox(uri,null,pos,size,fnAfter);
}

function triggerFrumbox(uri, data, pos, size, fnAfter, fx) {
	if (!jQuery.isFunction(jQuery.fn.frumbox)) return;
	if (typeof fx === 'undefined') {
	    fx = {                // overlay appearance
	        opacity: 0.5,
	        colour: "#ffffff",
	        speed: 250
	    };
    }
	var span = $("<span></span>").css({
		position: "fixed",
		top: pos.t,
		left: pos.l,
		width: pos.w,
		height: pos.h
	})
	.show()
	.appendTo("body")
	.frumbox({
   		onAfterOpen: function (el,data) {
			if (window.PIE) {
				PIE.attach(document.getElementById('frumbox-inner'));
		    }
		    // console.log("on after open", data, uri, el, objdata);
		    if (data != null) $("#frumbox-inner").css("overflow","scroll"); // since it's not an iframe this allows scrolling
			if (jQuery.isFunction(fnAfter)) fnAfter();
		},
		href : uri,
		content : data,
	    onAfterClose: function () {
	    	span.remove();
	    },
	    overlay: fx
	});
	if (size && (size != null)) {
		span.frumbox("setSize",size);
	}
	span.frumbox("open");
}

function showFeedBack(v) {
	if ($("#feedback").length) $("#feedback").hide().html(v).fadeIn(1500);
}

function getDocHeight() {
	var D = document;
	return Math.max(Math.max(D.body.scrollHeight, D.documentElement.scrollHeight), Math.max(D.body.offsetHeight, D.documentElement.offsetHeight), Math.max(D.body.clientHeight, D.documentElement.clientHeight));
}

// https://developers.google.com/youtube/training/player/chapter-marker/102
function EmbedAndPlay_Youtube(videoid, container) {
	$.getScript("//www.youtube.com/iframe_api")
		.fail(function () {
			// some kind of alert to the user ...
		})
		.done(function () {
			var $container = $(container);
			var w = $(container).width(),
				h = $(container).height(),
				player = new YT.Player('ytvideo', {
					height: h,
					width: w,
					videoId: videoid,
					events: {
						'onReady': function (event) {
							event.target.playVideo();
						}
					}
					
				});
		});
}
