(function (Context, undefined) {

	Context.Ninjitsu = (function (ctx) {
		var This = ctx;
		var _data = {};

		return {
			Init: _init
		}

		function _create(value, $tab_body) {
			var page_editor = $("<textarea id='edit-area'></textarea>")
	    		.text(value)
				.appendTo($tab_body)
				.attachEditor();

			window.fd.logging = false;
			var dz = new FileDrop('edit-area',{input: false});
			dz.event('send', function (files) {
				files.each(function(file) {
					console.dir(file);
					file.event('done', function(xhr) {
						console.dir(xhr);
					    if (file.type.indexOf("image/")!==-1) {
					        replace_selection(container, "{image box-shadow|" + file.name + "}");
					    } else {
						   //  replace_selection(container, "{external " + file.name + "|link to file}")
						    replace_selection(container, "{linkref hyperlink-text|" + file.name + "}");
					    }
					});
					file.sendTo('/app/edit/action/' + window.CourseBuildr.Course.id + '/file.dnd/');
				});
			});

		 // 	jQuery("#edit-area").filedrop({
			//     fallback_id: 'manual_upload_off',	   // an identifier of a standard file input element, becomes the target of "click" events on the dropzone
			//     url: '/app/edit/action/' + window.CourseBuildr.Course.id + "/file.dnd/",     // upload handler, handles each file separately, can also be a function taking the file and returning a url
			//     paramname: 'file',            // POST parameter name used on serverside to reference file, can also be a function taking the filename and returning the paramname
			//     withCredentials: false,          // make a cross-origin request with cookies
			//     data: {
			//     	"stop": true
			//     },
			//     error: function(err, file) {
			//     	alert(err);
			//     	console.log("enable_drag_image_to_editor",err,file);
			//     },
			//     allowedfiletypes: ['image/jpeg','image/png','image/gif','application/pdf','application/x-pdf'],   // filetypes allowed by Content-Type.  Empty array means no restrictions
			//     allowedfileextensions: ['.jpg','.jpeg','.png','.gif','.pdf'], // file extensions allowed. Empty array means no restrictions
			//     maxfiles: 1,
			//     maxfilesize: 20,
			//     uploadFinished: function(i, file, response, time) {
			// 	    if (file.type.indexOf("image/")!==-1) {
			// 	        replace_selection(container, "{image box-shadow|" + file.name + "}");
			// 	    } else {
			// 		   //  replace_selection(container, "{external " + file.name + "|link to file}")
			// 		    replace_selection(container, "{linkref hyperlink-text|" + file.name + "}");
			// 	    }
			//     }
			// });
		}

		function _init(obj) {
			_data = obj;
			$("#editor").html(Handlebars.getCompiledTemplate("/plugins/Ninjitsu/editor", {}));
			_create(_data.model.content, $("#tab-body"));

			$("#page_grid li:not(.disabled) a").on("click", function (event) {
				event.preventDefault();
				$("#page_grid li:not(.disabled)").removeClass("active");
				$(this).parent().addClass("active");
				$editing_item.attr("template", $(this).attr("data-grid"));
				makeDirty(true);
			});
		}

		function _save() {
			_model.content = "";
		}

	})(Context);
})(window.CourseBuildr = window.CourseBuildr || {});