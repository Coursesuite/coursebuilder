<?php
class DownloadController extends Controller
{
	
	private static function readfile_chunked($filename, $retbytes = TRUE) {
	    $buffer = '';
	    $cnt    = 0;
	    $handle = fopen($filename, 'rb');
	
	    if ($handle === false) {
	        return false;
	    }
	
	    while (!feof($handle)) {
	        $buffer = fread($handle, 1048576);
	        echo $buffer;
	        ob_flush();
	        flush();
	
	        if ($retbytes) {
	            $cnt += strlen($buffer);
	        }
	    }
	
	    $status = fclose($handle);
	
	    if ($retbytes && $status) {
	        return $cnt; // return num. bytes delivered like readfile() does.
	    }
	
	    return $status;
	}
	

    public function __construct(...$params)
    {
        parent::__construct($this, $params);
        parent::RequiresLogon();
    }
    
    public function save($tempname, $zipname)
    {
	    $in_name = Config::get("PATH_IIS_TEMP") . $tempname . '/files/';
	    $out_name = Config::get("PATH_IIS_TEMP") . $tempname . '.zip';

		$zip = new Zipper;
		if (TRUE === $zip->open($out_name, ZipArchive::CREATE)) {
			$zip->addContents($in_name); // , basename($in_name));
			$zip->close();
		//	// .. ok
		}
		unset($zip);
		

	   header('Content-Type: application/zip');
	   header("Content-Disposition: attachment; filename = {$zipname}.zip");
	   self::readfile_chunked($out_name);

	    // the path that download is in is not accessible to the web server
	    // header('Content-Length: ' . filesize($download));
	    // header("Location: $download");
		exit;

    }
	
}