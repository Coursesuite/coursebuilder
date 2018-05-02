<?php

error_reporting(E_ALL);
ini_set("display_errors", 1);
ini_set('session.cookie_httponly', 1);

// $https = $_SERVER['HTTPS'];

$https = false;

$lib = realpath(dirname(__FILE__) . '/../');
$base = realpath(dirname(__FILE__) . '/../../');

return array(
    'URL' => ($https ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME']),
    'ROOTURL' => ($https ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'],
    'RELATIVEURL' => dirname($_SERVER['SCRIPT_NAME']),

    'BASE' => $base,
    'LIB' => $lib,

    'PATH_ROOT' => realpath(dirname(__FILE__) . '/../../../'),
	'PATH_CONTROLLER' => $lib . '/controller/',
	'PATH_VIEW' => $lib . '/view/',
    'PATH_CACHE' => $lib . '/cache/',
    'PATH_COURSE_TEMPLATES' => $lib . '/templates/courses/',

    'PATH_TOURS' => $base . '/phpapp/js/tour/',
    'PATH_CSS' => $base . '/phpapp/css/',
    'PATH_CONTAINERS' => $base . '/user_content/',
    'PATH_IIS_TEMP' => 'c:/inetpub/temp/tardproof_temp/',
    'PATH_REAL_WEBROOT' => $base . '/phpapp',

    'DB_TYPE' => 'mysql',
    'DB_HOST' => '127.0.0.1',
    'DB_NAME' => 'devbuildr',
    'DB_USER' => 'coursebuilder',
    'DB_PASS' => 'T3#fh*&^vf^g3FC',
    'DB_PORT' => '3306',
    'DB_CHARSET' => 'utf8',
    'FORCE_HANDLEBARS_COMPILATION' => true,
    'ENCRYPTION_KEY' => 'gQTwyP#HpXWS%5cWjMT#yUzT!UAN',
    'HMAC_SALT' => 'SP27uVe^zujNW9apqg#kaqA(BAx',
	'DEFAULT_CONTROLLER' => 'index',
	'DEFAULT_ACTION' => 'index',
	'APPLICATION_TITLE' => 'CourseBuilder for PHP',
	'APPLICATION_DESCRIPTION' => 'The coursebuilder lets you make scorm courses that are adaptive and interesting',
);