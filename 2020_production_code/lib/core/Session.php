<?php
class Session
{
	
	private static $account;
	
	public static function init()
	{
		if (session_id() == '') {
			session_start();
		}
	}

	public static function CurrentId()
	{
		return session_id();
	}

	public static function set($key, $value)
	{
		$_SESSION[$key] = $value;
	}

	public static function remove($key)
	{
		if (isset($_SESSION[$key])) {
			unset($_SESSION[$key]);
		}
	}
	public static function get($key)
	{
		if (isset($_SESSION[$key])) {
			$value = $_SESSION[$key];
			// filter the value for XSS vulnerabilities
			return Filter::XSSFilter($value);
		}
	}
	public static function add($key, $value)
	{
		$ar = $_SESSION[$key];
		if (is_array($ar)) {
			if (!in_array($value, $ar)) {
				$_SESSION[$key][] = $value;
			}
		} else {
			$_SESSION[$key][] = $value;
		}
	}

	public static function destroy()
	{
		session_destroy();
	}

	public static function CurrentUserId()
	{
		return (int) self::get("user_id");
	}
	
	public static function User() {
		if (!self::$account && self::CurrentUserId() > 0) {
			self::$account = new AccountModel(self::CurrentUserId());
		}
		return self::$account;
	}

	public static function CurrentTier()
	{
		if (!self::User()) return 0;
		if (self::User()->container == "*") return 99;
		return self::User()->tier;
	}

	public static function isAdmin() {
		if (!self::User()) return false;
		return (self::User()->container == "*");
	}
	
}
