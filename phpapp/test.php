<?php

 error_reporting(E_ALL);
 ini_set("display_errors", 1);
 ini_set("log_errors", 0);

require '../vendor/autoload.php';
header('Content-Type: text/plain');
/*
	
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

$database = DatabaseFactory::getFactory()->getConnection();
$sql = "SELECT count(*) FROM plebs";
$query = $database->prepare($sql);
$query->execute();
echo "Mysql Users: ", $query->fetchColumn(), "\n";
*/

$post = array(
    'title'     => 'What is MongoDB',
    'content'   => 'MongoDB is a document database that provides high performance...',
    'saved_at'  => new MongoDB\BSON\UTCDateTime() 
);
print_r($post);

$client = new MongoDB\Client("mongodb://localhost:27017");
$collection = $client->demo->beers;

// $result = $collection->insertOne( [ 'name' => 'Stout', 'brewery' => 'Coopers', 'bottle-colour' => 'yellow' ] );

//echo "Inserted with Object ID '{$result->getInsertedId()}'\n";

$result = $collection->find( [ 'name' => 'Hinterland' ] );
foreach ($result as $entry) {
    echo "Entry: ", $entry['_id'], ': ', $entry['name'], ' ', $entry['brewery'], "\n";
}

$result = $collection->find( [ 'bottle-colour' ]);
foreach ($result as $entry) {
    echo "Colour Entry: ", $entry['_id'], ': ', $entry['name'], ' ', $entry['brewery'], "\n";
}
 

// one record
// $id = '52d68c93cf5dc944128b4567';
// $results = $posts::findOne(array('_id' => new MongoId($id)));
/*

class stdClass {
  public $foo = 42;
} // => { "foo" : 42 }

class MyClass {
  public $foo = 42;
  protected $prot = "wine";
  private $fpr = "cheese";
} // => { "foo" : 42 }

class AnotherClass1 implements MongoDB\BSON\Serializable {
  public $foo = 42;
  protected $prot = "wine";
  private $fpr = "cheese";
  function bsonSerialize() {
      return [ 'foo' => $this->foo, 'prot' => $this->prot ];
  }
} // => { "foo" : 42, "prot" : "wine" }

class AnotherClass2 implements MongoDB\BSON\Serializable {
  public $foo = 42;
  function bsonSerialize() {
      return $this;
  }
} // => MongoDB\Driver\Exception\UnexpectedValueException("bsonSerialize() did not return an array or stdClass")

class AnotherClass3 implements MongoDB\BSON\Serializable {
  private $elements = [ 'foo', 'bar' ];
  function bsonSerialize() {
      return $this->elements;
  }
} // => { "0" : "foo", "1" : "bar" }

class ContainerClass implements MongoDB\BSON\Serializable {
  public $things = AnotherClass4 implements MongoDB\BSON\Serializable {
    private $elements = [ 0 => 'foo', 2 => 'bar' ];
    function bsonSerialize() {
      return $this->elements;
    }
  }
  function bsonSerialize() {
      return [ 'things' => $this->things ];
  }
} // => { "things" : { "0" : "foo", "2" : "bar" } }

class ContainerClass implements MongoDB\BSON\Serializable {
  public $things = AnotherClass5 implements MongoDB\BSON\Serializable {
    private $elements = [ 0 => 'foo', 2 => 'bar' ];
    function bsonSerialize() {
      return array_values($this->elements);
    }
  }
  function bsonSerialize() {
      return [ 'things' => $this->things ];
  }
} // => { "things" : [ "foo", "bar" ] }

class ContainerClass implements MongoDB\BSON\Serializable {
  public $things = AnotherClass6 implements MongoDB\BSON\Serializable {
    private $elements = [ 'foo', 'bar' ];
    function bsonSerialize() {
      return (object) $this->elements;
    }
  }
  function bsonSerialize() {
      return [ 'things' => $this->things ];
  }
} // => { "things" : { "0" : "foo", "1" : "bar" } }

class UpperClass implements MongoDB\BSON\Persistable {
  public $foo = 42;
  protected $prot = "wine";
  private $fpr = "cheese";
  function bsonSerialize() {
      return [ 'foo' => $this->foo, 'prot' => $this->prot ];
  }
} // => { "foo" : 42, "prot" : "wine", "__pclass" : { "$type" : "80", "$binary" : "VXBwZXJDbGFzcw==" } }

*/