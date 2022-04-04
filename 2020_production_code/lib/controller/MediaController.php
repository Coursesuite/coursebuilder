<?php
class MediaController extends Controller {

	public function __construct() {
		parent::__construct($this);
	}
	
    public function js($context = 0) {
	    $model = array(
		    "tier" => Session::CurrentTier(),
		    "mycontainers" => Session::User()->containers,
			"media" => MediaModel::base_model(null, "insert"),
			"context" => $context
	    );
		$this->View->render("_templates/appjs", $model, null, null, false, "text/javascript");
    }

    public function css($context = 0) {
	    Response::redirect(Config::get("ROOTURL") . "/css/media.css");
		// $this->View->render("_templates/appcss", array("context" => $context), null, null, false, "text/css");
    }
	
	
	public function index($context, $layout = "insert", $field_id = "", $current_value = "") {

		// tab bodies
		$this->View->requires("media/action.upload.hbt");
		$this->View->requires("media/action.showmedia.hbt");
		$this->View->requires("media/action.showfiles.hbt");
		
		// property templates
		$this->View->requires("media/props.details.hbt");
		$this->View->requires("media/props.form.hbt");
		$this->View->requires("media/props.classifier.hbt");
		$this->View->requires("media/display.image.hbt");
		$this->View->requires("media/display.video.hbt");

		// libraries
		$this->View->requires("https://cdn.jsdelivr.net/g/materialize@0.98.2(css/materialize.min.css),dropzone@4.3.0(dropzone.min.css)");
		$this->View->requires("https://cdn.jsdelivr.net/g/jquery@3.2.1(jquery.min.js),materialize@0.98.2,paste-image@0.0.3,handlebarsjs@4.0.8,dropzone@4.3.0");
		
		// script values we need after load
		$this->View->requires("init", "UI.Init.SetParams('$field_id','$current_value');");
		
	    $model = MediaModel::base_model($context, $layout);
	    
        $this->View->render("media/base", $model, "media");

	}
	
	public function images($context) {
		$course = new CourseModel($context);
		$path = $course->RealPath . "\\SCO1\\en-us\\Content\\media";
		$files = glob($path . "\\*.{jpg,JPG,jpeg,JPEG,png,PNG,gif,GIF,webp,WEBP}", GLOB_BRACE);
		$images = array();
		foreach ($files as $file) {
			$data = getimagesize($file);
			$fn = basename($file);
			$image = array(
				"hash" => md5_file($file),
				"urlbase64" => Text::base64_urlencode($course->Path . "/SCO1/en-us/Content/media/$fn"),
				"changed" => filemtime($file),
				"url" => $course->Path . "/SCO1/en-us/Content/media/$fn",
				"packageurl" => "/SCO1/en-us/Content/media/$fn",
				"name" => $fn,
				"size" => Utils::human_filesize(filesize($file),1),
				"width" => $data[0],
				"height" => $data[1],
				"mime" => $data["mime"],
				"basecolour" => Image::getBaseColour($file),
			);
			if ($data["mime"] == "image/jpeg") {
				$exif = new iptc($file);
				$image["copyright"] = $exif->getValue(IPTC_TYPES::IPTC_COPYRIGHT_STRING);
				$image["title"] = $exif->getValue(IPTC_TYPES::IPTC_HEADLINE);
				$image["description"] = $exif->getValue(IPTC_TYPES::IPTC_CAPTION);
			}
			$images[] = $image;
		}
		$this->View->renderJSON($images, true, true);
	}

	public function files($context) {
		$course = new CourseModel($context);
		$path = $course->RealPath . "\\SCO1\\en-us\\Content\\media";
		$folder = glob($path . "\\*.{pdf,PDF,doc,DOC,docw,DOCW,zip,ZIP,txt,TXT}", GLOB_BRACE);
		$files = array();
		foreach ($folder as $file) {
			$data = getimagesize($file);
			$fn = basename($file);
			$files[] = array(
				"hash" => md5_file($file),
				"changed" => filemtime($file),
				"url" => $course->Path . "/SCO1/en-us/Content/media/$fn",
				"packageurl" => "/SCO1/en-us/Content/media/$fn",
				"name" => $fn,
				"size" => Utils::human_filesize(filesize($file),1),
				"mime" => $data["mime"]
			);
		}
		$this->View->renderJSON($files, true, true);
	}


    // return an image (jpeg) from the base64 encoded url and width.
    // creates the thumb and saves it to disk in the /img/thumbs/ folder
    // for previewing within an interface, not setting media in a course context
    public function image($path, $width) {

        $path = Text::base64_urldecode($path);
        
        if (strpos("/", $path) === 0) {
            $path = trim($path,"/");
        }
        if (strpos($path,"/courses_copy/") !== false) { // ugh, hax!
	        $path = Config::get("ROOTURL") . $path; 
        } else if (strpos($path, "/courses/") !== false) { // ugh, hax!
	        $path = Config::get("ROOTURL") . $path; 
        } else if (strpos($path, "://") === false) {
            $path = Config::get("URL") . $path;
        }
        
        $thumb = Config::get("PATH_REAL_WEBROOT") . "img\\thumb\\" . md5($path) . "_$width.jpg";
        if (!file_exists($thumb)) {
            $image = Image::urlThumb($path, $thumb, $width, true);
        }

		header("Content-Type: image/jpeg");
		$size = filesize($thumb);
		header("Content-Length: $size");
		readfile($thumb);

    }
    
    public function drop($context) {
	    parent::RequiresAjax();
		$course = new CourseModel($context);
	    $files = IO::move_uploads($course->RealPath . "\\SCO1\\en-us\\Content\\media\\");
	    $this->View->renderJSON($files, true);
    }
    
    public function meta($context) {
	    parent::RequiresAjax();
	    $course = new CourseModel($context);
	    
	    $hash = Request::post("hash", true, FILTER_SANITIZE_SPECIAL_CHARS);
	    $title = Request::post("title", true, FILTER_SANITIZE_STRING);
	    $alt = Request::post("alt", true, FILTER_SANITIZE_STRING);
	    $desc = Request::post("description", true, FILTER_SANITIZE_STRING);
	    $caption = Request::post("caption", true, FILTER_SANITIZE_STRING);
	    
	    // need to actually build this into media in the database model
	    $result = array(
		    "hash" => $hash,
		    "title" => $title,
		    "alt" => $alt,
		    "description" => $desc,
		    "caption" => $caption,
	    );
	    $this->View->renderJSON($result, true);
    }
    
    public function regenerateImagesJson($context) {
	    $course = new CourseModel($context);
	    $course->regenImageJson(true);
	    $course->save();
    }
    
    public function captions($context, ...$rest) {
		$this->View->requires("https://cdn.jsdelivr.net/g/materialize@0.98.2(css/materialize.min.css),dropzone@4.3.0(dropzone.min.css)");
		$this->View->requires("https://cdn.jsdelivr.net/g/jquery@3.2.1(jquery.min.js),materialize@0.98.2,paste-image@0.0.3,handlebarsjs@4.0.8,dropzone@4.3.0");

		$method = $_SERVER['REQUEST_METHOD'];

	    $model = MediaModel::course_image_captions_model($context);

		if ($method === 'POST') {
			$captions = [];
			$srcs = Request::post('src');
			$alts = Request::post('alt');
			$capts = Request::post('caption');
			$captions = [];
			foreach ($srcs as $i=>$src) {
				$captions[$src] = [
					"alt"=> $alts[$i],
					"caption"=> $capts[$i]
				];
			}
			$course = new CourseModel($context);
			$course->captions = $captions;
			$course->save();
			
			// IO::saveJSON($model['source'], ["captions" => $captions]);
			$model["captions"] = $captions;
		}

        $this->View->render("media/captions", $model, "media");

    }

}