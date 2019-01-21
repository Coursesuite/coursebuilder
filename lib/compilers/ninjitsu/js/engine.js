/* --------------------------------- engine.js --------------------------------------- */

function fy(a,b,c,d){c=a.length;while(c)b=Math.random()*c--|0,d=a[c],a[c]=a[b],a[b]=d}

// " my string ".trim() => "mystring"
if (!String.prototype.trim) {
  (function() {
    // Make sure we trim BOM and NBSP
    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    String.prototype.trim = function() {
      return this.replace(rtrim, '');
    };
  })();
}

// remember, we are not running in a browser
// so there are no DOM methods, and Microsoft JScript is quite old
// and doesn't define a number of methods like map and trim ...

// String.prototype.endsWith = function(pattern) {
//     var d = this.length - pattern.length;
//     return d >= 0 && this.lastIndexOf(pattern) === d;
// };

if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (position === undefined || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}

String.prototype.isANumber = function() {
	return /^\d+$/.test(this);
};

if (!Array.prototype.map) {
	Debug_Write("<li style='color:#0ff'>Implemented Array.prototype.map</li>");
  Array.prototype.map = function(callback, thisArg) {
    var T, A, k;
    if (this == null) {
      throw new TypeError(" this is null or not defined");
    }
    // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
    var O = Object(this);
    // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;
    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== "function") {
      throw new TypeError(callback + " is not a function");
    }
    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (thisArg) {
      T = thisArg;
    }
    // 6. Let A be a new array created as if by the expression new Array(len) where Array is
    // the standard built-in constructor with that name and len is the value of len.
    A = new Array(len);
    // 7. Let k be 0
    k = 0;
    // 8. Repeat, while k < len
    while(k < len) {
      var kValue, mappedValue;
      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {
        // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
        kValue = O[ k ];
        // ii. Let mappedValue be the result of calling the Call internal method of callback
        // with T as the this value and argument list containing kValue, k, and O.
        mappedValue = callback.call(T, kValue, k, O);
        // iii. Call the DefineOwnProperty internal method of A with arguments
        // Pk, Property Descriptor {Value: mappedValue, : true, Enumerable: true, Configurable: true},
        // and false.
        // In browsers that support Object.defineProperty, use the following:
        // Object.defineProperty(A, Pk, { value: mappedValue, writable: true, enumerable: true, configurable: true });
        // For best browser support, use the following:
        A[ k ] = mappedValue;
      }
      // d. Increase k by 1.
      k++;
    }
    // 9. return A
    return A;
  };
}

if (!Array.prototype.push) {
	Debug_Write("<li style='color:#0ff'>Implemented Array.prototype.push</li>");
	Array.prototype.push = function() {
	    var n = this.length >>> 0;
	    for (var i = 0; i < arguments.length; i++) {
	        this[n] = arguments[i];
	        n = n + 1 >>> 0;
	    }
	    this.length = n;
	    return n;
	}
}

function get_raw_lines(data) {
	return data.replace(/<[^>]*>/g, "").split(/(\r\n|\n\r|\r|\n)+/);
}

function appendSettings(obj) {
	return __settings[obj];
}

// poor mans server-side jquery ... just enough to get render.js working
var fs = require('fs'),
	toString = Object.prototype.toString,
	hasOwn = Object.prototype.hasOwnProperty,
	push = Array.prototype.push,
	slice = Array.prototype.slice,
	trim = String.prototype.trim,
	indexOf = Array.prototype.indexOf;

var $ = {
	jsmap : Array.prototype.map,
	map : function (ar, callback) {
		// jquery implements this backwards, known issue
		return ar.map(callback);
	},
	trim : function (text) {
		return text == null ?
			"" :
			text.toString().replace( /^\s+/, "" ).replace( /\s+$/, "" );
	},
	each : function (object, callback) {
		// assuming object is a normal non-object array
		var i=0, length = object.length;
		for ( ; i < length; ) {
			if ( callback.call( object[ i ], i, object[ i++ ] ) === false ) {
				break;
			}
		}
	},
	ajax : function (obj) {
		var url = _mappedFolder + obj.url.replace("/SCO1/en-us/Content/", "").split("?")[0];
		return LoadFileStream(url);
	},
	inArray: function( elem, array, i ) {
		var len;
		if ( array ) {
			if ( indexOf ) {
				return indexOf.call( array, elem, i );
			}
			len = array.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;
			for ( ; i < len; i++ ) {
				if ( i in array && array[ i ] === elem ) {
					return i;
				}
			}
		}
		return -1;
	}

}

function LoadFileStream(path) {
	if (fs.exists(path) && fs.isReadable(path)) {
		return fs.read(path,{mode:'r'});
	}
	return "";
}

Handlebars.getTemplate = function(name) {
	if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {
		if ("grids/" == name) name = "grids/auto";
		var url = _realFolder + "/SCO1/Layout/layouts/" + name + ".txt",
			data = LoadFileStream(url);
		if (Handlebars.templates === undefined) {
			Handlebars.templates = {};
		}
		Handlebars.templates[name] = Handlebars.compile(data);
	}
	return Handlebars.templates[name];
}

Handlebars.getCompiledTemplate = function (name, json) {
	var template = Handlebars.getTemplate(name);
	return template(json);
}

// #compare for handlebars
Handlebars.registerHelper("compare",function(g,c,e,d){var f;if(3>arguments.length)throw Error("Handlerbars Helper 'compare' needs 2 parameters");void 0===d&&(d=e,e=c,c="===");f={"==":function(a,b){return a==b},"===":function(a,b){return a===b},"!=":function(a,b){return a!=b},"!==":function(a,b){return a!==b},"<":function(a,b){return a<b},">":function(a,b){return a>b},"<=":function(a,b){return a<=b},">=":function(a,b){return a>=b},"typeof":function(a,b){return typeof a==b},"~":function(a,b){return a&&b&&-1!=
a.toString().indexOf(b.toString())},"&&":function(a,b){return!0==a&&!0==b},"||":function(a,b){return!0==a||!0==b}};if(!f[c])throw Error("Handlerbars Helper 'compare' doesn't know the operator "+c);return f[c](g,e)?d.fn(this):d.inverse(this)});

// if a property exists
Handlebars.registerHelper("exists",function(b,a){ console.log("exists", b, a); return"undefined"!==typeof b?a.fn(this):a.inverse(this)});

// register a loopIndex property, useful inside an each
// e.g. {{#each foo}}{{setIndex @index}}{{#each bar}}{{../outerIndex}}.{{@index}} ..
Handlebars.registerHelper('setIndex', function(value) {
    this.outerIndex = Number(value);
});

function getState(obj) {
	return '';
}

var _nPageCurrent = 0,
	__settings,
	_folder = '',
	_mappedFolder = '',
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

function js_setfolder(folder, mappedFolder) {
	_folder = folder;
	_mappedFolder = mappedFolder;
}

function js_initSettings(data, images, glossary, references) {
	__settings = JSON.parse(data);
	__settings['images'] = JSON.parse(images);
	__settings['glossary'] = JSON.parse(glossary);
	__settings['references'] = JSON.parse(references);
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
