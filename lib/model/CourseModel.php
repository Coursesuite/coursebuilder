<?php

// this is kind of an Entity with a DataMapper in the parent
// so not ideal but reasonable in this app

class CourseModel extends HashableModel {

	CONST TABLE_NAME = "courses";
	CONST ID_ROW_NAME = "id";
	private $_data;
	private $_pages;

	// valiate the user is allowed to see this course model
	// execute fastest lookups first
	public function validateAccess($user_id) {

		// user is admin (e.g. star container)
		$star = DatabaseFactory::get_record("plebs", array("id" => $user_id, "container" => "*"), "count(1)");
		if ($star > 0) {
			return true;
		}

		// user owns the container that this course is in
		$database = DatabaseFactory::getFactory()->getConnection();
		$query = $database->prepare("select count(1) from courses where container in (select c.id from container c inner join plebs p on p.container = c.name where p.id = :pleb) and id=:course");
		$query->execute(array(":pleb" => $user_id, ":course" => $this->_data[self::ID_ROW_NAME]));
		if ($query->fetchColumn(0) > 0) {
			return true;
		}

		throw new Exception("Access to Course model is not authorised for this user");
		return false;
	}

	// check that the course row is set and is valid in the database
	public function mustExist($alsoCheckDisk = false) {

		if (!isset($this->_data[self::ID_ROW_NAME])) {
			throw new Exception("CourseModel was not initialised");
		}

		$count = (int) DatabaseFactory::get_record("courses", array(self::ID_ROW_NAME => $this->_data[self::ID_ROW_NAME]), "count(1)");
		if ($count === 0) {
			throw new Exception("Course record was not found");
		}

		if ($alsoCheckDisk === TRUE) {
			$path = DatabaseFactory::get_record("coursefolder", array("id" => $this->_data[self::ID_ROW_NAME]), "path");
			if (!is_dir(Config::get("PATH_ROOT") . $path)) {
				throw new Exception("Course folder was not found");
			}
		}

	}

    public function loaded() {
        return isset($this->_data) && isset($this->_data[self::ID_ROW_NAME]) && $this->_data[self::ID_ROW_NAME] > 0;
    }

	public function get_model($assoc = true)
    {
        return ($assoc) ? (array) $this->_data : $this->_data;
    }

    public function __construct($row_id = 0)
    {
        parent::__construct(["config","glossary","references","media"]);
        if ($row_id === 0) {
	    	$this->_data = (array) parent::Create(self::TABLE_NAME);
        } else if ($row_id > 0) {
	    	$this->_data = (array) parent::Read(self::TABLE_NAME, self::ID_ROW_NAME . "=:id", array(":id" => $row_id))[0]; // 0th of a fetchall
        }
        return $this;
    }

    public function delete($id = 0)
    {
    	if ($id > 0) {
    		parent::Destroy(self::TABLE_NAME, self::ID_ROW_NAME . "=:id", array(":id" => $id));
    	} else {
    		parent::Destroy(self::TABLE_NAME, self::ID_ROW_NAME . "=:id", array(":id" => $this->_data[self::ID_ROW_NAME]));
    	}
    	if ($id === $this->_data[self::ID_ROW_NAME]) {
	    	foreach (array_keys($this->_data) as $key) {
		    	unset($this->_data[$key]);
	    	}
	    }
    }

    public function save() {
        $this->_data["touched"] = time();
        $id = parent::Update(self::TABLE_NAME, self::ID_ROW_NAME, $this->_data);
        if ($this->_data[self::ID_ROW_NAME] === 0) {
	        $this->_data[self::ID_ROW_NAME] = $id; // set directly, not via __set()
        }
        return $id;
    }

    public function __set($property, $value){
        if ($property == self::ID_ROW_NAME) {
            return; // disallow
	    } else if ($property == "Pages") {
		    return $this->$_pages = $value;
	    } else if (in_array($property, ["Path", "RealPath", "DisplayPath", "MediaPath", "MediaRealPath"])) {
		    throw new Exception("Unable to set path");
	    } else if (in_array($property, ["Media"])) {
		    throw new Exception("Unable to set media");
	    } else if (in_array($property, ["AllPages"])) {
		    throw new Exception("Unable to set collection");
	    } else if ($property === "hashes" && empty($value)) {
            $value = null;
        }
        $this->PutHash($property, $value); // checks internally if it needs to based on the property name
		return $this->_data[$property] = $value;
    }

    public function __get($property){
	    if ($property == "Pages") {
	    	if (!isset($_pages)) {
	    		$_pages = new PagesCollection($this->_data[self::ID_ROW_NAME], 0);
	    	}
		    return isset($_pages)
		    	? $_pages
		    	: null
		    	;
	    } else if ($property == "AllPages") {
    		return new PagesCollection($this->_data[self::ID_ROW_NAME], -1);
        } else if ($property == "Settings") { // json object prepackaged for use in javascript
            $json = json_decode($this->_data["config"], true);
            $json["images"] = json_decode($this->_data["media"], true);
            $json["glossary"] = json_decode($this->_data["glossary"], true);
            $json["references"] = json_decode($this->_data["references"], true);
            return $json;
	    } else if ($property == "RealPath") { // the realpath(folder_name) for filesystem uses
			$path = DatabaseFactory::get_record("coursefolder", array("id" => $this->_data[self::ID_ROW_NAME]), "path");
			return Config::get("BASE") . str_replace(array('/', '\\'), DIRECTORY_SEPARATOR, $path);

	    } else if ($property == "Path") {  // e.g. /user_courses/username/course_folder for url alias use
			$path = DatabaseFactory::get_record("coursefolder", array("id" => $this->_data[self::ID_ROW_NAME]), "path");
			return $path;

	    } else if ($property == "DisplayPath") { // e.g. username / course_folder for visibility to user
			$path = realpath(Config::get("BASE") . DatabaseFactory::get_record("coursefolder", array("id" => $this->_data[self::ID_ROW_NAME]), "path"));
			$path = str_replace(Config::get("PATH_CONTAINERS"), '', $path);
			return $path;

	    } else if ($property == "MediaRealPath") {
			$path = DatabaseFactory::get_record("coursefolder", array("id" => $this->_data[self::ID_ROW_NAME]), "path") . "/SCO1/en-us/Content/media/";
 			return Config::get("BASE") . str_replace(array('/', '\\'), DIRECTORY_SEPARATOR, $path);

	    } else if ($property == "MediaPath") {
			$path = DatabaseFactory::get_record("coursefolder", array("id" => $this->_data[self::ID_ROW_NAME]), "path") . "/SCO1/en-us/Content/media/";
			return $path;

	    } else if ($property == "Media") {
	    	return new MediaCollection($this->_data[self::ID_ROW_NAME]);

	    } else if ($property == "hashes") {
            if (empty($this->_data["hashes"])) return new stdClass();
            if (is_object($this->_data["hashes"])) return $this->_data["hashes"];
            $value = unserialize($this->_data["hashes"]);
            return is_object($value) ? $value : (new stdClass()); // we expect hashes to only be an object, not some other kind of serializable value
        }
		return array_key_exists($property, $this->_data)
			? $this->_data[$property]
			: null
			;
    }

    public function properties() {
	    return array_keys($this->_data);
    }

    // touch the course record in the lightest possible way
    public function touch() {
        $idname = self::ID_ROW_NAME;
        $table = self::TABLE_NAME;
        $database = DatabaseFactory::getFactory()->getConnection();
        $database->query("UPDATE {$table} SET `touched`=" . time() . " WHERE {$idname}=" . $this->_data[$idname]);
    }

    // takes pages and configuration from the disk and puts it into the database, where needed
    public function upgrade() {
    	$pages = DatabaseFactory::count_records("page", array("course" => $this->_data[self::ID_ROW_NAME]));
    	if ($pages === 0) {
    		$xml = simplexml_load_file($this->RealPath . "/SCO1/en-us/Pages.xml");
    		PageModel::convertPages($xml, $this->RealPath . "/SCO1/en-us/Content/", 0, $this->_data[self::ID_ROW_NAME]);
    	}
    	PageModel::calculatePaths($this->_data[self::ID_ROW_NAME]);
    }

    public function checkMedia() {
    	Curl::cronCall("mediascan", $this->_data[self::ID_ROW_NAME]);
    }

    public function exportContent($path = null) {
        if (is_null($path)) $path = "{$this->RealPath}/SCO1/en-us/Content/";
        $path = rtrim($path,DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR;
        $js = [];
        foreach ($this->AllPages as $page) {
            $c = $page->content;
            $t = $page->template;
            if (empty($c)) continue;
            IO::saveSTRING("{$path}{$page->filename}", $c);
            $js[$page->filename] = empty($t) ? "auto" : $t;
        }
        return $js;
    }

    public function exportHtml($path = null) {
        if (is_null($path)) $path = "{$this->RealPath}/SCO1/en-us/Content/";
        $path = rtrim($path,DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR;
        $js = [];
        foreach ($this->AllPages as $page) {
            $h = $page->html;
            $t = $page->template;
            if (empty($h)) continue;
            IO::saveSTRING("{$path}{$page->filename}", $h);
            $js[$page->filename] = empty($t) ? "auto" : $t;
        }
        return $js;
    }

    public function compile() {
    	$fold = $this->RealPath;
    	$Config = json_decode($this->config);
    	IO::emptyFolder("{$fold}/SCO1/Configuration");
    	IO::emptyFolder("{$fold}/SCO1/Layout");

    	// base course files
    	IO::xcopy(Config::get("LIB") . "/templates/runtimes/textplayer/", $this->RealPath . "/SCO1/");


    	// customisations OR template
    	if (file_exists(Config::get("BASE") . "/phpapp/layouts/." . md5($this->id))) { // in a dotfolder
    		$layout = Config::get("BASE") . "/phpapp/layouts/." . md5($this->id);
    	} else {
    		$layout = Config::get("LIB") . "/templates/layouts/{$Config->layout->template}/";
    	}
    	IO::xcopy($layout, $this->RealPath . "/SCO1/", [], [], true);

    	// update config files
    	IO::saveSTRING("{$fold}/SCO1/Configuration/settings.json", $this->config);
    	IO::saveSTRING("{$fold}/SCO1/Configuration/glossary.json", $this->glossary);
    	IO::saveSTRING("{$fold}/SCO1/Configuration/references.json", $this->references);
    	IO::saveSTRING("{$fold}/SCO1/Configuration/images.json", MediaModel::generateMediaJson($this)); // update
    	IO::saveSTRING("{$fold}/SCO1/Configuration/help.txt", $this->help);

    	// update css variables
    	$str = Text::compileHtml(Config::get("LIB") . "/templates/less_variables.hba", $Config);
    	IO::saveSTRING("{$fold}/SCO1/Layout/less/variables.less", $str);

    	// scorm files
    	$sco = $Config->engine->sco;
    	IO::xcopy(Config::get("LIB") . "/templates/scorm/{$sco}/", $this->RealPath);

    	// files from the database
        $this->exportHtml("{$fold}/SCO1/en-us/Content/");
    	// foreach ($this->AllPages as $page) {
    	// 	$content = !empty($page->html) ? $page->html : $page->content;
    	// 	IO::saveSTRING("{$fold}/SCO1/en-us/Content/{$page->filename}", $content);
    	// }

    	$ref = md5($this->config);
    	$scodata = array(
    		"REFID" => $ref,
    		"TITLE" => $Config->course->name,
    		"DESCRIPTION" => $Config->course->description,
    		"ORGID" => $ref,
    		"ITEMID" => $ref,
    		"LAUNCH" => "index.html",
    		"FILES" => IO::files($this->RealPath)
    	);

    	// recompile manifest (as handlebars)
    	$outp = Text::compileHtml($this->RealPath . "/imsmanifest.xml", $scodata);
    	IO::saveSTRING("{$fold}/imsmanifest.xml", $outp);

        $this->compileCss("self::save");

    }

    public function maybeCompileCss($func = null) {
        if (!file_exists("{$this->RealPath}/SCO1/Layout/css/app.css")) {
            $this->compileCss($func);
        }
    }

    public function compileCss($func = null) {
        $fold = $this->RealPath;
        $less = new lessc;
        $css = $less->compileFile("{$fold}/SCO1/Layout/less/app.less");
        $css = str_replace("../css/", "", $css);
        IO::saveSTRING("{$fold}/SCO1/Layout/css/app.css", $css); // fix references
        $this->PutHash("css", md5($css), $func);
    }




    /*
     *
     *          STATIC METHODS
     *
     */

    // public static function precompile($course_id = 0, $debug = false) {

    //     if ($course_id < 1) return;

    //     // we would want to compile both pages and screenshots in a single process - fix

    //     $cm = new CourseModel($course_id);

    //     require_once(Config::get("LIB") . "/compilers/ninjitsu/compiler.php");  // needed until I can figure out why autoloading isn't working
    //     require_once(Config::get("LIB") . "/compilers/ninjitsu/screenshot.php");  // needed until I can figure out why autoloading isn't working

    //     $cm->compileCss();

    //     $c = new \Ninjitsu\Compiler();
    //     $c->render($cm, $debug);

    //     $s = new \Ninjitsu\Screenshot();
    //     $s->render($cm, $debug);

    // }

    public static function compileAllHtml($course_id) {
        require_once(Config::get("LIB") . "/compilers/ninjitsu/compiler.php");  // needed until I can figure out why autoloading isn't working
        $cm = new CourseModel($course_id);
        if ($cm->loaded()) {
            $c->maybeCompileCss();
            $c = new \Ninjitsu\Compiler();
            $c->render($cm, false);
        }
    }
    public static function createAllThumbnails($course_id) {
        require_once(Config::get("LIB") . "/compilers/ninjitsu/screenshot.php");  // needed until I can figure out why autoloading isn't working
        $cm = new CourseModel($course_id);
        if ($cm->loaded()) {
            $s = new \Ninjitsu\Screenshot();
            $s->render($cm, false);
        }
    }


}