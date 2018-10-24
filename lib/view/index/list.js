/*
 * 	Functions relating to the index course list
 */

(function (Context, undefined) {

	Context.List = (function () {

		function findOne(haystack, arr) {
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
			if (!terms.length) { Context.List.$headers.show(); Context.List.$list.show(); return; }
			if (terms.length) {
				var vals = (terms.toLowerCase() + " ").split(" ");
				Context.List.$list.each(function(index,el) {
					var $el = $(el),
					    ar = $el.attr("data-meta").split(",");
					if (!findOne(ar,vals)) { $el.hide(); return; }
					$el.show();
				});

			// it's not quite this, unfortunately
			// $(".header-row:has(+ .course-row:hidden)").hide();

				// if .header-row is followed by any .course-row that is visible, leave it visible
				Context.List.$headers.hide().each(function (i,j) {
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

		function loadDataTemplate(el, cb) {
			$.getJSON(Context.Route + "/" + el.getAttribute("data-model")).done(function(results) {
				var source = $("#" + el.getAttribute("data-template")).html();
				var template = Handlebars.compile(source);
				$(el).html(template(results));
				if (typeof cb === 'function') cb(el.getAttribute("data-template"));

			});
		}

		function _init(e) {
			$("[data-template]").each(function(i,el) {
				loadDataTemplate(el, function (template) {
					switch (template) {
						case "index-templates-hbt":
							Context.List.$list = $("div[data-meta]");
							Context.List.$headers = $(".header-row");
							var search = Cookies.get('search');
							if (search && search.length) filterList(search);
						break;
					}
				});
			});

			$("#search").on("keyup", function (e) {
				filterList($(this).val());
			}).on("blur", function() {
				Cookies.set('search', $(this).val(),{ expires: 365 });
			}).on("keydown", function(e) {
				if (e.which===13) return false;
				if (e.which===27) resetList();
			});

			$("#add_circle").on("click", function(e) {
				var div = document.getElementById(e.target.closest("button").dataset.target);
				div.classList.toggle("show");
				if (div.classList.contains("show")) {
					e.target.classList.add("r45");
				} else{
					e.target.classList.remove("r45");
				}
			});

			function action(context, command, params, fn) {
				$.post("/app/index/action/" + [context,command,params].filter(function(v){return typeof v!=='undefined'}).join("/"), function (result) {
					if (result.status === "ok") {
						loadDataTemplate(document.querySelector("div[data-template='index-containers-hbt']"));
					} else if (result.status === "reload") {
						location.reload(true);
					} else if (result.status === "error") {
						alert("An error has occurred.\n" + JSON.stringify(result));
					}
					if (typeof fn === 'function') fn(result);
				});
			}

			function playCourse(compile) {
				alert("Will play course with compile = " + compile);
			}

			$(document).on("mousedown", function (event) {
				Context.List.Keys = {
					Shift: event.shiftKey,
					Control: event.ctrlKey,
					Alt: event.altKey
				}
			});

			$(document).on("scroll click", function (event) {
				if (event.target.dataset && event.target.dataset.dblclick) return;
				$(".staged").remove();
			});

			$(document).on("dblclick","[data-dblclick]", function(event) {
				event.target.blur();
				switch(event.target.dataset.dblclick) {
					case "stage":
						$(".staged").remove();
						var abspos = event.target.getBoundingClientRect(),
							$menu = $("<div>").addClass("staged").css({
								"top":abspos.top+"px",
								"left":abspos.left+"px"
							}).attr("data-context", event.target.closest(".course-row").dataset.id);
						for (var i=0;i<CourseBuildr.Labels.Names.length;i++) {
							$("<span>")
								.addClass("label")
								.addClass(CourseBuildr.Labels.Classes[i])
								.html(CourseBuildr.Labels.Names[i])
								.click(function(ev) {
									action(ev.target.closest("div").dataset.context,"restage",ev.target.textContent,function(data) {
										var classname = CourseBuildr.Labels.Classes[CourseBuildr.Labels.Names.indexOf(data.value)];
										var html = '<span class="label ' + classname + '" data-dblclick="stage">' + data.value + '</span>';
										$(".course-row[data-id='" + data.id + "'] .stage").html(html);
										$(".staged").remove();
									});
								})
								.appendTo($menu);
						}
						$menu.appendTo(document.body);
						var l = parseInt($menu.css("left"),10);
						$menu.css("left", (l - $menu.width()/2) + "px");
						break;
				}
			});

			// globally handle button clicks
			$(document).on("click","[data-action]", function (event) {
				console.dir("action", event.target);
				var target = event.target.closest("[data-action]"),
					row = event.target.closest(".course-row"),
					contextId = row && ~~row.dataset.id,
					locked = row && (row.dataset.locked==="1");
				switch (target.dataset.action) {
					case "toggle-archive":
						action(0,"archive",event.target.querySelector(".material-icons").textContent==="toggle_off"?"show":"hide");
						break;

					case "toggle-subscribers":
						action(0,"subscribers",event.target.querySelector(".material-icons").textContent==="toggle_off"?"show":"hide");
						break;

					case "trash": // click once reformats the icons; click again use the event target to determine which icon
						if (event.target.classList.contains("colour-positive")) {
							action(contextId, "delete");
						} else if (event.target.classList.contains("colour-negative")) {
							target.innerHTML = "<i class='material-icons'>delete</i>";
						} else {
							target.innerHTML = "<i class='material-icons colour-negative' title='Cancel'>cancel</i><i class='material-icons colour-positive' title='Delete forever'>delete</i>";
						}
						break;

					case "play":
						if (!locked) playCourse(true);
						break;

					case "launch":
						playCourse(false);
						break;

					case "clone":
						if (!locked) action(contextId, "clone");
						break;

					case "lock":
						action(contextId, "lock", "true");
						break;

					case "trash":
						break;

					case "unlock":
						action(contextId, "lock", "false");
						break;

					case "edit":
						if (!locked) location.href = "/app/edit/index/" + contextId;
						break;

					case "create-course":
						var template = target.dataset.selection;
						break;

					// case "restage":
					// 	action(contextId, "restage", event.target.textContent, function () {
					// 		$(".staged").remove();
					// 	});
					// 	break;
				}
			});

		}

		function resetList() {
			$("#search").val("").trigger("keyup");
		}

		return {
			Init: _init,
			Reset: resetList
		}

	})();
	window.addEventListener("DOMContentLoaded", Context.List.Init, false);
})(window.CourseBuildr = window.CourseBuildr || {});