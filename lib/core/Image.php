<?php

use ColorThief\ColorThief;

class Image
{

    public static function getBaseColour($sourceImage)
    {
        $c = ["r"=>0,"g"=>0,"b"=>0];
        try {
            $c = ColorThief::getColor($sourceImage);
        } catch (\Exception $e) {

        }
        return $c;
    }

    public static function getPalette($sourceImage, $count = 8)
    {
        $c = [["r"=>0,"g"=>0,"b"=>0]];
        try {
            $c = ColorThief::getPalette($sourceImage, $count);
        } catch (\Exception $e) {

        }
        return $c;
    }

    public static function getContentType($source_image)
    {
        $imageData = getimagesize($source_image);
        return $imageData["mime"];
    }

    public static function makeThumbnail($source_image, $destination, $final_width = 44, $final_height = 44, $bgcolour = array(224, 224, 228), $center = true)
    {

        $imageData = getimagesize($source_image);
        $width = $imageData[0];
        $height = $imageData[1];
        $mimeType = $imageData['mime'];

        if (!$width || !$height) {
            return false;
        }

        switch ($mimeType) {
            case 'image/jpeg':$myImage = imagecreatefromjpeg($source_image);
                break;
            case 'image/png':$myImage = imagecreatefrompng($source_image);
                break;
            case 'image/gif':$myImage = imagecreatefromgif($source_image);
                break;
            default:return false;
        }

        // calculating the part of the image to use for thumbnail
        if ($width > $height) {
            $verticalCoordinateOfSource = 0;
            $horizontalCoordinateOfSource = ($width - $height) / 2;
            $smallestSide = $height;
        } else {
            $horizontalCoordinateOfSource = 0;
            $verticalCoordinateOfSource = ($height - $width) / 2;
            $smallestSide = $width;
        }

        if (!$center) {
            $horizontalCoordinateOfSource = 0;
            $verticalCoordinateOfSource = 0;
        }

        // copying the part into thumbnail, maybe edit this for square avatars
        $thumb = imagecreatetruecolor($final_width, $final_height);

        // fill the image with the base colour
        $fill = imagecolorallocate($thumb, $bgcolour[0], $bgcolour[1], $bgcolour[2]);
        imagefill($thumb, 0, 0, $fill);

        // TODO: http://stackoverflow.com/questions/747101/resize-crop-pad-a-picture-to-a-fixed-size

        imagecopyresampled($thumb, $myImage, 0, 0, $horizontalCoordinateOfSource, $verticalCoordinateOfSource, $final_width, $final_height, $smallestSide, $smallestSide);

        // add '.jpg' to file path, save it as a .jpg file with our $destination_filename parameter
        imagejpeg($thumb, $destination . '.jpg', Config::get('AVATAR_JPEG_QUALITY'));
        imagedestroy($thumb);

        if (file_exists($destination)) {
            return true;
        }
        return false;
    }

    public static function urlThumb($source, $destination, $width = 150, $height = true) {

        // file_get_contents needs to skip invalid certificates - prevent verifying peer
        $fgc_options = stream_context_create(array(
            "ssl"=>array(
                "verify_peer"=>false,
                "verify_peer_name"=>false,
            ),
        ));

        // download and create gd image
        $image = ImageCreateFromString(file_get_contents($source, false, $fgc_options));

        // calculate resized ratio
        // Note: if $height is set to TRUE then we automatically calculate the height based on the ratio
        $height = $height === true ? (ImageSY($image) * $width / ImageSX($image)) : $height;

        // create image
        $output = ImageCreateTrueColor($width, $height);
        ImageCopyResampled($output, $image, 0, 0, 0, 0, $width, $height, ImageSX($image), ImageSY($image));

        // save image
        ImageJPEG($output, $destination, 95);

        // return resized image
        return $output; // if you need to use it
    }

    const IMAGE_HANDLERS = [
        IMAGETYPE_JPEG => [
            'load' => 'imagecreatefromjpeg',
            'save' => 'imagejpeg',
            'quality' => 100,
            'label' => 'JPG'
        ],
        IMAGETYPE_PNG => [
            'load' => 'imagecreatefrompng',
            'save' => 'imagepng',
            'quality' => 0,
            'label' => 'PNG'
        ],
        IMAGETYPE_GIF => [
            'load' => 'imagecreatefromgif',
            'save' => 'imagegif',
            'label' => 'GIF'
        ]
    ];
    /**
     * @param $src - a valid file location
     * @param $dest - a valid file target
     * @param $targetWidth - desired output width
     * @param $targetHeight - desired output height or null
     */
    public static function createThumbnail($src, $dest, $targetWidth = 150, $targetHeight = null) {

        // 1. Load the image from the given $src
        // - see if the file actually exists
        // - check if it's of a valid image type
        // - load the image resource
        // get the type of the image
        // we need the type to determine the correct loader
        $type = exif_imagetype($src);
        // if no valid type or no handler found -> exit
        if (!$type || !self::IMAGE_HANDLERS[$type]) {
            return null;
        }
        // load the image with the correct loader
        $image = call_user_func(self::IMAGE_HANDLERS[$type]['load'], $src);
        // no image found at supplied location -> exit
        if (!$image) {
            return null;
        }

        // grab the most dominant colour to be used as the fill background
        $rgb = array_values(self::getBaseColour($image));

        // 2. Create a thumbnail and resize the loaded $image
        // - get the image dimensions
        // - define the output size appropriately
        // - create a thumbnail based on that size
        // - set alpha transparency for GIFs and PNGs
        // - draw the final thumbnail
        // get original image width and height

     $source_image_width = imagesx($image);
     $source_image_height = imagesy($image);
    // // maintain aspect ratio when no height set
    if ($targetHeight == null) $targetHeight = $targetWidth;
    //     // get width to height ratio
    //     $ratio = $width / $height;
    //     // if is portrait
    //     // use ratio to scale height to fit in square
    //     if ($width > $height) {
    //         $targetHeight = floor($targetWidth / $ratio);
    //     }
    //     // if is landscape
    //     // use ratio to scale width to fit in square
    //     else {
    //         $targetHeight = $targetWidth;
    //         $targetWidth = floor($targetWidth * $ratio);
    //     }
    // }

    // https://stackoverflow.com/a/23173626/1238884
    $source_aspect_ratio = $source_image_width / $source_image_height;
    $thumbnail_aspect_ratio = $targetWidth / $targetHeight;
    if ($source_image_width <= $targetWidth && $source_image_height <= $targetHeight) {
        $thumbnail_image_width = $source_image_width;
        $thumbnail_image_height = $source_image_height;
    } elseif ($thumbnail_aspect_ratio > $source_aspect_ratio) {
        $thumbnail_image_width = (int) ($targetHeight * $source_aspect_ratio);
        $thumbnail_image_height = $targetHeight;
    } else {
        $thumbnail_image_width = $targetWidth;
        $thumbnail_image_height = (int) ($targetWidth / $source_aspect_ratio);
    }

        // create duplicate image based on calculated target size
        // and fill it with the dominant colour
        $thumbnail = imagecreatetruecolor($targetWidth, $targetHeight);
        $backcolor = imagecolorallocate($thumbnail, $rgb[0], $rgb[1], $rgb[2]);
        imagefill($thumbnail,0,0,$backcolor);

        if ($type == IMAGETYPE_PNG) {
            // make image transparent
            imagecolortransparent(
                $thumbnail,
                $backcolor
            );
            imagealphablending($thumbnail, true); // for font rendering to work
            imagesavealpha($thumbnail, true);
        }

        $xpos = ($targetWidth/2)-($thumbnail_image_width/2);
        $ypos = ($targetHeight/2)-($thumbnail_image_height/2);

        // copy entire source image to duplicate image and resize
        imagecopyresampled(
            $thumbnail,
            $image,
            $xpos, $ypos, 0, 0,
            $thumbnail_image_width, $thumbnail_image_height,
            $source_image_width, $source_image_height
        );

        // write the size of the original image over it as text, set the stroke of the text to make it readable
        $font = Config::get("LIB") . '/config/Arial_Unicode.ttf';
        $white = imagecolorallocate($thumbnail, 255, 255, 255);
        $stroke = imagecolorallocate($thumbnail, max(0, $rgb[0]-15), max(0, $rgb[1] - 15), max(0, $rgb[2] - 15));
        self::imagettfstroketext($thumbnail, 10, 0, 2, $targetHeight - 4, $white, $stroke, $font, "{$source_image_width} x {$source_image_height}", 2);
        $text = self::IMAGE_HANDLERS[$type]['label'];
        if ($type == IMAGETYPE_GIF) { //} || $type == IMAGETYPE_PNG) {
            if (self::is_ani($src)) {
                $text .= " ‣‣‣";
            }
        }
        self::imagettfstroketext($thumbnail, 8, 0, 2, 12, $white, $stroke, $font, $text, 2);

        // 3. Save the $thumbnail to disk
        // - call the correct save method
        // - set the correct quality level
        // save the duplicate version of the image to disk
        return call_user_func(
            self::IMAGE_HANDLERS[$type]['save'],
            $thumbnail,
            $dest,
            self::IMAGE_HANDLERS[$type]['quality']
        );

    }

    // https://stackoverflow.com/a/26905377/1238884
    private static function imagettfstroketext(&$image, $size, $angle, $x, $y, &$textcolor, &$strokecolor, $fontfile, $text, $px) {
        for($c1 = ($x-abs($px)); $c1 <= ($x+abs($px)); $c1++)
            for($c2 = ($y-abs($px)); $c2 <= ($y+abs($px)); $c2++)
                $bg = imagettftext($image, $size, $angle, $c1, $c2, $strokecolor, $fontfile, $text);
       return imagettftext($image, $size, $angle, $x, $y, $textcolor, $fontfile, $text);
    }

    // https://php.net/manual/en/function.imagecreatefromgif.php#122056
    private static function is_ani($filename) {
        if(!($fh = @fopen($filename, 'rb'))) return false;
        $count = 0;
        $chunk = false;
        while(!feof($fh) && $count < 2) {
            $chunk = ($chunk ? substr($chunk, -20) : "") . fread($fh, 1024 * 100); //read 100kb at a time
            $count += preg_match_all('#\x00\x21\xF9\x04.{4}\x00(\x2C|\x21)#s', $chunk, $matches);
        }
        fclose($fh);
        return $count > 1;
    }

    // create a thumbnail on disk for a given image
    public static function cache_thumbnail($src, $hash = null, $w = 150, $h = 150) {
        if ($hash == null) $hash = md5_file($src);
        $fold = implode('/', array_slice(str_split($hash, 2),0,2));
        $dest = Config::get("PATH_PUBLIC_CACHE_REAL") . "i/{$fold}/{$hash}";
        if (!file_exists(pathinfo($dest, PATHINFO_DIRNAME))) {
            mkdir(pathinfo($dest, PATHINFO_DIRNAME), 0777, true);
        }
        if (!file_exists($dest)) {
            Image::createThumbnail($src, $dest, $w, $h);
        }
        return $dest;
    }

}
