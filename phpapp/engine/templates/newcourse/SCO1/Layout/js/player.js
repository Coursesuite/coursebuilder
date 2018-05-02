var __global_root = window.location.href.split("?")[0].split("#")[0],
	_loader = null; 

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

// ## OBJECTS CONSTRUCTORS

// create a class for the node status object - this keeps track of status of each node in the course
// sId - the id of the node
// sTocPath - the node path, example 1_2_3_4
// sVisited - the vivisted status of the node
// sTitle - the title of the node
// sHtmlFileName - the asscoicated .html file name
// bHasChildren - true if the node has children
// bExpanded - true if this node is expanded
// sStatus - 'n' - none, 'p' if passed, 'i' if incomplete and 'c' for completed
// nScore - the score of the page
function NodeStatus(sId, sTocPath, sTitle, sHtmlFileName, bExpanded, bHasChildren, nParentId, sStatus, nScore, sContribute, sType, sTemplate) {
	// init the properties
	this.sId = sId;
	this.sTocPath = sTocPath;
	this.sTitle = sTitle;
	this.sHtmlFileName = sHtmlFileName;
	this.bExpanded = bExpanded;
	this.bHasChildren = bHasChildren;
	this.nParentId = nParentId;
	this.sStatus = sStatus;
	this.nScore = nScore;
	this.sContribute = sContribute;
	this.sType = sType;
	this.sTemplate = sTemplate;
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
        var nOverallScore = getOverallScore();

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

// called by the onload function of the main course page
function loadCourse() {
    // see if a bookmark is set
	if(_nBookmark == "") {
		// it has not been set, set it to show the first page of the first section
		_nBookmark = 1;
	}
	
    // set the current page to the bookmark
    _nPageCurrent = _nBookmark - 0;
    
    // display the table of contents
    showTOC();

	//hide all 
	closeAllTocs();

    // load the bookmarked page
    LoadContent(_nPageCurrent);
    
    // set tool tips
    // SetTooltips();

    // if (jQuery.isFunction(jQuery.fn.bindJQueryAfterLoad)) {
    if (typeof window.bindJQueryAfterLoad == 'function') bindJQueryAfterLoad();; // execute things that happen after this load event (if handler exists)
}

// inject the table of contents to the '[selecteLanguage]/Launch.html' 'TOC' div.
function showTOC() {

    // insert toc DHTML
    jQuery("#TOC").html(showTocLevel(_oPages, 1, "")); // so jquery events bind

	// fancy top to bottom fade in of top level items in menu
    jQuery(".level1Container").hide().each(function(index, el){
    	setTimeout(function () {
    		jQuery(el).fadeIn(250)
		}, 50 * index);
	});

}





/*
 * Recursive routine to draw the menu bar
 * Expands current nodes children by examining "TocPath"
//	oXML - the XML of this level
//	nLevel - the level in the XML, example 1
//	sTocPath - the node's path, example 1_2_3
 */

/* TODO: Refactor to use font-awesome icons so we can colour them easily
	however, some things use image source as a case, not an internal state - oh no

TOC NORMAL: icon-caret-right
TOC expanded: icon-caret-down

Not attempted: icon-ok-circle (unfillied tick) or icon-check-empty (empty tickbox) or icon-star-empty (star outline)
Current page: icon-hand-right (pointing hand)
Page complete: icon-ok-sign (filled tick) or icon-check (ticked box) or icon-star (filled star)
Required quiz: icon-warning

Intro page (if not custom): icon-home
Completion page: icon-info-sign



 */
function showTocLevel(oXML, nLevel, sTocPath) {
    var sTitle, sContribute, sId, sType, sTemplate;
	var sEffect, sPath, sVisible; // tim's extensions
	
	// init s to hold the DHTML - storing as array using s[s.length] is faster than s.push and much, much faster than s += ""
	var s = [], jTocIncrementor = 0;

	//add a div to hold the children of the previous level
	s.push('<div id="toc_' + _nNodes + '_children" class="toc-child-wrapper">');

	var tempTocPath = sTocPath; // remember the toc path before looping
	var nParentId = _nNodes; // remember parent id
	
	// loop through the items in this level
	for (var j=0; j<oXML.length; j++) {

		//continue only if the node is an 'element', example 1
		if (oXML[j].nodeType != 1)
		    continue;
		    
		// get the current xml element
		var currentElem = oXML[j]; 

		//extn: effect
		sEffect = currentElem.getAttribute("display"); if (sEffect===null) sEffect='';
		//extn: resource to use (e.g. image)
		sPath = currentElem.getAttribute("resourceName"); if (sPath===null) sPath='';

		// content template
		sTemplate = currentElem.getAttribute("template"); if ($.trim(sTemplate)==="") sTemplate='auto';

		// get the current node html file name
		sHtmlFileName = currentElem.getAttribute("fileName");
		
		// don't include popups or includes
		// this means you can add a file within the authtool as a child so you can edit it directly, but it doesn't contribute to the SCO
		if ((sHtmlFileName.indexOf("popup")==0) || (sHtmlFileName.indexOf("include")==0) || (sHtmlFileName.indexOf("parse")==0))
			sEffect = "hidden";

		// skip hidden elements; note, hidden items can't have children
		if (sEffect == "hidden") {
			continue;
		}
		
		s.push('<div class="level' + nLevel + 'Container">');
		
		// get current node title.
		sTitle = currentElem.getAttribute("title");
		// get the current node 'contribute' string
		sContribute = currentElem.getAttribute("contribute");
		// get the type of the page
		sType = currentElem.getAttribute("type");
		//get the page id
		sId = currentElem.getAttribute("id");
		
		// increment the number of nodes.
        _nNodes++;
        // build the toc path, example 1_1_3
        // sTocPath = (tempTocPath == "") ? (j + 1).toString() : tempTocPath + "_" + (j + 1);
        sTocPath = (tempTocPath == "") ? (jTocIncrementor++).toString() : [tempTocPath,jTocIncrementor++].join("_");
        
        // get visited visited status
        var sStatus = "n", nScore = 0;
        if (_aRestoredStatus[_nNodes] != undefined)
        {
            // get status values from the restored array
            sStatus = _aRestoredStatus[_nNodes].sStatus;
            // get the page score from the restored status array
            nScore = _aRestoredStatus[_nNodes].nScore
        }
       
        // initialize the new node by adding it in the nodes array.
        _aNodeStatus[_nNodes] = new NodeStatus(sId, sTocPath, sTitle, sHtmlFileName, true, false, nParentId, sStatus, nScore, sContribute, sType, sTemplate);
        // get the 'contributeScore' attribute from the xml element
        _aNodeStatus[_nNodes].nContributeScore = currentElem.getAttribute("contributeScore") - 0;
        // get the 'contributePercentage' attribute
        _aNodeStatus[_nNodes].nContributePercentage = currentElem.getAttribute("contributePercentage") - 0;
        // get the 'nav' attribute
        _aNodeStatus[_nNodes].sNavigation = currentElem.getAttribute("nav");
        // get the 'navscore' attribute
        _aNodeStatus[_nNodes].nNavigationScore = currentElem.getAttribute("contributeScore") - 0;
        // get the audio file
        _aNodeStatus[_nNodes].sAudioFile = currentElem.getAttribute("audioFile");

        // get the children of this node
		var oChildren = currentElem.childNodes;
		// get the children number
		var nLength = getChildrenLength(oChildren), iterateLength = nLength;
		
		// see if this node has any children
		if (nLength > 0) {
		    // remember that this node has children
		    setPageHasChildren(_nNodes, true);

		    // add the tree/expansion control
		    s.push("<a href='#' class='toc-tree' title='" + _sTipCloseSection + "' id='tocCtl_" + _nNodes + "'><i class='icon-caret-down'></i></a>")
		} 

		// getthe class style of the current page depending on it's status
		var lsClass = sStatus != 'n' ? 'Visited' : '';

		// insert the anchor
		s.push('<a href="Content/' + sHtmlFileName + '" class="toc-node level' + lsClass + '" id="toc_' + _nNodes + '" title="' + sTitle + '">');

		// insert the current node status icon
        s.push("<span class='node-status' id='node-status-" + _nNodes + "' title='" + getStatusImageTitle(_nNodes) + "'>" + getNodeStatusIcon(_nNodes) + "</span>");

		switch (sEffect.toLowerCase()) {
			case "flip":
				s.push('<div class="rp-flip">');
				s.push('<div class="rp-flip-side1"><img src="' + sPath + '"></div>');
				s.push('<div class="rp-flip-side2">' + sTitle + '</div>');
				s.push('</div>');
				break;
				
			case "imagelabel":
				s.push('<img src="' + sPath + '" class="rp-menuitem-image" /><span class="rp-menuitem-label">' + sTitle + '</span>');
				break;

			case "caption":
				s.push('<img src="' + sPath + '" class="rp-menuitem-image captify" rel="cptfy_' + _nNodes + '" /><span id="cptfy_' + _nNodes + '">' + sTitle + '</span>');
				break;

			case "image":
				s.push('<img src="' + sPath + '"  class="rp-menuitem-image" />');
				break;

			default:
				s.push('<span class="rp-menuitem-text">' + sTitle + '</span>');
				break;
		}

		s.push('</a>');

	    // get the DHTML for the children
		if (nLength > 0) {
			s.push(showTocLevel(oChildren, nLevel + 1, sTocPath));
		}

		s.push('</div>'); // container

	}
	// add the end of the _children div
	s.push('</div>');
	
	return s.join("\n");
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

// ## PAGE NAVIGATION

// request to go to the next page

function NextPage() {
	var sNext;
	
	// see if the focus is in the content page
	if (window == parent.FRM_CONTENT) {
		// it is, call the next page handler in the parent
		parent.NextPage();
		return;
	}
	
	// see if the next button is enabled
	// console.log($("a[data-action].Next"), $("a[data-action].Next").filter(":first"));
	if ($("a[data-action].Next").filter(":first").hasClass('NavLink')) {
		// load the next page
		LoadContent(_nPageCurrent + 1);
	}
}

// navigate to the previous page
function PreviousPage() {

    // see if the focus is in the content page
	if (window == parent.FRM_CONTENT) {
		// it is, call the previous page handler in the parent
		parent.PreviousPage();
		return;
	}
	
	// see if the next button is enabled
	if ($("a[data-action].Previous").filter(":first").hasClass('NavLink')) {
	// navigate to the new page
	    LoadContent(_nPageCurrent - 1);
	}
}

// navigate to the home page
function HomePage() {
	if (window == parent.FRM_CONTENT) {
		// it is, call the next page handler in the parent
		parent.HomePage();
		return;
	}
	if (__settings.navigation.home.uri == "") {
		LoadContent(1); // index is 1 based for some reason
	} else {
		document.location.href = __settings.navigation.home.uri;
	}
}

// go to specified file name
function gotoPage(sHtmlFileName) {
   // get the id by searching after the file name
   var nId = getIdByFileName(sHtmlFileName);
   
   // check to see if the id was found
   if (nId == 0) {
        // no id found, inform the author
        alert('Page ' + sHtmlFileName + ' cannot be found');
        return;
   }
   // navigate to the specified page
   LoadContent(nId);
}
// a new navigation request has been made from the main menu, TOC or prev/next buttons
//	nID - the page by id
function LoadContent(nID, avoidHistory) {

    // calculate current test status
    if (frames["FRM_CONTENT"]) {
    	if (frames["FRM_CONTENT"].termQuiz) frames["FRM_CONTENT"].termQuiz();
    	$("#contentContainer").css("overflow","auto"); // reset overflow
	    $("#FRM_CONTENT").remove();
	    $(window).unbind("resize.iframe");
    }
    // remove the content frame, if it exists

    // check if the requested page can be naviagated
    if (canNavigatePage(nID) == false) {
        // display an aler message
        alert(_sNavigateFailMsg);
        // skip page loading
        return;
    }

	// reset the global increment
	_global_increment = 0;

    // tell the TOC to unselect the currect selection
    tocUnselect();

	// get the file name for the current id
	var fileName = getPageHtmlFileName(nID);
	
	// reference to the name of this page
	var pageTitle = getPageTitle(nID);
	
	//get the type of file that we are going to work with
	var fileType = getPageType(nID);
	
	//get the grid template for this item
	var sGrid = getPageTemplate(nID);

	var $content = $("#contentContainer").empty().scrollTop(0);
	_loader = setTimeout(function () {$content.append("<div style='position:absolute;left:48%;top:48%;' id='loading'><i class='icon-spinner icon-spin icon-4x icon-muted'></i></div>")}, 789);
	
	if (fileType == "quiz" || fileType == "test" || (fileType.indexOf("question") != -1)) { // until we can do better; avoids scope problems
		$content.css("overflow","hidden");
        if (avoidHistory !== true) history.pushState( {id: nID}, pageTitle, location.href); // href never changes
		var $iframe = $("<iframe />").attr({
				title: "Quiz content",
				width: "100%",
				scrolling: "auto",
				height: "100%",
				frameborder: "0",
				src: __global_root + "/en-us/Quiz.html?filename=" + fileName,
				id: "FRM_CONTENT",
				name: "FRM_CONTENT",
				allowTransparency: "true"
			})
			.css({
				width: $content.width(),
				height: $content.height(),
				visibility: "hidden"
			})
			.appendTo($content);
		$(window).bind("resize.iframe", function () {
			resizeIframe();
		});
		
	} else {
		
		// load the file's body to a dummy object (filename space search notation)
		$.get(__global_root + "/en-us/Content/" + fileName + "?" + Math.random(), function (response, status, xhr) {
			
			if (status != "error") {
				
				// actually, push state to history now that we know we have navigated to a loadable place
				// so next/prev and hyperlink clicks all come through this one spot
		        if (avoidHistory !== true) history.pushState( {id: nID}, pageTitle, location.href); // href never changes
		        // update window title
		        document.title = __settings.course.name + ": " + pageTitle;
				
				if (response.indexOf("</head>")!=-1) response=response.substring(response.indexOf("</head>") + 7); // skip head if set (avoid potential noise)
				
				 // regexp <head>.+?</head> is error prone, http://en.wikipedia.org/wiki/Chomsky_hierarchy#The_hierarchy
				 // $(response.substring(response.indexOf("<body"))) // can't assume we have a "body", support plain text
				var body = response,
					len = 0,
					header = "",
					inset = false,
					left = [],
					right = [],
					cache = $("<div>").html("<pre>" + body + "</pre>").text().split(/(\r\n|\n\r|\r|\n)+/); // split on \r or \n or any combination thereof
					// proxy string to dom node first
					// IE8 innerText bug with line breaks works if you wrap the html in <pre> ... which then sees \n as \r ??? WTFIE?
				for (var i=0;i<cache.length;i++){
					var line = $.trim(cache[i]); // old safari compatible, IE doesn't match non-breaking spaces with \s, jQuery does it better
					if (line.length) { // skip blank lines
						// process line for commands & determine template
						if ((line.indexOf("}")!=-1) && line.indexOf("}")>line.indexOf("{")) {
							val = processLine(line);
							if (val[2] && val[2]=="inset") inset = true;
							if (val[1]=="right") {
								right.push(val[0]);
							} else {
								if (line.lastIndexOf("}")===line.length-1) val[0] = "<p>" + val[0] + "</p>"; // wrap lines that terminate with a command
								left.push(val[0]);
							}
						} else {
							//console.log("no curlies, len",len);
							if (len++==0) {
								header = line;
							} else {
								left.push("<p>" + line + "</p>");
							}
						}
						
					}
				}

				// NOW we can clear the loader if it's not already run
				if (_loader) clearTimeout(_loader);
		
				// load and inject a fresh content template
				$content.html(Handlebars.getCompiledTemplate("grids/" + sGrid,{
					"left" : left.join(""),
					"right" : right.join(""),
					"title" : header,
					"inset": inset
				}));
	
				// re-bind any jquery on these objects for events that we might have just bound to (ideally use live/on, needs refactor)
				reBindThingsThatMightBeDynamicallyLoaded();
				
			} else {
				if (_loader) clearTimeout(_loader);
				$content.html("<p class='error'>Problem loading page - " + fileName + "</p>");
			}
			
		});
	} // quiz
	
	// autoclose the previous page if needed
	tocAutoClose(_nPageCurrent);
	
	// remmeber this page as the current page
	_nPageCurrent = nID - 0;
	
	// set the prev/next button visibility
	setPrevNext();
	
	// mark this new node as visited, this will update the visited state of the parents
	updateCurrentPageStatus();
	
	// tell the TOC to select this node and parents
	tocSelect(_nPageCurrent);
	
	// update the bookmark
	setBookmarkInfo(_nPageCurrent);
	
    // play page audio if contains any
	playCurrentPageAudio();
	
	// resize the course window to fit the player
	// resizeCourse();
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
					
				case "load": // load an external page (e.g. to load a table, image map stored in an external html file, etc)
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
							tag.push(processHTML(response));
						},
						async: false
					});
					break;
				
				case "overlay": // frumbox overlay using an iframe
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
	
				case "zoomimage": // single inline image
					tag.push("<img src='" + __global_root + "/en-us/Content/media/" + instruction[0] + "' class='rp-image rp-zoomable' />");
					break;
					
				case "float": // div (not span!) float wrapper
					tag.push("<div style='float:" + instruction[0] + "'>" + instruction[1] + "</div>");
					console.log("tag for float", tag);
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
									var r = (response.indexOf("<body") == -1) ? response : response.substring(response.indexOf(">", response.indexOf("<body") + 4) + 1, response.lastIndexOf("</body"));
									if ((r.indexOf("}")!=-1) && r.indexOf("}")>r.indexOf("{")) r = processLine(r)[0];
									_tab.push({
										"title": instruction[i],
										"content": r
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
					tag.push("<button class='tipbutton' data-tip='" + escape(instruction[1]) + "'><i class='icon-comment'></i> " + instruction[0] + "</button>");
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
							"front": processLine(instruction[i])[0],
							"back": processLine(instruction[i+1])[0]
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
				    	tag.push(processLine(instruction[0])[0]);
				    } else {
				    	tag.push(processLine(instruction[1])[0]);
				    }
				    break;
					
				case "completion": // page that shows the completed statement
				    var sLearnerName = getLearnerName(),
				    	aMonths = _sMonths.split(","),
				    	d = new Date(),
				    	sCompletionStatus = checkCourseCompletion(),
					    bIsCourseCompleted = isComplete(sCompletionStatus),
				    	sTemplate = (bIsCourseCompleted) ? "competent" : "notyetcompetent",
				    	score = Math.round(getOverallScore());
				    if (score > __settings.course.passingScore) score = __settings.course.passingScore;
					tag.push(Handlebars.getCompiledTemplate("completion\/" + sTemplate, {
						"title": bIsCourseCompleted ? instruction[0] : instruction[1],
						"score": Math.round(getOverallScore()),
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
					//var column = []; // TODO: refactor as $.map
					//for (var i=1; i<instruction.length; i++) {
					//	column.push(instruction[i]);
					//}
					tag.push(Handlebars.getCompiledTemplate("grids/ngrid",{
						"total": instruction.length,
						"column": instruction
					}));
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

function processHTML(response) {
	var cache = (response.indexOf("<body") == -1) ? response : response.substring(response.indexOf(">", response.indexOf("<body") + 4) + 1, response.lastIndexOf("</body"));
	var lines = $("<div>").html(cache).text().split("\n");
	for (var i=0;i<lines.length;i++) {
		lines[i] = $.trim(lines[i]);
		if (lines[i].length) {
			if ((lines[i].indexOf("}")!=-1) && lines[i].indexOf("}")>lines[i].indexOf("{")) {
				lines[i] = processLine(lines[i])[0]; // ignore left/right in sub-pages
			} else {
				lines[i] = "<p>" + lines[i] + "</p>";
			}
		}
	}
	return lines.join("");
}

// play current page audio
function playCurrentPageAudio() {
    // get the associated audio file for the current page
    var sAudioFile = _aNodeStatus[_nPageCurrent].sAudioFile, sPlayer = "";

    // check if any audio for current page exists
    if (sAudioFile != null && sAudioFile != "") {
        // exists, get audio file extension
        var fileExtension = (/[.]/.exec(sAudioFile)) ? /[^.]+$/.exec(sAudioFile) : undefined;
        if (fileExtension) {
            // set the object based on the audio file type
            switch (fileExtension[0]) {
                case "flv":
                    sPlayer += '<object data="Content/mcmp_0.8.swf" height="27" width="250" type="application/x-shockwave-flash">';
                    sPlayer += '<param name="allowScriptAccess" value="sameDomain" />';
                    sPlayer += '<param name="allowFullScreen" value="true" />';
                    sPlayer += '<param name="movie" value="Content/mcmp_0.8.swf">';
                    sPlayer += '<param name="quality" value="high" />';
                    sPlayer += '<param name="bgcolor" value="#ffffff" />';
                    sPlayer += '<param name="FlashVars" value="videoScreenPosition=0x0&videoScreenSize=0x0&fpAction=play&cpHidePanel=never&';
                    sPlayer += 'cpBackgroundColor=ffffff&playerBackgroundColor=ffffff&audioScreenSize=250x44&streamingServerURL=&';
                    sPlayer += 'fpPreviewImageURL=&cpCounterPosition=0x220&cpRepeatBtnPosition=0x220&cpInfoBtnPosition=0x220&';
                    sPlayer += 'cpFullscreenBtnPosition=0x220&cpBackgroundOpacity=100&fpFileURL=Media/' + sAudioFile + '" />';
                    sPlayer += '</object>';
                    break;
                case "mp3":
                    sPlayer += '<object data="Content/player_mp3_maxi.swf" height="27" width="250" type="application/x-shockwave-flash">';
                    sPlayer += '<param name="src" value="Content/player_mp3_maxi.swf">';
                    sPlayer += '<param name="FlashVars" value="autoplay=1&bgcolor1=ffffff&bgcolor2=ffffff&buttoncolor=0d0d0d&showvolume=1&showstop=1&mp3=Content/Media/' + sAudioFile + '" />';
                    sPlayer += '</object>';
                    break;
                default:
                    sPlayer += '<object data="Content/Media/' + sAudioFile + '" width="256" height="41" type="audio/x-ms-wma">';
                    sPlayer += '<param name="src" value="Content/Media/' + sAudioFile + '">';
                    sPlayer += '<param name="autoStart" value="1">';
                    sPlayer += '<param name="ShowDisplay" value="false" />';
                    sPlayer += '<param name="ShowPositionControls" value="false" />';
                    sPlayer += '</object>';
                    break;
            }
        }
    }

    // insert the html content
    document.getElementById("audioPlayer").innerHTML = sPlayer;
    // change visible state based on the value of the inner html
    document.getElementById("audioPlayer").style.display = sPlayer == "" ? "none" : "block";
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

// an item in the TOC was clicked on
function clickTocControl(nID) {
	var sImg, sTooltip, sIcon,
		_nodeId = parseInt(nID.substring(7),10),
		$obj = $("#" + nID),
		$icon = $("i", $obj),
		bExpanded = false;
	if ($icon.hasClass("icon-caret-down")) { // already expanded
		$obj.attr("title", _sTipOpenSection);
		$icon.removeClass("icon-caret-down").addClass("icon-caret-right");
		bExpanded = false;
	} else if ($icon.hasClass("icon-caret-right")) { // not yet expanded
		$obj.attr("title", _sTipOpenSection);
		$icon.removeClass("icon-caret-right").addClass("icon-caret-down");
		bExpanded = true;
	}
	if (bExpanded == true) {
		$("#toc_" + _nodeId + "_children").show();
	} else {
		$("#toc_" + _nodeId + "_children").hide();
	}
	setPageExpanded(_nodeId, bExpanded);

}
function closeAllTocs(){
	if (_bTocAutoClose) {
		// we do, see if this page has children
		for (var i = 1; i <= _nNodes; i++) {
			tocAutoClose(i);
		}
	}
}

// an item in the TOC was clicked on
//	sID - the name of the toc item, example toc_11
function clickTocHyperlink(sID) {
	// pull off the toc_ part of the ID
	sID = sID.substring(4);
	
	// show the selected page
	LoadContent(sID - 0);
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

// unselect the current node
function tocUnselect() {
    // mark the node as visited
    markTocNode(_nPageCurrent, "Visited");
}

// select the page and its parents in the TOC
function tocSelect(nID) {
	// keep track of the original page, we will need this to handle scrolling
	var nOrig = nID;
	
	// select this page
	markTocNode(nID, "Selected");
	
	// see if this page has children
	if (getPageHasChildren(nID)) {
		// it does, see if the node is already open
		if (!getPageExpanded(nID)) {
			// it is not, open it (pretend we clicked on it in the TOC)
			clickTocControl("tocCtl_" + nID);
		}
	}
	
	// get the parent id of the current page
    var nParentId = getPageParentId(nID);
	
	// loop until we have visited all of the parents
    while (nParentId != 0)
    {
	    if (!getPageExpanded(nParentId)) {
			// it is not, open it (pretend we clicked on it in the TOC)
			clickTocControl("tocCtl_" + nParentId);
		}
	    // get the parent of this page
        nParentId = getPageParentId(nParentId);
    }
    
    // get the id of the TOC section container
    var oSections = document.getElementById('TOC');
    
    // get the y position of the TOC section container
	var nSectionsY = findPosY(oSections);
	
	// get the y position of the selected page
	var nItemY = findPosY(document.getElementById('toc_' + nID));	
	
	// adjust the item height to be in the coord space of the container
	nItemY -= nSectionsY;
	
	// get the height of the container and pull off the "px" part on the end
	var nHeight = parseInt(oSections.style.height,10);
    // get y position on screen
	var currPos = nItemY - oSections.scrollTop;
	// get level padding top
	var levelPaddingTop = 5;
	// get level height
	var levelHeight = 21 + levelPaddingTop;

	// see if the complete item is greater than the height of the container
	if ((currPos + levelHeight) > nHeight) {
		// it is, scroll the selected page into view
		oSections.scrollTop += currPos - nHeight + levelHeight;
	} else {
		// see if the item is showing given the current scroll position
		if (oSections.scrollTop > nItemY) {
			// it is, scroll the item into view
			oSections.scrollTop -= -currPos + levelPaddingTop;
		}
	}
	
	// oSections.scrollIntoView();
}

// autoclose the previous selected page
function tocAutoClose(nID) {
	if (_bTocAutoClose) {
		// we do, see if this page has children
		if (getPageHasChildren(nID)) {
			// it does, see if the node is already open
			if (getPageExpanded(nID)) {
				// it is, close it (pretend we clicked on it in the TOC)
				clickTocControl("tocCtl_" + nID);
			}
		}
		
    // get the parent id of the current page
    var nParentId = getPageParentId(nID);
	
	// loop until we have visited all of the parents
    while (nParentId != 0)
    {
	    if (getPageExpanded(nParentId)) {
			// it is not, open it (pretend we clicked on it in the TOC)
			clickTocControl("tocCtl_" + nParentId);
		}
	    // get the parent of this page
        nParentId = getPageParentId(nParentId);
    }
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
//	sState - "", "Passed", "Incomplete", "Complete"
// "Visited" or "Selected"
// Note: Visited does not get removed when changing to other states
function markTocNode(nID, sState) {
	$("#toc_" + nID).removeClass("state-Passed state-Incomplete state-Complete state-Selected").addClass("state-" + sState);
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

function getPageExpanded(nIndex) { return _aNodeStatus[nIndex].bExpanded; }
function setPageExpanded(nIndex, bExpanded) { _aNodeStatus[nIndex].bExpanded = bExpanded; }

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
    var nReturn = Math.min(Math.round(nTotalScore),100); // so that it doesn't exceed 100
    
    return (nTotalScore != null) ? nReturn : null;
}

// replaces 'oBody' vars
function replaceVars(oBody) {
    // get the html 
   // var sData = oBody.document.body.innerHTML;
	var sData = oBody.html();

    // get learner name    
    var sLearnerName = getLearnerName();
    
    if (sData===null) sData = "";
    
    // replace the 'name' var
    sData = sData.replace(/%%name/g, sLearnerName != "" ? sLearnerName : _sTextLearnerName);
    
    // get the array of months
    var aMonths = _sMonths.split(",");
                            
    // get date in format 'January 1, 2009'
    var d = new Date();
    // replace the 'date' var
    sData = sData.replace(/%%date/g, aMonths[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear());
    // replace the 'score' var
    sData = sData.replace(/%%score/g, Math.round(getOverallScore()));
    
    // update the completion status of the course
    var sCompletionStatus = checkCourseCompletion();
	
    // replace the 'status' var
    sData = sData.replace(/%%status/g, sCompletionStatus);
    // insert the new html
    //oBody.document.body.innerHTML = sData;
    oBody.html(sData);
    /*
    // get the incomplete container
 	var oDivIncomplete = $("#FRM_CONTENT").contents().find("#divIncomplete");
    // get the completed container
    var oDivCompleted = $("#FRM_CONTENT").contents().find("#divCompleted");
    // get the completion value
    var bIsCourseCompleted = isComplete(sCompletionStatus);
    
    if (oDivIncomplete) {
        // check if the course is completed in order to decide if the completed container should be displayed
        if (bIsCourseCompleted) {
            //oDivIncomplete.style.display = "none";
			oDivIncomplete.hide();
         } else {
            //oDivIncomplete.style.border = ""; // remove border
			oDivIncomplete.css('border ', '');
			oDivIncomplete.addClass("contentContainer");
        }
    }
    if (oDivCompleted) {
        // check if the course is incompleted in order to decide if the incomplete container should be displayed
        if (!bIsCourseCompleted) {
            //oDivCompleted.style.display = "none";
			oDivCompleted.hide();
			oDivIncomplete.addClass("contentContainer");
        } else {
			oDivIncomplete.css('border ', '');
            //oDivCompleted.style.border = ""; // remove border
        }
    }
    */
}



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
	
	
		// Handle all interface buttons
		//console.log("Actionable buttons",$("a[data-action]"));
		$("a[data-action]").click(function (event) {
			event.preventDefault();
			var actionNode = (event.target.nodeName.toUpperCase() == "I") ? $(event.target).parent() : $(event.target); // click on icon inside hyperlink
			var btnAction = actionNode.attr("data-action");
			switch (btnAction) {
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
							helpfile: processHTML(data)
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
			west: {
				size : __settings.layout.panesize.west,
				togglerLength_closed: 0,
				togglerLength_open: 0,
				initClosed: (__settings.layout.toc == false), // header is invisible on iphone (via media query); in that case hide the toc to begin with
				onopen_end: function () {
					resizeIframe();
				//	changeToggle("open");
				},
				onclose_end: function () {
					resizeIframe();
				//	changeToggle("close");
				},
				resizable: false,
				spacing_open: 0,
				spacing_closed: 16,
				slideTrigger_open: "click",
				slideDelay_open: 0,
				hideTogglerOnSlide: true
			},
			east: { // the east pane is a dummy that we use to set the correct margins on content
				size: __settings.layout.panesize.east,
				initClosed: true,
				spacing_open: 0,
				closable: false,
				resizable: false
			}
		});


		
		function changeToggle(state) {
			var $o = $("#layout-open-west").attr("title", "Show table of contents").show(),
				$c = $("#layout-close-west").attr("title", "Hide table of contents").show(),
				w = Math.max(33,Math.max($c.width(), $o.width())),
				l = parseInt($(".ui-layout-center").css("left"),10);
			if ( "open"== state) { $o.hide(); $c.show(); $c.css("left", l - w) }
			if ("close"== state) { $c.hide(); $o.css("left", l - w - 8).show(); $o.animate({ "left": l + 8 }, 579) }
		}
		$("#layout-open-west, #layout-close-west").hide();
		
		// pageLayout.addOpenBtn( "#layout-open-west", "west" );
		// pageLayout.addCloseBtn( "#layout-close-west", "west" );

		$(document).bind("check.width", function () {
			// console.log("$(window).height()",$(window).height());
			$("#layout-open-west, #layout-close-west").css("top", $(window).height() - __settings.layout.panesize.south - 32);

			if (__settings.layout.autohide && $("body").width() <= __settings.layout.minwidth) {
				_hasAutoClosed = true;
				pageLayout.close("west");
			} else if (_hasAutoClosed && __settings.layout.autohide && $("body").width() > __settings.layout.minwidth) {
				pageLayout.open("west");
			}
		});
		
		//if (__settings.layout.toc == false) { // start closed
		//	changeToggle("close");
		//	// pageLayout.close("west");
		//}

		
		$(window).smartresize(function(){
			$(document).trigger("check.width");
		});
		
		// change the scale of the page so that re-orienting the mobile device causes a scaling change, toggles menus, etc
		// TODO: may need to extend this for other tablets?
		if (__settings.layout.maxzoom != null && _sniff_isTablet) $('meta[name="viewport"]').attr("content","width=device-width, minimum-scale=1.0, maximum-scale=" + __settings.layout.maxzoom + ", initial-scale=1.0");

		if (__settings.layout.autohide && _sniff_isTablet) {

			// auto close the nav index in vertical orientation if Settings.xml allows it
			$(window).bind('orientationchange', function(event) {
				if(window.orientation % 180 == 0) {
					pageLayout.close("west");
				} else {
					pageLayout.open("west");
				}
			});

			// close left pane initially if orientation isn't set
			if (window.orientation % 180 == 0) {
				setTimeout(function () {
					pageLayout.close("west");
				}, 888); // delay allows page to draw
			}
		}
		
		$(document).trigger("check.width");

		//if (__settings.layout.autohide && $("body").width() <= __settings.layout.minwidth) {
		//		pageLayout.close("west");
		//}
	
		// tell layout manager about pane changes
		if ((__settings.layout.imageheader.visible !== true) && (__settings.layout.titleheader.visible !== true)) {
			//$("#header_all").hide();
			pageLayout.hide("north");
			//console.log("hid all headers");
		}// else if (__settings.layout.imageheader.visible !== true) {
		//	$("#header_wrapper").hide(); // first line of header
		//	console.log("hid first line");
		//}
			
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
		$("body").append(Handlebars.getCompiledTemplate("player",__settings));
		loadCourse();
		main();
	});
	
	// load PIE.js on demand, if required (note shared run.js file)
	Modernizr.load({
    	test: Modernizr.borderradius,
        nope: __global_root + '/Layout/js/PIE.js',
	    complete: applyPIE
    });
	
});

function reBindThingsThatMightBeDynamicallyLoaded() {
	
	function toggleFeedback(el, ar) {
		var $div = $(".feedback", el).hide();
		if (ar.length === 0) return;
		$div.removeClass("hide").find("span").text(ar.join(", "));
		$div.fadeIn(1500);
	}
	
	$(".backstretch").each(function (index,el) {
		var $img = $(el),
			$parent = $img.closest("div"),
			path = $img.attr("src");
		$img.remove();
		$parent.backstretch(path);
	});
	
	$("[data-toc]").click(function (e) {
		e.preventDefault();
		LoadContent($(this).attr("data-toc"));
	});
	
	// load back any data already stored by a quick quiz, assumes one per page
	$("div.inline-checklist,div.inline-checkimage").each(function (index, el) {
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

	$("div.inline-checktf").each(function (index, el) {
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
	// replace body vars (e.g. using template renderer in player.js)
	$("[data='rp-replace-vars']").each(function () {
		if (checkCourseCompletion() == "completed") {
			$("#rp-competent").show();
			$("#rp-notyetcompetent").hide();
		} else {
			$("#rp-competent").hide();
			$("#rp-notyetcompetent").show();
		}
		replaceVars($(this));
	});


	//TODO: clean up
	$("div.inline-survey div.range div.label").equaliseWidths();
	$("div.inline-survey div.range").buttonset(); // jquery-ui
	$("div.inline-survey").each(function(index,el) {
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
	var imgLoad = $(".fit-images")
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
    $(".rp-fadein").hide().each(function(index, el){
    	setTimeout(function () {
    		$(el).fadeIn(1234)
		}, 500 * (index+1));
	});

    $(".rp-fadeinfast").hide().each(function(index, el){
    	setTimeout(function () {
    		$(el).fadeIn(250)
		}, 200 * (index+1));
	});

	// sequenced fadein for list items
    $(".rp-fancylist li").css("opacity",0).each(function(index, el){
    	setTimeout(function () {
    		$(el).animate({
    			"opacity" : 1
    		},250)
		}, 750 * (index+1));
	});

	// sequenced slide in
    $(".rp-slidein").hide().each(function(index, el){
    	setTimeout(function () {
    		$(el).slideDown(258)
		}, 250 * (index+1));
	});

	// sequenced bounce in
    $(".rp-bouncein").hide().each(function(index, el){
    	setTimeout(function () {
    		$(el).effect("bounce", 123,
    		function () {
				if (window.PIE) {$(el).css("background-color","#fff"); PIE.attach(el) }; 
			});
		}, 250 * (index+1));
	});
	
	// sequenced blind show
	$(".rp-blindin").hide().each(function(index, el){
    	setTimeout(function () {
    		$(el).effect("blind", {mode: "show"}, 567)
		}, 250 * (index+1));
	});
	
	// bounce-in effect for fastfacts
	/* $(".fastfact").each(function (index, el) {
		var $el = $(el);
		var d = $el.actualSize(); $el.css({"width":d[0],"height":d[1]}); // set size before we start
    	setTimeout(function () {
    		$el.effect("bounce", 345,
    		function () {
				if (window.PIE) {$(el).css("background-color","#fff"); PIE.attach(el) }; 
			});
		}, 250 * (index+1));
	}); */
	
	//_sniff_isTablet
	
	function showQtip(event) {
		var $el = (event.target.nodeName == "I") ? $(event.target).parent() : $(event.target),
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
					at: 'center right',
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
			// console.log("showQtip",event,$el,_qtip);

		if (event.target.nodeName == "BUTTON") {
			_qtip.content['title'] = function () {
				return $el.text();
			}
		}
		$("<div />").qtip(_qtip).qtip('api');
	}
	
	// buttons that pop up a qTip
	$(".tiptext, .tipbutton").click(function (event) {
		// console.log("qtip",event);
		showQtip(event);
		event.preventDefault();
	})
	/*
	$(".tiptext").qtip({

	});
	
	$(".tipbutton").qtip({
		show: {
			event: 'click',
			modal: {
				on: true,
				blur: true
			}
		},
		hide: 'unfocus',
		style: 'qtip-bootstrap',
		position: {
			at: 'center right',
			my: 'center left',
			viewport: $('#contentContainer'),
			adjust: { method: 'flipinvert shift' }
		},
		content: {
			text : function() {
				return unescape($(this).attr("data-tip"));
			},
			title : function () {
				return $(this).text();
			}
		}
	});
	*/
	
	/* $(".tiptext").qtip({
		show: 'click',
		hide: 'unfocus',
		style: 'qtip-bootstrap',
		position: {
			at: 'top center',
			my: 'bottom center'
		},
		content: {
			text : function() {
				return unescape($(this).attr("data-tip"));
			}
		}
	}); */

	$(".glossary-term").qtip({
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
	
	
	// scales an image to fill the viewport, click to close again
	$(".rp-zoomable").click(function() {
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
	$("a[rev=overlay], .jDialogButton, .rp-button-dialogue, a[video-iframe]").click(function (event) {
		event.preventDefault();
		var t = $(this),
			href = t.attr("href");
		t.blur();
		if ($("#contentContainer").length) {
			if (href.toLowerCase().indexOf("en-us/content/parse") != -1) { // local content; ajax load so styles apply
				$.get(href, function (data) {
					triggerFrumbox(null, processHTML(data), {
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
    
    if ($("sup").length) {
		var refs = appendSettings("references"); // load once
	    $("sup").each(function (index, el) {
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
	
	/*
    $("dfn").each(function (index, el) {
    	var btn = $("#buttonGlossary"),
    		$el = $(el)
    	$el.click(function () {
	    	triggerOverlay(btn.attr("href"), {
	    		t: btn.offset().top,
	    		l: btn.offset().left,
	    		w: btn.width,
	    		h: btn.height
	    	},null ,function () {
	    		var term = $("#frumbox-iframe").contents().find("#" + $el.attr("data"));
   				$('#frumbox-iframe').contents().find("html, body").animate({ scrollTop: term.offset().top }, { duration: 'medium', easing: 'easeOutCubic' });
	    		//if (term.length) term.scrollIntoView({
	    		//	complete: function () {
	    		//		// scroll into view doesn't account for the iframes top in the parent; kick it along :)
	    		//		$('#frumbox-iframe').contents().find("html, body").animate({ scrollTop: term.offset().top }, { easing: 'swing' });
	    		//	}
	    		//});
	    	});
    	});
    }); */

	if (jQuery.isFunction(jQuery.fn.tipTip)) {
		$(".tooltip").tipTip({
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
		$("#tabs, .jqueryui-tabs").tabs();
	}
	
	// make jquery-ui accordions
	if (jQuery.isFunction(jQuery.fn.accordion)) {
		$("#accordion, .jqueryui-accordion").accordion({
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
		$(".rp-survey-radiogroup").buttonset();
	}
	
	// popups, highlighting on image maps
	$("img[usemap]").each(function(index,el) {
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
		/*
					my: "bottom left",
					at: "center right",
					adjust: { method: "shift"}
			show: "click",
			hide: "click"
		})
		*/
	});

	// prepare flip-cards, also left-to-right slidein for quickflips
	if (jQuery.isFunction(jQuery.fn.quickFlip)) {
		// calculate max size of hidden elments
		var maxAH = 0, maxAW = 0, maxDH = 0, maxDW = 0;
		$("div[class^='flip-side']",
			$(".rp-flip").each(function(index,el) {
				var d = $(el).actualSize();
				if (d[0] > maxDW) maxDW = d[0];
				if (d[1] > maxDH) maxDH = d[1];
			})
		).each(function(index,el) {
			var d = $(el).find("a").actualSize();
			if (d[0] > maxAW) maxAW = d[0];
			if (d[1] > maxAH) maxAH = d[1];
		});
	    var _qf = $(".rp-flip").hide().each(function(index, el) {
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
		$(".rp-slideshow").each(function(index,el) {
			var _effect = $(el).attr("data-effect");
			$(el).cycle({
				fx: _effect
			});
		})
	}
	
	// apply PIE for content
	applyPIE();
		
}

// stub	which runs after course is loaded properly
function bindJQueryAfterLoad() {
	
//	console.log("bindJQueryAfterLoad");

	// put classes for borders on buttons
	$("#ButtonWrapper a:visible:last").addClass("last");
	$("#ButtonWrapper a:visible:first").addClass("first");

	//TODO: update jquery then bind this using ON
	$(".toc-tree").click(function (event) { // tree
		event.preventDefault();
		clickTocControl(this.getAttribute("id"));
	});
	
	$(".toc-node").click(function (event) { // hyperlink
		event.preventDefault();
		clickTocHyperlink(this.getAttribute("id"));
	});

	return;
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
		var obj = $("#FRM_CONTENT");
		if (obj.length) {
			obj.css({
				height: obj.parent().height(),
				width: obj.parent().width()
			});
			if (frames["FRM_CONTENT"].$) { 
				frames["FRM_CONTENT"].$("[data='rp-quiz-layout']").layout("resizeAll");
			}
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

function EmbedAndPlay_Youtube(videoid, container) {
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
}
