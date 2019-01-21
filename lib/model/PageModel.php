<?php

// this is kind of an Entity with a DataMapper in the parent
// so not ideal but reasonable in this app
use Screen\Capture;

class PageModel extends HashableModel {

	CONST TABLE_NAME = "page";
	CONST ID_ROW_NAME = "id";
	private $_data;
	private $_pages;
    private $_course;
    private $_changed = null; // properties that are set
    private $_trigger_after_save = null; // function to call

    public function loaded() {
        return isset($this->_data) && isset($this->_data[self::ID_ROW_NAME]) && $this->_data[self::ID_ROW_NAME] > 0;
    }

	public function get_model($assoc = true)
    {
        return ($assoc) ? (array) $this->_data : $this->_data;
    }


    public function set_model($model)
    {
        $this->_data = $model;
    }

    public function __construct($row_id = 0)
    {
        parent::__construct(["html","content"]);
        if ($row_id === 0) {
	    	$this->_data = (array) parent::Create(self::TABLE_NAME);
        } else if ($row_id > 0) {
            if ($row = parent::Read(self::TABLE_NAME, self::ID_ROW_NAME . "=:id", array(":id" => $row_id))) {
                $this->_data = (array) $row[0];
                $this->_course = new CourseModel($this->course);
            }
        }
        return $this;
    }

    public function delete($id = 0)
    {
    	if ($id > 0) {
    		$rec = DatabaseFactory::get_record(self::TABLE_NAME, [self::ID_ROW_NAME => $id], "path,course");
    		$path = $rec->path;
    		$course = $rec->course;
    	} else {
    		$path = $this->_data["path"];
    		$course = $this->_data["course"];
    	}

    	if (strlen($path) > 0) { // include course for safety in case path is somehow just '/'
			parent::Destroy(self::TABLE_NAME, "course = :c AND path LIKE :p", [":c"=>$course, ":p"=>$path . "%"]);
		}

	   	if ($id === $this->_data[self::ID_ROW_NAME]) {
	    	foreach (array_keys($this->_data) as $key) {
		    	unset($this->_data[$key]);
	    	}
	    }
    }

    public function save($touchCourse = true)
    {
        $id = parent::Update(self::TABLE_NAME, self::ID_ROW_NAME, $this->_data, $this->_changed);
        if ($this->_data[self::ID_ROW_NAME] === 0) {
	        $this->_data[self::ID_ROW_NAME] = $id; // set directly, not via __set()
        }
        if (!is_null($this->_trigger_after_save)) {
            list($class,$method) = explode("::", $this->_trigger_after_save);
            if ($class === "self") $class = $this;
            if (method_exists($class,$method)) {
                call_user_func_array([$class,$method], [$id]);
            }
        }
        if ($touchCourse) { // regular saves should touch the course record to note that it contains updated content
            $this->Course->touch();
        }
        return $id;
    }

    // public function updateField($name, $value) {
    //     if ($this->_data[self::ID_ROW_NAME] === 0) return;
    //     Model::UpdateOne(self::TABLE_NAME, self::ID_ROW_NAME, $this->_data[self::ID_ROW_NAME], $name, $value);
    // }

    public function __set($property, $value) {
        if ($property === "Course") {
            $this->_course = $value;
            return $this->_data["course"] = $value->id;
        }
        if ($property === "AfterSave") {
            $this->_trigger_after_save = $value;
            return;
        }
    	if ($property === "HasChildren") return;
    	if ($property === "Children") return; // maybe
	    if ($property === self::ID_ROW_NAME) return; // disallow
        if (in_array($property, $this->getHashableProperties())) { // if property has changed -> trigger recompiler
            $this->PutHash($property, $value); // , "self::precompile");
        }
        if ($property === "hashes" && empty($value)) $value = null;
        $this->_changed[$property] = true; // record if this field has been set
		return $this->_data[$property] = $value;
    }

    public function __get($property){
        if ($property === "Course") {
            return $this->_course;
        } else if ($property === "HasChildren") {
    		return DatabaseFactory::count_records(self::TABLE_NAME,["parent"=>$this->_data[self::ID_ROW_NAME]]) > 0;
    	} else if ($property === "Children") {
    		return new PagesCollection($this->_data["course"], $this->_data[self::ID_ROW_NAME]);
        } else if ($property === "hashes") {
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

    // do compile or screenshot generation in background thread
    // $pm->compilePage(id) => curl calls cron controller => calls static::compilePage
    protected function compilePage($page_id) {
        Curl::cronCall("compileHtml", $page_id);
    }
    protected function screenshotPage($page_id) {
        Curl::cronCall("screenshot", $page_id);
    }




    /*
     *
     *			STATIC METHODS
     *
     */

    // convert pages.xml and the content in the content folder to database records
    public static function convertPages($root, $contentPath, $parent, $course) {
    	$order = 0;
		foreach ($root->page as $page) {
			$order++;
			$props = $page->attributes();
            $children = $page->children();
            $filename = (string)$props['fileName'];
            $type = (string)$props['type'];
			$content = "";
            if ($type === "Quiz" || $type === "Test") {
                $fn = str_replace([".txt",".html"],".xml", $filename);
                if (file_exists($contentPath . $fn)) {
                    $content = file_get_contents($contentPath . $fn);
                }
            } else if (file_exists($contentPath . $filename)) {
				$content = file_get_contents($contentPath . $filename);
			}
			$model = [
				"id"=>0,
				"course"=>$course,
				"title"=>(string)$props['title'],
				"filename"=>$filename,
				"type"=>$type,
				"scormid"=>(string)$props['id'],
				"contribute"=>(string)$props['contribute'],
				"score"=>(int)$props['contributeScore'],
				"percentage"=>(int)$props['contributePercentage'],
				"nav"=>(string)$props['nav'],
				"template"=>(string)$props['template'],
				"content"=>$content,
				"sequence"=>$order,
                "visibility"=> Text::startsWith($filename,"parse") || Text::startsWith($filename,"popup") || Text::startsWith($filename, "include") ? 0 : 1,
				"html"=>"",
				"deleted"=>0,
				"parent"=>$parent
			];
			$id = Model::Update("page", "id", $model);
			if (isset($children)) {
				self::convertPages($children, $contentPath, $id, $course);
			}
		}
    }

    // recalculate the parent/child paths
    public static function calculatePaths($course, $parent = 0, $path='/') {
    	$rows = DatabaseFactory::get_record(self::TABLE_NAME, ['course'=>$course,'parent'=>$parent], 'id',999,0);
    	foreach ($rows as $row) {
    		$obj = new PageModel($row->id);
    		$obj->path = $path . $row->id . '/';
    		$obj->save(false);
    		if ($obj->HasChildren) {
    			self::calculatePaths($course, $obj->id, $obj->path);
    		}
    	}

    }

    // given a course and a filename, load the page model (typically used in loading content into pill-edit mode)
    public static function loadByFilename($course, $filename) {
        $rowid = DatabaseFactory::get_record(self::TABLE_NAME, ['course'=>$course,'filename'=>$filename],'id',1);
        return new PageModel($rowid);
    }

    // compile asks curl to call this function
    public static function compileHtml($page_id) {
        require_once(Config::get("LIB") . "/compilers/ninjitsu/compiler.php");  // needed until I can figure out why autoloading isn't working
        $pm = new PageModel($page_id);
        $pm->Course->maybeCompileCss();
        $c = new \Ninjitsu\Compiler();
        $c->render($pm, false);
    }
    public static function createThumbnail($page_id) {
        require_once(Config::get("LIB") . "/compilers/ninjitsu/screenshot.php");  // needed until I can figure out why autoloading isn't working
        $pm = new PageModel($page_id);
        $s = new \Ninjitsu\Screenshot();
        $s->render($pm, false);
    }

}