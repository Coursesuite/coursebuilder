/* Dropzone.options.myAwesomeDropzone = {
  init: function() {
    this
    	.on("addedfile", function(file) {
			setTimeout("location.href += '&newfile=" + escape(file) + "';",753);
		})
		.on("dragover", function () {
			console.log("drag over event");
		    $(".dz-message").addClass("fancy-drop-border");
		})
		.on("dragleave", function () {
			console.log("drag leave event");
		    $(".dz-message").removeClass("fancy-drop-border");
		});
  }
}; */

Handlebars.registerHelper("divvy", function(a,b) {
	return ( parseInt(a,10) / parseInt(b,10) );
});

; (function ($) {
    $.fn.dragScroll = function (options) {
        /* Mouse dragg scroll */
        var x, y, top, left, down, body;
        var $scrollArea = $(this),
        	body = $("body");

        $($scrollArea).attr("onselectstart", "return false;");   // Disable text selection in IE8

        $($scrollArea).mousedown(function (e) {
        //    e.preventDefault();
            down = true;
            x = e.pageX;
            y = e.pageY;
            top = $(this).scrollTop();
            left = $(this).scrollLeft();
        });
        $($scrollArea).mouseleave(function (e) {
            down = false;
        });
        body.mousemove(function (e) {
            if (down) {
                var newX = e.pageX;
                var newY = e.pageY;
                $($scrollArea).scrollTop(top - newY + y);
                $($scrollArea).scrollLeft(left - newX + x);
            }
        });
        body.mouseup(function (e) { down = false; });
    };
})(jQuery);

$(function () {
	
	$('aside').dragScroll();

	$(".check-append-classes :checkbox").click(function(event) {
		var $this = $(this),
			$text = $(".check-append-classes :text");
		if ($this.is(":checked")) {
			$text.val($text.val() + " " + $this.val());
		} else {
			$text.val($text.val().replace($this.val(), ""));
		}
		$text.val($.trim($text.val()));
	});

	var $container = $("article");
	
	$(".select-one").each(function (index, el) {
		var v, css = "";
		if ($("img",el).length > 0) {
			v = $("img",el)
				.attr("src")
				.split("?")[0]
				.split("/").pop();

		} else if ($("input",el).length > 0) {
			css = "get-next-value radio-float-left";

		} else if ($("a",el).length > 0) {
			v = $("a",el).attr("href").split("/").pop();
			css = "radio-float-left";

		}
		var inp = $("<input />")
			.attr({
				type: "radio",
				name: "selection",
				value: v
			})
			.addClass(css)
			.appendTo(el);
	});
	
	$(document).on("click", ".list-group-item", function (event) {
		$(".list-group a").removeClass("active");
		$(this).addClass("active");
		$("#item-feedback").text($(this).text() + " selected");
	}).on("mouseenter", ".selectbox", function (e) {
		var $tools = $("<span>").addClass("actions").appendTo(this),
			_tgt = $(e.target).closest(".selectbox").find("input[name='selection']").val();

/*

https://pixlr.com/editor/
	?s=c
	&referrer=Current%20course
	&image=http%3A//coursebuildr.coursesuite.ninja/courses/sandpit/this_better_bloody_work_this_time/SCO1/en-us/Content/media/00660_splash_1280x800.jpg
	&title=00660_splash_1280x800.jpg
	&method=get
	&exit=http%3A//coursebuildr.coursesuite.ninja/engine/pages/list/%3Fcommand%3Drightimages%26areaid%3Dedit-area%26id%3D235
	&target=http%3A//coursebuildr.coursesuite.ninja/engine/pages/list/external_upload.asp%3Fcommand%3Drightimages%26areaid%3Dedit-area%26id%3D235%26host%3Dcoursebuildr.coursesuite.ninja
	
	
https://pixlr.com/editor/
	?s=c
	&referrer=Current%20course
	&image=http://coursebuildr.coursesuite.ninja/courses/sandpit/this_better_bloody_work_this_time/SCO1/en-us/Content/media/00660_splash_1280x800.jpg
	&title=00660_splash_1280x800.jpg
	&method=get
	&exit=http://coursebuildr.coursesuite.ninja/engine/pages/list/?command=rightimages&areaid=edit-area&id=235
	&target=http://coursebuildr.coursesuite.ninja/engine/pages/list/external_upload.asp?command=rightimages&areaid=edit-area&id=235
	&host=coursebuildr.coursesuite.ninja
	
	
referrer = Current Course	
exit=

*/

		// enhance
		/*
		$("<button>").attr("title","Enhance").click(function (ev) {
			ev.stopPropagation();
			window.resizeBy(340,0); // pixlr ad width
			pixlr.edit({
				referrer: "Current course",
				image: "http://" + _host + "" + _media_path + "/" + _tgt, // not escaped
				title: _tgt,
				service: "express",
				locktitle: true,
				locktarget: true,
				copy: false,
				method: "GET",
				exit: escape(location.href),
				target: "http://" + _host + "/engine/pages/list/external_upload.asp?" + escape(location.href) // _params
			});
		}).append("<i class='icon-eye-open'></i>").appendTo($tools);

		// edit
		$("<button>").attr("title", "Edit").click(function (ev) {
			ev.stopPropagation();
			window.resizeBy(340,0); // pixlr ad width
			pixlr.edit({
				referrer: "Current course",
				image: "http://" + _host + "" + _media_path + "/" + _tgt,
				title: _tgt,
				service: "editor",
				locktitle: true,
				locktarget: true,
				copy: false,
				method: "GET",
				exit: escape(location.href),
				target: "http://" + _host + "/engine/pages/list/external_upload.asp?" + escape(location.href) // _params
			});
		}).append("<i class='icon-edit'></i>").appendTo($tools);
		*/
		// delete
		$("<button>").attr("title", "Delete").addClass("top-gap").click(function (ev) {
			ev.stopPropagation();
			var doit = confirm("This will PERMANENTLY delete:\n\n" + _tgt + "\n\nAre you sure you want to do this?");
			if (doit == true) {
				$.post("/engine/action.asp?id=" + _course_id + "&action=ajax_deletephysicalfile", {
					"currentFilename": _tgt,
					"media": "y"
				}, function (data) {
					$(e.target).closest(".selectbox").fadeOut("fast", function () { $(this).remove(); });
				});
			}
		}).append("<i class='icon-trash'></i>").appendTo($tools);

		
	}).on("mouseleave", ".selectbox", function (e) {
		$(".actions", this).remove();
	});

	var _command_type = "";	
	switch (_command) {
		case "image":
		case "zoomimage":
		case "selectimage":
		case "settings":
		case "backstretch":
		case "caption":
		case "images":
		case "slideshow":
		case "rightimages":
		case "clickimage":
		case "splitimage":
			$("a[data-action='resize']").show();
			_command_type = "image";
			break;
		default:
			$("a[data-action='resize']").hide();
			_command_type = _command
			break;
	}
	
	$("#actions a").click(function (e) {
		e.preventDefault();
		var inps = $("input:checked",$container);
		switch ($(this).attr("data-action")) {
		
		
			case "edit":
				if (inps.length != 1) return alert("Select only one image");
				window.resizeBy(340,0); // pixlr ad width
				pixlr.edit({
					referrer: "Current course",
					image: "http://" + _host + "" + _media_path + "/" + inps.val(),
					title: inps.val(),
					service: "editor",
					method: "get",
					exit: location.href,
					target: "http://" + _host + "/engine/pages/list/external_upload.asp?" + _params
				});
				break;
				
		
			case "resize":
				if (inps.length != 1) return alert("Select only one item");
				popResizeBox(inps);
				// return alert("this one is a bit tricky and I haven't gotten it working yet!");
				break;
				
			case "delete":
				if (_command_type=="image" && inps.length != 1) return alert("Select only one item");
				var doit = confirm("I'm sorry? Did you say you wanted to permanently delete the file " + inps.val() + "?\n\nHere's your chance to back out.");
				if (doit == true) {
					$.post("/engine/action.asp?id=" + _course_id + "&action=ajax_deletephysicalfile", {
						"currentFilename": inps.val(),
						"media": (inps.attr("data-container") === "Content") ? "n" : "y"
					}, function (data) {
						if (inps.attr("data-container") > "") location.href = location.href;
						inps.closest("div.selectbox").fadeOut("fast", function () { $(this).remove(); });
					});
				}
				break;
				
			case "rename":
				if (_command_type=="image" && inps.length != 1) return alert("Select only one item");
				var newname = prompt("Oh, so you don't like that your file is called " + inps.val() + "?\n\nYou'll have to think up a new name for your file then.\n\nFeel free to leave off the extension, I'll put it back for you.");
				if (newname != null) {
					$.post("/engine/action.asp?id=" + _course_id + "&action=ajax_renamephysicalfile", {
						"currentFilename": inps.val(),
						"newFilename": $.trim(newname),
						"media": (inps.attr("data-container") === "Content") ? "n" : "y"
					}, function (data) {
						if (data.indexOf("ok")!=-1) {
							if (inps.attr("data-container") > "") location.href = location.href;
							var fname = data.split("|")[1];
							inps.closest("div.selectbox").find("p > b").text(fname);
							inps.val(fname);
						} else {
							// unsure what went wrong, start over
							location.href = location.href;
						}
					});
				}
				break;
				
			case "refresh":
				location.href=location.href;
				break;
		}
	});

	$(".select-multiple").each(function (index, el) {
		var v, css = "";
		if ($("img",el).length > 0) {
			v = $("img",el)
				.attr("src")
				.split("?")[0]
				.split("/").slice(-1).pop();

		} else if ($("a",el).length > 0) {
			v = $("a",el).attr("href").split("/").pop();

		}
		$("<input />")
			.attr({
				type: "checkbox",
				name: "selection",
				value: v
			})
			.addClass(css)
			.appendTo(el);
	});
	
	/*$(".selectbox img").imagesLoaded(function (instance) {
		for ( var i = 0, len = instance.images.length; i < len; i++ ) {
			var image = instance.images[i],
				name = image.img.src.split("?")[0].split("/").slice(-1).pop().split(".")[0];
			$("<p />")
				.css({
					"box-shadow":"0 2px 5px rgba(0,0,0,.5)",
					"transform":"rotate(-4deg)"
				})
				.html("<b>" + name + "</b><br />" + image.img.naturalWidth + " x " + image.img.naturalHeight)
				.appendTo($(image.img).parent());
		}
	});*/

	$(document).unbind("do_image_size_thing").bind("do_image_size_thing", function () {
		$(".selectbox img").each(function(ix,el) {
			$("<p />")
				.css({
					"box-shadow":"0 2px 5px rgba(0,0,0,.5)",
					"transform":"rotate(4deg)",
					"background-color":"#f90"
				})
				.html(" - loading - ")
				.appendTo($(el).parent());
		}).imagesLoaded().progress(function (imgLoad, image) {
			// for ( var i = 0, len = instance.images.length; i < len; i++ ) {
				// var image = instance.images[i],
				// console.log("image loaded",imgLoad, image);
				var name = image.img.src.split("?")[0].split("/").slice(-1).pop().split(".")[0];
				$(image.img).parent().find("p").remove();
				$(image.img).attr({
					"data-naturalwidth": image.img.naturalWidth,
					"data-naturalheight": image.img.naturalHeight
				});
				$("<p />")
					.css({
						"box-shadow":"0 2px 5px rgba(0,0,0,.5)",
						"transform":"rotate(-4deg)"
					})
					.html("<b>" + name + "</b><br />" + image.img.naturalWidth + " x " + image.img.naturalHeight)
					.appendTo($(image.img).parent());
			// }
		});
	}).trigger("do_image_size_thing");
	
	$(document).on("click", ".selectbox, .input-row", function (event) {
		var $inp = $(this).find("input:first");
		$inp.attr("checked", !$inp.is(":checked"));
		var l = $("input:checked", $container).length;
		$("#item-feedback").text(l + " item" + (l>1?"s":"") + " selected");
		$(".selectbox").removeClass("selected");
		$("input:checked", $container).each(function(index,el) {
			$(el).closest(".selectbox").addClass("selected");
		})
	}).on("click","a[target='_iframe']", function() {
		$("iframe.iframe-preview").show();
	});
	$("iframe.iframe-preview").hide();
	
	//$(window).resize(function () {
	//	$("#_scroll").height($(window).height()/2 - $(".topbar").height());
	//	$("#_iframe").width($("#content").width()).css("background-color","#fff");
	//});
	//$(window).trigger("resize");
	
	//$("#floating-window").draggable({ containment: "parent" });

	function querystring(name) {
	    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
	        results = regex.exec(location.search);
	    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}
	
	$("#done").click(function(e) {
		e.preventDefault();
		// var selection = window.opener.get_selection("edit-area");
		if (window.opener) {

			var list = [],
				inps = $("input:checked",$container),
				region = querystring("areaid");
			if (!region.length) region = "edit-area";
			if (inps.length || $(".list-group a.active").length) {
				if ($(".list-group a.active").length) {
					list.push($(".list-group a.active").text())
				} else {
					if (_command == "clickimage") {
						inps.each(function (index,el) {
							list.push($(el).val());
							list.push("Enter a description for " + $(el).val());
						});
					} else {
						inps.each(function (index,el) {
							if ($(el).hasClass("get-next-value")) {
								list.push($(el).prev().val()); // floated left, but actually in dom AFTER element
							} else {
								list.push($(el).val());
							}
						});
					}
					if ($(".check-append-classes").length && $(".check-append-classes :text").val().length) {
						list.unshift($(".check-append-classes :text").val());
					}
				}
				
				if (_command == "splitimage") { // only handles 2 images
					list = list.slice(0,2);
				}

				switch (_command) {
					case "caption":
						window.opener.replace_selection(region, "{" + _command + " theme|" + list.join("|") + "|" + _selection + "}");
						break;

					case "slideshow":
					case "popup":
					case "popuptext":
					case "link":
					case "linkref":
						window.opener.replace_selection(region, "{" + _command + " " + _selection + "|"+ list.join("|") + "}");
						break;
						
					case "selectimage":
						window.opener.setting_SelectImage(list.join(""), _containerid);
						break;
						
					case "settings":
						var obj = window.opener.document.getElementById(_containerid);
						if (_returnmode == "prepend") {
							obj = window.opener.$("#" + _containerid).parent().parent().find(":text,textarea").get(0);
							obj.value += "<img src='Content/media/" + list.join("") + "' />";
						} else {
							if (_returnmode == "append") {
								obj.value += "<img src='Content/media/" + list.join("") + "' />";
							} else {
								obj.value = "<img src='Content/media/" + list.join("") + "' />";
							}
						}
						try {
							window.opener.updateLayoutHeaderBg(__settings);
						} catch (ex) { 
							// meh
						}
						break;
						
					case "url":
						list[list.length] = _selection;
						window.opener.replace_selection(region, "{" + _command + " " + list.join("|") + "}");
						break;
						
					case "zoomimage":	
						var csss = "";
						list = list.slice(0,3); // ignore more than 2 images plus optional css
						if (list.length==3) csss = list.shift(); // remember classes, but only work with images here
						if (list.length==2 && list[0].indexOf(".") != -1) {
							// we calculated then stored the natural sizes; make the bigger image the first item
							var $img1 = $("input[value='" + list[0] + "']", "#content").prev("img"),
								_i1 = [$img1.attr("data-naturalwidth"), $img1.attr("data-naturalheight")],
								$img2 = $("input[value='" + list[1] + "']", "#content").prev("img"),
								_i2 = [$img2.attr("data-naturalwidth"), $img2.attr("data-naturalheight")];
							// console.log($img1,_i1,$img2,_i2);
							// need to make the bigger image the second parameter. we have sizes written already, lets use that
							//var $img1 = $("input[value='" + list[0] + "']", "#content"),
							//	_i1 = $img1.next("p").html().split("<br>")[1].replace("\"","").split(" x "),
							//	$img2 = $("input[value='" + list[1] + "']", "#content"),
							//	_i2 = $img2.next("p").html().split("<br>")[1].replace("\"","").split(" x ");
							if (parseInt(_i1[0],10)>parseInt(_i2[0],10)||parseInt(_i1[1],10)>parseInt(_i2[1],10)) list.reverse();
						}
						if (csss > "") list.unshift(csss); // re-append classes if required
						window.opener.replace_selection(region, "{" + _command + " " + list.join("|") + "}");
						break;
						
					default:
						window.opener.replace_selection(region, "{" + _command + " " + list.join("|") + "}");
				}
				
				if (window.opener.retriggerHighlighter) window.opener.retriggerHighlighter(region);
				
				window.close();

			} else {
				alert("You need to select something...")
			}
		}
	});

	var newfile = querystring("newfile");
	if (newfile.length) {
		$(":input[value='" + newfile + "']", $container).click(); // .prop('checked', true).get(0).scrollIntoView();
		//$("input:checked", $container).each(function(index,el) {
		//	$(el).closest(".selectbox").addClass("selected");
		//})
	}

	// drag n drop upload
	$container.filedrop({
	    fallback_id: 'manual_upload_off',	   // an identifier of a standard file input element, becomes the target of "click" events on the dropzone
	    url: '/engine/listUpload.asp?id=' + _course_id,     // upload handler, handles each file separately, can also be a function taking the file and returning a url
	    paramname: 'userfile',            // POST parameter name used on serverside to reference file, can also be a function taking the filename and returning the paramname
	    withCredentials: false,          // make a cross-origin request with cookies
	    data: {
	    	"stop": true
	    },
	    error: function(err, file) {
	        switch(err) {
	            case 'BrowserNotSupported':
	                alert('browser does not support HTML5 drag and drop');
	                break;
	            case 'TooManyFiles':
	                alert('too many files');
	                // user uploaded more than 'maxfiles'
	                break;
	            case 'FileTooLarge':
	            	alert("one or more files were too big");
	                // program encountered a file whose size is greater than 'maxfilesize'
	                // FileTooLarge also has access to the file which was too large
	                // use file.name to reference the filename of the culprit file
	                break;
	            case 'FileTypeNotAllowed':
	            	alert("You can only upload jpg, jpeg, png or gif files");
	                // The file type is not in the specified list 'allowedfiletypes'
	                break;
	            case 'FileExtensionNotAllowed':
	            	alert("Files with this extension are not allowed");
	                // The file extension is not in the specified list 'allowedfileextensions'
	                break;
	            default:
	            alert("some error maybe " + err + "\n" + file);
	                break;
	        }
	    },
	    //allowedfiletypes: ['image/jpeg','image/png','image/gif','text/html','text/plain','application/pdf','text/javascript','text/css'],   // filetypes allowed by Content-Type.  Empty array means no restrictions
	    //allowedfileextensions: ['.jpg','.jpeg','.png','.gif','.txt','.htm','.html','.js','.css','.pdf'], // file extensions allowed. Empty array means no restrictions
	    allowedfiletypes: [],
	    allowedfileextensions: [],
	    maxfiles: 25,
	    maxfilesize: 20,    // max file size in MBs
	    queuefiles: 2,
	    dragOver: function() {
	        // user dragging files over #dropzone
	    },
	    dragLeave: function() {
	        // user dragging files out of #dropzone
	    },
	    docOver: function() {
	    	$container.css("background-color", "rgba(255,128,0,.5)");
	        // user dragging files anywhere inside the browser document window
	    },
	    docLeave: function() {
	    	$container.css("background-color", "");
	        // user dragging files out of the browser document window
	    },
	    drop: function() {
	    	$container.css("background-color", "");
	        // user drops file
	    },
	    uploadStarted: function(i, file, len){
	        // a file began uploading
	        // i = index => 0, 1, 2, 3, 4 etc
	        // file is the actual file of the index
	        // len = total files user dropped
	    },
	    uploadFinished: function(i, file, response, time) {
	        // response is the data you got back from server in JSON format.
	        
	        console.log("uploadFinished", i, file, response, time);
	        
			var cntnr = $(".image-preview");
			if (cntnr.length == 0) {
				//console.log(i,file,response,time);
				location.href = location.href; // reload;
				return;
			}
			var box = cntnr.children().first().clone();
			box.find("p").remove();
			box.find("img").attr("src", _media_path + "/" + file.name);
			box.find("input").attr({
				"value": file.name,
				"checked": true
			});
			// console.log(box);
			$(".image-preview").append(box);
			box.get(0).scrollIntoView(true);
	        // console.log("uploadFinished", i, file, response, time);
	    },
	    progressUpdated: function(i, file, progress) {
	        // this function is used for large files and updates intermittently
	        // progress is the integer value of file being uploaded percentage to completion
	    },
	    globalProgressUpdated: function(progress) {
	        // progress for all the files uploaded on the current instance (percentage)
	        // ex: $('#progress div').width(progress+"%");
	    },
	    speedUpdated: function(i, file, speed) {
	        // speed in kb/s
	    },
	    rename: function(name) {
	        // name in string format
	        // must return alternate name as string
	    },
	    beforeEach: function(file) {
	        // file is a file object
	        // return false to cancel upload
	    },
	    //beforeSend: function(file, i, done) {
	        // file is a file object
	        // i is the file index
	        // call done() to start the upload
	    //},
	    afterAll: function() {
	        // runs after all files have been uploaded or otherwise dealt with
	    }
	});
	
	/*$(document).on("change input", "input[type='range']", function () {
		$("#player-size").val($(this).val());
		//$(document).trigger("resize.update");
	}).bind("resize.update", function () {
		var $table = $("#resize-image"),
			size = parseInt($("#player-size").val(),10),
			$tds = $("td[data-divisor]", $table);
		$tds.each(function(index, el) {
			var $el = $(el);
			$el.text(size * parseInt($el.attr("data-divisor"),10));
		});
	}).trigger("resize.update");
	*/
	
	$("input:radio", "#file-list").on("change", function(e) {
		$("li", "#file-list").removeClass("selected");
		if (this.checked) {
			$(this).closest("li").addClass("selected");
			manageFile(this.value);
		}
	}).forEach(function() {
		this.checked = false;
	});
	
});

function manageFile(name) {
	var inp = $(":checked", "#file-list");
	
	document.querySelector("#_iframe").setAttribute("src", _folder + "/SCO1/en-us/" + inp.attr("data-container") + "/" + name);
	$("#file-properties").html(
		"<li><b>Type:</b> " + inp.attr("data-extn") + "</li>" +
		"<li><b>Size:</b> " + inp.attr("data-size") + "</li>" +
		"<li><b>Modified:</b> " + inp.attr("data-date") + "</li>"
	);
}

function popResizeBox(selection) {

		$("#dialogue-resize").remove();
		$("<div />")
			.attr({"id":"dialogue-resize","title":"Resize an image"})
			.appendTo("body");
			
		var img = selection.closest("div").find("img").get(0);
		
		console.log(selection, img);

		$("#dialogue-resize")
			.html(Handlebars.getCompiledTemplate("resize",{
				"width": img.naturalWidth,
				"height": img.naturalHeight,
				"size": 1000
			}))
			.dialog({
				modal: true,
				buttons: {
					Cancel: function () {
						$(this).dialog("close");
					}
				},
				maxHeight: $(window).height() - 100,
				maxWidth: $(window).width() - 200,
				width: $(window).width() / 2,
				open: function (event, ui) {

					var range = $("input[type='range']", "#dialogue-resize").on("input", function () {
						var v = parseInt($(this).val(),10),
							c = v - 10 - 10 - 16; // width - pad-left - pad-right - menu (closed)
						range.attr("data-content", c);
						$("#range-value").text(v);
						$("#range-fixed").text("(actual content = " + c + "px)");
						reCalcWH();
					});
					
					$("#upscale").change(function () {
						reCalcWH();
					});

					function reCalcWH() {
						$("td[data-scale]", "#dialogue-resize").each(function (index, td) {
							// fix scale!
							var scale = parseFloat($(td).attr("data-scale")),
								maxW = parseInt($(range).attr("data-content") * scale, 10),
								w = img.naturalWidth,
								h = img.naturalHeight;
								
							if (($("#upscale").is(":checked") && img.naturalWidth < maxW) || (img.naturalWidth > maxW)) {
								var ratio = maxW / w;
								h = parseInt(h * ratio,10);
								w = parseInt(w * ratio, 10);
							}
							$(td).find("button").text(w + " x " + h);
						});
						$("td[data-fixedwidth]", "#dialogue-resize").each(function (index, td) {
							var maxW = parseInt($(td).attr("data-fixedwidth"),10),
								ratio = maxW / img.naturalWidth,
								w = parseInt(img.naturalWidth * ratio, 10),
								h = parseInt(img.naturalHeight * ratio, 10);
							$(td).find("button").text(w + " x " + h);
						});
					}
					
					$("button", "#dialogue-resize").not("[data-function]").click(function(e) {
						e.preventDefault();
						var wxh = $(this).text().split(" x ");
						$.post("/engine/action.asp?id=" + _course_id + "&action=ajax_resizeclone", {
							"image": selection.val(),
							"width": wxh[0],
							"height": wxh[1],
							"media": "y"
						}, function (newname) {
							// todo: fix the image-add template so we can use it here
							location.href = location.href;
						});
					});
					$("#custom-width", "#dialogue-resize").on("change", function (e) { // auto-set height based on width, typical usage scenario
						var maxW = parseInt($(this).val(),10),
							ratio = maxW / img.naturalWidth;
						$("#custom-height").val(parseInt(img.naturalHeight * ratio, 10));
					});
					$("button[data-function='custom']", "#dialogue-resize").click(function (e) {
						e.preventDefault();
						$.post("/engine/action.asp?id=" + _course_id + "&action=ajax_resizeclone", {
							"image": selection.val(),
							"width": $("#custom-width").val(),
							"height": $("#custom-height").val(),
							"media": "y"
						}, function (newname) {
							// todo: fix the image-add template so we can use it here
							location.href = location.href;
						});
					})
					
					range.trigger("input");

				}
			});
	
}
