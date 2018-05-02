<?php
	echo PHP_EOL;
$this->renderTemplates();
if (isset($this->inlinejs)) foreach ($this->inlinejs as $script) echo "<script type='text/javascript'>{$script}</script>", PHP_EOL;
if (isset($this->scripts)) foreach ($this->scripts as $script) echo "<script type='text/javascript' src='{$script}'></script>", PHP_EOL;
?>
</body>
</html>