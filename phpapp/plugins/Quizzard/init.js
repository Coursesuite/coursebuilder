(function (Context, undefined) {

	Context.Quizzard = (function (ctx) {
		var This = ctx;
		var _data = {},
			_tree = {};

		return {
			Init: _init,
			Save: _save,
			Preview: _preview
		}

		function _message(event) {
			if (event.data.action === "ready") {
				document.getElementById("ta-preview-frame").setAttribute("data-ready",true);
			} else if (event.data.action === "preview") {
				_data.model.html = event.data.html;
			}
		}

		function _preview(treeobj, value) { // preview a whole quiz, not a single question; yet to be implemented
			var frame = document.getElementById("ta-preview-frame"); console.dir(frame.dataset);
			if ("ready" in frame.dataset) { // previously initialised
				frame.contentWindow.postMessage({
					content: value,
					template: treeobj.CurrentModel().model.template
				});
			} else { // load
				frame.setAttribute("src","/app/edit/preview/" + _data.model.id)
			}
		}


		function _create() {
			Handlebars._globIndex = 0; // reset global counter which is used for target ids
		}

		function _bind() {
			$("#editor").off("click").on("click", "a[data-action]", function (event) {
				event.preventDefault();
				var tgt = event.target.closest("a[data-action]");
				if (tgt.dataset.action !== "switch-view") $("#qPreview, nav.new-question").removeClass("active");
				switch (tgt.dataset.action) {
					case "edit":
						$("#editor .view-toolbar>a:first").addClass("active").siblings("a").removeClass("active");
						$("fieldset").filter("[data-index='" + tgt.dataset.target + "']").addClass("active").siblings("fieldset").removeClass("active");
						break;

					case "area":
						$(tgt).addClass("active").siblings("a").removeClass("active");
						$("div[data-area]").filter("[data-area='" + tgt.dataset.target + "']").addClass("active").siblings("div[data-area]").removeClass("active");
						break;

					case "toggle-set":
						var el = $(tgt.parentNode).siblings("[data-expand]");
						el.toggleClass("active");
						if (el.hasClass("active")) {
							$(tgt).find("i.fas").addClass("fa-folder-minus").removeClass("fa-folder-plus");
						} else {
							$(tgt).find("i.fas").removeClass("fa-folder-minus").addClass("fa-folder-plus");
						}
						break;

					case "delete-row":
						var tbody = $(this).closest("table").find("tbody"),
							trs = tbody.find("tr");
						if (trs.length > 1) $(this).closest("tr").remove();
						break;

					case "clone-row":
						var tbody = $(this).closest("table").find("tbody"),
							trs = tbody.find("tr"),
							tc = trs.filter(":last").clone();
						tc.find(":text").val("");
						if (trs.length < 10) tbody.append(tc);
						break;

					case "add-question":
						var el = $("nav.new-question"),
							pos = tgt.closest("li").getBoundingClientRect(),
							apos = tgt.getBoundingClientRect();
							$(el).css({
								"left": apos.x + apos.width + 10,
								"top": (pos.y + (pos.height/2)) - (el.height() / 2) - 10
							}).addClass("active").attr("data-sort-target", tgt.closest("ul[data-sort-index]").dataset.sortIndex);
						break;

					case "append-question":
						var id = nextHighestIndex("#editor>div[data-area='sets'] article>fieldset"),
							pool = document.querySelector("nav.new-question").dataset.sortTarget,
							$li = $('<li sortable><div><i class="fas fa-grip-lines"></i> <a href="#" data-action="edit" data-target="' + id + '">New ' + tgt.dataset.type.replace('Question','') + ' question</a></div></li>')
						$li.insertBefore("ul[data-sort-group='question'][data-sort-index='" + pool + "']>li.locked"); // insert LI first so order can be calculated
						var order = $(tgt).closest("ul").find("li:not(.locked)").length+1,
							q = Handlebars.getRuntimeTemplate('plugins-quizzard-new-question-hbt', {
			                    "id": "",
			                    "type": tgt.dataset.type,
			                    "randomize": "false",
			                    "media": "",
			                    "layout": "stack",
			                    "prompt": "New " + tgt.dataset.type + " question",
			                    "choiceA": [{"value":"Item 1 text"},{"value":"Item 2 text"}],
			                    "choiceB": [{"value":"Match 1 text"}, {"value":"Match 2 text"}],
			                    "choice": tgt.dataset.type==="QuestionFillIn" ? [{"value":"Answer"}, {"value":"Alternate answer"},{"value":"Allowable answer"}] : tgt.dataset.type==="QuestionTF" ? [{"correct":"true", "value":"Truthy distractor"},{"value":"Falsey distractor"}] : [{ "correct": "true", "value": "Distractor 1", "list": "List 1" }, { "value": "Distractor 2", "list": "List 1" },{ "value": "Distractor 3", "list": "List 2" }],
			                    "feedback": [{"value":""}, {"value":""},{"value":""}],
			                    "feedbackCorrect": "",
			                    "feedbackIncorrect": "",
			                    "review": "Added by " + atob(window.CourseBuildr.Who) + " " + (new Date()).toLocaleDateString()  + " " + (new Date()).toLocaleTimeString(),
							}).split("question..").join("question." + order + "."); // @index won't evaluate in this template
						$(q)
							.attr({
								"data-question-index": order,
								"data-question-pool": pool,
								"data-index": id
							})
							.insertAfter("#editor>div[data-area='sets']>article>fieldset:last");
						$li.find("a[data-action='edit']").click();
						break;

					case "add-set":
						var n = $("ul[data-sort-group='pool']>li:not(.locked)").length,
							t = nextHighestIndex("#editor>div[data-area='sets'] article>fieldset");
						$(Handlebars.getRuntimeTemplate('plugins-quizzard-template-set-hbt', {
							n: n,
							l: n+1,
							t: t,
							renderer: "set"
						})).insertBefore("ul[data-sort-group='pool']>li.locked");
						$(Handlebars.getRuntimeTemplate('plugins-quizzard-template-set-hbt', {
							n: n,
							l: n+1,
							t: t,
							renderer: "form"
						})).insertAfter("#editor>div[data-area='sets']>article>fieldset:last");
						// just adding a new list with a add question thing in it, precompiled?
						_makeSortables();
						break;

					case "switch-view":
						$(tgt).addClass("active").siblings("a").removeClass("active");
						var $qp = $("#qPreview");
						if ($qp.hasClass("active")) {
							$("article>fieldset[data-index='" + $qp.get(0).dataset.srcIndex + "']").addClass("active");
							$("#qPreview").removeClass("active");
						} else {
							var el = $("article>fieldset.active");
							if (!el.length) break;
							var w = parseInt(el.width(),10), h = parseInt(el.height(),10);
							$("#qPreview").css("height", h).addClass("active").attr({
								"data-src-index": el.get(0).dataset.index
							});
							$("#qPreviewFrame").attr({
								"src": "http://placekitten.com/" + w + "/" + h
							});
							el.removeClass("active");
						}
						break;
					case "remove-question":
						var fieldset = tgt.closest("fieldset");
						var index = fieldset.dataset.index;
						var li = document.querySelector("a[data-action='edit'][data-target='" + index + "']").closest("li");
						li.parentNode.removeChild(li);
						fieldset.parentNode.removeChild(fieldset);
						break;

					default:
						console.log("unhandled action", tgt.dataset.action);
				}
			}).find("fieldset:nth(1)").addClass("active"); // nth(1) is the first question after the first set, which is expanded by default
			_makeSortables();
		}

		function _makeSortables() {
			[].forEach.call(document.querySelectorAll("ul[sortable]"), function(el) {
				Sortable.create(el, {
					handle: "i.fa-grip-lines", // only this icon causes drag
					group: el.dataset.sortGroup,// questions can drop between pools
					onMove: function(evt){ if(evt.related)return !evt.related.classList.contains('locked'); }, // can't position after "add" link
					onStart: function (evt) {
						// create a drag indicator icon on UL children other than the one containing this draggable item (empty list helper)
						$("<li class='insert-area'><div><i class='fas fa-ellipsis-h'></i>&nbsp;</div></li>").insertBefore($("ul[data-sort-group='question']").not($(evt.target)).find(">li.locked"));
					},
					onEnd: function (evt) { $("li.insert-area").remove() },
				});
			});
		}

		// Save applies the controls of the page to the model
		// then calls the Save action on the tree.
		function _save() {
			[
				{control:"page-visibility", property: "visibility"},
				{control:"page-grid", property: "template"},
				{control:"page-score", property: "contribute"},
				{control:"page-navigation", property: "nav"},
			].forEach(function (obj) {
				$el = $("a[data-action='" + obj.control + "']").filter(function() {
					return $(this).find("span").text() === 'check_box';
				});
				_data.model[obj.property] = $el.attr("data-value");
			});
			_data.model.score = ~~$("input[name='page-score-value']").val();
			_data.model.percentage = ~~$("input[name='page-percentage']").val();
			_data.model.scormid = $("input[name='page-scorm-id']").val();

			// ... and the content
			var json = compileQuiz();
			_data.model.content = JSON.stringify(json); // server can transform to XML during export
			_tree.Actions.Save(_data.model);
		}

		// This takes the model which was set up during _init() and
		// populates the controls on the page.
		function _apply_model() {
			[
				{control:"page-visibility", value: _data.model.visibility},
				{control:"page-grid", value: _data.model.template},
				{control:"page-score", value: _data.model.contribute},
				{control:"page-navigation", value: _data.model.nav},
			].forEach(function (obj) {
				var el = $("a[data-action='" + obj.control + "'][data-value='" + obj.value + "']");
				el.find("span").text("check_box");
				el.parent().siblings().find("a>span").text("check_box_outline_blank");
			});
			$("input[name='page-score-value']").val(_data.model.score);
			$("input[name='page-percentage']").val(_data.model.percentage);
			$("input[name='page-scorm-id']").val(_data.model.scormid);
		}

		function _init(treeObj) {
			_tree = treeObj;
			_data = _tree.CurrentModel();

			Handlebars.needsPartial("/plugins/Quizzard/partial_pool");
			Handlebars.needsPartial("/plugins/Quizzard/partial_quest");
			$("#editor").html(Handlebars.getCompiledTemplate("/plugins/Quizzard/editor", JSON.parse(_data.model.content) || {"test":{}}));
			_create();
			_bind();

			if (_data.editorId === "edit-area") {
				_apply_model(); // score, template, etc - global editor stuff
			}

			console.log("quizzard init completed");
		}

	})(Context);
})(window.CourseBuildr = window.CourseBuildr || {});