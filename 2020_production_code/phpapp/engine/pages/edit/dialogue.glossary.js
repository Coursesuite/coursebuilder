function __init__glossary() {

	console.log("init glossary");

	$("#tabs-4").on("click", "input[value='Glossary']", (function () {

		// console.log("glossary clicked");

		$("#dialogue-glossary").remove();
		$("<div />")
			.attr({"id":"dialogue-glossary","title":"Edit glossary items"})
			.appendTo("body");
		
		$.get("/engine/action.asp?id=" + _courseid + "&action=loadGlossaryJson&q=" + Math.random(), function (data) {
			// console.log("glossary loaded", data);
			$("#dialogue-glossary")
				.html(Handlebars.getCompiledTemplate("glossary",data)))
				.dialog({
					modal: true,
					buttons: {
						"Save": function () {
							alert("saved");
							$(this).dialog("close");
						},
						Cancel: function () {
							$(this).dialog("close");
						}
					}
				});
			
		});
		
	});
	
};
