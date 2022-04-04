<?php
	
Class MediaModel { // implements Modellable
	
	public static function base_model($context, $layout = "insert") {
		$json = realpath(dirname(__FILE__) . "/media_actions.json");
		$model = IO::loadJSON($json);
		$model["layout"] = $layout;
		$model["context"] = $context;  // typically the course id, but we might extend
		return $model;
	}

	public static function course_images_model($context) {
		$course = new CourseModel($context);
		$source = implode(DIRECTORY_SEPARATOR, [$course->RealPath,"SCO1","Configuration","images.json"]);
		$model = [];
		$model['images'] = [];
		$model["source"] = $source;
		$model["path"] = implode('/', [$course->Path ,"SCO1","en-us","Content","media",""]); // relative with / on end
		if (isset($json['images'])) {
			$model['images'] = $json['images'];
		}
		return $model;
	}
	
	public static function course_image_captions_model($context) {
		$course = new CourseModel($context);
	    $course->regenImageJson(true);
	    $course->save();

	    $captions = $course->captions;
	    $media = $course->media;

	    foreach ($media["images"] as $image) {
		    if (!is_array($captions) || !array_key_exists($image["name"], $captions)) {
			    $captions[$image["name"]] = [
				    "alt" => "",
				    "caption" => ""
			    ];
			}
	    }

		$model = [];
		$model["captions"] = $captions;
		$model["path"] = implode('/', [$course->Path ,"SCO1","en-us","Content","media",""]); // relative with / on end

		return $model;
	}
}