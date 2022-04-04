<?php
	
class Licence {
	
	public static function webservice_script() {
		$result = "";
		if (Session::CurrentUserId() > 0) {
			$database = DatabaseFactory::getFactory()->getConnection();
			$query = $database->prepare("
				SELECT licence 
				FROM plebs
				WHERE id = :id
				AND container <> '*'
				LIMIT 1 
			");
			$query->execute(array(":id" => Session::CurrentUserId()));
			if ($tag = $query->fetchColumn()) {
				if (!is_null($tag)) {
					$licence = @unserialize($tag); // skip failures
					if (isset($licence->app) && isset($licence->app->socket)) {
						$result = "<script type='text/javascript'>";
						$result .= "var Layer = new WebSocket('" . $licence->app->socket . "');";
						$result .= $licence->app->layer . ";";
						$result .= "</script>" . PHP_EOL;
					}
				}
			}
		}
		return $result;
	}
}