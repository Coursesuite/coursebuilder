function __quiz__checkForEmptyPools() {
	var u = false;
	$("#pool-tab-panes > div").each(function() {
		if ($("fieldset", this).length === 0) {
			var idx = $(this).index();
			$(this).remove();
			$("#pool-tab-links > li").eq(idx).remove();
			u = true;
		}
	});
	if ($("#pool-tab-panes > div").length === 0) {
		$("#pool-tab-panes").append($(Handlebars.getCompiledTemplate("tabs/quiz/questionPool",{"c":0})));
		$("#selectadd").val("QuestionTF").trigger("change");
		
	}
	if (u === true) {
		$("#pool-tab-links > li, #pool-tab-panes > div").removeClass("active");
		$("#pool-tab-links > li:eq(0), #pool-tab-panes > div:eq(0)").addClass("active");
	}
}

function __quiz__ReBuildPoolIndex(activeIndex) {
	$("#pool-tab-links > li:not(.add-pool)").each(function (index, el) {
		var a = $(el).find("a");
		a.attr("href", "#" + index);
		a.html("Question Pool " + index + " <span class='pool-cleaner'><i class='icon-remove-sign'></i></span>");
		$("#pool-tab-panes > div").eq(index).attr({
			"data-id": "questionPool." + index
		});
	});
	if (activeIndex) {
		$("#pool-tab-links > li, #pool-tab-panes > div").removeClass("active");
		$("#pool-tab-links > li:eq("+activeIndex+"), #pool-tab-panes > div:eq("+activeIndex+")").addClass("active");
	}
}

function __init__quiz() {
	var fileName = $("a.jstree-clicked","#xmlTree").closest("li").attr("filename").replace(".html",".xml");
	$.get("/engine/action.asp?folder=" + _folder + "&action=ajax_loadQuizXml&xml=" + fileName, function(xml) {
	
		var _tab = $("#tabs-5"),
			quizHtml = "",
			quiz = xml2Obj(xml);

		Handlebars.needsPartial("tabs/quiz/partial_quest");
		Handlebars.registerHelper("siblingIndex", function(index,el,sibling,options) {
			if (el[sibling]) return el[sibling][index].textValue;
			return "";
		});
		Handlebars.registerHelper("singleQuote", function(value,options) {
			if (value) return value.replace(/["]/g,"'");
			return "";
		});
		if ("object" == typeof quiz.test.questionPool) quiz.test.questionPool = [quiz.test.questionPool];
		[].forEach.call(quiz.test.questionPool, function(node, index) {
			if (!node.hasOwnProperty("question")) {
				node["question"] = {
                    "id": "q" + index + ".0",
                    "type": "QuestionTF",
                    "randomize": "false",
                    "layout": "stack",
                    "prompt": { "textValue": "Two plus One is Two" },
                    "choice": [
                        { "textValue": "True" },
                        { "correct": "true", "textValue": "False" }
                    ],
                    "feedbackCorrect": { "textValue": "" },
                    "feedbackIncorrect": { "textValue": "" },
                    "review": { "textValue": "Recreated default question automatically" }
                }
			}
		});
		
		// console.log("building quiz with", quiz);
		try {
			quizHtml = Handlebars.getCompiledTemplate("tabs/quiz/template",quiz);
		} catch(ex) {
			_tab.html("<p>An error occurred loading the quiz. The following data was able to be recovered:</p>" +
						"<pre>" + JSON.stringify(quiz,null,4) + "</pre>");
			return;
		}

		console.log(quiz);
		
		// with _tab, bind to all its event-driving elements
		_tab
	
			// build the quiz form from a template	
			.html(quizHtml)
		
			// handle save button
			.on("click", "#quiz-save", function(event) {
				// console.log("#quiz-save", event);
				event.preventDefault();
				__quiz__checkForEmptyPools();
				saveQuiz(fileName);
			})
		
			// handle add question drop down
			.on("change", "#selectadd", function () {
				var $obj = $(this)
					_val = $obj.val(),
					_container = ($(".tab-pane.active").length) ? $(".tab-pane.active .question-append-to") : $(".question-append-to"),
					_nhi = ($(".tab-pane.active").length) ? $("fieldset", ".tab-pane.active .question-append-to").length : $("fieldset", ".question-append-to").length;
				if (!_val) return;
				
				var template = Handlebars.compile("{{> quest}}"),
					question = template({
	                    "id": "",
	                    "type": _val,
	                    "randomize": "false",
	                    "media": { },
	                    "prompt": { "textValue": "Enter the question text here" },
	                    "choiceA": [{"textValue":"Item text"}],
	                    "choiceB": [{"textValue":"Match text"}],
	                    "choice": [{ "correct": "true", "textValue": "Distractor 1"}, { "textValue": "Distractor 2"}, { "textValue": "Distractor 3"}],
	                    "feedback": [{ "textValue": ""}, { "textValue": ""}, { "textValue": ""}],
	                    "feedbackCorrect": { "textValue": ""},
	                    "feedbackIncorrect": { "textValue": "" },
	                    "review": { "textValue": "" }
					});
				// normally uses @index but we dont' have one in a direct bind, so we have to fudge the html
				question = question.replace(/question\.\./g,"question." + _nhi + ".").replace("badge'>NaN</","badge'>" + (_nhi+1) + "</");
				_container.append(question);
				$("fieldset",_container).filter(":last").get(0).scrollIntoView(); // scroll this question into view
				this.selectedIndex = 0;	// reset select list
			})
			
			// the truck icon moves to a new pool (if there IS more than one pool)
			.on("click", "a[href='#move-to-pool']", function (event) {
				event.preventDefault();
				var _pl = $("#pool-tab-links > li:not(.add-pool)");
				if (_pl.length > 1) {
					var fieldset = $(this).closest("fieldset"),
						val = ~~window.prompt("Type the number of the pool you want to move this question to (from 0 to " + (_pl.length-1) + ") - it will be moved to the end of that pool.", "0");
					if ((val<0) || (val>_pl.length-1)) return false;
					fieldset.appendTo("div[data-id='questionPool." + val +"'] > .question-append-to");
					$.jGrowl("Moved question to pool " + val);
				}
			})
			
			// inserting a picture, next to a capable field
			.on("click", "a[href='#insert-picture']", function(event) {
				event.preventDefault();
				var _target = $(this).attr("id", "z" + getUID()).attr("id"); //.closest("div").find(":text,textarea").uniqueId(); // attr("id");
				popWindow({
					command: "settings",
					containerid: _target,
					returnmode: "prepend"
				});
			})
			
			.on("click", ".nav-tabs a", function (e) {
				e.preventDefault();
				$("#pool-tab-links > li, #pool-tab-panes > div").removeClass("active");
				$(this).closest("li").addClass("active");
				$("#pool-tab-panes > div").eq(~~$(this).attr("href").replace(/\#/,"")).addClass("active");
			})
			
			.on("click", ".nav-tabs i.icon-remove-sign", function (e) {
				e.preventDefault();
				if ($("#pool-tab-panes > div").length === 1) {
					alert("You cannot remove the last pool.")
					return;
				}
				var idx = ~~$(this).closest("a").attr("href").replace(/\#/,"");

				if (window.confirm("Removing this pool will move ALL the questions within it to an adjacent pool, then delete the pool. Please confirm that this is what you want to do.")) {
					var thisPool = $("#pool-tab-panes > div:eq("+idx+")"),
						prevPool = thisPool.prev(),
						nextPool = thisPool.next(),
						thatPool = (nextPool.length) ? nextPool : prevPool;
					$("#pool-tab-links > li:eq("+idx+")").remove();
					$("fieldset", thisPool).each(function() {
						thatPool.find("question-append-to").append(this);
					});
					thisPool.remove();
					$("#pool-tab-links > li, #pool-tab-panes > div").removeClass("active");
					$("#pool-tab-links > li:eq(0), #pool-tab-panes > div:eq(0)").addClass("active");
				}
				return false;
			})

			.on("click", ".nav-tabs i.icon-plus-sign", function (e) {
				e.preventDefault();
				var c = $("#pool-tab-links > li:not(.add-pool)").length;
				if (c === 1) {
					// wrap the form so it allows multiple tabs
					var f = $("div[data-id='questionPool.0']", "#pool-tab-panes");
					if (f) {
						f.removeAttr("data-id").removeAttr("data-grouping");
						f.wrap("<div class='tab-pane' data-id='questionPool.0' data-grouping='questionPool'>");
					}
				}
				$("#pool-tab-panes").append($(Handlebars.getCompiledTemplate("tabs/quiz/questionPool",{"c":c})));
				$("<li>").append(
					$("<a>")
				).insertBefore("#pool-tab-links .add-pool")
				__quiz__ReBuildPoolIndex(c);
				/*
				var ul = $(this).closest("ul"),
					c = $(this).closest("ul").children("li").length - 1,
					lastLi = ul.children("li:eq(" + c + ")");
				ul.children("li").removeClass("active");
				var a = $("<a>").attr({
							"href": "#pool" + c,
							"data-toggle": "tab"
						}).html("Question Pool " + c + " <span class='pool-cleaner'><i class='icon-remove-sign'></i></span>").click(function(ev) {
							ev.preventDefault();
							$(this).tab("show");
						});
				li = $("<li>")
					.append(a)
					.insertBefore(lastLi);
				$("#pool-tab-panes > div").removeClass("active");
				li.find("a").tab("show");
				*/
			})
			
			// hotspot help
			.on("click", "a[href='#hotspot-help']", function(event) {
				event.preventDefault();
				bootbox.alert("<h4>Hotspot questions</h4><p>If an image is specified here, you"+
					" should then specify each AREA for the hotspot by pasting in the &lt;area&gt; tag"+
					" itself into each choice, marking also which items are correct as normal.</p>"+
					"<p>The 'answer layout' is ignored for hotspot images, as is Randomize.</p><p>If"+
					" this field is blank, then the question behaves like a regular Multiple"+
					" Choices question.</p>"+
					"<p><b>ToDo:</b></p><p>Implement an in-browser editor for doing this.</p>");
			})
			
			// layout help
			.on("click", "a[href='#layout-help']", function(event) {
				event.preventDefault();
				bootbox.alert("<h4>Layout template</h4><p>Normally, a question is drawn with checkmarks"+
					" down the left, and text next to them. However you can"+
					" also lay out the options next to each other - selected options are highlighted.</p>" +
					"<p>Horizontal layout works best if the distractors contain images, and there are 5 or less distractors.</p>" + 
					"<p>TODO: make the images fit properly.</p>" + 
					"<p>This is ignored for Hotspot and Fill-In question types.</p>");
			})
			
			// review help
			.on("click", "a[href='#review-help']", function(event) {
					event.preventDefault();
					bootbox.alert("<h4>The review field</h4><p>This information isn't shown on a quiz," +
						" but the field can be used to tag a given question, such as during development.</p>"+
						"<p>As always, if in doubt, leave it alone.</p>");
			})
			
			// attempts, time limit help
			.on("click", "a[href='#attempts-help'],a[href='#timelimit-help']", function(event) {
				event.preventDefault();
				bootbox.alert("<h4>Test vs Quiz</h4><p>A <b>test</b> is graded and you can't see"+
					" your answers as you go, and can be timed. A <b>Quiz</b> lets you see your answers"+
					" as you go and is not timed, and can be Restartable."+
					"<h4>Attempts</h4><p>In a <b>test</b> you can limit the number of attempts the user can have"+
					" to pass before they are locked out. This has to then be reset by the SCORM data, which"+
					" depends on the LMS being used.</p>"+
					"<h4>Timed tests</h4>The <b>test</b> can have a time limit put on it. This can be suspended if"+
					" the user leaves the course and comes back. The time left is shown on the screen.</p>");
			})
			
			// restartable dropdown help
			.on("click", "a[href='#restartable-help']", function(event) {
				event.preventDefault();
				bootbox.alert("<h4>Restartable</h4><p>This special mode (normally false) is for Quizzes."+
					" It disables the <b>check answer</b> button, and subsequently reveal answer option, and"+
					" shows the Retake button on the results page. This lets a user wipe their response"+
					" and take the test again. Correct or Incorrect answers are still indicated on"+
					" the Question Index column.</p>");
			})
			
			//test status checkbox help
			.on("click", "a[href='#status-help']", function(event) {
				event.preventDefault();
				bootbox.alert("<h4>Test Status</h4><p>This is a pane on the quiz that shows the pass requirement.</p>"+
					"<p>You can turn off this pane to completely hide the text, which may not be required on some quizzes."+
					" However, this pane also contains the time limit, so be cautious of removing it if the test is timed.</p>");
			})

			// distractor row clone
			.on("click", "a[href='#clone-row']", function(event) {
				event.preventDefault();
				var tbody = $(this).closest("table").find("tbody"),
					trs = tbody.find("tr");
					if (trs.length < 10) {
						tbody.append(trs.filter(":last").clone());
					} else {
						alert('The current quiz implementation only allows you to specify up to 10 distractors.');
					}
			})
			
			// distractor row delete
			.on("click", "a[href='#delete-row']", function(event) {
				event.preventDefault();
				var tbody = $(this).closest("table").find("tbody");
				if ($("tr", tbody).length > 1) $(this).closest("tr").remove(); // don't allow delete last row
			})

			// question remove
			.on("click", "a[href='#remove-question']", function(event) {
				event.preventDefault();
				$(this).closest("fieldset").remove();
			});

		// makes the toolbar stick once you scroll the page, since this page is likely quite long
		// http://stackoverflow.com/questions/784929/what-is-the-not-not-operator-in-javascript !!
		if (!!$("#tab-toolbar", "#tabs-5").offset()) { // make sure ".sticky" element exists
			var stickyTop = $("#tab-toolbar", "#tabs-5").offset().top, // returns number 
				stickWidth = $("#tab-toolbar", "#tabs-5").width(),
				offset = 50;
			$(window).scroll(function(){ // scroll event
				var windowTop = $(window).scrollTop(); // returns number 
				if (stickyTop < (windowTop + offset)){
					$("#tab-toolbar", "#tabs-5").addClass("stuck").css({'top':offset,'width':stickWidth});
					// $("#tab-toolbar", "#tabs-5").css({ position: 'fixed', top: offset, width: stickWidth, 'box-shadow': '0 3px 5px rgba(0,0,0,.1)' });
				} else {
					$("#tab-toolbar", "#tabs-5").removeClass("stuck"); // .css({'position':'static'});
				}
			});
		}

	});
}