<?php

class EditController extends Controller
{
    public function __construct(...$params)
    {
        parent::__construct($this, $params);
        parent::RequiresLogon();
    }

    public function index($course_id = 0) {

        $this->View->requires("uikit");
        $this->View->requires("base");
        $this->View->requires("/css/tardproof.less");

        $this->View->requires("https://cdn.jsdelivr.net/g/materialize@0.98.2(css/materialize.min.css),dropzone@4.3.0(dropzone.min.css)");
        $this->View->requires("https://cdn.jsdelivr.net/g/jquery@3.2.1(jquery.min.js),materialize@0.98.2,paste-image@0.0.3,handlebarsjs@4.0.8,dropzone@4.3.0");

        $course = (new CourseModel($course_id))->get_model(); // to get the public model
  //      $outPath = IO::append_path($course->RealPath, ["SCO1","en-us","Content"], true);


        // build the display model
        $model = ["context"=>$course_id, "course"=>$course];
        $this->View->render("edit/index", $model);

    }

    public function asp_index($id) {
	    $user_id = Session::get("user_id");
	    Response::cookie("aspname", DatabaseFactory::get_record("plebs", array("id" => $user_id), "name"));
	    Response::redirect(Config::get("ROOTURL") . "/engine/pages/edit/?id=$id", true);
    }

}