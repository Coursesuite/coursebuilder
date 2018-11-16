<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title><?php echo $this->page_title; ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="/favicon.png">
<?php
if (isset($this->less)) foreach ($this->less as $file) echo "<link rel='stylesheet/less' href='{$file}'>", PHP_EOL;
if (isset($this->sheets)) foreach ($this->sheets as $file) echo "<link rel='stylesheet' type='text/css' href='{$file}' crossorigin='anonymous'>", PHP_EOL;
if (isset($this->headjs)) foreach ($this->headjs as $script) echo "<script type='text/javascript' src='{$script}' crossorigin='anonymous'></script>", PHP_EOL;
echo Licence::webservice_script();
?>
<script type='text/javascript' src='<?php echo $this->url . "/" . $this->page . "/js/" .  $this->context; ?>'></script>
</head>

<body class="page-<?php echo $this->page . ' action-' . $this->action; ?>">