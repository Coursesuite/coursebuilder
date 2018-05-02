// Version 1.0 Course Template created by Leo Lucas, leo@e-learningconsulting.com

//Array Enhancements

/*
* SHUFFLE
* Randomizes the array.
*/
Array.prototype.shuffle = function()
{
  for (var i = 0; i < this.length; i++)
  {
    // Random item in this array.
    var r = parseInt(Math.random() * this.length);
    var obj = this[r];
 
    // Swap.
    this[r] = this[i];
    this[i] = obj;
  }
}

var _sLanguage;    		   // the selected language, example en-us
var _sCurrentPageId;       // contains the id of the current selected page
var _oTest = new Test();   // contains the test data
var _oQuestion = null;     // the currently selected question object
var _sSep1 = "::";  // seperate Discrete Data on CYK 
var _sSep2 = "^^";	// seperate Question Data on CYK 
var _bTimeLimitReached = false; // true if the time limit was reached
var _aAlpha = new Array('A','B','C','D','E','F','G','H','I','J');
var _nQuestionPools = 0; // holds the total number of 'question pools'
var _nQuestionsToDeliver = 0; // holds the total number of questions to deliver
var _nCurrentQuestion = 0; // holds the index of the current question
var _nCurrentQuestionPool = 0; // holds the index of the current question pool
var _nRequiredCorrect = 0; // number of questions to pass
var _timerTest = null; // used to set a timer for the test

// LOCALIZED STRINGS - the strings are defined in Language.xml in the Configuration folder

// submit warning
var XsSubmitMessage;
var XsSubmitQuestion;

/* true false strings */
var XsMsgTrue;
var XsMsgFalse;

/* string for check answers button */
var XsMsgCheck;

/* correct/incorrect feedback*/
var XsFeedbackCorrect;
var XsFeedbackIncorrect;
var XsCorrectIs;

/* var buttons */
var XsNavPrev;
var XsNavNext;
var XsNavIntro;
var XsNavResults;

/* page number display */
var XsMsgPageNum;

/* directions for a question */
var XsMsgDirectionsTF;
var XsMsgDirectionsMC;
var XsMsgDirectionsMCM;
var XsMsgDirectionsFI;
var XsMsgDirectionsFIM;

// introduction
var XsIntro;
var XsIntroMust;

// define a test object
// nCorrect - the number of questions answered correctly
// bGraded - the grade state of the test
function Test() {
    this.nCorrect = 0;
    this.nIncorrect = 0;
    this.nAnswered = 0;
    this.nTotalScore = 0;
    this.sIncorrectQuestions = "";
    this.sPassStatus = "I";
    // init the question pool array
    this.aQuestionPool = new Array();
    this.bTest = false;
    this.bQuiz = false;
    this.nPassingScore = 0;
    this.sId = "";
    this.nTimeLimit = 0;
    this.nTotalTime = 0;
    this.sIntroduction = "";
    this.sPassedMessage = "";
    this.sFailedMessage = "";
    this.sIncompleteMessage = "";
    this.sCompletedMessage = "";
    this.sContribute = "";
    this.bGraded = false;

    // check if the test run out of time
    this.timeLimitExpired = function () {
        return this.nTotalTime > this.nTimeLimit;
    }
}

// Define a question pool object
// sId - the id of the question pool
// nDeliver - the number of questions to deliver within this question pool
// aQuestions - questions associated with this question pool
// aOrder - contains the display order of the questions
function QuestionPool() {
	// init the properties
	this.nDeliver = 0;
	this.aQuestions = new Array();
	this.aOrder = new Array();
}

// Define the question object - this is called as "new Question()" in JavaScript
// the type of question
// sPrompt - the prompt to present to the learner
// sAnswer - the correct answer
// response - the learner's response to the question
// aChoice - an array of choices for true-false, multiple choice and matching
// aList - an array of items used in matching
// aFeedback - an array of feedback used in multiple-choice single correct answer
// aChoiceRand - an array of randomized choices
// sFeedbackCorrect and feedbackIncorrect - used for feedback in all other questions
// choiceRand - an array of randomized choices
// id - the ID of the question to report to SCORM
function Question() {
	// init the properties
    this.sId = "";
	this.sType = "";
	this.sPrompt = "";
	this.sAnswer = "";
	this.sResponse = "";
	this.aChoices = new Array();
	this.aList = new Array();
	this.aFeedbacks = new Array();
	this.aChoiceRand = null;
	this.sFeedbackCorrect = "";
	this.sFeedbackIncorrect = "";
	this.bRandomize = false;
	this.sReview = "";
}

// loads quiz xml data into html file
function initQuiz()
{
    // get the selected language
    _sLanguage = parent._sLanguage;
    // get the current selected page id
    _sCurrentPageId = parent._nPageCurrent;
    
    // read in the languages XML file
	loadLanguage();
	
	// load the test
	getTest();
	
	// get suspend_data
	var sData = parent.getState(_sCurrentPageId);
	// check to see if we have any suspend data
	if (sData != "") {
	    // we have, reload it
	    reloadState(sData);
	} else {
	    // set the order in which to display the questions within each question pool
	    setOrder();
	    // check to see if the current page is a 'test' or a 'quiz'
        if (_oTest.bQuiz || _oTest.bTest) {
	        // we do, set the current question pool index to -1
            _nCurrentQuestionPool = -1;
        }
	}
	
	// go to the bookmarked page
	gotoPage();
}

/*********
*
* set the order for this test, this function is called for the first launch of the test
*
**********/
function setOrder() {
    // this array defines the order to deliver the questions within a question pool
    // the size of the array will be the same as the number of questions to deliver within a question pool
    // loop through the question pools in the course
	for(var i=0; i<_nQuestionPools;i++){
	    // loop through a number equal with the number of questions
	    for(var j=0; j<_oTest.aQuestionPool[i].aQuestions.length;j++) {
	        _oTest.aQuestionPool[i].aOrder[j] = j;
	    }
	    // randomize the order array
	    _oTest.aQuestionPool[i].aOrder.shuffle();
    }
}

/*********
*
* break apart the SCORM data from the suspend_session and inits control variables
*	sData - contents of session_data
**********/
function reloadState(sData) {
   
	/* break the data apart */
    var aAll = sData.split(_sSep1);
    // get the pass status
    _oTest.sPassStatus = aAll[0];
    // get the total score
    _oTest.nTotalScore = aAll[1] - 0;
    // get the time limit
    _oTest.nTotalTime = aAll[2] - 0;
    // get the 'grade' state
    _oTest.bGraded = (aAll[3].toLowerCase() == 'true');
	// the fourth order is the curent question pool + _sSep2 + current question
	var aParts = aAll[4].split(_sSep2);
	_nCurrentQuestionPool = aParts[0] - 0;
	_nCurrentQuestion     = aParts[1] - 0;
	
	var nDeliver = 0;
	// loop through the sections in the test
	for(var i=0; i<_nQuestionPools;i++){
	    // the third item is the order of questions
	    _oTest.aQuestionPool[i].aOrder = aAll[nDeliver+5+i].split("-");
	    
		//loop through the questions in the section
		for (var j=0; j<_oTest.aQuestionPool[i].nDeliver; j++) {
			// break the pair apart
			aParts = aAll[nDeliver+6+i].split(_sSep2);
			
			// get the question from the pool
			var oQuestion = _oTest.aQuestionPool[i].aQuestions[_oTest.aQuestionPool[i].aOrder[j]];
			
			// see if this section has a selected question
			if (oQuestion != null) {
			    if (aParts[0] != "") {
			        // get user response
			        oQuestion.sResponse = aParts[1];
			        
			        // get the choice random order
			        if (aParts[2] != "") {
			            oQuestion.aChoiceRand = aParts[2].split("");
			        }
			    }
			}
			nDeliver++;
		}
	}	
}

// get question responses, example: 1,2
function formatSuspendData() {
    // save the pass status
	var sData = _oTest.sPassStatus + _sSep1;
	// save the score
	sData += _oTest.nTotalScore + _sSep1;
	// save the time limit
	sData += _oTest.nTotalTime + _sSep1;
	// save the 'grade' state
	sData += _oTest.bGraded + _sSep1;
	// save the current question pool + _sSep2 + current question
	sData += _nCurrentQuestionPool + _sSep2 + _nCurrentQuestion + _sSep1;
	
	/* loop through the sections of the test */
	for (var i=0; i<_nQuestionPools; i++) {
	    // save the order array of questions
	    sData += _oTest.aQuestionPool[i].aOrder.join("-");
	    
		/* loop through the questions in the section */
		for( var j=0; j < _oTest.aQuestionPool[i].nDeliver;j++){
			//get the question object
			var oQuestion = _oTest.aQuestionPool[i].aQuestions[_oTest.aQuestionPool[i].aOrder[j]];
			if (j==0) sData += _sSep1;
			
		    // get the selected question + _sSep2 + learner-response + _sSep2
			sData += j + _sSep2 + oQuestion.sResponse + _sSep2;

            // the string that keeps the random order of choices if needed
			var sChoiceRandOrder = "";

			// save choices order only for 'QuestionMatching' and 'QuestionChoiceMultiple' types
			switch (oQuestion.sType) {
			    case "QuestionMatching":
			        if (oQuestion.aChoiceRand != null) {
			            sChoiceRandOrder = oQuestion.aChoiceRand.join("");
			        }
			        break;
			    case "QuestionChoiceMultiple":
			        if (oQuestion.aChoiceRand != null) {
			            // check to see if it has to be randomized
			            if (oQuestion.bRandomize) {
			                sChoiceRandOrder = oQuestion.aChoiceRand.join("");
			            }
			        }
			        break;
			}
            // save the order of choices
			sData += sChoiceRandOrder + _sSep1;
		}
	}
	
    return sData;
}

// executes operation on page 'onload'
function termQuiz() {
    // eval the current question
    evalCurrentQuestion(false);
    // calculate scores
    calcTest();
    // save the state of the current question
    parent.setState(_sCurrentPageId, formatSuspendData());
}

// load in Language.xml which contains the language strings
function loadLanguage() {
	
	// load the XML file
	var oXML = parent.getXmlDocument("../Configuration/Language_" + _sLanguage + ".xml");
	
	// get the assessment node
	var oAssessment = oXML.getElementsByTagName("assessment");
	
	// get the array of strings from the assessment node
	var oStrings = oAssessment[0].getElementsByTagName("string");
	
	// get the length of the string array
	var nLen = oStrings.length;
	
	// loop through the array of strings
	for (var i = 0; i<nLen; i++) {
		// load the data
		eval(oStrings[i].getAttribute("var") + " = \"" + oStrings[i].firstChild.data + "\"");
	}
}

/***
* get the questions from the XMl document
***/
function getTest() {
    // get current html file name
    var htmlFileName = window.location.href.substring(window.location.href.lastIndexOf("/") + 1);
    // build the xml file name
    var xmlFileName = htmlFileName.substring(0, htmlFileName.lastIndexOf(".")) + ".xml";
	// get the XML document
	var oXML = parent.getXmlDocument("Content/" + xmlFileName);

	// get the id of this assessment 
	var oTest = oXML.getElementsByTagName("test")[0];
	// get test elements if exists
	var sPageType = parent.getCurrentPageType(); 
	_oTest.bTest = (sPageType == "Test");
	_oTest.bQuiz = (sPageType == "Quiz");
	_oTest.bGraded = !_oTest.bTest;// a page is in 'ungrade' mode by default only when it is a 'test'
	_oTest.sTestType = sPageType;
	_oTest.nPassingScore = parent.getCurrentPageContributeScore();
	_oTest.sContribute = parent.getCurrentPageContribute();
	_oTest.sId = (oTest.getAttribute("id") != undefined) ? oTest.getAttribute("id")  : "";
	_oTest.nTimeLimit = (oTest.getAttribute("timeLimit") != undefined) ? ((oTest.getAttribute("timeLimit") - 0) * 60000) : 0; // time in miliseconds
	_oTest.sIntroduction = (oTest.getElementsByTagName("introduction")[0] != undefined) ? oTest.getElementsByTagName("introduction")[0].firstChild.data : "";
	_oTest.sPassedMessage = (oTest.getElementsByTagName("passedMessage")[0] != undefined) ? oTest.getElementsByTagName("passedMessage")[0].firstChild.data : "";
	_oTest.sFailedMessage = (oTest.getElementsByTagName("failedMessage")[0] != undefined)? oTest.getElementsByTagName("failedMessage")[0].firstChild.data : "";
	_oTest.sIncompleteMessage = (oTest.getElementsByTagName("incompleteMessage")[0] != undefined)? oTest.getElementsByTagName("incompleteMessage")[0].firstChild.data : "";
	_oTest.sCompletedMessage = (oTest.getElementsByTagName("completedMessage")[0] != undefined)? oTest.getElementsByTagName("completedMessage")[0].firstChild.data : "";
	
	// get the array of objectives test XML 
	var oQuestionPools = oXML.getElementsByTagName("questionPool");

	//loop through all objectives defined in the test xml
	for (var i=0; i < oQuestionPools.length; i++) {
	    //continue only if the node is an 'element', example 1
		if (oQuestionPools[i].nodeType != 1) continue;
		    
		// create this question pool
		_oTest.aQuestionPool[i] = new QuestionPool();
		
		// get the array of questions for this objective
		var oQuestions = oQuestionPools[i].getElementsByTagName("question");
		// check the existence of 'deliver' attribute
		if (oQuestionPools[i].getAttribute("deliver") != undefined) {
		    // it exists, get value
		    var sDeliver = oQuestionPools[i].getAttribute("deliver");
		    var nDeliver = (sDeliver=="all") ? oQuestions.length : sDeliver - 0;
		} else {
		    // it does not exists, get the number of questions
		    var nDeliver = oQuestions.length;
		}
		 // increment the total number of questions to deliver
		_nQuestionsToDeliver += nDeliver;
		_oTest.aQuestionPool[i].nDeliver = nDeliver;
		
		// loop through the questions
		for (var j=0; j<oQuestions.length; j++) {
		    //continue only if the node is an 'element', example 1
		    if (oQuestions[j].nodeType != 1) continue;
		    
			// create the question
		    var oQuestion = new Question();
			
			// assign the prompt
			oQuestion.sPrompt = oQuestions[j].getElementsByTagName("prompt")[0].firstChild.data;
			// assign the type
			oQuestion.sType = oQuestions[j].getAttribute("type");
			oQuestion.bRandomize = (oQuestions[j].getAttribute("randomize") == "true") ? true : false;
			
			// see which type we have
			if (oQuestion.sType == "QuestionTF") {
				// QuestionTF, get the array of choices
				var oChoices = oQuestions[j].getElementsByTagName("choice");
				
				// loop through the choices
				for (var k = 0; k < oChoices.length; k++) {
				    // get the correct answer
				    oQuestion.sAnswer = (oChoices[k].getAttribute("correct") == "true") ? "t" : "f";
				    // taking in consideration that this is a TF question there is no need to continue
				    // we already know the answers
				    break;
				}
				
				// get the feedback
				oQuestion.sFeedbackCorrect = oQuestions[j].getElementsByTagName("feedbackCorrect")[0].firstChild.data;
				oQuestion.sFeedbackIncorrect = oQuestions[j].getElementsByTagName("feedbackIncorrect")[0].firstChild.data;
				
			} else if (oQuestion.sType == "QuestionChoice") {
				// multiple choice with single correct answer, get the array of choices
				var oChoices = oQuestions[j].getElementsByTagName("choice");
				
				// loop through the choices
				for (var k=0; k<oChoices.length; k++) {
					// see if this is the correct answer
					if (oChoices[k].getAttribute("correct") == "true") {
						// it is, remember it
						oQuestion.sAnswer = (k+1) + "";
					}
					
					// add this choice
					oQuestion.aChoices[k] = oChoices[k].firstChild.data;
				}
				
				// get the feedback
				var oFeedback = oQuestions[j].getElementsByTagName("feedback");
				
				// loop through the feedback
				for (k=0; k<oFeedback.length; k++) {
					// add this feedback
					oQuestion.aFeedbacks[k] = oFeedback[k].firstChild.data;
				}
			} 
			else if (oQuestion.sType == "QuestionChoiceMultiple") {
				// multiple choice with single correct answer, get the array of choices
				var oChoices = oQuestions[j].getElementsByTagName("choice");
				
				// init the answer to a blank string
				oQuestion.sAnswer = "";
				// loop through the choices
				for (var k=0; k<oChoices.length; k++) {
					// see if this is a correct answer
					if (oChoices[k].getAttribute("correct") == "true") {
						// it is, see if this is the first correct answer
						if (oQuestion.sAnswer == "") {
							// it is, just add the answer
							oQuestion.sAnswer += (k+1) + "";
						} else {
							// add a comma plus the answer
							oQuestion.sAnswer += "," + (k+1);
						}
					}
					
					// add this choice
					oQuestion.aChoices[k] = oChoices[k].firstChild.data;
				}
				
				// get the feedback
				oQuestion.sFeedbackCorrect = oQuestions[j].getElementsByTagName("feedbackCorrect")[0].firstChild.data;
				oQuestion.sFeedbackIncorrect = oQuestions[j].getElementsByTagName("feedbackIncorrect")[0].firstChild.data;
			}
			else if (oQuestion.sType == "QuestionMatching") {
			    // multiple choice with single correct answer, get the array of choices
				var oChoicesA = oQuestions[j].getElementsByTagName("choiceA");
				var oChoicesB = oQuestions[j].getElementsByTagName("choiceB");
				var aAnswer = new Array();
				
				// loop through the first column of choices
				for (var k=0; k<oChoicesA.length; k++) {
					// add this choice
					oQuestion.aList[k] = oChoicesA[k].firstChild.data;
					/* build the number-answer pair */
	                aAnswer[k] = (k + 1) + "[.]" + _aAlpha[k];
				}
			
	            /* put together all of the answers */
	            oQuestion.sAnswer = aAnswer.join("[,]");
	            
				// loop through the second column of choices
				for (var k=0; k<oChoicesB.length; k++) {
					// add this choice
					oQuestion.aChoices[k] = oChoicesB[k].firstChild.data;
				}
				
				// get the feedback
				oQuestion.sFeedbackCorrect = oQuestions[j].getElementsByTagName("feedbackCorrect")[0].firstChild.data;
				oQuestion.sFeedbackIncorrect = oQuestions[j].getElementsByTagName("feedbackIncorrect")[0].firstChild.data;
			}
			
			// get the ID
			oQuestion.sId = oQuestions[j].getAttribute("id");
			// get the review text and link
			oQuestion.sReview = oQuestions[j].getElementsByTagName("review")[0].firstChild.data;
			// set the question
			_oTest.aQuestionPool[i].aQuestions[j] = oQuestion;
		}
    }
    // set the total number of question pools
    _nQuestionPools = _oTest.aQuestionPool.length;
    // calculate the number of quesion to pass
    _nRequiredCorrect = Math.ceil(_nQuestionsToDeliver * (_oTest.nPassingScore / 100))
}

// set the onresize function to maximize the height of the TOC and content
window.onresize = resizeQuestion;

// called when the window is resized
function resizeQuestion() {
	// calc a height
	var nHeight = document.documentElement.clientHeight;
	
	if (document.getElementById('question') != undefined) {
	    // set the height of the question 
	    document.getElementById('question').style.height = (nHeight - 106) + "px";
	}
}

/***
* goto the passed page index
***/
function gotoPage() {
    /* see if this is any page except for the intro page */
    if (_nCurrentQuestionPool > -1 && !_oTest.bGraded) {
        /* see if there is a time limit set */
        if (_oTest.nTimeLimit > 0) {
            /* there is, see if we have started the timer */
            if (_timerTest == null) {
                /* set a time to update the time limit */
                _timerTest = setInterval("timeCheck()", 1000);
            }
        }
    }

	/* display the appropriate page */
	displayPage();
}

/***
* check to see if there is a timeout and update the time display
***/
function timeCheck() {
    // increase the spent time with 1 second
    _oTest.nTotalTime += 1000;

    // see if we have run out of time
    if (_oTest.timeLimitExpired()) {
        // grade the test
        GradeTest();

        // tell the learner he/she has run out of time
        alert(XsMsgTimeoutAlert);
    } else {
        // calculate the remaining time in seconds
        var nTime = Math.round((_oTest.nTimeLimit - _oTest.nTotalTime) / 1000);

        // see if the remaining time is greater than a minute
        if (nTime > 60) {
            // it is, get the number of minutes
            var nMinutes = Math.floor(nTime / 60);

            // get the remaining seconds
            nTime = Math.floor(nTime - (nMinutes * 60));

            // see if the number of seconds is less than 10
            if (nTime < 10) {
                // it is, pad with a zero
                nTime = "0" + nTime;
            }

            // format the time
            nTime = nMinutes + ":" + nTime;
        }
        // update the time display
        document.getElementById("timeLimit").innerHTML = XsMsgTime + nTime;
    }
}

/***
* Show the current Page to the learner
****/
function displayPage() {
    // check to see if this is an 'introduction page
    if (_nCurrentQuestionPool == -1) {
        // it is, show the 'introduction' page
        showIntroductionPage();
    } else if (_nCurrentQuestionPool == _nQuestionPools) {
        // results page, show it
        showResults();
    } else {
        // get the order for the current question
        var nOrder = _oTest.aQuestionPool[_nCurrentQuestionPool].aOrder[_nCurrentQuestion];
        // not the intro, we are showing a section, randomly select a question from the next section
        _oQuestion = _oTest.aQuestionPool[_nCurrentQuestionPool].aQuestions[nOrder];

        if (_oQuestion.sType == "QuestionTF") {
            showTrueFalse();
        } else if (_oQuestion.sType == "QuestionChoice") {
            showChoice();
        } else if (_oQuestion.sType == "QuestionChoiceMultiple") {
            showChoiceMultiple();
        } else if (_oQuestion.sType == "QuestionMatching") {
            showMatching();
        }
    }

    // resize question panel
    resizeQuestion();
}

/***
* report the interaction through the SCORM API
*	sPrevAnswer - the previous answer to this question
***/
function reportInteraction(sPrevAnswer) {
	/* do not record the interaction if the previous response is the same as the new response */
	if (sPrevAnswer == _oQuestion.sResponse)
		return;
	
	// set the SCORM interaction type
	if (_oQuestion.sType == "QuestionChoice") var sType = "choice";
	else if (_oQuestion.sType == "QuestionTF") var sType = "true-false";
	else if (_oQuestion.sType == "QuestionMatching") var sType = "matching";
	else  var sType = "choice";
	
	// get the result
	if (_oQuestion.sResponse == _oQuestion.sAnswer)
		var sResult = "correct";
	else
		var sResult = "incorrect";
		
	// fix true-false responses to work with SCORM 2004
	var sResponse = _oQuestion.sResponse;
	var sAnswer = _oQuestion.sAnswer;
	if (_oQuestion.sType == "QuestionTF") {
		if (sResponse == "f") sResponse = "false";
		if (sResponse == "t") sResponse = "true";
		if (sAnswer == "f") sAnswer = "false";
		if (sAnswer == "t") sAnswer = "true";
	}
	// set the interaction
    parent.setInteraction(null,returnID(),sType,sResponse,sAnswer,sResult,"1",null,_oQuestion.sPrompt,null);
}

/***
* Return the ID of this question
***/
function returnID() {
	// see if the id property of the question is blank
	if (_oQuestion.sId == "") {
		// it is, convert the question prompt to serve as the ID, escaped and max 255 characters
		return escape(_oQuestion.sPrompt).substring(0,254);
	}
	
	// return the ID
	return _oQuestion.sId;
}

/***
* Show a true-false question
***/
function showTrueFalse() {
	/* strings used to set the feedback and the check status of the radio buttons */
	var feedback, checkedTrue = "", checkedFalse = "";

	// see if the learner has already provided a response
	if (_oQuestion.sResponse != "") {
		/* there is an answer, set the appropriate checked value */
		if (_oQuestion.sResponse == "t")
			checkedTrue = 'checked="checked"';
		else
			checkedFalse = 'checked="checked"';
			
		// init the feedback string
		feedback = '<div class="feedback" id="feedback">';
		
		// create the start of the table to show the feedback
		feedback += '<table cellspacing="0" cellpadding="0"><tr><td valign="top" class="feedbackCheck">';

        // show the feedback only if the current page is in 'Grade' mode
		if (_oTest.bGraded) {
		    /* see if the answer was correct */
		    if (_oQuestion.sResponse == _oQuestion.sAnswer) {
		        // it was, show the check
		        feedback += '<img src="../../Player/Images/kc-feedback-correct.gif" align="left"></td>';
		        feedback += '<td><table cellspacing="0" cellpadding="0">';
		        feedback += '<tr><td><div class="feedbackCorrect">' + XsFeedbackCorrect + '</div></td></tr>';
		        feedback += '<tr><td><div class="feedbackText">' + _oQuestion.sFeedbackCorrect + '</div></td></tr>';
		        feedback += '</table>';
		    } else {
		        // build the correct answer string
		        var sTF = _oQuestion.sAnswer == 't' ? XsMsgTrue : XsMsgFalse;
		        var sCorrectIs = " " + XsCorrectIs + " " + sTF + ".";

		        // wrong answer, show the check
		        feedback += '<img src="../../Player/Images/kc-feedback-incorrect.gif" align="left"></td>';
		        feedback += '<td><table cellspacing="0" cellpadding="0">';
		        feedback += '<tr><td><div class="feedbackIncorrect">' + XsFeedbackIncorrect + sCorrectIs + '</div></td></tr>';
		        feedback += '<tr><td><div class="feedbackText">' + _oQuestion.sFeedbackIncorrect + '</div></td></tr>';
		        feedback += '</table>';
		    }
		}
		// end the tables
		feedback += '</td></tr></table>';
	} else {
		// no response, init the nav button box
		feedback = '<div class="navBox">';
		
        // show the feedback only if the current page is in 'Grade' mode
		if (_oTest.bGraded) {
		    // add the no response instructions when test is graded
		    feedback += "<div class='navInstructions'>" + XsMsgDirectionsNoResponse + "</div>";
		} else {
		    // add the no response instructions when test is not graded
		    feedback += "<div class='navInstructions'>" + (_oTest.bTest ? XsMsgDirectionsTestTF : XsMsgDirectionsTF) + "</div>";
		}
	}
	// var used to show or not the check answer button
	var sShowCheckAnswer = _oTest.bTest ? "display:none" : "display:block";
	// add the check answer button
    feedback += "<div>";		
    feedback += '<input type="button" name="evalButton" disabled="disabled" class="assessButton" style="' + sShowCheckAnswer + '" onclick="evalTrueFalse(true);return false;" value="' + XsMsgCheck + '" />';
    feedback += "</div>";
	
	// end of feedback section
    feedback += "<div class='navContainer'>" + navButtons() + "</div>" + "</div>";

	/* put together the question */
    var sData = '<div class="levelOne">' + getPageNumber() + '</div>';
	// insert the 'prompt'
	sData += "<div class='questionPrompt'>";
	sData += _oQuestion.sPrompt + "</div>";
	
	// see if the current question should be read only
	var bDisabled = _oTest.bTest && _oTest.bGraded;
	
	sData += '<FORM name=qform>';
	sData += '<INPUT onclick="enableCheckAnswer(this)" id="choicet" type=radio';
	if (bDisabled) sData += ' disabled="disabled"';
	sData += ' value=true name=answer ' + checkedTrue + '><LABEL for="choicet">' + XsMsgTrue + '</LABEL><BR />';
	sData += ' <INPUT onclick="enableCheckAnswer(this)" id="choicef" type=radio';
	if (bDisabled) sData += ' disabled="disabled"';
	sData += ' value=false name=answer ' + checkedFalse + '><LABEL for="choicef">' + XsMsgFalse + '</LABEL><br /><br />';
	
	// show the feedback
	sData += feedback;
	
	// add the end of form
	sData += '</FORM>';

	/* show it */
	document.getElementById("question").innerHTML = sData;
	
	// show the sumary information
	showSummary();
}

/***
* Show a muliple choice question
***/
function showChoice() {
	/* strings used to set the feedback and the check status of the radio buttons */
	var i, feedback;
	/* get the number of choices */
	var numChoices = _oQuestion.aChoices.length;
	
	/* see if we have created the choices sequence for this question */
	if (_oQuestion.aChoiceRand == null) {
		/* we have not, create the array */
		_oQuestion.aChoiceRand = new Array();
		for (i=0; i<numChoices; i++)
			_oQuestion.aChoiceRand[i] = i + 1;

		/* see if we need to randomize the choices */
		if (_oQuestion.bRandomize == true) {
			/* we do, randomize them */
			for (i=0; i<numChoices; i++) {
				var rand = Math.floor(Math.random()* numChoices);
				var temp = _oQuestion.aChoiceRand[i];
				_oQuestion.aChoiceRand[i] = _oQuestion.aChoiceRand[rand];
				_oQuestion.aChoiceRand[rand] = temp;
			}
		}
	}
	
	/* see if the learner has already provided a response */
	if (_oQuestion.sResponse != "") {
		// init the feedback string
		feedback = '<div class="feedback" id="feedback">';
		
		// create the start of the table to show the feedback
		feedback += '<table cellspacing="0" cellpadding="0"><tr><td valign="top" class="feedbackCheck">';
		
		// show the feedback only if the current page is in 'Grade' mode
		if (_oTest.bGraded) {
		    /* see if the answer was correct */
		    if (_oQuestion.sResponse == _oQuestion.sAnswer) {
			    // it was, show the check
			    feedback += '<img src="../../Player/Images/kc-feedback-correct.gif" align="left"></td>';
			    feedback += '<td><table cellspacing="0" cellpadding="0">';
			    feedback += '<tr><td><div class="feedbackCorrect">' + XsFeedbackCorrect + '</div></td></tr>';
			    feedback += '<tr><td><div class="feedbackText">' + _oQuestion.aFeedbacks[_oQuestion.sResponse-1] + '</div></td></tr>';
			    feedback += '</table>';
		    } else {
			    // build the correct answer string
			    var sCorrectIs = "";
	            for (i=0; i<_oQuestion.aChoiceRand.length; i++) {
	                if (_oQuestion.aChoiceRand[i] == _oQuestion.sAnswer) {
                        sCorrectIs = " " + XsCorrectIs + " " + _aAlpha[i] + ".";
                        break;
	                }
	            }
			    // in this case the answer is wrong, show the check
			    feedback += '<img src="../../Player/Images/kc-feedback-incorrect.gif" align="left"></td>';
			    feedback += '<td><table cellspacing="0" cellpadding="0">';
			    feedback += '<tr><td><div class="feedbackIncorrect">' + XsFeedbackIncorrect + sCorrectIs + '</div></td></tr>';
			    feedback += '<tr><td><div class="feedbackText">' + _oQuestion.aFeedbacks[_oQuestion.sResponse-1] + '</div></td></tr>';
			    feedback += '</table>';
		    }
		}
		// end the tables
		feedback += '</td></tr></table>';
	} else {
		// no response, init the nav box
		feedback = '<div class="navBox">';
		
         // show the feedback only if the current page is in 'Grade' mode
		if (_oTest.bGraded) {
		    // add the no response instructions when test is graded
		    feedback += "<div class='navInstructions'>" + XsMsgDirectionsNoResponse + "</div>";
		} else {
		    // add the instructions
		    feedback += "<div class='navInstructions'>" + (_oTest.bTest ? XsMsgDirectionsTestMC : XsMsgDirectionsMC) + "</div>";
		}
	}
	
	// var used to show or not the check answer button
	var sShowCheckAnswer = _oTest.bTest ? "display:none" : "display:block";
    // add the check answer button
    feedback += "<div>";		
    feedback += '<input type="button" name="evalButton" disabled="disabled" class="assessButton"  style="' + sShowCheckAnswer + '" onclick="evalChoice(true);return false;" value="' + XsMsgCheck + '" />';
    feedback += "</div>";
    // end of feedback section
    feedback += "<div class='navContainer'>" + navButtons() + "</div></div>";

	/* put together the question and the instructions */
	var sData = '<div class="levelOne">' + getPageNumber() + '</div>';
	sData += "<div class='questionPrompt'>" + _oQuestion.sPrompt + "</div>";
	sData += '<FORM name=qform><div>';
	sData += '<table class="Choices">';
	
	// see if the current question should be read only
	var bDisabled = _oTest.bTest && _oTest.bGraded;

	/* add the choices */
	for (i=0; i<numChoices; i++) {
		/* use the random array to decide which choice to display */
		nChoice = _oQuestion.aChoiceRand[i];

		/* start building the choice string */
		sData += '<tr><td class="ChoicesRadio"><INPUT onclick="enableCheckAnswer(this)" type=radio value=';
		sData += nChoice;
		sData += ' name=answer';
		
		if (bDisabled) {
		    sData += ' disabled="disabled"'; }

		/* see if this was the response from last time, if so, mark it as checked */
		if (nChoice == _oQuestion.sResponse)
			sData += ' checked="checked"';
			
        sData += ' id="cc' + nChoice + '"></td>';

		/* get the text for this choice */
		sData += '<td class="ChoicesAlpha">' + _aAlpha[i] + '.</td><td class="ChoicesText"><label for="cc' + nChoice + '">' + _oQuestion.aChoices[nChoice - 1] + '</label></td>';
		sData += '</tr>';
	}
	
	sData += '</table>';
	
	// show the feedback
	sData += '</div><BR />' + feedback;
	
	// add the end of form
	sData += '</FORM>';

	/* show it */
	document.getElementById("question").innerHTML = sData;
	
	// show the summary information
	showSummary();
}

/***
* Show a muliple choice with multiple correct question
***/
function showChoiceMultiple() {
	var i;	
	/* strings used to set the feedback and the check status of the radio buttons */
	var feedback = "";
	
	/* get the number of choices */
	var numChoices = _oQuestion.aChoices.length;

	/* see if we have created the choices sequence for this question */
	if (_oQuestion.aChoiceRand == null) {
		/* we have not, create the array */
		_oQuestion.aChoiceRand = new Array();
		for (i=0; i<numChoices; i++)
			_oQuestion.aChoiceRand[i] = i + 1;

		/* see if we need to randomize the choices */
		if (_oQuestion.bRandomize == true) {
			/* we do, randomize them */
			for (i=0; i<numChoices; i++) {
				var rand = Math.floor(Math.random()* numChoices);
				var temp = _oQuestion.aChoiceRand[i];
				_oQuestion.aChoiceRand[i] = _oQuestion.aChoiceRand[rand];
				_oQuestion.aChoiceRand[rand] = temp;
			}
		}
	}
	
	/* see if the learner has already provided a response */
	if (_oQuestion.sResponse != "") {
	    // submit was clicked, init the feedback string
	    feedback += '<div class="feedback" id="feedback">';
		
	    // create the start of the table to show the feedback
	    feedback += '<table cellspacing="0" cellpadding="0"><tr><td valign="top" class="feedbackCheck">';

        // show the feedback only if the current page is in 'Grade' mode
	    if (_oTest.bGraded) {
	        /* see if the answer was correct */
	        if (_oQuestion.sResponse == _oQuestion.sAnswer) {
	            // it was, show the check
	            feedback += '<img src="../../Player/Images/kc-feedback-correct.gif" align="left"></td>';
	            feedback += '<td><table cellspacing="0" cellpadding="0">';
	            feedback += '<tr><td><div class="feedbackCorrect">' + XsFeedbackCorrect + '</div></td></tr>';
	            feedback += '<tr><td><div class="feedbackText">' + _oQuestion.sFeedbackCorrect + '</div></td></tr>';
	            feedback += '</table>';
	        } else {
	            // build the correct answer string
	            var aAnswers = _oQuestion.sAnswer.split(',');
	            var sCorrectIs = "";
	            for (i = 0; i < aAnswers.length; i++) {
	                for (j = 0; j < _oQuestion.aChoiceRand.length; j++) {
	                    if (_oQuestion.aChoiceRand[j] == aAnswers[i]) {
	                        sCorrectIs += _aAlpha[j];
	                        break;
	                    }
	                }
	            }
	            // build the final string - sorted
	            sCorrectIs = " " + XsCorrectIs + " " + sCorrectIs.split('').sort().join(', ');

	            // wrong answer, show the check
	            feedback += '<img src="../../Player/Images/kc-feedback-incorrect.gif" align="left"></td>';
	            feedback += '<td><table cellspacing="0" cellpadding="0">';
	            feedback += '<tr><td><div class="feedbackIncorrect">' + XsFeedbackIncorrect + sCorrectIs + '</div></td></tr>';
	            feedback += '<tr><td><div class="feedbackText">' + _oQuestion.sFeedbackIncorrect + '</div></td></tr>';
	            feedback += '</table>';
	        }
	    }
	    // end the tables
		feedback += '</td></tr></table>';
	} else {
		// no response, init the nav box
		feedback = '<div class="navBox">';
		
         // show the feedback only if the current page is in 'Grade' mode
		if (_oTest.bGraded) {
		    // add the no response instructions when test is graded
		    feedback += "<div class='navInstructions'>" + XsMsgDirectionsNoResponse + "</div>";
		} else {
		    // add the instructions
		    feedback += "<div class='navInstructions'>" + (_oTest.bTest ? XsMsgDirectionsTestMCM : XsMsgDirectionsMCM) + "</div>";
		}
	}
	
	// var used to show or not the check answer button
	var sShowCheckAnswer = _oTest.bTest ? "display:none" : "display:block";
    // add the check answer button
    feedback += "<div>";		
    feedback += '<INPUT type="button" name="evalButton" disabled="disabled" class="assessButton" style="' + sShowCheckAnswer + '" onclick="evalChoiceMultiple(true);return false;" value="' + XsMsgCheck + '" />';
    feedback += "</div>";
    // end of feedback section
    feedback += "<div class='navContainer'>" + navButtons() + "</div></div>";
    // end of feedback section
    feedback += '</div>';

	/* put together the question and the instructions */
	var sData = '<div class="levelOne">' + getPageNumber() + '</div>';
	sData += "<div class='questionPrompt'>" + _oQuestion.sPrompt + "</div>";
	sData += '<FORM name=qform>';
	sData += '<table class="Choices">';

	/* break the previous answers into a local array */
	var aResponse = _oQuestion.sResponse.split(',');

	// see if the current question should be read only
	var bDisabled = _oTest.bTest && _oTest.bGraded;
	
	/* add the choices */
	for (i=0; i<numChoices; i++) {
		/* use the random array to decide which choice to display */
		nChoice = _oQuestion.aChoiceRand[i];

		/* start building the choice string */
		sData += '<tr><td class="ChoicesCheck"><INPUT onclick="enableCheckAnswer(this)" type=checkbox value=';
		sData += nChoice;
		sData += ' name=answer';

		if (bDisabled) {
		    sData += ' disabled="disabled"';
		}

		/* see if there were any previous responses */
		if (_oQuestion.sResponse != "") {
			/* there are, look through these responses */
			for (var j=0; j<aResponse.length; j++) {
				if (nChoice == aResponse[j]) {
					sData += ' checked="checked"';
					break;
				}
			}
		}

		// add the end of the input tag
		sData += ' id="cc' + nChoice + '"></td>';

		/* get the text for this choice */
		sData += '<td class="ChoicesAlpha">' + _aAlpha[i] + '.</td><td class="ChoicesText"><label for="cc' + nChoice + '">' + _oQuestion.aChoices[nChoice - 1] + '</label></td>';
		sData += '</tr>';
	}
	
	// add the end of the table
	sData += '</table>';
	
	// show the feedback
	sData += '</div><BR />' + feedback;
	
	// add the end of form
	sData += '</FORM>';

	/* show it */
	document.getElementById("question").innerHTML = sData;
	
	// show the summary information
	showSummary();
}

/***
* Show a matching question
***/
function showMatching() {
	var i, aResponse;
	/* strings used to set the feedback and the check status of the radio buttons */
	var feedback = "";

	/* get the number of choices */
	var numChoices = _oQuestion.aChoices.length;

	/* see if we have created the choices sequence for this question */
	if (_oQuestion.aChoiceRand == null) {
		/* we have not, create the array */
		_oQuestion.aChoiceRand = new Array();
		for (i=0; i<numChoices; i++) {
			_oQuestion.aChoiceRand[i] = i + 1;
		}
			/* we do, randomize them */
			for (i=0; i<numChoices; i++) {
				var rand = Math.floor(Math.random()* numChoices);
				var temp = _oQuestion.aChoiceRand[i];
				_oQuestion.aChoiceRand[i] = _oQuestion.aChoiceRand[rand];
				_oQuestion.aChoiceRand[rand] = temp;
			}
	}

	/* see if the learner has already provided an aswer */
	if (_oQuestion.sResponse != "") {
		// he has, break the response into an array for later display
		aResponse = _oQuestion.sResponse.split("[,]");
		// submit was clicked, init the feedback string
		feedback = '<div class="feedback" id="feedback">';
		
		// create the start of the table to show the feedback
		feedback += '<table cellspacing="0" cellpadding="0"><tr><td valign="top" class="feedbackCheck">';
		// show the feedback only if the current page is in 'Grade' mode
		if (_oTest.bGraded) {
		    /* there is an answer, see if this is the correct answer */
		    if (_oQuestion.sResponse == _oQuestion.sAnswer) {
		        // it was, show the check
		        feedback += '<img src="../../Player/Images/kc-feedback-correct.gif" align="left"></td>';
		        feedback += '<td><table cellspacing="0" cellpadding="0">';
		        feedback += '<tr><td><div class="feedbackCorrect">' + XsFeedbackCorrect + '</div></td></tr>';
		        feedback += '<tr><td><div class="feedbackText">' + _oQuestion.sFeedbackCorrect + '</div></td></tr>';
		        feedback += '</table>';
		    } else {
		        // wrong answer, show the check
		        feedback += '<img src="../../Player/Images/kc-feedback-incorrect.gif" align="left"></td>';
		        feedback += '<td><table cellspacing="0" cellpadding="0">';
		        feedback += '<tr><td><div class="feedbackIncorrect">' + XsFeedbackIncorrect + '</div></td></tr>';
		        feedback += '<tr><td><div class="feedbackText">' + _oQuestion.sFeedbackIncorrect + '</div></td></tr>';
		        feedback += '</table>';
		    }
		}
	    // end the tables
	    feedback += '</td></tr></table>';
	} else {
	    // no response, init the nav box
	    feedback = '<div class="navBox">';
    	
         // show the feedback only if the current page is in 'Grade' mode
	    if (_oTest.bGraded) {
	        // add the no response instructions when test is graded
	        feedback += "<div class='navInstructions'>" + XsMsgDirectionsNoResponse + "</div>";
	    } else {
	        // add the instructions
	        feedback += "<div class='navInstructions'>" + (_oTest.bTest ? XsMsgDirectionsTestMCM : XsMsgDirectionsMCM) + "</div>";
	    }
	}
	
	// var used to show or not the check answer button
	var sShowCheckAnswer = _oTest.bTest ? "display:none" : "display:block";
	// add the check answer button
    feedback += "<div>";		
    feedback += '<INPUT type="button" name="evalButton" disabled="disabled" class="assessButton" style="' + sShowCheckAnswer + '" onclick="evalMatching(true);return false;" value="' + XsMsgCheck + '" />';
    feedback += "</div>";
    // end of feedback section
    feedback += "<div class='navContainer'>" + navButtons() + "</div></div>";
    // end of feedback section
    feedback += '</div>';

	/* create arrays to hold the left and right side choices */
	var aLeft = new Array();
	var aRight = new Array();
	/* create an array to get the answers */

	// see if the current question should be read only
	var bDisabled = _oTest.bTest && _oTest.bGraded;
	
	for (i=0; i<numChoices; i++) {
		/* use the random array to decide which choice to create */
		var nChoice = _oQuestion.aChoiceRand[i] - 1;

		/* add the start of the text field */
		aLeft[i] = '<input size="1" maxlength="1" ';

		if (bDisabled) {
		    aLeft[i] += ' disabled="disabled"';
		}

		/* add more of the text field */
		var nNum = nChoice + 1;
		aLeft[i] += 'type="text" onkeypress="enableCheckAnswer(this)" name="answer' + nNum + '" value="';
		
		/* see if there were any responses */
		if (_oQuestion.sResponse != "") {
		    /* there were, add in the response from the number-answer pair */
			aLeft[i] += aResponse[nChoice].split("[.]")[1];
        }

		/* add the rest of the text field */
		aLeft[i] += '">&nbsp;';

		/* add the choice */
		nNum = i + 1;
		aLeft[i] += '<label for="answer' + (nChoice + 1) + '">' + nNum + '. ' + _oQuestion.aList[i] + '</label>';
		aRight[nChoice] = _oQuestion.aChoices[i];
	}
	/* put together the question and the instructions */
	var sData = '<div class="levelOne">' + getPageNumber() + '</div>';
	sData += "<div class='questionPrompt'>" + _oQuestion.sPrompt + "</div>";
	sData += '<FORM name=qform>';
	sData += '<table class="Choices">';
	
	for (i=0; i<numChoices; i++) {
		sData += '<tr><td class="ChoicesText">';
		sData += aLeft[i];
		sData += '</td><td class="ChoicesText">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
		sData += _aAlpha[i] + '. ' + aRight[i];
		sData += '</td></tr>';
	}
	sData += '</table>';
	
	// show the feedback
	sData += '</div><BR />' + feedback;
	
	// we do, show the check answer button
	sData += '</FORM>';

	/* show it */
	document.getElementById("question").innerHTML = sData;

	/* set focus */
	tf = document.getElementsByName("answer" + _oQuestion.aChoiceRand[0])[0];
	if (tf != undefined && !bDisabled) {
	    tf.focus();
	    tf.focus();
	}
	
	// show the summary information
	showSummary();
}

/***
* Enable the submit button
***/
function enableCheckAnswer(ctl) {
    document.getElementsByName("evalButton")[0].disabled = "";
}

/***
* Evaluates the current question
***/
// bDisplay - indicates if the current question should be redisplayed
function evalCurrentQuestion(bDisplay) {
    if (bDisplay) {
        // check to see if this is an 'introduction page
        if (_nCurrentQuestionPool == -1) {
            // it is, show the 'introduction' page
            showIntroductionPage();
            return;
        }
        // check to see if this is a 'results' page
        if (_nCurrentQuestionPool == _nQuestionPools) {
            // it is, show the 'results' page
            showResults();
            return;
        }
    }
    
    // see if we are on a question page
    if (_nCurrentQuestionPool > -1 && _nCurrentQuestionPool < _nQuestionPools)  {
         // see what type of question we have
	    if (_oQuestion.sType == "QuestionTF") {
		    evalTrueFalse(bDisplay);
	    } else if (_oQuestion.sType == "QuestionChoice") {
		    evalChoice(bDisplay);
	    } else if (_oQuestion.sType == "QuestionChoiceMultiple") {
		    evalChoiceMultiple(bDisplay);
	    } else if (_oQuestion.sType == "QuestionMatching") {
		    evalMatching(bDisplay);
	    }
	}
}

/***
* Evaluate a true-false question
***/
function evalTrueFalse(bDisplay) {
	/* get the radio button array */
	rButtons = document.getElementsByName("answer");
	
	/* remember the previous answer */
	var sPrevAnswer = _oQuestion.sResponse;

	/* remember which radio button has been selected */
	if (rButtons[0].checked == true) {
		/* selected true */
		_oQuestion.sResponse = "t";
	} else if (rButtons[1].checked == true) {
		/* selected false */
		_oQuestion.sResponse = "f";
	}
	
	// see if this is a test
	if (_oTest.bTest) {
		// quit if no response
		if (_oQuestion.sResponse == "") {
			return false;
		}
	} else {
		// see if prev/next hit instead of submit AND this is the first answer AND there is a response
		if (!bDisplay && sPrevAnswer == "" && _oQuestion.sResponse != "") {
			// it is, we will not report this interaction so return with false
			return false;
		} else {
			// this is a good answer, reset the previous answer to record it
			if (bDisplay)
				sPrevAnswer = "";
		}
	}
	
	/* report the interaction to SCORM */
	reportInteraction(sPrevAnswer);
	
	/* redisplay the question */
	if (bDisplay) {
		showTrueFalse();
	}
	
	// learner responded so return true;
	return true;
}

/***
* Evaluate a multiple choice question
***/
function evalChoice(bDisplay) {
	/* remember the previous answer */
	var sPrevAnswer = _oQuestion.sResponse;
	
	/* get the radio button array */
	var rButtons = document.getElementsByName("answer");

	/* remember which radio button has been selected */
	for (var i=0; i<rButtons.length; i++) {
		if (rButtons[i].checked == true) {
			/* radio button was selcted, get the value of this choice */
			_oQuestion.sResponse = rButtons[i].value;
			break;
		}
	}
	
	// see if this is a test
	if (_oTest.bTest) {
		// quit if no response
		if (_oQuestion.sResponse == "") {
			return false;
		}
	} else {
		// see if prev/next hit instead of submit AND this is the first answer AND there is a response
		if (!bDisplay && sPrevAnswer == "" && _oQuestion.sResponse != "") {
			// it is, we will not report this interaction so return with false
			return false;
		} else {
			// this is a good answer, reset the previous answer to record it if the submit button was pressed
			if (bDisplay)
				sPrevAnswer = "";
		}
	}
	
	/* report the interaction to SCORM */
	reportInteraction(sPrevAnswer);

	/* redisplay the question */
	if (bDisplay) {
		showChoice();
	}
	
	// learner responded so return true;
	return true;
}

/***
* Evaluate a multiple choice with multiple answers question
***/
function evalChoiceMultiple(bDisplay) {
	/* remember the previous answer */
	var sPrevAnswer = _oQuestion.sResponse;
	
	/* get the checkboxes array */
	var cButtons = document.getElementsByName("answer");

	/* remember which checkboxes have been selected */
	var aChecks = new Array();
	var nChecks = 0;
	for (var i=0; i<cButtons.length; i++) {
		if (cButtons[i].checked == true) {
			/* radio button was selcted, get the value of this choice */
			aChecks[nChecks] = cButtons[i].value - 0;
			nChecks++;
		}
	}

	/* see if we have any checks */
	if (aChecks.length > 0) {
		/* we do, sort the array and build the answer string */
		aChecks = aChecks.sort();
		_oQuestion.sResponse = aChecks.join(',');
	} else {
		/* no checks, set the answer list to an empty string */
		_oQuestion.sResponse = "";
	}

	// see if this is a test
	if (_oTest.bTest) {
		// quit if no response
		if (_oQuestion.sResponse == "") {
			return false;
		}
	} else {
		// see if prev/next hit instead of submit AND this is the first answer AND there is a response
		if (!bDisplay && sPrevAnswer == "" && _oQuestion.sResponse != "") {
			// it is, we will not report this interaction so return with false
			return false;
		} else {
			// this is a good answer, reset the previous answer to record it if the submit button was pressed
			if (bDisplay)
				sPrevAnswer = "";
		}
	}
	
	/* report the interaction to SCORM */
	reportInteraction(sPrevAnswer);

	/* redisplay the question */
	if (bDisplay) {
		showChoiceMultiple();
	}
	
	// learner responded so return true;
	return true;
}

/***
*
* Evaluate a matching question
*
***/
function evalMatching(bDisplay) {
	/* remember the previous answer */
	var sPrevAnswer = _oQuestion.sResponse;
	
	/* get the number of choices */
	var numChoices = _oQuestion.aChoices.length;

	/* create an array to get the responses */
	var aResponse = new Array();
	
	// init a var to see if we have answers
	bHaveAnswers = false;

	/* look through all of the answers */
	for (var i=0; i<numChoices; i++) {
		/* get the name of the text field */
		var nNum = i + 1;
		var sControl = "answer" + nNum;

		/* get the response in this text field and make it upper case */
		var sResponse = document.getElementsByName(sControl)[0].value.toUpperCase();

		/* build the number-answer pair */
		aResponse[i] = nNum + "[.]" + sResponse;
		
		// remeber if we have at least one answer
		if (sResponse != "") {
			bHaveAnswers = true;
		}
	}

    /* put together all of the answers only if there is at least one response */
	if (bHaveAnswers) {
	    _oQuestion.sResponse = aResponse.join("[,]");
	}

	// see if this is a test
	if (_oTest.bTest) {
		// quit if no response
		if (!bHaveAnswers) {
			return false;
		}
	}
	
	/* report the interaction to SCORM */
	reportInteraction(sPrevAnswer);
	
	/* redisplay the question */
	if (bDisplay) {
		showMatching();
	}
	
	// learner responded so return true;
	return true;
}

/***
* show the introduction page
***/
function showIntroductionPage(){
	// add the text for the intro page
	var s = _oTest.bQuiz ? XsQuizIntroTitle : XsTestIntroTitle;
	s += "<div class='introduction'><p>" + _oTest.sIntroduction + "</p></div>";
	s += _oTest.bQuiz ? XsIntroQuiz : XsIntroTest;
	
	// show the information page HTML
	document.getElementById("question").innerHTML = s + '<form>' + navButtons() + '</form>';
	
	// show the sumary information
	showSummary();
}

// adds '...' to the end of 'sText' if it's length is greater than 'nLength'
function getClippedText(sText, nLength) {
    var result = sText;
    
    // check to see if the length of the text is greater than 'nLength'
    if (sText.length > nLength) {
        // it is, insert three points
        result = sText.substring(0, nLength) + "...";
    }
    
    return result;
}

// This function calculates the score and pass status of the current test
function calcTest() {
    /* calculate the value of each question */
    var nEach = 100 / _nQuestionsToDeliver;

    _oTest.nTotalScore = 0;

    // init the number of questions answered correctly, incorrectly and answered
    _oTest.nCorrect = 0;
    _oTest.nIncorrect = 0;
    _oTest.nAnswered = 0;
    _oTest.sIncorrectQuestions = "";

    var nCount = 0;
    /* loop through the questions and score the test */
    for (var i = 0; i < _nQuestionPools; i++) {
        for (var j = 0; j < _oTest.aQuestionPool[i].nDeliver; j++) {
            // get the current question
            var oQuestion = _oTest.aQuestionPool[i].aQuestions[_oTest.aQuestionPool[i].aOrder[j]];
            // see if we have the correct answer for the selected question
            if (oQuestion.sResponse == oQuestion.sAnswer) {
                    // it is, increment the score
                    _oTest.nTotalScore += nEach;
                    _oTest.nCorrect++;
                    _oTest.nAnswered++;
            } else {
                nCount++;
                var sQuestionPormpt = getClippedText(oQuestion.sPrompt, 50);
                // see if this is an incorrect response
                if (oQuestion.sResponse != "") {
                    _oTest.nIncorrect++;
                    _oTest.nAnswered++;
                } else {
                    sQuestionPormpt += " " + XsNoAnswer;
                }
                // build the question link
                _oTest.sIncorrectQuestions += '<li> ' + nCount + '. ' + '<a href="" onclick="gotoQuestion(' + i + ',' + j + ');return false">' + sQuestionPormpt + '</a></li>';
            }
        }
    }
    // make sure we can't have a higher score that 100%
    if (_oTest.nTotalScore > 100)
        _oTest.nTotalScore = 100;

    // return the score as an integer
    _oTest.nTotalScore = Math.round(_oTest.nTotalScore);

    // check to see what contribute has the current test
    if (_oTest.sContribute == "v") {
         // the user visited the page, mark as completed
         _oTest.sPassStatus = "C";
    }
    else if (_oTest.sContribute == "c") {
        // complete contribute, check to see if the user answered to all questions
        if (_oTest.nAnswered == _nQuestionsToDeliver) {
             // mark as completed
            _oTest.sPassStatus = "C";
        } else {
            // mark as incompleted
            _oTest.sPassStatus = "I";
        }
    }
    else {
        // set the status state
        if (_oTest.nTotalScore >= _oTest.nPassingScore) {
            // mark as passed
            _oTest.sPassStatus = "P";
        } else {
            // he has not, see if the user has failed - can only fail if not have to answer all
            if (_oTest.nIncorrect > (_nQuestionsToDeliver - _nRequiredCorrect)) {
                // failed, mark as failed
                _oTest.sPassStatus = "F";
            } else {
                // not failed, mark as incomplete
                _oTest.sPassStatus = "I";
            }
        }
    }
    
    // update current page status
    if (parent.updatePageStatus) {
        parent.updatePageStatus(_sCurrentPageId, _oTest.sPassStatus, _oTest.nTotalScore);
    }
}

// this function returns the author message 
// depending on the current passing status
function getAuthorMessage() {
    var sMessage = ""; // author message
    
    switch (_oTest.sPassStatus) {
        case "P":
            // passed message
            sMessage = _oTest.sPassedMessage.replace(/%%score/g, _oTest.nTotalScore);
            break;
        case "F":
            // fail message
            sMessage = _oTest.sFailedMessage.replace(/%%score/g, _oTest.nTotalScore);;
            break;
        case "I":
            // incomplete message
            sMessage = _oTest.sIncompleteMessage;
            break;
        case "C":
            // complete message
            sMessage = _oTest.sCompletedMessage;
            break;
    }
    
    // return the message
    return sMessage;
}

/***
* show the results page
***/
function showResults() {
    // show the sumary information
	showSummary();
	
    var sData = "";
   
    // get the type of page
    sData = XsSummaryTitle.replace(/%%type/g, _oTest.sTestType);
   
    // show results depending on the 'Test' type and 'grade' mode
    if (_oTest.bTest && !_oTest.bGraded) {
        // add the info text
        sData += XsSummaryUngraded;
    } else if (_oTest.bTest && _oTest.bGraded) {
        // add the author message
        sData += '<p>' + getAuthorMessage() + '</p>';
        // see if there are any questions answered incorrect
        if (_oTest.sIncorrectQuestions != "") {
            // there are, add the to the 'missed questions' list
            sData += XsMissedQuestions;
            sData += '<div style="overflow:auto;"><ul id ="ulNavigation">' + _oTest.sIncorrectQuestions + '</ul></div>';
        }
		
		// see if this test has a valid objective ID
		if (_oTest.sId != "") {
			// it does, use it
			var sObjectiveID = _oTest.sId;
		} else {
			// use the page ID
			var sObjectiveID = parent.getCurrentPageId();
		}
		
		// set the objective
		parent.setObjective(parent.getObjectiveIndex("0", parent.getCurrentPageId()),sObjectiveID,"completed",null,_oTest.nTotalScore>=_oTest.nPassingScore?"passed":"failed",(_oTest.nTotalScore/100)+"",null);
    } else {
        // is a Quiz, add the author message
        sData += '<p>' + getAuthorMessage() + '</p>';
        
        
        // display the quiz results depending on the current test contribute
        if  (_oTest.sContribute == "v") {
            sData += XsQuizSummaryCorrectCompleted;
        }
        else if (_oTest.sContribute == "c") {
            sData += XsQuizRequiredAll;
            sData += XsAnsweredQuestions;
            
            // check to see if the user completed the quiz
            if (_oTest.nAnswered == _nQuestionsToDeliver) {
                // quiz completed, get the completed message
                sData += XsQuizSummaryCompleted;
            } else {
                // quiz incomplete, get the incomplete message
                sData += XsQuizSummaryIncomplete;
            }
        } else {
             sData += XsQuizRequiredMust.replace(/%%total/g, _nRequiredCorrect);

            // get the user score
            var nUserScore = Math.ceil((_oTest.nCorrect / _nQuestionsToDeliver) * 100)
            if (nUserScore >= _oTest.nPassingScore) {
                sData += XsQuizSummaryPassed;
            } else {
                sData += XsQuizSummaryFailed;
            }
        }
        // replace vars
        sData = sData.replace(/%%correct/g, _oTest.nCorrect);
        sData = sData.replace(/%%answered/g, _oTest.nAnswered);
        sData = sData.replace(/%%total/g, _nQuestionsToDeliver);
    }
    
    // add the nav buttons
	sData += '<form>' + navButtons() + '</form>';
	
	// insert the results
	document.getElementById("question").innerHTML = sData;
}

/***
* Get the page number
***/
function getPageNumber() {
    var sDisplay = "";
    // show page number only if we are in a 'Quiz' or 'Test'
    if (_oTest.bTest || _oTest.bQuiz)
    {
	    var _nQuestionCount = 0;
        
        // scan the visited 'question pools' to calculate the total number of delivered questions
	    for(var i = 0; i<_nCurrentQuestionPool; i++) {
	        _nQuestionCount += _oTest.aQuestionPool[i].nDeliver;
	    }
	    // add the index of the current question
	    _nQuestionCount += _nCurrentQuestion + 1;
    	
        // build the page display and return it
        sDisplay = XsMsgPageNum.replace(/%%question/g,(_nQuestionCount));	
	    sDisplay = sDisplay.replace(/%%total/g,_nQuestionsToDeliver);
	}
	
	return sDisplay;
}

/***
* add HTML for the nav buttons
***/
function navButtons() {
	// var used to show the prev and next buttons
	var sShowPrev = "";
	var sShowNext = "";
	var sPrev = XsNavPrev;
	var sNext = XsNavNext;
	
	if (!_oTest.bTest && !_oTest.bQuiz) {
	    // for 'Test' and 'Quiz' no navigation buttons should be displayed
	    sShowPrev = "display:none";
	    sShowNext = "display:none";
	} else {
        if (_nCurrentQuestionPool == -1) {
            // we are on the 'introduction' page, display 'Begin' text
            sShowPrev = "display:none";
            sNext = _oTest.bQuiz ? XsQuizNavFirst : XsTestNavFirst;
	    } 
	    if (_nCurrentQuestionPool == _nQuestionPools) {
	        // we are on the 'results' page, hide the 'next' button
	        sShowNext = "display:none";
	    }
	    if (_nCurrentQuestionPool == 0 && _nCurrentQuestion == 0) {
	        // first 'question pool' and 'question', the 'prev' button should be the 'introduction' page
	        sPrev = XsNavIntro;
	    }
	    if (_nCurrentQuestionPool == _nQuestionPools - 1 && _nCurrentQuestion == _oTest.aQuestionPool[_nCurrentQuestionPool].nDeliver - 1) {
	        // last 'question pool' and 'question' - the 'next' button should display 'results' page
	        sNext = XsNavResults;
	    }
	}
	
	// create a div to hold the nav buttons
	var s = "<div class='navigation'>";
	
	// add the previous button
	s += '<input type="button" class="assessButton" onclick="PrevPage();return false;" style="' + sShowPrev + '" value="' + sPrev + '" />';

	// add a spacer
	s += "  ";
	
	// add the next button
	s += '<input type="button" class="assessButton" onclick="NextPage();return false;" style="' + sShowNext + '" value="' + sNext + '" />';
	
	// Check to see if we are in a "Test" type
	if (_oTest.bTest) {
	   // display the 'Grade Test' button only if in 'Ungraded' mode
	   var showGradeTest = (_oTest.bGraded) ? "display:none" : "visibility:visible";
 	   // we are, add 'Retake Test' and 'Grade Test' buttons only if the type is 'Test' 
       s += '<input type="button" class="assessButton" onclick="GradeTest();return false;" style="margin-left:25px;' + showGradeTest + ';" value="' + XsNavGradeTest + '" />';
       // display the 'Retake Test' button only if in 'Graded' mode
       var showRetakeTest = (_oTest.bGraded) ? "visibility:visible" : "visibility:hidden";
       s += '<input id="btnRetakeTest" type="button" class="assessButton" onclick="RetakeTest();return false;" style="margin-left:25px;' + showRetakeTest + ';" value="' + XsNavRetakeTest + '" />';
	}
	
	// add the end of div
	s += "</div>";

	return s;
}

/***
* show the summary info
***/
function showSummary() {
    // calculate scores
    calcTest();
    
    // show info specific for a 'Test' or a 'Quiz'
    if (_oTest.bTest || _oTest.bQuiz) {
        // show the question menu
	    showQuestionMenu();
	    // set the test status text
	    document.getElementById("testStatus").innerHTML = getTestStatusText();
	}
}

/***
* get the test status string
***/
function getTestStatusText() {
    var line1MustDo = ""; // the first line status
    var line2HasDone = ""; // the second line status
    
    // switch on the completion status
    switch (_oTest.sContribute) {
        case "n":
            line1MustDo = _oTest.bTest ? XsTestNoChoiceStatus :XsQuizNoChoiceStatus;
            break;
        case "v":
            line1MustDo = _oTest.bTest ? XsTestVisitChoiceStatus : XsQuizVisitChoiceStatus;
            break;
        case "c":
            line1MustDo = _oTest.bTest ? XsTestCompleteChoiceStatus : XsQuizCompleteChoiceStatus;
            break;
        case "p":
            line1MustDo = _oTest.bTest ? XsTestPassChoiceStatus.replace(/%%score/g, _oTest.nPassingScore + "%") : XsQuizPassChoiceStatus.replace(/%%score/g, _oTest.nPassingScore + "%");
            break;
        default:
            line1MustDo = _oTest.bTest ? XsTestNoChoiceStatus : XsQuizNoChoiceStatus;
            break;
    }
    
    // display the second line only if the test is in grade mode and the contribute is not 'visit'
    if (_oTest.bGraded) {
        if (_oTest.bQuiz && _oTest.sContribute == "v") {
            // no info in this case
            line2HasDone = "";
        }
        else {
            switch (_oTest.sPassStatus) {
                case "P":
                    line2HasDone = _oTest.bTest ? XsTestPassed : XsQuizPassed;
                    break;
                case "I":
                    line2HasDone = _oTest.bTest ? XsTestIncomplete : XsQuizIncomplete;
                    break;
                case "F":
                    line2HasDone = _oTest.bTest ? XsTestFailed : XsQuizFailed;
                    break;
                case "C":
                    line2HasDone = _oTest.bTest ? XsTestCompleted : XsQuizCompleted;
                    break;
            }
        }
    }
    
    // put lines on diffrent rows
    return line1MustDo + "<br/>" + line2HasDone;
}

/***
* Show the question menu
***/
function showQuestionMenu() {
    // insert the title
	var sData = "<div class='QitemTitle'>" + XsItemTitle.replace(/%%testtype/g, _oTest.sTestType.toUpperCase()) + "</div>";
	// start the table
	sData += "<table class='QitemTable' cellpadding='0' cellspacing='0'><tr>";
	 // see if this is the 'introduction' page
	if (_nCurrentQuestionPool == -1){
	    // it is, show the pointer
	    sData += "<td align='center'><img src='../../Player/Images/kc_arrow.gif' width='10' height='7' border='0'></td>";
	} else {
	    // it is not, do not show the pointer
        sData += "<td height='16'>&nbsp;</td>";
	}
	
	// loop through the sections in the test
    for (var i=0; i<_nQuestionPools; i++) {
	    //loop through the questions in the section.
	    for(var j=0; j<_oTest.aQuestionPool[i].nDeliver; j++){
	    // see if this is the current question
		    if (i == _nCurrentQuestionPool && j == _nCurrentQuestion) {
			    // it is, show the pointer
		        sData += "<td align='center'><img src='../../Player/Images/kc_arrow.gif' width='10' height='7' border='0'></td>";
		    } else {
			    // it is not, do not show the pointer
			    sData += "<td height='16'>&nbsp;</td>";
		    }
	    }
    }
     // see if this is the 'results' page
	if (_nCurrentQuestionPool == _nQuestionPools){
	    // it is, show the pointer
	    sData += "<td align='center'><img src='../../Player/Images/kc_arrow.gif' width='10' height='7' border='0'></td>";
	} else {
	    // it is not, do not show the pointer
        sData += "<td height='16'>&nbsp;</td>";
	}
    
    // add the end row end and start
    sData += "</tr><tr>";
    
    if (_nCurrentQuestionPool == -1) {
        // it is, show the question as current
		sData += "<td class='QitemCurrent'><a href='' onclick='gotoQuestion(-1,0);return false'>" + XsIntroduction + "</a></td>";    
    } else {
        // it does not, show the questions without a response
		sData += "<td class='QitemNoReponse'><a href='' onclick='gotoQuestion(-1,0);return false'>" + XsIntroduction + "</a></td>";
    }
    var nQTotal = 0;
    // loop through the sections in the test
    for (i=0; i<_nQuestionPools; i++) {
	    for(var j=0; j<_oTest.aQuestionPool[i].nDeliver; j++){
		    nQTotal++;
		    // see if this is the current question
		    if (i == _nCurrentQuestionPool && j == _nCurrentQuestion) {
			    // it is, show the question as current
			    sData += "<td class='QitemCurrent'><a href='' onclick='gotoQuestion(" + i + "," + j +");return false'>" + nQTotal + "</a></td>";
		    } else {
		        // get the actual index of the question
	            var nOrder = _oTest.aQuestionPool[i].aOrder[j];
			    // it is not, see if the question has a response
			    if (_oTest.aQuestionPool[i].aQuestions[nOrder].sResponse != "") {
				    // it does, show the question with a response
				    sData += "<td class='QitemReponse'><a href='' onclick='gotoQuestion(" + i + "," + j +");return false'>" + nQTotal + "</a></td>";
			    } else {
				    // it does not, show the questions without a response
				    sData += "<td class='QitemNoReponse'><a href='' onclick='gotoQuestion(" + i + "," + j +");return false'>" + nQTotal + "</a></td>";
			    }
		    }
	    }
    }
    
     if (_nCurrentQuestionPool == _nQuestionPools) {
        // it is, show the question as current
		sData += "<td class='QitemCurrent'><a href='' onclick='gotoQuestion(" + _nQuestionPools + ",0);return false'>" + XsResults + "</a></td>";    
    } else {
        // it does not, show the questions without a response
		sData += "<td class='QitemNoReponse'><a href='' onclick='gotoQuestion(" + _nQuestionPools + ",0);return false'>" + XsResults + "</a></td>";
    }
	
    // add the end row end and start
    sData += "</tr><tr>";
	
	// no response, show no answer
    sData += "<td class='QitemNone'></td>";
	
    // loop through the sections in the test
    for (i=0; i<_nQuestionPools; i++) {
	    for(var j=0; j<_oTest.aQuestionPool[i].nDeliver; j++){
	        // get the actual index of the question
	        var nOrder = _oTest.aQuestionPool[i].aOrder[j];
		    // it is not, see if the question has a response AND NOT(this is not the current selection AND submit-warning)
		    if (_oTest.aQuestionPool[i].aQuestions[nOrder].sResponse != "") {
		        if (_oTest.bTest && !_oTest.bGraded) {
		            // he did, show the correct icon
				    sData += "<td class='QitemCorrect'><a href='' onclick='gotoQuestion(" + i + "," + j +");return false'>" + "<img src='../../Player/Images/kc-ungraded.gif' width='16' height='16' border='0'>" + "</a></td>";
		        } else {
			        // it does, see if the learner provided the correct answer
			        if (_oTest.aQuestionPool[i].aQuestions[nOrder].sResponse == _oTest.aQuestionPool[i].aQuestions[nOrder].sAnswer) {
				        // he did, show the correct icon
				        sData += "<td class='QitemCorrect'><a href='' onclick='gotoQuestion(" + i + "," + j +");return false'>" + "<img src='../../Player/Images/kc-correct.gif' width='16' height='15' border='0'>" + "</a></td>";
			        } else {
				        // incorrect answer, show the incorrect icon
				        sData += "<td class='QitemIncorrect'><a href='' onclick='gotoQuestion(" + i + "," + j +");return false'>" + "<img src='../../Player/Images/kc-incorrect.gif' width='16' height='15' border='0'>" + "</a></td>";
			        }
			    }
		    } else {
			        // no response, show no answer
			        sData += "<td class='QitemNone'><a href='' onclick='gotoQuestion(" + i + "," + j +");return false'>" + "<img src='../../Player/Images/kc-not-attempted.gif' width='14' height='15' border='0'>" + "</a></td>";
		    }
	    }
    }
    
    sData += "<td class='QitemNone'></td>";
	
	sData += "</tr></table>";
	
	// show the table in the div
	document.getElementById("questionList").innerHTML = sData;
}

/***
* goto a specific section
*	nQuestion - the question
***/
function gotoQuestion(nQuestionPool,nQuestion) {
    // evaluate the current question
    evalCurrentQuestion(false);
    
	// change the section number
	_nCurrentQuestion = nQuestion;
	_nCurrentQuestionPool = nQuestionPool;

	// display the question for that section
	gotoPage();
}

/***
* Called when the 'Retake Test' button is clicked.
***/
function RetakeTest() {
	// re-randomize the order of the questions in the pools
	setOrder();
	
	// reset test data
	ResetData();
	
    // go to the next page
    gotoPage();
}

/***
* Called when the 'Grade Test' button is clicked.
***/
function GradeTest() {
    /* the test will go in graded mode */
    _oTest.bGraded = true;
    
    if (_timerTest != null) {
        /* we have, cancel the timer */
        clearInterval(_timerTest);
         
         /* update the time display */
        document.getElementById("timeLimit").innerHTML = XsMsgTime + "0";
    }
    
    // evaluate current displayed question to remember the answer
    evalCurrentQuestion(false);
    
    // reset question pool to 'results' page
    _nCurrentQuestionPool = _nQuestionPools;
    _nCurrentQuestion = 0;

    // go to the 'results' page
    gotoPage();
}

/***
* Reset data saved for the test to allow the user to have a new attempt on the test
***/
function ResetData() {
    // the mode is switched to "ungraded"
    _oTest.bGraded = false;
    // reset timer
    _timerTest = null;
    _oTest.nTotalTime = 0;
    // reset question pool to 'introduction' page
	_nCurrentQuestionPool = -1;
	_nCurrentQuestion = 0;
	
	 // loop through the question pools in the test
    for (i=0; i<_nQuestionPools; i++) {
	    for(var j=0; j<_oTest.aQuestionPool[i].aQuestions.length; j++){
	        // reset question response
	        _oTest.aQuestionPool[i].aQuestions[j].sResponse = "";
	    }
	}
}

/***
* Called when the Next button is clicked.
***/
function NextPage() {
    // evaluate the current question
	evalCurrentQuestion(false);
	
    // increment question count
    setNextQuestion();
	
    // go to the next page
    gotoPage();
}

/***
* Called when the Next button is clicked.
***/
function PrevPage() {
    // evaluate the current question
	evalCurrentQuestion(false);
	
    // decrement question count
    setPrevQuestion();
	
    // go to the next page
    gotoPage();
}

// decrement question count
function setPrevQuestion() {
      // check to see if the current question is not the first one in the current question pool
    if (_nCurrentQuestion > 0) {
        // it is not, increment it
        _nCurrentQuestion--;
    } else {
        // it is, go to the previous question pool
        _nCurrentQuestionPool--;

        // check if the current question pool delivers no questions
        if (_oTest.aQuestionPool[_nCurrentQuestionPool] != undefined &&
            _oTest.aQuestionPool[_nCurrentQuestionPool].nDeliver == 0) {
            // reset the prev question
            setPrevQuestion();
        }

        if (_nCurrentQuestionPool >= 0) {
            // set the last question
            _nCurrentQuestion = _oTest.aQuestionPool[_nCurrentQuestionPool].nDeliver - 1;
        }
    }
}

// increment question count
function setNextQuestion() {
    // check to see if the current question is not the last one in the current question pool
    if (_oTest.aQuestionPool[_nCurrentQuestionPool] != undefined &&
        _nCurrentQuestion < _oTest.aQuestionPool[_nCurrentQuestionPool].nDeliver - 1) {
        // it is not, increment it
        _nCurrentQuestion++;
    } else {
        // it is, go to the next question pool
        _nCurrentQuestionPool++;

        // check if the current question pool delivers no questions
        if (_oTest.aQuestionPool[_nCurrentQuestionPool] != undefined &&
            _oTest.aQuestionPool[_nCurrentQuestionPool].nDeliver == 0) {
            // reset next question
            setNextQuestion();
        }

        // set the first question
        _nCurrentQuestion = 0;
    }
}