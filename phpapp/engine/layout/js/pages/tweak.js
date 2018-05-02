$(document).ready(function () {

	$("#done").click(function(e) {
		e.preventDefault();
		switch (_command) {
			case "glossary":
				// store xml
				break;
				
			case "resources":
				// fields -> a, build document
				// submit as normal
				break;
				
			default:
				break;
		}
		if (window.opener) window.close();
	});
	
	switch (_command) {
		case "glossary":
			var xml = $("#xml").text();
			break;

		case "resources":
			var page = $("#fullpage").text();
			var body = $("#body").text();
			break;
 
		default:
		
			break;
		
	}
	
});
