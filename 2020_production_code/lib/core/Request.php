<?php

class Request
{
    public static function post($key, $clean = false, $filter = null, $default = "")
    {
	    $result = $default;
        if (isset($_POST[$key])) {
            if ($filter !== null) {
                $value = filter_input(INPUT_POST, $key, $filter);
            } else {
                $value = $_POST[$key];
            }
            $result = ($clean) ? trim(strip_tags($value)) : $value;
        }
        return $result;
    }

    public static function post_debug()
    {
        return print_r($_POST, true);
    }

    public static function postCheckbox($key)
    {
        return isset($_POST[$key]) ? 1 : null;
    }

    public static function get($key, $filter = null)
    {
        if (isset($_GET[$key])) {
            if ($filter !== null) {
                return filter_input(INPUT_GET, $key, $filter);
            }
            return $_GET[$key];
        }
    }

    public static function exists($key)
    {
        return (isset($_GET[$key]) || isset($_POST[$key]));
    }

    public static function real_get($key)
    {
        if (isset($_GET[$key])) {
            $raw = str_replace(' ', '+', $_GET[$key]); // space is supposed to be plus
            return $raw;
        }
    }

    public static function cookie($key)
    {
        if (isset($_COOKIE[$key])) {
            return $_COOKIE[$key];
        }
    }
}
