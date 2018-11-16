<?php

class MediaController extends Controller {

	public function __construct() {
		parent::__construct($this);
        parent::RequiresLogon();
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

	public function index($context, $layout = "insert", $field_id = "", $current_value = "") {

        $this->View->requires("minimal");

        $this->View->requires("https://cdn.jsdelivr.net/npm/filedrop@2.0.0/filedrop.min.js");
        $this->View->requires("https://cdnjs.cloudflare.com/ajax/libs/tinysort/3.2.2/tinysort.js");
        $this->View->requires("https://cdnjs.cloudflare.com/ajax/libs/gsap/1.18.0/TweenMax.min.js");
        //$this->View->requires("https://cdn.jsdelivr.net/npm/vanilla-lazyload@10.19.0/dist/lazyload.min.js");

		// tab bodies as runtime templates
		$this->View->requires("media/action.upload.hbt");
		$this->View->requires("media/action.images.hbt");
		$this->View->requires("media/action.files.hbt");
		$this->View->requires("media/action.media.hbt");

		// property templates
		$this->View->requires("media/props.details.hbt");
		$this->View->requires("media/props.metadata.hbt");
		$this->View->requires("media/props.classifier.hbt");

		// $this->View->requires("media/display.image.hbt");
		// $this->View->requires("media/display.video.hbt");

		// script values we need after load
		$this->View->requires("init", "UI.Init.SetParams('$field_id','$current_value');");

	    $model = MediaModel::base_model($context, $layout);

        $this->View->render("media/base", $model, "media");

	}

	public function images($context) {
		$course = new CourseModel($context);
		$json = [];
		foreach ($course->Media as $media) {
			if ($media->isImage()) {
				$json[] = [
					"name" => $media->filename, // pathinfo($media->filename, PATHINFO_FILENAME),
					"id" => $media->id,
					"width" => $media->width,
					"height" => $media->height,
					"size" => $media->filesize,
					"type" => $media->extn,
					"changed" => $media->changed,
					"path" => $media->path,
					"caption" => $media->caption,
					"alt" => $media->alt
				];
			}
		}

		$this->View->renderJSON($json);
	}

	public function files($context) {
		$course = new CourseModel($context);
		$json = [];
		foreach ($course->Media as $media) {
			if (!$media->isImage()) {
				$json[] = [
					"name" => $media->filename,
					"id" => $media->id,
					"size" => $media->filesize,
					"type" => $media->extn,
					"changed" => $media->changed,
					"path" => $media->path,
					"caption" => $media->caption,
				];
			}
		}

		$this->View->renderJSON($json);
	}

	public function media($context) {
		$course = new CourseModel($context);
		$json = [];
		foreach ($course->Media as $media) {
			if ($media->isMedia()) {
				$json[] = [
					"name" => $media->filename,
					"id" => $media->id,
					"size" => $media->filesize,
					"type" => $media->extn,
					"changed" => $media->changed,
					"path" => $media->path,
					"caption" => $media->caption,
				];
			}
		}

		$this->View->renderJSON($json);
	}
    public function drop($context) {
	    parent::RequiresAjax();
		$course = new CourseModel($context);
	    $files = IO::move_uploads($course->RealPath . "/SCO1/en-us/Content/media/");
	    $this->View->renderJSON($files, true);
    }

    // public function meta($context) {
	   //  parent::RequiresAjax();
	   //  $course = new CourseModel($context);

	   //  $hash = Request::post("hash", true, FILTER_SANITIZE_SPECIAL_CHARS);
	   //  $title = Request::post("title", true, FILTER_SANITIZE_STRING);
	   //  $alt = Request::post("alt", true, FILTER_SANITIZE_STRING);
	   //  $desc = Request::post("description", true, FILTER_SANITIZE_STRING);
	   //  $caption = Request::post("caption", true, FILTER_SANITIZE_STRING);

	   //  // need to actually build this into media in the database model
	   //  $result = array(
		  //   "hash" => $hash,
		  //   "title" => $title,
		  //   "alt" => $alt,
		  //   "description" => $desc,
		  //   "caption" => $caption,
	   //  );
	   //  $this->View->renderJSON($result, true);
    // }

    // serve a cachable thumbnail version of the image relating to the media id, if the user has accesss
    public function thumb($id, $w = 150, $h = 150, $seconds_to_cache = 3600) {
    	$media = new MediaModel("id", $id);

        $cm = new CourseModel($media->context);
        $cm->validateAccess(Session::CurrentUserId());

        $fn = str_replace('./','', $media->path . '/' . $media->filename); // ./foo.gif->foo.gif but subfolder/foo.gif remains
        $src = $cm->MediaRealPath . $fn;
        $dest = Image::cache_thumbnail($src, $media->hash, $w, $h);

		$size = filesize($dest);
		$ts = gmdate("D, d M Y H:i:s", time() + $seconds_to_cache) . " GMT";

		header("Content-Type: {$media->mime}");
		header("Content-Length: $size");
		header("Expires: $ts");
		header("Pragma: cache");
		header("Cache-Control: max-age=$seconds_to_cache");

		readfile($dest); // send to output
    }

}