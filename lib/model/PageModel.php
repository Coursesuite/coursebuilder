<?php

// this is kind of an Entity with a DataMapper in the parent
// so not ideal but reasonable in this app

class PageModel extends Model {

	CONST TABLE_NAME = "page";
	CONST ID_ROW_NAME = "id";
	private $_data;
	private $_pages;

    public function loaded() {
        return isset($this->_data);
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
        parent::__construct();
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

    public function save()
    {
        $id = parent::Update(self::TABLE_NAME, self::ID_ROW_NAME, $this->_data);
        if ($this->_data[self::ID_ROW_NAME] === 0) {
	        $this->_data[self::ID_ROW_NAME] = $id; // set directly, not via __set()
        }
        return $id;
    }

    public function __set($property, $value) {
    	if ($property === "HasChildren") return;
    	if ($property === "Children") return; // maybe
	    if ($property === self::ID_ROW_NAME) return; // disallow
		return $this->_data[$property] = $value;
    }

    public function __get($property){
    	if ($property === "HasChildren") {
    		return DatabaseFactory::count_records(self::TABLE_NAME,["parent"=>$this->_data[self::ID_ROW_NAME]]) > 0;
    	} else if ($property === "Children") {
    		return new PagesCollection($this->_data["course"], $this->_data[self::ID_ROW_NAME]);
    	}
		return array_key_exists($property, $this->_data)
			? $this->_data[$property]
			: null
			;
    }

    public function properties() {
	    return array_keys($this->_data);
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
			$content = "";
			if (file_exists($contentPath . (string)$props['fileName'])) {
				$content = file_get_contents($contentPath . (string)$props['fileName']);
			}
			$model = [
				"id"=>0,
				"course"=>$course,
				"title"=>(string)$props['title'],
				"filename"=>$filename,
				"type"=>(string)$props['type'],
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
    		$obj->save();
    		if ($obj->HasChildren) {
    			self::calculatePaths($course, $obj->id, $obj->path);
    		}
    	}

    }

}