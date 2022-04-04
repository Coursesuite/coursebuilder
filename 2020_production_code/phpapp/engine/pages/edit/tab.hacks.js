function __init__hacks() {

	var __glossary_json;

	var _tab = $("#tabs-4").html(Handlebars.getCompiledTemplate("tabs/hacks/template",{
		id: _courseid,
		folder: _folder.split("/").slice(-1)[0],
		configuration: __settings
	}));

	$("#tabs-4").on("click", "input[value='Glossary']", function () {

		show_dialogue_glossary();
		
	}).on("click", "input[value='References']", function () {

		show_dialogue_references();
		
	}).on("click", "input[value='Help']", function () {
	
		show_dialogue_help();

	}).on("click", "input[data-action='media']", function () {
		
		popWindow({"command":"manage"});
		
	});

}