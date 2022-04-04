<?php
class Environment
{
    public static function get()
    {
	    return "production";
        // return (getenv('APPLICATION_ENV') ? getenv('APPLICATION_ENV') : "development");
    }

    public static function remoteIp()
    {
        return $_SERVER['REMOTE_ADDR'];
    }

    public static function NinjaValidator()
    {
        return (isset($_SERVER["HTTP_X_NINJAVALIDATOR"]));
    }

    public static function suffix()
    {
        return (getenv('DOMAIN_SUFFIX') ? getenv('DOMAIN_SUFFIX') : "");
    }

}
