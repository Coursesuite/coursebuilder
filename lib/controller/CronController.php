<?php
set_time_limit(0); // find a work around this bad idea

class CronController extends Controller {
    public function __construct(...$params) {
        // parent::__construct($this, $params);
    }

    public function mediascan($contextid = 0) {

		$ts = gmdate("D, d M Y H:i:s") . " GMT";
		header("Expires: $ts");
		header("Last-Modified: $ts");
		header("Pragma: no-cache");
		header("Cache-Control: no-cache, must-revalidate");

    	$t = microtime(true);

    	MediaModel::scan($contextid);

    	$e = microtime(true) - $t; $n = memory_get_peak_usage();

       if ($n < 1024)
            $n .= " bytes";
        elseif ($n < 1048576)
            $n = round($n/1024,2)." kbytes";
        else
            $n = round($n/1048576,2)." mbytes";

    	die("time = $e seconds, bytes used = $n");

    }
}