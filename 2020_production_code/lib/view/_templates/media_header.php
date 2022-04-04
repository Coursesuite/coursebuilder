<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title><?php echo $this->title; ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="<?php echo $this->description; ?>">
    <link rel="shortcut icon" href="/favicon.png">
	<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto">
	<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
	<link rel="stylesheet" href="<?php echo $this->url . "/" . $this->page . "/css/" . $this->context; ?>">
<?php
if (isset($this->sheets)) {
	foreach ($this->sheets as $sheet) {
		echo "	<link rel='stylesheet' type='text/css' href='$sheet'>" . PHP_EOL;
	}
} ?>
	<script src="https://cdn.polyfill.io/v2/polyfill.min.js"></script>
	<script type="text/javascript" src="<?php echo $this->url . "/" . $this->page . "/js/" . $this->context; ?>"></script>
</head>

<body class="page-<?php echo $this->page . ' action-' . $this->action; ?>">
	