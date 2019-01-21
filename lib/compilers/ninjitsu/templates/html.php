/* --------------------------------- instance --------------------------------------- */

_folder = "<?php echo addslashes($folder); ?>";
_realFolder = "<?php echo addslashes($realfolder); ?>";
_mappedFolder = "<?php echo addslashes($mappedfolder); ?>";
__settings = <?php echo json_encode($settings, JSON_NUMERIC_CHECK); ?>

var jspages = <?php echo json_encode($jspages); ?>;

// folders created under this process don't seem to be unlinkable by php
// fs.makeDirectory(_mappedFolder + "optimised/");

// var system = require('system');

for (var filename in jspages) {
	if (!jspages.hasOwnProperty(filename)) continue;
	var template = jspages[filename],
		file = _mappedFolder + filename;
	if (filename.indexOf("load")===0||filename==="job.js") {
		fs.remove(file);
		continue;
	}
	if (fs.isFile(file)) {
		var page = LoadFileStream(file);
		if (js_canBeOptimised(page)) {
			content = processString(page, template, true).split("/SCO1/").join("@sco_root@/");
			// system.stdout.writeLine(content);
			fs.write(_mappedFolder + "optimised/" + filename, content, 'w');
		}
	}
}
// after all processStrings might have loaded referenced content, it's safe to remove these caches

var fold = fs.list(_mappedFolder);
for (var x = 0 ; x < fold.length ; x++ ) {
	var file = _mappedFolder + fold[x];
	if (fs.isFile(file)) {
		fs.remove(file);
	}
}

// for (var filename in jspages) {
//    if (!jspages.hasOwnProperty(filename)) continue;
//    fs.remove(_mappedFolder + filename);
// }
phantom.exit();
