<?php
	
class Response {
	public static function cookie($key, $value = null, $expires = 365) {
		$timestamp = strtotime( "+$expires days" );
		$domain = ($_SERVER['HTTP_HOST'] != 'localhost') ? $_SERVER['HTTP_HOST'] : false;
		if (is_null($value)) { // delete
	        $timestamp = 1;
	        $value = "";
		}
		$secure = $_SERVER["HTTPS"];
        setcookie($key, $value, $timestamp, "/", $domain, $secure);
        // echo "setcookie", $key, $value, $timestamp, "/", $domain, $secure;
	}
	public static function redirect($location, $meta = false) {
		if (strpos($location,"://") === false) {
			$location = Config::get("RELATIVEURL") . "/$location";
		}
		if ($meta === true) {
			echo "<html><meta http-equiv='refresh' content='0; url={$location}'></html>";
		} else {
			header("location: $location");		
		}
		exit(); // so the rest of the page stops processing
	}
	public static function home() {
		header("location: " . Config::get("URL"));
		exit(); // so the rest of the page stops processing
	}
	
	public static function write ($value) {
		echo $value;
	}
}