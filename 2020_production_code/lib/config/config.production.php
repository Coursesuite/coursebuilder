<?php
	
//error_reporting(E_ALL);
//ini_set("display_errors", 1);
//ini_set('session.cookie_httponly', 1);

$https = $_SERVER['HTTPS'];

// make sure we are on https otherwise things like cookies break
if (strtolower($https) === "off") {
	header("location: https://" . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME']));
}

$https = true;

return array(
    'URL' => ($https ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME']),
    'ROOTURL' => ($https ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'],
    'RELATIVEURL' => dirname($_SERVER['SCRIPT_NAME']),
    'PATH_ROOT' => realpath(dirname(__FILE__) . '../../../'),
	'PATH_CONTROLLER' => realpath(dirname(__FILE__) . '../../') . '/controller/',
	'PATH_VIEW' => realpath(dirname(__FILE__) . '../../') . '/view/',
    'PATH_TOURS' => realpath(dirname(__FILE__) . '/../../') . '/phpapp/js/tour/',
    'PATH_CSS' => realpath(dirname(__FILE__) . '/../../') . '/phpapp/css/',
    'PATH_CACHE' => realpath(dirname(__FILE__) . '/../') . '/cache/',
    'PATH_COURSE_TEMPLATES' => realpath(dirname(__FILE__) . '/../') . '/templates/courses/',
    'PATH_CONTAINERS' => realpath(dirname(__FILE__) . '/../../') . '/courses/',
    'PATH_IIS_TEMP' => 'c:\\inetpub\\temp\\tardproof_temp\\',
    'DB_TYPE' => 'mysql',
    'DB_HOST' => '127.0.0.1',
    'DB_NAME' => 'coursebuilder',
    'DB_USER' => 'coursebuilder',
    'DB_PASS' => 'T3#fh*&^vf^g3FC',
    'DB_PORT' => '23306',
    'DB_CHARSET' => 'utf8',
    'FORCE_HANDLEBARS_COMPILATION' => true,
    'ENCRYPTION_KEY' => 'gQTwyP#HpXWS%5cWjMT#yUzT!UAN',
    'HMAC_SALT' => 'SP27uVe^zujNW9apqg#kaqA(BAx',
	'DEFAULT_CONTROLLER' => 'index',
	'DEFAULT_ACTION' => 'index',
	'APPLICATION_TITLE' => 'CourseBuilder',
	'APPLICATION_DESCRIPTION' => 'a scorm course building tool that lets you author, previous and publish course packages',
);