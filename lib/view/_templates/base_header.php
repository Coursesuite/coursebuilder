<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title><?php echo isset($this->page_title) ? $this->page_title : "untitled coursebuilder page"; ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="<?php echo $this->page_description; ?>">
    <link rel="shortcut icon" href="/favicon.png">
<?php
if (isset($this->sheets)) {
	foreach ($this->sheets as $sheet) {
		echo "	<link rel='stylesheet' type='text/css' href='{$sheet}'>", PHP_EOL;
	}
}
if (isset($this->less)) {
  foreach ($this->less as $tag) {
    echo "    <link rel='stylesheet/less' href='{$tag}' />", PHP_EOL;
  }
}
if (isset($this->headjs)) {
  foreach ($this->headjs as $js) {
    echo "    <script src='{$js}'></script>", PHP_EOL;
  }
}
if (isset($this->head)) {
  foreach ($this->head as $tag) {
    echo "    {$tag}", PHP_EOL;
  }
}
if (isset($this->inlinejs)) {
  echo "    <script>", implode(PHP_EOL, array_values((array) $this->inlinejs)), "</script>", PHP_EOL;
}

echo Licence::webservice_script();
?>
</head>

<body class="page-<?php echo $this->page . ' action-' . $this->action; ?>">
