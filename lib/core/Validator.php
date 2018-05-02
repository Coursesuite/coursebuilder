<?php

// namespace NinjaSuite;

const VERIFY_TLS = false;
const USERNAME = 'tokenuser';
const PASSWORD = 'GEv6mJ7wJgWR';
const APPINFO = 'https://www.coursesuite.ninja/store/info/coursebuildr/';
const VALIDATOR = 'https://www.coursesuite.ninja/api/validate/coursebuildr/{hash}/';

// TODO: write a better exception
// perhaps post a value back to coursesuite api so we get centralised logging
class ValidationException extends \Exception
{
    public function __construct($message, $code, $stack = null)
    {
        echo "<h1>Error $code</h1><p>$message</p>";
        echo "<p><a href='" . APPINFO . "'>" . APPINFO . "</a></p>";
        if (null !== $stack) {
            var_dump($stack);
        }
        exit; // no further output
    }
}

class Validator
{

    private static $factory;
    public static function Instance() {
        if (!self::$factory) {
            self::$factory = new Validator();
        }
        return self::$factory;
    }

    public function Validate($get) {

        $result = new \stdClass();
        $result->valid = false;

        $result->licence = new \stdClass();
        $result->licence->tier = 0;
        $result->licence->seats = 1;
        $result->licence->remaining = 1;

        $result->code = new \stdClass();
        $result->code->minified = true;
        $result->code->debug = false;

        $result->api = new \stdClass();
        $result->api->bearer = null;
        $result->api->publish = "";
        $result->api->header = new \stdClass();
        $result->api->header->html = null;
        $result->api->header->css = null;

        $result->user = new \stdClass();
        $result->user->container = "";
        $result->user->email = "";

        $result->app = new \stdClass();
        $result->app->addons = array();

        if (isset($get["hash"])) {
            try {
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, str_replace('{hash}', $get["hash"], VALIDATOR));
                curl_setopt($ch, CURLOPT_HTTPHEADER, array("X-NinjaValidator: true"));
                curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_DIGEST);
                curl_setopt($ch, CURLOPT_USERPWD, USERNAME . ":" . PASSWORD);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, VERIFY_TLS);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 30);
                // curl_setopt($ch, CURLOPT_HEADERFUNCTION, "self::debug");
                // echo "<li>" . str_replace('{hash}', $get["hash"], VALIDATOR) . "</li>";
                $resp = curl_exec($ch);
                if (curl_errno($ch)) {
                    throw new ValidationException(curl_error($ch), 500);
                }
                // validate HTTP status code (user/password credential issues)
                $status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                if ($status_code != 200) {
                    throw new ValidationException("Response with Status Code [" . $status_code . "].", $status_code);
                }
            } catch (Exception $ex) {
                throw new ValidationException('Unable to properly download file from url=['+$url+'] to path ['+$destination+'].', 500, $ex);
            } finally {
                if ($ch != null) {
                    curl_close($ch);
                }
            }
            $result = json_decode($resp);
        }
        $result->home = APPINFO;
        return $result;
    }

       private function debug($curl, $header_line)
        {
            echo "<li>$header_line</li>";
            return strlen($header_line);
        }
}