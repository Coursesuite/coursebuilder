<?php

class EditController extends Controller
{
    private $cm;

    public function __construct(...$params)
    {
        parent::__construct($this, $params);
        parent::RequiresLogon();
    }

    public function advanced($course_id = 0, $action = "") {
        $cm = new CourseModel($course_id);
        $cm->validateAccess(Session::CurrentUserId());
        $cm->upgrade();
        $this->View->requires("minimal");
        $this->View->requires("edit/navbar");
        $this->View->requires("/css/app/navbar.css");
        $this->View->requires("https://unpkg.com/split.js/split.min.js");
        $this->View->requires("Utils::json_to_form");

        // take the entire php form and save it as json
        if (Request::method() === "POST" && $action === "config") {
            $cast = json_encode($_POST, JSON_NUMERIC_CHECK | JSON_PARTIAL_OUTPUT_ON_ERROR); //  | JSON_PRETTY_PRINT
            $cast = str_replace(['"true"','"false"'],['true','false'],$cast);
            $cm->config = $cast;
            $cm->save();
        }

        $course = $cm->get_model(); // to get the public model
        // $course["displaypath"] = $cm->DisplayPath;
        // $course["launch"] = IO::append_path($cm->Path, ["SCO1", "index.html"]);
        $model = ["context"=>$course_id, "course"=>$course];
        $this->View->render("edit/settings", $model);
    }

    public function design($course_id = 0) {
        $cm = new CourseModel($course_id);
        $cm->validateAccess(Session::CurrentUserId());
        $cm->upgrade();
        $this->View->requires("minimal");
        $this->View->requires("edit/navbar");
        $this->View->requires("/css/app/navbar.css");
        $this->View->requires("https://unpkg.com/split.js/split.min.js");
        $course = $cm->get_model(); // to get the public model
        $course["displaypath"] = $cm->DisplayPath;
        $course["launch"] = IO::append_path($cm->Path, ["SCO1", "index.html"]);
        $model = ["context"=>$course_id, "course"=>$course];
        $this->View->render("edit/design", $model);
    }

    public function customise($course_id = 0) {
        $cm = new CourseModel($course_id);
        $cm->validateAccess(Session::CurrentUserId());
        $cm->upgrade();
        $this->View->requires("minimal");
        $this->View->requires("edit/navbar");
        $this->View->requires("/css/app/navbar.css");
        $course = $cm->get_model(); // to get the public model
        $course["displaypath"] = $cm->DisplayPath;
        $course["launch"] = IO::append_path($cm->Path, ["SCO1", "index.html"]);
        $model = ["context"=>$course_id, "course"=>$course];
        $this->View->render("edit/customise", $model);
    }

    public function sharing($course_id = 0) {
        $cm = new CourseModel($course_id);
        $cm->validateAccess(Session::CurrentUserId());
        $this->View->requires("minimal");
        $this->View->requires("edit/navbar");
        $this->View->requires("/css/app/navbar.css");
        $course = $cm->get_model(); // to get the public model
        $model = ["context"=>$course_id, "course"=>$course];
        $this->View->render("edit/sharing", $model);
    }

    public function template($course_id = 0, $action = "view") {
        $cm = new CourseModel($course_id);
        $cm->validateAccess(Session::CurrentUserId());
        $this->View->requires("minimal");
        $this->View->requires("edit/navbar");
        $this->View->requires("/css/app/navbar.css");
        $course = $cm->get_model(); // to get the public model
        $model = ["context"=>$course_id, "course"=>$course, "action"=>$action];
        $this->View->render("edit/template", $model);
    }

    public function index($course_id = 0) {

        $cm = new CourseModel($course_id);
        $cm->validateAccess(Session::CurrentUserId());
        $cm->upgrade();

        $this->View->requires("minimal");

        $this->View->requires("edit/navbar");
        $this->View->requires("/css/app/navbar.css");

        // $this->View->requires("edit/treeview.hbt");
        // tree view
        $this->View->requires("https://cdn.jsdelivr.net/npm/jstree@3.3.5/dist/jstree.min.js");
        $this->View->requires("https://cdn.jsdelivr.net/npm/jstree@3.3.5/dist/themes/default/style.min.css");

        // drag and drop file library
        $this->View->requires("https://cdn.jsdelivr.net/npm/filedrop@2.0.0/filedrop.min.js");

        // for now we have a mix of material-icons and font-awesome-5
        $this->View->requires("/css/node_modules/material-icons-css/css/material-icons.min.css");
        $this->View->requires("https://use.fontawesome.com/releases/v5.4.1/css/all.css");

        // a modal handler for drawing dialogues (stored in the runtime handlebars templates)
        $this->View->requires("https://unpkg.com/vanilla-modal@1.6.5/dist/index.js");
        $this->View->requires("https://unpkg.com/sortablejs@1.7.0/Sortable.min.js");
        // $this->View->requires("edit/easyedit.hbt");
        $this->View->requires("edit/pilledit.hbt");

        // splitter panes
        $this->View->requires("https://unpkg.com/split.js");

        // plugins
        $this->View->requires("plugins/Ninjitsu");
        // $this->View->requires("plugins/MediumEditor");
        // $this->View->requires("medium-editor");
        $this->View->requires("plugins/Quizzard");


        // shoulnd't need to include these here since you can dyncamially call back for models using runtime partials
        // $this->View->requires("uikit");
        // $this->View->requires("base");
        // $this->View->requires("/css/tardproof.less");

        // $this->View->requires("/js/diff_match_patch.js");
        // $this->View->requires("/js/jquery.pretty-text-diff.js");
        // $this->View->requires("/js/lib/jstree/jquery.jstree.js");
        // $this->View->requires("/js/shortcut.js");
        // $this->View->requires("/js/jquery.tinysort.min.js");
        // $this->View->requires("/js/jquery.highlighttextarea.lite.js");
        // $this->View->requires("/js/spectrum.js");

        // $this->View->requires("js", "https://cdn.jsdelivr.net/g/paste-image@0.0.3,handlebarsjs@4.0.8,dropzone@4.3.0");
        // $this->View->requires("js", "/app/edit/js/{$course_id}/");

        // $this->View->requires("https://cdn.jsdelivr.net/g/dropzone@4.3.0(dropzone.min.css)");
        // $this->View->requires("https://cdn.jsdelivr.net/g/jquery@3.2.1(jquery.min.js),paste-image@0.0.3,handlebarsjs@4.0.8,dropzone@4.3.0");

        $course = $cm->get_model(); // to get the public model

        $course["displaypath"] = $cm->DisplayPath;
        $course["launch"] = IO::append_path($cm->Path, ["SCO1", "index.html"]);

        $model = ["context"=>$course_id, "course"=>$course];
        $this->View->render("edit/index", $model);
    }

    public function js($context = 0) {
        $model = array(
            "context" => $context,
            "tier" => Session::CurrentTier(),
            "mycontainers" => Session::User()->containers,
            "course" => (new CourseModel($context))->get_model(),
            "toolbarjson" => IO::loadJSON(Config::get("PATH_REAL_WEBROOT") . "/plugins/Ninjitsu/toolbar.json")
        );
        $this->View->render("_templates/appjs", $model, null, null, false, "text/javascript");
    }

    public function nav($context = 0, $parent = 0) {
        $context = Utils::rowInt($context);
        $parent = Utils::rowInt($parent);
        $pages = new PagesCollection($context, $parent);
        foreach ($pages as $key => $obj) {
            if ((int) $obj->visibility === 0) {
                $icon = "material-icons material-icons-bookmark-border";
            } else if ($obj->type === "Information" || $obj->type === "Summary") {
                $icon = "material-icons material-icons-bookmark";
            } else {
                $icon = "material-icons material-icons-school";
            }
            $model[] = [
                "id" => "page_{$key}",
                "index" => $key,
                "text" => $obj->title,
                "icon" => $icon,
                "children" => $obj->HasChildren,
                "order" => $obj->sequence
            ];
        }
        // if ($parent === 0) {
        //     $sub = $model;
        //     $model = [
        //         "children" => $sub,
        //         "id" => "root",
        //         "index" => 0,
        //         "text" => "Course",
        //         "icon" => "material-icons material-icons-folder-shared",
        //         "order" => 0
        //     ];
        // }
        $this->View->renderJSON($model);
    }


    /**
     *
     *  Where Ajax happens and returns a json object
     *
     *  passedin the course and the action to perform
     * other values might be passed by post values depending on the action
     *
     */
    public function action($course_id = 0, $action = "none") {
        parent::RequiresAjax();
        $result = new stdClass();
        $result->status = "error";
        $result->action = $action;
        $result->contextid = $course_id;

        switch (strtolower($action)) {
            case "tree.rename":
                $cm = new CourseModel($course_id);
                $cm->validateAccess(Session::CurrentUserId());
                $row = Request::rowint("id");
                if ($row>0) {
                    $page = new PageModel($row);
                    $page->title = Request::post("text",true);
                    $page->save();
                    $result->status = "ok";
                }
                break;

            case "tree.delete":
                $cm = new CourseModel($course_id);
                $cm->validateAccess(Session::CurrentUserId());
                $row = Request::rowint("id");
                if ($row>0) {
                    $page = new PageModel($row);
                    $page->delete();
                }
                $result->status = "ok";
                break;

            case "tree.create":
                $cm = new CourseModel($course_id);
                $cm->validateAccess(Session::CurrentUserId());
                $row = Request::rowint('id');
                $kind = Request::post('kind',true);
                $extn = ($kind === "Quiz") ? "xml" : "html";
                $icon = ($kind === "Quiz") ? "material-icons material-icons-school" : "material-icons material-icons-folder";
                $visible = Request::boolval('visible',true);
                if ($row>0) {
                    $parent = new PageModel($row);
                    $child = new PageModel(0);
                    $child->course = $parent->course;
                    $child->parent = $parent->id;
                    $child->sequence = 999; // todo
                    $child->title = Request::post('text',true);
                    $child->filename = time() . '.' . $extn;
                    $child->type = $kind;
                    $child->scormid = time();
                    $child->contribute = 'n';
                    $child->score = 100;
                    $child->percentage = 100;
                    $child->nav = 'n';
                    $child->visibility = $visible ? 1 : 0;
                    $child->template = '';
                    $child->content = '';
                    $child->html = '';
                    $child->deleted = 0;
                    $child->modified = date('Y-m-d H:i:s');
                    $child->save();

                    $child->path = $parent->path . $child->id . '/';
                    $child->save();

                    if (!$visible) $icon = "material-icons material-icons-folder-open";

                    $result->id = $child->id;
                    $result->text = $child->title;
                    $result->icon = $icon;
                    $result->status = 'ok';
                }
                break;

            case "page.load":
                $row = Request::rowint('id');
                $obj = new PageModel($row);
                if ($obj->loaded()) {
                    $result->model = $obj->get_model();
                    if ($obj->type === "Information" || $obj->type === "Summary") {
                        $result->editor = "ninjitsu";
                    } else if ($obj->type === "Quiz" || $obj->type === "Test") {
                        $result->editor = "quizzard";
                    } else if ($obj->type === "html") {
                        $result->editor = "medium";
                    } else {
                        $result->editor = "unknown";
                    }
                }
                $result->status = "ok";
                break;

            case "page.save":
                // var_dump($_POST);
                $row = Request::rowint('id');
                $obj = new PageModel($row);
                if ($obj->loaded()) {
                    $obj->set_model($_POST); // ugh
                    $obj->save();
                //     $obj->content = Request::post("content"); // might contain base64 elements
                //     $obj->save();
                }
                $result->status = "ok";
                break;

            case "file.dnd":
                break;

            default:
                $result->status = "ok";
                break;
        };
        $this->View->renderJSON($result);
    }

    public function asp_index($id) {
	    $user_id = Session::get("user_id");
	    Response::cookie("aspname", DatabaseFactory::get_record("plebs", array("id" => $user_id), "name"));
	    Response::redirect(Config::get("ROOTURL") . "/engine/pages/edit/?id=$id", true);
    }

}