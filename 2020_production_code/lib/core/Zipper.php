<?php

class Zipper extends ZipArchive
{
	
	// add the contents of a folder, not including itself
	public function addContents($location) {
        $dir = opendir ($location);
        while ($file = readdir($dir))    {
            if ($file == '.' || $file == '..') continue;
			$action = (filetype( $location . $file) == 'dir') ? 'addDir' : 'addFile';
			$this->$action($location . $file, $file);
		}
	}

	// create a folder in the zip and add its contents
    public function addDir($location, $name) {
		$this->addEmptyDir($name);
		$this->addDir_fn($location, $name);
	}

	// add files and folders to the zip 	
	private function addDir_fn($location, $name) {
		$name .= '/';
		$location .= '/';
        $dir = opendir ($location);
        while ($file = readdir($dir))    {
            if ($file == '.' || $file == '..') continue;
			$action = (filetype( $location . $file) == 'dir') ? 'addDir' : 'addFile';
			$this->$action($location . $file, $name . $file);
        }		
	}

}