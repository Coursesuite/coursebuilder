<footer class="logo-copyright-help">
    <p><a href="https://guide.coursesuite.ninja/coursebuildr" target="_blank">Documentation</a></p>
	<p><a href="https://www.coursesuite.ninja/" target="_blank"><img src="/engine/layout/img/coursesuite_252x45_white.png"></a></p>
	<p>&copy; 2012 - <?php echo strftime("%Y"); ?></p>
</footer>

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