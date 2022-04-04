var _magnets_are_go = false,
	_listener,
	$list = $("div[data-meta]"),
	$headers = $(".header-row"),
	_li = {
		opts: ["new","started","inprogress","almostdone","complete","archived"],
		lbl: ["","label-important","label-warning","label-success", "label-info", "label-inverse"]
	};

var findOne = function (haystack, arr) {
    return arr.some(function (v) {
	    if (!v.length) return false;
	    var result = (haystack.indexOf(v) >= 0);
	    if (!result) {
		    result = haystack.some(function (q) {
			    return (q.indexOf(v)>=0);
		    });
	    }
        return result;
    });
};

function filterList(terms) {
	if (terms == "*") terms = "";
	if (!terms.length) { $headers.show(); $list.show(); $("#clear-search").hide(); return; }
	if (terms.length) {
		$("#clear-search").show();
		var vals = (terms.toLowerCase() + " ").split(" ");
		$list.each(function(index,el) {
			var $el = $(el), 
			    ar = $el.attr("data-meta").split(",");
			if (!findOne(ar,vals)) { $el.hide(); return; }
			$el.show();
		});

	// it's not quite this, unfortunately
	// $(".header-row:has(+ .course-row:hidden)").hide();
	
		// if .header-row is followed by any .course-row that is visible, leave it visible
		$headers.hide().each(function (i,j) {
			var vis = false, $items = $(j).nextUntil(".header-row");
			$items.each(function (m,n) {
				if ($(n).is(":visible")) {
					vis = true;
					return false;
				}
			});
			if (vis) $(j).show();
		});
		
	}
}

$(function () {

	$("#search").on("keyup", function (e) {
		filterList($(this).val());
	}).on("blur", function() {
		Cookies.set('search', $(this).val(),{ expires: 365 });
	});
	
	$("#clear-search").on("click", function (e) {
		$("#search").val("");
		filterList("");
		e.preventDefault();
	});
	
	var search = Cookies.get('search');
	if (search && search.length) filterList(search);

    //make the magnets draggable and constrained to the fridge (their parent)
    $('.magnet').live('mouseover',function(){
	    $(this).draggable({
	        containment: 'body',
	        stack:'.magnet',
	        stop: function() {
	        	var deg = Math.floor(Math.random()*6+1)-3;
	        	$(this).css("transform","rotate(" + deg + "deg)");
	            $.post('/engine/action.asp?action=magnet_move', { // save it
	            	x: parseInt($(this).css('left')),
	            	y: parseInt($(this).css('top')),
	            	z: parseInt($(this).css('z-index')),
	            	id: $(this).attr('mid')
	            });
	        }
	    });
	});

	var shiftHeld = false,
		altHeld = false,
		stageVisible = false;
		
	$("header.template-header").on("click","a[href^='#']", function (e) {
		e.preventDefault();
		var tgt = $(e.target.nodeName == "IMG" ? e.target.parentNode : e.target),
			href = tgt.attr("href").replace("#",""),
			name = window.prompt("Name your new course");
		if (name.trim() > "") {
			location.href = "/engine/action.asp?action=newcourse&template=" + href + "&name=" + escape(name);
		}
	});
		
	$("section.course-list").on("click","a[href^='#']", function (e) { // handle buttons
		e.preventDefault();
		var tgt = $(e.target.nodeName == "I" ? e.target.parentNode : e.target),
			href = tgt.attr("href").replace("#",""),
			courseid = tgt.closest(".course-row").attr("data-id"),
			loc = "/engine/action.asp?id=" + courseid + "&action=" + href;
			
		switch (href) {
			case "play":
	    		if (altHeld) loc += "&direct=true";
	    		if (!shiftHeld) loc += "&wrap=true";
	    		window.open(loc);
			break;
			
			case "launch":
				loc += "&direct=true";
	    		if (!shiftHeld) loc += "&wrap=true";
	    		alert(loc);
	    		window.open(loc);
			break;
			
			case "move":
				var _buttons = [];
				$.each(_containers, function (index, value) {
					_buttons.push({
					    "label" : value,
					    "class" : "",
					    "callback": function() {
						    $.post("/engine/action.asp?id=" + courseid + "&action=ajax_movecontainer", {
							    "container": value
							}, function () {
								location.reload();
							});
						}
					});
				});
				_buttons.push({"label": "Cancel", "class": " btn-dialogue-cancel btn-inverse"});
				bootbox.dialog("<h2>Move the course folder</h2><p>Click the name of the folder you want to move this course to. Only folders you can access are shown.</p>", _buttons, { "keyboard"  : true });
			break;

			case "unlock":
			case "lock":
			case "clone":
				location.href = loc; // deal with ajaxifying some other day

			break;

			case "trash":
			case "delete":
				if (window.confirm("This action can not be undone!")) {
					location.href = loc;
				}
			break;		
		}

	}).on("mousedown",function(e) { // handle keyboard modifiers
		shiftHeld = e.shiftKey;
		altHeld = e.altKey;

	}).on("click", ".stage .label", function (e) { // draw and handle stage-selection
		if (stageVisible) {
			$(".staged").remove();
			stageVisible = false;
			return;
		}
		stageVisible = true;
		var index = _li.lbl.indexOf(e.target.getAttribute("class").replace("label ","")),
			value = _li.opts[index],
			rect = e.target.getBoundingClientRect(),
			margin = 5,
			courseid = $(e.target).closest(".course-row").attr("data-id");
		rect['height'] = (rect.bottom - rect.top);
		$(".staged").remove();
		for (var neg=index-1;neg>-1;neg--) {
			$("<div>")
				.css({
					"top": parseInt(rect.top - ((index-neg) * (rect.height + margin)),10) -1 + "px",
					"left": rect.left + rect.width + margin + "px",
					"height": rect.height + "px",
				})
				.html($("<span>").addClass("label " + _li.lbl[neg]).text(_li.opts[neg]))
				.addClass("staged")
				.attr({
					"data-course":courseid,
					"data-index": neg
				})
				.appendTo("body");
		}
		for (var pos=index;pos<_li.opts.length;pos++) {
			if (typeof _li.opts[pos] === 'undefined') continue;
			$("<div>")
				.css({
					"top": parseInt(rect.top + ((pos-index) * (rect.height + margin)),10) -1 + "px",
					"left": rect.left + rect.width + margin + "px",
					"height": rect.height + "px",
				})
				.html($("<span>").addClass("label " + _li.lbl[pos]).text(_li.opts[pos]))
				.addClass("staged")
				.attr({
					"data-course": courseid,
					"data-index": pos
				})
				.appendTo("body");
		}

	});
	
	$(window).on("scroll resize", function (e) { // remove stage-selection
		$(".staged").remove();
		stageVisible = false;
	});

	$("body").on("click","div.staged",function(e) {
		var courseid = $(e.target.parentNode).attr("data-course"),
			index = $(e.target.parentNode).attr("data-index"),
			match = $("div.course-row[data-id='" + courseid + "']").find(".stage");
		$.post("/engine/action.asp?id=" + courseid + "&action=ajax_setstage",{
			"stage": _li.opts[index]
		}, function () {
			match.html($("<span>").addClass("label " + _li.lbl[index]).text(_li.opts[index]));
			$(".staged").remove();
			stageVisible = false;
		});
	});
 
 	$("p.change-label a").each(function () {
		var tgt = $(this),
			val = tgt.find("span").text().toLowerCase()
			mnu = $("<ul>")
				.addClass('dropdown-menu')
				.attr({
					"id":"change-label",
					"role":"menu",
					"aria-labelledby":"dropdownMenu"
				})
				.appendTo(tgt.parent());
			tgt.parent().css("position","relative");
		var opts = ["new","started","inprogress","almostdone","complete","archived"],
			lbl = [""," label-important"," label-warning"," label-success", " label-info", " label-inverse"];
		$.each(_li.opts,function(index,value) {
			$("<li>").append($("<a>").attr("href","#").append($("<span>")
				.addClass("stage-label label"+_li.lbl[index])
				.text(value)))
			.appendTo(mnu);
		});
	});

	$("p.change-label ul.dropdown-menu a").on("click", function (e) {
		e.preventDefault();
		var _id = $(e.target).closest("tr[data-id]").attr("data-id"),
			_val = $(e.target).text();
		$.post("/engine/action.asp?id=" + _id + "&action=ajax_setstage", {
			stage: _val
		}, function (r) {
			$(e.target).closest("td").find(".dropdown-toggle").find("span").replaceWith(r);
		});
	});
	
	$("header.template-header").filedrop({
	    fallback_id: 'manual_upload_off',
	    url: '/engine/pages/index/drop.asp',
	    paramname: 'file',
	    withCredentials: false,
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
	                break;
	            case 'FileTooLarge':
	            	alert("one or more files were too big");
	                break;
	            case 'FileTypeNotAllowed':
	            	alert("You can only upload zip files");
	                break;
	            case 'FileExtensionNotAllowed':
	            	alert("Files with this extension are not allowed");
	                break;
	            default:
	            alert("some error maybe " + err + "\n" + file);
	                break;
	        }
	    },
	    //allowedfiletypes: ['image/jpeg','image/png','image/gif','text/html','text/plain','application/pdf','text/javascript','text/css'],   // filetypes allowed by Content-Type.  Empty array means no restrictions
	    //allowedfileextensions: ['.jpg','.jpeg','.png','.gif','.txt','.htm','.html','.js','.css','.pdf'], // file extensions allowed. Empty array means no restrictions
	    allowedfiletypes: [],
	    allowedfileextensions: ['.zip'],
	    maxfiles: 1,
	    maxfilesize: 50,    // max file size in MBs
	    queuefiles: 1,
	    dragOver: function() {
	    },
	    dragLeave: function() {
	    },
	    docOver: function() {
		    $("body").addClass("dragging-over");
	    },
	    docLeave: function() {
		    $("body").removeClass("dropped dragging-over");
	    },
	    drop: function() {
		    $("body").removeClass("dragging-over").addClass("dropped");
	    },
	    uploadStarted: function(i, file, len){
	        // a file began uploading
	        // i = index => 0, 1, 2, 3, 4 etc
	        // file is the actual file of the index
	        // len = total files user dropped
	    },
	    uploadFinished: function(i, file, response, time) {
	        // response is the data you got back from server in JSON format.
		    $("body").removeClass("dropped dragging-over");
	        
	        console.log("uploadFinished", i, file, response, time);
	        if (response.StdErr !== 0) {
		        alert("Error uploading course\n\n" + response.StdErr);
		        return;
	        }
	        location.href = "/engine/pages/edit/?id=" + response.courseid;
	        //location.reload();
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
	

});