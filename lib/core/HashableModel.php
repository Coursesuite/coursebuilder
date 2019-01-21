<?php

// interface HashableInterface {
// 	public function SetHashableProperties(array $properties);
// 	public function GetHash($name, $default = null);
// 	public function PutHash($name, $value, $callback_if_changed = null);
// }

class HashableModel extends Model { // Implements HashableInterface {

	private $_hashables = [];

	function __construct($hashfields) {
		$this->_hashables = $hashfields;
		parent::__construct();
	}

	public function getHashableProperties() {
		return $this->_hashables;
	}

    public function GetHash($name, $default = null) {
        $curr = $this->hashes;
        return isset($curr->$name) ? $curr->$name : $default;
    }

    public function PutHash($name, $value, $callback_if_changed = null) {
        if (in_array($name, $this->_hashables)) {
            $curr = $this->hashes; if (empty($curr)) $curr = new stdClass();
            $oldValue = isset($curr->$name) ? $curr->$name : null;
            $v = (is_object($value) || is_array($value)) ? json_encode($value, JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_NUMERIC_CHECK) : $value;
            $curr->$name = md5($v);
            $this->hashes = $curr;
            if ($oldValue !== $value && !is_null($callback_if_changed)) {
                list($class,$method) = explode("::", $callback_if_changed);
                if ($class === "self") $class = $this;
                if (method_exists($class,$method)) {
                    call_user_func_array([$class,$method], [$name, $value]);
                }
            }
        }
    }

}