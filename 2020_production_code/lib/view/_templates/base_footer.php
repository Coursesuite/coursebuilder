<footer class="logo-copyright-help">
    <p><a href="https://guide.coursesuite.ninja/coursebuildr" target="_blank">Documentation</a></p>
	<p><a href="https://www.coursesuite.ninja/" target="_blank"><img src="/engine/layout/img/coursesuite_252x45_white.png"></a></p>
	<p>&copy; 2012 - <?php echo strftime("%Y"); ?></p>
</footer>

<?php $this->renderTemplates(); ?>

<script src="/js/jquery-1.9.0.min.js" type="text/javascript"></script>
<script>jQuery.migrateMute = true;</script>
<script src="/js/jquery-migrate-1.1.1.js" type="text/javascript"></script>
<script src="/js/bootstrap.min.js" type="text/javascript"></script>
<script src="/js/jquery-ui-1.10.0.custom.min.js" type="text/javascript"></script>
<script src="/js/core.js" type="text/javascript"></script>
<script src="/js/chosen/chosen.jquery.min.js" type="text/javascript"></script>
<script src="/js/jquery.xeyes-2.0.min.js"></script>
<script src="/js/bootbox.js" type="text/javascript"></script>
<script src="/js/bootstrap-slider.js" type="text/javascript"></script>
<script src="/js/chrome_paste.js" type="text/javascript"></script>
<script src="/js/jGrowl/jquery.jgrowl.js"></script>
<script src="/js/tour/bootstrap-tour-standalone.min.js"></script>

<?php if ($this->page == "edit") { ?>
<script src="/js/diff_match_patch.js" type="text/javascript"></script>
<script src="/js/jquery.pretty-text-diff.js" type="text/javascript"></script>
<script src="/js/lib/jstree/jquery.jstree.js" type="text/javascript"></script>
<script src="/js/shortcut.js" type="text/javascript"></script>
<script src="/js/jquery.tinysort.min.js"></script>
<script src="/js/jquery.highlighttextarea.lite.js"></script>
<script src="/js/spectrum.js"></script>
<?php }

if (isset($this->scripts)) {
	foreach ($this->scripts as $script) {
		echo "<script type='text/javascript' src='$script'></script>" . PHP_EOL;
	}
}

?>

</body>
</html>