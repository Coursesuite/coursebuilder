function __init__pages(objThis) {
	var $li = $(objThis).parent();
	if ($li.attr("id")) {
		// TODO: refac this into the tab handler
		var _tab = $("#tabs-1").empty(); // start tab over
		var _toolbar = $("<div />").attr("id","editor-toolbar").addClass("row-fluid ui-toolbar").appendTo(_tab);
		$("<button />")
			.addClass("pull-right")
			.html("<i class='icon-circle-question'></i> Help")
			.click(function () {
				$("#nameHelpModal").modal('show')
			})
			.appendTo(_toolbar);
		$("<span />")
			.html("<i class='icon-circle-arrow-left'></i> Changes to this page are saved using the button in the navigation box!")
			.appendTo(_toolbar);

		var _container = $("<div />").addClass("generated-form").appendTo(_tab);
		$('#page-title').text($li.attr("title"));
		//var _widest = 127;

		// build interface for editing each field we know about
		$.each(_fields, function(index,value) {
			var div = $("<div />").addClass("field-row").append("<label for='f_" + index + "' class='force-inline-block'>" + value + ":</label>");
			var inp, obscure_variable_name;
			switch (value) {
				case "contribute":
				case "nav":
					inp = $("<select />").change(function () {
						$li.attr(value, $(this).val());
						makeDirty();
					})
					.attr("id","f_" + index)
					.addClass("ui-corner-all ui-state-default")
					.append($("<option>").val("n").text("None"))
					.append($("<option>").val("v").text("Must visit"))
					.append($("<option>").val("c").text("Must complete"))
					.append($("<option>").val("p").text("Must pass"))
					.append($("<option>").val("s").text("Must score > 0"))
					.val($li.attr(value));
					break;

				case "type":
					inp = $("<select />").change(function () {
						$li.attr(value, $(this).val());
						makeDirty();
					})
					.attr("id","f_" + index)
					.addClass("ui-corner-all ui-state-default")
					.append($("<option>").val("Information").text("Information"))
					.append($("<option>").val("QuestionTF").text("True / False"))
					.append($("<option>").val("QuestionChoice").text("Single Choice"))
					.append($("<option>").val("QuestionChoiceMultiple").text("Multiple Choices"))
					.append($("<option>").val("QuestionMatching").text("Match options"))
					.append($("<option>").val("Quiz").text("Quiz"))
					.append($("<option>").val("Test").text("Test (multi attempt)"))
					.append($("<option>").val("Summary").text("Completion page"))
					.val($li.attr(value));
					break;

				default:
					var inp = $("<input />").change(function () {
						if (value=="title") $li.find("a:first").html($(this).val().safeForXml());
						$li.attr(value, $(this).val().safeForXml());
						makeDirty(true);
					})
					.addClass("ui-state-default ui-corner-all")
					.attr({
						"type": (value.indexOf("contribute")==-1) ? "text":"number",
						"size": 40,
						"id": "f_" + index,
						"min": 0,
						"max": 100,
						"class": (value.indexOf("contribute")==-1) ? "":"input-mini"
					})
					.val($li.attr(value));
					if (value == "fileName") {
						$.ajax({
							url: "/engine/action.asp?folder="+ _folder + "&action=ContentExists&filename=" + escape(inp.val()),
							success: function (result) {
     							inp.attr({
     								"disabled": (result == "true"),
     								"title": "Not editable because it has already been saved"
     							}); // lock filename if it exists on disk
							},
							global: false,
							async: false // block until return, since we haven't added this field to DOM yet
						});
						//obscure_variable_name = fld.val();
						//inp = $(Handlebars.getCompiledTemplate("namehelp",{
						//	"field": fld.attr('data-value-input', obscure_variable_name).clone().wrap('<p>').parent().html().toString().replace('data-value-input', 'value')
						//}));
					}
					break;
			}
			inp.appendTo(div.appendTo(_container));
			if (value == "contribute") inp.after("For quizzes, tests, {match}-type interactions");
			if (value == "contributeScore") inp.after("This activity is worth this many points");
			if (value == "contributePercentage") inp.after("Weight of this pages score (% of score to use, typically 100)");
			if ((value == "fileName") && ($li.attr("type") == "Information" || $li.attr("type") == "Summary")) {
				$("<button />")
					.text("Rename")
					.css("margin-left","10px")
					.click(function () {
						var fld = $(this).prev(":text");
						bootbox.prompt("Rename <u>" + fld.val() + "</u> to ...", function (r) {
							if (r != null) {
								$.post("/engine/action.asp?id=" + _courseid + "&action=RenamePhysicalFile", {
									currentFilename: fld.val(),
									newFilename: r
								}, function (data) {
									if (data.indexOf("ok|") != -1) { // ok | new file name (might have spaces fixed, file extension, etc)
										fld.val(data.split("|")[1]).trigger("change");
									} else {
										$.jGrowl(data);
									}
								});
							}
						});
					})
					.appendTo(div);
			}
			
			if (value == "fileName" && inp.attr('disabled') === undefined) {
				inp.next("button").css("text-decoration","line-through");
				var val = inp.val();
				if (/\s+|[^a-zA-Z0-9_.]/.test(val)) {
					inp.val(inp.val().replace(/\s+|[^a-zA-Z0-9_.]/g,"_"));
					$li.attr("fileName", inp.val());
					makeDirty();
					$('&nbsp;<span class="icon-stack" title="Filename contained bad characters; automatically renamed. Save is required!"><i class="icon-circle icon-stack-base icon-2x"></i><i class="icon-edit icon-light icon-2x"></i></span>').insertAfter(inp);
				}
				$('&nbsp;<span class="icon-stack" title="File missing or not-yet created"><i class="icon-circle icon-stack-base icon-2x"></i><i class="icon-exclamation icon-light icon-2x"></i></span>').insertAfter(inp);
			}
		});
		

		// determine which tabs are clickable
		if ($li.attr("type") == "Quiz" || $li.attr("type") == "Test") {
			$("#tabs").tabs("option", "disabled", [enTabs.CourseConfig,enTabs.VisualLayout,enTabs.Hacks,enTabs.Content])
		} else {
			$("#tabs").tabs("option", "disabled", [enTabs.CourseConfig,enTabs.VisualLayout,enTabs.Hacks,enTabs.Quiz]);
		}
		$("#tabs").tabs("refresh"); // important after setting a tab as disabled, once initialised
		$("#tabs").tabs("option", "active", enTabs.Page);
		$("#tabs").tabs("option", "selected", enTabs.Page);

		// make all labels the same width
		$("label",_container).equaliseWidths(); 
	} else {
		$('#page-title').text("Properties");
		$("#tabs").tabs("option", "disabled", [enTabs.Page,enTabs.Content,enTabs.Quiz]);
		$("#tabs").tabs("refresh");
		$("#tabs").tabs("option", "selected", enTabs.CourseConfig);
		$("#tabs").tabs("option", "active", enTabs.CourseConfig);
	}
}