function show_dialogue_glossary(editor) {

	function showTermEditor(event, ui) {

		var _editObj = $("#termEdit"),
			_tagObj = $("#termTags");
		_editObj.show();
		_tagObj.hide();

		var li = $(event.srcElement).closest("li"),
			tagLabel = ui.tagLabel,
			inpTerm = $("input[name='term']", _editObj),
			inpDefn = $("textarea", _editObj),
			obj = find_in_json(__glossary_json.terms, "term", tagLabel)[0];

		if (typeof obj !== "undefined") {
			inpTerm.val(obj.term);
			inpDefn.val(obj.definition);
		} else {
			inpTerm.val(tagLabel);
			inpDefn.val("");
		}

		$("input[type='button']", _editObj).unbind("click").click(function () {
			li.removeClass("tagit-selected");
			var current_text = inpTerm.val(),
				current_defn = inpDefn.val().replace(/\n/g,"\\n"),
				found = false;
			for (var key in __glossary_json.terms) {
				if (__glossary_json.terms[key].term == current_text) {
					__glossary_json.terms[key].definition = current_defn;
					found = true;
				}
			}
			if (!found) {
				__glossary_json.terms.push({
					"term": current_text,
					"definition": current_defn
				});
				_tagObj.tagit("createTag", current_text, "", true, true);
			}

			_editObj.hide();
			_tagObj.show();

		});
	}

	$("#dialogue-glossary").remove();
	$("<div />")
		.attr({
			"id":"dialogue-glossary",
			"title":"Glossary"
		})
		.appendTo("body");

	$.get("/engine/action.asp?id=" + window.CourseBuildr.Course.id + "&action=edit_ajax_load_glossary&q=" + Math.random(), function (data) {
		if (typeof editor !== "undefined") {
			data['returnmode'] = true;
		}
		// sort the glossary
		__glossary_json = data;

		$("#dialogue-glossary")
			.html(Handlebars.getCompiledTemplate("glossary",__glossary_json))
			.dialog({
				modal: true,
				maxHeight: $(window).height() - 100,
				maxWidth: $(window).width() - 200,
				width: $(window).width() / 2,
				open: function() {
					$(this).dialog('option', {
						'maxHeight': $(window).height() - 100,
						'maxWidth': $(window).width() - 200
					});
					$("#termEdit", this).hide();
					$("#termTags", this).tagit({
						allowSpaces: true,
						caseSentitive: false,
						removeConfirmation: true,
						onTagClicked: function(event,ui) {
							var tgt = $(event.srcElement),
								li = tgt.closest("li");
							li.siblings().removeClass("tagit-selected");
							if (li.hasClass("tagit-selected")) {
								showTermEditor(event,ui);
							} else {
								li.addClass("tagit-selected");
							}
						},
						afterTagAdded: function(event, ui) {
							if (!ui.duringInitialization) {
								var tgt = $(event.srcElement),
									li = tgt.closest("li").addClass("tagit-selected");
								li.siblings().removeClass("tagit-selected");
								showTermEditor(event, ui);
							}
						},
						afterTagRemoved: function (event, ui) {
							for (var key in __glossary_json.terms) {
								if (__glossary_json.terms[key].term == ui.tagLabel) {
									__glossary_json.terms.removeValue("term", ui.tagLabel);
								}
							}
						}
					});
				},
				buttons: {
					"Save": function () {
						var $this = $(this);

						// sort the terms alphabetically
						__glossary_json.terms = __glossary_json.terms.sort( function(a,b) { return (a.term.toLowerCase()<b.term.toLowerCase()) ? -1 : (a.term.toLowerCase()>b.term.toLowerCase()) ? 1 : 0 } );
						delete __glossary_json.returnmode;
						__glossary_json.label = __settings.navigation.glossary.label;

						$.post("/engine/action.asp?id=" + window.CourseBuildr.Course.id + "&action=edit_ajax_save_glossary", {
							data: JSON.stringify(__glossary_json)
						}, function (ret) {
							if (ret == "ok") {

								// apply the selection before the dialogue closes
								if (typeof editor !== "undefined") {
									if ($this.find(".tagit-selected").length) {
										replace_selection(editor, "{term " + [$this.find(".tagit-selected").find(".tagit-label").text()].join("|") + "}")
									}
								}

								$this.dialog("close");
								$.jGrowl("Your glossary has been saved.");

							} else {
								alert("Something stuffed up saving the glossary. Check the console.");
								console.log("Error saving glossary", ret);
							}
						});
					},
					Cancel: function () {
						$(this).dialog("close");
					}
				}
			});
	});
}