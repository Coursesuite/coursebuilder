
/*
public methods are prefixed with underscores, but they are exposed through the return interface and attached to the window.CourseBuilder.Edit object

edit.js is included into the default view for Edit and thus called for each type of page
any extra plugins such as editors should be required by the View
any page functions need to happen in the public Init method
examine the document.body.classList to see the method and action names

*/
(function (Context, undefined) {

	Context.Edit = (function (ctx) {

		var Tree = {};
		var Panes = {};
		var GlobalToolbar = {};
		var This = ctx;

		GlobalToolbar.Init = function () {
			$(".page-global-toolbar")
				.on("change", ".dd-input", function (el) {
					// close other dropdowns
					$(".dd-input").each(function(i,a){if(a!==el.target)$(a).prop("checked",false)});
					// shift the dropdown so that it fits on the viewport
					var ul = $(event.target.nextElementSibling),
						diff = (ul.width() + ul.offset().left) - $(document).width();
					ul.css("margin-left", (diff>0) ? (-(diff+5)) + "px" : 0);
				})
				.on("click", "[data-action]", function (e) {
					e.preventDefault();
					switch (e.target.dataset.action) {
						case "content-save":
							$(":checkbox.dd-input").prop("checked", false);
							switch (Tree.CurrentModel().editor) {
								case "medium":
								Context.MediumEditor.Save();
								break;

								case "ninjitsu":
								Context.Ninjitsu.Save();
								break;

								case "quiz":
								Context.Quizard.Save();
								break;
							}
						break;

						case "revisions":
						break;

						case "page-visibility":
						case "page-grid":
						case "page-score":
						case "page-navigation":
							$(e.target).find("span").text("check_box");
							$(e.target).parent().siblings().find("a>span").text("check_box_outline_blank");
							makeDirty();
							break;

					}
				});
		}

		Tree.Get = function () {
			return Tree._inst;
		}
		Tree.CurrentModel = function () {
			return Tree._current_model;
		}
		Tree.Load = function () {
			Tree._inst = $('.template-navtree-container').jstree({
				'core': {
					'data': {
						'url' : function (node) {
							var id = node.id === '#' ? 0 : node.id.replace("page_","");
							return "/app/edit/nav/" + window.CourseBuildr.Course.id + "/" + id;
						}
					},
					'multiple': false,
					'check_callback': true,
				},
				'contextmenu': {
					'items': {
						"new": {
							"separator_before":false,"icon":"material-icons material-icons-add","separator_after":false,"label":"New","action":false,"submenu":{
								"newpage":{"separator_before":false,"icon":"material-icons material-icons-bookmark","separator_after":false,"_disabled":false,"label":"New page","action":Tree.Actions.Create,"variant":"Information"},
								"subpage":{"separator_before":false,"icon":"material-icons material-icons-bookmark-border","separator_after":false,"_disabled":false,"label":"New partial","action":Tree.Actions.Create,"variant":"Information","hidden":true},
								"quiz":{"separator_before":false,"icon":"material-icons material-icons-school","separator_after":false,"_disabled":false,"label":"New quiz","action":Tree.Actions.Create,"variant":"Quiz"}
							}
						},
						"import":{
							"_disabled":true, // for now
							"separator_before":true,"icon":false,"separator_after":false,"label":"Import","action":false,"submenu":{
								"ninja":{"separator_before":false,"separator_after":false,"label":"Ninja Package","action":Tree.Actions.Import,"icon":"material-icons material-icons-archive"},
								"pdf":{"separator_before":false,"icon":false,"separator_after":false,"label":"Resource","action":Tree.Actions.Import,"icon":"material-icons material-icons-attachment"}
							}
						},
						"rename":{"separator_before":true,"icon":"material-icons material-icons-text-format","separator_after":false,"_disabled":false,"label":"Rename","action":Tree.Actions.Rename},
						"remove":{"separator_before":false,"icon":"material-icons material-icons-remove","separator_after":false,"_disabled":false,"label":"Delete","action":Tree.Actions.Delete},
					}
				},
				'plugins': ['contextmenu','dnd','state']
			});
			Tree.Bind();
		}
		Tree.Bind = function () {
			Tree.Get()
				.on('changed.jstree', Tree.Events.Changed)
				.on('move_node.jstree copy_node.jstree', Tree.Events.Modify)
				.on('rename_node.jstree',Tree.Events.Rename)
				.on('delete_node.jstree',Tree.Events.Delete)
		}

		// events notify the back end of actions occurring on the tree
		Tree.Events = {};
		Tree.Events.Changed = function (e, data) {
			var node = data.instance.get_node(data.selected[0]);
			switch (data.action) {
				case "select_node":
					Tree._current_id = node.id.replace("page_","");
					$("#editor").html("");
					// figure out the content and its type
					action("page.load", undefined, {
						id: Tree._current_id
					}, function (obj) {
						if (obj.status !== "ok") {
							console.dir(obj);
							return alert("An error occurred loading the content. \n" + obj.error);
						}
						obj["editorId"] = "edit-area";
						obj["attachTo"] = "tab-body";

						Tree._current_model = obj;
						switch (obj.editor) {
							case "medium":
							Context.MediumEditor.Init(Tree);
							break;

							case "ninjitsu":
							Context.Ninjitsu.Init(Tree);
							break;

							case "quizzard":
							Context.Quizzard.Init(Tree);
							break;

						}
					});
					// todo: persist content in local storage and load that
					// todo: socket call to monitor content changes for pages in local storage
				break;

				default:
				console.log("change",{
					action: data.action,
					item: node,
					data: data
				});
			}
		}
		Tree.Events.Modify = function (e, data) {
			console.log("modify",{
				node: data.node,
				src: data.original,
				parent: data.parent,
				sequence: data.position,
				prev: data.old_parent
			});
		}
		Tree.Events.Rename = function(e, data) {
			document.querySelector("body > main > aside").scrollLeft = 0;
			action("tree.rename",undefined,{
				"id":data.node.id.replace("page_",""),
				"text":data.text
			});
		}
		Tree.Events.Delete = function (e, data) {
			action("tree.delete", undefined, {
				"id": data.node.id.replace("page_","")
			});
		}

		// actions allow user events on the tree to occur, which in turn raise events
		Tree.Actions = {};
		Tree.Actions.Create = function (data) {
			var inst = $.jstree.reference(data.reference),
				obj = inst.get_node(data.reference);
			action("tree.create",undefined,{
				"id":obj.id.replace("page_",""),
				"text":"Untitled",
				"kind":data.item.variant,
				"visible":data.item.hidden ? 0 : 1
			}, function (result) {
				inst.create_node(obj, {"id":result.id,"text":result.text,"icon":result.icon}, "last", function (new_node) {
					try {
						inst.edit(new_node);
					} catch (ex) {
						setTimeout(function () { inst.edit(new_node); },0);
					}
				});
			})
		}

		// the action of renaming a node, internally raises the rename event
		Tree.Actions.Rename = function (data) {
			var inst = $.jstree.reference(data.reference),
				obj = inst.get_node(data.reference);
			inst.edit(obj);
		}

		// the action of deleting the node, internally raises the delete event
		Tree.Actions.Delete = function (data) {
			var inst = $.jstree.reference(data.reference),
				obj = inst.get_node(data.reference);

			if (obj.state.loaded === false || obj.children.length > 0) {
				if (!window.confirm("This will also delete the child pages (if any), is that ok?")) return;
			}
			if(inst.is_selected(obj)) {
				inst.delete_node(inst.get_selected());
			} else {
				inst.delete_node(obj);
			}
		}

		// right-clicking, choosing to import a package
		Tree.Actions.Import = function (data) {
			console.log("import", data);
			// item - the contextmenu item node
			// element - internal
			// position - x, y
			// reference[0] the node that was context-clicked
		}

		// persist the model - Tree being a handy reference to the selection, the action itself is generic
		Tree.Actions.Save = function (model) {
			action('page.save', undefined, model, function (obj) {
				if (obj.status !== "ok") {
					console.dir(obj);
					return alert("An error occurred saving the content. \n" + obj.error);
				}
				makeClean();
			});
		}


		Panes.Init = function () {
			var sizes = localStorage.getItem('split-sizes');
			if (sizes) {
			    sizes = JSON.parse(sizes)
			} else {
			    sizes = [10, 90]  // default sizes
			}
			Split(['main>aside','main>article'],{
				sizes: sizes,
				minSize: [200,980],
				snapOffset: 25,
				expandToMin: true,
				onDragEnd: function (sizes) {
			    	localStorage.setItem('split-sizes', JSON.stringify(sizes));
			    	$(document).trigger("splitter-resize");
				},
				elementStyle: function (dimension, size, gutter) {
					return {
						'flex-basis': 'calc(' + size + '% - ' + gutter + 'px)'
					}
				},
				gutterStyle: function (dimension, gutter) {
					return {
						'flex-basis': gutter + 'px'
					}
				}
			});
		}

		function loadDataTemplate(el, cb) {
			$.getJSON(Context.Route + "/" + el.getAttribute("data-model")).done(function(results) {
				var source = $("#" + el.getAttribute("data-template")).html();
				var template = Handlebars.compile(source);
				$(el).html(template(results));
				if (typeof cb === 'function') cb(el.getAttribute("data-template"));
			});
		}

		function action(command, params, data, fn) {
			$.post("/app/edit/action/" + [window.CourseBuildr.Course.id,command,params].filter(function(v){return !(typeof v === 'undefined' || null === v)}).join("/"), data, function (result) {
				if (result.status === "error") {
					alert("An error has occurred.\n" + JSON.stringify(result));
				}
				if (typeof fn === 'function') fn(result);
			}, "json");
		}

		function _init() {
			//var tmpl = Handlebars.compile($("#edit-treeview-hbt").html());
			//$("#pages").html(tmpl(window.CourseBuildr.Course));
			var cl = document.body.classList;
			if (cl.contains("action-index")) {
				Tree.Load();
				Panes.Init();
				GlobalToolbar.Init();
			}
		}
		return {
			Init: _init
		}
	})(Context);
	window.addEventListener("DOMContentLoaded", Context.Edit.Init, false);
})(window.CourseBuildr = window.CourseBuildr || {});