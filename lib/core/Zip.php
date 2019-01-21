<?php
// from https://php.net/manual/en/class.ziparchive.php#110719

class Zip
{
  /**
   * Add files and sub-directories in a folder to zip file.
   * @param string $folder
   * @param ZipArchive $zipFile
   * @param int $exclusiveLength Number of text to be exclusived from the file path.
   */
  private static function folderToZip($folder, &$zipFile, $exclusiveLength) {
    $handle = opendir($folder);
    while (false !== $f = readdir($handle)) {
      if ($f != '.' && $f != '..') {
        $filePath = "$folder/$f";
        // Remove prefix from file path before add to zip.
        $localPath = substr($filePath, $exclusiveLength);
        if (is_file($filePath)) {
          $zipFile->addFile($filePath, $localPath);
        } elseif (is_dir($filePath)) {
          // Add sub-directory.
          $zipFile->addEmptyDir($localPath);
          self::folderToZip($filePath, $zipFile, $exclusiveLength);
        }
      }
    }
    closedir($handle);
  }

  /**
   * Zip a folder (include itself).
   * Usage:
   *   HZip::zipDir('/path/to/sourceDir', '/path/to/out.zip');
   *
   * @param string $sourcePath Path of directory to be zip.
   * @param string $outZipPath Path of output zip file.
   */
  public static function zipDir($sourcePath, $outZipPath, $addEmpty = true)
  {
    $pathInfo = pathInfo($sourcePath);
    $parentPath = $pathInfo['dirname'];
    $dirName = $pathInfo['basename'];

    $z = new ZipArchive();
    $z->open($outZipPath, ZIPARCHIVE::CREATE);
    if ($addEmpty) $z->addEmptyDir($dirName);
    self::folderToZip($sourcePath, $z, strlen("$parentPath/"));
    $z->close();
  }


  function zipData($source, $destination) {
      if (extension_loaded('zip')) {
          if (file_exists($source)) {
              $zip = new ZipArchive();
              if ($zip->open($destination, ZIPARCHIVE::CREATE)) {
                  $source = realpath($source);
                  if (is_dir($source)) {
                      $iterator = new RecursiveDirectoryIterator($source);
                      $iterator->setFlags(RecursiveDirectoryIterator::SKIP_DOTS);
                      $files = new RecursiveIteratorIterator($iterator, RecursiveIteratorIterator::SELF_FIRST);
                      foreach ($files as $file) {
                          $file = realpath($file);
                          if (is_dir($file)) {
                              $zip->addEmptyDir(str_replace($source . '/', '', $file . '/'));
                          } else if (is_file($file)) {
                              $zip->addFromString(str_replace($source . '/', '', $file), file_get_contents($file));
                          }
                      }
                  } else if (is_file($source)) {
                      $zip->addFromString(basename($source), file_get_contents($source));
                  }
              }
              return $zip->close();
          }
      }
      return false;
  }

}