<?php
	
class LoginController extends Controller {
	
    public function __construct(...$params)
    {
        parent::__construct($this, $params);
    }

	// render the index (logon form)
	public function index() {
    
		$this->View->requires("_templates/navbar");
	    $this->View->requires("_templates/fridgeMagnets");
	    $data = array(
		    "csrf" => Csrf::makeToken(),
		    "feedback" => Session::get("feedback"),
	    );
		$this->View->render("login/index", $data);
	}
	
	public function logout() {
		Response::cookie("aspname", null);
		Session::destroy();
		Session::init();
		Session::set("feedback","You have been logged out.");
		Response::redirect("login/index");
	}
	
	// handle the logon form postback
	public function authenticate() {
		if (!Csrf::isTokenValid()) {
			Session::set("feedback","Invalid form data.");
			Response::redirect("login/");
		}
		$username = Request::post("username", true);
		$password = md5(Request::post("password"));

		if (!empty($username) && (Utils::UserType($username) === "external")) {
			Session::set("feedback","You need to log in https://www.coursesuite.ninja/store/info/coursebuildr instead.");
			Response::redirect("login/index");
		}	
			
		if (empty($username) || empty(Request::post("password"))) {
			Session::set("feedback","Missing form data.");
			Response::redirect("login/index");
		}
		
		// yes, yes, I'm doing database calls inside a controller,
		// feel free to refactor this if this bothers you.
		$database = DatabaseFactory::getFactory()->getConnection();
		$sql = "select count(1) from plebs where name=:u and password=:p limit 1";
		$query = $database->prepare($sql);
		$query->execute(array(
			":u" => substr($username, 0, 20),
			":p" => $password
		));
		if ($query->fetchColumn() > 0) {
			$sql = "select id from plebs where name=:u and password=:p limit 1";
			$query = $database->prepare($sql);
			$query->execute(array(
				":u" => substr($username, 0, 20),
				":p" => $password
			));
			$user_id = $query->fetchColumn();
			Session::set("user_id", $user_id);
			Session::set("tier", $tier);
			$sql = "update plebs set current_session_id=:s where id=:id limit 1";
			$query = $database->prepare($sql);
			$query->execute(array(":s" => Session::CurrentId(), ":id" => $user_id));
			Response::redirect("index");
		}
		Session::remove("user_id");
		Session::remove("tier");
		Session::set("feedback","Sorry you got something wrong.");
		Response::redirect("login/index");
	}
	
/*
	public function checksso($kind, $token) {
		$get = array ($kind => $token);
		// 33383966626261386162363465326137386637386361623436393533333064626330383533303762336538313762313636306539633136353964363563326564c6f75dbb518c4b69c5f5f3bc01621364143a51dfc74def820af89df9fd7a17fc
		$verifier = (new \Ninjitsu\Validator($get))->check();
		$this->View->write(print_r($verifier, true));
	}
*/
		
	public function sso($kind, $token) {
		$get = array($kind => $token);
		$verifier = Validator::Instance()->Validate($get);
		
		if (!$verifier->valid) {
			header("location: " . $verifier->home . "bad-token");
			die();
		}
		
		if ($verifier->licence->remaining < 1) {
			header("location: " . $verifier->home . "in-use");
			die();
		}
		
		if ($verifier->licence->tier < 1) {
			header("location: " . $verifier->home . "bad-tier");
			die();
		}
		
		$App = new stdClass();
		$App->Home = $verifier->home;
		$App->Tier =  $verifier->licence->tier;
		$App->Api = isset($verifier->api);

		if (isset($verifier->api->publish) && !empty($verifier->api->publish)) {
			$jsApp->Publish = $verifier->api->publish;
			$jsApp->Bearer = $verifier->api->bearer;
			$jsApp->Method = "POST"; // or PUT
		}
		
        $container = $verifier->user->container;
        $email = $verifier->user->email;
		$user_id = -1;

		$database = DatabaseFactory::getFactory()->getConnection();
		$sql = "SELECT count(1) FROM plebs WHERE email = :email LIMIT 1";
		$query = $database->prepare($sql);
		$query->execute(array(":email" => $email));
		$r = (int)$query->fetchColumn();
		if ($r === 0) {
			$ac = new AccountModel(0);
			$ac->name = preg_replace('/([^@]*).*/', '$1', $email);
			$ac->password = hash("md5", time() . $username);
			$ac->email = $email;
			$ac->container = $container;
			$ac->tier = $verifier->licence->tier;
			$ac->limit = 999;
			$ac->current_session_id = Session::CurrentId();
			$ac->licence = serialize($verifier);
/*
			if (isset($verifier->api)) {
				$ac->custom_header = (isset($verifier->api->header->html) && !empty($verifier->api->header->html)) ? $verifier->api->header->html : null;
				$ac->custom_css = (isset($verifier->api->header->css) && !empty($verifier->api->header->css)) ? $verifier->api->header->css : null;
				$ac->publish_url = (isset($verifier->api->publish) && !empty($verifier->api->publish)) ? $verifier->api->publish : null;
				$ac->bearer_token = (isset($verifier->api->bearer) && !empty($verifier->api->bearer)) ? $verifier->api->bearer : null;
			}
*/
			$ac->save();
			$user_id = $ac->id;
		} else {
			$user_id = AccountModel::lookup_user_id_by_email($email);
			$ac = new AccountModel($user_id);
			$ac->licence = serialize($verifier);
			$ac->current_session_id = Session::CurrentId();
			$ac->save();
			// $user_id = DatabaseFactory::get_record("plebs", array("email" => $email), "id");
		}
		
		$sql = "select count(1) from container where name = :name LIMIT 1";
		$query = $database->prepare($sql);
		$query->execute(array(":name" => $container));
		$r = (int)$query->fetchColumn();
		if ($r === 0) {
			$cm = new ContainerModel(0);
			$cm->name = $container;
			$cm->save();
			if (!is_dir(Config::get("PATH_CONTAINERS") . $container)) {
				mkdir(Config::get("PATH_CONTAINERS") . $container, 0777, true);
			}
		}

		Session::set("user_id", $user_id);
		Session::set("tier", $tier);

		Response::cookie("aspname", $username);

		Response::redirect("index/");
		
	}
	
}