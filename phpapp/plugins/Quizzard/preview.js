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
		_questionMedia = "";

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
			    _instruction = XsMsgDirectionsD2L || "Drag items from the top to their corrects lists"; // new
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
			    _instruction = XsMsgDirectionsRIO || "Drag items to their correct position in the list"; // new
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
				"visible": (!_oTest.bGraded),
				"text": XsNavGradeTest
			},
			"retake": {
				"visible": (_oTest.bTest && _oTest.bGraded),
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
		$(".drag2list:not(.readonly) ul").sortable({
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


});
