<?php  function lcr5e4094b1911dbhbbch($cx, $ch, $vars, &$_this, $inverted, $cb, $else = null) {
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
    $ret = $cb($cx, is_array($ex) ? lcr5e4094b1911dbm($cx, $_this, $ex) : $_this);
   } else {
    $cx['scopes'][] = $_this;
    $ret = $cb($cx, is_array($ex) ? lcr5e4094b1911dbm($cx, $context, $ex) : $context);
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

  return lcr5e4094b1911dbexch($cx, $ch, $vars, $options);
 }

 function lcr5e4094b1911dbdebug($v, $f, $cx) {
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

 function lcr5e4094b1911dbmiss($cx, $v) {
  lcr5e4094b1911dberr($cx, "Runtime: $v does not exist");
 }

 function lcr5e4094b1911dbencq($cx, $var) {
  if ($var instanceof LS) {
   return (string)$var;
  }

  return str_replace(array('=', '`', '&#039;'), array('&#x3D;', '&#x60;', '&#x27;'), htmlspecialchars(lcr5e4094b1911dbraw($cx, $var), ENT_QUOTES, 'UTF-8'));
 }

 function lcr5e4094b1911dbifvar($cx, $v, $zero) {
  return ($v !== null) && ($v !== false) && ($zero || ($v !== 0) && ($v !== 0.0)) && ($v !== '') && (is_array($v) ? (count($v) > 0) : true);
 }

 function lcr5e4094b1911dbm($cx, $a, $b) {
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

 function lcr5e4094b1911dbexch($cx, $ch, $vars, &$options) {
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
   lcr5e4094b1911dberr($cx, $e);
  }

  return $r;
 }

 function lcr5e4094b1911dberr($cx, $err) {
  if ($cx['flags']['debug'] & $cx['constants']['DEBUG_ERROR_LOG']) {
   error_log($err);
   return;
  }
  if ($cx['flags']['debug'] & $cx['constants']['DEBUG_ERROR_EXCEPTION']) {
   throw new \Exception($err);
  }
 }

 function lcr5e4094b1911dbraw($cx, $v, $ex = 0) {
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
      $ret[] = lcr5e4094b1911dbraw($cx, $vv);
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
    $helpers = array(            'admins' => function($options) {
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
'.''.lcr5e4094b1911dbdebug('^', 'hbbch', $cx, 'admins', array(array(),array()), $in, false, function($cx, $in) {$inary=is_array($in);return '		<a target="_self" class="btn btn-info btn-small" href="/engine/pages/index/bmj.asp" title="BMJ Converter">BMJ Converter</a>
		<a class="btn btn-warning btn-small" href="/engine/pages/convert/"><i class="icon-stethoscope"></i> Elsevier converter</a>
';}).'		<a class="btn btn-small" href="/app/login/logout/">Log Out</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
'.'
<section class=\'site-logon\'>

<div class="container">
    <div class="row">
		<div class="span12 well">
			<form class="form-horizontal" action="'.lcr5e4094b1911dbdebug('[baseurl]', 'encq', $cx, (($inary && isset($in['baseurl'])) ? $in['baseurl'] : lcr5e4094b1911dbmiss($cx, '[baseurl]'))).'/login/authenticate" method="post">
			  <input type="hidden" name="csrf_token" value="'.lcr5e4094b1911dbdebug('[csrf]', 'encq', $cx, (($inary && isset($in['csrf'])) ? $in['csrf'] : lcr5e4094b1911dbmiss($cx, '[csrf]'))).'" />
			  <fieldset>
			    <div id="legend">
			      <legend class="">Login</legend>
			    </div>
			    <p class="lead">CourseSuite users should use the <a href="https://www.coursesuite.ninja/store/info/coursebuildr">CourseBuilder Store Page</a> to log on. If you have been supplied a private username and password, enter them below.</p>
			    <div class="control-group">
			      <!-- Username -->
			      <label class="control-label"  for="username">Username</label>
			      <div class="controls">
			        <input type="text" id="username" name="username" placeholder="" class="input-xlarge">
			      </div>
			    </div>
			    <div class="control-group">
			      <!-- Password-->
			      <label class="control-label" for="password">Password</label>
			      <div class="controls">
			        <input type="password" id="password" name="password" placeholder="" class="input-xlarge">
			      </div>
			    </div>
'.((lcr5e4094b1911dbdebug('[feedback]', 'ifvar', $cx, (($inary && isset($in['feedback'])) ? $in['feedback'] : lcr5e4094b1911dbmiss($cx, '[feedback]')), false)) ? '			    <div class="control-group">
			      <div class="controls">
			      	<p class="feedback">'.lcr5e4094b1911dbdebug('[feedback]', 'encq', $cx, (($inary && isset($in['feedback'])) ? $in['feedback'] : lcr5e4094b1911dbmiss($cx, '[feedback]'))).'</p>
			      </div>
			    </div>
' : '').'			    <div class="control-group">
			      <!-- Button -->
			      <div class="controls">
			        <button class="btn btn-success">Login</button>
			      </div>
			    </div>
			  </fieldset>
			</form>
		</div>
	</div>
</div>

</section>';
}; ?>