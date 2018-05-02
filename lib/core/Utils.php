<?php
	
class Utils {

	// returns "internal" or "external" 
	public static function UserType($name) {
		$result = "external";
		// internal users are admins so they have star containers .. all other users have a single container ... 
		if ((int)DatabaseFactory::get_record("plebs", array("name" => $name, "container" => "*"), "count(1)") > 0) {
			$result = "internal";
		}
		return $result;
	}

	// http://jeffreysambells.com/2012/10/25/human-readable-filesize-php
	public static function human_filesize($bytes, $decimals = 2) {
	    $size = array('B','kB','MB','GB','TB','PB','EB','ZB','YB');
	    $factor = floor((strlen($bytes) - 1) / 3);
	    return sprintf("%.{$decimals}f", $bytes / pow(1024, $factor)) . @$size[$factor];
	}

}