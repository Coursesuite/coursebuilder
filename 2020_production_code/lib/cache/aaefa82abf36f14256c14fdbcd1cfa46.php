<?php  function lcr5e37abad71f32hbbch($cx, $ch, $vars, &$_this, $inverted, $cb, $else = null) {
  $options = array(
   'name' => $ch,
   'hash' => $vars[1],
   'contexts' => count($cx['scopes']) ? $cx['scopes'] : array(null),
   'fn.blockParams' => 0,
   '_this' => &$_this,
  );

  if ($cx['flags']['spvar']) {
   $options['data'] = $cx['sp_vars'];
  }

  if (isset($vars[2])) {
   $options['fn.blockParams'] = count($vars[2]);
  }

  // $invert the logic
  if ($inverted) {
   $tmp = $else;
   $else = $cb;
   $cb = $tmp;
  }

  $options['fn'] = function ($context = '_NO_INPUT_HERE_', $data = null) use ($cx, &$_this, $cb, $options, $vars) {
   if ($cx['flags']['echo']) {
    ob_start();
   }
   if (isset($data['data'])) {
    $old_spvar = $cx['sp_vars'];
    $cx['sp_vars'] = array_merge(array('root' => $old_spvar['root']), $data['data'], array('_parent' => $old_spvar));
   }
   $ex = false;
   if (isset($data['blockParams']) && isset($vars[2])) {
    $ex = array_combine($vars[2], array_slice($data['blockParams'], 0, count($vars[2])));
    array_unshift($cx['blparam'], $ex);
   } else if (isset($cx['blparam'][0])) {
    $ex = $cx['blparam'][0];
   }
   if (($context === '_NO_INPUT_HERE_') || ($context === $_this)) {
    $ret = $cb($cx, is_array($ex) ? lcr5e37abad71f32m($cx, $_this, $ex) : $_this);
   } else {
    $cx['scopes'][] = $_this;
    $ret = $cb($cx, is_array($ex) ? lcr5e37abad71f32m($cx, $context, $ex) : $context);
    array_pop($cx['scopes']);
   }
   if (isset($data['data'])) {
    $cx['sp_vars'] = $old_spvar;
   }
   return $cx['flags']['echo'] ? ob_get_clean() : $ret;
  };

  if ($else) {
   $options['inverse'] = function ($context = '_NO_INPUT_HERE_') use ($cx, $_this, $else) {
    if ($cx['flags']['echo']) {
     ob_start();
    }
    if ($context === '_NO_INPUT_HERE_') {
     $ret = $else($cx, $_this);
    } else {
     $cx['scopes'][] = $_this;
     $ret = $else($cx, $context);
     array_pop($cx['scopes']);
    }
    return $cx['flags']['echo'] ? ob_get_clean() : $ret;
   };
  } else {
   $options['inverse'] = function () {
    return '';
   };
  }

  return lcr5e37abad71f32exch($cx, $ch, $vars, $options);
 }

 function lcr5e37abad71f32debug($v, $f, $cx) {
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

 function lcr5e37abad71f32miss($cx, $v) {
  lcr5e37abad71f32err($cx, "Runtime: $v does not exist");
 }

 function lcr5e37abad71f32sec($cx, $v, $bp, $in, $each, $cb, $else = null) {
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
     $raw = lcr5e37abad71f32m($cx, $raw, array($bp[0] => $raw));
    }
    if (isset($bp[1])) {
     $raw = lcr5e37abad71f32m($cx, $raw, array($bp[1] => $cx['sp_vars']['index']));
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

 function lcr5e37abad71f32encq($cx, $var) {
  if ($var instanceof LS) {
   return (string)$var;
  }

  return str_replace(array('=', '`', '&#039;'), array('&#x3D;', '&#x60;', '&#x27;'), htmlspecialchars(lcr5e37abad71f32raw($cx, $var), ENT_QUOTES, 'UTF-8'));
 }

 function lcr5e37abad71f32m($cx, $a, $b) {
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

 function lcr5e37abad71f32exch($cx, $ch, $vars, &$options) {
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
   lcr5e37abad71f32err($cx, $e);
  }

  return $r;
 }

 function lcr5e37abad71f32err($cx, $err) {
  if ($cx['flags']['debug'] & $cx['constants']['DEBUG_ERROR_LOG']) {
   error_log($err);
   return;
  }
  if ($cx['flags']['debug'] & $cx['constants']['DEBUG_ERROR_EXCEPTION']) {
   throw new \Exception($err);
  }
 }

 function lcr5e37abad71f32raw($cx, $v, $ex = 0) {
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
      $ret[] = lcr5e37abad71f32raw($cx, $vv);
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
    $helpers = array(            'equals' => function($arg1, $arg2, $options) {
                if (strcasecmp((string) $arg1, (string) $arg2) == 0) {
                    return $options['fn']();
                } else if (isset($options['inverse'])) {
                    return $options['inverse']();
                }
            },
            'admins' => function($options) {
	            if (Session::isAdmin()) {
		            return $options['fn']();
	            } elseif (isset($options['inverse'])) {
		            return $options['inverse']();
	            }
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
    return ''.'        <div class="navbar navbar-inverse navbar-fixed-top">
            <div class="navbar-inner">
                <div class="container-fluid">
                    <a class="brand" href="/"><img src="/css/coursesuite.svg" width="30" height="30" title="another CourseSuite app">
                    <span>CourseBuilder</span> Ninja
                    <div class="watchin"><div class="eyeball"><div class="iris"></div></div><div class="eyeball"><div class="iris"></div></div></div>
                    </a>
                    <div id="auth-interactions" class="pull-right">
'.'<div id="word-adder">
	<div class="input-append">
	  <input class="input-large" id="appendedInputButton" type="text" placeholder="Add new words...">
	  <button class="btn" type="button" id="addAWord">Add \'em</button>
	  <button class="btn btn-inverse" type="button" id="randomiseXY">Shuffle!</button>
	</div>
</div>
<button id="magnet-toggle" class="btn btn-mini btn-inverse">Fridge magnets are off!</button>
'.''.lcr5e37abad71f32debug('^', 'hbbch', $cx, 'admins', array(array(),array()), $in, false, function($cx, $in) {$inary=is_array($in);return '		<a target="_self" class="btn btn-info btn-small" href="/engine/pages/index/bmj.asp" title="BMJ Converter">BMJ Converter</a>
		<a class="btn btn-warning btn-small" href="/engine/pages/convert/"><i class="icon-stethoscope"></i> Elsevier converter</a>
';}).'		<a class="btn btn-small" href="/app/login/logout/">Log Out</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
'.''.'<header class=\'template-header\'>
<div class=\'centering\'>
<div class=\'hinting\'><h1>Start a new course</h1><h2>Drag here to upload</h2></div>
<div class=\'icons\'>
'.lcr5e37abad71f32debug('each [templates]', 'sec', $cx, (($inary && isset($in['templates'])) ? $in['templates'] : lcr5e37abad71f32miss($cx, '[templates]')), null, $in, true, function($cx, $in) {$inary=is_array($in);return '	<figure>
		<a href=\'#'.lcr5e37abad71f32debug('[name]', 'encq', $cx, (($inary && isset($in['name'])) ? $in['name'] : lcr5e37abad71f32miss($cx, '[name]'))).'\'><img src=\''.lcr5e37abad71f32debug('[icon]', 'encq', $cx, (($inary && isset($in['icon'])) ? $in['icon'] : lcr5e37abad71f32miss($cx, '[icon]'))).'\'></a>
		<figcaption><a href=\'#'.lcr5e37abad71f32debug('[name]', 'encq', $cx, (($inary && isset($in['name'])) ? $in['name'] : lcr5e37abad71f32miss($cx, '[name]'))).'\'>'.lcr5e37abad71f32debug('[name]', 'encq', $cx, (($inary && isset($in['name'])) ? $in['name'] : lcr5e37abad71f32miss($cx, '[name]'))).'</a></figcaption>
	</figure>
';}).'</div>
</div></header>'.''.'<header class=\'search-header\'><form method="post">
<div class=\'search-container\'>
<i class=\'fa fa-search\' aria-hidden=\'true\'></i><input type=\'text\' value=\''.lcr5e37abad71f32debug('[search].[value]', 'encq', $cx, ((isset($in['search']) && is_array($in['search']) && isset($in['search']['value'])) ? $in['search']['value'] : lcr5e37abad71f32miss($cx, '[search].[value]'))).'\' id=\'search\' title=\'Search courses\'>
<a href=\'javascript:;\' id=\'clear-search\' class=\'fa fa-times-circle\' aria-hidden=\'true\'></a>
</div>
'.lcr5e37abad71f32debug('^', 'hbbch', $cx, 'admins', array(array(),array()), $in, false, function($cx, $in) {$inary=is_array($in);return '	<div class=\'search-options\'>
'.lcr5e37abad71f32debug('^[search].[archive] show', 'hbbch', $cx, 'equals', array(array(((isset($in['search']) && is_array($in['search']) && isset($in['search']['archive'])) ? $in['search']['archive'] : lcr5e37abad71f32miss($cx, '[search].[archive]')),'show'),array()), $in, false, function($cx, $in) {$inary=is_array($in);return '		<a href=\''.lcr5e37abad71f32debug('[url]', 'encq', $cx, (($inary && isset($in['url'])) ? $in['url'] : lcr5e37abad71f32miss($cx, '[url]'))).'/index/search/archive/hide\' title=\'Courses in Archive container are shown; click to hide\' class=\'on\'><i class=\'fa fa-toggle-on\'></i> Archived</a> 
';}, function($cx, $in) {$inary=is_array($in);return '		<a href=\''.lcr5e37abad71f32debug('[url]', 'encq', $cx, (($inary && isset($in['url'])) ? $in['url'] : lcr5e37abad71f32miss($cx, '[url]'))).'/index/search/archive/show\' title=\'Courses in Archive container are hidden; click to show\'><i class=\'fa fa-toggle-off\'></i> Archived</a> 
';}).''.lcr5e37abad71f32debug('^[search].[subs] show', 'hbbch', $cx, 'equals', array(array(((isset($in['search']) && is_array($in['search']) && isset($in['search']['subs'])) ? $in['search']['subs'] : lcr5e37abad71f32miss($cx, '[search].[subs]')),'show'),array()), $in, false, function($cx, $in) {$inary=is_array($in);return '		<a href=\''.lcr5e37abad71f32debug('[url]', 'encq', $cx, (($inary && isset($in['url'])) ? $in['url'] : lcr5e37abad71f32miss($cx, '[url]'))).'/index/search/subs/hide\' class=\'on\'><i class=\'fa fa-toggle-on\' title=\'Visible\'></i> Subscriber courses</a>
';}, function($cx, $in) {$inary=is_array($in);return '		<a href=\''.lcr5e37abad71f32debug('[url]', 'encq', $cx, (($inary && isset($in['url'])) ? $in['url'] : lcr5e37abad71f32miss($cx, '[url]'))).'/index/search/subs/show\'><i class=\'fa fa-toggle-off\' title=\'Hidden\'></i> Subscriber courses</a>
';}).'	</div>
';}).'</form></header>
'.'
<section class=\'course-list\'>

<div class=\'start-row\'>
	<div class=\'name\'></div>
	<div class=\'stage\'>Label</div>
	<div class=\'date\'>Last modified</div>
	<div class=\'tools\'>Actions</div>
</div>

<div data-model="index/model" data-template="index-containers-hbt">
	<i class="fa fa-circle-o-notch fa-spin"></i>
	<span class="sr-only">Loading...</span>
</div>

</section>
';
}; ?>