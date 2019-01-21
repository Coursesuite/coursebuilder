<?php

use LightnCandy\LightnCandy;

class Text
{
	private static $texts;

	public static function get($key, $data = null) {
		// if not $key
		if (!$key) {
			return null;
		}
		if ($data) {
			foreach ($data as $var => $value) {
				${$var} = $value;
			}
		}
		// load config file (this is only done once per application lifecycle)
		if (!self::$texts) {
			self::$texts = require dirname(dirname(__FILE__)) . '/config/strings.php';
		}

		// check if array key exists
		if (!array_key_exists($key, self::$texts)) {
			return null;
		}

		return self::$texts[$key];
	}

	public static function sprintf($key, $args) {
		if (!$key) return null;
		if (!self::$texts) {
			self::$texts = require dirname(dirname(__FILE__)) . '/config/strings.php';
		}
		if (!array_key_exists($key, self::$texts)) {
			return null;
		}
		return sprintf(self::$texts[key], $args);
	}

	public static function output($ar, $key, $encode = false) {
		if (is_array($ar)) {
			if (array_key_exists($key, $ar)) {
				$outp = $ar[$key];
				if (isset($outp) && !empty($outp)) {
					if ($encode) {
						$outp = htmlentities($outp, ENT_QUOTES, 'UTF-8');
					}
					echo $outp;
				}
			}
		}
	}

	public static function formatString($key, $data) {
		if (!$key) {
			return null;
		}
		if (!self::$texts) {
			self::$texts = require dirname(dirname(__FILE__)) . '/config/strings.php';
		}
		if (!array_key_exists($key, self::$texts)) {
			return null;
		}
		$string = self::$texts[$key];
		$needles = array_map(function($value) {
			return '{{' . $value . '}}';
		}, array_keys($data));
		$values = array_values($data);
		$out = str_replace($needles, $values, $string);
		return $out;
	}

	public static function toHtml($string) {
		$PDE = new ParsedownExtra();
		return $PDE->text($string);
	}

	// compile handlebars into a template, then execute it against an object
	public static function compileHtml($template, $obj) {
		if (strpos($template, "/") === 0) $template = file_get_contents($template);
		$compiled = LightnCandy::compile($template);
		$content = LightnCandy::prepare($compiled);
		$aj = json_decode(json_encode($obj), true);
		return $content($aj);
	}

	// execute php directly, applying args as variables
	public static function compilePhpTemplate($templatePath, array $args) {
        if (!file_exists($templatePath)) {
            return ""; // throw new Exception($templateName);
        }
        ob_start();
        extract($args);
        include $templatePath;
        return ob_get_clean();
	}

	public static function base64enc($val) {
		return strtr(base64_encode($val), '+/=', '-_,');
	}

	public static function base64dec($val) {
		return base64_decode(strtr($val, '-_,', '+/='));
	}

	public static function StaticPageRenderer($route) {
		$page = StaticPageModel::getRecordByKey($route);
		if (isset($page) && $page !== false) {
			$PDE = new ParsedownExtra();
			return $PDE->text($page->content);
		}
		return "";
	}

	public static function formatBytes($size, $precision = 2) {
		$base = log($size, 1024);
		$suffixes = array('', 'K', 'M', 'G', 'T');
		return round(pow(1024, $base - floor($base)), $precision) . ' ' . $suffixes[floor($base)];
	}

	public static function formatTime($seconds) {
		return gmdate("H:i:s", $seconds);
	}

	public static function generatePassword() {
		return substr(str_replace(["O","o","0","i","j","l","I","L","S","5","1"],"", base64_encode(md5(mt_rand()))),5,10);
	}

	public static function Paginator($pagination, $options) {
		$type = $options["hash"]["type"] ?: 'middle';
		$ret = '';
		$pageSize = $pagination["size"];
		$pageCount = intval(ceil($pagination["total"] / $pageSize)); // round() rounds up, floor() rounds down
		$page = $pagination["page"];
		$limit = null;
		if (isset($options["hash"]["limit"])) {
			$limit = (int) $options["hash"]["limit"];
		}
		$newContext = array();
		switch ($type) {
			case 'middle':
				if (gettype($limit) === 'integer') {
					$i = 0;
					$leftCount = ceil($limit / 2) - 1;
					$rightCount = $limit - $leftCount - 1;
					if ($page + $rightCount > $pageCount) {
						$leftCount = $limit - $pageCount - $page - 1;
					}
					if ($page - $leftCount < 1) {
						$leftCount = $page - 1;
					}
					$start = $page - $leftCount;
					$active = false;
					while ($i < $limit && $i < $pageCount) {
						$newContext = array();
						$newContext['n'] = $start;
						if ($start === $page + 1) {
							$newContext['active'] = true;
							$active = true;
						} else if ($start === $pageCount && !$active) { // i couldn't be bothered debugging this corner
							$newContext['active'] = true;
						}
						$ret .= $options['fn']($newContext);
						$start++;
						$i++;
					}
				} else {
					for ($i = 1; $i <= $pageCount; $i++) {
						$newContext = array();
						$newContext['n'] = $i;
						if ($i === $page + 1) {
							$newContext['active'] = true;
						}
						$ret .= $options['fn']($newContext);
					}
				}
				break;
			case 'previous':
				if ($page + 1 === 1) {
					$newContext['disabled'] = true;
					$newContext['n'] = 1;
				} else {
					$newContext['n'] = $page - 1;
				}
				$ret .= $options['fn']($newContext);
				break;
			case 'next':
				if ($page + 1 === $pageCount) {
					$newContext['disabled'] = true;
					$newContext['n'] = $pageCount - 1;
				} else {
					$newContext['n'] = $page + 1;
				}
				$ret .= $options['fn']($newContext);
				break;
			case 'first':
				$newContext['n'] = 1;
				if ($page + 1 === 1) {
					$newContext['disabled'] = true;
				}
				$ret .= $options['fn']($newContext);
				break;
			case 'last':
				$newContext['n'] = $pageCount - 1;
				if ($page + 1 === $pageCount) {
					$newContext['disabled'] = true;
				}
				$ret .= $options['fn']($newContext);
				break;
		}
		return $ret;
	}

	public static function random_string($length) {
	    $key = '';
	    $keys = array_merge(range(0, 9), range('a', 'z'));
	    for ($i = 0; $i < $length; $i++) {
	        $key .= $keys[array_rand($keys)];
	    }
	    return $key;
	}

	public static function safe_name($value) {
		return preg_replace(array('/\s/', '/\.[\.]+/', '/[^\w_\.\-]/'), array('_', '.', ''), $value) . '_' . uniqid();
	}

	public static function base64_urlencode($input) {
		return strtr(base64_encode($input), '+/=', '-_~');
	}

	public static function base64_urldecode($input) {
		return base64_decode(strtr($input, '-_~', '+/='));
	}

	// functions lifted from https://github.com/laravel/framework/blob/4.2/src/Illuminate/Support/Str.php

	/**
	 * Determine if a given string contains a given substring.
	 *
	 * @param  string  $haystack
	 * @param  string|array  $needles
	 * @return bool
	 */
	public static function contains($haystack, $needles) {
		foreach ((array) $needles as $needle)
		{
			if ($needle != '' && strpos($haystack, $needle) !== false) return true;
		}
		return false;
	}
	/**
	 * Determine if a given string ends with a given substring.
	 *
	 * @param  string  $haystack
	 * @param  string|array  $needles
	 * @return bool
	 */
	public static function endsWith($haystack, $needles) {
		foreach ((array) $needles as $needle)
		{
			if ((string) $needle === substr($haystack, -strlen($needle))) return true;
		}
		return false;
	}
	/**
	 * Cap a string with a single instance of a given value.
	 *
	 * @param  string  $value
	 * @param  string  $cap
	 * @return string
	 */
	public static function finish($value, $cap) {
		$quoted = preg_quote($cap, '/');
		return preg_replace('/(?:'.$quoted.')+$/', '', $value).$cap;
	}
	/**
	 * Determine if a given string matches a given pattern.
	 *
	 * @param  string  $pattern
	 * @param  string  $value
	 * @return bool
	 */
	public static function is($pattern, $value) {
		if ($pattern == $value) return true;
		$pattern = preg_quote($pattern, '#');
		// Asterisks are translated into zero-or-more regular expression wildcards
		// to make it convenient to check if the strings starts with the given
		// pattern such as "library/*", making any string check convenient.
		$pattern = str_replace('\*', '.*', $pattern).'\z';
		return (bool) preg_match('#^'.$pattern.'#', $value);
	}
	/**
	 * Return the length of the given string.
	 *
	 * @param  string  $value
	 * @return int
	 */
	public static function length($value) {
		return mb_strlen($value);
	}
	/**
	 * Limit the number of characters in a string.
	 *
	 * @param  string  $value
	 * @param  int     $limit
	 * @param  string  $end
	 * @return string
	 */
	public static function limit($value, $limit = 100, $end = '...') {
		if (mb_strlen($value) <= $limit) return $value;
		return rtrim(mb_substr($value, 0, $limit, 'UTF-8')).$end;
	}
	/**
	 * Convert the given string to lower-case.
	 *
	 * @param  string  $value
	 * @return string
	 */
	public static function lower($value) {
		return mb_strtolower($value);
	}
	/**
	 * Limit the number of words in a string.
	 *
	 * @param  string  $value
	 * @param  int     $words
	 * @param  string  $end
	 * @return string
	 */
	public static function words($value, $words = 100, $end = '...') {
		preg_match('/^\s*+(?:\S++\s*+){1,'.$words.'}/u', $value, $matches);
		if ( ! isset($matches[0]) || strlen($value) === strlen($matches[0])) return $value;
		return rtrim($matches[0]).$end;
	}
	/**
	 * Parse a Class@method style callback into class and method.
	 *
	 * @param  string  $callback
	 * @param  string  $default
	 * @return array
	 */
	public static function parseCallback($callback, $default) {
		return static::contains($callback, '@') ? explode('@', $callback, 2) : array($callback, $default);
	}

	/**
	 * Generate a more truly "random" alpha-numeric string.
	 *
	 * @param  int  $length
	 * @return string
	 *
	 * @throws \RuntimeException
	 */
	public static function random($length = 16) {
		if (function_exists('openssl_random_pseudo_bytes'))
		{
			$bytes = openssl_random_pseudo_bytes($length * 2);
			if ($bytes === false)
			{
				throw new \RuntimeException('Unable to generate random string.');
			}
			return substr(str_replace(array('/', '+', '='), '', base64_encode($bytes)), 0, $length);
		}
		return static::quickRandom($length);
	}
	/**
	 * Generate a "random" alpha-numeric string.
	 *
	 * Should not be considered sufficient for cryptography, etc.
	 *
	 * @param  int  $length
	 * @return string
	 */
	public static function quickRandom($length = 16) {
		$pool = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
		return substr(str_shuffle(str_repeat($pool, $length)), 0, $length);
	}
	/**
	 * Convert the given string to upper-case.
	 *
	 * @param  string  $value
	 * @return string
	 */
	public static function upper($value) {
		return mb_strtoupper($value);
	}
	/**
	 * Convert the given string to title case.
	 *
	 * @param  string  $value
	 * @return string
	 */
	public static function title($value) {
		return mb_convert_case($value, MB_CASE_TITLE, 'UTF-8');
	}
	/**
	 * Determine if a given string starts with a given substring.
	 *
	 * @param  string  $haystack
	 * @param  string|array  $needles
	 * @return bool
	 */
	public static function startsWith($haystack, $needles) {
		foreach ((array) $needles as $needle)
		{
			if ($needle != '' && strpos($haystack, $needle) === 0) return true;
		}
		return false;
	}

	/* get rid of that pesky BOM sequence */
	public static function BomSquad($value) {
	    $bom = pack('H*','EFBBBF');
	    return preg_replace("/^$bom/", '', $value);
	}

	public static function ConvertUTF8($str) {
	    // set default encode
	    mb_internal_encoding('UTF-8');

	    // pre filter
	    if (empty($str)) {
	        return $str;
	    }

	    $str = self::BomSquad($str);

	    // get charset
	    $charset = mb_detect_encoding($str, array('ISO-8859-1', 'UTF-8', 'ASCII'));

	    if (stristr($charset, 'utf') || stristr($charset, 'iso')) {
	        $str = iconv('ISO-8859-1', 'UTF-8//TRANSLIT', utf8_decode($str));
	    } else {
	        $str = mb_convert_encoding($str, 'UTF-8', 'UTF-8');
	    }

	    // remove BOM
	   $str = urldecode(str_replace("%C2%81", '', urlencode($str)));

	    // prepare string
	    return $str;
	}


}
