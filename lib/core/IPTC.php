<?php

use MyCLabs\Enum\Enum;

class IPTC_TYPES extends Enum {
	const IPTC_OBJECT_NAME = "005";
	const IPTC_EDIT_STATUS = "007";
	const IPTC_PRIORITY = "010";
	const IPTC_CATEGORY = "015";
	const IPTC_SUPPLEMENTAL_CATEGORY = "020";
	const IPTC_FIXTURE_IDENTIFIER = "022";
	const IPTC_KEYWORDS = "025";
	const IPTC_RELEASE_DATE = "030";
	const IPTC_RELEASE_TIME = "035";
	const IPTC_SPECIAL_INSTRUCTIONS = "040";
	const IPTC_REFERENCE_SERVICE = "045";
	const IPTC_REFERENCE_DATE = "047";
	const IPTC_REFERENCE_NUMBER = "050";
	const IPTC_CREATED_DATE = "055";
	const IPTC_CREATED_TIME = "060";
	const IPTC_ORIGINATING_PROGRAM = "065";
	const IPTC_PROGRAM_VERSION = "070";
	const IPTC_OBJECT_CYCLE = "075";
	const IPTC_BYLINE = "080";
	const IPTC_BYLINE_TITLE = "085";
	const IPTC_CITY = "090";
	const IPTC_PROVINCE_STATE = "095";
	const IPTC_COUNTRY_CODE = "100";
	const IPTC_COUNTRY = "101";
	const IPTC_ORIGINAL_TRANSMISSION_REFERENCE = "103";
	const IPTC_HEADLINE = "105";
	const IPTC_CREDIT = "110";
	const IPTC_SOURCE = "115";
	const IPTC_COPYRIGHT_STRING = "116";
	const IPTC_CAPTION = "120";
	const IPTC_LOCAL_CAPTION = "121";
}

class IPTC
{
    var $meta = [];
    var $hasAPP13 = false;
    var $file = null;

    function __construct($filename)
    {
        $info = null;

        $size = getimagesize($filename, $info);

        if(isset($info["APP13"])) {
            $this->hasAPP13 = true;
            $this->meta = iptcparse($info["APP13"]);
        }

        $this->file = $filename;
    }

    function hasMeta() {
        return $this->hasAPP13;
    }

    function getValue($tag)
    {
        return isset($this->meta["2#$tag"]) ? $this->meta["2#$tag"][0] : "";
    }

    function setValue($tag, $data)
    {
        $this->meta["2#$tag"] = [$data];

        $this->write();
    }

    private function write()
    {
        $mode = 0;

        $content = iptcembed($this->binary(), $this->file, $mode);

        $filename = $this->file;

        if(file_exists($this->file)) unlink($this->file);

        $fp = fopen($this->file, "w");
        fwrite($fp, $content);
        fclose($fp);
    }

    private function binary()
    {
        $data = "";

        foreach(array_keys($this->meta) as $key)
        {
            $tag = str_replace("2#", "", $key);
            $data .= $this->iptc_maketag(2, $tag, $this->meta[$key][0]);
        }

        return $data;
    }

    function iptc_maketag($rec, $data, $value)
    {
        $length = strlen($value);
        $retval = chr(0x1C) . chr($rec) . chr($data);

        if($length < 0x8000)
        {
            $retval .= chr($length >> 8) .  chr($length & 0xFF);
        }
        else
        {
            $retval .= chr(0x80) .
                       chr(0x04) .
                       chr(($length >> 24) & 0xFF) .
                       chr(($length >> 16) & 0xFF) .
                       chr(($length >> 8) & 0xFF) .
                       chr($length & 0xFF);
        }

        return $retval . $value;
    }

    function dump()
    {
        echo "<pre>";
        print_r($this->meta);
        echo "</pre>";
    }

    #requires GD library installed
    function removeAllTags()
    {
        $this->meta = [];
        $img = imagecreatefromstring(implode(file($this->file)));
        if(file_exists($this->file)) unlink($this->file);
        imagejpeg($img, $this->file, 100);
    }
}