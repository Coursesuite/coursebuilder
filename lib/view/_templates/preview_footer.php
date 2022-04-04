<?php
$this->renderTemplates();

if (isset($this->scripts)) {
	foreach ($this->scripts as $script) {
		echo "<script type='text/javascript' src='$script'></script>" . PHP_EOL;
	}
}
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