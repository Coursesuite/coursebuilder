<?php

use LightnCandy\LightnCandy;

// $endsWith = substr_compare( $str, $test, -strlen( $test ) ) === 0

class View
{
	
	protected $partials = array();
	protected $tmpl = array();
	protected $helpers = array();
	protected $css = array();
	protected $js = array();
	protected $initjs = array();
	protected $page = "";
	protected $action = "";
	
	public function renderTemplates() {
		if (isset($this->tmpl)) {
			foreach ($this->tmpl as $inst) {
				if (file_exists(Config::get('PATH_VIEW') . $inst)) {
					$id = str_replace(array('/','.'),'-',$inst);
					echo "<script type='text/x-handlebars-template' id='$id'>" . PHP_EOL;
					echo IO::loadFile(Config::get('PATH_VIEW') . $inst) . PHP_EOL;
					echo "</script>" . PHP_EOL;
				}
			}
		}
	}
	
	// $this->View->requires(anything)
	public function requires($name, $param = null)
	{
		if (strpos($name, ".css") !== false && strpos($name, "://") === false) { // e.g. third-party/jstree/style.css
			$this->css[] = "/css/$name";
		} else if (strpos($name, ".css") !== false && strpos($name, "://") !== false) { // e.g. third-party/jstree/style.css
			$this->css[] = "$name";
		} else if (strpos($name, ".js") !== false&& strpos($name, "://") === false) { // e.g. third-party/jstree/treeview.js
			$this->js[] = "/js/$name";
		} else if (strpos($name, ".js") !== false&& strpos($name, "://") !== false) { // e.g. third-party/jstree/treeview.js
			$this->js[] = "$name";
 		} else if (strpos($name, "::") !== false) { // e.g. Text::Paginator
			$this->helpers[] = $name;
		} else if (strpos($name, ".hbt") !== false) { // e.g. index/container.hbt
			$this->tmpl[] = $name;
		} else if ($name === "init") {
			$this->initjs[] = $param;
		} else if (file_exists(Config::get('PATH_VIEW') . $name . '.hbp')) { // e.g. login/forgot
			$tok = strtok($name,'/'); // "forgot" => (contents of login/forgot.hbp)
			$this->partials[strtok('/')] = IO::loadFile(Config::get('PATH_VIEW') . $name . '.hbp');
		}
	}
	
    public function __construct($page, $action)
    {
	    $this->page = $page;
	    $this->action = $action;
        $this->helpers = array(
            "equals" => function ($arg1, $arg2, $options) {
                if (strcasecmp((string) $arg1, (string) $arg2) == 0) {
                    return $options['fn']();
                } else if (isset($options['inverse'])) {
                    return $options['inverse']();
                }
            },
            "not" => function ($arg1, $arg2, $options) {
                if (strcasecmp((string) $arg1, (string) $arg2) == 0) {
                    return $options['inverse']();
                } else if (isset($options['inverse'])) {
                    return $options['fn']();
                }
            },
            "gte" => function ($arg1, $arg2, $options) {
                if ((int) $arg1 >= (int) $arg2) {
                    return $options['fn']();
                } else if (isset($options['inverse'])) {
                    return $options['inverse']();
                }
            },
            "isin" => function ($arg1, $arg2, $options) {
                if (in_array($arg1, $arg2)) {
                    return $options['fn']();
                } else if (isset($options['inverse'])) {
                    return $options['inverse']();
                }
            },
            "dump" => function ($arg1) {
                return print_r($arg1, true);
            },
            "escape" => function ($arg1) {
                return rawurlencode($arg1);
            },
            "htmlify" => function ($arg1) {
                return Text::toHtml($arg1);
            },
            "jsonformat" => function ($arg1) {
                $json = json_decode($arg1);
                return json_encode($json, JSON_PRETTY_PRINT | JSON_NUMERIC_CHECK);
            },
            "json_encode" => function($arg1) {
	            return json_encode($arg1, JSON_NUMERIC_CHECK);
            },
            "stringify" => function($obj, $pretty = false) {
                $params = JSON_NUMERIC_CHECK; // | JSON_PRETTY_PRINT
                return json_encode($obj, $params);
            },
            "typeof" => function ($arg1) {
                return gettype($arg1);
            },
            "idify" => function ($arg1) {
                return preg_replace('/[^a-zA_Z0-9]/', '_', strtolower($arg1));
            },
            "morethan" => function ($arg1, $arg2, $options) {
                if (count($arg1) > $arg2) {
                    return $options['fn']();
                } elseif (isset($options['inverse'])) {
                    return $options['inverse']();
                }
            },
            "count" => function ($arg1) {
                return count($arg1);
            },
            "length" => function ($arg1, $inc) {
                $len = count($arg1);
                return $len + $inc;
            },
            "add" => function ($arg1, $arg2) {
                return (int) $arg1 + (int) $arg2;
            },
            "minus" => function ($arg1, $arg2) {
                return (int) $arg1 - (int) $arg2;
            },
            "cint" => function ($arg1) {
                return (int) $arg1;
            },
            "plural" => function ($arg1, $options) {
                if (count($arg1) > 1) {
                    return $options['fn']();
                } elseif (isset($options['inverse'])) {
                    return $options['inverse']();
                }
            },
            "morethanone" => function ($obj, $property, $options) { // does a pool of objects contain more than one with a property set?
                $bool = false;
                if (property_exists((object) $obj[0], $property)) {
                    $count = 0;
                    foreach ($obj as $instance) {
                        if (!empty($instance[$property])) { $count++; }
                    }
                    $bool = ($count > 1);
                }
                if ($bool === true) {
                    return $options['fn']();
                } elseif (isset($options['inverse'])) {
                    return $options['inverse']();
                }
            },
            "date" => function ($arg1) {
                // http://php.net/manual/en/function.date.php
                date_default_timezone_set('UTC');
               return date("jS M Y", strtotime($arg1));
            },
            "datetime" => function ($arg1) {
	           // date_default_timezone_set('UTC');
               return date("jS M Y h:ia", strtotime($arg1));
            },
            "admins" => function ($options) {
	            if (Session::isAdmin()) {
		            return $options['fn']();
	            } elseif (isset($options['inverse'])) {
		            return $options['inverse']();
	            }
            },
            "cookie" => function ($arg1) {
	            return Request::cookie($arg1);
            },
            "ucfirst" => function ($string) {
	            return ucfirst($string);
            },
            "humandate" => function ($time, $suffix) {
	            $time = time() - $time; // to get the time since that moment
	            $time = ($time<1)? 1 : $time;
	            $tokens = array (
	                31536000 => 'year',
	                2592000 => 'month',
	                604800 => 'week',
	                86400 => 'day',
	                3600 => 'hour',
	                60 => 'minute',
	                1 => 'second'
	            );
	
	            foreach ($tokens as $unit => $text) {
	                if ($time < $unit) continue;
	                $numberOfUnits = floor($time / $unit);
	                return $numberOfUnits.' '.$text.(($numberOfUnits>1)?'s':'') . ' ' . $suffix;
	            }
			},
			"thumbnail" => function ($path, $width) {
            	return Config::get("URL") . "/image/thumb/" . Text::base64_urlencode($path) . "/$width";
            },
            "b64urlencode" => function ($data) {
	            return Text::base64_urlencode($data);
            },
            "concat" => function ($left, $right) {
	            return $left . $right;
            }
        );

      //   $this->SystemMessages = MessageModel::getMyUnreadMessages();
    }

    /* For parsing strings instead of files
    usage:
    $render = $this->View->prepareString($template);
    $render(array('key'=>'value'));
    */
    public function prepareString($template) {
        $compiled = LightnCandy::compile($template);
        return LightnCandy::prepare($compiled);
    }

    public function render($filename, $data = null, $base = "base", $force = null, $return = false, $contentType = "text/html")
    {
	    
	    if (is_null($force)) {
		    $force = Config::get("FORCE_HANDLEBARS_COMPILATION");
	    }
	    
	    // tip! don't set a header after a require/include or you'll be head scratching some very random errors;
		if ($return === false) {
			header("Content-Type: $contentType");
			if ($force == true) {
				header('Expires: '.gmdate('D, d M Y H:i:s \G\M\T', time() - 86400));
        	}
       	}

        $hashname = md5($filename);
        if (is_null($data)) {
	        $data = [];
        }
        
        $path = strtok($filename, "/");
        $this->js[] = "/js/views/$path.js";

		// function check_file($path) {
    	// return ( file_exists($path) || file_exists("{$_SERVER['DOCUMENT_ROOT']}path") );
		// }

        $data["baseurl"] = Config::get("URL");
        $data["cssurl"] = Config::get("PATH_CSS");
        $data["url"] = Config::get("RELATIVEURL");
        $data["title"] = Config::get("APPLICATION_TITLE");
        $data["description"] = Config::get("APPLICATION_DESCRIPTION");
        $data["sheets"] = $this->css;
        $data["scripts"] = $this->js;
        $data["page"] = $this->page;
        $data["action"] = $this->action;
        
        if (!isset($data["context"])) {
	        $data["context"] = 0; // typically id of currently selected course
        } else {
	        $data["context"] = filter_var($data["context"], FILTER_VALIDATE_INT, array('options' => array('default' => 0)));
        }

        $precompiled = str_replace("/","\\", Config::get('PATH_CACHE') . $hashname . '.php'); // because windows has SUDDENLY decided that it can't mix path separators
        $assoc = json_decode(json_encode($data), true); // data is now an associative array

        foreach ($data as $key => $value) {
	        if (is_array($value)) {
		        $this->{$key} = (object) $value;
	        } else {
	        	$this->{$key} = $value;
	        }
        }
        Session::remove("feedback");

        // if we have already compiled this page, don't compile it again unless being forced to
        
        
        // 2019 september : I have this in standalone mode so that its easier to debug the "function name must be a string" error that crops up from time to time 
        // you can also put on  | LightnCandy::FLAG_ERROR_SKIPPARTIAL but it doesn't seem to help
        
        //https://zordius.github.io/HandlebarsCookbook/LC-FLAG_STANDALONEPHP.html
        if (!file_exists($precompiled) || $force == true) {
            $template = file_get_contents(Config::get('PATH_VIEW') . $filename . '.hba');
            $phpStr = LightnCandy::compile($template, array(
                "flags" => LightnCandy::FLAG_STANDALONEPHP | LightnCandy::FLAG_PARENT | LightnCandy::FLAG_ADVARNAME | LightnCandy::FLAG_HANDLEBARS | LightnCandy::FLAG_RENDER_DEBUG | LightnCandy::FLAG_ERROR_EXCEPTION,
                "helpers" => $this->helpers,
                "debug" => false,
                "partials" => $this->partials,
            ));
            file_put_contents($precompiled, implode('', array('<', '?php', ' ', $phpStr, ' ', '?', '>'))); // so php tags are not recognised
        } else {
	        $phpStr = file_get_contents($precompiled);
        }

        $buffer = "";

        if ($return === true) {
            // capture all outputs
            $buffer = ob_start();
        }

        if (!is_null($base)) {
            require Config::get('PATH_VIEW') . "_templates\\" . $base . "_header.php";
        }
        $renderer = include $precompiled; // so its in the lightncandy use namespace on this file; uses a return to set the value of renderer to the function inside the include .. https://www.php.net/manual/en/function.return.php

        if (!isset($phpStr) || strlen($phpStr) === 0) {
			echo "error in compiler";
		} else {
	        echo $renderer($assoc);
	    }

        if (!is_null($base)) {
            require Config::get('PATH_VIEW') . "_templates\\" . $base . "_footer.php";
        }

        if ($return === true) {
            $buffer = ob_get_contents();
            ob_end_clean();
        }

        return $buffer;

    }

    public function write($output, $params = null)
    {
	    if (is_array($params)) {
		    foreach ($params as $key => $value) {
			    $output = str_replace($key, $value, $output);
		    }
	    }
        echo $output;
    }

    public function renderJSON($data, $numeric = true, $prettify = false)
    {
        header("Content-Type: application/json");
        $options = 0;
        if ($numeric) $options = $options | JSON_NUMERIC_CHECK;
        if ($prettify) $options = $options | JSON_PRETTY_PRINT;
        echo json_encode($data, $options);
    }

    /**
     * Checks if the passed string is the currently active controller.
     * Useful for handling the navigation's active/non-active link.
     *
     * @param string $filename
     * @param string $navigation_controller
     *
     * @return bool Shows if the controller is used or not
     */
    public static function checkForActiveController($filename, $navigation_controller)
    {
        $split_filename = explode("/", $filename);
        $active_controller = $split_filename[0];

        if ($active_controller == $navigation_controller) {
            return true;
        }

        return false;
    }

    /**
     * Checks if the passed string is the currently active controller-action (=method).
     * Useful for handling the navigation's active/non-active link.
     *
     * @param string $filename
     * @param string $navigation_action
     *
     * @return bool Shows if the action/method is used or not
     */
    public static function checkForActiveAction($filename, $navigation_action)
    {
        $split_filename = explode("/", $filename);
        $active_action = $split_filename[1];

        if ($active_action == $navigation_action) {
            return true;
        }

        return false;
    }

    /**
     * Checks if the passed string is the currently active controller and controller-action.
     * Useful for handling the navigation's active/non-active link.
     *
     * @param string $filename
     * @param string $navigation_controller_and_action
     *
     * @return bool
     */
    public static function checkForActiveControllerAndAction($filename, $navigation_controller_and_action)
    {
        $split_filename = explode("/", $filename);
        $active_controller = $split_filename[0];
        $active_action = $split_filename[1];

        $split_filename = explode("/", $navigation_controller_and_action);
        $navigation_controller = $split_filename[0];
        $navigation_action = $split_filename[1];

        if ($active_controller == $navigation_controller and $active_action == $navigation_action) {
            return true;
        }

        return false;
    }

    /**
     * Converts characters to HTML entities
     * This is important to avoid XSS attacks, and attempts to inject malicious code in your page.
     *
     * @param  string $str The string.
     * @return string
     */
    public function encodeHTML($str)
    {
        return htmlentities($str, ENT_QUOTES, 'UTF-8');
    }

}
