<?php
class Controller
{
    public $View;

    // call parent::__construct($this,$params) on all pages
    public function __construct($instance, $params = null)
    {

		$method = strtolower(str_replace("Controller","", get_class($instance)));
		$action = is_null($params) ? $method : $params[0];
        Session::init();
        $this->View = new View($method, $action);
    }

	// if a page requires logon, call parent::RequiresLogon() inside the constructor
    public function RequiresLogon() {
        if (!Session::CurrentUserId() > 0) {
	        Session::set("feedback", "You must be logged on to access this page");
	        Response::redirect("login/");
        }
    }

    public function SetAspCookie() {
		Response::cookie("aspname", Session::User()->name);
    }
    // if a page requires admin, call parent::RequiresAdmin() inside the constructor
    public function RequiresAdmin() {
	    if (!Session::isAdmin()) {
	        Response::redirect("index/");
	    }
    }

    public function allowCORS() {
        header('Access-Control-Allow-Origin: *');
        header("Access-Control-Allow-Headers: X-Requested-With");
        if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
            if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
                header("Access-Control-Allow-Methods: POST, OPTIONS");
            if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
                header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
            exit(0);
        }
    }

    // put this at the top of functions that are only supposed be accessed via ajax
    public function RequiresAjax() {
	    $pass = (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest');
	    if (!$pass) {
		    die("Incorrect request method");
		}
    }

}
