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

	public static function rowInt($number) {
		return filter_var($number, FILTER_VALIDATE_INT, ['options'=>['min-range'=>1,'max-range'=>4294967295]]);
	}

	// convert a course config record (json string) and convert it to fields in a format that posts back easily
	public static function json_to_form($json) {
		$output = [];
		if (gettype($json) === "string") $json = json_decode($json, true);

		function appendrow($node, $key, $path, &$output) {
			$id = str_replace(".","_",$path);
			$label = ucwords(str_replace("."," ",$path));

			$p2 = explode('.',$path);
			$n = array_shift($p2);
			$name = "{$n}[" . implode("][", $p2) . "]";

			$ro = $key === "key" ? " readonly" : "";
			$value = $node[$key];
			switch (gettype($value)) {
				case "string":
					if (strlen($value)>30) {
						$tag = "<textarea id='{$id}' name='{$name}' rows='3'{$ro}>{$value}</textarea>";
					} else {
						$tag = "<input id='{$id}' name='{$name}' type='text' value='{$value}' size='30'{$ro}>";
					}
				break;

				case "boolean":
					$value = filter_var($value,FILTER_VALIDATE_BOOLEAN) ? "true" : "false";
					$tag = "<input type='hidden' name='{$name}' value='{$value}'><input id='{$id}' type='checkbox'{$ro} onclick='this.previousElementSibling.value=this.checked?\"true\":\"false\"'" . ($value==="true"?" checked":"") . ">";
				break;

				case "integer":
				case "double":
					$tag = "<input id='{$id}' name='{$name}' type='number' min='0' step='any' value='{$value}'{$ro}>";
				break;

				default:
					$tag = "error:  unsupported type " . json_encode($value);
				break;
			}
			$output[] = "<div class='field-row'><label for='{$id}'>{$label}</label>{$tag}</div>";
		}

		function inside($node, $path = "", &$output) {
			foreach ($node as $key => $value) {
				$thispath = empty($path) ? $key : "{$path}.{$key}";
				if (gettype($value) === 'array') {
					inside($value, $thispath, $output);
				} else {
					appendrow($node, $key, $thispath, $output);
				}
			};
		}

		inside($json, "", $output);

		return implode("\n",$output);
	}

	public static function rgb2hex($rgb) {
		$rgb = array_values($rgb);
		return '#' . sprintf('%02x', $rgb[0]) . sprintf('%02x', $rgb[1]) . sprintf('%02x', $rgb[2]);
	}

	public static function array_in_string($str, array $arr) {
	    foreach ($arr as $arr_value) {
	        if (strpos($str,$arr_value) !== false) return true;
	    }
	    return false;
	}

	public static function is_serial($string) {
    	return (@unserialize($string) !== false || $string == 'b:0;');
	}

}