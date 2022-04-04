// Version 1.0 Course Template created by Leo Lucas, leo@e-learningconsulting.com

var _sVersion = "1.0";               // this is the version number of this template - will be recorded in suspend data
var _oPages;                         // keeps the pages within the current language.
var _oCourse = new Object();         // keeps the course information
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
var _bTocAutoClose = false;          // true if Table of Contents sections should auto-close

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
function NodeStatus(sId, sTocPath, sTitle, sHtmlFileName, bExpanded, bHasChildren, nParentId, sStatus, nScore, sContribute, sType) {
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
}

// get course information within 'Course.xml'
function Course()
{
    // load 'course.xml' file
    var oXMLCourse = getXmlDocument("../../Course.xml");
    // get all the languages nodes
    var aLanguages = oXMLCourse.getElementsByTagName("language");
    
    // search for the selected language
    for (var i = 0; i < aLanguages.length; i++) {
        if (aLanguages[i].getAttribute("code") == _sLanguage) {
        
            // found it, get name and description and other attributes
            var nameElem = aLanguages[i].getElementsByTagName("name")[0];
            var descriptionElem = aLanguages[i].getElementsByTagName("description")[0];
            this.Name = (nameElem.childNodes.length > 0) ? nameElem.firstChild.nodeValue : "";
            this.Description = (descriptionElem.childNodes.length > 0) ? descriptionElem.firstChild.nodeValue : "";
            this.Glossary = aLanguages[i].getAttribute("glossary");
            this.Help = aLanguages[i].getAttribute("help");
            this.Resources = aLanguages[i].getAttribute("resources");
            this.Menu = aLanguages[i].getAttribute("menu");
            this.nPassingScore = (aLanguages[i].getAttribute("passingScore") != undefined) ? aLanguages[i].getAttribute("passingScore") - 0 : 0;
            break; // no need to continue searching
        }
    }
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
		
		// we will need to get the bookmark in the next session so tell the LMS that the learner may return in the future
		learnerWillReturn(true);
	}
	
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
function termSCO() {
	// make sure the suspend data is saved - this also gets the state of a quiz/test if that page is showing
    saveState();

    // check for course completion
    checkCourseCompletion();
	
	// set the session time
	setSessionTime(_timeSessionStart);
	
	// tell SCORM we are done with this SCO session
	termCommunications();
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
            if (nOverallScore >= _oCourse.nPassingScore) {
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
    return (sCompletionStatus == "completed" || sCompletionStatus == "passed") ? true : false;
}

// init the 'Launch.html' page
function initCourse()
{
    try {
	    netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    } catch (e) {}
    
    // get the state data for the SCO
	initSCO();
	
	// get course info
	_oCourse = new Course();
	
    // load the 'Pages.xml' file
    var oXMLPages = getXmlDocument("Pages.xml");

    // get the pages within the SCO node.
    _oPages = oXMLPages.getElementsByTagName("sco")[0].childNodes;

    // load the language strings
    loadLanguage();
}

// called by the onload function of the main course page
function loadCourse()
{
    // see if a bookmark is set
	if(_nBookmark == "") {
		// it has not been set, set it to show the first page of the first section
		_nBookmark = 1;
	}
	
    // set the current page to the bookmark
    _nPageCurrent = _nBookmark - 0;
    
    // display the table of contents
    showTOC();

    // load the bookmarked page
    LoadContent(_nPageCurrent);
    
    // set tool tips
    SetTooltips();

    // hide unused elements depending on the course settings
    if (_oCourse.Glossary != "true") {
        document.getElementById("buttonGlossary").style.display = "none";
    }
    if (_oCourse.Help != "true") {
        document.getElementById("buttonHelp").style.display = "none";
    }
    if (_oCourse.Resources != "true") {
        document.getElementById("buttonResources").style.display = "none";
    }
    
    // check if the toc menu should be closed/opened
    if (_oCourse.Menu != "true") {
        // hide TOC
        tocHideShowClick();
    }

    // make the content fit the page dimensions
    resizeCourse();
}

// inject the table of contents to the '[selecteLanguage]/Launch.html' 'TOC' div.
function showTOC() {
    // insert toc DHTML
    document.getElementById("TOC").innerHTML = showTocLevel(_oPages, 1, "");
}

// called when the course window is resized
function resizeCourse() {
	// get the height of the window
    var nHeight = document.documentElement.clientHeight;
	// get the width of the window
    var nWidth = document.documentElement.clientWidth;
	
    // calculate the height for the content, toc controls and main menu
	// '46' is top header height, '1' is the header bottom border height, '34' is footer height
	var nElementHeight = nHeight - (46 + 1 + 50);
	if (nElementHeight < 220) nElementHeight = 220;
	
	// get the control for the content
	var oContent = document.getElementById('FRM_CONTENT');
	
	// get the margins of the content frame
	if (oContent.currentStyle)
	{
	    // IE
	    var nContentMarginTop = parseInt(oContent.currentStyle.marginTop);
	    var nContentMarginBottom = parseInt(oContent.currentStyle.marginBottom);
	    var nContentMarginLeft = parseInt(oContent.currentStyle.marginLeft);
	    var nContentMarginRight = parseInt(oContent.currentStyle.marginRight);
	} else {
	    // FF
	    // get the style
	    var oStyle = document.defaultView.getComputedStyle(oContent, '');
	    var nContentMarginTop  = parseInt(oStyle.getPropertyValue("margin-top"));
	    var nContentMarginBottom = parseInt(oStyle.getPropertyValue("margin-bottom"));
	    var nContentMarginLeft = parseInt(oStyle.getPropertyValue("margin-left"));
	    var nContentMarginRight = parseInt(oStyle.getPropertyValue("margin-right"));
	}
	
	// set the height of the content
	oContent.style.height =  (nElementHeight - nContentMarginTop - nContentMarginBottom)+ "px";
	
	// set the height of the toc controls
	document.getElementById('tocControls').style.height = nElementHeight + "px";
	document.getElementById('tocBar').style.height = (nElementHeight - 30) + "px";
	document.getElementById('TOC').style.height = nElementHeight + "px";
	
	// get the width of the entire toc
	var nElementWidth = parseInt(document.getElementById('TOC').style.width);
	if (isNaN(nElementWidth)) nElementWidth = 250;
	
	// set the width of the toc user controls
	resizeTOCUserControls();
	
	// set the content width to the rest of the screen
	var nWidthNew = nWidth - nElementWidth - nContentMarginLeft - nContentMarginRight - 10;
	if (nWidthNew < 0) nWidthNew = 0;
	oContent.style.width = nWidthNew + "px";
}

function resizeTOCUserControls(){
	// get the width of the entire toc
	var nElementWidth = parseInt(document.getElementById('TOC').style.width);
	if (isNaN(nElementWidth)) nElementWidth = 230;
	else if (nElementWidth < 3) nElementWidth = 3;
	
	// set the width of the toc user controls
	// try to resize the width of the object. Exception is thrown if object is hidden
	try {
		if(document.getElementById("TOC"))
			document.getElementById("TOC").style.width = nElementWidth+"px";
	} catch(e) {
	}
}

// get the height of the content screen
function getContentHeight() {
	return document.documentElement.clientHeight;
}

// get the width of the content screen
function getContentWidth() {
	return document.documentElement.clientWidth;
}

// show a section of the TOC
//	oXML - the XML of this level
//	nLevel - the level in the XML, example 1
//	sTocPath - the node's path, example 1_2_3
function showTocLevel(oXML, nLevel, sTocPath) {
    var sTitle, sContribute, sId, sType;
	
	// init s to hold the DHTML, add a div to hold the children of the previous level
	var s = '<div id="toc_' + _nNodes + '_children">\n';
	var tempTocPath = sTocPath; // remember the toc path before looping
	var nParentId = _nNodes; // remember parent id
	
	// loop through the items in this level
	for (var j=0; j<oXML.length; j++) {
		//continue only if the node is an 'element', example 1
		if (oXML[j].nodeType != 1)
		    continue;
		    
		// get the current xml element
		var currentElem = oXML[j];    
		
		s += '<div class="level' + nLevel + 'Container">\n';
		
		// get current node title.
		sTitle = currentElem.getAttribute("title");
		// get the current node 'contribute' string
		sContribute = currentElem.getAttribute("contribute");
		// get the current node html file name
		sHtmlFileName = currentElem.getAttribute("fileName");
		// get the type of the page
		sType = currentElem.getAttribute("type");
		//get the page id
		sId = currentElem.getAttribute("id");
		
		// increment the number of nodes.
        _nNodes++;
        // build the toc path, example 1_1_3
        sTocPath = (tempTocPath == "") ? (j + 1).toString() : tempTocPath + "_" + (j + 1);
        
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
        _aNodeStatus[_nNodes] = new NodeStatus(sId, sTocPath, sTitle, sHtmlFileName, true, false, nParentId, sStatus, nScore, sContribute, sType);
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
		var nLength = getChildrenLength(oChildren);

		// see if this node has any children
		if (nLength > 0) {
		    // remember that this node has children
		    setPageHasChildren(_nNodes, true);
		    // add the DHTML with the open control.
		    s += '<img src="../Player/Images/toc-expanded.png" alt="' + _sTipCloseSection + '" title="' + _sTipCloseSection + '" align="left" border="0" id="tocCtl_' + _nNodes + '" onclick="clickControl(this.id)" >\n';
		} 
		else {
			// no children, add the DHTML without the open control
			s += '<div class="levelChild">&nbsp;</div>';
		}

        // get image title
        var sImgTitle = getStatusImageTitle(_nNodes);
		// insert the page status image (not visited, complete, incomplete)
		s += '<img src="../Player/Images/' + getStatusImage(_nNodes) + '" alt="' + sImgTitle + '" title="' + sImgTitle + '" align="left" border="0" id="tImg' + _nNodes + '" onclick="clickLevel(this.id)"/>\n';
		
		// getthe class style of the current page depending on it's status
		var sClass = sStatus != 'n' ? 'Visited' : '';
		// insert the anchor
		s += '<a href="#" class="level' + sClass + '" id="toc_' + _nNodes + '" onclick="clickLevel(this.id)" title="' + sTitle + '">' + sTitle + '</a></div>\n';
		
		if (nLength > 0) {
		    // get the DHTML for the children
			s += showTocLevel(oChildren, nLevel + 1, sTocPath);
		}
	}
	// add the end of the _children div
	s += '</div>\n';
	
	return s;
}

// gets the number of xml elements (exclude line breaks, whitespaces) in node.
function getChildrenLength(oXML)
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
	if (window.document.getElementById("NavNext").className == 'NavLink') {
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
	if (window.document.getElementById("NavPrev").className == 'NavLink') {
	// navigate to the new page
	    LoadContent(_nPageCurrent - 1);
	}
}

// handle keys on the course and content pages
function doKeyDown (e) {
	// get browser type
	var ver    = parseFloat (navigator.appVersion.slice(0,4));
	var verIE  = (navigator.appName == "Microsoft Internet Explorer" ? ver : 0.0);
	var verNS  = (navigator.appName == "Netscape" ? ver : 0.0);
	var verOP  = (navigator.appName == "Opera"    ? ver : 0.0);
	var verOld = (verIE < 4.0 && verNS < 5.0);
	var isMSIE = (verIE >= 4.0);

	var myKeyCode      = (!isMSIE) ? e.which : e.keyCode; 
	var mySrcElement   = (!isMSIE) ? e.target : e.srcElement;
	var isShiftPressed = e.shiftKey;
	var isCtrlPressed  = e.ctrlKey;
	var isAltPressed   = e.altKey;
	
	if (verOld) return true;
	
	// Ctrl(17) CapsLock(20) keys?
	if (myKeyCode == 17 && myKeyCode <= 20)
		return true;
	
	// handle left-arrow and right arrow-keys
	if(myKeyCode==37 || myKeyCode==8){ PreviousPage(); }
	if(myKeyCode==39){ NextPage(); }
	
	return true;
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
function LoadContent(nID) {
    // calculate current test status
    if (frames["FRM_CONTENT"].termQuiz) {
        frames["FRM_CONTENT"].termQuiz();
    }
    // check if the requested page can be naviagated
    if (canNavigatePage(nID) == false) {
        // display an aler message
        alert(_sNavigateFailMsg);
        // skip page loading
        return;
    }

    // tell the TOC to unselect the currect selection
    tocUnselect();
	// get the address of the course page
	var sParent = window.location.href;
		
	// get just tha path portion
	sParent = sParent.substring(0, sParent.lastIndexOf('/'));
	
	// create the path for this page - format is Content/module_section_subsection, example Content/01_01_01
	var path =  sParent + "/Content/";
	
	// get the file name for the current id
	var fileName = getPageHtmlFileName(nID);
	
	// show the page - we use replace to kill the history within the frame eliminateing back button problem
	try {
		frames['FRM_CONTENT'].location.replace(path + fileName);
	} catch(e) {
	}
	
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
	
	// update the progress status if the 'Progress' window already opened
	fillProgress();

    // play page audio if contains any
	playCurrentPageAudio();
	
	// resize the course window to fit the player
	resizeCourse();
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
function clickControl(nID) {
	var sImg, sTooltip;
	var bExpanded = true;
	
	// get the image control.
	var oCtl = document.getElementById(nID);
	
	// get the file name currently assigned
	sFile = oCtl.src;
	
	// get just the file name portion
	sFile = sFile.substring(sFile.lastIndexOf("/")+1);
	
	// see what type of image we have
	switch (sFile) {
	    case "toc-expanded.png":
	        // close and set to selected
	        bExpanded = false;
	        sImg = "toc-not-expanded.png";
	        sTooltip = _sTipOpenSection;
	        break;
		case "toc-not-expanded.png":
			// open and set to selected
		    sImg = "toc-expanded.png";
		    sTooltip = _sTipCloseSection;
			break;
	}
	
	// change the image in the control
	oCtl.src = "../Player/Images/" + sImg;

    // assign the title of the image (it will appear as a tooltip when hovering the image)
	oCtl.title = sTooltip; // Firefox
	oCtl.alt = sTooltip;   // IE
	
	// pull off the tocctl_ part of the ID
	nID = parseInt(nID.substring(7));
	
	// see if we need to open the children
	if (bExpanded) {
		// we do, open it
		document.getElementById("toc_" + nID + "_children").style.display = "block";
		
		// remember that we expand it
		setPageExpanded(nID, true);
	} else {
		// we need to close it
		document.getElementById("toc_" + nID + "_children").style.display = "none";
		
		// remember that we collapse it
		setPageExpanded(nID, false);
	}
}

// an item in the TOC was clicked on
//	sID - the name of the toc item, example toc_11
function clickLevel(sID) {
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
    updatePageStatusImage(nPageId);
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
			clickControl("tocCtl_" + nID);
		}
	}
	
	// get the parent id of the current page
    var nParentId = getPageParentId(nID);
	
	// loop until we have visited all of the parents
    while (nParentId != 0)
    {
	    if (!getPageExpanded(nParentId)) {
			// it is not, open it (pretend we clicked on it in the TOC)
			clickControl("tocCtl_" + nParentId);
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
	var nHeight = parseInt(oSections.style.height);
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
}

// autoclose the previous selected page
function tocAutoClose(nID) {
	if (_bTocAutoClose) {
		// we do, see if this page has children
		if (getPageHasChildren(nID)) {
			// it does, see if the node is already open
			if (getPageExpanded(nID)) {
				// it is, close it (pretend we clicked on it in the TOC)
				clickControl("tocCtl_" + nID);
			}
		}
		
    // get the parent id of the current page
    var nParentId = getPageParentId(nID);
	
	// loop until we have visited all of the parents
    while (nParentId != 0)
    {
	    if (getPageExpanded(nParentId)) {
			// it is not, open it (pretend we clicked on it in the TOC)
			clickControl("tocCtl_" + nParentId);
		}
	    // get the parent of this page
        nParentId = getPageParentId(nParentId);
    }
  }
}

// set the previous/next functionality - previous is greyed on the first page, next is greyed on the last page
function setPrevNext() {
	
	// See if this is first and last page.
	if(_nPageCurrent == 1 && _nPageCurrent == _nNodes){
		// It is, so disable both previous and next buttons
		//window.document.getElementById("NavPrevImage").src = "../Player/Images/previous-button-inactive.gif";
		//window.document.getElementById("NavPrevImage").style.cursor = "default";
		window.document.getElementById("NavPrev").className='NavLinkDisabled';
		//window.document.getElementById("NavPrevTop").className='NavLinkDisabled';
		//window.document.getElementById("NavNextImage").src = "../Player/Images/next-button-inactive.png";
		//window.document.getElementById("NavNextImage").style.cursor = "default";
		window.document.getElementById("NavNext").className='NavLinkDisabled';
		//window.document.getElementById("NavNextTop").className='NavLinkDisabled';
		
	// see if this is the first page
	} else if (_nPageCurrent == 1) {
		// it is, grey the previous
		//window.document.getElementById("NavPrevImage").src = "../Player/Images/previous-button-inactive.gif";
		//window.document.getElementById("NavPrevImage").style.cursor = "default";
		window.document.getElementById("NavPrev").className='NavLinkDisabled';
		//window.document.getElementById("NavPrevTop").className='NavLinkDisabled';
		// enable the next
		//window.document.getElementById("NavNextImage").src = "../Player/Images/next-button.png";
		//window.document.getElementById("NavNextImage").style.cursor = "pointer";
		window.document.getElementById("NavNext").className='NavLink';
		//window.document.getElementById("NavNextTop").className='NavLink';
	} else if (_nPageCurrent == _nNodes) {
		// it is the last page, grey the next button
		//window.document.getElementById("NavNextImage").src = "../Player/Images/next-button-inactive.png";
		//window.document.getElementById("NavNextImage").style.cursor = "default";
		window.document.getElementById("NavNext").className='NavLinkDisabled';
		//window.document.getElementById("NavNextTop").className='NavLinkDisabled';
		// enable the previous
		//window.document.getElementById("NavPrevImage").src = "../Player/Images/previous-button.gif";
		//window.document.getElementById("NavPrevImage").style.cursor = "pointer";
		window.document.getElementById("NavPrev").className='NavLink';
		//window.document.getElementById("NavPrevTop").className='NavLink';
	} else {
		// make sure both buttons are enabled
		//window.document.getElementById("NavPrevImage").src = "../Player/Images/previous-button.gif";
		//window.document.getElementById("NavPrevImage").style.cursor = "pointer";
		window.document.getElementById("NavPrev").className='NavLink';
		//window.document.getElementById("NavPrevTop").className='NavLink';
		//window.document.getElementById("NavNextImage").src = "../Player/Images/next-button.png";
		//window.document.getElementById("NavNextImage").style.cursor = "pointer";
		window.document.getElementById("NavNext").className='NavLink';
		//window.document.getElementById("NavNextTop").className='NavLink';
	}
}

// mark the toc node state
//	nID - the node ID, example 1
//	sState - "", "Passed", "Incomplete" or "Complete"
function markTocNode(nID, sState) {
	// create the TOC id for the previously selected page
	var sSelected = "toc_" + nID;
	
	// get the class name of the previously selected page
	var sClass = document.getElementById(sSelected).className;
	
	// extract the level from the class name, ecxample level2
	var sLevel = sClass.substring(0, 5);
	
	// show the previous page as visited
	document.getElementById(sSelected).className = sLevel + sState;
	
	// update page status image
	updatePageStatusImage(nID);
}

// updates page status image
// nID - the page id
function updatePageStatusImage(nID) {
    // compose image name
    var sSelectedImg = "tImg" + nID;
    // get the image status element
	var oCtl = document.getElementById(sSelectedImg);
	// change the status image source
	oCtl.src = "../Player/Images/" + getStatusImage(nID);
	
	// get the new image title
	var sImgTitle = getStatusImageTitle(nID);
	// asign values to image element
	oCtl.title = sImgTitle;
	oCtl.alt = sImgTitle;   
}

// resize the toc
function tocBarDown() {
	// turn on dragging mode
	_bDragging = true;
	
	// show a div to cover the whole page so we can drag over the iframe
	oCover = document.getElementById("tocBarCover");
	oCover.style.zIndex = "999";
	oCover.style.width = getContentWidth() + "px";
	oCover.style.height = getContentHeight() + "px";
	oCover.style.display = "block";
	
	// show the movement bar
	oCtl = document.getElementById("tocBarMove");
	oCtl.style.zIndex = "1000";
	oCtl.style.top = "0px";
	oCtl.style.left = findPosX(document.getElementById("tocBar")) + "px";
	oCtl.style.height = getContentHeight() + "px";
	oCtl.style.display = "block";
	
	// capture the mouse
	if (oCtl.setCapture)
        oCtl.setCapture();
}
function tocBarUp() {
	//see if we are dragging
	if (_bDragging) {
		// we are, turn off dragging
		_bDragging = false;
		
		// get toc bar move element
		var tocBarMoveElem = document.getElementById("tocBarMove");
		
		// hide the cover and movement bar
		tocBarMoveElem.style.display = "none";
		document.getElementById("tocBarCover").style.display = "none";
		
		// get the position of the bar
		var nPos = parseInt(document.getElementById("tocBarMove").style.left);
		
		// see if the position is greater than the width of the browser
		if ((nPos+8) < getContentWidth()) {
			// it is not, set the TOC and the content to the correct width
			document.getElementById("FRM_CONTENT").style.width = (getContentWidth() - nPos - 7) + "px";
			document.getElementById("TOC").style.width = nPos + "px";
			
			// set the width of the user controls box.
			resizeTOCUserControls();
        }

		// release the mouse capture
        if (tocBarMoveElem.releaseCapture) {
            tocBarMoveElem.releaseCapture();
        }
		
		// remember the toc width
		_sTocWidth = document.getElementById("TOC").style.width;
	}
}
function tocBarOnMove(event) {
	// see if we are dragging
	if (_bDragging) {
	    
		// we are, move the movement bar to the current X location
		var nWidth = event.clientX;
		if (nWidth > 0) {
			document.getElementById("tocBarMove").style.left = nWidth + 'px';
		}
	}
}

// public domain functions to get X and Y position of an HTML object
// see - http://blog.firetree.net/2005/07/04/javascript-find-position/
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

// hide/show the toc
function tocHideShowClick() {
	// get the toc hide/show image
	var oControl = document.getElementById("tocHideShow");
	
	// show hide depending on state
	if (oControl.src.indexOf("toc-hide") > -1) {
		// hide the toc
		_sTocWidth = document.getElementById("TOC").style.width;
		document.getElementById("TOC").style.width = "0px";

		// hide the scroll bar for IE
		document.getElementById("TOC").style.overflow = "hidden";
		
		// change the image to show the TOC
		oControl.src = "../Player/Images/toc-show.png";
		// change menu button text
		document.getElementById("buttonOpenCloseMenu").innerHTML = _sButtonOpenMenu;

        // get content width
		var nContentWidth = getContentWidth() - 7;
		// expand the content area
		document.getElementById("FRM_CONTENT").style.width = (nContentWidth < 0 ? 0 : nContentWidth) + "px";
	} else {
		// show the toc 
		document.getElementById("TOC").style.width = _sTocWidth;

		// show the scroll bar for IE
		document.getElementById("TOC").style.overflow = "auto";
		
		// set the width of the toc user controls
		resizeTOCUserControls();
		
		// change the image to hide
		oControl.src = "../Player/Images/toc-hide.png";
		// change menu button text
		document.getElementById("buttonOpenCloseMenu").innerHTML = _sButtonCloseMenu;
		
		// reduce the content area
		var nElementWidth = parseInt(_sTocWidth);
		if (isNaN(nElementWidth)) nElementWidth = 250;
		
		// get content width
		var nContentWidth = getContentWidth() - nElementWidth - 7;
		document.getElementById("FRM_CONTENT").style.width = (nContentWidth < 0 ? 0 : nContentWidth) + "px";
	}
}

// handle mouse over/out states for toc show/hide button
function tocHideShowOver(oCtl) {
	// set the right image based on the show/hide of the current image
	if (oCtl.src.indexOf("toc-hide") > -1) {
		oCtl.src = "../Player/Images/toc-hide-over.png";
	} else {
		oCtl.src = "../Player/Images/toc-show-over.png";
	}
}
function tocHideShowOut(oCtl) {
	// set the right image based on the show/hide of the current image
	if (oCtl.src.indexOf("toc-hide") > -1) {
		oCtl.src = "../Player/Images/toc-hide.png";
	} else {
		oCtl.src = "../Player/Images/toc-show.png";
	}
}

// ## XML functions

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

// load in Language.xml which contains the language strings
function loadLanguage() {
	// load the XML file
	var oXML = getXmlDocument("../Configuration/Language_" + _sLanguage + ".xml");
	
	// get the template node
	var oTemplate = oXML.getElementsByTagName("template");
	
	// get the array of strings from the template node
	var oStrings = oTemplate[0].getElementsByTagName("string");
	
	// get the length of the string array
	var nLen = oStrings.length;
	
	// loop through the array of strings
	for (var i = 0; i<nLen; i++) {
		// load the data
		eval(oStrings[i].getAttribute("var") + " = \"" + oStrings[i].firstChild.data + "\"");
	}
}

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
}

// Load the suspend data into our state array
function loadState() {
	// get the suspend_data
	var sSuspend = getSuspendData();
	
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
    if (frames["FRM_CONTENT"].termQuiz) frames["FRM_CONTENT"].termQuiz();
    
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
	//alert('save State ' + sSuspend);
	// see if there is any data to set
	if (sSuspend != "") {	
		// there is, store this with SCORM
		setSuspendData(sSuspend);

		// force the upload of the data to the server
		scormCommit();
	}
}

// ## POPUPS

// shows the help page
// sAnchor - null or name of the anchor within the help file
function Help(sAnchor) {
	// see if the anchor is null
	if (sAnchor == null) {
		// it is, make it an empty string
		 sAnchor = "";
	}
	 
	w=770; h=550;
	win=open('Content/help.html'+sAnchor,'whwindow','width='+w+',height='+h+',scrollbars=yes,resizable=yes,top='+((screen.availHeight/2)-(h/2))+',left='+((screen.availWidth/2)-(w/2)));
	win.focus();
}

// shows the resources page
function Resources() {
    w=770; h=550;
	win=open('Content/resources.html','whwindow','width='+w+',height='+h+',scrollbars=yes,resizable=yes,top='+((screen.availHeight/2)-(h/2))+',left='+((screen.availWidth/2)-(w/2)));
	win.focus();
}

//a glossary link should look like this:
//<a href="#" onClick="parent.Glossary('localization');return false;" onKeyPress="parent.Glossary('localization');return false;">localization</a>
function Glossary(term) {
    w=770; h=550;
    // see if we have a non-null term, if so we have a call from a content page so user a realtive path from the content
    win=open('Content/glossary.html'+((term) ? "#"+term : ""),'whwindow','width='+w+',height='+h+',scrollbars=yes,resizable=yes,top='+((screen.availHeight/2)-(h/2))+',left='+((screen.availWidth/2)-(w/2)));
    win.focus();
}

// show the course progress
function showProgress() {
	// see if the progress window is showing
	if (_wProgress && !_wProgress.closed) {
		// it is, give it focus
		_wProgress.focus();
	} else {
		// pop it up
		w=700; h=570;
		_wProgress=open('','progresswindow','width='+w+',height='+h+',scrollbars=yes,resizable=yes,top='+((screen.availHeight/2)-(h/2))+',left='+((screen.availWidth/2)-(w/2)));
	}
	
	// fill the progress window
	fillProgress();
}

// fill the progress window
function fillProgress() {
	// see if the function window is up
	if (!_wProgress || _wProgress.closed) {
		// it is not, return
		return;
	}
	
	// get the path of this page to use for the stylesheet and images
	var sPath = window.location.href;
	sPath = sPath.substring(0, sPath.lastIndexOf('/')+1);
	
	// init the HTML to put into the popup
	var s = '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">';
	s += '<html><head style="overflow:auto;">';
	s += '<title>' + _sProgressTitle + '</title>';
	s += '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">';
	s += '<link REL="stylesheet" HREF="' + sPath + '../Player/css/player.css" TYPE="text/css">';
	s += '<style>HTML {overflow: auto; padding:20px;}</style>';
	s += '</head><body>';
	
	// put in the standard popup style title and buttons
	s += '<div class="title" style="float:left;"><script>document.write(opener._sButtonProgress)</script></div>';
	
	s += '<div style="float:right;">';
	s += '<input class="assessButton" type="button" onclick="window.print();return false;" value="' + _sButtonPrintProgress + '"/>';
	s += '<input class="assessButton" type="button" onclick="window.close();return false;" value="' + _sButtonExitProgress + '"/>';
	s += '</div>';
	
    var sPagesProgress = "", nPagesToPass = 0, nPagesToVisit = 0, nPagesToComplete = 0;

    // loop through the modules
    for (i=0; i<_nNodes; i++) {
        // bypass pages with a 'no' completion
        if (getPageContribute(i + 1) == 'n') continue;
        
        var sClass = 'Required';
        var sOptional = '';
        var sStatus = _aNodeStatus[i + 1].sStatus;
		
        // get a string with the progress status of each page
        sPagesProgress += '<tr><td class="moduleName'+sClass+'"><span class="'+sClass+'">' + (i+1) + ': ' + getPageTitle((i+1)+"") + '</span><span class="modOptional2">' + sOptional + '</span></td>';
		
        // switch on the completion status
        switch (sStatus) {
            case "c":
            case "p":
	            sPagesProgress += '<td class="moduleStatus'+sClass+'"><img class="progressTickCross"  alt="' + _sTipModuleCompleted + '" src="' + sPath + '../Player/Images/toc-complete.gif">' + _sStatusComplete + '</td>';
	            break;
            case "i":
	            sPagesProgress += '<td class="moduleStatus'+sClass+'"><img class="progressTickCross" src="' + sPath + '../Player/Images/toc-incomplete.gif">' + _sStatusIncomplete + '</td>';
	            break;
            default:
	            sPagesProgress += '<td class="moduleStatus'+sClass+'"><img class="progressTickCross" src="' + sPath + '../Player/Images/toc-not-visited.gif">' + _sStatusNotAttempted + '</td>';
	            break;
	    }

        // recalculate pass/visit/complete states only if the page was not completed
	    if (sStatus != "c") {
	        // switch on the contribute status
	        switch (_aNodeStatus[i + 1].sContribute) {
	            case "p":
	                nPagesToPass++;
	                break;
	            case "v":
	                nPagesToVisit++;
	                break;
	            case "c":
	                nPagesToComplete++;
	                break;
	        }
	    }
    }
    
	// see if this course is complete
    var sCourseStatus = (isComplete(checkCourseCompletion())) ? _sProgressComplete : _sProgressIncomplete;

    // add the course completion summary
	s += '<div style="clear:both;padding-top:20px"/>';
	s += '<div class="progressCourseStatus"><span class="bold">Course Status' + ":</span> " + sCourseStatus + '</div></br>';
	s += '<div class="progressCourseStatus"><span class="bold">Remaining steps to complete this course:</span></div>';
	s += '<div class="progressCourseStatus"><span class="">Pages to visit:</span> ' + nPagesToVisit + '</div>';
	s += '<div class="progressCourseStatus"><span class="">Pages to complete:</span> ' + nPagesToComplete + '</div>';
	s += '<div class="progressCourseStatus"><span class="">Pages to pass:</span> ' + nPagesToPass + '</div>';
	
	// put the header row in the module summary table
	s += '<table class="progressTable"  width="100%" cellpadding="0" cellspacing="0" border="0"><tr>';
	s += '<th scope="col">' + "Page" + '</th>';
	s += '<th scope="col">' + _sProgressCompletionStatus + '</th>';
	s += '</tr>';
	
	s += sPagesProgress;
	
	s += "<caption>Course Completion Details</caption>";
	// wrap the table
	s += '</table>';
	
	// wrap the progress box
	s += '</div>';
	
	// wrap the HTML
	s += '</body></html>';
	
	// write out the status
	_wProgress.document.open();
	_wProgress.document.write(s);
	_wProgress.document.close();
}

// ## XXX

// set the tool tips
function SetTooltips()
{
    // set the titles of the toc control
	document.getElementById('tocBar').title = _sTocBar;
	document.getElementById('tocHideShow').title = _sTocShowHide;
	
	// set the tool tips (glossary, resources, download and discussion button may not be present)
	//document.getElementById('buttonMainMenu').title = _sTipMainMenu;
	document.getElementById('buttonProgress').title = _sTipProgress;
	//document.getElementById('buttonPrint').title = _sTipPrint;
	document.getElementById('buttonHelp').title = _sTipHelp;
	//document.getElementById('buttonExit').title = _sTipExit;
	//document.getElementById('buttonTrackCenter').title = _sTipTrack;
	document.getElementById('buttonPrevious').title = _sTipPrevious;
	document.getElementById('buttonNext').title = _sTipNext;
	var oTag = document.getElementById('buttonGlossary');
	if (oTag) oTag.title = _sTipGlossary;
	oTag = document.getElementById('buttonResources');
	if (oTag) oTag.title = _sTipResources;
	//oTag = document.getElementById('buttonDownload');
	//if (oTag) oTag.title = _sTipDownloadCourse;
	//oTag = document.getElementById('buttonDiscussion');
	//if (oTag) oTag.title = _sTipDiscussion;
}

// ## Node functions

// return the expand status of the node
function getPageExpanded(nIndex) {
	return _aNodeStatus[nIndex].bExpanded;
}

// set the node expanded state
function setPageExpanded(nIndex, bExpanded) {
	_aNodeStatus[nIndex].bExpanded = bExpanded;
}

// get the node name
function getPageTitle(nIndex) {
	return _aNodeStatus[nIndex].sTitle;
}

// return true if the node has children
function getPageHasChildren(nIndex) {
	return _aNodeStatus[nIndex].bHasChildren;
}

// set the node 'hasChildren' property.
function setPageHasChildren(nIndex, bHasChildren) {
    _aNodeStatus[nIndex].bHasChildren = bHasChildren;
}

// get the status of a node
function getPageStatus(nIndex) {
	return _aNodeStatus[nIndex].sStatus;
}

// set page visited
function setPageStatus(nIndex, sStatus) {
    // change page status icon
	_aNodeStatus[nIndex].sStatus = sStatus;
}

// set the page score
function setPageScore(nIndex, nScore) {
    // change page status icon
    _aNodeStatus[nIndex].nScore = nScore - 0;
}
// gets the id by a specified file name
function getIdByFileName(sHtmlFileName) {
    var nID = 0;
    // scan course pages for the file name
    for (var i = 1; i <= _nNodes; i++) {
        if (_aNodeStatus[i].sHtmlFileName == sHtmlFileName) {
            //found it
            nID  = i;
            // no need to continue
            break;
        }
    }
    
    // return the found id
    return nID;
}

// gets the page score
function getPageScore(nIndex) {
    // change page score
    return _aNodeStatus[nIndex].nScore;
}

// gets the page status text, example: Incomplete, Complete, Passed
function getStatusImage(nIndex) {
    // get page status
    var status = getPageStatus(nIndex);
    // get the default file name
    var statusFile = "toc-not-visited.gif";
    
    // if page status is 'incomplete'
    if (status == "i") {
        statusFile = "toc-incomplete.gif";
    }
    else if (status == "c") {
        statusFile = "toc-complete.gif";
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

// get the page contribute, example "c" - complete, "p" - passed
function getPageContribute(nIndex) {
    return _aNodeStatus[nIndex].sContribute;
}

// gets the page navigation attribute, example 
// 'n' - the page does not affect the follow-on pages,
// 'v' - the user should visit the page for continue to a follow-on page
// 'c' - the user should complete the page for continue with a next page
// 'p' - the user should pass the page to continue with a new page
function getPageNavigation(nIndex) {
    return _aNodeStatus[nIndex].sNavigation;
}

// get the contribute of the current page
function getCurrentPageContribute() {
    return _aNodeStatus[_nPageCurrent].sContribute;
}

// get the 'contributePercentage'
function getPageContributePercentage(nIndex) {
    return _aNodeStatus[nIndex].nContributePercentage;    
}

// get the file name of the node
function getPageHtmlFileName(nIndex) {
    return _aNodeStatus[nIndex].sHtmlFileName;
}
    
// get the node toc path
function getPageTocPath(nIndex) {
    return _aNodeStatus[nIndex].sTocPath;
}

// get the parent id of the current node.
function getPageParentId(nIndex) {
    return _aNodeStatus[nIndex].nParentId;
}

// get the id of the page
function getCurrentPageId() {
    return _aNodeStatus[_nPageCurrent].sId;
}

// get the type of the current page
function getCurrentPageType() {
    return _aNodeStatus[_nPageCurrent].sType;
}

// get the navigation score
function getPageNavigationScore(nIndex) {
    return _aNodeStatus[nIndex].nNavigationScore;
}

// set the score for the current page
function getCurrentPageContributeScore() {
    return _aNodeStatus[_nPageCurrent].nContributeScore;
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
    
    return (nTotalScore != null) ? Math.round(nTotalScore) : null;
}

// replaces 'oBody' vars
function replaceVars(oBody) {
    // get the html 
    var sData = oBody.document.body.innerHTML;

    // get learner name    
    var sLearnerName = getLearnerName();
    
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
    oBody.document.body.innerHTML = sData;
    
    // get the incomplete container
    var oDivIncomplete = oBody.document.getElementById("divIncomplete");
    // get the completed container
    var oDivCompleted = oBody.document.getElementById("divCompleted");
    // get the completion value
    var bIsCourseCompleted = isComplete(sCompletionStatus);
    
    if (oDivIncomplete) {
        // check if the course is completed in order to decide if the completed container should be displayed
        if (bIsCourseCompleted) {
            oDivIncomplete.style.display = "none";
         } else {
            oDivIncomplete.style.border = ""; // remove border
        }
    }
    if (oDivCompleted) {
        // check if the course is incompleted in order to decide if the incomplete container should be displayed
        if (!bIsCourseCompleted) {
            oDivCompleted.style.display = "none";
        } else {
            oDivCompleted.style.border = ""; // remove border
        }
    }
}