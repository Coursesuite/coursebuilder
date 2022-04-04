var __global_root = window.location.href.split("?")[0].split("#")[0];

__global_root = __global_root.substring(0, __global_root.lastIndexOf('/en-us'));

/* =========================================================================================================
 *
 * 	The SCORM engine, layout and file loader portions of the player
 *	Heavily modified from original (>80% changed); http://www.e-learningconsulting.com/products/authoring/authoring.html
 *	Most of this file is copyright: avide e-learning, coursesuite pty ptd
 *	Programmer: tim.stclair@gmail.com, http://about.me/timstclair
 *
 * ========================================================================================================= */

var _sVersion = "2.2";               // this is the version number of this template - will be recorded in suspend data
var _sPathMark = "PATHMARK"; 		 // page completion status key
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
var _aState = {};			 		 // holds the state data
var _wProgress;                      // 'progress' popup
var _sNavigateFailMsg;               // holds the warning message when a specific page cannot be navigated
var _bTocAutoClose = true;           // true if Table of Contents sections should auto-close
var _global_increment = 0;			 // for generating id's

function get_raw_lines(str) {
	var obj = $("<div>").html("<pre>" + str + "</pre>"),
		data = ($.browser.msie && $.browser.version < 9) ? obj.get(0).innerText : obj.text();
	return data.split(/(\r\n|\n\r|\r|\n)+/);

	return $("<div>").html("<pre>" + str + "</pre>").text().split(/(\r\n|\n\r|\r|\n)+/);
}

// instance : store details about a node
function NodeStatus(sId, sTocPath, sTitle, sHtmlFileName, bExpanded, bHasChildren, nParentId, sStatus, nScore, sContribute, sType, sTemplate, bOptimised) {
	this.sId = sId; // node
	this.sTocPath = sTocPath; // node path as a underscore-seperated heirarchy
	this.sTitle = sTitle; // title of the page
	this.sHtmlFileName = sHtmlFileName; // filename of the page
	this.bExpanded = bExpanded; // internal node for tree, is the node expanded?
	this.bHasChildren = bHasChildren; // internal node for the tree, does the node have child nodes?
	this.nParentId = nParentId; // backreference to this nodes parent (or null)
	this.sStatus = sStatus; // n:none, p:passed, i:incomplete, c:completed
	this.nScore = nScore; // score for this page is out of if it has a quiz
	this.bScored = false; // (boolean) becomes true when score has been set using code
	this.sContribute = sContribute; // percentge of overall score this page contributes
	this.sType = sType; // node type (i.e. page, quiz, etc)
	this.sTemplate = sTemplate; // base grid to use for this page
	this.bOptimised = bOptimised; // whether the page has been pre-optimised
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

    // cmi.core.exit is write only, so we need to believe the score instead.
    if (getScore() > 0 && getCompletionStatus() == "completed") {

            // we know now that the course is complete, so that means the learner will not need to return
            learnerWillReturn(false);

    } else {

		// see if this is the first launch of the SCO by this learner
		if (isFirstLaunch()) {
			// it is, set the status to incomplete so the LMS knows the learner is not done with this SCO yet
			if (getCompletionStatus() == "not attempted") setCompletionStatus("incomplete");

		}

		// we will need to get the bookmark in the next session so tell the LMS that the learner may return in the future
		learnerWillReturn(true);

	}

	// get the state information for the entire SCO - need to do this because we reload pages to switch languages
	loadState();

	// get the bookmark (the bookmark was set in a previous session)
	_nBookmark = getBookmark();

	// get the node status, it is stored in X,Y:X,Y:... X is the visited status, Y is the time
	_sStatusRestore = getState(_sPathMark);
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
			if (restoredStatus.nScore > 0) {
				restoredStatus.bScored = true;
			}

			// assign the visited and time status elements to global arrays
			_aRestoredStatus[i + 1] = restoredStatus;

		}
	}
}

// terminate the SCO session
// TODO: consider using https://github.com/kangax/iseventsupported
var __global__termsco__hasrun = false; // ugly hack in case SCO is terminated multiple times
function termSCO() {
	if (__global__termsco__hasrun) return;
	if (frames["FRM_CONTENT"] && frames["FRM_CONTENT"].termQuiz) frames["FRM_CONTENT"].termQuiz();
    compileSuspendData( true );
    checkCourseCompletion();
	setSessionTime(_timeSessionStart);
	termCommunications();
	__global__termsco__hasrun = true;
}

// check to see if the course is complete
function checkCourseCompletion(bForce) {
    // Get current course completion status
    var sCompletion = getCompletionStatus();

    bForce = !!bForce; // undefined/false === false; true === true

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
                    if (_aNodeStatus[i].sStatus != "c") if (!bForce) return sCompletion;
                    break;
            }
        }

        sCompletion = "completed";

        // all pages required to be visited, completed or passed are done, so set the course as complete and say the user does not plan to return
        if (bForce) {
        	forceCompletionStatus(sCompletion)
        } else {
        	setCompletionStatus(sCompletion);
        }

        // get the overall score
        var nOverallScore = Math.min(100,getOverallScore()); // in case of rounding errors / exceeding max score for scorm

        // see if exists an overall score
        if (nOverallScore != null || bForce == true) {
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

        // persist any changes
        scormCommit();
    }

    return sCompletion;
}

// ask SCORM if the course is complete
function isComplete(sCompletionStatus) {
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
    var sTitle, sContribute, sId, sType, sTemplate, bOptimised;
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

		bOptimised = (currentElem.getAttribute("optimised") == "true");

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
        _aNodeStatus[_nNodes] = new NodeStatus(sId, sTocPath, sTitle, sHtmlFileName, true, false, nParentId, sStatus, nScore, sContribute, sType, sTemplate, bOptimised);
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

     	// get the css classname for the content container
        _aNodeStatus[_nNodes].sClassName = currentElem.getAttribute("className") || "";

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
function tocJSON(oXML, nLevel, sTocPath) {
    var sTitle, sContribute, sId, sType, sTemplate, bOptimised;
	var sEffect, sPath, sVisible; // tim's extensions
	var nodes = [];
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
		node["optimised"] = (currentElem.getAttribute("optimised") == "true");
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
function LoadContentByFileName(fn) {
	var nId = getIdByFileName(fn);
	if (nId) LoadContent(nId);
}
function LoadContent(nID, avoidHistory) {

	var _direction = (_nPageCurrent < nID) ? -1 : 1;

	$(".ui-layout-west").removeClass("menu-open");

    // check if the requested page can be naviagated
    if (canNavigatePage(nID) == false) {
        // display an aler message
        alert(_sNavigateFailMsg);
        // skip page loading
        return;
    }

    // calculate current test status
    if (frames["FRM_CONTENT"]) {
    	if (frames["FRM_CONTENT"].termQuiz) frames["FRM_CONTENT"].termQuiz();
    	$("#contentContainer").css("overflow","auto"); // reset overflow
	    $("#FRM_CONTENT").remove();
	    $(window).unbind("resize.iframe");
    }

	// reset the global increment
	_global_increment = 0;

    // tell the TOC to unselect the currect selection
    tocUnselect();

	// get the file name for the current id
	var fileName = getPageOptimisedFileName(nID),
		cssFileName  = fileName.toLowerCase().replace(/(\W|\_)/g,'-'); // .getPageHtmlFileName(nID);

	// reference to the name of this page
	var pageTitle = getPageTitle(nID);

	//get the type of file that we are going to work with
	var fileType = getPageType(nID);

	//get the grid template for this item
	var sGrid = getPageTemplate(nID);

  	//get the custom className for this contentContainer, if any
	var sClassName = getPageClassName(nID);

	var $content = $("#contentContainer").scrollTop(0); // .empty()

	// spinner: it's always there, just hidden
	$("#loading-animation").fadeIn(100, function () {

      	$content.attr("class", "ui-layout-center " + sClassName + " " + cssFileName);

		// ensure spinner doesn't stay visible too long
		setTimeout(function () {
			if ($("#loading-animation").is(":visible")) {
				$("#loading-animation").hide();
			}
		}, 4567);

		if (fileType == "quiz" || fileType == "test" || (fileType.indexOf("question") != -1)) { // until we can do better; avoids scope problems
			$content.css({
				"overflow":"hidden",
				"padding-right": "0"
			});
			_cWidth = $content.width(); _cHeight = $content.height();
	        if (avoidHistory !== true) history.pushState( {id: nID}, pageTitle, location.href); // href never changes
			// var $iframe =
			$content.html($("<iframe ></iframe>").attr({
					title: "Quiz content",
					width: "100%",
					scrolling: "no",
					height: "100%",
					frameborder: "0",
					src: __global_root + "/en-us/Quiz.html?filename=" + fileName + "&w=" + _cWidth + "&h=" + _cHeight, // needed for ipad iframe issue
					id: "FRM_CONTENT",
					name: "FRM_CONTENT",
					allowTransparency: "true"
				})
				.css({
					width: _cWidth,
					height: _cHeight,
					visibility: "hidden"
				})
				);
			$(window).bind("resize.iframe", function () {
				resizeIframe();
			});

		} else {

			if (!getPageOptimiseStatus(nID)) {
				fileName += "?" + Math.random();
			}

			// load the file's body to a dummy object (filename space search notation)
			$.get(__global_root + "/en-us/Content/" + fileName, function (response, status, xhr) {

				if (status != "error") {


					// actually, push state to history now that we know we have navigated to a loadable place
					// so next/prev and hyperlink clicks all come through this one spot
			        if (avoidHistory !== true) history.pushState( {id: nID}, pageTitle, location.href); // href never changes

			        // update window title
			        document.title = __settings.course.name + ": " + pageTitle;

					// here's the guts of the string processing engine, which returns the ready-to-use HTML template (unless it's already optimised)
					if (getPageOptimiseStatus(nID)) {
						$content.html(response.replace(/\@sco\_root\@/g, __global_root));
					} else {
						var ps = processString(response, sGrid, true);
						console.dir(ps);
						$content.html(ps);
					}
					// dynamically load references that we didn't want to pre-parse , e.g. {load foo.html}
					var dodgyEvals = [];
	                $content.find("link[href]").each(function(i,o) {
		                var href = o.getAttribute("href"),
		                	type = o.getAttribute("type");
						switch (type) {
							case "text/javascript":
								var tag = document.createElement('script');
								   tag.type = 'text/javascript';
								   tag.src = href;
								   o.parentNode.replaceChild(tag, o);
							   break;
							case "text/css":
								$('<link/>', {rel: 'stylesheet', href: href}).appendTo('head');
							break;
							default:
								$.ajax({
									url: href,
									async: false,
									success: function(d) {
										var $d = $(d);
										$d.each(function(i,n) {
											if (n.nodeName == "SCRIPT") {
												dodgyEvals.push(n.text);
											}
										});
										$(o).replaceWith($d);
										// o.parentNode.removeChild(o);
									}
								});
						}
					});
					$.each(dodgyEvals, function(val) {
						//console.log("eval dodgyness", val);
						// eval(val);
						eval("(function(window,document,$,undefined){" + val + "})(window,document,jQuery)");
					});

					// NOW we can clear the loader if it's not already run
					$("#loading-animation").fadeOut(300);
					// re-bind any jquery on these objects for events that we might have just bound to (ideally use live/on, needs refactor)
					reBindThingsThatMightBeDynamicallyLoaded($("#contentContainer"));

				} else {
					$("#loading-animation").fadeOut(100);
					// if (_loader) { clearTimeout(_loader); $("body").css("cursor","default"); }
					$content.html("<p class='error'>Problem loading page - " + fileName + "</p>");
				}

			});
		} // quiz

	}); // fade in animation

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

}


//	build an image using the image manifest stored height and width, and standard properties
function imageTag(filename, classes, attributes) {
	var img;
	if (filename.indexOf("://") !== -1) {
		img = $("<img>")
				.attr({
					src: filename
				});
	} else {
		var imgObj = find_in_json (__settings.images, "name", filename)[0];
		if (!imgObj) return "<img alt='Missing image: " + filename + "'>";
		img = $("<img>")
				.attr({
					width: imgObj.width,
					height: imgObj.height,
					src: __global_root + "/en-us/Content/media/" + filename
				});
	}
	if (classes) img.addClass(classes);
	if (attributes) img.attr(attributes); // a map
	return img.wrap('<div>').parent().html();
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
                // check if the status is diffrent than 'complete'
                // or page score is less than wanted navigation score
                if (sStatus != 'c' || getPageScore(i) < getPageNavigationScore(i)) {
                    // it is, the user cannot go on
                    bCanNavigate = false;
                    // build the navigation fail message
                    _sNavigateFailMsg = _sNavFailPass.replace(/%%page/g, getPageTitle(i));
                }
                break;
            case 's':
            	// check if the page has a score > 0 or release it after a course is complete
            	console.log("checking status s", getPageScore(i), getPageScored(i), getCompletionStatus());
                if (getPageScore(i) < 1 && getCompletionStatus() !== "completed" && getPageScored(i) !== true) {
                    bCanNavigate = false;
                    // build the navigation fail message
                    _sNavFailScore = _sNavFailScore || "You must achieve a score on the '%%page' page before you can navigate here";
                    _sNavigateFailMsg = _sNavFailScore.replace(/%%page/g, getPageTitle(i));
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
function updatePageStatus(nPageId, sTestStatus, nTestScore, bScored) {
    // get the 'contribute' value
    var sContribute = getPageContribute(nPageId);
// console.log("updatePageStatus", nPageId, sTestStatus, nTestScore, bScored, sContribute);
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
    setPageScore(nPageId, nTestScore, bScored);
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
//	sState - "", "Passed", "Incomplete", "Complete", "Visited" or "Selected"
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

    // ensure the suspend data is set (but don't commit it yet);
    compileSuspendData(false);

	// SET THE BOOKMARK IN SCORM
	setBookmark(nBookmark);
}

// get the state
function getState(sId) {
	// console.log("GET: current state", _aState, sId);
	// see if there is an ID in the state array
	var ret = "";
	if (_aState[""+sId]) {
		// there is, return it
		ret = _aState[""+sId];
	} else if (_aState["rpqiz_" + sId + "_0"]) {
		// the state of the zeroth page interaction
		ret = _aState["rpqiz_" + sId + "_0"];
	} else {
		// there is no ID, return an empty string
		ret = "";
	}
	// console.log("getState", sId, ret);
	return ret;
}

// set the state
function setState(sId,sValue) {
	// set the state in our state array
	_aState[""+sId] = sValue;
	// console.log("setState", sId, _aState);
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

function compileSuspendData(commit) {

    // tell scorm about the node status
    setState(_sPathMark, getPageStatusString());

    // record the version in suspend data
    setState("VERSION", _sVersion);

    // buffer for the state array
    var aSuspend = [];

    // loop through the array
    for (var i in _aState) {
        aSuspend.push(i + _sSep + _aState[i] + _sSep);
    }

    var sSuspend = aSuspend.join("");

    // see if there is any data to set
    if (sSuspend != "") {

        // there is, store this with SCORM
        setSuspendData(sSuspend);

        if (commit) scormCommit();
    }
}


// Set the state in suspend data  - we do this by flattening the data stored in the state array
function saveState() {
    // save the state of the current opened question
    if (frames["FRM_CONTENT"] && frames["FRM_CONTENT"].termQuiz) frames["FRM_CONTENT"].termQuiz();

    compileSuspendData( true );

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
      	var uri = getPageHtmlFileName(idx);
      	if (uri.length) jQuery.ajax({
      		url: path + uri,
			success: function(result) {
				var cache = $("<div>").html(result).text().split("\n"),
					found = -1;
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

						found += 1; // nth command on this page will be nth answer stored
						if (value.split("_")[2] != found) continue; // we are not the droids .. er.. answers you are looking for

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

    var jobj = {
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
	return jobj;
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
function getPageScored(nIndex) { return (_aNodeStatus[nIndex].bScored == true); }
function setPageScore(nIndex, nScore, bScored) { _aNodeStatus[nIndex].nScore = nScore - 0; _aNodeStatus[nIndex].bScored = (bScored == true); }

function getPageTitle(nIndex) { return _aNodeStatus[nIndex].sTitle; }
function getPageNavigation(nIndex) { return _aNodeStatus[nIndex].sNavigation; }
function getPageContributePercentage(nIndex) { return _aNodeStatus[nIndex].nContributePercentage; }

function getPageOptimiseStatus(nIndex) { return _aNodeStatus[nIndex].bOptimised; }
function getPageOptimisedFileName(nIndex) {
	if (_aNodeStatus[nIndex].bOptimised) {
		// todo: fix this botch
		return _aNodeStatus[nIndex].sHtmlFileName.replace(".txt","").replace(".html","") + ".htm";
	} else {
		return _aNodeStatus[nIndex].sHtmlFileName;
	}
}
function getPageHtmlFileName(nIndex) { if (_aNodeStatus[nIndex]) return _aNodeStatus[nIndex].sHtmlFileName; return ""; }

function getPageTocPath(nIndex) { return _aNodeStatus[nIndex].sTocPath; }
function getPageParentId(nIndex) { return _aNodeStatus[nIndex].nParentId; }
function getPageType(_nId) { return _aNodeStatus[_nId].sType.toLowerCase(); }
function getPageNavigationScore(nIndex) { return _aNodeStatus[nIndex].nNavigationScore; }
function getPageTemplate(nIndex) { return _aNodeStatus[nIndex].sTemplate; }
function getPageClassName(nIndex) { if (_aNodeStatus[nIndex].sClassName) return _aNodeStatus[nIndex].sClassName; return ""; }

function getCurrentPageContribute() { return _aNodeStatus[_nPageCurrent].sContribute; }
function getCurrentPageId() { return _aNodeStatus[_nPageCurrent].sId; }
function getCurrentPageTitle() { return _aNodeStatus[_nPageCurrent].sTitle;  }
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

// loads JSON from a file and appends it as its own node to the global __settings object
function appendSettings(node) {
	if (!Object.prototype.hasOwnProperty.call(__settings, node)) {
		var json = (function() {
			var json = null;
			$.ajax({
				'async':false,
				'global':false,
				'dataType':'json',
				'success': function (data) {
					json = data || {};
				},
				'error' : function () {
					json = {}
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

/*	build an image using the image manifest stored height and width, and standard properties
function imageTag(filename, classes, attributes) {
	var imgObj = find_in_json (__settings.images, "name", filename)[0];
	if (!imgObj) return "<img alt='Missing image: " + filename + "'>";
	var img = $("<img>")
				.attr({
					width: imgObj.width,
					height: imgObj.height,
					src: __global_root + "/en-us/Content/media/" + filename
				});
	if (classes) img.addClass(classes);
	if (attributes) img.attr(attributes); // a map
	return img.wrap('<div>').parent().html();
}
*/
