<?php
	
class IndexController extends Controller
{
    public function __construct(...$params)
    {
        parent::__construct($this, $params);
        parent::RequiresLogon();
    }

    public function index()
    {

        // parent::SetAspCookie();

	    $this->View->requires("_templates/navbar");
	    $this->View->requires("_templates/fridgeMagnets");
	    $this->View->requires("index/newcourse");
	    $this->View->requires("index/search");
	    $this->View->requires("filedrop/jquery.filedrop.js");
	    $this->View->requires("index/containers.hbt", "index/model");
	    
		// do we need to trigger the introductory tour?
	    // do we need to build a template course?
	    if (IndexModel::should_trigger_tour()) {
		    $this->View->requires("tour/index.js");
		    $template = Config::get('PATH_COURSE_TEMPLATES') . 'classic/template.zip';
		    IndexModel::create_course($template, "classic", "Example course");
	    }

		// build the display model
	    $model = IndexModel::settings_model();
        $this->View->render("index/list", $model);
    }
    
    public function model() {
	    parent::RequiresAjax();
	    $model = IndexModel::get_model(false);
	    $this->View->renderJSON($model);
    }
    
    // scripts used by this page
    public function js() {
	    $model = array(
		    "tier" => Session::CurrentTier(),
		    "mycontainers" => Session::User()->containers,
	    );
		$this->View->render("_templates/appjs", $model, null, null, false, "text/javascript");
    }

	// set search parameters
    public function search(...$params)
    {
	    if (count($params) === 2) {
		    Filter::XSSFilter($params[0]); // e.g. archive
		    Filter::XSSFilter($params[1]); // e.g. show
		    Response::cookie($params[0],$params[1]);
	    }
		Response::redirect("index");
    }
    
    // index/action/535/lock/false => unlock the course
    // index/actin/535/delete => immediately delete the course record AND the folder on disk
    // index/action/535/clone => make a copy of the folder and course record, called "_clone"
    // index/action/535/move/68 => move course to container with id 68
    public function action($course, $property, $value = "false") {
	    parent::RequiresAjax();
	    $model = [];
	    try {

		    if (!is_numeric($course)) {
			    throw new Exception("Course incorrectly specified");
		    }

	    	$course = new CourseModel($course);
	    	$course->mustExist(false);
	    	$course->validateAccess(Session::CurrentUserId());

		    switch ($property) {
			    case "lock":
			    	$locked = (filter_var($value, FILTER_VALIDATE_BOOLEAN) === true);
			    	$course->locked = ($locked) ? 1 : 0;
			    	$course->save();
					$model["status"] = "ok";
			    	break;
			    	
			    case "delete":
			    	$folder = $course->RealPath;
			    	$exists = is_dir($folder);
			    	if ((int)$course->locked == 0 && $exists === TRUE) {
				    	throw new Exception("Cannot delete an unlocked course");
			    	}
			    	if ($exists === TRUE) {
				    	@closedir(opendir($folder)); // in case it's in use
				    	// well, UNLINK and RMDIR are not working

						// so "delete" the folder by moving it somewhere else, we dont care where
						$dest = Config::get("PATH_IIS_TEMP") . uniqid();
					    if (rename($folder, $dest)) {
						    // shoulda worked
					    } else {
						  throw new Exception("Failed to remove/delete folder");
					    }

						//if (PHP_OS === 'Windows') {
						//    exec(sprintf("rd /s /q %s", escapeshellarg($folder)));
						//} else {
						//    exec(sprintf("rm -rf %s", escapeshellarg($folder)));
						//}

				    	//if (!@unlink(realpath($folder))) {
					    //	throw new Exception("Failed to delete folder (in use or permission problem; USER=" . get_current_user() . "). Please raise a Helpdesk ticket.");
				    	//}
			    	}
			    	$course->delete();
					$model["status"] = "ok";
			    	break;
			    	
			    case "clone":
			    	$folder = $course->RealPath;
			    	if (!is_dir($folder)) {
				    	throw new Exception("Cannot clone a missing course");
				    }
			    	$newfolder = $folder . "_copy";
			    	// $newfolder = substr($folder, 0, 20) . "_" . uniqid();
			    	// make sure we don't clone into a previous clone - might mean foo_copy_copy_copy, but you can rename it later
			    	while (is_dir($newfolder)) {
				    	// $newfolder = substr($folder, 0, 20) . "_" . uniqid();
				    	$newfolder = $newfolder . "_" . uniqid();
			    	}
				    // clone the folder on disk
				    IO::recurse_copy($folder, $newfolder);
				    
				    // clone the record, updating fields as required
			    	$clone = new CourseModel(0);
			    	$clone->name = "Copy of " . $course->name;
			    	$clone->folder = basename($newfolder);
			    	$clone->touched = time();
			    	$clone->engine = $course->engine;
			    	$clone->layout = $course->layout;
			    	$clone->stage = "new";
			    	$clone->container = $course->container;
			    	$config = json_decode($course->config);
			    	$config->course->id = uniqid();
			    	$config->course->name = "Copy of " . $config->course->name;
			    	$clone->config = $config; // will auto-serialise on model save
			    	$clone->locked = 0;
			    	$clone->glossary = $course->glossary;
			    	$clone->references = $course->references;
			    	$clone->help = $course->help;
			    	$clone->media = $course->media;
					$model["id"] = $clone->save();
			    	$model["status"] = "ok";
			    	break;
			    	
			    case "move":
				    if (!Session::isAdmin()) {  // until sharing comes along regular users can't switch containers
					    throw new Exception("Permission denied");
				    }
			    	$folder = $course->RealPath;
			    	if (!is_dir($folder)) {
				    	throw new Exception("Cannot move a missing course " . $folder);
				    }
				    
				    if (!is_numeric($value)) { // convert a named container into its id value
			    		$value = (int) DatabaseFactory::get_record("container", array("name" => $value), "id");
				    }
				    $container = new ContainerModel($value);
				    $container->mustExist(); // throws if not found
				    
				    $newfolder = Config::get("PATH_CONTAINERS") . $container->name . '/' . basename($folder);
				    if (is_dir($newfolder)) {
					    throw new Exception("Will not overwrite folder with same name in destination");
				    }
				    // move folder between locations (rename moves dyk!)
				    rename($folder,$newfolder);
				    
				    // update the database with the new container id
				    $course->container = $value;
				    $course->save();
				    $model["status"] = "ok";
			    	break;

		    }
	    } catch (Exception $e) {
		    $model["status"] = $e->getMessage();
	    }
	    $this->View->renderJSON($model);
    }

    // handle ajax upload of a new course
    public function drop() {
	    parent::RequiresAjax();
	    $zip = new ZipArchive();
	    $name = $_FILES['file']['name'];
	    $mime = $_FILES['file']['type'];
	    $size = $_FILES['file']['size'];
	    $err = $_FILES['file']['error'];
	    $course = array();
	    if ( substr( $name, strlen( $name ) - 4 ) === ".zip" ) {
		    if ($zip->open($_FILES['file']['tmp_name']) === TRUE) { // can be opened
			    unset($zip);
				$course = IndexModel::create_course($_FILES['file']['tmp_name'], "blank", $name);
		    }
	    }
		$this->View->renderJSON($course);
    }
    
    public function create() {
	    parent::RequiresAjax();

	    $template = Request::post("template", false, FILTER_SANITIZE_STRING, "blank");
	    $name = html_entity_decode(Request::post("name", false, FILTER_SANITIZE_STRING, "Untitled course"));

		$templateZip = Config::get('PATH_COURSE_TEMPLATES') . $template . '/template.zip';

	    $course = IndexModel::create_course($templateZip, $template, $name);
		$this->View->renderJSON($course);
    }

}