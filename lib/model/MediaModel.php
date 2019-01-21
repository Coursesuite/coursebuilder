<?php
Class MediaModel Extends Model { // implements Modellable

	CONST TABLE_NAME = "media";
	CONST ID_ROW_NAME = "id";
	private $_data;
	private $_loaded = false;

    public function loaded() {
    	return $this->_loaded;
    }

	public function get_model($assoc = true)
    {
        return ($assoc) ? (array) $this->_data : $this->_data;
    }

    public function set_model($model)
    {
        $this->_data = $model;
    }

    public function __construct($key = "id", $where)
    {
        parent::__construct();
        if (is_numeric($where)) {
        	$row_id = intval($where,10);
	        if ($row_id === 0) {
		    	$this->_data = (array) parent::Create(self::TABLE_NAME);
	        } else if ($row_id > 0) {
		    	$this->_data = (array) parent::Read(self::TABLE_NAME, self::ID_ROW_NAME . "=:id", array(":id" => $row_id))[0]; // 0th of a fetchall
		    	$this->_loaded = true;
	        }
	    } else {
	    	$m = DatabaseFactory::get_record(self::TABLE_NAME, $where, '*', 999);
	    	if (!empty($m)) {
	    		$this->_data = (array) $m;
		    	$this->_loaded = true;
	    	} else {
	    		$this->_data = (array) parent::Create(self::TABLE_NAME);
	    		foreach ($where as $key=>$value) { // prepopulate what we know for the new record
	    			$this->_data[$key] = $value;
	    		}
	    	}
	    }
        return $this;
    }

    public function delete($id = 0)
    {
		parent::Destroy(self::TABLE_NAME, self::ID_ROW_NAME . "=:id", [":id"=>$id]);
    	foreach (array_keys($this->_data) as $key) {
	    	unset($this->_data[$key]);
    	}
    }

    public function save()
    {
        $id = parent::Update(self::TABLE_NAME, self::ID_ROW_NAME, $this->_data);
        if ($this->_data[self::ID_ROW_NAME] === 0) {
	        $this->_data[self::ID_ROW_NAME] = $id; // set directly, not via __set()
        }
        return $id;
    }

    public function __set($property, $value) {
	    if ($property === self::ID_ROW_NAME) return; // disallow
		return $this->_data[$property] = $value;
    }

    public function __get($property){
		return array_key_exists($property, $this->_data)
			? $this->_data[$property]
			: null
			;
    }

    public function properties() {
	    return array_keys($this->_data);
    }

    public function isImage() {
    	return (strpos($this->mime, "image/") !== false);
    }

    public function isMedia() { // needs more thought
    	return (strpos($this->mime, "video/") !== false || strpos($this->mime, "audio/") !== false || $this->mime === "text/url");
    }







    /*
     *
     *			STATIC METHODS
     *
     */

    // scan the media folder for the course and put missing elements into the database
    // this can take 30 seconds or more, so it's normally executed by the cron controller
    // which is in turn kicked off (asynchronously) by loading the edit controller.
	public static function scan($contextid = 0) {

		if ($contextid === 0) return;
		$course = new CourseModel($contextid);
		$length = strlen($course->MediaRealPath);

		$f = new RecursiveIteratorIterator(		// make iterator iterable
			new RecursiveDotFilterIterator(		// skip dotfiles (e.g. hidden files or folders)
				new RecursiveDirectoryIterator( // files in folders excluding dotfiles
					$course->MediaRealPath, FilesystemIterator::SKIP_DOTS
				)
			), RecursiveIteratorIterator::SELF_FIRST
		);
		$rc = DatabaseFactory::count_records("media", ["context"=>$contextid]);
		$ic = 0; // can't use iterator_count($f) since it counts folders too, so only count files:
		foreach ($f as $name) {
			// count files but skip those that have a filename-(num)x(num).ext pattern since they are thumbnailed versions of images
			if (is_file($name) && !preg_match("/(.*)-\d+x\d+\.(.*)/",$name)) $ic++;
		}

		// db file count and disk file count comparison
		if ($rc <> $ic) {
			$finfo = new finfo;
			foreach($f as $name => $object) {
				if (is_file($name) && !preg_match("/(.*)-\d+x\d+\.(.*)/",$name)) { // only files but not thumbnail images
					$path = substr($name, $length); // crop to filename
					$p = dirname($path);
					$fn = basename($path);

					$media = new MediaModel("model", ["context"=>$contextid,"filename"=>$fn,"path"=>$p]);
					if (!$media->loaded()) {
						$media->hash = md5_file($name);
						$media->extn = $object->getExtension();
						$media->changed = $object->getCTime();
						$media->filesize = Utils::human_filesize($object->getSize(),1);
						$media->mime = $finfo->file($name, FILEINFO_MIME_TYPE);
						if (strpos($media->mime, "image/") !== false) {
							Image::cache_thumbnail($name, $media->hash); // @ default size
							$image = getimagesize($name);
							$media->width = intval($image[0],10);
							$media->height = intval($image[1],10);
							$media->basecolour = Utils::rgb2hex(Image::getBaseColour($name));
							if ($media->mime === "image/jpeg") {
								$exif = new iptc($name);
								if ($exif->hasMeta()) {
									$media->metadata = [
										"copyright" => $exif->getValue(IPTC_TYPES::IPTC_COPYRIGHT_STRING),
										"title" => $exif->getValue(IPTC_TYPES::IPTC_HEADLINE),
										"description" => $exif->getValue(IPTC_TYPES::IPTC_CAPTION),
									];
								}
							}
						}
					 	$media->save();
					}
				}
			}
		}
	}

	// i don't remember why this exists
	public static function base_model($context, $layout = "insert") {
		$json = realpath(dirname(__FILE__) . "/media_actions.json");
		$model = IO::loadJSON($json);
		$model["layout"] = $layout;
		$model["context"] = $context;  // typically the course id, but we might extend
		return $model;
	}

	// turn media into a json string that is compatible with the runtime needs
	public static function generateMediaJson($context) {
		if (is_object($context)) {
			forEach($context->Media as $media) {
				$result[] = [
					"filename" => $media->filename,
					"extn" => $media->extn,
					"width" => $media->width,
					"height" => $media->height
				];
			}
			return json_encode($result, JSON_NUMERIC_CHECK);
		} else if (is_numeric($context)) {
			$rows = Model::Read(self::TABLE_NAME, "context=:c", [":c"=>$context], "filename,extn,width,height");
			return json_encode($rows, JSON_NUMERIC_CHECK);
		}
	}

}