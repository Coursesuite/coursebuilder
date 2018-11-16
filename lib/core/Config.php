<?php

class Config
{
    public static $config;

    // load the config.[env].php and return a keys value
    public static function get($key)
    {
        if (!self::$config) {
            $config_file = dirname(dirname(__FILE__)) . '/config/config.' . Environment::get() . '.php';
            if (!file_exists($config_file)) {
                return false;
            }
            self::$config = require $config_file;
        }
        return self::$config[$key];
    }

    // load and return the contents of a resource file in the config folder
    public static function resource($filename) {
        $p = dirname(dirname(__FILE__)) . '/config/' . $filename;
        if (file_exists($p)) return file_get_contents($p);
        return null;
    }

}
