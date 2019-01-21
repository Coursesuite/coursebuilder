function compileQuiz() {
	var pools = [];
	[].forEach.call(document.querySelectorAll("ul[data-sort-group='pool']>li:not(.locked)"), function (pli, pOrder) {
		var ptarget = document.querySelector("fieldset[data-index='" + pli.querySelector("a[data-target]").dataset.target + "']"),
			pool = {deliver:0,order:'shuffle',question:[]},
			questions = pli.querySelectorAll("ul[data-sort-group='question']>li:not(.locked)"),
			count = 0;
		if (ptarget) {
			pool.deliver = ~~ptarget.querySelector("input[data-id$='.deliver']").value;
			pool.order = ptarget.querySelector("input[data-id$='.order'][checked]").value;
		}
		[].forEach.call(questions, function (qli, qOrder) {
			count++;
			var id = "q" + pOrder + "." + qOrder;
			var q = compileQuestion(document.querySelector("fieldset[data-index='" + qli.querySelector("a[data-target").dataset.target + "']"), id);
			pool.question.push(q);
		});
		if (count>0) pools.push(pool);
	});
	return {
		"test": {
			id: "", // new Date().getTime().toString(16),
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
	};
}

function compileQuestion(fieldset, id) {
	var data = {}, choices =[], choicesA = [], choicesB = [], feedback = [],
		answers = fieldset.querySelector("[data-id$='.answers']>table");

	data.id = id;
	data.type = fieldset.dataset.questionType;
	data.prompt = fieldset.querySelector("[data-attribute='prompt']").value;
	if (fieldset.querySelector("[data-attribute='media']") !== null) {
		data.media = fieldset.querySelector("[data-attribute='media']").value;
	}
	if (fieldset.querySelector("[data-attribute='randomize']") !== null) {
		data.randomize = fieldset.querySelector("[data-attribute='randomize']").value;
	}
	if (fieldset.querySelector("[data-attribute='layout']") !== null) {
		data.layout = fieldset.querySelector("[data-attribute='layout']").value; // >option[selected]
	}
	data.feedbackCorrect = fieldset.querySelector("[data-attribute='feedbackCorrect']").value;
	data.feedbackIncorrect = fieldset.querySelector("[data-attribute='feedbackIncorrect']").value;
	data.review = fieldset.querySelector("[data-attribute='review']").value;
	if (fieldset.dataset.questionType == "QuestionMatching") {
		$("tbody tr", answers).each(function(trIndex, tr) {
			choicesA.push({"value":$(":input[data-attribute='choiceA']",tr).val()});
			choicesB.push({"value":$(":input[data-attribute='choiceB']",tr).val()});
		});
		data.choiceA = choicesA;
		data.choiceB = choicesB;
	} else {
		$("tbody tr", answers).each(function(trIndex, tr) {
			var opts = {};
			opts.value = $(":input[data-attribute='choice']",tr).val(); // all question types have a choice
			switch (fieldset.dataset.questionType) {
				case "QuestionRankInOrder": // adds nothing, but skip default
				case "QuestionFillIn": // adds nothing, but skip default
					break;

				case "QuestionDragToList": // drag contains a list name
					opts.list = $(":input[data-attribute='list']",tr).val();
					break;

				case "QuestionChoice":
					feedback.push($(":input[data-attribute='feedback']",tr).val()); // single choice has feedback
					// DON'T break, also appends default

				default: // determine if choice is correct using checkbox
					opts.correct = $("input:checkbox",tr).is(":checked");
					break;
			}
			choices.push(opts); // append THIS distractor
		});
		if (feedback.length) data.feedback = feedback;
		data.choice = choices;
	}
	return data;
}

function nextHighestIndex(selector) {
	var result = 1, nodes = document.querySelectorAll(selector);
	[].forEach.call(nodes, function (el) {
		if (el.dataset.index) {
			var v = parseInt(el.dataset.index,10);
			if (v>result) result = v;
		}
	});
	return result + 1;
}


/* ------------------------- HANDLEBARS HELPERS -------------------------------- */

Handlebars.registerHelper('compare', function (lvalue, operator, rvalue, options) {
	var operators, result;
	if (arguments.length < 3) {
	    throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
	}
	if (options === undefined) {
	    options = rvalue;
	    rvalue = operator;
	    operator = "===";
	}
	operators = {
	    '==': function (l, r) { return l == r; },
	    '===': function (l, r) { return l === r; },
	    '!=': function (l, r) { return l != r; },
	    '!==': function (l, r) { return l !== r; },
	    '<': function (l, r) { return l < r; },
	    '>': function (l, r) { return l > r; },
	    '<=': function (l, r) { return l <= r; },
	    '>=': function (l, r) { return l >= r; },
	    '~': function (l, r) { return (r&&l&&r.toString().indexOf(l.toString()) != -1); },
	    '!~': function (l, r) { return (r&&l&&r.toString().indexOf(l.toString()) == -1); },
	    'typeof': function (l, r) { return typeof l == r; },
	    'is': function (l, r) {
	    	if (r === 'empty') { // returns true IF empty
		    	return ((typeof l == 'undefined') || (l.toString().length == 0));
	    	}
	    	if (typeof l == 'undefined') return false;
		    switch (r) {
			    case 'numeric': return $.isNumeric(l); break;
			    case 'boolean': return (l.toString()=='true' || l.toString()=='false'); break;
			    case 'string': return (l.toString().length != 0); break;
				case 'array': return Object.prototype.toString.call(l) === '[object Array]'; break;
			    default: return false;
		    }
	    },
	    'morethanone': function(node,property) {
		    var c = 0;
		    for (var i=0;i<node.length;i++) {
			    if (node[i].hasOwnProperty(property)) c++;
		    }
		    return (c>0);
	    }
	};
	if (!operators[operator]) {
	    throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
	}
	result = operators[operator](lvalue, rvalue);
    if (result) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

Handlebars.registerHelper("siblingIndex", function (index, el, sibling, options) {
  if (el[sibling]) return el[sibling][index].value ? el[sibling][index].value : el[sibling][index].textValue;
  return "";
});

Handlebars.registerHelper("singleQuote", function (value, options) {
  return (value && typeof value === 'string') ? value.replace(/["]/g,"'") : "";
});

Handlebars.registerHelper("indexplus1", function(i) {
	if (isNaN(i+0)) return 0;
	return (i+1);
});

Handlebars.registerHelper("shorten", function(i, n) {
	return i.substr(0,n-1)+(i.length>n?'...':'');
});

Handlebars.registerHelper("globIndex", function() {
	if (typeof Handlebars._globIndex === 'undefined') Handlebars._globIndex = 0;
	return Handlebars._globIndex++;
});
Handlebars.registerHelper("globIndexReset", function(incr) {
	Handlebars._globIndex = 0;
});