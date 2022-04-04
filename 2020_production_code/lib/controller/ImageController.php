<?php
	
class ImageController extends Controller {

	const IMAGE_HANDLERS = [
	    IMAGETYPE_JPEG => [
	        'load' => 'imagecreatefromjpeg',
	        'save' => 'imagejpeg',
	        'quality' => 100,
	        'mime' => 'image/jpeg'
	    ],
	    IMAGETYPE_PNG => [
	        'load' => 'imagecreatefrompng',
	        'save' => 'imagepng',
	        'quality' => 0,
	        'mime' => 'image/png'
	    ],
	    IMAGETYPE_GIF => [
	        'load' => 'imagecreatefromgif',
	        'save' => 'imagegif',
	        'mime' => 'image/gif'
	    ]
	];

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
	
	function thumb($src, $targetWidth = 200, $targetHeight = null) {
		
		$src = Text::base64_urldecode($src);
		if (strpos($src, DIRECTORY_SEPARATOR) === false) {
			$root = str_replace("courses/", "", Config::get("PATH_CONTAINERS"));
			$src = realpath($root . $src);
		}
		
	    $type = exif_imagetype($src);
	
	    if (!$type || !self::IMAGE_HANDLERS[$type]) {
  			header($_SERVER["SERVER_PROTOCOL"]." 400 Bad Request");
		    exit;
	    }
	
	    $image = call_user_func(self::IMAGE_HANDLERS[$type]['load'], $src);
	
	    if (!$image) {
  			header($_SERVER["SERVER_PROTOCOL"]." 404 Not Found");
  			exit;
	    }

	    $width = imagesx($image);
	    $height = imagesy($image);
	
	    if ($targetHeight == null) {
	
	        $ratio = $width / $height;
	
	        // if is portrait
	        if ($width > $height) {
	            $targetHeight = floor($targetWidth / $ratio);
	        }
	        // if is landscape
	        else {
	            $targetHeight = $targetWidth;
	            $targetWidth = floor($targetWidth * $ratio);
	        }
	    }
	
	    $thumbnail = imagecreatetruecolor($targetWidth, $targetHeight);
	
	    if ($type == IMAGETYPE_GIF || $type == IMAGETYPE_PNG) {
	        imagecolortransparent(
	            $thumbnail,
	            imagecolorallocate($thumbnail, 255, 255, 255)
	        );
	        if ($type == IMAGETYPE_PNG) {
	            imagealphablending($thumbnail, false);
	            imagesavealpha($thumbnail, true);
	        }
	    }
	
	    // copy entire source image to duplicate image and resize
	    imagecopyresampled(
	        $thumbnail,
	        $image,
	        0, 0, 0, 0,
	        $targetWidth, $targetHeight,
	        $width, $height
	    );
	    
		header("Content-Type: " . self::IMAGE_HANDLERS[$type]['mime']);
		call_user_func(self::IMAGE_HANDLERS[$type]['save'], $thumbnail);
	
/*
	    // save the duplicate version of the image to disk
	    return call_user_func(
	        IMAGE_HANDLERS[$type]['save'],
	        $thumbnail,
	        $dest,
	        IMAGE_HANDLERS[$type]['quality']
	    );
*/
	}
}