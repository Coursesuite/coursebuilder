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
			$file = str_replace("\xEF\xBB\xBF",'',$file); // no bom
		}
		return $file;
	}

	public static function exists($path) {
		// if ends with / or \ then do is_dir ?
		return file_exsits($path);
	}

	public static function saveJSON($path, $contents, $options = JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_NUMERIC_CHECK) {
		if (empty($contents)) return;
		file_put_contents($path, json_encode($contents, $options));
	}

	public static function saveSTRING($path, $contents) {
		if (empty($contents)) return;
		file_put_contents($path, $contents);
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

	public static function files($dir, $skipfiles = [], $skipfolders = []) {
		$skipfolders = array_unique(array_merge(['.git','.ssh','editor'], array_map('rtrim', $skipfolders, array_fill(0, count($skipfolders), DIRECTORY_SEPARATOR))));
		$skipfiles = array_unique(array_merge(['.ds_store','.htaccess','thumbs.db','about.txt','readme.md'], array_map('strtolower', $skipfiles)));
		foreach ($iterator = new RecursiveIteratorIterator(
				new RecursiveDotFilterIterator(
					new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS)
				), RecursiveIteratorIterator::SELF_FIRST
			) as $item) {
			$folders = explode(DIRECTORY_SEPARATOR, empty($iterator->getSubPath()) ? $iterator->getSubPathName() : $iterator->getSubPath()); // subpath is empty at source root folder
			if (count(array_intersect($folders,$skipfolders))>0) continue;
			if ($item->isFile() && in_array(strtolower($iterator->getFilename()), $skipfiles)) continue;
			if ($item->isDir()) continue;
			$result[] = $iterator->getSubPathName();
		}
		return $result;
	}

	// take a folder and empty it out
	public static function emptyFolder($dir) {
		if (!file_exists($dir)) return false;
		$di = new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS);
		$ri = new RecursiveIteratorIterator($di, RecursiveIteratorIterator::CHILD_FIRST);
		foreach ( $ri as $file ) {
		    $file->isDir() ?  rmdir($file) : unlink($file);
		}
		return true;
	}

	// this is not a full port of the windows xcopy command, just the bits we need
	// historically we used xcopy to recursively copy files whilst skipping certain files and folders
	// most switches don't make sense to port (/q=quiet, /s=recursive, /c=continue, /y=yes, /r=overwrite)
	// /exclude: implemented as $skipfiles=[] (case insensitive) and $skipfolders=[] (case sensitive)
	// /u: implemented as $ifindest=false
	// we now also skip hidden folders (those that start with a dot)
	public static function xcopy($source, $dest, $skipfiles = [], $skipfolders = [], $ifindest = false) {

		// ensure source and destination end in one directory separator
		$source = rtrim($source,DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR;
		$dest = rtrim($dest,DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR;

		// normalise skip arrays and apply defaults
		$skipfolders = array_unique(array_merge(['.git','.ssh','editor'], array_map('rtrim', $skipfolders, array_fill(0, count($skipfolders), DIRECTORY_SEPARATOR))));
		$skipfiles = array_unique(array_merge(['.ds_store','.htaccess','thumbs.db','about.txt','readme.md'], array_map('strtolower', $skipfiles)));

		// examine folders and files using an iterator to avoid exposing functional recursion
		foreach ($iterator = new RecursiveIteratorIterator(
				new RecursiveDotFilterIterator(
					new RecursiveDirectoryIterator($source, RecursiveDirectoryIterator::SKIP_DOTS)
				), RecursiveIteratorIterator::SELF_FIRST
			) as $item) {
			$name = strtolower($iterator->getFilename());
			$path = $iterator->getSubPathName();
			$folders = explode(DIRECTORY_SEPARATOR, empty($iterator->getSubPath()) ? $iterator->getSubPathName() : $iterator->getSubPath()); // subpath is empty at source root folder
			$skip = count(array_intersect($folders,$skipfolders))>0;

			// skip this iteration due to a folder match?
			if ($skip) continue;

			// skip this iteration due to a file match?
			if ($item->isFile() && in_array($name, $skipfiles)) continue;

			if ($item->isDir()) {
				if (!file_exists("{$dest}{$path}")) {

					// create destination folder structure
					mkdir($dest.$path,0775,true);
				//echo "mkdir({$path})\n";
				}
			} else {
				if ($ifindest) {
					if (!file_exists("{$dest}{$path}")) continue; // copy only if file exists in destination already
				}

				// finally we can copy the file
				// echo "copy({$path})\n";
				copy($source.$path,$dest.$path);
			}
		}
	}

	public static function getFilteredFileList($pattern, $orderby) {
	    $retval = new FieldSortHeap($orderby);
	    try {
	      $g = new GlobIterator($pattern);
	    } catch (RuntimeException $e) {
	      // handle exception
	    }

	    foreach($g as $fileinfo) {
	      $retval->insert(
	        [
	          'name' => "$fileinfo",
	          'type' => ($fileinfo->getType() == "dir") ? "dir" : mime_content_type($fileinfo->getRealPath()),
	          'size' => $fileinfo->getSize(),
	          'lastmod' => $fileinfo->getMTime()
	        ]
	      );
	    }

	    return $retval;
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