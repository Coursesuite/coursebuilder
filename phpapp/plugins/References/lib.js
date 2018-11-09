function show_dialogue_references(editor) {

	$("#dialogue-references").remove();
	$("<div />")
		.attr({
			"id":"dialogue-references",
			"title":"Citiations / References"
		})
		.appendTo("body");

	$.get("/engine/action.asp?id=" + window.CourseBuildr.Course.id + "&action=edit_ajax_load_references&q=" + Math.random(), function (data) {
		if (typeof editor !== "undefined") {
			data['returnmode'] = true;
		}
		$("#dialogue-references")
			.html(Handlebars.getCompiledTemplate("reference",data))
			.dialog({
				modal: true,
				maxHeight: $(window).height() - 100,
				maxWidth: $(window).width() - 200,
				width: $(window).width() / 2,
				open: function() {
					var $this = $(this);
					$this.dialog('option', {
						'maxHeight': $(window).height() - 100,
						'maxWidth': $(window).width() - 200
					});
					$("<button><i class='far fa-plus-circle'></i> Add item</button>").click(function () {
						var tbl = $this.find("table").filter(":first"),
							copy = tbl.clone();
							copy.find(":text").val("");
							copy.attr("data-id", getUID().toString());
							copy.insertBefore(tbl);

							$this.dialog('option', {
								'maxHeight': $(window).height() - 100,
								'maxWidth': $(window).width() - 200
							});

					}).button().appendTo(".ui-dialog-buttonpane");
					$(this).on("click", "a[href=#remove]", function (event) {
						event.preventDefault();
						$(this).closest("table").remove();
					});
				},
				buttons: {
					"Save": function () {
						var $this = $(this);
						var out = {"references":[]},
							inp = $("table", this);
						inp.each(function(index, el) {
							var $el = $(el),
								_ref = $.trim($el.find(":text[name='reference']").val()),
								_link = "", _desc = "";
							if (_ref.indexOf("://")==-1) { _desc=_ref; _link="#"} else { _desc=""; _link=_ref; }
							out.references.push({
								"uniqueid": either($el.attr("data-id"),getUID().toString()),
								"title": $.trim($el.find(":text[name='cite']").val()),
								"description": _desc,
								"hyperlink": _link
							});
						});
						$.post("/engine/action.asp?id=" + window.CourseBuildr.Course.id + "&action=edit_ajax_save_references", {
							data: JSON.stringify(out)
						}, function (ret) {
							if (ret == "ok") {

								// apply the selection before the dialogue closes
								if (typeof editor !== "undefined") {
									replace_selection(editor, "{ref " + [$this.find(":checked").val()].join("|") + "}")
								}

								$this.dialog("close");
								$.jGrowl("The references have been saved.");


							} else {
								alert("Something stuffed up saving the references. Check the console.");
								console.log("Error saving references", ret);
							}
						});
					},
					Cancel: function () {
						$(this).dialog("close");
					}
				}
			});
		$(".sortable-elements", "#dialogue-references").sortable({
			handle: ".far fa-resize-vertical",
			axis: "y"
		})
	});
}