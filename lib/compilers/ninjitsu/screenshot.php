<?php
Namespace Ninjitsu;

class Screenshot {

	private $binPath;

	private function getOptionsString() {
		return "";
	}

	public function render($sourceClass, $debug = false) {

		$start = microtime(true);

		switch (get_class($sourceClass)) {
			case "PageModel": $collection = [$sourceClass]; break;
			case "PagesCollection": $collection = $sourceClass; break;
			case "CourseModel": $collection = $sourceClass->AllPages;
		}

		$courseroot = "";
		$screens = [];
        $output = [];

		foreach ($collection as $page) {
			$html = $page->html;
			if (empty($html)) continue;

			$hash = $page->GetHash("html");

			// technically it is hashchange that calls this routine, so this check should never execute
			if (empty($hash)) {
				$hash = md5($html);
				$page->PutHash("html", $hash, "self::save");
				if ($debug) $output[] = "Created html hash";
			}

	        $fold = implode('/', array_slice(str_split($hash, 2),0,2));
	        $source = \Config::get("PATH_PUBLIC_CACHE_REAL") . "s/{$fold}/{$hash}.html"; // disk path
	        $http = \Config::get("PATH_PUBLIC_CACHE_FULL") . "s/{$fold}/{$hash}.html"; // web path
	        $dest = \Config::get("PATH_PUBLIC_CACHE_REAL") . "s/{$fold}/{$hash}.jpg"; // disk path

	        // have we already got a thumbnail at this match?
	        if (file_exists(pathinfo($dest, PATHINFO_DIRNAME))) continue;

	        if (!file_exists(pathinfo($source, PATHINFO_DIRNAME))) {
	            mkdir(pathinfo($source, PATHINFO_DIRNAME), 0775, true);
			}

			if (empty($courseroot)) $courseroot = \Config::get("ROOTURLCOURSES") . $page->Course->DisplayPath . "/SCO1";
			$content = str_replace("@sco_root@", $courseroot, "<!DOCTYPE html><html><head><style>body{font-family:sans-serif;}</style><link rel='stylesheet' type='text/css' href='@sco_root@/Layout/css/app.css'></head><body>{$html}</body></html>");
			\IO::saveSTRING($source, $content);

			$screens[] = [
				"input" => $http,
				"output" => $dest,
			];
		}

		if (count($screens) > 0) {

			$jobjs = \Text::compilePhpTemplate(__DIR__ . "/templates/screenshot.php", ["screens" => $screens]);
			$jobPath = \Config::get("PATH_PUBLIC_CACHE_REAL") . "s/" . md5($jobjs) . ".js";
			file_put_contents($jobPath, $jobjs);
	        $command = sprintf("%sphantomjs %s %s", $this->binPath, $this->getOptionsString(), $jobPath);
	        $returnCode = null;
	        exec(sprintf("%s 2>&1", escapeshellcmd($command)), $output, $returnCode);

	    }

	    if ($debug) {
			$end = microtime(true);
			$timestamp = ($end - $start);
	        $output[] = printf("Rendering took %s seconds", $timestamp);
	        return implode("\n", $output);
	    }
	}

	function __construct() {
		$this->binPath = __DIR__ . "/bin/";
		return $this;
	}

}