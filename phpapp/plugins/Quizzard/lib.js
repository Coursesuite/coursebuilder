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
	$.post("/engine/action.asp?id=" + window.CourseBuildr.Course.id + "&action=ajax_saveQuizXML", {
		xml: xml,
		json: JSON.stringify(oJson),
		filename: fn
	}, function (ok) {
		$.jGrowl("Quiz XML has been updated.")
	});


}