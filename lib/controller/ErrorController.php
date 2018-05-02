<?php
class ErrorController extends Controller
{
    public function __construct()
    {
        parent::__construct($this);
    }
    public function index() {
	    $this->error404();
    }
    public function error404()
    {
		header($_SERVER["SERVER_PROTOCOL"]." 404 Not Found");
		exit;
        // header('HTTP/1.0 404 Not Found', true, 404);
        // $this->View->render('error/404');
    }
}
