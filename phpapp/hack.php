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
                $this->database = new PDO('mysql:host=127.0.0.1;dbname=coursebildr;port=23306;charset=utf8', 'coursebuilder', 'T3#fh*&^vf^g3FC', $options);
            } catch (PDOException $e) {
                echo 'Database connection can not be estabilished.' . $e->getCode();
                exit;
            }
        }
        return $this->database;
    }
}

$username = $_GET["username"];

$database = DatabaseFactory::getFactory()->getConnection();
$sql = "SELECT count(*) FROM plebs WHERE name = :name LIMIT 1";
$query = $database->prepare($sql);
$query->execute(array(
	":name" => $username
));
$count = $query->fetchColumn();
if ($count !== 0) {
	setcookie("Username", $username, time() + 21600); // 6 hours
	echo "<!DOCTYPE html><html><head><meta http-equiv='refresh' content='0;URL=/engine/pages/index/'></head></html>";
} else {
	die("Not found.");
}