<div class="modal">
  <div class="modal-inner">
    <span data-modal-close>&times;</span>
    <div class="modal-content"></div>
  </div>
</div>
<?php
	echo PHP_EOL;
$this->renderTemplates();
if (isset($this->inlinejs)) foreach ($this->inlinejs as $script) echo "<script type='text/javascript'>{$script}</script>", PHP_EOL;
if (isset($this->scripts)) foreach ($this->scripts as $script) echo "<script type='text/javascript' src='{$script}' crossorigin='anonymous'></script>", PHP_EOL;
?>
</body>
</html>