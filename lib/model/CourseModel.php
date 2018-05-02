<?php

// this is kind of an Entity with a DataMapper in the parent
// so not ideal but reasonable in this app

class CourseModel extends Model {

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

	public function get_model($assoc = true)
    {
        return ($assoc) ? (array) $this->_data : $this->_data;
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

    public function save()
    {
        $id = parent::Update(self::TABLE_NAME, self::ID_ROW_NAME, $this->_data);
        if ($this->_data[self::ID_ROW_NAME] === 0) {
	        $this->_data[self::ID_ROW_NAME] = $id; // set directly, not via __set()
        }
        return $id;
    }

    // magic methods! replace these :-/ but hey, replace php too
    // https://stackoverflow.com/questions/4478661/getter-and-setter
    public function __set($property, $value){
	    if ($property == "Pages") {
		    return $this->$_pages = $value;
	    } else if ($property == "Path" || $property == "RealPath") {
		    throw new Exception("Unable to set path");
	    }
	    if ($property == self::ID_ROW_NAME) return; // disallow
		return $this->_data[$property] = $value;
    }

    public function __get($property){
	    if ($property == "Pages") {
		    return $_pages;
	    } else if ($property == "RealPath") {
			$path = DatabaseFactory::get_record("coursefolder", array("id" => $this->_data[self::ID_ROW_NAME]), "path");
			return Config::get("BASE") . str_replace(array('/', '\\'), DIRECTORY_SEPARATOR, $path);
	    } else if ($property == "Path") {
			$path = DatabaseFactory::get_record("coursefolder", array("id" => $this->_data[self::ID_ROW_NAME]), "path");
			return $path;
	    }
		return array_key_exists($property, $this->_data)
			? $this->_data[$property]
			: null
			;
    }

    public function properties() {
	    return array_keys($this->_data);
    }

}