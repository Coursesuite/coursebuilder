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

    // when you want to grab what is going to be a row id, use rowint("key", default)
    public static function rowint($key, $default = 0) {
        $range = ['options'=>['min-range'=>1,'max-range'=>4294967295]];
        $result = filter_input(INPUT_POST, $key, FILTER_VALIDATE_INT, $range);
        if ($result === false || $result === null) $result = $default;
        return $result;
    }

    // when you want a boolean post value that might be yes true 1 no false 0
    public static function boolval($key, $default = false) {
        $result = filter_input(INPUT_POST, $key, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        if ($result === null) $result = $default;
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

    public static function cookie($key, $filter = true)
    {
        if (isset($_COOKIE[$key])) {
            if ($filter) {
                return Filter::XSSFilter($_COOKIE[$key]);
            } else {
                return $_COOKIE[$key];
            }
        }
    }

    public static function method() {
        return strtoupper($_SERVER['REQUEST_METHOD']);
    }
}
