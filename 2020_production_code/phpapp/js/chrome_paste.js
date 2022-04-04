// Created by STRd6
// MIT License
// jquery.paste_image_reader.js
(function($) {
  var defaults;
  $.event.fix = (function(originalFix) {
    return function(event) {
      event = originalFix.apply(this, arguments);
      if (event.type.indexOf('copy') === 0 || event.type.indexOf('paste') === 0) {
        event.clipboardData = event.originalEvent.clipboardData;
      }
      return event;
    };
  })($.event.fix);
  defaults = {
    callback: $.noop,
    matchType: /image.*/
  };
  return $.fn.pasteImageReader = function(options) {
    if (typeof options === "function") {
      options = {
        callback: options
      };
    }
    options = $.extend({}, defaults, options);
    return this.each(function() {
      var $this, element;
      element = this;
      $this = $(this);
      return $this.bind('paste', function(event) {
        var clipboardData, found;
        found = false;
        clipboardData = event.clipboardData;
        return Array.prototype.forEach.call(clipboardData.types, function(type, i) {
          var file, reader;
          if (found) {
            return;
          }
          if (type.match(options.matchType) || clipboardData.items[i].type.match(options.matchType)) {
            file = clipboardData.items[i].getAsFile();
            reader = new FileReader();
            reader.onload = function(evt) {
              return options.callback.call(element, {
                dataURL: evt.target.result,
                event: evt,
                file: file,
                name: file.name
              });
            };
            reader.readAsDataURL(file);
            return found = true;
          }
        });
      });
    });
  };
})(jQuery);

function doUpload(results, target_obj) {
	console.log("Do Upload", results, target_obj);

	var imgBase64 = results.dataURL.replace(/^data:image\/(png|jpg);base64,/, ""),
		imgExtn = (results.dataURL.indexOf("image/png")==-1)?"jpg":"png";

	target_obj.empty().append("<p>uploading</p>");

	var data = new FormData();
	data.append("extn",imgExtn);
	data.append("base64",imgBase64);
	if (_media_path) data.append("path", _media_path);
	$.ajax({
		url: '/engine/action.asp?action=ajax_pastedimage',
		data: data,
		cache: false,
		contentType: false,
		processData: false,
		type: 'POST',
		success: function(url) {
			if (url.length) {
				if (_current_page && _current_page == "list") {
					var cntnr = $(".image-preview"),
						box = cntnr.children().first().clone();
					box.find("p").remove();
					box.find("img").attr("src", url);
					box.find("input").attr({
						"value": url.split("/").slice(-1).pop(),
						"checked": true
					});
					// console.log(box);
					$(".image-preview").append(box);
					box.get(0).scrollIntoView(true);
					$(document).trigger("do_image_size_thing");
					$(target_obj).removeClass("active").html("<p><span>Paste is ready again</span></p>");
				} else {
					$("#hdnUrl").val(url);
					$("<img />").attr({"src": url}).css("max-width","175px").appendTo($(pasteCatcher).empty());
				}
			}
		}
	});
}

$(function() {

	$("html").pasteImageReader(function(results) {
		doUpload(results, $("#paste_screenshot"));
	});

});

