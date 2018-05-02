<?php
	
class ImageController extends Controller {
	public function __construct() {
		parent::__construct($this);
	}
	
	function index($params = null) {
		header($_SERVER["SERVER_PROTOCOL"]." 404 Not Found");
		exit;
	}
	
	function template($name = null) {
		if (!isset($name) || empty($name)) {
			header($_SERVER["SERVER_PROTOCOL"]." 404 Not Found");
			exit;
		}
		
		$path = Config::get("PATH_COURSE_TEMPLATES"). $name . '/' . $name . '.png';
		
		if (!file_exists($path)) {
			header($_SERVER["SERVER_PROTOCOL"]." 404 Not Found");
			exit;
		}

	    $imageInfo = getimagesize($path);
	    switch ($imageInfo[2]) {
	        case IMAGETYPE_JPEG:
	            header("Content-Type: image/jpeg");
	            break;
	        case IMAGETYPE_GIF:
	            header("Content-Type: image/gif");
	            break;
	        case IMAGETYPE_PNG:
	            header("Content-Type: image/png");
	            break;
	       default:
	            break;
	    }
		header("Content-Length: " . filesize($path));
		readfile($path);

		// https://stackoverflow.com/questions/900207/return-a-php-page-as-an-image
		//$image = fopen($path, 'rb');
		//header("Content-Type: image/png");
		//fpassthru($fp);
		exit;
	}
}