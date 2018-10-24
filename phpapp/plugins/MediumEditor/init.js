(function (Context, undefined) {

	Context.MediumEditor = function (ctx) {
		var This = ctx;
		var _data = {};
		var Page = {};

		return {
			Init: _init
		}

		Page._loaded = false;
		Page.CurrentId = function () {
			return Page._current_id;
		}

		function _init(obj) {
			_data = obj;

			Page._editor = new MediumEditor('#editor',{
				buttonLabels: 'fontawesome',
			    toolbar: {
			        buttons: ['bold', 'italic', 'orderedlist', 'unorderedlist', 'anchor', 'outdent', 'indent', 'h2', 'h3', 'removeFormat']
			    },
			    allowMultiParagraphSelection: true,
			    anchor: {
			    	targetCheckbox: true
			    },
			    extensions: {
			        'autolist': (new AutoList())
			    },
			});

		    $('#editor').mediumInsert({
		        editor: Page._editor
		    });

		    Page._editor.subscribe('editableInput', function (event, editable) {
		    	if (!Page._loaded) return
		    	if (Page._changeTimeout) clearTimeout(Page._changeTimeout);
		    	Page._changeTimeout = setTimeout(Page.Save,4999);
			});

		    // animated toolbar position
		    if (false) {
				var placeholder = document.querySelector('.toolbar-placeholder');
				var toolbar = document.querySelector('.medium-editor-toolbar');
				var toolbarClone;
				var hideTimer;

				function calculatePlaceholderPosition(animate) {
					var scaleFactor = window.innerWidth >= 768 ? 1 : 0.9; // 1.2
					// var scaleFactor = 1;
					var scaledHeight = toolbar.offsetHeight * scaleFactor;

					toolbar.classList.add('placeholder');
					placeholder.style.height = scaledHeight + 'px';
					toolbar.style.top = placeholder.offsetTop + 'px';
					toolbar.style.left = ((window.innerWidth/2) - (toolbar.offsetWidth/2)) + 'px';

					if (!toolbarClone) {
						toolbarClone = toolbar.cloneNode(true);
						toolbarClone.id = '';
						toolbarClone.classList.add('toolbar-placeholder-clone');
						toolbarClone.classList.remove('fade-in');
					}

					toolbarClone.style.top = toolbar.style.top;
					toolbarClone.style.left = toolbar.style.left;
					toolbarClone.style.height = toolbar.style.height;

					placeholder.innerHTML = '';
					placeholder.appendChild(toolbarClone);

					if (animate) {
						toolbar.classList.add('fade-in');
					}
				}

				calculatePlaceholderPosition(true);

				Page._editor.subscribe('showToolbar', function () {
					clearTimeout(hideTimer);
					toolbar.classList.remove('placeholder');
				});

				Page._editor.subscribe('hideToolbar', function () {
					clearTimeout(hideTimer);

					hideTimer = setTimeout(function () {
						calculatePlaceholderPosition();
						toolbar.classList.add('placeholder');
					}, 300);
				})
				window.addEventListener('resize', calculatePlaceholderPosition);

			}

			Page.Edit = function (obj) {
				if (obj.status === "error") return;
				if (obj.content) {
					if (!Page._editor) Page.InitEditor();
					$("#editor").html("");
					Page._editor.setContent(obj.content,0);
					Page._loaded = true;
				}
			}
			Page.Save = function () {
				$("#save-icon").text("save");
				var allContents = Page._editor.serialize();
				console.log(Page._editor, Page._editor.serialize());
				if (!allContents) { $("#save-icon").text(""); return; }
				action("page.save",undefined,{
					id: Page._current_id,
					content: allContents.editor.value
				}, function () {
			    	$("#save-icon").text("");
				});
			}
		}
	})(Context);
})(window.CourseBuildr = window.CourseBuildr || {});