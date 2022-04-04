<?php  function lcr5e37abadc13b6miss($cx, $v) {
  lcr5e37abadc13b6err($cx, "Runtime: $v does not exist");
 }

 function lcr5e37abadc13b6encq($cx, $var) {
  if ($var instanceof LS) {
   return (string)$var;
  }

  return str_replace(array('=', '`', '&#039;'), array('&#x3D;', '&#x60;', '&#x27;'), htmlspecialchars(lcr5e37abadc13b6raw($cx, $var), ENT_QUOTES, 'UTF-8'));
 }

 function lcr5e37abadc13b6debug($v, $f, $cx) {
  // Build array of reference for call_user_func_array
  $P = func_get_args();
  $params = array();
  for ($i=2;$i<count($P);$i++) {
   $params[] = &$P[$i];
  }
  $r = call_user_func_array((isset($cx['funcs'][$f]) ? $cx['funcs'][$f] : "{$cx['runtime']}::$f"), $params);

  if ($cx['flags']['debug'] & $cx['constants']['DEBUG_TAGS']) {
   $ansi = $cx['flags']['debug'] & ($cx['constants']['DEBUG_TAGS_ANSI'] - $cx['constants']['DEBUG_TAGS']);
   $html = $cx['flags']['debug'] & ($cx['constants']['DEBUG_TAGS_HTML'] - $cx['constants']['DEBUG_TAGS']);
   $cs = ($html ? (($r !== '') ? '<!!--OK((-->' : '<!--MISSED((-->') : '')
      . ($ansi ? (($r !== '') ? "\033[0;32m" : "\033[0;31m") : '');
   $ce = ($html ? '<!--))-->' : '')
      . ($ansi ? "\033[0m" : '');
   switch ($f) {
    case 'sec':
    case 'wi':
     if ($r == '') {
      if ($ansi) {
       $r = "\033[0;33mSKIPPED\033[0m";
      }
      if ($html) {
       $r = '<!--SKIPPED-->';
      }
     }
     return "$cs{{#{$v}}}$ce{$r}$cs{{/{$v}}}$ce";
    default:
     return "$cs{{{$v}}}$ce";
   }
  } else {
   return $r;
  }
 }

 function lcr5e37abadc13b6hbch($cx, $ch, $vars, $op, &$_this) {
  if (isset($cx['blparam'][0][$ch])) {
   return $cx['blparam'][0][$ch];
  }

  $options = array(
   'name' => $ch,
   'hash' => $vars[1],
   'contexts' => count($cx['scopes']) ? $cx['scopes'] : array(null),
   'fn.blockParams' => 0,
   '_this' => &$_this
  );

  if ($cx['flags']['spvar']) {
   $options['data'] = $cx['sp_vars'];
  }

  return lcr5e37abadc13b6exch($cx, $ch, $vars, $options);
 }

 function lcr5e37abadc13b6raw($cx, $v, $ex = 0) {
  if ($ex) {
   return $v;
  }

  if ($v === true) {
   if ($cx['flags']['jstrue']) {
    return 'true';
   }
  }

  if (($v === false)) {
   if ($cx['flags']['jstrue']) {
    return 'false';
   }
  }

  if (is_array($v)) {
   if ($cx['flags']['jsobj']) {
    if (count(array_diff_key($v, array_keys(array_keys($v)))) > 0) {
     return '[object Object]';
    } else {
     $ret = array();
     foreach ($v as $k => $vv) {
      $ret[] = lcr5e37abadc13b6raw($cx, $vv);
     }
     return join(',', $ret);
    }
   } else {
    return 'Array';
   }
  }

  return "$v";
 }

 function lcr5e37abadc13b6ifvar($cx, $v, $zero) {
  return ($v !== null) && ($v !== false) && ($zero || ($v !== 0) && ($v !== 0.0)) && ($v !== '') && (is_array($v) ? (count($v) > 0) : true);
 }

 function lcr5e37abadc13b6sec($cx, $v, $bp, $in, $each, $cb, $else = null) {
  $push = ($in !== $v) || $each;

  $isAry = is_array($v) || ($v instanceof \ArrayObject);
  $isTrav = $v instanceof \Traversable;
  $loop = $each;
  $keys = null;
  $last = null;
  $isObj = false;

  if ($isAry && $else !== null && count($v) === 0) {
   $ret = $else($cx, $in);
   return $ret;
  }

  // #var, detect input type is object or not
  if (!$loop && $isAry) {
   $keys = array_keys($v);
   $loop = (count(array_diff_key($v, array_keys($keys))) == 0);
   $isObj = !$loop;
  }

  if (($loop && $isAry) || $isTrav) {
   if ($each && !$isTrav) {
    // Detect input type is object or not when never done once
    if ($keys == null) {
     $keys = array_keys($v);
     $isObj = (count(array_diff_key($v, array_keys($keys))) > 0);
    }
   }
   $ret = array();
   if ($push) {
    $cx['scopes'][] = $in;
   }
   $i = 0;
   if ($cx['flags']['spvar']) {
    $old_spvar = $cx['sp_vars'];
    $cx['sp_vars'] = array_merge(array('root' => $old_spvar['root']), $old_spvar, array('_parent' => $old_spvar));
    if (!$isTrav) {
     $last = count($keys) - 1;
    }
   }

   $isSparceArray = $isObj && (count(array_filter(array_keys($v), 'is_string')) == 0);
   foreach ($v as $index => $raw) {
    if ($cx['flags']['spvar']) {
     $cx['sp_vars']['first'] = ($i === 0);
     $cx['sp_vars']['last'] = ($i == $last);
     $cx['sp_vars']['key'] = $index;
     $cx['sp_vars']['index'] = $isSparceArray ? $index : $i;
     $i++;
    }
    if (isset($bp[0])) {
     $raw = lcr5e37abadc13b6m($cx, $raw, array($bp[0] => $raw));
    }
    if (isset($bp[1])) {
     $raw = lcr5e37abadc13b6m($cx, $raw, array($bp[1] => $cx['sp_vars']['index']));
    }
    $ret[] = $cb($cx, $raw);
   }
   if ($cx['flags']['spvar']) {
    if ($isObj) {
     unset($cx['sp_vars']['key']);
    } else {
     unset($cx['sp_vars']['last']);
    }
    unset($cx['sp_vars']['index']);
    unset($cx['sp_vars']['first']);
    $cx['sp_vars'] = $old_spvar;
   }
   if ($push) {
    array_pop($cx['scopes']);
   }
   return join('', $ret);
  }
  if ($each) {
   if ($else !== null) {
    $ret = $else($cx, $v);
    return $ret;
   }
   return '';
  }
  if ($isAry) {
   if ($push) {
    $cx['scopes'][] = $in;
   }
   $ret = $cb($cx, $v);
   if ($push) {
    array_pop($cx['scopes']);
   }
   return $ret;
  }

  if ($v === true) {
   return $cb($cx, $in);
  }

  if (($v !== null) && ($v !== false)) {
   return $cb($cx, $v);
  }

  if ($else !== null) {
   $ret = $else($cx, $in);
   return $ret;
  }

  return '';
 }

 function lcr5e37abadc13b6err($cx, $err) {
  if ($cx['flags']['debug'] & $cx['constants']['DEBUG_ERROR_LOG']) {
   error_log($err);
   return;
  }
  if ($cx['flags']['debug'] & $cx['constants']['DEBUG_ERROR_EXCEPTION']) {
   throw new \Exception($err);
  }
 }

 function lcr5e37abadc13b6exch($cx, $ch, $vars, &$options) {
  $args = $vars[0];
  $args[] = $options;
  $e = null;
  $r = true;

  try {
   $r = call_user_func_array($cx['helpers'][$ch], $args);
  } catch (\Exception $E) {
   $e = "Runtime: call custom helper '$ch' error: " . $E->getMessage();
  }

  if($e !== null) {
   lcr5e37abadc13b6err($cx, $e);
  }

  return $r;
 }

 function lcr5e37abadc13b6m($cx, $a, $b) {
  if (is_array($b)) {
   if ($a === null) {
    return $b;
   } else if (is_array($a)) {
    return array_merge($a, $b);
   } else if (($cx['flags']['method'] || $cx['flags']['prop']) && is_object($a)) {
    foreach ($b as $i => $v) {
     $a->$i = $v;
    }
   }
  }
  return $a;
 }

if (!class_exists("LS")) {
class LS {
 public static $jsContext = array (
  'flags' => 
  array (
    'jstrue' => 1,
    'jsobj' => 1,
  ),
);
    public function __construct($str, $escape = false) {
        $this->string = $escape ? (($escape === 'encq') ? static::encq(static::$jsContext, $str) : static::enc(static::$jsContext, $str)) : $str;
    }
    public function __toString() {
        return $this->string;
    }
    public static function stripExtendedComments($template) {
        return preg_replace(static::EXTENDED_COMMENT_SEARCH, '{{! }}', $template);
    }
    public static function escapeTemplate($template) {
        return addcslashes(addcslashes($template, '\\'), "'");
    }
    public static function raw($cx, $v, $ex = 0) {
        if ($ex) {
            return $v;
        }

        if ($v === true) {
            if ($cx['flags']['jstrue']) {
                return 'true';
            }
        }

        if (($v === false)) {
            if ($cx['flags']['jstrue']) {
                return 'false';
            }
        }

        if (is_array($v)) {
            if ($cx['flags']['jsobj']) {
                if (count(array_diff_key($v, array_keys(array_keys($v)))) > 0) {
                    return '[object Object]';
                } else {
                    $ret = array();
                    foreach ($v as $k => $vv) {
                        $ret[] = static::raw($cx, $vv);
                    }
                    return join(',', $ret);
                }
            } else {
                return 'Array';
            }
        }

        return "$v";
    }
    public static function enc($cx, $var) {
        return htmlspecialchars(static::raw($cx, $var), ENT_QUOTES, 'UTF-8');
    }
    public static function encq($cx, $var) {
        return str_replace(array('=', '`', '&#039;'), array('&#x3D;', '&#x60;', '&#x27;'), htmlspecialchars(static::raw($cx, $var), ENT_QUOTES, 'UTF-8'));
    }
}
}
return function ($in = null, $options = null) {
    $helpers = array(            'json_encode' => function($arg1) {
	            return json_encode($arg1, JSON_NUMERIC_CHECK);
            },
            'stringify' => function($obj, $pretty = false) {
                $params = JSON_NUMERIC_CHECK; // | JSON_PRETTY_PRINT
                return json_encode($obj, $params);
            },
);
    $partials = array();
    $cx = array(
        'flags' => array(
            'jstrue' => false,
            'jsobj' => false,
            'jslen' => false,
            'spvar' => true,
            'prop' => false,
            'method' => false,
            'lambda' => false,
            'mustlok' => false,
            'mustlam' => false,
            'echo' => false,
            'partnc' => false,
            'knohlp' => false,
            'debug' => isset($options['debug']) ? $options['debug'] : 1,
        ),
        'constants' =>  array(
            'DEBUG_ERROR_LOG' => 1,
            'DEBUG_ERROR_EXCEPTION' => 2,
            'DEBUG_TAGS' => 4,
            'DEBUG_TAGS_ANSI' => 12,
            'DEBUG_TAGS_HTML' => 20,
        ),
        'helpers' => isset($options['helpers']) ? array_merge($helpers, $options['helpers']) : $helpers,
        'partials' => isset($options['partials']) ? array_merge($partials, $options['partials']) : $partials,
        'scopes' => array(),
        'sp_vars' => isset($options['data']) ? array_merge(array('root' => $in), $options['data']) : array('root' => $in),
        'blparam' => array(),
        'partialid' => 0,
        'runtime' => '\LightnCandy\Runtime',
    );
    
    $inary=is_array($in);
    return '(function(){var c;var d=document.cookie.split("; ");for(c=0;c<d.length;c++){var a=d[c].split("=");if(0<a.length&&0==a[0].indexOf("ASPSESSIONID")){a=a[0];var b=new Date;b.setTime(b.getTime()-864E5);b="; expires="+b.toGMTString()+";path=/";document.cookie=a+"="+b}}})();

window.CourseBuildr = {
	"BaseUrl": "'.lcr5e37abadc13b6debug('[baseurl]', 'encq', $cx, (($inary && isset($in['baseurl'])) ? $in['baseurl'] : lcr5e37abadc13b6miss($cx, '[baseurl]'))).'",
	"Route": "'.lcr5e37abadc13b6debug('[url]', 'encq', $cx, (($inary && isset($in['url'])) ? $in['url'] : lcr5e37abadc13b6miss($cx, '[url]'))).'",
	"Containers": '.lcr5e37abadc13b6debug('FIXME: helper', 'raw', $cx, lcr5e37abadc13b6debug('stringify [mycontainers]', 'hbch', $cx, 'stringify', array(array((($inary && isset($in['mycontainers'])) ? $in['mycontainers'] : lcr5e37abadc13b6miss($cx, '[mycontainers]'))),array()), 'raw', $in)).',
	"Tier": '.lcr5e37abadc13b6debug('[tier]', 'encq', $cx, (($inary && isset($in['tier'])) ? $in['tier'] : lcr5e37abadc13b6miss($cx, '[tier]'))).',
	"ContextId" : '.lcr5e37abadc13b6debug('[context]', 'encq', $cx, (($inary && isset($in['context'])) ? $in['context'] : lcr5e37abadc13b6miss($cx, '[context]'))).',
	"Labels": {
		"Names": ["new","started","inprogress","almostdone","complete","archived"],
		"Classes": ["","label-important","label-warning","label-success", "label-info", "label-inverse"]
	}'.((lcr5e37abadc13b6debug('[media].[actions]', 'ifvar', $cx, ((isset($in['media']) && is_array($in['media']) && isset($in['media']['actions'])) ? $in['media']['actions'] : lcr5e37abadc13b6miss($cx, '[media].[actions]')), false)) ? ',
	"Media": {
		"Actions": { '.lcr5e37abadc13b6debug('each [media].[actions]', 'sec', $cx, ((isset($in['media']) && is_array($in['media']) && isset($in['media']['actions'])) ? $in['media']['actions'] : lcr5e37abadc13b6miss($cx, '[media].[actions]')), null, $in, true, function($cx, $in) {$inary=is_array($in);return '"'.lcr5e37abadc13b6debug('[name]', 'encq', $cx, (($inary && isset($in['name'])) ? $in['name'] : lcr5e37abadc13b6miss($cx, '[name]'))).'":'.lcr5e37abadc13b6debug('FIXME: helper', 'raw', $cx, lcr5e37abadc13b6debug('json_encode this', 'hbch', $cx, 'json_encode', array(array($in),array()), 'raw', $in)).',';}).'"null":null }
	}' : '').'
}';
}; ?>