<?php
	
class Response {
	public static function cookie($key, $value = null, $expires = 365) {
		// var_dump($_SERVER);
		$timestamp = strtotime( "+$expires days" );
		$domain =  isset($_SERVER['HTTP_X_FORWARDED_HOST']) ?
        			$_SERVER['HTTP_X_FORWARDED_HOST'] :
					isset($_SERVER['HTTP_HOST']) ?
						$_SERVER['HTTP_HOST'] :
						$_SERVER['SERVER_NAME'];
 
		// $domain = ($_SERVER['HTTP_HOST'] != 'localhost') ? $_SERVER['HTTP_HOST'] : false;
		if (is_null($value)) { // delete
	        $timestamp = 1;
	        $value = "";
		}
		$secure = $_SERVER["HTTPS"];
        setcookie($key, $value, $timestamp, "/", $domain, $secure);
        // var_dump($key, $value, $timestamp, "/", $domain, $secure);
        // exit;
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