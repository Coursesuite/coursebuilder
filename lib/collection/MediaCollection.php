<?php
class MediaCollection Implements Iterator {

	CONST TABLE_NAME = "media";
	CONST ID_ROW_NAME = "id";

	private $position;
	private $data;
	private $model;

	// the array is a list of the ids of the media
	function __construct($course_id) {
		$idname = self::ID_ROW_NAME;
		$this->position = 0;
		$this->data = DatabaseFactory::get_record(self::TABLE_NAME, ["context"=>$course_id], $idname, 999, 0, "changed");
	}
	public function rewind() {
		$this->position = 0;
	}

	// we don't initialise the pagemodel until it becomes current
	public function current() {
		$id = $this->key();
		if (!isset($this->model[$id])) {
			$this->model[$id] = new MediaModel("id", $id);
		}
		return $this->model[$id];
	}

	// the key is the database row id
	public function key() {
		$idname = self::ID_ROW_NAME;
		return (int) $this->data[$this->position]->$idname;
	}
	public function next() {
		++$this->position;
	}
	public function valid() {
		return isset($this->data[$this->position]);
	}
}