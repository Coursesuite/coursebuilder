(function (Context, undefined) {

	Context.Ninjitsu = (function (ctx) {
		var This = ctx;
		var _tree = {};
		var _data = {};

		return {
			Init: _init,
			Save: _save
		}

		// set up the controls and bindings for the editor
		function _create() {
			var page_editor = $("<textarea></textarea>")
				.attr("id", _data.editorId)
	    		.text(_data.model.content)
	    		.on("input", makeDirty)
				.appendTo(document.getElementById(_data.attachTo))
				.attachEditor();

			_enable_drag_n_drop(_data.editorId);

		}

		// enable a drag-to-editor to do something
		function _enable_drag_n_drop(container) {
			window.fd.logging = false;
			var dz = new FileDrop(container,{input: false});
			dz.event('send', function (files) {
				files.each(function(file) {
					file.event('done', function(xhr) {
					    if (file.type.indexOf("image/")!==-1) {
					        replace_selection(container, "{image box-shadow|" + file.name + "}");
					    } else {
						    replace_selection(container, "{linkref hyperlink-text|" + file.name + "}");
					    }
					});
					file.sendTo('/app/edit/action/' + window.CourseBuildr.Course.id + '/file.dnd/');
				});
			});
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
			_data.model.content = $("#" + _data.editorId).val();

			_tree.Actions.Save(_data.model);
		}

		// take the TREE object which has attached to it the current selection model
		// then initialise the correct editor for the type of model
		function _init(treeObj) {
			_tree = treeObj;
			_data = _tree.CurrentModel();
			$("#editor").html(Handlebars.getCompiledTemplate("/plugins/Ninjitsu/editor", {}));
			_create();
			if (_data.editorId === "edit-area") {
				_apply_model(); // score, template, etc - global editor stuff, not on tab editor, help editor etc
				$(document).on("splitter-resize", function () {
					// resize means recalculating the wrapper width, since it's not dynamic in the plugin
					var w = $(".editor-surface-wrapper","#tab-body").width() - $(".command-block","#tab-body").width();
					$("div.highlightTextarea").css("width", w + 'px');
					$("#"+_data.editorId).highlightTextarea();
				});
			}
		}

	})(Context);
})(window.CourseBuildr = window.CourseBuildr || {});