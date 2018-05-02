<?php

class ImportController extends Controller {
	public function __construct(...$params) {
		parent::__construct($this, $params);
		parent::RequiresLogon();
	}

	protected static function is_ninja_zip($path) {
		// if (substr( $path, strlen( $path ) - 4 ) !== ".zip") return false;
		$zip = new ZipArchive();
		$bfound = false;
		if ($zip->open($path) === TRUE) { // can be opened
			for ($i =0; $i < $zip->numFiles; $i++) {
				$stat = $zip->statIndex( $i );
				if ( substr($stat["name"], -6) === ".ninja" ) {
					$bfound = true;
				}
			}
			$zip->close();
		}
		return $bfound;
	}

	protected static function extract_ninja_zip($path_to_zip, $extraction_path) {
		$files = [];
		$zip = new ZipArchive();
		$zip->open($path_to_zip);
		for ($i =0; $i < $zip->numFiles; $i++) {
			$ni = $zip->getNameIndex($i);
			if (strlen($ni)>5 && substr($ni, 0, 5)==="data/") {
				$zip->extractTo($extraction_path, $ni); // mkdir automatically
			}
			if (substr($ni, -6) === ".ninja") {
				$ninja = json_decode($zip->getFromIndex($i))->files;
				foreach ($ninja as $entry) {
					$json = json_decode($entry->value);
					$depth = isset($json->depth) ? $json->depth : 0;
					$files[$entry->key] = array(
						"title" => $json->name,
						"filename" => "data/{$entry->key}.html",
						"depth" => $depth
					);
				}
			}
		}
		return $files;
	}

	// the import controller has a special route that redirects all requests through index,
	public function ninja($course_id = 0, $node_id = "") {

		$this->View->requires("uikit");
		$this->View->requires("base");
		$this->View->requires("/css/tardproof.less");

		$this->View->requires("https://cdn.jsdelivr.net/g/materialize@0.98.2(css/materialize.min.css),dropzone@4.3.0(dropzone.min.css)");
		$this->View->requires("https://cdn.jsdelivr.net/g/jquery@3.2.1(jquery.min.js),materialize@0.98.2,paste-image@0.0.3,handlebarsjs@4.0.8,dropzone@4.3.0");

		// build the display model
		$model = ImportModel::server_model($course_id);
		$this->View->render("import/ninja", $model);

	}

	// client side model
	public function model() {
		parent::RequiresAjax();
		$model = ImportModel::client_model(false);
		$this->View->renderJSON($model);
	}

	// scripts used by this page
	public function js($context = 0) {
		$model = array(
			"tier" => Session::CurrentTier(),
			"mycontainers" => Session::User()->containers,
			"context" => $context
		);
		$this->View->render("_templates/appjs", $model, null, null, false, "text/javascript");
	}

	public function action($course, $property, $value) {
		parent::RequiresAjax();
		$model = [];
		$this->View->renderJSON($model);
	}

	// handle ajax upload of a ninja course
	public function drop($context = 0) {
		parent::RequiresAjax();
		$file = $_FILES['file']['tmp_name'];
		// $name = $_FILES['file']['name'];
		// $mime = $_FILES['file']['type'];
		// $size = $_FILES['file']['size'];
		// $err = $_FILES['file']['error'];
		if (self::is_ninja_zip($file)) {

			$course = new CourseModel($context);
			$extraction_path = IO::append_path($course->RealPath, ["SCO1","en-us","Content"], true);

			$files = self::extract_ninja_zip($file, $extraction_path);
			$this->View->renderJSON($files);

		} else {
			die("not a ninja zip, {$file} {$name}");
		}
	}

}