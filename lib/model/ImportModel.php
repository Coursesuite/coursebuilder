<?php

class ImportModel
{

	public static function client_model($expand = false) {

		return array();

	}

	public static function server_model($course_id = 0) {

		return array(
			"course" => (new CourseModel($course_id))->get_model()
		);

	}

}