<?php
	echo PHP_EOL;
$this->renderTemplates();
if (isset($this->inlinejs)) foreach ($this->inlinejs as $script) echo "<script type='text/javascript'>{$script}</script>", PHP_EOL;
if (isset($this->scripts)) foreach ($this->scripts as $script) echo "<script type='text/javascript' src='{$script}' crossorigin='anonymous'></script>", PHP_EOL;
if (isset($this->initjs)) {
	echo "<script type='text/javascript'>";
	echo "document.addEventListener('DOMContentLoaded',function(){";
	foreach($this->initjs as $value) {
		echo $value;
	}
	echo "},false);</script>" . PHP_EOL;
}

?>
</body>
</html>