<?php  function lcr5d6e14726c342miss($cx, $v) {
  lcr5d6e14726c342err($cx, "Runtime: $v does not exist");
 }

 function lcr5d6e14726c342sec($cx, $v, $bp, $in, $each, $cb, $else = null) {
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
     $raw = lcr5d6e14726c342m($cx, $raw, array($bp[0] => $raw));
    }
    if (isset($bp[1])) {
     $raw = lcr5d6e14726c342m($cx, $raw, array($bp[1] => $cx['sp_vars']['index']));
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

 function lcr5d6e14726c342debug($v, $f, $cx) {
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

 function lcr5d6e14726c342hbch($cx, $ch, $vars, $op, &$_this) {
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

  return lcr5d6e14726c342exch($cx, $ch, $vars, $options);
 }

 function lcr5d6e14726c342encq($cx, $var) {
  if ($var instanceof LS) {
   return (string)$var;
  }

  return str_replace(array('=', '`', '&#039;'), array('&#x3D;', '&#x60;', '&#x27;'), htmlspecialchars(lcr5d6e14726c342raw($cx, $var), ENT_QUOTES, 'UTF-8'));
 }

 function lcr5d6e14726c342err($cx, $err) {
  if ($cx['flags']['debug'] & $cx['constants']['DEBUG_ERROR_LOG']) {
   error_log($err);
   return;
  }
  if ($cx['flags']['debug'] & $cx['constants']['DEBUG_ERROR_EXCEPTION']) {
   throw new \Exception($err);
  }
 }

 function lcr5d6e14726c342m($cx, $a, $b) {
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

 function lcr5d6e14726c342exch($cx, $ch, $vars, &$options) {
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
   lcr5d6e14726c342err($cx, $e);
  }

  return $r;
 }

 function lcr5d6e14726c342raw($cx, $v, $ex = 0) {
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
      $ret[] = lcr5d6e14726c342raw($cx, $vv);
     }
     return join(',', $ret);
    }
   } else {
    return 'Array';
   }
  }

  return "$v";
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
    $helpers = array(            'thumbnail' => function($path, $width) {
            	return Config::get("URL") . "/image/thumb/" . Text::base64_urlencode($path) . "/$width";
            },
            'concat' => function($left, $right) {
	            return $left . $right;
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
    return '<form method="POST" class="mdc-data-table">
<table class="mdc-data-table__table media-caption-table" aria-label="Image caption editor">
<thead>
	<tr class="mdc-data-table__header-row">
		<th class="mdc-data-table__header-cell" role="columnheader" scope="col">Image</th>
		<th class="mdc-data-table__header-cell" role="columnheader" scope="col">Alt</th>
		<th class="mdc-data-table__header-cell" role="columnheader" scope="col">Caption</th>
	</tr>
</thead>
<tbody class="mdc-data-table__content">
'.lcr5d6e14726c342debug('each [captions]', 'sec', $cx, (($inary && isset($in['captions'])) ? $in['captions'] : lcr5d6e14726c342miss($cx, '[captions]')), null, $in, true, function($cx, $in) {$inary=is_array($in);return '<tr class="mdc-data-table__row">
	<td class="mdc-data-table__cell"><img src="'.lcr5d6e14726c342debug('FIXME: helper', 'encq', $cx, lcr5d6e14726c342debug('thumbnail FIXME: $subExpression 150', 'hbch', $cx, 'thumbnail', array(array(lcr5d6e14726c342debug('concat ../[path] @[key]', 'hbch', $cx, 'concat', array(array(((isset($cx['scopes'][count($cx['scopes'])-1]) && is_array($cx['scopes'][count($cx['scopes'])-1]) && isset($cx['scopes'][count($cx['scopes'])-1]['path'])) ? $cx['scopes'][count($cx['scopes'])-1]['path'] : lcr5d6e14726c342miss($cx, '../[path]')),(isset($cx['sp_vars']['key']) ? $cx['sp_vars']['key'] : lcr5d6e14726c342miss($cx, '@[key]'))),array()), 'raw', $in),150),array()), 'encq', $in)).'"></td>
	<td class="mdc-data-table__cell"><input type=\'hidden\' name=\'src[]\' value=\''.lcr5d6e14726c342debug('@[key]', 'encq', $cx, (isset($cx['sp_vars']['key']) ? $cx['sp_vars']['key'] : lcr5d6e14726c342miss($cx, '@[key]'))).'\'><input type=\'text\' name=\'alt[]\' value=\''.lcr5d6e14726c342debug('[alt]', 'encq', $cx, (($inary && isset($in['alt'])) ? $in['alt'] : lcr5d6e14726c342miss($cx, '[alt]'))).'\'></td>
	<td class="mdc-data-table__cell"><textarea name=\'caption[]\' rows=\'5\' cols=\'40\'>'.lcr5d6e14726c342debug('[caption]', 'encq', $cx, (($inary && isset($in['caption'])) ? $in['caption'] : lcr5d6e14726c342miss($cx, '[caption]'))).'</textarea></td>
</tr>
';}).'</tbody>
<tfoot class="mdc-data-table__footer>
<tr class="mdc-data-table__row">
	<th><input type="submit" value="Save" class="btn btn-primary"></th>
</tr>
</table>
</form>';
}; ?>