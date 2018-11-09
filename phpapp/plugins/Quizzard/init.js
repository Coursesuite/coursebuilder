(function (Context, undefined) {

	Context.Quizzard = (function (ctx) {
		var This = ctx;
		var _data = {},
			_tree = {};

		return {
			Init: _init
		}

		function _create() {
		}

		function _init(treeObj) {
			_tree = treeObj;
			_data = _tree.CurrentModel();

			$("#editor").html(Handlebars.getCompiledTemplate("/plugins/Ninjitsu/editor", {}));
			_create();

			if (_data.editorId === "edit-area") {
				_apply_model(); // score, template, etc - global editor stuff
			}

			console.log("quizzard init completed");
		}

	})(Context);
})(window.CourseBuildr = window.CourseBuildr || {});