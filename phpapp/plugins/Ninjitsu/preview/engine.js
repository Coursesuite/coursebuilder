var _ajax = $.ajax;
$.ajax = function (options) {
	if (options.url.indexOf("Layout/layouts/")!==-1) {
		var tmpl = options.url.split("layouts/").pop();
		options.url = "/app/edit/action/" + parent.CourseBuildr.ContextId + "/page.templatebyfilename.raw/";
		options.data = {filename:tmpl};
		options.method = "POST";
	} else if (options.url.indexOf("en-us/Content")!==-1) {
		var fn = options.url.split("en-us/Content").pop();
		options.url = "/app/edit/action/" + parent.CourseBuildr.ContextId + "/page.contentbyfilename.raw/";
		options.data = {filename:fn};
		options.method = "POST";
	}
	return _ajax(options);
}

var _nPageCurrent = 0,
	__settings = PluginModel.settings,
	_folder = '',
	_mappedFolder = PluginModel.mappedfolder,
	__global_root = '/SCO1', // player defines this like http://x.y.z/courses/sandpit/my_course_folder/SCO1
	_global_increment = 0,
	_sniff_isTablet = false,
	_avideSep = '#~',
	_fileNames = [];

function getIdByFileName(sHtmlFileName) {
    var nID = 0;
    for (var i = 0; i < _fileNames.length; i++) {
	    if (_fileNames[i].toLowerCase() == sHtmlFileName.toLowerCase()) {
            nID  = i;
            break;
        }
    }
    return nID;
}

function js_optimisePage(page, template, names) {
	_nPageCurrent++;
	_fileNames = names.split(";");
	var data = page, // LoadFileStream(page),
		out = processString(data, template, true).split("/SCO1/").join("@sco_root@/");
	return out;
}

//	build an image using the image manifest stored height and width, and standard properties
function imageTag(filename, classes, attributes) {
	var imgObj = find_in_json (__settings.images, "name", filename)[0];
	if (!imgObj) return "<img alt='Missing image: " + filename + "'>";
	var img = "<img width='" + imgObj.width + "' height='" + imgObj.height + "' src='@sco_root@/en-us/Content/media/" + filename + "'";
	if (classes) img += " class='" + classes + "'";
	if (attributes) {
		for (var key in attributes) {
			if( typeof attributes[key] !== 'function') { // no "hasOwnProperty" in server-side jscript
				img += " " + key + "='" + attributes[key] + "'";
			}
		}
	}
	return img + ">";
}

function js_canBeOptimised(page) {
	var data = page; // LoadFileStream(page);
	var skipIf = ['clickimage','clicktf','clickcheck','survey','ifcomplete','completion'];// ,'link'];
	for (var i=0, j=skipIf.length; i<j; i++) {
		if (data.indexOf("{" + skipIf[i] + " ") != -1) {
			return false;
		}
	}
	return true;
}

function get_raw_lines(data) {
	return data.replace(/<[^>]*>/g, "").split(/(\r\n|\n\r|\r|\n)+/);
}

function appendSettings(obj) {
	return __settings[obj];
}

function getState(obj) {
	return '';
}