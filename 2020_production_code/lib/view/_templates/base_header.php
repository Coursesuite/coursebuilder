<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title><?php echo $this->title; ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="<?php echo $this->description; ?>">
    <link rel="shortcut icon" href="/favicon.png">
	<link rel="stylesheet/less" href="/css/tardproof.less" />
<?php
if (isset($this->sheets)) {
	foreach ($this->sheets as $sheet) {
		echo "	<link rel='stylesheet' type='text/css' href='$sheet'>" . PHP_EOL;
	}
} ?>
	<script src="https://cdn.polyfill.io/v2/polyfill.min.js"></script>
    <script>var less = {"env":"development"};</script>
	<script type="text/javascript" src="/js/less-1.3.3.min.js"></script>
	<script type="text/javascript" src="<?php echo $this->url . "/" . $this->page . "/js/" .  $this->context; ?>"></script>
	<!--script src="https://use.fontawesome.com/c7c1c46f8a.js"></script -->

<!-- Piwik -->
<script type="text/javascript">
  var _paq = _paq || [];
  /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  (function() {
    var u="//stats.coursesuite.ninja/";
    _paq.push(['setTrackerUrl', u+'piwik.php']);
    _paq.push(['setSiteId', '4']);
    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
    g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'piwik.js'; s.parentNode.insertBefore(g,s);
  })();
</script>
<!-- End Piwik Code -->
<?php echo Licence::webservice_script(); ?>
</head>

<body class="page-<?php echo $this->page . ' action-' . $this->action; ?>">
	