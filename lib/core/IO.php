<?php

class IO {

	public static function loadJSON($path, $assoc = true) {
		$file = "{}";
		if (file_exists($path)) {
			$file = file_get_contents($path);
		}
		return json_decode($file, $assoc);
	}

	public static function loadFile($path, $file = "") {
		if (file_exists($path)) {
			$file = file_get_contents($path);
		}
		return $file;
	}

	public static function exists($path) {
		// if ends with / or \ then do is_dir ?
		return file_exsits($path);
	}

	public static function saveJSON($path, $contents, $options = JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_NUMERIC_CHECK) {
		file_put_contents($path, json_encode($contents, $options));
	}

	public static function append_path($root, $append, $create = false, $mode="0775") {
		$path = str_replace(array('/', '\\'), DIRECTORY_SEPARATOR, $root) . DIRECTORY_SEPARATOR;
		if (is_array($append)) {
			$path .= implode(DIRECTORY_SEPARATOR, $append);
		} else {
			$path .= DIRECTORY_SEPARATOR . $append;
		}
		$result = str_replace(DIRECTORY_SEPARATOR . DIRECTORY_SEPARATOR, DIRECTORY_SEPARATOR, $path);
		if ($create === true) if (!file_exists($result)) mkdir($result,$mode,true);
		return $result;
	}


	public static function recurse_copy($source, $destination) {
	    $dir = opendir($source);
	    @mkdir($destination); // sweep errors under the rug ... or throw?
	    while (false !== ( $file = readdir($dir)) ) {
	        if (( $file != '.' ) && ( $file != '..' )) {
	            if ( is_dir($source . DIRECTORY_SEPARATOR . $file) ) {
	                self::recurse_copy($source . DIRECTORY_SEPARATOR . $file, $destination . DIRECTORY_SEPARATOR . $file);
	            }
	            else {
	                copy($source . DIRECTORY_SEPARATOR . $file, $destination . DIRECTORY_SEPARATOR . $file);
	            }
	        }
	    }
	    closedir($dir);
	}

	public static function move_uploads($path) {
		if (!empty($_FILES)) {
			$cmp = DIRECTORY_SEPARATOR;
			$len = strlen($cmp);
		    if (substr_compare( $path, $cmp, -$len) !== 0) $path .= $cmp;
		    $result = array();
		    foreach( $_FILES as $file ) {
			    $result[] = array(
				    "name" => $file["name"],
				    "size" => $file["size"],
				    "mime" => $file["type"]
			    );
			    move_uploaded_file($file['tmp_name'], $path . $file['name']);
		    }
			return $result;
		}
	}

	/* you could probably avoid static recursion by using an object geared up for recursing directories, and do a string replace on the path
	$objects = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($course->Path), RecursiveIteratorIterator::SELF_FIRST);
	foreach ($objects as $key => $file) {
		if ($file->isDir()) continue;
		$realfile = realpath($key);
		echo "<br>" . $realfile . "=>" . $file . PHP_EOL;
	}
	exit; */


}