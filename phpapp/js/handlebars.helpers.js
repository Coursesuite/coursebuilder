// so you have a template on the page with id = name, you want to compile then apply it
// cache the compiled version
Handlebars.getRuntimeTemplate = function (name, obj) {
  if (!Handlebars.templates[name]) {
    Handlebars.templates[name] = Handlebars.compile(document.getElementById(name).innerHTML);
  }
  return Handlebars.templates[name](obj);
}

// Extend Handlebars so there's a neat loader, since we will keep our layouts in the same folder
// assume .txt extension to avoid possible mimetype serve issues with other extensions
Handlebars.getTemplate = function(name) {
	if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {
		var uri = (name.indexOf("/") == 0) ? name : '/engine/layout/handlebars/' + name;
		$.ajax({
			url : uri + '.txt' + '?' + Math.random(),
			success : function(data) {
				if (Handlebars.templates === undefined) {
					Handlebars.templates = {};
				}
				Handlebars.templates[name] = Handlebars.compile(data);
			},
			async : false
		});
	}
	return Handlebars.templates[name];
};

Handlebars.needsPartial = function(name) {
	var label = name.split("_")[1];
	if (Handlebars.incPartials === undefined || Handlebars.incPartials[name] === undefined) {
		var uri = (name.indexOf("/") == 0) ? name : '/engine/layout/handlebars/' + name;
		cachingString = (true) ? "?" + Math.random() : ""; // debug
		$.ajax({
			url : uri + '.txt' + cachingString,
			success : function(data) {
				if (Handlebars.incPartials === undefined) {
					Handlebars.incPartials = {};
				}
				Handlebars.incPartials[name] = data; // Handlebars.compile(data);
			},
			async : false
		});
	}
	Handlebars.registerPartial(label, Handlebars.incPartials[name]);
};

Handlebars.getCompiledTemplate = function (name, json) {
	var template = Handlebars.getTemplate(name);
	// console.log("compiling template", name, json, template(json));
	return template(json);
}

Handlebars.registerHelper("indexplus1", function(i) {
	if (isNaN(i+0)) return 0;
	return (i+1);
});

Handlebars.registerHelper("localDate", function(t) {
	ar = t.split(" "); // vbscripts date format via sqlite is not compatible, so we hack it
	da = ar[0].split("/");
	da[1] = "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(",")[parseInt(da[1],10)-1]
	ar[0] = da.join(" ");
	if (ar[2]=="PM") {
		ta = ar[1].split(":");
		ta[0] = 12+parseInt(ta[0],10);
		ar[1] = ta.join(":");
	}
	ar[2] = " GMT+0";
	var d = new Date(ar.join(" "))
	return d.toString();
});

// {{#compare 'simple' __settings.layout.style}} - defaults to === comparator
// {{#compare some.number ">" 5}} - accepts > < <= >= === typeof != !== == === ~
// ~ means contains - if "param1" is inside "param2"; {{#contains "B" "~" "ABC"}}true
// http://doginthehat.com.au/2012/02/comparison-block-helper-for-handlebars-templates/#comment-44
Handlebars.registerHelper('compare', function (lvalue, operator, rvalue, options) {
	var operators, result;
	if (arguments.length < 3) {
	    throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
	}
	if (options === undefined) {
	    options = rvalue;
	    rvalue = operator;
	    operator = "===";
	}
	operators = {
	    '==': function (l, r) { return l == r; },
	    '===': function (l, r) { return l === r; },
	    '!=': function (l, r) { return l != r; },
	    '!==': function (l, r) { return l !== r; },
	    '<': function (l, r) { return l < r; },
	    '>': function (l, r) { return l > r; },
	    '<=': function (l, r) { return l <= r; },
	    '>=': function (l, r) { return l >= r; },
	    '~': function (l, r) { return (r&&l&&r.toString().indexOf(l.toString()) != -1); },
	    '!~': function (l, r) { return (r&&l&&r.toString().indexOf(l.toString()) == -1); },
	    'typeof': function (l, r) { return typeof l == r; },
	    'is': function (l, r) {
	    	if (r === 'empty') { // returns true IF empty
		    	return ((typeof l == 'undefined') || (l.toString().length == 0));
	    	}
	    	if (typeof l == 'undefined') return false;
		    switch (r) {
			    case 'numeric': return $.isNumeric(l); break;
			    case 'boolean': return (l.toString()=='true' || l.toString()=='false'); break;
			    case 'string': return (l.toString().length != 0); break;
				case 'array': return Object.prototype.toString.call(l) === '[object Array]'; break;
			    default: return false;
		    }
	    },
	    'morethanone': function(node,property) {
		    var c = 0;
		    for (var i=0;i<node.length;i++) {
			    if (node[i].hasOwnProperty(property)) c++;
		    }
		    return (c>0);
	    }
	};
	if (!operators[operator]) {
	    throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
	}
	result = operators[operator](lvalue, rvalue);
    if (result) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

Handlebars.registerHelper("isin", function(ar, value, options) {
	if (typeof ar !== 'array') ar = ar.split(",");
    if (ar.indexOf(value)!==-1) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
})

Handlebars.registerHelper('morethanone', function(node, property, options) {
	if (node && property && node.hasOwnProperty(property) && node[property].length > 1) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

// register a loopIndex property, useful inside an each
// e.g. {{#each foo}}{{setIndex @index}}{{#each bar}}{{../outerIndex}}.{{@index}} ..
Handlebars.registerHelper('setIndex', function(value) {
    this.outerIndex = Number(value);
});


Handlebars.registerHelper('console', function(value, options) {
	console.log("console helper", value, options);
});

Handlebars.registerHelper('stringify', function(value) {
	return JSON.stringify(value);
});

Handlebars.registerHelper('dump', function(value) {
	return JSON.stringify(value,null,4);
});

Handlebars.registerHelper('humandate', function(time) {
	//console.log("humandate", time);
	    // var date = new Date((time || "").replace(/-/g, "/").replace(/[TZ]/g, " ")),
	    var date = new Date(time * 1000),
        diff = (((new Date()).getTime() - date.getTime()) / 1000),
        day_diff = Math.floor(diff / 86400);

    if (isNaN(day_diff) || day_diff < 0) return;
    if (day_diff >= 31) {
	    var d = "";
	    d += date.getDate() + " " + ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][date.getMonth()];
	    if (date.getFullYear() != (new Date()).getFullYear()) d += " " + (date.getFullYear()).toString().replace("20","'");
	    d += " " + Math.abs(date.getHours()-12) + ":";
	    d += ("0"+date.getMinutes()).slice(-2);
	    d += date.getHours()>12 ? " pm":" am";
	    return d;
	}

    return day_diff == 0 && (
    	diff < 60 && "just now" ||
    	diff < 120 && "1 minute ago" ||
    	diff < 3600 && Math.floor(diff / 60) + " minutes ago" ||
    	diff < 7200 && "1 hour ago" ||
    	diff < 86400 && Math.floor(diff / 3600) + " hours ago") ||
    	day_diff == 1 && "Yesterday" ||
    	day_diff < 7 && day_diff + " days ago" ||
    	day_diff < 31 && Math.ceil(day_diff / 7) + " weeks ago";

});