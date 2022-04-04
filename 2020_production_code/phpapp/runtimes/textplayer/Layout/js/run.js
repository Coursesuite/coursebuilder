
/* =========================================================================================================
 *
 * 	The [mostly] jQuery part of the player
 *	Author: tim.stclair@gmail.com
 *
 * ========================================================================================================= */

var pageLayout; // used by jquery.layout.min.js
var _avideSep = "#~"; // used by avide quiz / scorm suspend data persistance
var _isTop = false; // is this the top frame?
var __settings,
	_hasAutoClosed = false,
	_isClosed = true,
	_$ct = null;

// note: file executes in the /en-us/ folder; configuration etc stored as siblings to this folder

//	window.onerror = function () {
//		alert(document.location.href);
//	}

// helper extensions & plugins
Array.max = function( array ) {
    return Math.max.apply( Math, array );
};
Array.min = function( array ) {
    return Math.min.apply( Math, array );
};

// listener for popstate event triggered by pressing back/forward in browser
// in our case we don't have a href, so only work if there's a state.id stored
$( window ).bind( "popstate", function( e ) {
    var state = history.state;
    if (state && state.id) LoadContent(state.id - 0, true); // since clickLevel is doing this anyway
});

$(document).ready(function () {
	
	function main() {
	
		overrideLanguage(__settings);
		
		$(document).bind("hide_submenus", function () {
			if ($("#toc_submenu").length)
				$("#toc_submenu").fadeOut(50, function () { $(this).remove() });
		});
	
		// Handle all interface buttons
		//console.log("Actionable buttons",$("a[data-action]"));
		$("a[data-action]").click(function (event) {
			event.preventDefault();
			var actionNode = (event.target.nodeName.toUpperCase() == "I" || event.target.nodeName.toUpperCase() == "SPAN") ? $(event.target).parent() : $(event.target); // click on icon inside hyperlink
			var btnAction = actionNode.attr("data-action");
			switch (btnAction) {
				
				case "toggle":
					$(".ui-layout-west").toggleClass("menu-open");
					break;
			
				case "toc-expand":
					if ($("#toc_submenu").length) {
						$(document).trigger("hide_submenus");
					} else {
						var submenu = $("<div ></div>")
									.attr("id","toc_submenu")
									.addClass("toc-submenu")
									.append(actionNode.next("ul").clone(true))
									.css({
										position: "absolute",
										top: parseInt($(".ui-layout-north").height(),10),  // (actionNode.offset().top + actionNode.outerHeight(true)),
										left: actionNode.closest("li").offset().left,
										width: "256px",
										display: "none",
										"z-index": 10,
										"background-color": "#fff"
									})
									.appendTo("body")
									.fadeIn(200);
						submenu.find("a[data-action='toc-expand']").remove();
						submenu.find("ul").addClass("icons-ul");
						submenu.find("li").prepend("<i class='icon-li icon-caret-right'></i>");
					}
					break;

				case "pan-left":
					break;
	
				case "pan-right":
					break;
	
				case "toc-node":
					gotoPage(actionNode.attr("href"));
					break;

				case "forward":
					NextPage();
					break;
					
				case "back":
					PreviousPage();
					break;

				case "home":
					HomePage();
					break;

				case "progress":
					var cPageType = getCurrentPageType().toLowerCase();
					if (cPageType=='quiz'||cPageType=='text'||(cPageType.indexOf('question')!=-1)) {
						return alert("You cannot view progress whilst viewing a " + cPageType + ".");
					}
					var t = $(actionNode);
					triggerFrumbox(null, Handlebars.getCompiledTemplate(btnAction, getProgressJSON()), {
						t: t.offset().top,
						l: t.offset().left,
						w: t.width(),
						h: t.height()
					}, {
                        top: $(document).scrollTop() + 50, 
                        left: $(document).scrollLeft() + 50,
                        width: ($(document).width() - 100) + 10,
                        height: ($(document).height() - 100) + 10
                    }, function() {
						$(".jqueryui-tabs", "#frumbox-iframe").tabs();
						$(".print-icon", "#frumbox-iframe").click(function (ev) {
							ev.preventDefault();
							$.cachedScript(__global_root + "/Layout/js/jspdf.min.js").done(function () {
								var doc = new jsPDF();
								$("#tab_labels", "#frumbox-iframe").hide();
								doc.fromHTML($("#frumbox-iframe").get(0), 15, 15, {
									'width': 170
								});
								$("#tab_labels", "#frumbox-iframe").show();
								doc.save(__settings.course.name + " Progress.pdf");
							});
						})
					}, {                // overlay appearance
                        opacity: 0.5,
                        colour: "#000000",
                        speed: 250
                    });
					break;

				case "glossary":
				case "references":
					var json = appendSettings(btnAction), // load once and cache
						t = $(actionNode);
					triggerFrumbox(null, Handlebars.getCompiledTemplate(btnAction, json), {
						t: t.offset().top,
						l: t.offset().left,
						w: t.width(),
						h: t.height()
					});
					break;
					
				case "help":
					var t = $(actionNode);
					$.get(__global_root + "/Configuration/help.txt", function (data) {
						triggerFrumbox(null, Handlebars.getCompiledTemplate(btnAction, {
							helpfile: processString(data, "auto", false)
						}), {
							t: t.offset().top,
							l: t.offset().left,
							w: t.width(),
							h: t.height()
						});
					});
					break;
			}
			actionNode.blur();
		});		

		pageLayout = $('body').layout({
			applyDefaultStyles:		false,
			showErrorMessages:		false,
			slidable:				true,
			fxName:					"slide",		// none, slide, drop, scale
			fxSpeed_open:			750,
			fxSpeed_close:			1500,
			fxSettings_open:		{ easing: "easeOutBounce" },
			fxSettings_close:		{ easing: "easeOutQuint" },
			north: {
				size : __settings.layout.panesize.north,
				spacing_open : 0,
				closable : false,
				resizable : false
			},
			south: {
				size : __settings.layout.panesize.south,
				closable : false,
				resizable : false,
				spacing_open: 0
			},
			west: {
				size : __settings.layout.panesize.west,
				togglerLength_closed: 0,
				togglerLength_open: 0,
				initClosed: (__settings.layout.toc == false), // header is invisible on iphone (via media query); in that case hide the toc to begin with
				onopen_end: function () {
					resizeIframe();
					$(document).bind('keyup.menubind', 'up', function() {
						PreviousPage()
						return true;
					}).bind('keyup.menubind', 'down', function () {
						NextPage();
						return true;
					});
				//	changeToggle("open");
				},
				onclose_end: function () {
					$(document).unbind('.menubind');
					resizeIframe();
				//	changeToggle("close");
				},
				resizable: false,
				spacing_open: 16,
				spacing_closed: 16,
				slideTrigger_open: "click",
				slideTrigger_close: "click",
				slideDelay_open: 0,
				hideTogglerOnSlide: true
			},
			east: { // the east pane is a dummy that we use to set the correct margins on content
				size: __settings.layout.panesize.east,
				initClosed: true,
				spacing_open: 0,
				closable: false,
				resizable: false,
				spacing_closed: 0
			}
		});

		$(document).bind("check.width", function () {
			if (__settings.layout.toc) { // if toc is not hidden, investigate autohide settings
				if (__settings.layout.autohide && $("body").width() <= __settings.layout.minwidth) {
					_hasAutoClosed = true;
					pageLayout.close("west");
				} else if (_hasAutoClosed && __settings.layout.autohide && $("body").width() > __settings.layout.minwidth) {
					pageLayout.open("west");
				}
			}
		});
		
		$(document).bind('keydown', 'ctrl+m', function () {
			console.log("control + m");
			pageLayout.toggle('west');
			return false;
		}).bind('keyup', 'left', function() {
			PreviousPage()
			return true;
		}).bind('keyup', 'right', function () {
			NextPage();
			return true;
		}).bind('keydown', 'ctrl+o', function () {
			console.log("control + o");
			HomePage();
			return false;
		});

		$(window).smartresize(function(){
			$(document).trigger("check.width");
		});
		
		// change the scale of the page so that re-orienting the mobile device causes a scaling change, toggles menus, etc
		// TODO: may need to extend this for other tablets?
		if (__settings.layout.maxzoom != null && _sniff_isTablet) $('meta[name="viewport"]').attr("content","width=device-width, minimum-scale=1.0, maximum-scale=" + __settings.layout.maxzoom + ", initial-scale=1.0");

		if (__settings.layout.autohide && _sniff_isTablet) {

			// auto close the nav index in vertical orientation if Settings.xml allows it
			$(window).bind('orientationchange', function(event) {
				if(window.orientation % 180 == 0) {
					pageLayout.close("west");
				} else {
					pageLayout.open("west");
				}
			});

			// close left pane initially if orientation isn't set
			if (window.orientation % 180 == 0) {
				setTimeout(function () {
					pageLayout.close("west");
				}, 888); // delay allows page to draw
			}
		}
		
		$(document).trigger("check.width");

		// tell layout manager about pane changes
		if ((__settings.layout.imageheader.visible !== true) && (__settings.layout.titleheader.visible !== true)) {
			pageLayout.hide("north");
		}
			
		// bind stuff on this page
		reBindThingsThatMightBeDynamicallyLoaded($("#contentContainer"));
	}

	function overrideStrings(json) {
		$.each(json.strings, function (index, value) {
			eval(value.key + "= \"" + value.text + "\"");
		});
	}
	
	// load begins with bringing in the config data, which is stored in a fixed location
	// them applying it to the template - Handlebars does the rest
	$.getJSON(__global_root + "/Configuration/settings.json", function (json) {
		__settings = json;
		overrideStrings(__settings);
		appendSettings("images");  // load images.json and make it available at __settings.images[]
		$("body").append(Handlebars.getCompiledTemplate("player",__settings));
		loadCourse();
		main();
	});
	
	// load PIE.js on demand, if required (note shared run.js file)
	Modernizr.load({
    	test: Modernizr.borderradius,
        nope: __global_root + '/Layout/js/PIE.js',
	    complete: applyPIE
    });
	
});

function bindSlideBoxes ($owner) {
	$(".slide-box",$owner).each(function (index,el) {
		var $obj = $(el).addClass("clearfix"),
			$container = $(".pages", $obj),
			$navigator = $(".navigator", $obj),
			$pages = $(".page", $container),
			$first = $pages.eq(0),
			orientation = $obj.attr("data-orientation"),
			_currentPage = 0,
			gotoPane = function(index,d) {
				if (index<0 || index>$pages.length-1) return;
				_currentPage = index;
				var $this = $pages.eq(index),
					_x = 0- parseInt($this.attr("data-position-x"),10),
					_y = 0- parseInt($this.attr("data-position-y"),10);
				$("span", $navigator).text("Page " + (_currentPage+1) + " of " + $pages.length);
				$first.animate({"margin-left":_x,"margin-top":_y},200);
			}

		var _w = $obj.parent().width();
		$pages
			.append($("<div></div>").addClass("clearblock")) // each .page
			.width(_w)
			.equaliseHeights()
			.each(function (i,o) {
				// if (i==0 && orientation=='vertical') $(o).css({"margin-top":0,"padding-top":0}); // -o.offsetTop);
				$(o).attr("data-position-x", (orientation=="vertical" ? 0 : i*_w)).attr("data-position-y", (orientation=="vertical" ? parseInt(o.offsetTop,10) : 0));
			});
		var _h = $first.height();
		$container.height(_h).width(_w); // .pages
		$obj.addClass('unselectable'); // .height(_h + $navigator.outerHeight()).width(_w); // .slide-box
		if ($.browser.msie && $.browser.version < 10) makeUnselectable($obj.get(0)); // TODO: fix betterer
		$obj.swipe({
			swipe: function(event, direction, distance, duration, fingerCount) {
				switch (direction) {
					case "up":
					case "left":
						gotoPane(_currentPage+1,direction);
						break;
					case "down":
					case "right":
						gotoPane(_currentPage-1,direction);
						break;
				}
			}
		});
		$(".action-minus", el).swipe({
			tap: function () {
				gotoPane(_currentPage-1);
			}
		});
		$(".action-plus", el).swipe({
			tap: function () {
				gotoPane(_currentPage+1);
			}
		});
	});
}

function reBindThingsThatMightBeDynamicallyLoaded($page) {
	
	// var $page = $("#contentContainer"); // we might have a clone we are still animating out, so only bind to the active

	function toggleFeedback(el, ar) {
		var $div = $(".feedback", el).hide();
		if (ar.length === 0) return;
		$div.removeClass("hide").find("span").text(ar.join(", "));
		$div.fadeIn(1500);
	}
	
	$(".split-image",$page).each(function (index, el) {
		$(el).splitImage({
			handle: __global_root + "/Layout/media/handle.png",
			colour: __settings.layout.basecolour
		});
	});
	
	bindSlideBoxes($page);
	
	$(".col-backstretch", $page).each(function (index, el) {
		var $img = $(el),
			$obj = $img.closest("div[class^='col-']"),
			path = $img.attr("src"),
			_dock = $img.hasClass("bg-contain");
		$img.remove();
		if (_dock) {
			$obj.css({
				"background-image":"url(" + path + ")",
				"background-size":"contain",
				"background-position":"bottom center",
				"background-repeat": "no-repeat"
			});
		} else {
			$obj.backstretch(path);
		}
	});

	$(".grid-backstretch", $page).each(function (index, el) {
		var $img = $(el),
			$obj = $img.closest("div.grid"),
			path = $img.attr("src"),
			_dock = $img.hasClass("bg-contain");
		$img.remove();
		if (_dock) {
			$obj.css({
				"background-image":"url(" + path + ")",
				"background-size":"contain",
				"background-position":"bottom center",
				"background-repeat": "no-repeat"
			});
		} else {
			$obj.backstretch(path);
		}
	});
	
	$(".page-backstretch", $page).each(function (index, el) {
		var $img = $(el),
			$obj = $img.closest("div.ui-layout-center"),
			path = $img.attr("src"),
			_dock = $img.hasClass("bg-contain");
		if ($("#frumbox-iframe").length) {
			$obj = $img.closest("#frumbox-iframe");
		}
		$img.remove();
		if (_dock) {
			$obj.css({
				"background-image":"url(" + path + ")",
				"background-size":"contain",
				"background-position":"bottom center",
				"background-repeat": "no-repeat"
			});
		} else {
			$obj.backstretch(path);
		}
	});
	
	$page.on("click", "[data-toc]", function (e) {
		e.preventDefault();
		LoadContent($(this).attr("data-toc"));
	});
	
	// load back any data already stored by a quick quiz, assumes one per page
	$("div.inline-checklist,div.inline-checkimage",$page).each(function (index, el) {
		var $el = $(el),
			_feedback = [],
			_isImage = $el.hasClass("inline-checkimage");
		$("a[href='#save']", $el).click(function (event) {
			event.preventDefault();
			var _sData = [], _msg = [];
		    $("input:checked", $el).each(function () {
		    	var inp = $(this);
		    	_sData.push(inp.val());
				_msg.push(_isImage ? inp.attr("data-label") : $.trim(inp.next().text()));
		    });
		    setState($el.attr("data-scormid"), _sData.join(_avideSep));
		    toggleFeedback($el,_msg);
		});
	});

	$("div.inline-checktf",$page).each(function (index, el) {
		var $el = $(el),
			_feedback = [];
		$("a[href='#save']", $el).click(function (event) {
			event.preventDefault();
			var _sData = [];
		    $("input:checked", $el).each(function () {
		    	var $this = $(this);
		    	if ($this.val() == 1) {
		    		_sData.push($(this).closest("div").attr("data-index")); // radios have different values for the same name group, so we have to store the index
		    	}
		    });
		    setState($el.attr("data-scormid"), _sData.join(_avideSep));
		    toggleFeedback($el,[(_sData > "" ? "Your answers have been saved" : "")]);
		});
	});
	// replace body vars (e.g. using template renderer in player.js)
	$("[data='rp-replace-vars']").each(function () {
		if (checkCourseCompletion() == "completed") {
			$("#rp-competent").show();
			$("#rp-notyetcompetent").hide();
		} else {
			$("#rp-competent").hide();
			$("#rp-notyetcompetent").show();
		}
		replaceVars($(this));
	});


	//TODO: clean up
	$("div.inline-survey div.range div.label",$page).equaliseWidths();
	$("div.inline-survey div.range",$page).buttonset(); // jquery-ui
	$("div.inline-survey",$page).each(function(index,el) {
		var $el = $(el);
		$("a[href='#save']", $el).click(function (event) {
			event.preventDefault();
			var _sData = [];
		    $("div.range", $el).each(function (ind,div) {
		    	_sData.push($(div).find(":checked").val()); // so _sData[@index] becomes value of selected radio
		    });
		    // console.log("survey", $el.attr("data-scormid"), _sData.join(_avideSep))
		    setState($el.attr("data-scormid"), _sData.join(_avideSep));
		    toggleFeedback($el,[""]);
		});
	});

	$(".inline-shortanswer").each(function (index, el) {
		var $el = $(el),
			$ta = $("textarea", $el).keypress(function (event) {
				var $this = $(this),
					max = parseInt($this.attr("maxlength"),10),
					len = $this.val().length;
				if (event.which < 0x20) return;
				if (len >= max) event.preventDefault(); // IE<10, Opera
			}).keyup(function (event) {
				var $this = $(this),
					max = parseInt($this.attr("maxlength"),10),
					len = $this.val().length;
				$this.parent().next().text((max-len) + " characters remaining");
			});
		$("a[href='#save']", $el).click(function (event) {
			event.preventDefault()
			setState($el.attr("data-scormid"), LZString.compress($ta.val()));
		    toggleFeedback($el,[""]);
		})
	});

	// sequenced fadein
    $(".rp-fadein",$page).hide().each(function(index, el){
    	setTimeout(function () {
    		$(el).fadeIn(1234)
		}, 500 * (index+1));
	});

    $(".rp-fadeinfast",$page).hide().each(function(index, el){
    	setTimeout(function () {
    		$(el).fadeIn(250)
		}, 200 * (index+1));
	});

	// sequenced slide in
    $(".rp-slidein",$page).hide().each(function(index, el){
    	setTimeout(function () {
    		$(el).slideDown(258)
		}, 250 * (index+1));
	});

	// sequenced bounce in
    $(".rp-bouncein",$page).hide().each(function(index, el){
    	setTimeout(function () {
    		$(el).effect("bounce", 123,
    		function () {
				if (window.PIE) {$(el).css("background-color","#fff"); PIE.attach(el) }; 
			});
		}, 250 * (index+1));
	});
	
	// sequenced blind show
	$(".rp-blindin",$page).hide().each(function(index, el){
    	setTimeout(function () {
    		$(el).effect("blind", {mode: "show"}, 567)
		}, 250 * (index+1));
	});

	// sequenced fadein for list items
    $(".rp-fancylist li",$page).css("opacity",0).each(function(index, el){
    	setTimeout(function () {
    		$(el).animate({
    			"opacity" : 1
    		},250)
		}, 750 * (index+1));
	});
	
	function showQtip(event, callback) {
		var $el = (event.target.nodeName != "A") ? $(event.target).closest("a, button") : $(event.target),
			_button = (event.target.nodeName == "BUTTON" || event.target.parentNode.nodeName == "BUTTON"),
			_qtip = {
				show: {
					ready: true,
					modal: {
						on: true,
						blur: true
					}
				},
				hide: 'unfocus',
				style: 'qtip-bootstrap',
				position: {
					at: 'center ' + (_button ? 'top':'right'),
					my: 'center left',
					viewport: $('#contentContainer'),
					adjust: { method: 'flipinvert shift', resize: true },
					target: $el
				},
				content: {
					text : function() {
						return unescape($el.attr("data-tip"));
					},
					button: true
				},
				events: {
					render: function (event, api) {
						if (pageLayout) pageLayout.close("west");
					},
					visible: function (event, api) {
						var $this = $("#" + api._id).on("click", "a[data-toc]", function (e) {
							api.hide(event);
							e.preventDefault();
							LoadContent($(this).attr("data-toc"));
						});
						var id = api._id;
						var el = document.getElementById(id),
							t = el.getBoundingClientRect(),
							q = document.getElementById('contentContainer').getBoundingClientRect();
						if (t.top<q.top) {console.log("fix top", t.top,q.top); $this.qtip('option', 'position.adjust.y', -(q.top-t.top)); }
						if (t.left<q.left) {console.log("fix left", t.left,q.left); $this.qtip('option', 'position.adjust.x', -(q.left-t.left)); }
						//if (t.right>q.right) {console.log("fix right", t.right,q.right); el.style.left = (t.left - (q.right-t.right)) + "px"; } 
						//if (t.bottom>q.bottom) {console.log("fix bottom", t.bottom,q.bottom); el.style.top = (t.top - (q.bottom-t.bottom)) + "px"; }
						console.dir("envent visible showqtuip");
						if (jQuery.isFunction(callback)) callback();
					}
				}		
			};
		if (_button) {
			_qtip.content['title'] = function () {
				var _title = $el.attr("data-title");
				if (_title && _title.length) return unescape(_title);
				return $el.text();
			}
		}
		$("<div ></div>").qtip(_qtip).qtip('api');
	}
	
	// buttons that pop up a qTip
	$(".tiptext, .tipbutton",$page).click(function (event) {
		showQtip(event, function () {
			console.log("show qtip callback");
			reBindReferences();
		});
		event.preventDefault();
	});
	
	$(".goto").each(function (index, el) {
		var $el = $(el);
		$el.click(function (e) {
			e.preventDefault();
			var $tabs = $el.closest(".ui-tabs"),
				$li = $("ul.ui-tabs-nav > li:contains('" + $el.attr("data-destination") + "')", $tabs); // ,
				// _idx = parseInt($li.attr("aria-labelledby").replace("ui-id-",""),10)-1;
			if ($li.length) {
				$tabs.tabs("enable", $li.index());
				$tabs.tabs("option", "active", $li.index());
			}
		});
	});

	$(".glossary-term",$page).qtip({
		show: 'click',
		hide: 'unfocus',
		style: 'qtip-default qtip-rounded qtip-shadow',
		position: {
			at: 'bottom center',
			my: 'top left',
			adjust: {mouse: true },
			viewport: $(window)
		},
		content: {
			text : function() {
				return unescape($(this).attr("data-tip"));
			}
		},
       show: {
            effect: function() {
                $(this).slideDown();
            }
        },
        hide: {
            effect: function() {
                $(this).slideUp();
            }
        }
	});
	
	$(".img-zoom").each(function (ind,el) {
		$(el)
			.zoom({
				url: $(el).find("img").attr("data-url"),
				on: (_sniff_isTablet ? "grab" : "mouseover")
			});
	});
	
	// scales an image to fill the viewport, click to close again
	$(".rp-zoomable",$page).click(function() {
		var elm = $(this),
			cM = 25,
			cc = $("#contentContainer"),
			sT = cc.scrollTop(),
			sL = cc.scrollLeft(),
			aH = cc.height(), //$(document).height();
			aW = cc.width(), // $(document).width();
			cH = aH-(cM*2),
			cW = (elm.width()/elm.height()) * cH,
			lightbox = $("<div ></div>").css({
				position: "fixed",
				zIndex: 9990,
				top: cc.css("top"),
				left: cc.css("left"),
				width: cc.css("width"),
				height: cc.css("height"),
				"background-color": "rgba(255,255,255,.5)",
			}).appendTo(cc),
				clone = elm.clone().removeClass("rp-zoomable").appendTo(lightbox).css({
				position: "absolute",
				zIndex: 9999,
				top: elm.offset().top + sT,
				left: elm.offset().left + sL,
				opacity: 0,
				display: "block",
				cursor: "pointer",
				"max-width": cW,
				"background-color":"#ffffff"
			}).click(function () {
				// "fall" out of frame
				$(this).animate({
					top: (aH - cH)/2 + (cH/4) + sT,
					opacity: 0
				}, 250, function () {
					$(this).remove();
					lightbox.remove();
				});
			}).animate({
				top: (aH - cH)/2, //  + sT,
				left: Math.max((aW/2),(cW/2)) - Math.min((aW/2),(cW/2)) + sL,
				width: cW,
				height: cH,
				opacity: 1
			}, "fast");
	});

	// causes an overlay effect (frumbox) to appear
	$("a[rev=overlay], .jDialogButton, .rp-button-dialogue, a[video-iframe]",$page).click(function (event) {
		event.preventDefault();
		var t = $(this),
			href = t.attr("href");
		t.blur();
		if ($("#contentContainer").length) {
			if (href.toLowerCase().indexOf("en-us/content/parse") != -1) { // local content; ajax load so styles apply
				$.get(href, function (data) {
					triggerFrumbox(null, processString(data, "auto", false), {
						t: t.offset().top,
						l: t.offset().left,
						w: t.width(),
						h: t.height()
					},null,function () {
						// !Apply jquery tabs to parsed content, may need other functions here too 
						reBindThingsThatMightBeDynamicallyLoaded($("#frumbox-inner"));
					});
					
				});
			} else if (t.attr('video-iframe') !== undefined) { // full screen video
					var playerCode = videoPlayerCode(t.attr('video-iframe'), 0, $(document).width() - 130, $(document).height() - 130);

					triggerFrumbox(null, playerCode, {
						t: t.offset().top,
						l: t.offset().left,
						w: t.width(),
						h: t.height()
					}, {
                        top: $(document).scrollTop() + 50, 
                        left: $(document).scrollLeft() + 50,
                        width: ($(document).width() - 100) + 10,
                        height: ($(document).height() - 100) + 10
                    },
                    function() {
                    	if (playerCode.indexOf("ytvideo")) {
                    		var url = t.attr('video-iframe').split("watch?v=").pop().split("&")[0];
	                    	EmbedAndPlay_Youtube(url, "#frumbox-iframe");
                    	}
	                    $("#frumbox-iframe").css({
		                    "overflow":"hidden",
		                    "overflow-x":"hidden",
		                    "overflow-y":"hidden"
	                    });
                    }
					, {                // overlay appearance
                        opacity: 0.5,
                        colour: "#000000",
                        speed: 250
                    });

			} else {
				triggerOverlay(href, {
					t: t.offset().top,
					l: t.offset().left,
					w: t.width(),
					h: t.height()
				});
			}
		} else {
			var sz = null;
			if (t.hasClass("wider-popup")) {
			    var __W;
				try { __W = $(top.window); } catch (ex) { __W = $(window); }
				sz = {
					top: __W.scrollTop() + (__W.height()/4),
					left: __W.scrollLeft() + (__W.width()/6),
					width: __W.width()/1.5,
					height: __W.height()/2
				}				
			}
			parent.triggerOverlay(t.attr("href"), {
				t: t.offset().top + $("#FRM_CONTENT", parent.document).offset().top,
				l: t.offset().left + $("#FRM_CONTENT", parent.document).offset().left,
				w: t.width(),
				h: t.height()
			}, sz);
		}
    }); //.prepend(" ");
    
    if ($("sup",$page).length) {
		var refs = appendSettings("references"); // load once
		reBindReferences();
	}
	
	function reBindReferences() {
		$("sup",$page).each(function (index, el) {
	    	var t = $(el);
	    	t.click(function (event) {
		    	event.preventDefault();
				triggerFrumbox(null, Handlebars.getCompiledTemplate("references", __settings.references), {
					t: t.offset().top,
					l: t.offset().left,
					w: t.width(),
					h: t.height()
				}, null, function() {
					try {
		    			var li = $("li[data-id='" + t.attr("data-id") + "']", "#frumbox-iframe");
		    			if (li.length) {
		    				li.addClass("add-highlight");
							li.scrollIntoView();
						}
		    		} catch (ex) {
			    		console.log("Exception", ex);
		    		}
		    	})
			});
	    });
	}
	
	if (jQuery.isFunction(jQuery.fn.tipTip)) {
		$(".tooltip",$page).tipTip({
			activation: _sniff_isTablet ? "click" : "hover",	// touch devices
			keepAlive: _sniff_isTablet ? true : false,		// click to remove
			maxWidth: "auto",
			enter: function (el) {
				if (_sniff_isTablet) {
					$("#tiptip_holder").unbind("click").click(function () {
						el.deactive_tiptip();
					});
				}
			}
		});
	}
		
	// make jquery-ui tabs
	$("#tabs, .jqueryui-tabs",$page).tabs();
	$(".jqueryui-tabs.tabs-disabled",$page).tabs({
		disabled: true
	}).tabs("enable",0);
		
	$("#accordion, .jqueryui-accordion",$page).accordion({
		header: "h3.accordion-header",
		active: false,
		collapsible: true,
		alwaysOpen: false,
		autoHeight: false,
		heightStyle: "content"
	});
	
	$(".rp-survey-radiogroup",$page).buttonset();
	
	// popups, highlighting on image maps
	$("img[usemap]",$page).each(function(index,el) {
		$(el).maphilight();
		$(el).parent().find("area").each(function(i,o) {
			var $o = $(o),
				$target = $($o.attr("href")).hide();
			$o.qtip({
				content: function () {
					return $target.html();
				},
				position: {
					target: 'mouse',
					adjust: { mouse: false },
					at: "center right",
					viewport: $(window)
				},
				style: "qtip-bootstrap"
			});
		});
	});

	// prepare flip-cards, also left-to-right slidein for quickflips
	if (jQuery.isFunction(jQuery.fn.quickFlip)) {
		// calculate max size of hidden elments
		var maxAH = 0, maxAW = 0, maxDH = 0, maxDW = 0;
		$("div[class^='flip-side']",
			$(".rp-flip",$page).each(function(index,el) {
				var d = $(el).actualSize();
				if (d[0] > maxDW) maxDW = d[0];
				if (d[1] > maxDH) maxDH = d[1];
			})
		).each(function(index,el) {
			var d = $(el).find("a").actualSize();
			if (d[0] > maxAW) maxAW = d[0];
			if (d[1] > maxAH) maxAH = d[1];
		});
	    var _qf = $(".rp-flip",$page).hide().each(function(index, el) {
	    	$(el).css({
	    		"height": maxDH,
	    		"width": maxDW
	    	}).find("a").css({
	    		"height": Math.max(maxAH, maxDH),
	    		"width": Math.max(maxAW, maxDW),
	    		"display":"table-cell",
	    		"vertical-align":"middle",
	    		"align":"center"
	    	});
	    	$(el).quickFlip({
				noResize: true
	    	});
	    	setTimeout(function () {
	    		$(el).show('slide',{direction:'left'},258);
			}, 250 * (index+1));
		});
		// $(".rp-flip a").equaliseHeights();
	}

	// prepare transitions
	// can be one of
	// blindX blindY blindZ cover curtainX curtainY fade fadeZoom growX growY
	// scrollUp scrollDown scrollLeft scrollRight scrollHorz scrollVert
	// shuffle slideX  slideY toss turnUp turnDown turnLeft turnRight uncover wipe zoom
	if (jQuery.isFunction(jQuery.fn.cycle)) {
		$(".rp-slideshow",$page).each(function (index, el) {
			var $el = $(el), // cache
				_effect = $el.attr("data-effect"),
				_delay = parseInt($el.attr("data-delay"), 10) * 1000,
				_uid = $el.attr("id"),
				_opts = {
					"fx": _effect,
					"timeout": _delay
				}
			if (_delay == 0) { // add hooks for next and previous clicker
				_opts["next"] = $("#next-" + _uid),
				_opts["prev"] = $("#prev-" + _uid)
			}
			$el.cycle(_opts);
		});	
	}
	
	$(".activity-match").each(function(index,el) {
		var $el = $(el), // the div wrapper for this whole activity
			_stored = $el.attr("data-uservalue"),
			drops = $(".drop",$el),
			logic = $el.attr("data-logic"),
			_state = ["I",0,[],0,0];

		function calculateState() {
			_state = ["I",0,[],0,0];
		 	// 	       0  1  2 3 4
			drops.each(function (index, d) {
				var $d = $(d),
					_req = ~~$d.closest("tr").attr("data-required"),
					$v = $d.find("div[data-answer]"),
					_ans = ($v.length) ? ~~$v.attr("data-answer") : -1;
				_state[2][index] = _ans;
				$d.removeClass("incorrect correct");
				if (_ans > -1) {
					if (_ans === _req) {
						$d.addClass("correct");
						_state[3]++;
					} else {
						$d.addClass("incorrect");
						_state[4]++;
					}
				}
			});
			if (drops.length === _state[3] + _state[4]) { // all completed (no empties)
				if (_state[4] > 0) { // has any negative
					_state[0] = "F";
				} else if (_state[3] === drops.length) { // all correct
					_state[0] = "P";
					_state[1] = getCurrentPageContributeScore(); // copy in score
				}
			}
		}
		function storeState() {
			var sState = JSON.parse(JSON.stringify(_state));
			sState[2] = sState[2].join(_avideSep);
			setState($el.attr("data-scormid"), sState.join("::"));
		}
		function loadState(value) {
			_state = value.split("::"); 	// I::0::1#~3#~2::0::0 i.e. Incomplete :: Score :: Arrays :: TotalCorrect :: TotalIncorrect
			if (_state.length !== 5) _state = ["I",0,_state[0],0,0]; // reset
			_state[2] = _state[2].split(_avideSep);
			$.each(_state[2], function(index,value) {
				var _this = $(drops[index]),
					_match = $("div[data-answer='" + value + "']",$el).appendTo(_this),
					_ans = _this.find("div[data-answer='" + value + "']");
				if (_ans.length && _ans.attr("data-answer") === _this.closest("tr").attr("data-required")) {
					_ans.closest("td").switchClass("incorrect", "correct", 0);
				} else if (_ans.length && _ans.attr("data-answer") !== _this.closest("tr").attr("data-required")) {
					_ans.closest("td").switchClass("correct", "incorrect", 0);
				}
			});
		}

		// initialise with loaded state
		if (_stored && _stored.length) {
			loadState(_stored);
			calculateState();
		}

		// set up drag and drop
		$("div[data-answer]",$el).draggable({
			appendTo: ".activity-match",
			revert: function (event, ui) {
				$(this).data("uiDraggable").originalPosition = {
					top: 0,
					left: 0
				};
				return !event;
			}
		});
		$(".drop",$el).droppable({
			activeClass: "ui-state-default",
			hoverClass: "ui-state-hover",
			accept: "div[data-answer]",
			classes: {
				"ui-droppable-active": "ui-state-default"
			},
			drop: function (event, ui) {
				var $this = $(this),
					_pos = 0, _neg = 0;
				if ($(this).find("div[data-answer]").length) {
					$(".source:empty",$el).filter(":first").append($(this).find("div[data-answer]"));
				}
				$(this).append(ui.draggable.css({top:0,left:0}));

				// update internal state
				calculateState();
				storeState();
				updatePageStatus(_nPageCurrent, _state[0], _state[1]);

				// interaction performs a completion and has been scored (e.g. either F or P)
				if (logic.length && _state[0] !== "I") {
					var href = __global_root + "/en-us/Content/" + logic.split(",")[_state[0] === "F" ? 1 : 0]; // choose feedback based on state
					$.get(href, function (data) { // load and display the positive or negative feedback dialogue text
						triggerFrumbox(null, processString(data, "auto", false), {
							t: $el.offset().top,
							l: $el.offset().left,
							w: $el.width(),
							h: $el.height()
						});
					});
				}

			}
		});
	});

	$(".activity-match-set").each(function(index,el) {
		var $el = $(el),
			_stored = $el.attr("data-uservalue"),
			_answers = [],
			drops = $(".drop",$el),
			$answers = $("div.answers > span", $el),
			logic = $el.attr("data-logic"),
			_state = ["I",0,[],0,0];

		$answers.each(function() {
			var $t = $(this);
			_answers[$t.text()] = $t.attr('data-index');
			$t.css("width", parseInt(100 / ($answers.length + 1), 10) + "%"); // visually center
		});

		function calculateState() {
			_state = ["I",0,[],0,0];
		 	// 	       0  1  2 3 4
			drops.each(function (index, td) {
				var $me = $(td),
					$tr = $me.closest("tr"),
					_req = ~~$tr.attr("data-required"),
					_ord = ~~$tr.attr("data-order"),
					_ans = ~~$me.attr("data-answer");
				$me.removeClass("incorrect correct");
				_state[2].push([_ord,_ans]);
				if (_req===_ans) {
					$me.addClass("correct");
					_state[3]++;
				} else if (_ans && _req !== _ans) {
					$me.addClass("incorrect");
					_state[4]++;
				}
			});
			if (drops.length === _state[3] + _state[4]) { // all completed (no empties)
				if (_state[4] > 0) { // has any negative
					_state[0] = "F";
				} else if (_state[3] === drops.length) { // all correct
					_state[0] = "P";
					_state[1] = getCurrentPageContributeScore(); // copy in score
				}
			}
		}
		function storeState() {
			var sState = JSON.parse(JSON.stringify(_state));
			sState[2] = sState[2].map(function(v){return v.join(">")}).join(_avideSep);
			setState($el.attr("data-scormid"), sState.join("::"));
		}
		function loadState(value) {
			_state = value.split("::"); 	// I::0::1>2#~2>2::0::0 i.e. Incomplete :: Score :: Arrays :: TotalCorrect :: TotalIncorrect
			if (_state.length !== 5) _state = ["I",0,_state[0],0,0]; // reset
			_state[2] = _state[2].split(_avideSep).map(function(v){return v.split(">")}); // ["I", 0, ["1>2","2>2"]]
			$.each(_state[2], function(index,pair) {
				if (~~pair[1] > 0) {
					var td = $("tr[data-order='" + pair[0] + "']", $el).find("td"),
						answer = $("div.answers > span[data-index='" + pair[1] + "']", $el);
					td.attr("data-answer", pair[1]);
					td.text(answer.text());
				}
			});
		}

		// initialise with previous state
		if (_stored && _stored.length) {
			loadState(_stored);
			calculateState();
		}

		// set up drag and drop items
		$answers.draggable({
			appendTo: ".activity-match-set",
			helper: "clone",
			revert: function (event, ui) {
				return !event;
			}
		});
		$(".drop",$el).droppable({
			activeClass: "ui-state-default",
			hoverClass: "ui-state-hover",
			accept: "span[data-index]",
			classes: {
				"ui-droppable-active": "ui-state-default"
			},
			drop: function (event, ui) {
				var $td = $(this),
					text = ui.helper.text(),
					answer = ui.helper.attr("data-index"); //  removeAttr("style").removeAttr("class");
				$td.html(text).attr("data-answer", answer);

				// update internal state
				calculateState();
				storeState();
				updatePageStatus(_nPageCurrent, _state[0], _state[1]);

				// interaction performs a completion and has been scored (e.g. either F or P)
				if (logic.length && _state[0] !== "I") {
					var href = __global_root + "/en-us/Content/" + logic.split(",")[_state[0] === "F" ? 1 : 0]; // choose feedback based on state
					$.get(href, function (data) { // load and display the positive or negative feedback dialogue text
						triggerFrumbox(null, processString(data, "auto", false), {
							t: $el.offset().top,
							l: $el.offset().left,
							w: $el.width(),
							h: $el.height()
						}); //, null, function () {
							// !Apply jquery tabs to parsed content, may need other functions here too
							//reBindThingsThatMightBeDynamicallyLoaded($("#frumbox-inner"));
						// });
					});
				}

			}
		});
	});

	$(".activity-match-rows, .activity-match-cols").each(function(index,el) {
		var $el = $(el),
			_stored = $el.attr("data-uservalue"),
			_answers = [],
			drops = $(".drop",$el),
			$answers = $("div[data-answer]", $el),
			$options = $("td.options", $el),
			logic = $el.attr("data-logic"),
			_state = ["I",0,[],0,0];

		function calculateState() {
			_state = ["I",0,new Array(drops.length),0,0];
		 	// 	       0  1  2                      3 4
			drops.each(function (index, td) {
				var $td = $(td),
					_req = ~~$td.attr("data-required"),
					answers = [];
				$("div[data-answer]",$td).each(function(ii,div) {
					var $div = $(div),
						_ans = ~~$div.attr("data-answer"),
						_ord = ~~$div.attr("data-order");
					$div.removeClass("incorrect correct");
					answers.push(_ord);
					if (_ans === _req) {
						$div.addClass("correct");
						_state[3]++;
					} else {
						$div.addClass("incorrect");
						_state[4]++;
					}
				});
				// answers.sort();
				_state[2][index] = answers;
			});
			if ($("td.options div[data-answer]",$el).length === 0) { // all answers have been dragged
				if (_state[4] > 0) { // has any negative
					_state[0] = "F";
				} else { // all must be correct
					_state[0] = "P";
					_state[1] = getCurrentPageContributeScore(); // copy in score
				}
			}
		}
		function storeState() {
			var sState = JSON.parse(JSON.stringify(_state));
			sState[2] = sState[2].map(function(v){return v.join(">")}).join(_avideSep);
			setState($el.attr("data-scormid"), sState.join("::"));
		}
		function loadState(value) {
			_state = value.split("::"); 	// I::0::1>2>3#~2>2::0::0 i.e. Incomplete :: Score :: Arrays :: TotalCorrect :: TotalIncorrect
			if (_state.length !== 5) _state = ["I",0,_state[0],0,0]; // reset
			_state[2] = _state[2].split(_avideSep).map(function(v){return v.split(">").map(Number)});
			$.each(_state[2], function(index, answers) {
				$.each(answers,function(ord,ans) {
					$div = $("div[data-answer][data-order='" + ans + "']", $el);
					$(drops[index]).append($div);
				});
			});
		}
		function calcHeight() { 
			var dropH = 0,
				spacing = parseInt($(".activities", $el).css("border-spacing").split(" ").pop(),10),
				maxH = $(".columns", $options).height();
			drops.each(function(i,drop) {
				if (el.classList.contains("activity-match-rows")) {
					dropH += $(drop).outerHeight() + (i<drops.length-1 ? spacing : 0);
				} else {
					dropH = Math.max(dropH, $(drop).height());
				}
			});
			$(".columns", $options).height(Math.max(dropH, maxH));
		}
		
		// initialise with previous state
		if (_stored && _stored.length) {
			loadState(_stored);
			calculateState();
		}

		// figure out column height now the state is reloaded
		calcHeight();

		// set up drag and drop items
		$("div[data-answer]",$el).draggable({
			appendTo: $(el),
			revert: function (event, ui) {
				$(this).data("uiDraggable").originalPosition = {
					top: 0,
					left: 0
				};
				return !event;
			}
		});
		$(".drop",$el).droppable({
			activeClass: "ui-state-default",
			hoverClass: "ui-state-hover",
			accept: "div[data-answer]",
			classes: {
				"ui-droppable-active": "ui-state-default"
			},
			drop: function (event, ui) {
				$(this).append(ui.draggable);
				ui.draggable.css({
					"top":"unset",
					"left":"unset"
				});
				
				calcHeight();

				// update internal state
				calculateState();
				storeState();
				updatePageStatus(_nPageCurrent, _state[0], _state[1]);

				// interaction performs a completion and has been scored (e.g. either F or P)
				if (logic.length && _state[0] !== "I") {
					var href = __global_root + "/en-us/Content/" + logic.split(",")[_state[0] === "F" ? 1 : 0]; // choose feedback based on state
					$.get(href, function (data) { // load and display the positive or negative feedback dialogue text
						triggerFrumbox(null, processString(data, "auto", false), {
							t: $el.offset().top,
							l: $el.offset().left,
							w: $el.width(),
							h: $el.height()
						}); //, null, function () {
							// !Apply jquery tabs to parsed content, may need other functions here too
							//reBindThingsThatMightBeDynamicallyLoaded($("#frumbox-inner"));
						// });
					});
				}

			}
		});
	});

	// when encountering a setscore, set the page to passed and value
	$("div[data-action='setscore']").each(function(index,el) {
		setState(el.dataset.scormid, "P::" + el.dataset.value);
		updatePageStatus(_nPageCurrent, "P", el.dataset.value);
	});
		
	// apply PIE for content
	applyPIE();
		
}

// stub	which runs after course is loaded properly
function bindJQueryAfterLoad() {
	
//	console.log("bindJQueryAfterLoad");

	// put classes for borders on buttons
	$("#ButtonWrapper a:visible:last").addClass("last");
	$("#ButtonWrapper a:visible:first").addClass("first");

	//TODO: update jquery then bind this using ON
	$(".toc-tree").click(function (event) { // tree
		event.preventDefault();
		clickTocControl(this.getAttribute("id"));
	});
	
	$(".toc-node").click(function (event) { // hyperlink
		event.preventDefault();
		clickTocHyperlink(this.getAttribute("id"));
	});

	return;
}

// PIE normally initialised by Modernizr
function applyPIE() {

	if (window.PIE && !Modernizr.borderradius) {

		$(".navigation-button-wrapper").each(function () {
			PIE.attach(this);
		});

        // jqueryui that we CAN handle, albeit with fixed border size
        $(".ui-corner-all").each(function () {
        	var t = $(this);
			t.css({
				"position":"relative", // hack needed for this doctype
        		"border-radius":"4px 4px 4px 4px"
        	});
        	PIE.attach(this);
        })
    }
}

// utility: change the height of the iframe to fit the layout container
function resizeIframe() {
	if (_$ct) clearTimeout(_$ct);
	_$ct = setTimeout(function () {
		var _frm = frames["FRM_CONTENT"], $frm = $("#FRM_CONTENT");
		if (_frm) {
			var $container = $("#contentContainer");
			$frm.css({
				"width":$container.width(),
				"height":$container.height()
			});
			_frm.$("[data='rp-quiz-layout']").css({
				"width":$container.width(),
				"height":$container.height()
			}).layout("resizeAll");
		}
	}, 234);
}

// utility to open lightbox
function triggerOverlay(uri, pos, size, fnAfter) {
	triggerFrumbox(uri,null,pos,size,fnAfter);
}

function triggerFrumbox(uri, data, pos, size, fnAfter, fx) {
	if (!jQuery.isFunction(jQuery.fn.frumbox)) return;
	if (typeof fx === 'undefined') {
	    fx = {                // overlay appearance
	        opacity: 0.5,
	        colour: "#ffffff",
	        speed: 250
	    };
    }
	var span = $("<span></span>").css({
		position: "fixed",
		top: pos.t,
		left: pos.l,
		width: pos.w,
		height: pos.h
	})
	.show()
	.appendTo("body")
	.frumbox({
   		onAfterOpen: function (el,data) {
			if (window.PIE) {
				PIE.attach(document.getElementById('frumbox-inner'));
		    }
		    // console.log("on after open", data, uri, el, objdata);
		    if (data != null) $("#frumbox-inner").css("overflow","scroll"); // since it's not an iframe this allows scrolling
			if (jQuery.isFunction(fnAfter)) fnAfter();
		},
		href : uri,
		content : data,
	    onAfterClose: function () {
	    	span.remove();
	    },
	    overlay: fx,
        size: {                 // the size to open at (does not resize/scale automatically)
            top: $(window).scrollTop() + 40, // 50-10, to account for navigation bar
            left: $(window).scrollLeft() + 60, // 50+10, accounts for width of close icon
            width: $(window).width() - 100,
            height: $(window).height() - 100
        }
	});
	if (size && (size != null)) {
		span.frumbox("setSize",size);
	}
	span.frumbox("open");
}

function showFeedBack(v) {
	if ($("#feedback").length) $("#feedback").hide().html(v).fadeIn(1500);
}

function getDocHeight() {
	var D = document;
	return Math.max(Math.max(D.body.scrollHeight, D.documentElement.scrollHeight), Math.max(D.body.offsetHeight, D.documentElement.offsetHeight), Math.max(D.body.clientHeight, D.documentElement.clientHeight));
}

function EmbedAndPlay_Youtube(videoid, container) {
	var $container = $(container);
	var w = $(container).width(),
		h = $(container).height(),
		player = new YT.Player('ytvideo', {
			height: h,
			width: w,
			videoId: videoid,
			events: {
				'onReady': function (event) {
					event.target.playVideo();
				}
			}
			
		});
}





