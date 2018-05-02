<?php

class ContainerModel extends Model
{

    CONST TABLE_NAME = "container";
    CONST ID_ROW_NAME = "id";
    private $_data;

	public function get_model($assoc = true)
    {
        return ($assoc) ? (array) $this->_data : $this->_data;
    }

	public function mustExist() {
		if (!isset($this->_data[self::ID_ROW_NAME])) {
			throw new Exception("CourseModel was not initialised");
		}

		$count = (int) DatabaseFactory::get_record("container", array(self::ID_ROW_NAME => $this->_data[self::ID_ROW_NAME]), "count(1)");
		if ($count === 0) {
			throw new Exception("Container record was not found");
		}
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

    // magic methods!
    public function __set($property, $value){
	    if ($property == self::ID_ROW_NAME) return; // disallow
      return $this->_data[$property] = $value;
    }

    public function __get($property){
      return array_key_exists($property, $this->_data)
        ? $this->_data[$property]
        : null
      ;
    }
    
    public static function all($include_users = false) {
	    $database = DatabaseFactory::getFactory()->getConnection();
	    $sql = "select name from " . self::TABLE_NAME;
	    if (!$include_users) {
		    $sql .= " where name not in (select container from plebs where container <> '*')";
	    }
	    $sql .= " order by name";
	    $query = $database->prepare($sql);
	    $query->execute();
	    $result = $query->fetchAll(PDO::FETCH_COLUMN);
	    $database = null;
	    return $result;
    }
    
    public function properties() {
	    return array_keys($this->_data);
    }

}