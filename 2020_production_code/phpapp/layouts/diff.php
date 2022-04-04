<?php
header("content-type:text/plain");
error_reporting(-1);
ini_set('display_errors', 'On');

$dot = realpath('.');

$base = [];
foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator(realpath('../runtimes/textplayer'))) as $file) {
	if ($file->isFile()) {

		$hash = md5_file($file->getPathname());
		$name = $file->getSubPathName();
		
		echo $hash, $name, PHP_EOL;
	}
}