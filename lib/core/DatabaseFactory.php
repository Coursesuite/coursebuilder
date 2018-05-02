<?php

/**
 * Class DatabaseFactory
 *
 * Use it like this:
 * $database = DatabaseFactory::getFactory()->getConnection();
 *
 * That's my personal favourite when creating a database connection.
 * It's a slightly modified version of Jon Raphaelson's excellent answer on StackOverflow:
 * http://stackoverflow.com/questions/130878/global-or-singleton-for-database-connection
 *
 * Full quote from the answer:
 *
 * "Then, in 6 months when your app is super famous and getting dugg and slashdotted and you decide you need more than
 * a single connection, all you have to do is implement some pooling in the getConnection() method. Or if you decide
 * that you want a wrapper that implements SQL logging, you can pass a PDO subclass. Or if you decide you want a new
 * connection on every invocation, you can do do that. It's flexible, instead of rigid."
 *
 * Thanks! Big up, mate!
 */
class DatabaseFactory
{
    private static $factory;
    private $database;
    private $mysqli;

    public static function getFactory()
    {
        if (!self::$factory) {
            self::$factory = new DatabaseFactory();
        }
        return self::$factory;
    }

    // the zebra_session manager requires a mysqli connection because it pings the database. don't use this for anything else.
    public function getMysqli()
    {
        if (!$this->mysqli) {
            $this->mysqli = mysqli_connect(Config::get('DB_HOST'), Config::get('DB_USER'), Config::get('DB_PASS'), Config::get('DB_NAME')) or die('mysqli: Could not connect to database!');
        }
        return $this->mysqli;
    }

    public function getConnection()
    {
        if (!$this->database) {

            /**
             * Check DB connection in try/catch block. Also when PDO is not constructed properly,
             * prevent to exposing database host, username and password in plain text as:
             * PDO->__construct('mysql:host=127....', 'root', '12345678', Array)
             * by throwing custom error message
             */
            try {

	            $options = array(
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ,
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_WARNING,
                    PDO::ATTR_STRINGIFY_FETCHES => false,
                );
                // $this->database = new PDO('mysql:host=127.0.0.1;dbname=coursebildr;port=23306;charset=utf8', 'coursebuilder', 'T3#fh*&^vf^g3FC', $options);
                $options = array(
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ,
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_WARNING,
                    //     PDO::ATTR_PERSISTENT => true, // at some point this will become useful, but when do we clean it up? http://www.php.net/manual/en/features.persistent-connections.php
                    PDO::ATTR_STRINGIFY_FETCHES => false, // http://stackoverflow.com/a/10455228/1238884
                    //PDO::ATTR_EMULATE_PREPARES => false, // This stops PDO from adding single quotes around integer values. https://bugs.php.net/bug.php?id=44639, but also breaks logon somehow .. hmm

                );
                $this->database = new PDO(
                    Config::get('DB_TYPE') . ':host=' . Config::get('DB_HOST') . ';dbname=' .
                    Config::get('DB_NAME') . ';port=' . Config::get('DB_PORT') . ';charset=' . Config::get('DB_CHARSET'),
                    Config::get('DB_USER'), Config::get('DB_PASS'), $options
                );
            } catch (PDOException $e) {

                // Echo custom message. Echo error code gives you some info.
                echo 'Database connection can not be estabilished. Please try again later.' . '<br>';
                echo 'Error code: ' . $e->getCode();

                // Stop application :(
                // No connection, reached limit connections etc. so no point to keep it running
                exit;
            }
        }
        return $this->database;
    }

    public function lastInsertId()
    {
        if (!$this->database) {
            return null;
        }

        return $this->database->lastInsertId();
    }

    // for debugging the acutal data in a PDO prepared statement, emulate its probable sql string
    public static function interpolateQuery($query, $params)
    {
        $keys = array();
        foreach ($params as $key => $value) {
            if (is_string($key)) {
                $keys[] = '/:' . $key . '/';
            } else {
                $keys[] = '/[?]/';
            }
        }
        $query = preg_replace($keys, $params, $query, 1, $count);
        return $query;
    }

    // get one or more records from a database table based on all params. if one field is specified and limit = 1, one column value is returned.
    public static function get_record($table, $params = array(), $fields='*', $limit = 1, $offset = 0, $orderby = "") {
	    $sql = "select $fields from $table";
	    $where = [];
	    foreach ($params as $key => $value) {
	    	$where[] = "$key=:$key";
	    	$params[":$key"] = $value;
	    	unset($params[$key]);
	    }
	    if (count($where) > 0) { $sql .= " WHERE " . implode(" AND ", $where); }
	    if ($limit > 0) $sql .= " LIMIT $limit OFFSET $offset";
		$database = self::getFactory()->getConnection();
		$query = $database->prepare($sql .= " $orderby");
		$query->execute($params);
		if ($limit > 1) {
			$result = $query->fetchAll();
		} else {
			if (substr_count($fields, ',') === 0 && $fields !== '*') {
				$result = $query->fetchColumn();
			} else {
				$result = $query->fetch();
			}
		}
		$database = null;
		return $result;
    }
}
