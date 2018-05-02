<?php
/**
 * AccountModel
 * Handles all the PRIVATE user stuff. Just a base model.
 */
class AccountModel extends Model
{

    CONST TABLE_NAME = "plebs";
    CONST ID_ROW_NAME = "id";
    private $_data;

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

    // magic methods!
    public function __set($property, $value){
	    if ($property === "containers") return;
	    if ($property == self::ID_ROW_NAME) return; // disallow
      return $this->_data[$property] = $value;
    }

    public function __get($property){
	    if ($property === "containers") {
		    $value = ($this->container == "*")
		    		? ContainerModel::all()
		    		: array($this->container)
		    		;
		    return $value;
	    }
		return array_key_exists($property, $this->_data)
			? $this->_data[$property]
			: null
			;
    }
    
    public function properties() {
	    return array_keys($this->_data);
    }

    public function PersonalContainer() {
	    if ($this->container == "*") {
		    return $this->name;
	    } else {
		    return $this->container;
	    }
    }

	/*
		
		static accessors
		
	*/
    public static function lookup_user_id_by_email($email) {
	    $database = DatabaseFactory::getFactory()->getConnection();
	    $query = $database->prepare("select id from " . self::TABLE_NAME . " WHERE email = :email LIMIT 1");
	    $query->execute(array(":email"=>$email));
	    $result = $query->fetchColumn();
	    $database = null;
	    return $result;
    }

}