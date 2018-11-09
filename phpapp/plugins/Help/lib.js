function show_dialogue_help() {

	$("#dialogue-help").remove();
	$("<div />")
		.attr({
			"id":"dialogue-help",
			"title":"Editing the help file"
		})
		.appendTo("body");

	$.get("/engine/action.asp?id=" + window.CourseBuildr.Course.id + "&action=edit_ajax_load_help&q=" + Math.random(), function (data) {
		$("#dialogue-help")
			.html(Handlebars.getCompiledTemplate("help",{content: data}))
			.dialog({
				modal: true,
				maxHeight: $(window).height() - 100,
				maxWidth: $(window).width() - 200,
				width: $(window).width() - ($(window).width() / 4),
				open: function() {
					var $this = $(this);
					$this.dialog('option', {
						'maxHeight': $(window).height() - 100,
						'maxWidth': $(window).width() - 200
					});
					$this.find("textarea").attachEditor();
				},
				buttons: {
					"Save": function () {
						var $this = $(this);
						// console.log("help save", $("textarea", this).val());
						$.post("/engine/action.asp?id=" + window.CourseBuildr.Course.id + "&action=edit_ajax_save_help", {
							data: $("textarea", this).val()
						}, function (ret) {
							if (ret == "ok") {
								$this.dialog("close");
								$.jGrowl("The help file has been saved.");
							} else {
								alert("Something stuffed up saving the help file. Check the console.");
								console.log("Error saving help", ret);
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