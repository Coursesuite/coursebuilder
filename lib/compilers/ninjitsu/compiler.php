<?php
Namespace Ninjitsu;


// we want to render the html of the page using the same javascript renderer that the client-side would use
// so we have to build a job script that reads the same files and pretends to be clientside.
class Compiler {

	protected $binPath;


	/* ----- INTERNALS ----- */


	private function gatherSettings(\CourseModel $cm) {
		$settings = json_decode($cm->config);
		$settings->images = json_decode($cm->media);
		$settings->glossary = json_decode($cm->glossary);
		$settings->references = json_decode($cm->references);
		return $settings;
	}

	private function createJob($path, $jsPages, \CourseModel $cm) {
        $settings = $this->gatherSettings($cm);
		$instance = \Text::compilePhpTemplate(__DIR__ . "/templates/html.php", array(
			"folder" => $cm->folder, // where the course will live later
			"mappedfolder" => $path, // where files are stored at the moment
			"realfolder" => $cm->RealPath, // some functions in render require this
			"settings" => $settings, // includes images, glossary, references
			"jspages" => $jsPages, // page names and their templates
		));
		$handlebars = file_get_contents(__DIR__ . "/js/handlebars.runtime-v1.0.0-rc3.js");
		$engine = file_get_contents(__DIR__ . "/js/engine.js");
		$render = file_get_contents($cm->RealPath . "/SCO1/Layout/js/render.js");
		$job = implode("\n", [$handlebars,$engine,$render,$instance]);
		$jobjs = $path . "job.js";
		file_put_contents($jobjs,$job);
		return $jobjs;
	}

	private function storeResults($path, \CourseModel $cm) {
		$shots = [];
		foreach (new \DirectoryIterator($path . "optimised") as $fileInfo) {
			if ($fileInfo->isDot()) continue;
			$fn = $fileInfo->getFilename();
			$html = file_get_contents($fileInfo->getPathname());
			$pm = \PageModel::loadByFilename($cm->id, $fn);
			$pm->html = $html;
			$pm->save();
			// $pm->updateField("html", $html);
		}
	}

	private function cleanup($path) {
		@unlink($path);
	}

	private function getOptionsString() {
		return "";
	}

	private function ignore($filename) {
		// parse, popup and include all get parsed; load does not
		return (\Text::startsWith($filename, "load"));
	}


	/* ----- PUBLIC METHODS ----- */


	public function render($sourceClass, $debug = false) {

		$cm = null;
		$start = microtime(true);

		switch (get_class($sourceClass)) {
			case "PageModel": $cm = $sourceClass->Course; break;
			case "CourseModel": $cm = $sourceClass; break;
			default: throw new \Exception("Unsupported class type");
		}

		$workingPath = \Config::get("LIB") . "/cache/" . md5($start) . "/";
		mkdir($workingPath . "optimised/", 0775, true);
		$js = $cm->exportContent($workingPath); // of [filename => template]

		if (get_class($sourceClass) === "PageModel") {
			$fn = $sourceClass->filename;
			$js = [$fn => $js[$fn]]; // this is all we are saving
		}

		if (count($js) > 0) {

			$jobPath = $this->createJob($workingPath, $js, $cm);

	        $command = sprintf("%sphantomjs %s %s", $this->binPath, $this->getOptionsString(), $jobPath);
	        $returnCode = null;
	        $output = [];
	        exec(sprintf("%s 2>&1", escapeshellcmd($command)), $output, $returnCode);

	    }

		$this->StoreResults($workingPath, $cm);
		// $this-cleanup($workingPath);

		if ($debug) {
			$end = microtime(true);
			$timestamp = ($end - $start);
	        $output[] = printf("Rendering took %s seconds", $timestamp);
    	    return implode("\n", $output);
	    }
	}



	/* ----- CONSTRUCTOR ----- */


	function __construct() {
		$this->binPath = __DIR__ . "/bin/";
		return $this;
	}

}