
/* =========================================================================================================
 *
 * 	The QUIZ engine, quiz data loader
 *	Heavily modified from original; http://www.e-learningconsulting.com/products/authoring/authoring.html
 *
 * ========================================================================================================= */

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

Handlebars.registerHelper('dump', function (value) {
	return JSON.stringify(value);
});

// merge sub arrays together and iterate in a random order (like each)
Handlebars.registerHelper('randomeach', function(context, subkey, options) {
	var ret = [], ar = [];
	if (arguments.length == 2) {
		$.merge(ar, context);
		options = subkey; // shrink arguments context
	} else {
	  for(var i=0, j=context.length; i<j; i++) {
	  	$.merge(ar, context[i][subkey]);
	  }
	}
	ar.shuffle();
	for(var i=0, j=ar.length; i<j; i++) {
		ret.push(options.fn(ar[i]));
	}
	return ret.join("");
});

// execute a partial template for the question type
// ! loading each question should initialise the appropriate partial type
// {{switch type}}
Handlebars.registerHelper('switch', function(type) {
	var types = ['list', 'fillin', 'dragtolist', 'radio', 'checkbox', 'rank'],
		partial = '';
	for(var i=0,il=types.length; i<il; ++i) {
		if(!type[types[i]]) continue;
		partial = '_partial_' + types[i];
		break;
	}
	if (partial) {
		return Handlebars.partials[name](this);
	} else {
		return '';
	}
});

Handlebars.registerHelper('lengthOf', function (context, add) {
	if (arguments.length == 3) {
		return (context.length + parseInt(add,10));
	} else {
		return context.length;
	}
})

Handlebars.registerHelper('areatag', function(index, label, r, s) {
	// console.log("areatag", index,r,s);
	return label.slice(label.indexOf("<")).replace(/([\ ]?[\/]?)\>/,"")+
		 ' data-r="' + r + '"'+
		 ' data-s="' + s + '"'+
		 ' data-i="' + index + '"'+
		 ' title="' + label.replace(/(<[^>]*>?|[.\s])/g,"") + '"'+
		 '>';
});

// tricky to handle lists in a template, so we do it in code
Handlebars.registerHelper('drag2list', function(requiredAnswer, userResponse, context, readonly) {

	var ar = [];
		ansAr = requiredAnswer.split(";"), // item0:2,4,5;item1:0,1,3
		respAr = userResponse.split(";"), // item0:2,3,4;item1:0,1,2
		correct = (requiredAnswer == userResponse),
		_container = $("<div />"), // helper returns inner html of this object
		outerDiv = $("<div />").addClass("drag2list " + (readonly ? " readonly" : "")).appendTo(_container);

	// context is
	// lists:[label:text,items:[{index:0,value:text}]
	// could be
	// items:[{index:0,value:text}]
	//

	// merge and shuffle possible options
	for (var i=0, j=context.length; i<j; i++) {
		$.merge(ar, context[i]["items"]);
	}
	ar.shuffle();

		var topGrid = $("<div />").addClass("grid").appendTo(outerDiv);
		answersUL = $("<ul />")
					.addClass("drop-target ui-widget col-1-1 list-source")
					.appendTo(topGrid);
		answersUL
				.append($("<li />")
					.addClass("ui-widget-header immovable")
					.text("Drag from here to the lists below:")
				);
	if (!correct) { // remove if we want more distractors than there are answers
		for (var i=0,il=ar.length;i<il;i++) {
			var node = ar[i],
				vis = true;
			if (userResponse.length) {
				for (j=0;j<respAr.length;j++) { //item-name:3,5,7
					if (respAr[j].split(":")[1].indexOf(node.index.toString()) != -1) {
						vis = false;
						break;
					}
				}
			}
			if (vis) {
				$("<li>")
					.addClass("ui-state-default")
					.attr("data-value", node.index)
					.html(node.value)
					.appendTo(answersUL);
			}
		}
	}
	var bottomGrid = $("<div />").addClass("grid").appendTo(outerDiv);
	for (var i=0, il=context.length; i<il; i++) {
		var list = context[i];
		var optionUL = $("<ul />")
						.addClass("drop-target list-answer ui-sortable col-1-" + context.length)
						.attr("data-list", list.label)
						.appendTo(bottomGrid);
		optionUL
				.append($("<li />")
				.addClass("ui-widget-header immovable")
				.text(list.label));

		if (userResponse.length) { // if there are answers
			for (var j=0, jl=ar.length; j<jl; j++) { // loop distractors
				var node = ar[j] // get the node {index: n, value: name }
				for (k=0, kl=respAr.length; k<kl; k++) { // loop through user response array
					var resp = respAr[k].split(":");  //individual response list-name : 3,5,7
					if (resp[0]==list.label) { // if this loops' list is the same as the response
						if (resp[1].indexOf(node.index.toString()) != -1) { // is this node's index in the users response for this item?
							$("<li>")
								.addClass("ui-state-default")
								.attr("data-value", node.index)
								.html(node.value)
								.appendTo(optionUL);
						}
					}
				}
			}
		}
	}

	return _container.html();

});

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
var _showQuizStatus = false; //used to turn off the status message for the quiz

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
    this.aIncorrectQuestions = [];
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
    this.sQuizTitle = "";
    this.sPassedMessage = "";
    this.sFailedMessage = "";
    this.sIncompleteMessage = "";
    this.sCompletedMessage = "";
    this.sContribute = "";
	this.sMaxAttemptMessage = "";
	this.sAttemptMessage = "";
    this.bGraded = false;
    this.bShowStatus = true;
    this.bRestartable = false;

    // custom layout for question index
    this.sIndexLayout = "vertical"; // original table layout is "horizontal";
    this.sRevealAnswers = "always";
	this.nMaxAttempts= 0;
	this.nNumAttempts = 1;
    // check if the test run out of time
    this.timeLimitExpired = function () {
        return this.nTotalTime > this.nTimeLimit;
    }
    // is the check answer button always visible?
    this.bCheckQuestionVisible = false;
	this.bExitVisible = false;
	this.sExitLabel = "Exit quiz";
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

// enum to store whether the question has been looked at
// or marked; value is scorm
var enQuestionStatus = {
	"NOTATTEMPTED": "not-attempted",
	"ATTEMPTED": "attempted",
	"INCORRECT": "incorrect",
	"CORRECT": "correct"
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
	this.enStatus = enQuestionStatus.NOTATTEMPTED;
	this.sLayout = null;
	this.sMedia = null;
}

// loads quiz xml data into html file
function initQuiz(optFileName) {
    _sLanguage = parent._sLanguage;
    _sCurrentPageId = parent._nPageCurrent;
	loadLanguage();
	getTest(optFileName);
	var sData = parent.getState(_sCurrentPageId);
	if (sData != "") { // suspend data
	    reloadState(sData);
	} else {
	    setOrder(); // determines randomisation in pools, stored in suspend data
        if (_oTest.bQuiz || _oTest.bTest) {
            _nCurrentQuestionPool = -1;
        }
	}
	gotoPage(); // uses current page bookmark (stored in suspend data)
}

function startOver() {
	for(var i=0; i<_nQuestionPools;i++){
	    for(var j=0; j<_oTest.aQuestionPool[i].aQuestions.length;j++) {
	    	_oTest.aQuestionPool[i].aQuestions[j].enStatus = enQuestionStatus.NOTATTEMPTED;
	    	_oTest.aQuestionPool[i].aQuestions[j].sResponse = "";
	    }
	}
    _nCurrentQuestionPool = -1; // intro page
    gotoPage();
}

/*********
* set the order for this test, this function is called for the first launch of the test
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
	    if (_oTest.aQuestionPool[i].order != "natural") {
		    _oTest.aQuestionPool[i].aOrder.shuffle();
	    }
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
	if(_oTest.bGraded || aAll[4] - 0 > 1){
		if (aAll[4] - 0){
			_oTest.nNumAttempts = aAll[4] - 0;
		}else{
			_oTest.nNumAttempts = 1
		}
	}else{
		_oTest.nNumAttempts = 1;
	}
	// the fourth order is the curent question pool + _sSep2 + current question
	var aParts = aAll[5].split(_sSep2);
	_nCurrentQuestionPool = aParts[0] - 0;
	_nCurrentQuestion     = aParts[1] - 0;

	var nDeliver = 0;
	// loop through the sections in the test
	try {
	for(var i=0; i<_nQuestionPools;i++){
	    // the third item is the order of questions
	    _oTest.aQuestionPool[i].aOrder = aAll[nDeliver+6+i].split("-");

		//loop through the questions in the section
		for (var j=0; j<_oTest.aQuestionPool[i].nDeliver; j++) {
			// break the pair apart
			aParts = aAll[nDeliver+7+i].split(_sSep2);

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
	} catch (exc) { setOrder(); } // data corrupt (e.g. no pool data), must re-initialise
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
	//save the current attempts
	sData += _oTest.nNumAttempts + _sSep1;
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
			    case "QuestionRankInOrder":
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

    // check overall completion status
    parent.checkCourseCompletion();

}

// load in Language.xml which contains the language strings
function loadLanguage() {
	var oXML = parent.getXmlDocument("../Configuration/Language_" + _sLanguage + ".xml"),
		oAssessment = oXML.getElementsByTagName("assessment"),
		oStrings = oAssessment[0].getElementsByTagName("string");
	for (var i = 0, nLen = oStrings.length; i<nLen; i++) {
		eval(oStrings[i].getAttribute("var") + " = \"" + oStrings[i].firstChild.data + "\"");
	}
	overrideLanguage(parent.__settings);
}

/***
* get the questions from the XMl document
***/
function getTest(optFileName) {
    // get current html file name
    var htmlFileName = window.location.href.substring(window.location.href.lastIndexOf("/") + 1);

	// over-ride the filename to load, if required
    if (typeof optFileName === 'string') htmlFileName = optFileName;

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
	_oTest.nMaxAttempts = (oTest.getAttribute("maxAttempts") != undefined) ? oTest.getAttribute("maxAttempts")-0 : 0;
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
	_oTest.sMaxAttemptMessage = (oTest.getElementsByTagName("maxAttemptsReachedMessage")[0] != undefined)? oTest.getElementsByTagName("maxAttemptsReachedMessage")[0].firstChild.data : "";
	_oTest.sAttemptMessage = (oTest.getElementsByTagName("attemptsMessage")[0] != undefined)? oTest.getElementsByTagName("attemptsMessage")[0].firstChild.data : "";

	// custom title property (if unset falls back on language setting)
	_oTest.sQuizTitle = (oTest.getElementsByTagName("quizTitle")[0] != undefined) ? oTest.getElementsByTagName("quizTitle")[0].firstChild.data : "";

	// custom property - which direction are we rendering the question index?
	_oTest.sIndexLayout = (oTest.getElementsByTagName("indexLayout")[0] != undefined)? oTest.getElementsByTagName("indexLayout")[0].firstChild.data : "vertical";
	_oTest.sRevealAnswers = (oTest.getElementsByTagName("revealAnswers")[0] != undefined)? oTest.getElementsByTagName("revealAnswers")[0].firstChild.data : "always";
	if ((oTest.getAttribute("showStatus") != undefined)) _oTest.bShowStatus = (oTest.getAttribute("showStatus") == "true");
	_oTest.bRestartable = ((oTest.getElementsByTagName("restartable")[0] != undefined)? oTest.getElementsByTagName("restartable")[0].firstChild.data : "false" == "true");

	_oTest.bCheckQuestionVisible = (oTest.getElementsByTagName("checkQuestionVisible")[0] != undefined) ? (oTest.getElementsByTagName("checkQuestionVisible")[0].firstChild.data == "true") : false;
	_oTest.bExitVisible = (oTest.getElementsByTagName("exitButton")[0] != undefined) ? oTest.getElementsByTagName("exitButton")[0].getAttribute("visible")=="true" : false;
	_oTest.sExitLabel = (oTest.getElementsByTagName("exitButton")[0] != undefined) ? oTest.getElementsByTagName("exitButton")[0].firstChild.data : "Exit quiz";

	// get the array of objectives test XML
	var oQuestionPools = oXML.getElementsByTagName("questionPool");

	//loop through all objectives defined in the test xml
	for (var i=0; i < oQuestionPools.length; i++) {
	    //continue only if the node is an 'element', example 1
		if (oQuestionPools[i].nodeType != 1) continue;


		// console.log(oQuestionPools[i]);

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
		// does question shuffles by default, but you can set it to natural ordering
		if (oQuestionPools[i].getAttribute("order") != undefined) {
			_oTest.aQuestionPool[i].order = (oQuestionPools[i].getAttribute("order") == "natural") ? "natural" : "shuffle";
		} else {
			_oTest.aQuestionPool[i].order = "shuffle";
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
			oQuestion.sPrompt = FixPaths(oQuestions[j].getElementsByTagName("prompt")[0].firstChild.data);
			// assign the type
			oQuestion.sType = oQuestions[j].getAttribute("type");
			if (oQuestions[j].getAttribute("layout")) oQuestion.sLayout = oQuestions[j].getAttribute("layout");
			if (oQuestions[j].getElementsByTagName("media")[0]) oQuestion.sMedia = oQuestions[j].getElementsByTagName("media")[0].firstChild.data;
			// 	Handlebars.needsPartial("quiz/area");
			oQuestion.bRandomize = (oQuestions[j].getAttribute("randomize") == "true") ? true : false;

			// see which type we have
			switch (oQuestion.sType) {
				case "QuestionTF":
				case "QuestionChoice":

					// multiple choice with single correct answer (also encompasses TF)
					var oChoices = oQuestions[j].getElementsByTagName("choice");

					// loop through the choices
					for (var k=0; k<oChoices.length; k++) {
						// see if this is the correct answer
						if (oChoices[k].getAttribute("correct") == "true") {
							// it is, remember it
							oQuestion.sAnswer = (k+1) + "";
						}

						// add this choice
						oQuestion.aChoices[k] = FixPaths(oChoices[k].firstChild.data);
					}

					if (oQuestion.sType=="QuestionTF") { // answer is true if first option is true, overwrite answer
						oQuestion.sAnswer = (oChoices[0].getAttribute("correct") == "true") ? "t" : "f";
					}

					// set per-distractor feedback
					var oFeedback = oQuestions[j].getElementsByTagName("feedback");
					for (k=0; k<oFeedback.length; k++) {
						oQuestion.aFeedbacks[k] = oFeedback[k].firstChild.data;
					}

					// set the global feedback
					oQuestion.sFeedbackCorrect = oQuestions[j].getElementsByTagName("feedbackCorrect")[0].firstChild.data;
					oQuestion.sFeedbackIncorrect = oQuestions[j].getElementsByTagName("feedbackIncorrect")[0].firstChild.data;

					break;

				case "QuestionChoiceMultiple":
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
						oQuestion.aChoices[k] = FixPaths(oChoices[k].firstChild.data);
					}

					// get the feedback
					oQuestion.sFeedbackCorrect = oQuestions[j].getElementsByTagName("feedbackCorrect")[0].firstChild.data;
					oQuestion.sFeedbackIncorrect = oQuestions[j].getElementsByTagName("feedbackIncorrect")[0].firstChild.data;
					break;

				case "QuestionMatching":
				    // multiple choice with single correct answer, get the array of choices
					var oChoicesA = oQuestions[j].getElementsByTagName("choiceA");
					var oChoicesB = oQuestions[j].getElementsByTagName("choiceB");
					var aAnswer = new Array();

					// loop through the first column of choices
					for (var k=0; k<oChoicesA.length; k++) {
						// add this choice
						oQuestion.aList[k] = FixPaths(oChoicesA[k].firstChild.data);
						/* build the number-answer pair */
						aAnswer[k] = [k,_aAlpha[k]].join("[.]");
		                // aAnswer[k] = (k + 1) + "[.]" + _aAlpha[k];
					}

		            /* put together all of the answers */
		            oQuestion.sAnswer = aAnswer.join("[,]");

					// loop through the second column of choices
					for (var k=0; k<oChoicesB.length; k++) {
						// add this choice
						oQuestion.aChoices[k] = FixPaths(oChoicesB[k].firstChild.data);
					}

					// get the feedback
					oQuestion.sFeedbackCorrect = oQuestions[j].getElementsByTagName("feedbackCorrect")[0].firstChild.data;
					oQuestion.sFeedbackIncorrect = oQuestions[j].getElementsByTagName("feedbackIncorrect")[0].firstChild.data;
					break;

					//console.log("QuestionMatching", oQuestion);

				case "QuestionFillIn":
				case "QuestionRankInOrder":
					oQuestion.bRandomize = false; // doesn't make sense to

					// QuestionFillIn, get the array of choices
					var oChoices = oQuestions[j].getElementsByTagName("choice");
					var aAnswer = [];

					// loop through the choices
					for (var k = 0; k < oChoices.length; k++) {
						aAnswer.push((oQuestion.sType == "QuestionRankInOrder") ? k : oChoices[k].firstChild.data);
						oQuestion.aChoices[k] = FixPaths(oChoices[k].firstChild.data);
					}

					// comma seperate list of possible answers, ignore case
					oQuestion.sAnswer = aAnswer.join().toLowerCase();

					// get the feedback
					oQuestion.sFeedbackCorrect = oQuestions[j].getElementsByTagName("feedbackCorrect")[0].firstChild.data;
					oQuestion.sFeedbackIncorrect = oQuestions[j].getElementsByTagName("feedbackIncorrect")[0].firstChild.data;
					break;

				case "QuestionDragToList":
					oQuestion.bRandomize = false; // doesn't make sense to

					// get the array of choices
					// answer format: nameA:0,1,3;nameB:2,4,5 - zero base index on choice,
					var oChoices = oQuestions[j].getElementsByTagName("choice");
					var aList = [], aTemp = [];

					// get unique set of lists
					// assumes all choices have a list
					for (var k = 0; k < oChoices.length; k++) {
						aList.push(oChoices[k].getAttribute("list"));
						oQuestion.aChoices[k] = FixPaths(oChoices[k].firstChild.data);
					}

					var arrayUnique = function(a) {
					    return a.reduce(function(p, c) {
					        if (p.indexOf(c) < 0) p.push(c);
					        return p;
					    }, []);
					}
					var aList = arrayUnique(aList);
					// aList = jQuery.unique(aList); // bugged on ipad?

					// for each list, build an array of its answers
					for (var l = 0, ll = aList.length; l < ll; l++) {
						var aAnswer = [];
						for (var m = 0, ml = oChoices.length; m < ml; m++) {
							if (oChoices[m].getAttribute("list") == aList[l]) aAnswer.push(m); // answer value = the choice index: 2,5,6
						}
						aTemp.push([aList[l],aAnswer.join()].join(":")); // name:2,4,5
					}

					// comma seperate list of possible answers, ignore case
					oQuestion.sAnswer = aTemp.join(";"); // nameA:0,1,3;nameB:2,4,5

					// get the feedback
					oQuestion.sFeedbackCorrect = oQuestions[j].getElementsByTagName("feedbackCorrect")[0].firstChild.data;
					oQuestion.sFeedbackIncorrect = oQuestions[j].getElementsByTagName("feedbackIncorrect")[0].firstChild.data;
					break;

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
    _nRequiredCorrect = Math.ceil(_nQuestionsToDeliver * (_oTest.nPassingScore / 100));

   // console.log("oTest", _oTest);
}

/***
* goto the passed page index
***/
function gotoPage() {

   	/* hide the time limit div in case it has styling that would otherwise display (don't know if it is needed yet') */
   	$("#timeLimit").html("");

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

    /* make sure loader isn't spinning still */
    hideSpinner();

	/* display the appropriate page */
	displayPage();
}

/***
* check to see if there is a timeout and update the time display
***/
function hhmmss (n) {
  var h   = Math.floor(n / 3600),
  m = Math.floor((n - (h * 3600)) / 60),
  s = Math.round((n - (h * 3600) - (m * 60)) * 100) / 100;
  return ("0" + h).slice(-2) + ":" + ("0" + m).slice(-2) + ":" + ("0" + s).slice(-2);
}
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
        $("#timeLimit").html(XsMsgTime + "<b>" + hhmmss(nTime) + "</b>");
    }
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

	// cmi.interactions.n.type (“true-false”, “choice”, “fill-in”, “long-fill-in”, “matching”, “performance”, “sequencing”, “likert”, “numeric”, “other”)
	// cmi.interactions.n.result (“correct”, “incorrect”, “unanticipated”, “neutral”, 0.000000)
	if (_oQuestion.sType == "QuestionChoice") var sType = "choice";
	else if (_oQuestion.sType == "QuestionTF") var sType = "true-false";
	else if (_oQuestion.sType == "QuestionMatching") var sType = "matching";
	else if (_oQuestion.sType == "QuestionFillIn") var sType = "fill-in";
	else if (_oQuestion.sType == "QuestionRankInOrder") var sType = "sequencing";
	else if (_oQuestion.sType == "QuestionDragToList") var sType = "other";
	else  var sType = "choice";

	// get the result
	var sResult = "";
	/*
	if (_oQuestion.sType == "QuestionFillIn") {
		if (_oQuestion.sAnswer.indexOf(_oQuestion.sResponse) != -1)
			sResult = "correct";
		else
			sResult = "incorrect";
	} else {
		if (_oQuestion.sResponse == _oQuestion.sAnswer)
			sResult = "correct";
		else
			sResult = "incorrect";
	}
	*/
	// should only get correct or incorrect since we only call this after calculating a question status
	sResult = _oQuestion.enStatus;

	// fix true-false responses to work with SCORM 2004
	var sResponse = _oQuestion.sResponse;
	var sAnswer = _oQuestion.sAnswer;
	if (_oQuestion.sType == "QuestionTF") {
		if (sResponse == "f") sResponse = "false";
		if (sResponse == "t") sResponse = "true";
		if (sAnswer == "f") sAnswer = "false";
		if (sAnswer == "t") sAnswer = "true";
	}

	var sObjectiveID = null;
	if (_oTest.bTest) {
		// set the objective id for this question (if it's a test)
		// sets cmi.interactions.n.objectives.0.id

		sObjectiveID = getTestObjectiveName();

		/*
		if (_oTest.sId != "") { // have we assigned the test an ID ?
			// it does, use it
			sObjectiveID = _oTest.sId;
		} else {
			// use the page Name
			sObjectiveID = parent.getCurrentPageTitle().replace(/[^a-zA_Z0-9]/g,"_");
		}
		sObjectiveID = "Test_" + sObjectiveID;
		// if we allow multiple attempts, set an objective for THIS test attempt
		if (_oTest.nMaxAttempts > 0) {
			sObjectiveID = sObjectiveID + "_Attempt_" + _oTest.nNumAttempts;
		}
		*/
	}

	// set the interaction
	var nObjectiveID = parent.getObjectiveIndex("0", sObjectiveID);

	// bug: objectives are only written after the sco is saved, so
	// finding an index of an objective won't work first time through;
	// in scorm 1.2 we can't save the prompt, so make it and the question id part of the interaction.id
	var sInteractionId = _oQuestion.sId + ";" + _oQuestion.sPrompt.replace(/<(.|\n)*?>/g,"").replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}).replace(/\s/g,"").replace(/[^0-9a-zA-Z]/g,"").substring(0,50);

    // parent.setInteraction(null, returnID(), sType, sResponse, sAnswer, sResult, "1", null, _oQuestion.sPrompt, sObjectiveID, nObjectiveID);
    parent.setInteraction(null, sInteractionId, sType, sResponse, sAnswer, sResult, "1", null, _oQuestion.sPrompt, sObjectiveID, nObjectiveID);
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


/* ------------------------------------------------------------------------------------- */
//			QUESTION DISPLAY
/* ------------------------------------------------------------------------------------- */

// does the display of the question
function displayPage() {
    if (_nCurrentQuestionPool == -1) { // intro page
        showIntroductionPage();
    } else if (_nCurrentQuestionPool == _nQuestionPools) { // results page
        showResults();
    } else { // show the current question
        var nOrder = _oTest.aQuestionPool[_nCurrentQuestionPool].aOrder[_nCurrentQuestion];
        _oQuestion = _oTest.aQuestionPool[_nCurrentQuestionPool].aQuestions[nOrder];
		showQuestionTemplate(_oQuestion.sType);
    }
}

function showQuestionTemplate(questionType) {

	// work out button labels & visibility
	var bPrev = true, sPrev = XsNavPrev,
		bNext = true; sNext = XsNavNext;
	if (!_oTest.bTest && !_oTest.bQuiz) {
			bPrev = false;
			bNext = false;
	} else {
        if (_nCurrentQuestionPool == -1) { // introduction
			bPrev = false;
			sNext = _oTest.bQuiz ? XsQuizNavFirst : XsTestNavFirst;
	    }
	    if (_nCurrentQuestionPool == _nQuestionPools) { // results
	    	bNext = false;
	    }
	    if (_nCurrentQuestionPool == 0 && _nCurrentQuestion == 0) { // first question
	        sPrev = XsNavIntro;
	    }
	    if (_nCurrentQuestionPool == _nQuestionPools - 1 && _nCurrentQuestion == _oTest.aQuestionPool[_nCurrentQuestionPool].nDeliver - 1) { // last question
	        sNext = XsNavResults;
	    }
		if (_oTest.bTest && maxAttemptsAchieved()) {
			bPrev = false;
			bNext = false;
		}
	}

	// build the question json blobs, which might be different based on the question type
	// also checks the answer logic to build the response text
	var _instruction = "",
		_feedback = "",
		_marked = false,
		_answered = false,
		_icon = "remove",
		_text = "",
		_rows = [],
		_questionLayout = "stack",
		_questionMedia = "",
		bGradeVisible = true;

	if (_oQuestion.sLayout) _questionLayout = _oQuestion.sLayout;
	if (_oQuestion.sMedia) _questionMedia = _oQuestion.sMedia;

	switch(questionType) {

		case "QuestionTF":
			if (_oTest.bGraded) {
			    _instruction = XsMsgDirectionsNoResponse;
			} else {
			    _instruction = (_oTest.bTest ? XsMsgDirectionsTestTF : XsMsgDirectionsTF);
			}
			if (_oQuestion.sResponse != "") {
				_answered = true;
				if (_oTest.bGraded && canRevealAnswer()) {
					_marked = true;
				    if (_oQuestion.sResponse == _oQuestion.sAnswer) { // true
				    	_feedback = _oQuestion.sFeedbackCorrect;
				    	_text = XsFeedbackCorrect;
				    	_icon = "ok colour-correct"; // icon-ok is TICK
				    } else {
				        // build the correct answer string
				        var sTF = _oQuestion.sAnswer == 't' ? _oQuestion.aChoices[0] : _oQuestion.aChoices[1] // XsMsgTrue : XsMsgFalse;
				        var sCorrectIs = " " + XsCorrectIs + " " + sTF + ".";
				    	_feedback = _oQuestion.sFeedbackIncorrect;
				    	_text = XsFeedbackIncorrect + sCorrectIs;
				    	_icon = "remove colour-incorrect"; // icon-remove is X
				    }
				}
			}
			_rows.push({
				"readonly": _oTest.bTest && _oTest.bGraded,
				"type": "radio",
				"selected": (_oQuestion.sResponse == "t"),
				"value": "t",
				"response": _oQuestion.sResponse,
				"label": _oQuestion.aChoices[0] // XsMsgTrue
			});
			_rows.push({
				"readonly": _oTest.bTest && _oTest.bGraded,
				"type": "radio",
				"selected": (_oQuestion.sResponse == "f"),
				"value": "f",
				"response": _oQuestion.sResponse,
				"label": _oQuestion.aChoices[1] // XsMsgFalse
			});
			break;

        case "QuestionChoice":
			if (_oTest.bGraded) {
			    _instruction = XsMsgDirectionsNoResponse;
			} else {
			    _instruction = (_oTest.bTest ? XsMsgDirectionsTestMC : XsMsgDirectionsMC);
			}
			var numChoices = _oQuestion.aChoices.length;
			if (_oQuestion.aChoiceRand == null) { // answer sequence not yet stored
				_oQuestion.aChoiceRand = new Array();
				for (i=0; i<numChoices; i++) _oQuestion.aChoiceRand[i] = i + 1;
				if (_oQuestion.bRandomize == true) { // if we randomise the distractors
					_oQuestion.aChoiceRand.shuffle();
				}
			}
			if (_oQuestion.sResponse != "") {
				_answered = true;
				if (_oTest.bGraded && canRevealAnswer()) {
					_marked = true;
				    if (_oQuestion.sResponse == _oQuestion.sAnswer) { // true
				    	_feedback = _oQuestion.aFeedbacks[_oQuestion.sResponse-1];
				    	_text = XsFeedbackCorrect;
				    	_icon = "ok colour-correct"; // icon-ok is TICK
				    } else {
				        // build the correct answer string
					    var sCorrectIs = "";
			            for (i=0; i<_oQuestion.aChoiceRand.length; i++) {
			                if (_oQuestion.aChoiceRand[i] == _oQuestion.sAnswer) {
		                        sCorrectIs = " " + XsCorrectIs + " " + _aAlpha[i] + ".";
		                        break;
			                }
			            }
				    	_feedback = _oQuestion.aFeedbacks[_oQuestion.sResponse-1];
				    	_text = XsFeedbackIncorrect + sCorrectIs;
				    	_icon = "remove colour-incorrect"; // icon-remove is X
				    }
				}
			}
			for (i=0; i<numChoices; i++) {
				var nChoice = _oQuestion.aChoiceRand[i];
				_rows.push({
					"readonly": _oTest.bTest && _oTest.bGraded,
					"type": "radio",
					"selected": (_oQuestion.sResponse == nChoice),  //_oQuestion.sAnswer),
					"value": nChoice,
					"response": _oQuestion.sResponse,
					"label": [_aAlpha[i], _oQuestion.aChoices[nChoice - 1]].join(". ")
				});
			}
			break;

        case "QuestionChoiceMultiple":
			if (_oTest.bGraded) {
			    _instruction = XsMsgDirectionsNoResponse;
			} else {
			    _instruction = (_oTest.bTest ? XsMsgDirectionsTestMCM : XsMsgDirectionsMCM);
			}
			var numChoices = _oQuestion.aChoices.length;
			if (_oQuestion.aChoiceRand == null) { // answer sequence not yet stored
				_oQuestion.aChoiceRand = new Array();
				for (i=0; i<numChoices; i++) _oQuestion.aChoiceRand[i] = i + 1;
				if (_oQuestion.bRandomize == true) { // if we randomise the distractors
					_oQuestion.aChoiceRand.shuffle();
				}
			}
			if (_oQuestion.sResponse != "") {
				_answered = true;
				if (_oTest.bGraded && canRevealAnswer()) {
					_marked = true;
				    if (_oQuestion.sResponse == _oQuestion.sAnswer) { // true
				    	_feedback = _oQuestion.sFeedbackCorrect;
				    	_text = XsFeedbackCorrect;
				    	_icon = "ok colour-correct"; // icon-ok is TICK
				    } else {
			            var aAnswers = _oQuestion.sAnswer.split(','),
			            	sCorrectIs = [];
						for (j=0;j<_oQuestion.aChoiceRand.length;j++) {
							for (var i=0;i<aAnswers.length;i++) {
								if (_oQuestion.aChoiceRand[j]==aAnswers[i]) {
									sCorrectIs.push(String.fromCharCode(65 + j));
									break;
								}
							}
						}
			            sCorrectIs = " " + XsCorrectIs + " " + sCorrectIs.join(", ");
				    	_feedback = _oQuestion.sFeedbackIncorrect;
				    	_text = XsFeedbackIncorrect + sCorrectIs;
				    	_icon = "remove colour-incorrect"; // icon-remove is X
				    }
				}
			}
			var aResponse = _oQuestion.sResponse.split(','); // learner saved resposes
			for (i=0; i<numChoices; i++) {
				var nChoice = _oQuestion.aChoiceRand[i], bSelected = false;
				if (_oQuestion.sResponse != "") {
					for (var j=0; j<aResponse.length; j++) {
						if (nChoice == aResponse[j]) {
							bSelected = true;
							break;
						}
					}
				}
				// nChoice
				_rows.push({
					"readonly": _oTest.bTest && _oTest.bGraded,
					"type": "checkbox",
					"selected": bSelected,
					"value": nChoice,
					"label": [_aAlpha[i], _oQuestion.aChoices[nChoice - 1]].join(". ")
				});
			}
			break;

        case "QuestionMatching":
			if (_oTest.bGraded) {
			    _instruction = XsMsgDirectionsNoResponse;
			} else {
			    _instruction = (_oTest.bTest ? XsMsgDirectionsTestMCM : XsMsgDirectionsMCM);
			}
			var numChoices = _oQuestion.aChoices.length;
			if (_oQuestion.aChoiceRand == null) { // answer sequence not yet stored
				_oQuestion.aChoiceRand = new Array();
				for (i=0; i<numChoices; i++) _oQuestion.aChoiceRand[i] = i + 1;
				_oQuestion.aChoiceRand.shuffle();
			}
			if (_oQuestion.sResponse != "") {
				_answered = true;
				if (_oTest.bGraded && canRevealAnswer()) {
					_marked = true;
				    if (_oQuestion.sResponse == _oQuestion.sAnswer) { // true
				    	_feedback = _oQuestion.sFeedbackCorrect;
				    	_text = XsFeedbackCorrect;
				    	_icon = "ok colour-correct"; // icon-ok is TICK
				    } else {
				    	_feedback = _oQuestion.sFeedbackIncorrect;
				    	_text = XsFeedbackIncorrect;
				    	_icon = "remove colour-incorrect"; // icon-remove is X
				    }
				}
			}
			var aResponse = _oQuestion.sResponse.split('[,]'),
				aLeft = [],
				aRight = [];
			for (i=0; i<numChoices; i++) {
				var nChoice = _oQuestion.aChoiceRand[i] - 1; // the randomised position for this index
				if (_answered) { // the stored answer is an ALPHA, so we turn that into an INT
					nChoice = parseInt(aResponse[i].split("[.]")[1].charCodeAt(0)-65,10);
				}
				aLeft[i] = {
					"label": _oQuestion.aList[i]
				};
				aRight[i] = {
					"label": _oQuestion.aChoices[nChoice],
					"value": _aAlpha[nChoice]
				};
			}
			_rows.push({
				"readonly": _oTest.bTest && _oTest.bGraded,
				"type": "list",
				"left": aLeft,
				"right": aRight,
				"value": _oQuestion.sResponse,
				"label": _oQuestion.aChoices[nChoice - 1]
			});
			break;

        case "QuestionFillIn":
			if (_oTest.bGraded) {
			    _instruction = XsMsgDirectionsNoResponse;
			} else {
			    _instruction = (_oTest.bTest ? XsMsgDirectionsTestFI : XsMsgDirectionsFI);
			}
			if (_oQuestion.sResponse != "") {
				_answered = true;
				if (_oTest.bGraded && canRevealAnswer()) {
					_marked = true;
				    if ($.inArray(_oQuestion.sResponse, _oQuestion.sAnswer.split(",")) != -1) { // true
				    	_feedback = _oQuestion.sFeedbackCorrect;
				    	_text = XsFeedbackCorrect;
				    	_icon = "ok colour-correct"; // icon-ok is TICK
				    } else {
				    	_feedback = _oQuestion.sFeedbackIncorrect;
				    	_text = XsFeedbackIncorrect;
				    	_icon = "remove colour-incorrect"; // icon-remove is X
				    }
				}
			}
			_rows.push({
				"readonly": _oTest.bTest && _oTest.bGraded,
				"type": "fillin",
				"expected": _oQuestion.sAnswer,
				"value": _oQuestion.sResponse,
				"label": XsMsgAnswerFI
			}); // _oQuestion.aChoices[nChoice - 1]
			break;

		case "QuestionDragToList":
			if (_oTest.bGraded) {
			    _instruction = XsMsgDirectionsNoResponse;
			} else {
			    _instruction = XsMsgDirectionsD2L; // new
			}
			if (_oQuestion.sResponse != "") {
				_answered = true;
				if (_oTest.bGraded && canRevealAnswer()) {
					_marked = true;
					// list:1,2,3 ; list2:4,5,6 // order index

				    if (_oQuestion.sResponse == _oQuestion.sAnswer) { // true
				    	_feedback = _oQuestion.sFeedbackCorrect;
				    	_text = XsFeedbackCorrect;
				    	_icon = "ok colour-correct"; // icon-ok is TICK
				    } else {
				    	_feedback = _oQuestion.sFeedbackIncorrect;
				    	_text = XsFeedbackIncorrect;
				    	_icon = "remove colour-incorrect"; // icon-remove is X
				    }
				}
			}
			// ! slightly overcomplicated list structure, revise
			// _oQuestion.sAnswer = aTemp.join(";"); // nameA:0,1,3;nameB:2,4,5
			var aAnswers = _oQuestion.sAnswer.split(";"),
				aResponse = _oQuestion.sResponse.split(";"),
				aLists = [];
			for (var i=0, il=aAnswers.length;i<il;i++) {
				var aList = aAnswers[i].split(":"),
					aItems = aList[1].split(","),
					oItems = [];
				for (var j=0,jl=aItems.length;j<jl;j++) {
					oItems.push({
						"index": aItems[j]-0,
						"value": _oQuestion.aChoices[aItems[j]-0]
					});
				}
				aLists.push({
					"label": aList[0],
					"response": (aResponse[i]) ? aResponse[i].split() : [],
					"items": oItems
				});
			};
			_rows.push({
				"readonly": _oTest.bTest && _oTest.bGraded,
				"type": "dragtolist",
				"expected": _oQuestion.sAnswer,
				"value": _oQuestion.sResponse,
				"label": XsMsgAnswerFI,
				"lists": aLists
			});
			break;

		case "QuestionRankInOrder":
			if (_oTest.bGraded) {
			    _instruction = XsMsgDirectionsNoResponse;
			} else {
			    _instruction = XsMsgDirectionsRIO; // new
			}
			var numChoices = _oQuestion.aChoices.length;
			if (_oQuestion.aChoiceRand == null) { // answer sequence not yet stored
				_oQuestion.aChoiceRand = new Array();
				for (i=0; i<numChoices; i++) _oQuestion.aChoiceRand[i] = i + 1;
				_oQuestion.aChoiceRand.shuffle();
			}
			if (_oQuestion.sResponse != "") {
				_answered = true;
				if (_oTest.bGraded && canRevealAnswer()) {
					_marked = true;
				    if (_oQuestion.sResponse == _oQuestion.sAnswer) { // 3,4,1,2,0 == 0,1,2,3,4 ?
				    	_feedback = _oQuestion.sFeedbackCorrect;
				    	_text = XsFeedbackCorrect;
				    	_icon = "ok colour-correct"; // icon-ok is TICK
				    } else {
			            var aAnswers = _oQuestion.sAnswer.split(','),
			            	sCorrectIs = "";
			            for (i = 0; i < aAnswers.length; i++) {
			                for (j = 0; j < _oQuestion.aChoiceRand.length; j++) {
			                    if (_oQuestion.aChoiceRand[j]-1 == aAnswers[i]) {
			                        sCorrectIs += _aAlpha[j];
			                        break;
			                    }
			                }
			            }
			            sCorrectIs = " " + XsCorrectIs + " " + sCorrectIs.split('').sort().join(', ');
				    	_feedback = _oQuestion.sFeedbackIncorrect;
				    	_text = XsFeedbackIncorrect + ' ' + sCorrectIs;
				    	_icon = "remove colour-incorrect"; // icon-remove is X
				    }
				}
			}

			var aItems = [],
				aResponse = _oQuestion.sResponse.split(',');
			for (i=0; i<numChoices; i++) {
				var nChoice = _oQuestion.aChoiceRand[i] - 1; // the randomised position for this index
				if (_answered) { // the stored answer is an ALPHA, so we turn that into an INT
					nChoice = parseInt(aResponse[i],10);
				}
				aItems[i] = {
					"index": nChoice,
					"label": _oQuestion.aChoices[nChoice],
					"alpha": (_marked ? _aAlpha[nChoice] + ". " : "")
				};
			}
			_rows.push({
				"readonly": _oTest.bTest && _oTest.bGraded,
				"type": "rank",
				"expected": _oQuestion.sAnswer,
				"value": _oQuestion.sResponse,
				"items": aItems,
				"response": _oQuestion.sResponse.split(","), // saved response order
				"label": XsMsgAnswerFI
			}); // _oQuestion.aChoices[nChoice - 1]			break;


	}

	// if restartable, don't reveal the answer (it's still marked, but if we modify it here it's only the template affected)
	if (_oTest.bRestartable && _oTest.bQuiz) {
		_marked = false;
	}

	// Hide results button on a graded test so you have to press Grade
	if (isLastQuestion() && _oTest.bTest && !_oTest.bGraded) {
		bNext = false;
	};

	// Hide the Grade button until the last question
	bGradeVisible = !_oTest.bGraded && !bNext;

	// pull the data together and build the template using handlebars
	var oQuestionJson = {
		"question": {
			"title": getPageNumber(),
			"text": _oQuestion.sPrompt,
			"instruction": _answered ? "" : _instruction,
			"type": questionType,
			"layout": _questionLayout,
			"media": _questionMedia
		},
		"response": {
			"answered": _answered,
			"marked": _marked,
			"icon": _icon,
			"text": _text,
			"feedback": _feedback
		},
		"buttons": {
			"check": {
				"visible": (!(_oTest.bTest || (_oTest.bRestartable && _oTest.bQuiz))) || _oTest.bCheckQuestionVisible,
				"text": XsMsgCheck
			},
			"precede": {
				"visible": bPrev,
				"text": sPrev
			},
			"advance": {
				"visible": bNext,
				"text": sNext
			},
			"showgrade": {
				"visible": bGradeVisible,
				"text": XsNavGradeTest
			},
			"retake": {
				"visible": (_oTest.bTest && _oTest.bGraded && (_oTest.nMaxAttempts > 0 && _oTest.nNumAttempts < _oTest.nMaxAttempts) ),
				"text": XsNavRetakeTest
			}
		},
		"answer" : _rows
	};
	// console.log("rendering question", oQuestionJson);
	$("#question").html(Handlebars.getCompiledTemplate("quiz/question", oQuestionJson));

	$(document).trigger("display-question"); // re-bind jquery

	// show the sumary information
	showQuestionList();

}

/* ------------------------------------------------------------------------------------- */
//			MARKING
/* ------------------------------------------------------------------------------------- */
function evalCurrentQuestion(bDisplay) {
    if (bDisplay) {
        if (_nCurrentQuestionPool == -1) { // intro page
            showIntroductionPage();
            return;
        }
        if (_nCurrentQuestionPool == _nQuestionPools) { // results page
            showResults();
            return;
        }
    }

    // see if we are on a question page
    if (_nCurrentQuestionPool > -1 && _nCurrentQuestionPool < _nQuestionPools)  {
    	evalQuestionTemplate(_oQuestion.sType, bDisplay);
	}
}

function evalQuestionTemplate(questionType, bDisplay) {
	var sPrevAnswer = _oQuestion.sResponse;
	switch (questionType) {
		case "QuestionTF":
		case "QuestionChoice":
		case "QuestionChoiceMultiple":
			var ans = $("#answers :checked");
			if (ans.length == 0) {
				_oQuestion.sResponse = "";
			} else {
				_oQuestion.sResponse = ans.map(function() {
					return $(this).val();
				}).get().sort().join(","); // works on single or multiple items
			}
			break;

		case "QuestionMatching":
			var ar = [], $these = $(".match-these li"), $to = $(".match-to li");
			for (var i=0, l=$to.length;i<l;i++) {
				ar[i] = [$to.eq(i).attr("data-value"),$these.eq(i).attr("data-value")].join("[.]");
			}
			_oQuestion.sResponse = ar.join("[,]");
			break;

		case "QuestionRankInOrder":
			var ar = [], $these = $(".drag-these li");
			for (var i=0, l=$these.length; i<l; i++) {
				ar.push($these.eq(i).attr("data-value"));
			}
			_oQuestion.sResponse = ar.join(",");
			break;

		case "QuestionFillIn":
			_oQuestion.sResponse = $.trim($(":text").val()).toLowerCase();
			break;

		case "QuestionDragToList":
			var ar = [], $lists = $(".drag2list ul[data-list]");
			for (var i=0, l=$lists.length; i<l; i++) {
				var _order = [];
				$("li:not(.immovable)", $lists[i]).each(function (index, el) {
					_order.push($(el).attr("data-value"));
				})
				ar.push([$($lists[i]).attr("data-list"),_order.sort()].join(":"));
			}
			_oQuestion.sResponse = ar.join(";");
			break;
	}

	if (_oTest.bTest) {
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

	setMarkingStatus(_oQuestion);

	/* report the interaction to SCORM */
	reportInteraction(sPrevAnswer);

	/* redisplay the question */
	if (bDisplay) {
		showQuestionTemplate(questionType);
	}

	// learner responded so return true;
	return true;

}

function setMarkingStatus(objQuestion) {
    if (objQuestion.sResponse != "") {
        if (_oTest.bTest && !_oTest.bGraded) {
        	objQuestion.enStatus = enQuestionStatus.ATTEMPTED;
        } else {
        	if ((objQuestion.sType == "QuestionFillIn") && $.inArray(objQuestion.sResponse, objQuestion.sAnswer.split(",")) != -1) {
	        	objQuestion.enStatus = enQuestionStatus.CORRECT;
        	} else if (objQuestion.sResponse == objQuestion.sAnswer) {
	        	objQuestion.enStatus = enQuestionStatus.CORRECT;
	        } else {
	        	objQuestion.enStatus = enQuestionStatus.INCORRECT;
	        }
	    }
    }
}

/* --------------------------------------------------------------------------- */
//		INTRO & RESULTS
/* --------------------------------------------------------------------------- */

function showIntroductionPage(){
	var _attempts = "";
	if (_oTest.nMaxAttempts > 0 && !_oTest.bQuiz){
		_attempts = _oTest.sAttemptMessage.replace(/%%attempts/g, _oTest.nNumAttempts).replace(/%%maxattempts/g, _oTest.nMaxAttempts);
	}

	$("#question").html(Handlebars.getCompiledTemplate("quiz/intro", {
		"test" : {
			"title": _oTest.sQuizTitle ? _oTest.sQuizTitle : _oTest.bQuiz ? XsQuizIntroTitle : XsTestIntroTitle,
			"instruction": _oTest.sIntroduction.length ? _oTest.sIntroduction : _oTest.bQuiz ? XsIntroQuiz : XsIntroTest,
			"attempts": _attempts
		},
		"buttons": {
			"showgrade": {
				"visible": false, // on intro page (_oTest.bTest && !_oTest.bGraded),
				"text": XsNavGradeTest
			},
			"retake": {
				"visible": false,
				"text": XsNavRetakeTest
			},
			"start": {
				"text" : _oTest.bQuiz ? XsQuizNavFirst : XsTestNavFirst
			}
		}
	}));

	$(document).trigger("bind-buttons");

	showQuestionList();
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
    _oTest.aIncorrectQuestions = [];

    var nCount = 0, sCause = "";
    /* loop through the questions and score the test */
    for (var i = 0; i < _nQuestionPools; i++) {
        for (var j = 0; j < _oTest.aQuestionPool[i].nDeliver; j++) {
            // get the current question
            var oQuestion = _oTest.aQuestionPool[i].aQuestions[_oTest.aQuestionPool[i].aOrder[j]];

            if (!oQuestion) continue; // maybe bad data?

            // see if we have the correct answer for the selected question
            // fill-in has a one response could be in many answers relationship
            // it is, increment the score
            /*
		   	if ((oQuestion.sType == "QuestionFillIn") && $.inArray(oQuestion.sResponse, oQuestion.sAnswer.split(",")) != -1) {
                _oTest.nTotalScore += nEach;
                _oTest.nCorrect++;
                _oTest.nAnswered++;

			} else if (oQuestion.sResponse == oQuestion.sAnswer) {
                _oTest.nTotalScore += nEach;
                _oTest.nCorrect++;
                _oTest.nAnswered++;
             */
            if (oQuestion.enStatus == enQuestionStatus.CORRECT) {

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
                    sCause = "incorrect";
                } else {
                    // sQuestionPormpt += " " + XsNoAnswer;
                    sCause = "noanswer";
                }
                // build the question link - nCount isn't the order of the question though ... ?
                _oTest.aIncorrectQuestions.push({
                	"index": nCount,
                	"pool": i,
                	"question": j,
                	"text": sQuestionPormpt,
                	"cause": sCause
                }); // '<li><span class="index">' + nCount + '</span>. <a href="#" data-pool="' + i + '" data-question="' + j + '">' + sQuestionPormpt + '</a></li>');
            }
        }
    }

    // return the score as an integer
    // console.log("so the total score is now ", _oTest.nTotalScore, "questions:", _oTest.nCorrect);
    // _oTest.nTotalScore = Math.round(_oTest.nTotalScore + .5);

    // make sure we can't have a higher score that 100%
    //if (_oTest.nTotalScore > 100)
    //    _oTest.nTotalScore = 100;

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

            /* console.log("FAILED LOGIC", {
	           "incorrect": _oTest.nIncorrect,
	           "todeliver": _nQuestionsToDeliver,
	           "requiredcorrect": _nRequiredCorrect,
	           "maxattempts": maxAttemptsAchieved(),
	           "totalscore": _oTest.nTotalScore,
	           "passingscore": _oTest.nPassingScore
	        }); */

            if ((_oTest.nIncorrect > (_nQuestionsToDeliver - _nRequiredCorrect)) || (maxAttemptsAchieved() && _oTest.nTotalScore <= _oTest.nPassingScore )) {
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

// this function returns the author message depending on the current passing status
function getAuthorMessage() {
    var sMessage = ""; // author message

    switch (_oTest.sPassStatus) {
        case "P":
            // passed message
            sMessage = _oTest.sPassedMessage; //.replace(/%%score/g, _oTest.nTotalScore);
            break;
        case "F":
            // fail message
            sMessage = _oTest.sFailedMessage; //.replace(/%%score/g, _oTest.nTotalScore);
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
function maxAttemptsAchieved(){
	return (_oTest.bGraded && _oTest.nMaxAttempts > 0 && _oTest.nNumAttempts >= _oTest.nMaxAttempts)? true : false;
}

function getTestObjectiveName() {
	var sObjectiveID = null;
	if (_oTest.bTest) {
		if (_oTest.sId !== "") {
			sObjectiveID = "Test:" + _oTest.sId;
		} else {
			sObjectiveID = "Test:" + parent.getCurrentPageTitle().replace(/<(.|\n)*?>/g,"").replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}).replace(/\s/g,"").replace(/[^0-9a-zA-Z]/g,"").substring(0,50);
		}
		if (_oTest.nMaxAttempts > 0) {
			sObjectiveID += ";Attempt:" + _oTest.nNumAttempts;
		}
		sObjectiveID = sObjectiveID.replace(/\_{2,}/g,"_");
	}
	//console.log("getTestObjectiveName", sObjectiveID, _oTest);
	return sObjectiveID;
}

function showResults() {
	$("#testStatus").html("");
    // show the sumary information
	showQuestionList();
	calcTest(); // drawing questions will have updated question object states, so recalc test
	var _title = XsSummaryTitle.replace(/%%type/g, _oTest.sTestType),
		_attempts = "",
		_message = [getAuthorMessage()],
		_missing = false,
		_completionStatus = "",
		_passed = false,
		sData = "",
		sObjectiveID = getTestObjectiveName(); //   parent.getCurrentPageId();

    if (_oTest.bTest && !_oTest.bGraded) { // ungraded quiz
        // add the info text
        _completionStatus = XsSummaryUngraded;
        _message = [_completionStatus];


    } else if (_oTest.bTest && _oTest.bGraded) { // test
    	if (maxAttemptsAchieved()) {
    		_attempts = _oTest.sMaxAttemptMessage.replace(/%%maxattempts/g, _oTest.nMaxAttempts) + ' ' +_oTest.sPassStatus;
    		_completionStatus = _attempts;

    	} else if  (_oTest.aIncorrectQuestions.length) {
			_missing = true;
    	}

		// if (_oTest.sId != "") { // override with specific objective set in this test
		// 	sObjectiveID = _oTest.sId;
		// }

		// set the objective
		// parent.setObjective(parent.getObjectiveIndex("0", parent.getCurrentPageId()), sObjectiveID, "completed", null, _oTest.nTotalScore>=_oTest.nPassingScore?"passed":"failed", (_oTest.nTotalScore/100)+"", null);
		parent.setObjective(parent.getObjectiveIndex("0", sObjectiveID), sObjectiveID, "completed", null, _oTest.nTotalScore>=_oTest.nPassingScore?"passed":"failed", (_oTest.nTotalScore/100)+"", null);

   } else { // quiz

        // display the quiz results depending on the current test contribute
        if  (_oTest.sContribute == "v") {
        	_message.push(XsQuizSummaryCorrectCompleted);
        	_completionStatus = XsQuizSummaryCorrectCompleted;

        } else if (_oTest.sContribute == "c") {
            _message.push(XsQuizRequiredAll);
           // _message.push(XsAnsweredQuestions);

            // check to see if the user completed the quiz
            if (_oTest.nAnswered == _nQuestionsToDeliver) { // complete
                _completionStatus = XsQuizSummaryCompleted;
            } else { // incomplete
                _completionStatus = XsQuizSummaryIncomplete;
            }
            _message.push(_completionStatus);

        } else {
             _message.push(XsQuizRequiredMust.replace(/%%total/g, _nRequiredCorrect));

            // get the user score
            var nUserScore = Math.ceil((_oTest.nCorrect / _nQuestionsToDeliver) * 100)
            // console.log("user score", nUserScore);
            if (nUserScore >= _oTest.nPassingScore) {
                _completionStatus = XsQuizSummaryPassed;
            } else {
                _completionStatus = XsQuizSummaryFailed;
            }
            _message.push(_completionStatus);
        }
    }

    var m = $.map(_message, function (b) {
	    		return "<p>" + b.replace(/<(?:.|\n)*?>/gm, "")
	    			.replace(/%%correct/g, _oTest.nCorrect)
    				.replace(/%%answered/g, _oTest.nAnswered)
    				.replace(/%%total/g, _nQuestionsToDeliver)
    				.replace(/%%score/g, _oTest.nTotalScore) + "</p>";
    		});

	$("#question").html(Handlebars.getCompiledTemplate("quiz/results", {
		"summary": {
			"title": _title,
			"kind": _oTest.sTestType,
			"messages" : m.join(""),
			"score": Math.round(_oTest.nTotalScore),
			"passmark": _oTest.nPassingScore,
			"correct": _oTest.nCorrect,
			"answered": _oTest.nAnswered,
			"required": _nQuestionsToDeliver,
			"maxattempts": _oTest.nMaxAttempts,
			"contribute": _oTest.sContribute
		},
		"missed": {
			"visible": _missing,
			"title": XsMissedQuestions,
			"items": _oTest.aIncorrectQuestions
		},
		"buttons": {
			"precede": {
				"visible": (!_oTest.bGraded),
				"text": XsNavPrev
			},
			"retake": {
				"visible": (_oTest.bTest && _oTest.bGraded && (_oTest.nMaxAttempts > 0 && _oTest.nNumAttempts < _oTest.nMaxAttempts) ),
				"text": XsNavRetakeTest
			},
			"showgrade": {
				"visible": (!_oTest.bGraded),
				"text": XsNavGradeTest
			},
			"restart": {
				"visible": _oTest.bRestartable && _oTest.bQuiz,
				"text": "Restart " + _oTest.sTestType
			},
			"exit": {
				"visible": _oTest.bExitVisible,
				"text": _oTest.sExitLabel
			}
		}
	}));

	updateTestStatusBar();

	$("#your-score .bar").css("width", _oTest.nTotalScore + "%");
	$("#pass-mark .bar").css("width", _oTest.nPassingScore + "%");

	$(document).trigger("bind-buttons");

	$("#missing a").click(function (event) {
		event.preventDefault();
		var $this = $(this);
		gotoQuestion(parseInt($this.attr("data-pool"),10), parseInt($this.attr("data-question"),10));
	});

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

function isLastQuestion() {
    var _nQuestionCount = 0;
    for(var i = 0; i<_nCurrentQuestionPool; i++) {
        _nQuestionCount += _oTest.aQuestionPool[i].nDeliver;
    }
    _nQuestionCount += _nCurrentQuestion + 1;
    return (parseInt(_nQuestionCount,10) === parseInt(_nQuestionsToDeliver,10));
}


/***
* Check if user has reached max attempts in this test
***/
function hasReachedMaxAttempts(){
	if (_oTest.bGraded) {
		if (_oTest.nNumAttempts >= _oTest.nMaxAttempts) return true;
	}
	return false;
}

/***
* get the test status string
***/
// function getTestStatusText() {
function updateTestStatusBar() {
    var lang = _oTest.bTest ? "Test" : "Quiz";

	if (_oTest.nMaxAttempts > 0 && !_oTest.bQuiz){
		$("#attemptStatus").html("Attempt " + _oTest.nNumAttempts + " of " + _oTest.nMaxAttempts);
	}

    switch (_oTest.sContribute) {
        case "v":
        	$("#testRequires").html(lang + " must be started");
            // line1MustDo = _oTest.bTest ? XsTestVisitChoiceStatus : XsQuizVisitChoiceStatus;
            break;
        case "c":
        	$("#testRequires").html(lang + " must be completed");
            // line1MustDo = _oTest.bTest ? XsTestCompleteChoiceStatus : XsQuizCompleteChoiceStatus;
            break;
        case "p":
        	$("#testRequires").html(lang + " passing score: " + _oTest.nPassingScore + "%");
            //line1MustDo = _oTest.bTest ? XsTestPassChoiceStatus.replace(/%%score/g, _oTest.nPassingScore + "%") : XsQuizPassChoiceStatus.replace(/%%score/g, _oTest.nPassingScore + "%");
            break;
        default: // same as case "n":
        	$("#testRequires").html(lang + " completion is optional");
            // line1MustDo = _oTest.bTest ? XsTestNoChoiceStatus : XsQuizNoChoiceStatus;
            break;
    }

// console.log("updateTestStatusBar", _oTest);

    // display the second line only if the test is in grade mode and the contribute is not 'visit'
    if (_oTest.bGraded) {
        if (_oTest.bQuiz && _oTest.sContribute == "v") {
	        $("testStatus").html("");
        } else if (!_showQuizStatus) {
            switch (_oTest.sPassStatus) {
                case "P":
	                $("#testStatus").html(lang + " passed");
                    // line2HasDone = _oTest.bTest ? XsTestPassed : XsQuizPassed;
                    break;
                case "I":
	                $("#testStatus").html(lang + " incomplete");
                    // line2HasDone = _oTest.bTest ? XsTestIncomplete : XsQuizIncomplete;
                    break;
                case "F":
	                $("#testStatus").html(lang + " failed");
                    // line2HasDone = _oTest.bTest ? XsTestFailed : XsQuizFailed;
                    break;
                case "C":
	                $("#testStatus").html(lang + " completed");
                    // line2HasDone = _oTest.bTest ? XsTestCompleted : XsQuizCompleted;
                    break;
            }
        }
    }
}




/* ----------------------------------------------------------------------------------- */
//		INDEX
/* ----------------------------------------------------------------------------------- */
function showQuestionList() {
    calcTest();
    if (_oTest.bTest || _oTest.bQuiz) {
        $(document).trigger("refresh-index");
        updateTestStatusBar();
	    // $("#testStatus").html(getTestStatusText());
	}
}

function showQuestionMenuTemplate() {
    var nQTotal = 1, _questions = [];
    for (i=0; i<_nQuestionPools; i++) {
	    for(var j=0; j<_oTest.aQuestionPool[i].nDeliver; j++) {
	        var nOrder = _oTest.aQuestionPool[i].aOrder[j];
	        setMarkingStatus(_oTest.aQuestionPool[i].aQuestions[nOrder]); // does the actual marking evaluation work
	        _questions.push({
	        	"pool": i,
	        	"order": j,
	        	"index": nQTotal++,
	        	"text": _oTest.aQuestionPool[i].aQuestions[nOrder].sPrompt.replace(/<(.|\n)*?>/g,""), // strip html, line breaks
	        	"current": (_nCurrentQuestionPool == i && _nCurrentQuestion == j),
	        	"status": _oTest.aQuestionPool[i].aQuestions[nOrder].enStatus
	        });
	    }
	}
	var d = {
    	"test": {
	    	"title": XsItemTitle.replace(/%%testtype/g, _oTest.sTestType),
	    	"introduction": _oTest.sTestType + " " + XsIntroduction,
	    	"results": XsResults
    	},
    	"pools": {
    		"total": _nQuestionPools,
    		"current": _nCurrentQuestionPool
    	},
    	"currentquestion": _nCurrentQuestion,
    	"question": _questions
    };
    // console.log("showQuestionMenuTemplate", d);
	$("#questionList").html(Handlebars.getCompiledTemplate("quiz/index", d));
}


/* ----------------------------------------------------------------------------------- */
//		MOVEMENT / NAVIGATION
/* ----------------------------------------------------------------------------------- */
function gotoQuestion(nQuestionPool,nQuestion) {
    evalCurrentQuestion(false);
	_nCurrentQuestionPool = nQuestionPool;
	_nCurrentQuestion = nQuestion;
	gotoPage();
}

function RetakeTest() {
	setOrder();
	ResetData();
	$("#testStatus").html("");
	_oTest.nNumAttempts++;
    gotoPage();
}

function GradeTest2(){
	if (!_nCurrentQuestionPool == _nQuestionPools){

	}
}

function GradeTest() {
    _oTest.bGraded = true;
    if (_timerTest != null) {
        clearInterval(_timerTest);
        $("#timeLimit").html(""); // XsMsgTime + "0");
    }
    gotoQuestion(_nQuestionPools,0);
}

function ResetData() {
    _oTest.bGraded = false;
    _timerTest = null;
    _oTest.nTotalTime = 0;
	_nCurrentQuestionPool = -1;
	_nCurrentQuestion = 0;
    for (i=0; i<_nQuestionPools; i++) {
	    for(var j=0; j<_oTest.aQuestionPool[i].aQuestions.length; j++){
	        _oTest.aQuestionPool[i].aQuestions[j].sResponse = ""; // remove user response
	        _oTest.aQuestionPool[i].aQuestions[j].enStatus = enQuestionStatus.NOTATTEMPTED; // reset status
	        _oTest.aQuestionPool[i].aQuestions[j].aChoiceRand = null; // distractor randomiser
	    }
	}
}

function NextPage() {
	evalCurrentQuestion(false);
    setNextQuestion();
    gotoPage();
}

function PrevPage() {
	evalCurrentQuestion(false);
    setPrevQuestion();
    gotoPage();
}

function setPrevQuestion() {
    if (_nCurrentQuestion > 0) {
        _nCurrentQuestion--;
    } else {
        _nCurrentQuestionPool--;
        if (_oTest.aQuestionPool[_nCurrentQuestionPool] != undefined && _oTest.aQuestionPool[_nCurrentQuestionPool].nDeliver == 0) {
            setPrevQuestion();
        }
        if (_nCurrentQuestionPool >= 0) {
            _nCurrentQuestion = _oTest.aQuestionPool[_nCurrentQuestionPool].nDeliver - 1;
        }
    }
}

function setNextQuestion() {
    if (_oTest.aQuestionPool[_nCurrentQuestionPool] != undefined &&
        _nCurrentQuestion < _oTest.aQuestionPool[_nCurrentQuestionPool].nDeliver - 1) {
        _nCurrentQuestion++;
    } else {
        _nCurrentQuestionPool++;
        if (_oTest.aQuestionPool[_nCurrentQuestionPool] != undefined && _oTest.aQuestionPool[_nCurrentQuestionPool].nDeliver == 0) {
            setNextQuestion();
        }
        _nCurrentQuestion = 0;
    }
}

// tim:
// helper function to know how <revealAnswer> is set in quiz.xml file
function canRevealAnswer() {
    var nUserScore = Math.ceil((_oTest.nCorrect / _nQuestionsToDeliver) * 100)
    if (nUserScore >= _oTest.nPassingScore) {
    	var passed = true;
    } else {
    	var passed = false;
    }
	return (_oTest.sRevealAnswers == "always" || (_oTest.sRevealAnswers == "pass" && passed == true));
}


/* =========================================================================================================
 *
 * 	The JQUERY used to run the quiz, layout, etc
 *	Author: tim.stclair@gmail.com
 *
 * ========================================================================================================= */



/* bind event handlers before ready() */
$(document).unbind("refresh-index").bind("refresh-index", function() {

	// re-draws whole menu using handlebars template
	showQuestionMenuTemplate();

	// so we need to re-bind all clickers
	$("#questionList a").click(function (event) {
		event.preventDefault();
		var $this = $(this);
		gotoQuestion(parseInt($this.attr("data-pool"),10), parseInt($this.attr("data-question"),10));
	}).each(function (index, el) {
		var $el = $(el),
			$parent = $el.parent(),
			_icon = "icon-circle-blank";
		if ($parent.hasClass("not-attempted")) _icon = "icon-circle-blank";
		if ($parent.hasClass("attempted")) _icon = "icon-circle";
		if ($parent.hasClass("meta")) _icon = "icon-cog";
		// if ($parent.hasClass("selected")) _icon = "icon-hand-right";
		if ($parent.hasClass("correct")) _icon = "icon-ok-circle";
		if ($parent.hasClass("incorrect")) _icon = "icon-remove-circle";
		$el.prepend($("<i />").addClass(_icon));
	});

	// this is non-touch event; menu may not appear on touch anyway
	if (jQuery.isFunction(jQuery.fn.tipTip)) {
		$(".tooltip").tipTip({
			delay: 1600,
			edgeOffset: 1,
			defaultPosition: "left"
		});
	}

});

$(document).unbind("enable-check").bind("enable-check", function () {
	$("#check").removeClass("disabled");
});

$(document).unbind("bind-buttons").bind("bind-buttons", function () {
	$("#question button, #start").click(function (event) {
		event.preventDefault();
		var $this = $(this);
		switch ($this.attr("id")) {
			case "check":
				if ($this.hasClass("disabled")) return;
				evalQuestionTemplate($this.attr("data-type"), true);
				break;

			case "precede":
				PrevPage();
				break;

			case "retake":
				RetakeTest();
				break;

			case "showgrade":
				GradeTest();
				break;

			case "restart":
				startOver();
				break;

			case "start":
			case "advance":
				NextPage();
				break;

			case "exit":
				parent.NextPage();
				break;

		}
	});
});

$(document).bind("drag-list-resize", function () {
	$(".drag2list ul:not(.list-source)").equaliseHeights(true);
})

$(document).unbind("display-question").bind("display-question", function () {
	$("#tiptip_holder").remove(); // might still be displayed
	$(".quiz-sortable").sortable({
		axis: "y",
		start: function (event, ui) {
			ui.item.addClass("dragging");
		},
		stop: function (event, ui) {
			ui.item.removeClass("dragging");
			$(document).trigger("enable-check");
		}
	}).disableSelection();

	if ($(".drag2list").length) {
		$(".drag2list ul").sortable({
			items: "li:not(.immovable)",
			connectWith: ".drop-target",
			placeholder: "ui-state-highlight",
			forcePlaceholderSize: true,
			stop: function ( event, ui ) {
				$(document).trigger("drag-list-resize").trigger("enable-check");
			}
		});
		$(document).trigger("drag-list-resize");
		var _li = $(".drag2list .list-answer .immovable").filter(":first"),
			w = _li.outerWidth(true),
			pr = _li.closest("ul").css("padding-right")
		$(".ui-state-default", ".list-source").css({
			"min-width":w,
			"margin-right":pr
		});
	}

	// match questions need to be the same height for dragging to make sense
	$("#answers .match li").equaliseHeights();

	$("#answers input").change(function () {
		$(document).trigger("enable-check");
	});
	$("#answers :text").keypress(function () {
		$(document).trigger("enable-check");
	});

	// if we have an image map
	if ($("img[usemap='#ansmap']").length) {
		$("img[usemap='#ansmap']").maphilight({
			"fillColor": parent.__settings.layout.basecolour.replace(/\#/,""),
			"strokeColor": parent.__settings.layout.basecolour.replace(/\#/,""),
			"strokeWidth": 2,
			"shadow": true,
			"neverOn": true // bind click to toggle instead of mouseover
		});
		$("map[name='ansmap'] area").each(function(index,el) {
			var $el = $(el),
				data = $el.mouseout().data('maphilight') || {};
			if ($el.attr("data-r") != "true") { // if not readonly, bind click
				$(el).click(function(e) {
					e.preventDefault();
					data.alwaysOn = !data.alwaysOn;
					$el.attr("data-s",data.alwaysOn);
					checkAreaMap();
					$(document).trigger("enable-check");
				});
			}
		});
		function checkAreaMap() {
			$("map[name='ansmap'] area").each(function(index,el) {
				var $el = $(el),
					data = $el.mouseout().data('maphilight') || {};
				data.alwaysOn = ($el.attr("data-s") == "true"); // selected
				$el.data('maphilight', data).trigger('alwaysOn.maphilight');
				$("#answer"+index).attr("checked", data.alwaysOn); // change matching checkbox
			});
		}
		checkAreaMap();
	}


	// can't seem to work out how to get delegate to work on IE8, so we have to re-bind
	$(document).trigger("bind-buttons");

});

$(document).ready(function () {
	function qs(str,dft) {
		var found = false, q = document.URL.split('?')[1];
		if (q != undefined) {
			q = q.split('&');
			for(var i=0,j=q.length;i<j;i++) {
				var hash = q[i].split('=');
				if (hash[0]==str) { found = true; return hash[1] };
			}
		}
		if (!found) return dft;
	}
	var fn = qs("filename"), // location.href.split("?filename=")[1];
		_w = qs("w",$(window).width()),
		_h = qs("h",$(window).height());
	initQuiz(fn);

	var options = {
		applyDefaultStyles : true,
		showErrorMessages : false,
		fxName : "none",
		onresizeall_end: function () {
			//
		},
		east: {
			size : 250,
			closable : true,
			resizable : false,
			spacing_open: (_sniff_isTablet ? 15 : 10),
			spacing_closed: (_sniff_isTablet ? 15 : 10),
			slideTrigger_close: "click"
		},
		south : {
			size: (_oTest.bShowStatus ? 40 : 0),
			initClosed: !_oTest.bShowStatus,
			closable: false,
			resizable: false,
			spacing_open: 0,
			spacing_closed: _oTest.bShowStatus ? (_sniff_isTablet ? 15 : 10) : 0
		}
	};

	var quizLayout = $("[data='rp-quiz-layout']").css({
			"width": _w,
			"height": _h
	}).layout(options);

	if (!_oTest.bTest && !_oTest.bQuiz) {
		quizLayout.hide("south"); // .close()
		quizLayout.hide("east");
	}
	if (!_oTest.bShowStatus) {
		quizLayout.close("south");
	}

	setTimeout(function () {
		hideSpinner();
		parent.resizeIframe();
	}, 258);

	parent.$("#FRM_CONTENT").css("visibility","visible");

});

function hideSpinner(n) {
	// try {
	if (typeof n != 'undefined') return;
	// if (parent._loader) clearTimeout(parent._loader);
	parent.$("#loading-animation").fadeOut("fast")
	setTimeout(function() { hideSpinner(true)},500);
	// } catch(ex) {
	// }
}

function FixPaths(value) {
	return value.replace("Content/media/", parent.__global_root + "/en-us/Content/media/");
}