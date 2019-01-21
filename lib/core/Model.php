<?php
class Model
{

    public function __construct()
    {
    }

//  protected abstract function definition();

    /**
     * return an empty record containing all fields of a table
     * set default on fields that are nullable
     * relies on the db user having describe capability
     * does NOT insert the record
     */
    public static function Create($table)
    {
        $database = DatabaseFactory::getFactory()->getConnection();
        $query = $database->query("DESCRIBE $table");
        $rows = $query->fetchAll(); // PDO::FETCH_COLUMN));
        $results = array();
        foreach ($rows as $row) {
            // if (!($row->Null == "NO" && $row->Default > "")) {
            $key = $row->Field;
            if ($row->Key == "PRI") {
                // assuming numerical keys
                $value = 0;
            } else if ($row->Null == "YES") {
                $value = null;
            } else {
                $value = "";
            }
            if (is_numeric($row->Default)) {
                $value = intval($row->Default, 10);
            }
            $results[$key] = $value;
            // }
        }
        return $results;
    }

    public static function Read($table, $where = "", $params = array(), $fields = array("*"))
    {
        $database = DatabaseFactory::getFactory()->getConnection();
        /*if ($fields == array("*")) {
        $fields = array();
        $rs = $database->query("SELECT * FROM $table LIMIT 0");
        for ($i = 0; $i < $rs->columnCount(); $i++) {
        $col = $rs->getColumnMeta($i);
        $fields[] = $col['name'];
        }
        }*/
        $sql = "SELECT " . implode(",", $fields) . " FROM $table ";
        if (!empty($where)) {
            $sql .= "WHERE $where";
        }
        $query = $database->prepare($sql);
        $query->execute($params);
        $count = $query->rowCount();
        return $query->fetchAll();
    }

    /**
     * generic model save routine
     * saves as many fields as you supply, except the id column
     * if id column value is <1 then insert a new record and return the
     * @param table string - name of table
     * @param idrow_name string - name of the id column
     * @param data_model array - associative array of the columns you are updating (must include id column)
     * @param changed_properties -
     * @return id value
     */
    public static function Update($table, $idrow_name, $data_model, $changed_properties = null)
    {
        $database = DatabaseFactory::getFactory()->getConnection();

        $values = array();
        $fields = array();
        $pairs = array();
        $params = array();
        $idvalue = 0;
        $checkChanged = false;
        if (is_array($changed_properties)) {
            $changed_properties[$idrow_name] = true; // has to exist
            $checkChanged = true;
            $changed_properties = array_keys($changed_properties);
        }



        foreach ($data_model as $key => $value) {

            if ($checkChanged && !in_array($key, $changed_properties)) {
                continue;
            }

			if ($key == $idrow_name) {
				$idvalue = abs(intval($value, 10));
				continue; // can't set a key value anyway
			}

			if ($key == "updated") { // hax!
				continue; // let default apply in sql
			}

            // hashes need to be serialized
            if ($key === "hashes") {
                // don't reserialize data that is already serial
                if (!Utils::is_serial($value)) {
                    $value = serialize($value);
                }
            }

			// so you can set a property to the JSON object and not bother with encoding it
			if (is_object($value) || is_array($value)) {
				$value = json_encode($value, JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_NUMERIC_CHECK);
			}

			$field = sprintf('`%s`',$key); // escaped sql field name
			$param = sprintf(':%s',$key); // pdo named parameter

			$fields[] = $field;
			$params[] = $param;
			$values[$param] = $value; // pdo key=>value pairs
			$pairs[] = sprintf('%s = %s', $field, $param); // sql field=:name pairs

        }
        if ($idvalue < 1) {
            $sql = "INSERT INTO $table (" . implode(', ', $fields) . ") VALUES (" . implode(', ',$params) . ")";
            $query = $database->prepare($sql);
            $query->execute($values);
            $idvalue = $database->lastInsertId();
        } else {
	        $sql = "UPDATE $table SET " . implode(', ', $pairs) . " WHERE `$idrow_name` = :ROWID LIMIT 1";
            $query = $database->prepare($sql);
            $values[":ROWID"] = $idvalue;
          //  var_dump($sql,$values);
            $query->execute($values); // PDO allows the params without colons in the paramarray
        }
        return $idvalue;
    }

    public static function UpdateField($table, $idrow_name, $idrow_value, $field_name, $field_value) {
        $database = DatabaseFactory::getFactory()->getConnection();
        $sql = "UPDATE {$table} SET {$field_name}=:v WHERE {$idrow_name}=:i";
        $query = $database->prepare($sql);
        $params = array(":i"=>$idrow_value, ":v"=>$field_value);
        // var_dump ($sql, $params);
        $query->execute($params);
    }

    public static function Destroy($table, $where_clause, $params)
    {
        $database = DatabaseFactory::getFactory()->getConnection();
	    $sql = "DELETE FROM {$table} WHERE {$where_clause}";
		$query = $database->prepare($sql);
		$query->execute($params);
		return $query->rowCount();
    }

}
