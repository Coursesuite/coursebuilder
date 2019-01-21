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
        $cm->checkMedia();
        $cm->upgrade();

        $treemode =  Session::User()->GetPreference("treemode","default");

        $this->View->requires("minimal");

        $this->View->requires("edit/navbar");
        $this->View->requires("/css/app/navbar.css");

        // tree view
        $this->View->requires("/node_modules/jstree/dist/jstree.min.js");
        $this->View->requires("/node_modules/jstree/dist/themes/{$treemode}/style.min.css");

        // drag and drop file library
        $this->View->requires("https://cdn.jsdelivr.net/npm/filedrop@2.0.0/filedrop.min.js");

        // for now we have a mix of material-icons and font-awesome-5
        $this->View->requires("/css/node_modules/material-icons-css/css/material-icons.min.css");
        $this->View->requires("https://use.fontawesome.com/releases/v5.6.3/css/all.css");

        // a modal handler for drawing dialogues (stored in the runtime handlebars templates)
        $this->View->requires("https://unpkg.com/vanilla-modal@1.6.5/dist/index.js");
        $this->View->requires("https://unpkg.com/sortablejs@1.7.0/Sortable.min.js");
        $this->View->requires("edit/pilledit.hbt"); // modal-based multipage editor

        // splitter panes
        $this->View->requires("https://unpkg.com/split.js@1.5.10/dist/split.js");

        // plugins - refactor with some kind of autoloader
        $this->View->requires("plugins/Ninjitsu");
        // $this->View->requires("plugins/MediumEditor");
        // $this->View->requires("medium-editor");
        $this->View->requires("plugins/Quizzard");

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
            "toolbarjson" => IO::loadJSON(Config::get("PATH_REAL_WEBROOT") . "/plugins/Ninjitsu/toolbar.json"),
            "prefs" => Session::User()->preferences,
            "who" => Session::User()->email
        );
        $this->View->render("_templates/appjs", $model, null, null, false, "text/javascript");
    }

    public function nav($context = 0, $parent = 0) {
        $treemode =  Session::User()->GetPreference("treemode","default");
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
            $item = [
                "id" => "page_{$key}",
                "index" => $key,
                "text" => $obj->title,
                "icon" => $icon,
                "children" => $obj->HasChildren,
                "order" => $obj->sequence,
                "a_attr" => ["data-preview" => true]
            ];
            if ($treemode === "image") {
                $item["a_attr"] = ["data-preview" => false, "title" => $obj->title];
                unset($item["icon"]);
                $item["text"] = "<img src='/app/media/screenshot/{$obj->id}' width='160' height='120'>"; // /1024/768/3600/true/
            }
            $model[] = $item;
        }
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
            case "tree.mode":
                $mode = Request::post('mode');
                if (in_array($mode,["image","default"])) {
                    Session::User()->SetPreference("treemode", $mode);
                    if ($mode === "image") {
                        // kick of the cron for creating screenshots
                    }
                }
                $result->status = "reload";
                break;
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

            case "content.load":
                $row = Request::rowint('id');
                $obj = new PageModel($row);
                if ($obj->loaded()) {
                    $result->content = $obj->content;
                    $result->status = 'ok';
                }
                break;

            case "page.load":
                $row = Request::rowint('id');
                $obj = new PageModel($row);
                if ($obj->loaded()) {
                    $result->model = $obj->get_model();
                    unset ($result->model["html"]); // don't mention it
                    unset ($result->model["hashes"]); // don't mention it
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
                $row = Request::rowint('id');
                $obj = new PageModel($row);
              // $obj->AfterSave = "self::compile";
                if ($obj->loaded()) {
                    // $obj->set_model($_POST); // doesn't trigger __set ... so
                    foreach ($_POST as $key => $value) {
                        if (in_array($key,["hashes","modified","path","id"])) continue;
                        if (in_array($key,["html"])) $obj->AfterSave = "self::createThumbnail";
                        $obj->$key = $value; // this does trigger __set
                    }
                    $obj->save();
                }
                $result->status = "ok";
                break;

            case "page.savecontent":
                $row = Request::rowint('id');
                $obj = new PageModel($row);
                if ($obj->loaded()) {
                    $obj->content = Request::post('content',true);
                    $obj->save();
                }
                $result->obj = $obj;
                $result->status = "ok";
                break;

            case "page.savepartial":
                $row = Request::rowint('id');
                $filename = Request::post('filename');
                $title = pathinfo(Request::post('title', false, null, $filename), PATHINFO_FILENAME);
                $content = Request::post('content',true);
                $parent = new PageModel($row);
                if ($parent->loaded()) {
                    $parent = new PageModel($row);
                    $child = new PageModel(0);
                    $child->course = $parent->course;
                    $child->parent = $parent->id;
                    $child->sequence = 999; // todo
                    $child->title = $title;
                    $child->filename = $filename;
                    $child->type = 'Information';
                    $child->scormid = 's' . time();
                    $child->contribute = 'n';
                    $child->score = 100;
                    $child->percentage = 100;
                    $child->nav = 'n';
                    $child->visibility = 0;
                    $child->template = '';
                    $child->content = $content;
                    $child->html = '';
                    $child->deleted = 0;
                    $child->modified = date('Y-m-d H:i:s');
                    $child->save();

                    $child->path = $parent->path . $child->id . '/';
                    $child->save();

                    $result->status = "ok";
                }
                break;

            case "file.dnd":
                break;

            case "page.contentbyfilename":
                $filename = Request::post("filename");
                $obj = PageModel::loadByFilename($course_id, $filename);
                if ($obj->loaded()) {
                    $result->content = $obj->content;
                    $result->id = $obj->id;
                    $result->status = "ok";
                } else {
                    $result->error = "A page with that filename was not found in this course.";
                }
                break;

            case "page.contentbyfilename.raw":
                $filename = Request::post("filename");
                $obj = PageModel::loadByFilename($course_id, $filename);
                if ($obj->loaded()) {
                    die($obj->content);
                }
                die();
                break;

            case "page.templatebyfilename.raw":
                $filename = Request::post("filename");
                $fn = Config::get("LIB") . "/templates/runtimes/textplayer/Layout/layouts/{$filename}";
                die(IO::loadFile($fn));
                break;

            case "page.savehtml":
                $row = Request::rowint('id');
                $pm = new PageModel($row);
                if ($parent->loaded()) {
                    $pm->html = Request::post("html",true);
                    $pm->save();
                }
                $result->status = "ok";
                break;

            default:
                $result->status = "ok";
                break;
        };
        $this->View->renderJSON($result);
    }

    public function preview($page_id = 0) {
        $pm = new PageModel($page_id);
        $pm->Course->validateAccess(Session::CurrentUserId());
        $t = $pm->template; if (empty($t)) $t = "auto";
        $model = [
            "html" => $pm->html,
            "content" => $pm->content,
            "settings" => $pm->Course->Settings,
            "template" => $t,
            "mappedfolder" => $pm->Course->Path,
            "id" => $page_id,
        ];

        // $this->View->requires($pm->Course->Path."/SCO1/Layout/js/core.js");
        // $this->View->requires($pm->Course->Path."/SCO1/Layout/js/render.js");
        $this->View->requires("loadjs", Config::get("LIB")."/templates/runtimes/textplayer/Layout/js/shivs.js");
        $this->View->requires("loadjs", Config::get("LIB")."/templates/runtimes/textplayer/Layout/js/core.js");
        $this->View->requires("https://code.jquery.com/jquery-1.12.4.min.js");
        $this->View->requires("loadjs", Config::get("LIB")."/templates/runtimes/textplayer/Layout/js/render.js");
        $this->View->requires("loadjs", Config::get("LIB")."/templates/runtimes/textplayer/Layout/js/run.js");
        $this->View->requires($pm->Course->Path."/SCO1/Layout/css/app.css");
        $this->View->requires("plugins/Ninjitsu/preview/", $model);

        $this->View->render("edit/preview", $model);
    }

    public function download($course_id = 0, $dest = "browser") {
        $cm = new CourseModel($course_id);

        $cm->compile();

        //IO::xcopy(Config::get("BASE") . "/phpapp/runtimes/textplayer/", $cm->RealPath . "/SCO1/");
        //IO::xcopy(Config::get("BASE") . "/phpapp/layouts/bottom-bar-menu", $cm->RealPath . "/SCO1", [], [], true);

    }

    public function tim($course_id = 0) {
        $cm = new CourseModel($course_id);
header("content-type:text/plain");
        // autoloading isn't working ??
        require_once(Config::get("LIB") . "/compilers/ninjitsu/compiler.php");
        $s = new \Ninjitsu\Compiler();
        $pm = new PageModel(621);
        $s->render($pm);

        // require_once(Config::get("LIB") . "/compilers/ninjitsu/screenshot.php");
        // $s = new \Ninjitsu\Screenshot();
        // $pm = new PageModel(622);
        // $s->render($pm);

    }


    public function asp_index($id) {
	    $user_id = Session::get("user_id");
	    Response::cookie("aspname", DatabaseFactory::get_record("plebs", array("id" => $user_id), "name"));
	    Response::redirect(Config::get("ROOTURL") . "/engine/pages/edit/?id=$id", true);
    }

}