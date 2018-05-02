<?php

class IndexModel
{
	public static function settings_model() {
		 $archive = Request::cookie("archive");
		 $subs = Request::cookie("subs");
		return array(
			  "search" => array (
				 "archive" => $archive,
				 "subs" => $subs,
				 "value" => Request::cookie("search"),
			  ),
			  "templates" => array_map(function($value) {
				   return array(
					"name" => basename($value),
					"icon" => Config::get("RELATIVEURL") . "/image/template/" . basename($value),
				   );
			}, array_filter(glob(Config::get('PATH_COURSE_TEMPLATES') . '[!_]*'), 'is_dir')),
		 );
	}
	
	
	public static function get_model($settings = false) {
		 
		 $archive = Request::cookie("archive");
		 $subs = Request::cookie("subs");
		 $value = array();
		 if ($settings == true) {
			  $value = self::settings_model();
		 }

		$database = DatabaseFactory::getFactory()->getConnection();
		 
		// we need a lsit of containers that I am able to see
		if (Session::isAdmin()) {
			$where = ["(true)"];
			if ($archive === "show") {
				$where[] = "(name <> 'archive')";
			}
			if ($subs !== "show") {
				$where[] = "(name not in (select container from plebs where container <> '*'))";
			}
			// group_concat defaults to comma join
			$sql = "SELECT group_concat(id) FROM container WHERE " . implode(" and ", $where);
			$mycontainers = $database->query($sql)->fetchColumn();
		} else {
			$pc = Session::User()->PersonalContainer(); // which is a STRING
			$mycontainers = DatabaseFactory::get_record("container",array("name" => $pc), "id");
		}
		
		// bound params need to be an array, and inserted into the sql as a series of ?
		$mycontainers = explode(',',$mycontainers);
		$marks = str_repeat('?,', count($mycontainers) - 1) . '?';

		// get a list of containers in the newest-modified to the oldest-modified
		$sql = "select n.id, n.name from courses c inner join container n on c.container = n.id where c.container in ($marks) group by container order by max(updated) desc";
		$query = $database->prepare($sql);
		$query->execute($mycontainers);
		$rows = $query->fetchAll();
		$containers = array();
		foreach ($rows as $row) {
			 $container = array(
				"name" => $row->name
			);
			$sql = "select id,name,stage as stagelabel, case stage when 'new' then '' when 'started' then 'label-important' when 'inprogress' then 'label-warning' when 'almostdone' then 'label-success' when 'complete' then 'label-info' when 'archived' then 'label-inverse' end as stageclass, UNIX_TIMESTAMP(updated) updated, folder, locked, concat(lower(name),',',stage,',',layout,',',lower(folder),',',:name) metadata from courses where container = :id order by updated desc";
			$query = $database->prepare($sql);
			$query->execute(array(
				":id" => (int) $row->id,
				":name" => (string) $row->name,
			));
			$courses = $query->fetchAll();
			foreach ($courses as &$course) {
				if (!is_dir(Config::get("PATH_CONTAINERS") . $row->name . '/' . $course->folder)) {
					$course->missing = true;
				}
			}
			$container["course"] = $courses; // $query->fetchAll();	
			$containers[] = $container;
		}
		$value["container"] = $containers;
		return $value;
	}
	
	// tour should be triggered if a user doesn't yet have a course; admins ignored
	public static function should_trigger_tour() {
		 if (Session::isAdmin()) {
			  return false;
		}
		$mycontainer = DatabaseFactory::get_record("container", array("name" => Session::User()->PersonalContainer()), "id");
		return (DatabaseFactory::get_record("courses", array("container" => $mycontainer), "count(1)") < 1);
	}
	
	public static function create_course($zipPath, $template, $name) {

		 $diskname = preg_replace('/\_[\_]+/','_',preg_replace(array('/\s/', '/\.[\.]+/', '/[^\w_\.\-]/'), array('_', '_', ''), $name) . '_' . uniqid());

		 $container = Session::User()->PersonalContainer();
		 $courseFolder = Config::get("PATH_CONTAINERS") . "$container/$diskname";

		 if (!is_dir($courseFolder)) {
			  mkdir($courseFolder, 0777, true);
		 }

		 $zip = new ZipArchive();
		 $result = new stdClass();
		 if ($zip->open($zipPath) === TRUE) {
			$zip->extractTo($courseFolder);
			
			$settings = IO::loadJSON($courseFolder . '/SCO1/Configuration/settings.json', false);
			$settings->course->name = $name;
			$settings->course->id = uniqid();
			$settings->course->description = 'This course was created using the CourseSuite CourseBuilder ' . $template . ' template.';
			$settings->copyright->content = '&copy; ' . date("Y") . ' ' . $container;
			
			$course = new CourseModel(0);
			$course->config = $settings;
			$course->container = DatabaseFactory::get_record("container", array("name" => $container), "id");
			$course->folder = $diskname;
			$course->engine = "textplayer";
			$course->name = $name;
			$course->touched = time();
			$course->sco = null;
			$course->stage = "new";
			$course->layout = $template;
			$course->locked = 0;
			if (file_exists($courseFolder . '/SCO1/Configuration/glossary.json')) {
				$course->glossary = IO::loadJSON($courseFolder . '/SCO1/Configuration/glossary.json');				
			}
			if (file_exists($courseFolder . '/SCO1/Configuration/images.json')) {
				$course->media = IO::loadJSON($courseFolder . '/SCO1/Configuration/images.json');				   
			}
			if (file_exists($courseFolder . '/SCO1/Configuration/references.json')) {
				$course->references = IO::loadJSON($courseFolder . '/SCO1/Configuration/references.json');				
			}
			if (file_exists($courseFolder . '/SCO1/Configuration/help.txt')) {
				$course->help = IO::loadFile($courseFolder . '/SCO1/Configuration/help.txt', null);
			}
			$course->save();
			
			$result->id = $course->id;
			$result->status = 200;
		} else {
			$result->status = 500;
			$result->error = "Unable to unpack template zip";
		}
		
		return $result;
		 
	}
	
}