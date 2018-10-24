<?php

use LightnCandy\LightnCandy;

// $endsWith = substr_compare( $str, $test, -strlen( $test ) ) === 0

class View
{

	protected $partials = array();
	protected $tmpl = array();
	protected $helpers = array();
	protected $css = array();
	protected $less = array();
    protected $head = array();
	protected $headjs = array("https://cdn.polyfill.io/v2/polyfill.min.js");
	protected $inlinejs = array();
	protected $js = array();
	protected $initjs = array();
	protected $page = "";
	protected $action = "";

	public function renderTemplates() {
		if (isset($this->tmpl)) {
			foreach ($this->tmpl as $inst) {
                $path = "";
                if (Text::startsWith($inst, '/') && file_exists(Config::get("PATH_REAL_WEBROOT") . $inst)) {
                    $path = Config::get("PATH_REAL_WEBROOT") . $inst;
                } else if (file_exists(Config::get('PATH_VIEW') . $inst)) {
                    $path = Config::get('PATH_VIEW') . $inst;
                }
                if (!empty($path)) {
					$id = ltrim(str_replace(array('/','.'),'-',strtolower($inst)),'-');
					echo "<script type='text/x-handlebars-template' id='$id'>" . PHP_EOL;
					echo IO::loadFile($path) . PHP_EOL;
					echo "</script>" . PHP_EOL;
				}
			}
		}
	}

	// $this->View->requires(anything)
	public function requires($name, $param = null)
	{
        if ($name === "js") {
            $this->js[] = $param;

        } else if ($name === "medium-editor") {
            $this->css[] = "/node_modules/medium-editor/dist/css/medium-editor.min.css";
            $this->css[] = "/node_modules/medium-editor-insert-plugin/dist/css/medium-editor-insert-plugin.min.css";
            $this->css[] = "/node_modules/medium-editor/dist/css/themes/beagle.css";// id="medium-editor-theme
            $this->css[] = "http://netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css";

            $this->js[] = "/node_modules/medium-editor/dist/js/medium-editor.js";
            $this->js[] = "/node_modules/medium-editor-insert-plugin/dist/js/medium-editor-insert-plugin.js";
            $this->js[] = "/node_modules/medium-editor-autolist/dist/autolist.js";
            $this->js[] = "/node_modules/jquery-sortable/source/js/jquery-sortable-min.js";

            // Unfortunately, jQuery File Upload Plugin has a few more dependencies itself - refactor it so it doesnt
            $this->js[] = "/node_modules/blueimp-file-upload/js/vendor/jquery.ui.widget.js";
            $this->js[] = "/node_modules/blueimp-file-upload/js/jquery.iframe-transport.js";
            $this->js[] = "/node_modules/blueimp-file-upload/js/jquery.fileupload.js";

        } else if ($name === "minimal") {
            $this->css[] = 'https://cdn.rawgit.com/csstools/sanitize.css/b3f4d2dd/sanitize.css';
            $this->css[] = 'https://fonts.googleapis.com/css?family=Material+Icons';
            $this->css[] = '/css/app/base.css';

            $this->js[] = 'https://cdn.jsdelivr.net/npm/handlebars@4.0.12/dist/handlebars.min.js';
            $this->js[] = 'https://cdn.jsdelivr.net/npm/jquery@3.3.1/dist/jquery.min.js';
            $this->js[] = 'https://cdn.jsdelivr.net/npm/js-cookie@2/src/js.cookie.min.js';
            $this->js[] = '/js/handlebars.helpers.js';

		} else if ($name === "uikit") {
			$this->css[] = 'https://cdnjs.cloudflare.com/ajax/libs/uikit/3.0.0-rc.16/css/uikit.min.css';
			$this->js[] = 'https://cdnjs.cloudflare.com/ajax/libs/uikit/3.0.0-rc.16/js/uikit.min.js';
			$this->js[] = 'https://cdnjs.cloudflare.com/ajax/libs/uikit/3.0.0-rc.16/js/uikit-icons.min.js';
			$this->partials[] = '_templates/uikit/navigation.hbp';

		} else if ($name === "base") {
            $this->js[] = "https://cdn.polyfill.io/v2/polyfill.min.js";
            // pick one icon font or make one .. having all these icon fonts is overkill
            // $this->css[] = "https://fonts.googleapis.com/css?family=Material+Icons";
            // $this->css[] = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css";
            $this->css[] = 'https://fonts.googleapis.com/css?family=Roboto';
         //   $this->head[] = '<link rel="stylesheet" href="https://pro.fontawesome.com/releases/v5.3.1/css/solid.css" integrity="sha384-pofSFWh/aTwxUvfNhg+LRpOXIFViguTD++4CNlmwgXOrQZj1EOJewBT+DmUVeyJN" crossorigin="anonymous">';
          //  $this->head[] = '<link rel="stylesheet" href="https://pro.fontawesome.com/releases/v5.3.1/css/fontawesome.css" integrity="sha384-Yz2UJoJEWBkb0TBzOd2kozX5/G4+z5WzWMMZz1Np2vwnFjF5FypnmBUBPH2gUa1F" crossorigin="anonymous">';


            $this->head[] = '<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/solid.css" integrity="sha384-VGP9aw4WtGH/uPAOseYxZ+Vz/vaTb1ehm1bwx92Fm8dTrE+3boLfF1SpAtB1z7HW" crossorigin="anonymous">';
            $this->head[] = '<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/fontawesome.css" integrity="sha384-1rquJLNOM3ijoueaaeS5m+McXPJCGdr5HcA03/VHXxcp2kX2sUrQDmFc3jR5i/C7" crossorigin="anonymous">';

			$this->js[] = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/1.12.4/jquery.min.js';
			$this->js[] = '/js/core.js';
			$this->js[] = '/js/bootstrap.min.js';
			$this->js[] = '/js/jquery-ui-1.10.0.custom.min.js';
			$this->js[] = '/js/chosen/chosen.jquery.min.js';
			$this->js[] = '/js/jquery.xeyes-2.0.min.js';
			$this->js[] = '/js/bootbox.js';
			$this->js[] = '/js/bootstrap-slider.js';
			$this->js[] = '/js/chrome_paste.js';
			$this->js[] = '/js/jGrowl/jquery.jgrowl.js';
			$this->js[] = '/js/tour/bootstrap-tour-standalone.min.js';

        } else if (Text::startsWith($name, "plugins/")) {
            $iterator = new DirectoryIterator(Config::get("PATH_REAL_WEBROOT") . "/{$name}");
            foreach ($iterator as $fileinfo) {
                $extn = $fileinfo->getExtension();
                if ($fileinfo->isFile() && in_array($extn, ['css','js','hbt'], true)) {
                    if ($extn==='hbt') {
                        $this->tmpl[] = "/{$name}/" . $fileinfo->getFilename();
                    } else {
                        $this->$extn[] = "/{$name}/" . $fileinfo->getFilename();
                    }
                }
            }

		} else if (strpos($name, ".less") !== false && strpos($name, "://") === false) {
			$this->less[] = $name;
			$this->inlinejs[] = "var less={env:'development'};";
			$this->headjs[] = "https://cdnjs.cloudflare.com/ajax/libs/less.js/3.0.1/less.min.js";

		} else if (strpos($name, ".css") !== false) {
            if (strpos($name, "://") !== false || strpos($name, "/css/") === 0) {
                $this->css[] = $name;
            } else {
                $this->css[] = "/css/$name";
            }
		} else if (strpos($name, ".js") !== false) {
            if (strpos($name, "://") !== false || strpos($name,"/js/") === 0) {
                $this->js[] = $name;
            } else {
    			$this->js[] = "/js/$name";
            }
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
            	return Config::get("URL") . "media/thumb/" . Text::base64_urlencode($path) . "/$width";
            },
            "uniq" => function ($value) {
                return "_" . md5($value);
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
        // in order to avoid this
        // $this->js[] = "/js/views/$path.js";
        // load the scripts and styles from the view folder and inject them into the public folder for that extension
        $autoloadExtensions = ['css','js'];
        $iterator = new DirectoryIterator(Config::get("PATH_VIEW") . $path);
        foreach ($iterator as $fileinfo) {
            $extn = $fileinfo->getExtension();
            if (!$fileinfo->isFile() || !in_array($extn, $autoloadExtensions, true)) continue;
            $src = Config::get('PATH_VIEW') . $path . '/' . $fileinfo->getFilename();
            $hash = md5_file($src);
            // rather than storing in "/{$extn}/" use a public cache folder which we can periodically clean safely
            $outpath = Config::get("PATH_PUBLIC_CACHE") . str_replace('.', "_{$path}_{$hash}.", $fileinfo->getFilename());
            $dest = Config::get('PATH_REAL_WEBROOT') . $outpath;
            if (file_exists($src) && !file_exists($dest)) {
                @copy($src, $dest);
            }
            $this->$extn[] = $outpath;
        }

		// function check_file($path) {
    	// return ( file_exists($path) || file_exists("{$_SERVER['DOCUMENT_ROOT']}path") );
		// }

        $data["baseurl"] = Config::get("URL");
        $data["cssurl"] = Config::get("PATH_CSS");
        $data["url"] = Config::get("RELATIVEURL");
        $data["page_title"] = Config::get("APPLICATION_TITLE");
        $data["page_description"] = Config::get("APPLICATION_DESCRIPTION");
        $data["sheets"] = $this->css;
        $data["scripts"] = $this->js;
        $data["head"] = $this->head;
        $data["headjs"] = $this->headjs;
        $data["inlinejs"] = $this->inlinejs;
        $data["less"] = $this->less;
        $data["page"] = $this->page;
        $data["action"] = $this->action;
        if (!isset($data["context"])) {
	        $data["context"] = 0; // typically id of currently selected course
        } else {
	        $data["context"] = filter_var($data["context"], FILTER_VALIDATE_INT, array('options' => array('default' => 0)));
        }

        $precompiled = Config::get('PATH_CACHE') . implode('.',[$this->page,$this->action,$hashname,'php']);
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
        if (!file_exists($precompiled) || $force == true) {
            $template = file_get_contents(Config::get('PATH_VIEW') . $filename . '.hba');
            $phpStr = LightnCandy::compile($template, array(
                "flags" => LightnCandy::FLAG_PARENT | LightnCandy::FLAG_ADVARNAME | LightnCandy::FLAG_HANDLEBARS | LightnCandy::FLAG_RENDER_DEBUG,
                "helpers" => $this->helpers,
                "debug" => true,
                "partials" => $this->partials,
            ));
            file_put_contents($precompiled, implode('', array('<', '?php', ' ', $phpStr, ' ', '?', '>'))); // so php tags are not recognised
        }

        $buffer = "";

        if ($return === true) {
            // capture all outputs
            $buffer = ob_start();
        }

        $folder = Config::get('PATH_VIEW') . str_replace(array('/', '\\'), DIRECTORY_SEPARATOR, substr($filename, 0, strrpos($filename, "/")));

		if (file_exists("{$folder}/header.php")) {
			require "{$folder}/header.php";
        } else if (!is_null($base)) {
            require Config::get('PATH_VIEW') . "_templates/" . $base . "_header.php";
        }

        $renderer = include $precompiled; // so its in the lightncandy use namespace on this file

        if (!isset($phpStr) || strlen($phpStr) === 0) {
			echo "error in compiler (usually an unclosed operator)";
		} else {
	        echo $renderer($assoc);
	    }

        if (file_exists("{$folder}/footer.php")) {
			require "{$folder}/footer.php";
        } else if (!is_null($base)) {
            require Config::get('PATH_VIEW') . "_templates/" . $base . "_footer.php";
        }

        if ($return === true) {
            $buffer = ob_get_contents();
            ob_end_clean();
        }

        return $buffer;

    }

    public function raw($content, $type = "text/javascript") {
        header("Content-Type: {$type}");
        echo $content, PHP_EOL;
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
