<?php

class Application {
    private $controller;
    private $parameters = array();
    private $controller_name;
    private $action_name;

    public function __construct() {

        date_default_timezone_set( 'Australia/Sydney' );

        $this->splitUrl();
        $this->createControllerAndActionNames();
        $this->checkCache();

        if (file_exists(Config::get("PATH_CONTROLLER") . $this->controller_name . '.php')) {

/*
            switch ($this->controller_name) {
                case "ImportController": // import/ninja becomes import/index (ninja)
                    $this->parameters = array($this->action_name);
                    $this->action_name = "index";
                    break;

                case "LaunchController": // launch/app/param1/param2 becomes launch/index (app, param1, param2)
                case "BlogController":
                    $params = $this->parameters;
                    array_unshift($params, $this->action_name);
                    $this->action_name = "index";
                    $this->parameters = $params;

            }
*/

            require Config::get("PATH_CONTROLLER") . $this->controller_name . '.php';
            $this->controller = new $this->controller_name($this->action_name, $this->parameters); // pass in action name so the constructor can use it, constructor ok if param passed and not handled

            // check for method: does such a method exist in the controller ?
            if (method_exists($this->controller, $this->action_name)) {
                if (!empty($this->parameters)) {
                    // call the method and pass arguments to it
                    call_user_func_array(array($this->controller, $this->action_name), $this->parameters);
                } else {
                    // if no parameters are given, just call the method without parameters, like $this->index->index();
                    $this->controller->{$this->action_name}();
                }
            } else {
                // load 404 error page
                require Config::get("PATH_CONTROLLER") . 'ErrorController.php';
                $this->controller = new ErrorController;
                $this->controller->error404();
            }
        } else {
	        // echo "path controller is " . Config::get("PATH_CONTROLLER");
            // load 404 error page
            var_dump(Config::get("PATH_CONTROLLER"));
            require Config::get("PATH_CONTROLLER") . 'ErrorController.php';
            $this->controller = new ErrorController;
            $this->controller->error404();
        }
    }

    public function override_action($action) {
        $action_name = $action;
    }

    private function splitUrl() {
        if (Request::get('url')) {
            $url = trim(Request::real_get('url'), '/'); // real_get replaces space with +, since $_GET urldecodes then converts plus to space automatically, which invalidates the base64 string
            $url = filter_var($url, FILTER_SANITIZE_URL);
            $url = explode('/', $url);
//echo "url=";
//var_dump($url);
            $this->controller_name = isset($url[0]) ? $url[0] : null;
            $this->action_name = isset($url[1]) ? $url[1] : null;
            unset($url[0], $url[1]);
            $this->parameters = array_values($url);
        }
    }

    private function createControllerAndActionNames() {
        if (!$this->controller_name) {
            $this->controller_name = Config::get('DEFAULT_CONTROLLER');
        }
        if (!$this->action_name or (strlen($this->action_name) == 0)) {
            $this->action_name = Config::get('DEFAULT_ACTION');
        }
        $this->controller_name = ucwords($this->controller_name) . 'Controller';
    }

    private function checkCache() {
        if (!file_exists(Config::get("PATH_REAL_WEBROOT") . Config::get("PATH_PUBLIC_CACHE"))) {
            mkdir(Config::get("PATH_REAL_WEBROOT") . Config::get("PATH_PUBLIC_CACHE"));
        }
        if (Config::get("DEBUG") === true ) { // clear the public cache every so often ...
            $age = time() - 300; // 5 minute cache
            $p = Config::get("PATH_REAL_WEBROOT") . Config::get("PATH_PUBLIC_CACHE") . '*';
            foreach (glob($p) as $file) {
                if (is_file($file) && filemtime($file) < $age) unlink($file);
            }
        }
    }
}
