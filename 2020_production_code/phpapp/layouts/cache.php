<?php
header("content-type:text/plain");
error_reporting(-1);
ini_set('display_errors', 'On');

$dot = realpath('.');

$p = $dot . DIRECTORY_SEPARATOR . 'base.txt';
@unlink($p);
$outp = fopen($p,'a');
foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator(realpath('../runtimes/textplayer'))) as $file) {
	if ($file->isFile()) {
		fwrite($outp, str_replace('/\\','\\',$file->getPathName()) . "," . md5_file($file->getPathName()) . PHP_EOL);
	}
}
rewind($outp);
$base = fread($outp, filesize($p));
fclose($outp);

foreach (new DirectoryIterator($dot) as $file) {
	if ($file->isDir() && !$file->isDot()) {
		$fold = $file->getFilename();

		$p = $dot . DIRECTORY_SEPARATOR . ltrim($fold,'.') . '.txt';
		@unlink($p);
		$outp = fopen($p,'a');
		foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dot . DIRECTORY_SEPARATOR . $fold)) as $file) {
			if ($file->isFile()) {
				fwrite($outp, str_replace('/\\','\\',$file->getPathName()) . "," . md5_file($file->getPathName()) . PHP_EOL);
			}
		}
		fclose($outp);

	}
}