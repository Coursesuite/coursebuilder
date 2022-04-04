<?php
class Controller
{
    public $View;
    
    // call parent::__construct($this,$params) on all pages
    public function __construct($instance, $params = null)
    {
		$page = strtolower(str_replace("Controller","", get_class($instance)));
		$action = is_null($params) ? $page : $params[0];
        Session::init();
        $this->View = new View($page, $action);
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
    
    // put this at the top of functions that are only supposed be accessed via ajax
    public function RequiresAjax() {
	    $pass = (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest');
	    if (!$pass) {
		    die("Incorrect request method");
		}
    }

}
