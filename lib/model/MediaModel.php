<?php
	
Class MediaModel { // implements Modellable
	
	public static function base_model($context, $layout = "insert") {
		$json = realpath(dirname(__FILE__) . "/media_actions.json");
		$model = IO::loadJSON($json);
		$model["layout"] = $layout;
		$model["context"] = $context;  // typically the course id, but we might extend
		return $model;
	}
}