<?php

// error_reporting(E_ALL);
// ini_set("display_errors", 1);
// ini_set("log_errors", 0);



class DatabaseFactory {
    private static $factory;
    private $database;
    public static function getFactory() {
        if (!self::$factory) { self::$factory = new DatabaseFactory(); }
        return self::$factory;
    }
	public function getConnection() {
        if (!$this->database) {
            try {
	            $options = array(
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ,
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_WARNING,
                    PDO::ATTR_STRINGIFY_FETCHES => false,
                );
                $this->database = new PDO('mysql:host=127.0.0.1;dbname=coursebilder;port=23306;charset=utf8', 'coursebuilder', 'T3#fh*&^vf^g3FC', $options);
            } catch (PDOException $e) {
                echo 'Database connection can not be estabilished.' . $e->getCode();
                exit;
            }
        }
        return $this->database;
    }
}
require_once 'NinjaValidator.php';

$verifier = (new \Ninjitsu\Validator($_GET))->check();

if (!$verifier->is_valid()) {
	// print_r($verifier);
 	header("location: " . $verifier->timeoutUrl());
	exit;
}

$tier = (int) $verifier->get_tier();
$api = $verifier->is_api();

if ($tier < 1) {
	die("sorry, your subscription was not valid for this application. you must purchase a higher tier.");
}

Session::init();

$jsApp = new stdClass();
$jsApp->Tier =  $tier;
$jsApp->Publish = $verifier->api_publish_url();
$jsApp->Bearer = $verifier->get_bearer_token();
$jsApp->Method = "POST"; // or PUT
$jsApp->Api = $api;

$apiHeader = $verifier->get_custom_header();
$apiCSS = $verifier->get_custom_css();

$database = DatabaseFactory::getFactory()->getConnection();
$sql = "SELECT count(*) FROM plebs WHERE name = :name LIMIT 1";
$query = $database->prepare($sql);
$useremail = $verifier->get_useremail();
$username = preg_replace("/[^[:alnum:][:space:]]/u", '', $useremail);
$query->execute(array(
	":name" => $username
));
$count = $query->fetchColumn();
if ($count == 0) {

	// need to make a container for the user, if it doesn't already exist
	$sql = "SELECT count(1) from container where name = :name";
	$query = $database->prepare($sql);
	$query->execute(array(
		":name" => $username
	));
	if ($query->fetchColumn() == 0) {
		$sql = "INSERT INTO container (`name`) values (:name)";
		$query = $database->prepare($sql);
		$params = array(
			":name" => $username,
		);
		$query->execute($params);
	}
	
	// need to make the user
	$sql = "INSERT INTO plebs (`name`,`password`,`email`,`container`,`limit`,`tier`) values (:name,:password,:email,:container,999,:tier)";
	$query = $database->prepare($sql);
	$params = array(
		":name" => $username,
		":email" => $useremail,
		":password" => hash("md5", time() . $username),
		":container" => $username,
		":tier" => $tier,
	);
	$query->execute($params);
	
	// clone in the course row for the demo course then copy the folder into the new container for it too ... 
	// TODO
	
}
// ensure the custom header is synchronised
if (!empty($apiHeader)) {
	$sql = "UPDATE plebs SET `custom_header` = :header, `custom_css` = :css WHERE name = :name";
	$query = $database->prepare($sql);
	$params = array(
		":name" => $username,
		":header" => $apiHeader,
		":css" => empty($apiCSS) ? null : $apiCSS,
	);
	$query->execute($params);
}

Session::log_into_session($user_id);

Session::set("user_id") =


setcookie("Username", $username, time() + 21600); // 6 hours
setcookie("authkey", $_SERVER['QUERY_STRING'], time() + 21600); // 6 hours
echo "<!DOCTYPE html><html><head><meta http-equiv='refresh' content='0;URL=/engine/pages/index/'></head></html>";

// can't do this because of an IIS bug 
// header('Location: /engine/pages/index/');