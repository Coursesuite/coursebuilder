/*global jQuery */

/*! js-cookie v2.1.4 | MIT */

!function(a){var b=!1;if("function"==typeof define&&define.amd&&(define(a),b=!0),"object"==typeof exports&&(module.exports=a(),b=!0),!b){var c=window.Cookies,d=window.Cookies=a();d.noConflict=function(){return window.Cookies=c,d}}}(function(){function a(){for(var a=0,b={};a<arguments.length;a++){var c=arguments[a];for(var d in c)b[d]=c[d]}return b}function b(c){function d(b,e,f){var g;if("undefined"!=typeof document){if(arguments.length>1){if(f=a({path:"/"},d.defaults,f),"number"==typeof f.expires){var h=new Date;h.setMilliseconds(h.getMilliseconds()+864e5*f.expires),f.expires=h}f.expires=f.expires?f.expires.toUTCString():"";try{g=JSON.stringify(e),/^[\{\[]/.test(g)&&(e=g)}catch(p){}e=c.write?c.write(e,b):encodeURIComponent(e+"").replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),b=encodeURIComponent(b+""),b=b.replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent),b=b.replace(/[\(\)]/g,escape);var i="";for(var j in f)f[j]&&(i+="; "+j,!0!==f[j]&&(i+="="+f[j]));return document.cookie=b+"="+e+i}b||(g={});for(var k=document.cookie?document.cookie.split("; "):[],l=0;l<k.length;l++){var m=k[l].split("="),n=m.slice(1).join("=");'"'===n.charAt(0)&&(n=n.slice(1,-1));try{var o=m[0].replace(/(%[0-9A-Z]{2})+/g,decodeURIComponent);if(n=c.read?c.read(n,o):c(n,o)||n.replace(/(%[0-9A-Z]{2})+/g,decodeURIComponent),this.json)try{n=JSON.parse(n)}catch(p){}if(b===o){g=n;break}b||(g[o]=n)}catch(p){}}return g}}return d.set=d,d.get=function(a){return d.call(d,a)},d.getJSON=function(){return d.apply({json:!0},[].slice.call(arguments))},d.defaults={},d.remove=function(b,c){d(b,"",a(c,{expires:-1}))},d.withConverter=b,d}return b(function(){})});

$.fn.equaliseHeights = function(useMin) {
  var maxHeight = this.map(function(i,e) {
    return $(e).outerHeight(true);
  }).get();
  if (useMin) return $(this).css("min-height", ( Math.max.apply(this, maxHeight) ));
  return this.height( Math.max.apply(this, maxHeight) );
};
$.fn.equaliseWidths = function(useMin) {
  var maxWidth = this.map(function(i,e) {
    return $(e).outerWidth(true);
  }).get();
  if (useMin) return $(this).css("min-width", ( Math.max.apply(this, maxWidth) ));
  return this.width( Math.max.apply(this, maxWidth) );
};

Array.prototype.removeValue = function(name, value){
   var array = $.map(this, function(v,i){
      return v[name] === value ? null : v;
   });
   this.length = 0; //clear original array
   this.push.apply(this, array); //push all elements except the one we want to delete
}

function sortJSON(data, key, abc) {
    return data.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        // console.log("sort json",x,y,(x < y), (x > y));
        if (abc) return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        else return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    });
}


// var foo = find_in_json(__settings, "images", "abc123.jpg") foo => {width:123,height:456}
function find_in_json(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(find_in_json(obj[i], key, val));
        } else if (i == key && obj[key] == val) {
            objects.push(obj);
        }
    }
    return objects;
}

// return what looks like a guid
function getUUID() {
    var uuid = (function () {
        var i,
            c = "89ab",
            u = [];
        for (i = 0; i < 36; i += 1) {
            u[i] = (Math.random() * 16 | 0).toString(16);
        }
        u[8] = u[13] = u[18] = u[23] = "-";
        u[14] = "4";
        u[19] = c.charAt(Math.random() * 4 | 0);
        return u.join("");
    })();
    return {
        toString: function () {
            return uuid;
        },
        valueOf: function () {
            return uuid;
        }
    };
}

// return what looks like the first 8 bytes of a guid (unique enough identifier)
function getUID() {
    var uuid = (function () {
        var i,
            u = [];
        for (i = 0; i < 8; i += 1) {
            u[i] = (Math.random() * 16 | 0).toString(16);
        }
        return u.join("");
    })();
    return {
        toString: function () {
            return uuid;
        },
        valueOf: function () {
            return uuid;
        }
    };
}

// return either a or b if they loosely exist
function either(a,b) {
	if (!a && b) return b;
	if (a && !b) return a;
	if (!a && !b) return null;
	if (a && b) return a; // prioritise to first item
}

/*
       Copyright (c) 2012 Websanova.
 @license         This mousestop jQuery plug-in is dual licensed under the MIT and GPL licenses.
 @link            http://www.websanova.com
 @github          http://github.com/websanova/mousestop
 @version         Version 1.1.3

*/
(function(d){d.fn.mousestop=function(e,a){a=d.extend({},d.fn.mousestop.defaultSettings,a||{});return this.each(function(){var k=d(this),b=!1,f=null,g=null;if(null!=a.timeToStop){var l=null,m=null,h=0,n=Math.ceil(a.timeToStop/100);k.mouseover(function(a){b=!0;f=setInterval(function(){h++;h<n?b||(clearTimeout(f),a.pageX=l,a.pageY=m,e&&e.apply(this,[a])):b=!1},100)})}k.mouseout(function(c){clearTimeout(f);clearTimeout(g);h=0;b=!1;a.onMouseout&&a.onMouseout.apply(this,[c])}).mousemove(function(c){l=c.pageX;
m=c.pageY;b?(clearTimeout(g),g=setTimeout(function(){b=!1;null==a.timeToStop&&e&&e.apply(this,[c])},a.delayToStop)):(a.onStopMove&&a.onStopMove.apply(this,[c]),b=!0)})})};d.fn.mousestop.defaultSettings={timeToStop:null,delayToStop:"300",onMouseout:null,onStopMove:null}})(jQuery);


// https://raw.github.com/wycats/handlebars.js/1.0.0-rc.3/dist/handlebars.js
this.Handlebars={};
(function(c){c.VERSION="1.0.0-rc.3";c.COMPILER_REVISION=2;c.REVISION_CHANGES={1:"<= 1.0.rc.2",2:">= 1.0.0-rc.3"};c.helpers={};c.partials={};c.registerHelper=function(a,d,c){c&&(d.not=c);this.helpers[a]=d};c.registerPartial=function(a,d){this.partials[a]=d};c.registerHelper("helperMissing",function(a){if(2!==arguments.length)throw Error("Could not find property '"+a+"'");});var f=Object.prototype.toString;c.registerHelper("blockHelperMissing",function(a,d){var g=d.inverse||function(){},e=d.fn,p=f.call(a);
"[object Function]"===p&&(a=a.call(this));return!0===a?e(this):!1===a||null==a?g(this):"[object Array]"===p?0<a.length?c.helpers.each(a,d):g(this):e(a)});c.K=function(){};c.createFrame=Object.create||function(a){c.K.prototype=a;a=new c.K;c.K.prototype=null;return a};c.logger={DEBUG:0,INFO:1,WARN:2,ERROR:3,level:3,methodMap:{"0":"debug",1:"info",2:"warn",3:"error"},log:function(a,d){if(c.logger.level<=a){var g=c.logger.methodMap[a];"undefined"!==typeof console&&console[g]&&console[g].call(console,
d)}}};c.log=function(a,d){c.logger.log(a,d)};c.registerHelper("each",function(a,d){var g=d.fn,e=d.inverse,f=0,b="",m;d.data&&(m=c.createFrame(d.data));if(a&&"object"===typeof a)if(a instanceof Array)for(var q=a.length;f<q;f++)m&&(m.index=f),b+=g(a[f],{data:m});else for(q in a)a.hasOwnProperty(q)&&(m&&(m.key=q),b+=g(a[q],{data:m}),f++);0===f&&(b=e(this));return b});c.registerHelper("if",function(a,d){"[object Function]"===f.call(a)&&(a=a.call(this));return!a||c.Utils.isEmpty(a)?d.inverse(this):d.fn(this)});
c.registerHelper("unless",function(a,d){var g=d.fn;d.fn=d.inverse;d.inverse=g;return c.helpers["if"].call(this,a,d)});c.registerHelper("with",function(a,d){return d.fn(a)});c.registerHelper("log",function(a,d){var g=d.data&&null!=d.data.level?parseInt(d.data.level,10):1;c.log(g,a)})})(this.Handlebars);
var handlebars=function(){function c(){this.yy={}}var f={trace:function(){},yy:{},symbols_:{error:2,root:3,program:4,EOF:5,simpleInverse:6,statements:7,statement:8,openInverse:9,closeBlock:10,openBlock:11,mustache:12,partial:13,CONTENT:14,COMMENT:15,OPEN_BLOCK:16,inMustache:17,CLOSE:18,OPEN_INVERSE:19,OPEN_ENDBLOCK:20,path:21,OPEN:22,OPEN_UNESCAPED:23,OPEN_PARTIAL:24,partialName:25,params:26,hash:27,DATA:28,param:29,STRING:30,INTEGER:31,BOOLEAN:32,hashSegments:33,hashSegment:34,ID:35,EQUALS:36,PARTIAL_NAME:37,
pathSegments:38,SEP:39,$accept:0,$end:1},terminals_:{2:"error",5:"EOF",14:"CONTENT",15:"COMMENT",16:"OPEN_BLOCK",18:"CLOSE",19:"OPEN_INVERSE",20:"OPEN_ENDBLOCK",22:"OPEN",23:"OPEN_UNESCAPED",24:"OPEN_PARTIAL",28:"DATA",30:"STRING",31:"INTEGER",32:"BOOLEAN",35:"ID",36:"EQUALS",37:"PARTIAL_NAME",39:"SEP"},productions_:[0,[3,2],[4,2],[4,3],[4,2],[4,1],[4,1],[4,0],[7,1],[7,2],[8,3],[8,3],[8,1],[8,1],[8,1],[8,1],[11,3],[9,3],[10,3],[12,3],[12,3],[13,3],[13,4],[6,2],[17,3],[17,2],[17,2],[17,1],[17,1],[26,
2],[26,1],[29,1],[29,1],[29,1],[29,1],[29,1],[27,1],[33,2],[33,1],[34,3],[34,3],[34,3],[34,3],[34,3],[25,1],[21,1],[38,3],[38,1]],performAction:function(a,d,c,e,f,b){a=b.length-1;switch(f){case 1:return b[a-1];case 2:this.$=new e.ProgramNode([],b[a]);break;case 3:this.$=new e.ProgramNode(b[a-2],b[a]);break;case 4:this.$=new e.ProgramNode(b[a-1],[]);break;case 5:this.$=new e.ProgramNode(b[a]);break;case 6:this.$=new e.ProgramNode([],[]);break;case 7:this.$=new e.ProgramNode([]);break;case 8:this.$=
[b[a]];break;case 9:b[a-1].push(b[a]);this.$=b[a-1];break;case 10:this.$=new e.BlockNode(b[a-2],b[a-1].inverse,b[a-1],b[a]);break;case 11:this.$=new e.BlockNode(b[a-2],b[a-1],b[a-1].inverse,b[a]);break;case 12:this.$=b[a];break;case 13:this.$=b[a];break;case 14:this.$=new e.ContentNode(b[a]);break;case 15:this.$=new e.CommentNode(b[a]);break;case 16:this.$=new e.MustacheNode(b[a-1][0],b[a-1][1]);break;case 17:this.$=new e.MustacheNode(b[a-1][0],b[a-1][1]);break;case 18:this.$=b[a-1];break;case 19:this.$=
new e.MustacheNode(b[a-1][0],b[a-1][1]);break;case 20:this.$=new e.MustacheNode(b[a-1][0],b[a-1][1],!0);break;case 21:this.$=new e.PartialNode(b[a-1]);break;case 22:this.$=new e.PartialNode(b[a-2],b[a-1]);break;case 24:this.$=[[b[a-2]].concat(b[a-1]),b[a]];break;case 25:this.$=[[b[a-1]].concat(b[a]),null];break;case 26:this.$=[[b[a-1]],b[a]];break;case 27:this.$=[[b[a]],null];break;case 28:this.$=[[new e.DataNode(b[a])],null];break;case 29:b[a-1].push(b[a]);this.$=b[a-1];break;case 30:this.$=[b[a]];
break;case 31:this.$=b[a];break;case 32:this.$=new e.StringNode(b[a]);break;case 33:this.$=new e.IntegerNode(b[a]);break;case 34:this.$=new e.BooleanNode(b[a]);break;case 35:this.$=new e.DataNode(b[a]);break;case 36:this.$=new e.HashNode(b[a]);break;case 37:b[a-1].push(b[a]);this.$=b[a-1];break;case 38:this.$=[b[a]];break;case 39:this.$=[b[a-2],b[a]];break;case 40:this.$=[b[a-2],new e.StringNode(b[a])];break;case 41:this.$=[b[a-2],new e.IntegerNode(b[a])];break;case 42:this.$=[b[a-2],new e.BooleanNode(b[a])];
break;case 43:this.$=[b[a-2],new e.DataNode(b[a])];break;case 44:this.$=new e.PartialNameNode(b[a]);break;case 45:this.$=new e.IdNode(b[a]);break;case 46:b[a-2].push(b[a]);this.$=b[a-2];break;case 47:this.$=[b[a]]}},table:[{3:1,4:2,5:[2,7],6:3,7:4,8:6,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,5],22:[1,14],23:[1,15],24:[1,16]},{1:[3]},{5:[1,17]},{5:[2,6],7:18,8:6,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,19],20:[2,6],22:[1,14],23:[1,15],24:[1,16]},{5:[2,5],6:20,8:21,9:7,
11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,5],20:[2,5],22:[1,14],23:[1,15],24:[1,16]},{17:23,18:[1,22],21:24,28:[1,25],35:[1,27],38:26},{5:[2,8],14:[2,8],15:[2,8],16:[2,8],19:[2,8],20:[2,8],22:[2,8],23:[2,8],24:[2,8]},{4:28,6:3,7:4,8:6,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,5],20:[2,7],22:[1,14],23:[1,15],24:[1,16]},{4:29,6:3,7:4,8:6,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,5],20:[2,7],22:[1,14],23:[1,15],24:[1,16]},{5:[2,12],14:[2,12],15:[2,12],16:[2,12],
19:[2,12],20:[2,12],22:[2,12],23:[2,12],24:[2,12]},{5:[2,13],14:[2,13],15:[2,13],16:[2,13],19:[2,13],20:[2,13],22:[2,13],23:[2,13],24:[2,13]},{5:[2,14],14:[2,14],15:[2,14],16:[2,14],19:[2,14],20:[2,14],22:[2,14],23:[2,14],24:[2,14]},{5:[2,15],14:[2,15],15:[2,15],16:[2,15],19:[2,15],20:[2,15],22:[2,15],23:[2,15],24:[2,15]},{17:30,21:24,28:[1,25],35:[1,27],38:26},{17:31,21:24,28:[1,25],35:[1,27],38:26},{17:32,21:24,28:[1,25],35:[1,27],38:26},{25:33,37:[1,34]},{1:[2,1]},{5:[2,2],8:21,9:7,11:8,12:9,13:10,
14:[1,11],15:[1,12],16:[1,13],19:[1,19],20:[2,2],22:[1,14],23:[1,15],24:[1,16]},{17:23,21:24,28:[1,25],35:[1,27],38:26},{5:[2,4],7:35,8:6,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,19],20:[2,4],22:[1,14],23:[1,15],24:[1,16]},{5:[2,9],14:[2,9],15:[2,9],16:[2,9],19:[2,9],20:[2,9],22:[2,9],23:[2,9],24:[2,9]},{5:[2,23],14:[2,23],15:[2,23],16:[2,23],19:[2,23],20:[2,23],22:[2,23],23:[2,23],24:[2,23]},{18:[1,36]},{18:[2,27],21:41,26:37,27:38,28:[1,45],29:39,30:[1,42],31:[1,43],32:[1,44],33:40,
34:46,35:[1,47],38:26},{18:[2,28]},{18:[2,45],28:[2,45],30:[2,45],31:[2,45],32:[2,45],35:[2,45],39:[1,48]},{18:[2,47],28:[2,47],30:[2,47],31:[2,47],32:[2,47],35:[2,47],39:[2,47]},{10:49,20:[1,50]},{10:51,20:[1,50]},{18:[1,52]},{18:[1,53]},{18:[1,54]},{18:[1,55],21:56,35:[1,27],38:26},{18:[2,44],35:[2,44]},{5:[2,3],8:21,9:7,11:8,12:9,13:10,14:[1,11],15:[1,12],16:[1,13],19:[1,19],20:[2,3],22:[1,14],23:[1,15],24:[1,16]},{14:[2,17],15:[2,17],16:[2,17],19:[2,17],20:[2,17],22:[2,17],23:[2,17],24:[2,17]},
{18:[2,25],21:41,27:57,28:[1,45],29:58,30:[1,42],31:[1,43],32:[1,44],33:40,34:46,35:[1,47],38:26},{18:[2,26]},{18:[2,30],28:[2,30],30:[2,30],31:[2,30],32:[2,30],35:[2,30]},{18:[2,36],34:59,35:[1,60]},{18:[2,31],28:[2,31],30:[2,31],31:[2,31],32:[2,31],35:[2,31]},{18:[2,32],28:[2,32],30:[2,32],31:[2,32],32:[2,32],35:[2,32]},{18:[2,33],28:[2,33],30:[2,33],31:[2,33],32:[2,33],35:[2,33]},{18:[2,34],28:[2,34],30:[2,34],31:[2,34],32:[2,34],35:[2,34]},{18:[2,35],28:[2,35],30:[2,35],31:[2,35],32:[2,35],35:[2,
35]},{18:[2,38],35:[2,38]},{18:[2,47],28:[2,47],30:[2,47],31:[2,47],32:[2,47],35:[2,47],36:[1,61],39:[2,47]},{35:[1,62]},{5:[2,10],14:[2,10],15:[2,10],16:[2,10],19:[2,10],20:[2,10],22:[2,10],23:[2,10],24:[2,10]},{21:63,35:[1,27],38:26},{5:[2,11],14:[2,11],15:[2,11],16:[2,11],19:[2,11],20:[2,11],22:[2,11],23:[2,11],24:[2,11]},{14:[2,16],15:[2,16],16:[2,16],19:[2,16],20:[2,16],22:[2,16],23:[2,16],24:[2,16]},{5:[2,19],14:[2,19],15:[2,19],16:[2,19],19:[2,19],20:[2,19],22:[2,19],23:[2,19],24:[2,19]},{5:[2,
20],14:[2,20],15:[2,20],16:[2,20],19:[2,20],20:[2,20],22:[2,20],23:[2,20],24:[2,20]},{5:[2,21],14:[2,21],15:[2,21],16:[2,21],19:[2,21],20:[2,21],22:[2,21],23:[2,21],24:[2,21]},{18:[1,64]},{18:[2,24]},{18:[2,29],28:[2,29],30:[2,29],31:[2,29],32:[2,29],35:[2,29]},{18:[2,37],35:[2,37]},{36:[1,61]},{21:65,28:[1,69],30:[1,66],31:[1,67],32:[1,68],35:[1,27],38:26},{18:[2,46],28:[2,46],30:[2,46],31:[2,46],32:[2,46],35:[2,46],39:[2,46]},{18:[1,70]},{5:[2,22],14:[2,22],15:[2,22],16:[2,22],19:[2,22],20:[2,22],
22:[2,22],23:[2,22],24:[2,22]},{18:[2,39],35:[2,39]},{18:[2,40],35:[2,40]},{18:[2,41],35:[2,41]},{18:[2,42],35:[2,42]},{18:[2,43],35:[2,43]},{5:[2,18],14:[2,18],15:[2,18],16:[2,18],19:[2,18],20:[2,18],22:[2,18],23:[2,18],24:[2,18]}],defaultActions:{17:[2,1],25:[2,28],38:[2,26],57:[2,24]},parseError:function(a){throw Error(a);},parse:function(a){var d=[0],c=[null],e=[],f=this.table,b="",m=0,q=0,t=0;this.lexer.setInput(a);this.lexer.yy=this.yy;this.yy.lexer=this.lexer;this.yy.parser=this;"undefined"==
typeof this.lexer.yylloc&&(this.lexer.yylloc={});a=this.lexer.yylloc;e.push(a);var v=this.lexer.options&&this.lexer.options.ranges;"function"===typeof this.yy.parseError&&(this.parseError=this.yy.parseError);for(var j,n,h,k,r={},s,l;;){h=d[d.length-1];if(this.defaultActions[h])k=this.defaultActions[h];else{if(null===j||"undefined"==typeof j)j=void 0,j=this.lexer.lex()||1,"number"!==typeof j&&(j=this.symbols_[j]||j);k=f[h]&&f[h][j]}if("undefined"===typeof k||!k.length||!k[0]){var u="";if(!t){l=[];
for(s in f[h])this.terminals_[s]&&2<s&&l.push("'"+this.terminals_[s]+"'");u=this.lexer.showPosition?"Parse error on line "+(m+1)+":\n"+this.lexer.showPosition()+"\nExpecting "+l.join(", ")+", got '"+(this.terminals_[j]||j)+"'":"Parse error on line "+(m+1)+": Unexpected "+(1==j?"end of input":"'"+(this.terminals_[j]||j)+"'");this.parseError(u,{text:this.lexer.match,token:this.terminals_[j]||j,line:this.lexer.yylineno,loc:a,expected:l})}}if(k[0]instanceof Array&&1<k.length)throw Error("Parse Error: multiple actions possible at state: "+
h+", token: "+j);switch(k[0]){case 1:d.push(j);c.push(this.lexer.yytext);e.push(this.lexer.yylloc);d.push(k[1]);j=null;n?(j=n,n=null):(q=this.lexer.yyleng,b=this.lexer.yytext,m=this.lexer.yylineno,a=this.lexer.yylloc,0<t&&t--);break;case 2:l=this.productions_[k[1]][1];r.$=c[c.length-l];r._$={first_line:e[e.length-(l||1)].first_line,last_line:e[e.length-1].last_line,first_column:e[e.length-(l||1)].first_column,last_column:e[e.length-1].last_column};v&&(r._$.range=[e[e.length-(l||1)].range[0],e[e.length-
1].range[1]]);h=this.performAction.call(r,b,q,m,this.yy,k[1],c,e);if("undefined"!==typeof h)return h;l&&(d=d.slice(0,-2*l),c=c.slice(0,-1*l),e=e.slice(0,-1*l));d.push(this.productions_[k[1]][0]);c.push(r.$);e.push(r._$);k=f[d[d.length-2]][d[d.length-1]];d.push(k);break;case 3:return!0}}return!0},lexer:{EOF:1,parseError:function(a,d){if(this.yy.parser)this.yy.parser.parseError(a,d);else throw Error(a);},setInput:function(a){this._input=a;this._more=this._less=this.done=!1;this.yylineno=this.yyleng=
0;this.yytext=this.matched=this.match="";this.conditionStack=["INITIAL"];this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0};this.options.ranges&&(this.yylloc.range=[0,0]);this.offset=0;return this},input:function(){var a=this._input[0];this.yytext+=a;this.yyleng++;this.offset++;this.match+=a;this.matched+=a;a.match(/(?:\r\n?|\n).*/g)?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++;this.options.ranges&&this.yylloc.range[1]++;this._input=this._input.slice(1);return a},
unput:function(a){var d=a.length,c=a.split(/(?:\r\n?|\n)/g);this._input=a+this._input;this.yytext=this.yytext.substr(0,this.yytext.length-d-1);this.offset-=d;a=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1);this.matched=this.matched.substr(0,this.matched.length-1);c.length-1&&(this.yylineno-=c.length-1);var e=this.yylloc.range;this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:c?(c.length===
a.length?this.yylloc.first_column:0)+a[a.length-c.length].length-c[0].length:this.yylloc.first_column-d};this.options.ranges&&(this.yylloc.range=[e[0],e[0]+this.yyleng-d]);return this},more:function(){this._more=!0;return this},less:function(a){this.unput(this.match.slice(a))},pastInput:function(){var a=this.matched.substr(0,this.matched.length-this.match.length);return(20<a.length?"...":"")+a.substr(-20).replace(/\n/g,"")},upcomingInput:function(){var a=this.match;20>a.length&&(a+=this._input.substr(0,
20-a.length));return(a.substr(0,20)+(20<a.length?"...":"")).replace(/\n/g,"")},showPosition:function(){var a=this.pastInput(),d=Array(a.length+1).join("-");return a+this.upcomingInput()+"\n"+d+"^"},next:function(){if(this.done)return this.EOF;this._input||(this.done=!0);var a,d,c;this._more||(this.match=this.yytext="");for(var e=this._currentRules(),f=0;f<e.length;f++)if((d=this._input.match(this.rules[e[f]]))&&(!a||d[0].length>a[0].length))if(a=d,c=f,!this.options.flex)break;if(a){if(d=a[0].match(/(?:\r\n?|\n).*/g))this.yylineno+=
d.length;this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:d?d[d.length-1].length-d[d.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+a[0].length};this.yytext+=a[0];this.match+=a[0];this.matches=a;this.yyleng=this.yytext.length;this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]);this._more=!1;this._input=this._input.slice(a[0].length);this.matched+=a[0];a=this.performAction.call(this,this.yy,
this,e[c],this.conditionStack[this.conditionStack.length-1]);this.done&&this._input&&(this.done=!1);if(a)return a}else return""===this._input?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+". Unrecognized text.\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})},lex:function(){var a=this.next();return"undefined"!==typeof a?a:this.lex()},begin:function(a){this.conditionStack.push(a)},popState:function(){return this.conditionStack.pop()},_currentRules:function(){return this.conditions[this.conditionStack[this.conditionStack.length-
1]].rules},topState:function(){return this.conditionStack[this.conditionStack.length-2]},pushState:function(a){this.begin(a)},options:{},performAction:function(a,d,c){switch(c){case 0:"\\"!==d.yytext.slice(-1)&&this.begin("mu");"\\"===d.yytext.slice(-1)&&(d.yytext=d.yytext.substr(0,d.yyleng-1),this.begin("emu"));if(d.yytext)return 14;break;case 1:return 14;case 2:return"\\"!==d.yytext.slice(-1)&&this.popState(),"\\"===d.yytext.slice(-1)&&(d.yytext=d.yytext.substr(0,d.yyleng-1)),14;case 3:return d.yytext=
d.yytext.substr(0,d.yyleng-4),this.popState(),15;case 4:return this.begin("par"),24;case 5:return 16;case 6:return 20;case 7:return 19;case 8:return 19;case 9:return 23;case 10:return 23;case 11:this.popState();this.begin("com");break;case 12:return d.yytext=d.yytext.substr(3,d.yyleng-5),this.popState(),15;case 13:return 22;case 14:return 36;case 15:return 35;case 16:return 35;case 17:return 39;case 19:return this.popState(),18;case 20:return this.popState(),18;case 21:return d.yytext=d.yytext.substr(1,
d.yyleng-2).replace(/\\"/g,'"'),30;case 22:return d.yytext=d.yytext.substr(1,d.yyleng-2).replace(/\\'/g,"'"),30;case 23:return d.yytext=d.yytext.substr(1),28;case 24:return 32;case 25:return 32;case 26:return 31;case 27:return 35;case 28:return d.yytext=d.yytext.substr(1,d.yyleng-2),35;case 29:return"INVALID";case 31:return this.popState(),37;case 32:return 5}},rules:[/^(?:[^\x00]*?(?=(\{\{)))/,/^(?:[^\x00]+)/,/^(?:[^\x00]{2,}?(?=(\{\{|$)))/,/^(?:[\s\S]*?--\}\})/,/^(?:\{\{>)/,/^(?:\{\{#)/,/^(?:\{\{\/)/,
/^(?:\{\{\^)/,/^(?:\{\{\s*else\b)/,/^(?:\{\{\{)/,/^(?:\{\{&)/,/^(?:\{\{!--)/,/^(?:\{\{![\s\S]*?\}\})/,/^(?:\{\{)/,/^(?:=)/,/^(?:\.(?=[} ]))/,/^(?:\.\.)/,/^(?:[\/.])/,/^(?:\s+)/,/^(?:\}\}\})/,/^(?:\}\})/,/^(?:"(\\["]|[^"])*")/,/^(?:'(\\[']|[^'])*')/,/^(?:@[a-zA-Z]+)/,/^(?:true(?=[}\s]))/,/^(?:false(?=[}\s]))/,/^(?:[0-9]+(?=[}\s]))/,/^(?:[a-zA-Z0-9_$-]+(?=[=}\s\/.]))/,/^(?:\[[^\]]*\])/,/^(?:.)/,/^(?:\s+)/,/^(?:[a-zA-Z0-9_$-/]+)/,/^(?:$)/],conditions:{mu:{rules:[4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,
19,20,21,22,23,24,25,26,27,28,29,32],inclusive:!1},emu:{rules:[2],inclusive:!1},com:{rules:[3],inclusive:!1},par:{rules:[30,31],inclusive:!1},INITIAL:{rules:[0,1,32],inclusive:!0}}}};c.prototype=f;f.Parser=c;return new c}();Handlebars.Parser=handlebars;Handlebars.parse=function(c){if(c.constructor===Handlebars.AST.ProgramNode)return c;Handlebars.Parser.yy=Handlebars.AST;return Handlebars.Parser.parse(c)};Handlebars.print=function(c){return(new Handlebars.PrintVisitor).accept(c)};
(function(){Handlebars.AST={};Handlebars.AST.ProgramNode=function(c,f){this.type="program";this.statements=c;f&&(this.inverse=new Handlebars.AST.ProgramNode(f))};Handlebars.AST.MustacheNode=function(c,f,a){this.type="mustache";this.escaped=!a;this.hash=f;a=this.id=c[0];c=this.params=c.slice(1);this.isHelper=(this.eligibleHelper=a.isSimple)&&(c.length||f)};Handlebars.AST.PartialNode=function(c,f){this.type="partial";this.partialName=c;this.context=f};Handlebars.AST.BlockNode=function(c,f,a,d){var g=
c.id;if(g.original!==d.original)throw new Handlebars.Exception(g.original+" doesn't match "+d.original);this.type="block";this.mustache=c;this.program=f;if((this.inverse=a)&&!this.program)this.isInverse=!0};Handlebars.AST.ContentNode=function(c){this.type="content";this.string=c};Handlebars.AST.HashNode=function(c){this.type="hash";this.pairs=c};Handlebars.AST.IdNode=function(c){this.type="ID";this.original=c.join(".");for(var f=[],a=0,d=0,g=c.length;d<g;d++){var e=c[d];if(".."===e||"."===e||"this"===
e){if(0<f.length)throw new Handlebars.Exception("Invalid path: "+this.original);".."===e?a++:this.isScoped=!0}else f.push(e)}this.parts=f;this.string=f.join(".");this.depth=a;this.isSimple=1===c.length&&!this.isScoped&&0===a;this.stringModeValue=this.string};Handlebars.AST.PartialNameNode=function(c){this.type="PARTIAL_NAME";this.name=c};Handlebars.AST.DataNode=function(c){this.type="DATA";this.id=c};Handlebars.AST.StringNode=function(c){this.type="STRING";this.stringModeValue=this.string=c};Handlebars.AST.IntegerNode=
function(c){this.type="INTEGER";this.integer=c;this.stringModeValue=Number(c)};Handlebars.AST.BooleanNode=function(c){this.type="BOOLEAN";this.bool=c;this.stringModeValue="true"===c};Handlebars.AST.CommentNode=function(c){this.type="comment";this.comment=c}})();var errorProps="description fileName lineNumber message name number stack".split(" ");Handlebars.Exception=function(c){for(var f=Error.prototype.constructor.apply(this,arguments),a=0;a<errorProps.length;a++)this[errorProps[a]]=f[errorProps[a]]};
Handlebars.Exception.prototype=Error();Handlebars.SafeString=function(c){this.string=c};Handlebars.SafeString.prototype.toString=function(){return this.string.toString()};
(function(){var c={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},f=/[&<>"'`]/g,a=/[&<>"'`]/,d=function(a){return c[a]||"&amp;"};Handlebars.Utils={escapeExpression:function(c){return c instanceof Handlebars.SafeString?c.toString():null==c||!1===c?"":!a.test(c)?c:c.replace(f,d)},isEmpty:function(a){return!a&&0!==a?!0:"[object Array]"===Object.prototype.toString.call(a)&&0===a.length?!0:!1}}})();Handlebars.Compiler=function(){};Handlebars.JavaScriptCompiler=function(){};
(function(c,f){c.prototype={compiler:c,disassemble:function(){for(var b=this.opcodes,a,c=[],d,e,f=0,g=b.length;f<g;f++)if(a=b[f],"DECLARE"===a.opcode)c.push("DECLARE "+a.name+"="+a.value);else{d=[];for(var h=0;h<a.args.length;h++)e=a.args[h],"string"===typeof e&&(e='"'+e.replace("\n","\\n")+'"'),d.push(e);c.push(a.opcode+" "+d.join(" "))}return c.join("\n")},equals:function(b){var a=this.opcodes.length;if(b.opcodes.length!==a)return!1;for(var c=0;c<a;c++){var d=this.opcodes[c],e=b.opcodes[c];if(d.opcode!==
e.opcode||d.args.length!==e.args.length)return!1;for(var f=0;f<d.args.length;f++)if(d.args[f]!==e.args[f])return!1}return!0},guid:0,compile:function(b,a){this.children=[];this.depths={list:[]};this.options=a;var c=this.options.knownHelpers;this.options.knownHelpers={helperMissing:!0,blockHelperMissing:!0,each:!0,"if":!0,unless:!0,"with":!0,log:!0};if(c)for(var d in c)this.options.knownHelpers[d]=c[d];return this.program(b)},accept:function(b){return this[b.type](b)},program:function(b){b=b.statements;
var a;this.opcodes=[];for(var c=0,d=b.length;c<d;c++)a=b[c],this[a.type](a);this.isSimple=1===d;this.depths.list=this.depths.list.sort(function(b,a){return b-a});return this},compileProgram:function(b){b=(new this.compiler).compile(b,this.options);var a=this.guid++,c;this.usePartial=this.usePartial||b.usePartial;this.children[a]=b;for(var d=0,e=b.depths.list.length;d<e;d++)c=b.depths.list[d],2>c||this.addDepth(c-1);return a},block:function(b){var a=b.mustache,c=b.program;b=b.inverse;c&&(c=this.compileProgram(c));
b&&(b=this.compileProgram(b));var d=this.classifyMustache(a);"helper"===d?this.helperMustache(a,c,b):"simple"===d?(this.simpleMustache(a),this.opcode("pushProgram",c),this.opcode("pushProgram",b),this.opcode("emptyHash"),this.opcode("blockValue")):(this.ambiguousMustache(a,c,b),this.opcode("pushProgram",c),this.opcode("pushProgram",b),this.opcode("emptyHash"),this.opcode("ambiguousBlockValue"));this.opcode("append")},hash:function(b){b=b.pairs;var a,c;this.opcode("pushHash");for(var d=0,e=b.length;d<
e;d++)a=b[d],c=a[1],this.options.stringParams?this.opcode("pushStringParam",c.stringModeValue,c.type):this.accept(c),this.opcode("assignToHash",a[0]);this.opcode("popHash")},partial:function(b){var a=b.partialName;this.usePartial=!0;b.context?this.ID(b.context):this.opcode("push","depth0");this.opcode("invokePartial",a.name);this.opcode("append")},content:function(b){this.opcode("appendContent",b.string)},mustache:function(b){var a=this.options,c=this.classifyMustache(b);"simple"===c?this.simpleMustache(b):
"helper"===c?this.helperMustache(b):this.ambiguousMustache(b);b.escaped&&!a.noEscape?this.opcode("appendEscaped"):this.opcode("append")},ambiguousMustache:function(b,a,c){b=b.id;var d=b.parts[0],e=null!=a||null!=c;this.opcode("getContext",b.depth);this.opcode("pushProgram",a);this.opcode("pushProgram",c);this.opcode("invokeAmbiguous",d,e)},simpleMustache:function(b){b=b.id;"DATA"===b.type?this.DATA(b):b.parts.length?this.ID(b):(this.addDepth(b.depth),this.opcode("getContext",b.depth),this.opcode("pushContext"));
this.opcode("resolvePossibleLambda")},helperMustache:function(b,a,c){a=this.setupFullMustacheParams(b,a,c);b=b.id.parts[0];if(this.options.knownHelpers[b])this.opcode("invokeKnownHelper",a.length,b);else{if(this.knownHelpersOnly)throw Error("You specified knownHelpersOnly, but used the unknown helper "+b);this.opcode("invokeHelper",a.length,b)}},ID:function(b){this.addDepth(b.depth);this.opcode("getContext",b.depth);b.parts[0]?this.opcode("lookupOnContext",b.parts[0]):this.opcode("pushContext");for(var a=
1,c=b.parts.length;a<c;a++)this.opcode("lookup",b.parts[a])},DATA:function(b){this.options.data=!0;this.opcode("lookupData",b.id)},STRING:function(b){this.opcode("pushString",b.string)},INTEGER:function(b){this.opcode("pushLiteral",b.integer)},BOOLEAN:function(b){this.opcode("pushLiteral",b.bool)},comment:function(){},opcode:function(b){this.opcodes.push({opcode:b,args:[].slice.call(arguments,1)})},declare:function(b,a){this.opcodes.push({opcode:"DECLARE",name:b,value:a})},addDepth:function(b){if(isNaN(b))throw Error("EWOT");
0!==b&&!this.depths[b]&&(this.depths[b]=!0,this.depths.list.push(b))},classifyMustache:function(b){var a=b.isHelper,c=b.eligibleHelper,d=this.options;c&&!a&&(d.knownHelpers[b.id.parts[0]]?a=!0:d.knownHelpersOnly&&(c=!1));return a?"helper":c?"ambiguous":"simple"},pushParams:function(b){for(var a=b.length,c;a--;)if(c=b[a],this.options.stringParams)c.depth&&this.addDepth(c.depth),this.opcode("getContext",c.depth||0),this.opcode("pushStringParam",c.stringModeValue,c.type);else this[c.type](c)},setupMustacheParams:function(b){var a=
b.params;this.pushParams(a);b.hash?this.hash(b.hash):this.opcode("emptyHash");return a},setupFullMustacheParams:function(b,a,c){var d=b.params;this.pushParams(d);this.opcode("pushProgram",a);this.opcode("pushProgram",c);b.hash?this.hash(b.hash):this.opcode("emptyHash");return d}};var a=function(b){this.value=b};f.prototype={nameLookup:function(b,a){return/^[0-9]+$/.test(a)?b+"["+a+"]":f.isValidJavaScriptVariableName(a)?b+"."+a:b+"['"+a+"']"},appendToBuffer:function(b){return this.environment.isSimple?
"return "+b+";":{appendToBuffer:!0,content:b,toString:function(){return"buffer += "+b+";"}}},initializeBuffer:function(){return this.quotedString("")},namespace:"Handlebars",compile:function(b,a,c,d){this.environment=b;this.options=a||{};Handlebars.log(Handlebars.logger.DEBUG,this.environment.disassemble()+"\n\n");this.name=this.environment.name;this.isChild=!!c;this.context=c||{programs:[],environments:[],aliases:{}};this.preamble();this.stackSlot=0;this.stackVars=[];this.registers={list:[]};this.compileStack=
[];this.inlineStack=[];this.compileChildren(b,a);b=b.opcodes;this.i=0;for(p=b.length;this.i<p;this.i++)a=b[this.i],"DECLARE"===a.opcode?this[a.name]=a.value:this[a.opcode].apply(this,a.args);return this.createFunctionContext(d)},nextOpcode:function(){return this.environment.opcodes[this.i+1]},eat:function(){this.i+=1},preamble:function(){var b=[];if(this.isChild)b.push("");else{var a=this.namespace,c="helpers = helpers || "+a+".helpers;";this.environment.usePartial&&(c=c+" partials = partials || "+
a+".partials;");this.options.data&&(c+=" data = data || {};");b.push(c)}this.environment.isSimple?b.push(""):b.push(", buffer = "+this.initializeBuffer());this.lastContext=0;this.source=b},createFunctionContext:function(b){var a=this.stackVars.concat(this.registers.list);0<a.length&&(this.source[1]=this.source[1]+", "+a.join(", "));if(!this.isChild)for(var c in this.context.aliases)this.source[1]=this.source[1]+", "+c+"="+this.context.aliases[c];this.source[1]&&(this.source[1]="var "+this.source[1].substring(2)+
";");this.isChild||(this.source[1]+="\n"+this.context.programs.join("\n")+"\n");this.environment.isSimple||this.source.push("return buffer;");a=this.isChild?["depth0","data"]:["Handlebars","depth0","helpers","partials","data"];c=0;for(var d=this.environment.depths.list.length;c<d;c++)a.push("depth"+this.environment.depths.list[c]);c=this.mergeSource();this.isChild||(d=Handlebars.COMPILER_REVISION,c="this.compilerInfo = ["+d+",'"+Handlebars.REVISION_CHANGES[d]+"'];\n"+c);if(b)return a.push(c),Function.apply(this,
a);b="function "+(this.name||"")+"("+a.join(",")+") {\n  "+c+"}";Handlebars.log(Handlebars.logger.DEBUG,b+"\n\n");return b},mergeSource:function(){for(var b="",a,c=0,d=this.source.length;c<d;c++){var e=this.source[c];e.appendToBuffer?a=a?a+"\n    + "+e.content:e.content:(a&&(b+="buffer += "+a+";\n  ",a=void 0),b+=e+"\n  ")}return b},blockValue:function(){this.context.aliases.blockHelperMissing="helpers.blockHelperMissing";var b=["depth0"];this.setupParams(0,b);this.replaceStack(function(a){b.splice(1,
0,a);return"blockHelperMissing.call("+b.join(", ")+")"})},ambiguousBlockValue:function(){this.context.aliases.blockHelperMissing="helpers.blockHelperMissing";var b=["depth0"];this.setupParams(0,b);var a=this.topStack();b.splice(1,0,a);b[b.length-1]="options";this.source.push("if (!"+this.lastHelper+") { "+a+" = blockHelperMissing.call("+b.join(", ")+"); }")},appendContent:function(b){this.source.push(this.appendToBuffer(this.quotedString(b)))},append:function(){this.flushInline();var b=this.popStack();
this.source.push("if("+b+" || "+b+" === 0) { "+this.appendToBuffer(b)+" }");this.environment.isSimple&&this.source.push("else { "+this.appendToBuffer("''")+" }")},appendEscaped:function(){this.context.aliases.escapeExpression="this.escapeExpression";this.source.push(this.appendToBuffer("escapeExpression("+this.popStack()+")"))},getContext:function(b){this.lastContext!==b&&(this.lastContext=b)},lookupOnContext:function(b){this.push(this.nameLookup("depth"+this.lastContext,b,"context"))},pushContext:function(){this.pushStackLiteral("depth"+
this.lastContext)},resolvePossibleLambda:function(){this.context.aliases.functionType='"function"';this.replaceStack(function(b){return"typeof "+b+" === functionType ? "+b+".apply(depth0) : "+b})},lookup:function(b){this.replaceStack(function(a){return a+" == null || "+a+" === false ? "+a+" : "+this.nameLookup(a,b,"context")})},lookupData:function(b){this.push(this.nameLookup("data",b,"data"))},pushStringParam:function(b,a){this.pushStackLiteral("depth"+this.lastContext);this.pushString(a);"string"===
typeof b?this.pushString(b):this.pushStackLiteral(b)},emptyHash:function(){this.pushStackLiteral("{}");this.options.stringParams&&this.register("hashTypes","{}")},pushHash:function(){this.hash={values:[],types:[]}},popHash:function(){var b=this.hash;this.hash=void 0;this.options.stringParams&&this.register("hashTypes","{"+b.types.join(",")+"}");this.push("{\n    "+b.values.join(",\n    ")+"\n  }")},pushString:function(b){this.pushStackLiteral(this.quotedString(b))},push:function(b){this.inlineStack.push(b);
return b},pushLiteral:function(b){this.pushStackLiteral(b)},pushProgram:function(b){null!=b?this.pushStackLiteral(this.programExpression(b)):this.pushStackLiteral(null)},invokeHelper:function(b,a){this.context.aliases.helperMissing="helpers.helperMissing";var c=this.lastHelper=this.setupHelper(b,a,!0);this.push(c.name);this.replaceStack(function(b){return b+" ? "+b+".call("+c.callParams+") : helperMissing.call("+c.helperMissingParams+")"})},invokeKnownHelper:function(b,a){var c=this.setupHelper(b,
a);this.push(c.name+".call("+c.callParams+")")},invokeAmbiguous:function(b,a){this.context.aliases.functionType='"function"';this.pushStackLiteral("{}");var c=this.setupHelper(0,b,a),d=this.lastHelper=this.nameLookup("helpers",b,"helper"),e=this.nameLookup("depth"+this.lastContext,b,"context"),f=this.nextStack();this.source.push("if ("+f+" = "+d+") { "+f+" = "+f+".call("+c.callParams+"); }");this.source.push("else { "+f+" = "+e+"; "+f+" = typeof "+f+" === functionType ? "+f+".apply(depth0) : "+f+
"; }")},invokePartial:function(b){b=[this.nameLookup("partials",b,"partial"),"'"+b+"'",this.popStack(),"helpers","partials"];this.options.data&&b.push("data");this.context.aliases.self="this";this.push("self.invokePartial("+b.join(", ")+")")},assignToHash:function(b){var a=this.popStack(),c;this.options.stringParams&&(c=this.popStack(),this.popStack());var d=this.hash;c&&d.types.push("'"+b+"': "+c);d.values.push("'"+b+"': ("+a+")")},compiler:f,compileChildren:function(b,a){for(var c=b.children,d,
e,f=0,g=c.length;f<g;f++){d=c[f];e=new this.compiler;var h=this.matchExistingProgram(d);null==h?(this.context.programs.push(""),h=this.context.programs.length,d.index=h,d.name="program"+h,this.context.programs[h]=e.compile(d,a,this.context),this.context.environments[h]=d):(d.index=h,d.name="program"+h)}},matchExistingProgram:function(b){for(var a=0,c=this.context.environments.length;a<c;a++){var d=this.context.environments[a];if(d&&d.equals(b))return a}},programExpression:function(a){this.context.aliases.self=
"this";if(null==a)return"self.noop";var c=this.environment.children[a];a=c.depths.list;for(var d=[c.index,c.name,"data"],e=0,f=a.length;e<f;e++)c=a[e],1===c?d.push("depth0"):d.push("depth"+(c-1));if(0===a.length)return"self.program("+d.join(", ")+")";d.shift();return"self.programWithDepth("+d.join(", ")+")"},register:function(a,c){this.useRegister(a);this.source.push(a+" = "+c+";")},useRegister:function(a){this.registers[a]||(this.registers[a]=!0,this.registers.list.push(a))},pushStackLiteral:function(b){return this.push(new a(b))},
pushStack:function(a){this.flushInline();var c=this.incrStack();a&&this.source.push(c+" = "+a+";");this.compileStack.push(c);return c},replaceStack:function(b){var c="",d=this.isInline(),e;d?(e=this.popStack(!0),e instanceof a?e=e.value:(c=this.stackSlot?this.topStackName():this.incrStack(),c="("+this.push(c)+" = "+e+"),",e=this.topStack())):e=this.topStack();b=b.call(this,e);d?((this.inlineStack.length||this.compileStack.length)&&this.popStack(),this.push("("+c+b+")")):(/^stack/.test(e)||(e=this.nextStack()),
this.source.push(e+" = ("+c+b+");"));return e},nextStack:function(){return this.pushStack()},incrStack:function(){this.stackSlot++;this.stackSlot>this.stackVars.length&&this.stackVars.push("stack"+this.stackSlot);return this.topStackName()},topStackName:function(){return"stack"+this.stackSlot},flushInline:function(){var b=this.inlineStack;if(b.length){this.inlineStack=[];for(var c=0,d=b.length;c<d;c++){var e=b[c];e instanceof a?this.compileStack.push(e):this.pushStack(e)}}},isInline:function(){return this.inlineStack.length},
popStack:function(b){var c=this.isInline(),d=(c?this.inlineStack:this.compileStack).pop();if(!b&&d instanceof a)return d.value;c||this.stackSlot--;return d},topStack:function(b){var c=this.isInline()?this.inlineStack:this.compileStack,c=c[c.length-1];return!b&&c instanceof a?c.value:c},quotedString:function(a){return'"'+a.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\r/g,"\\r")+'"'},setupHelper:function(a,c,d){var e=[];this.setupParams(a,e,d);a=this.nameLookup("helpers",
c,"helper");return{params:e,name:a,callParams:["depth0"].concat(e).join(", "),helperMissingParams:d&&["depth0",this.quotedString(c)].concat(e).join(", ")}},setupParams:function(a,c,d){var e=[],f=[],g=[],n,h;e.push("hash:"+this.popStack());n=this.popStack();if((h=this.popStack())||n)h||(this.context.aliases.self="this",h="self.noop"),n||(this.context.aliases.self="this",n="self.noop"),e.push("inverse:"+n),e.push("fn:"+h);for(h=0;h<a;h++)n=this.popStack(),c.push(n),this.options.stringParams&&(g.push(this.popStack()),
f.push(this.popStack()));this.options.stringParams&&(e.push("contexts:["+f.join(",")+"]"),e.push("types:["+g.join(",")+"]"),e.push("hashTypes:hashTypes"));this.options.data&&e.push("data:data");e="{"+e.join(",")+"}";d?(this.register("options",e),c.push("options")):c.push(e);return c.join(", ")}};for(var d="break else new var case finally return void catch for switch while continue function this with default if throw delete in try do instanceof typeof abstract enum int short boolean export interface static byte extends long super char final native synchronized class float package throws const goto private transient debugger implements protected volatile double import public let yield".split(" "),
g=f.RESERVED_WORDS={},e=0,p=d.length;e<p;e++)g[d[e]]=!0;f.isValidJavaScriptVariableName=function(a){return!f.RESERVED_WORDS[a]&&/^[a-zA-Z_$][0-9a-zA-Z_$]+$/.test(a)?!0:!1}})(Handlebars.Compiler,Handlebars.JavaScriptCompiler);
Handlebars.precompile=function(c,f){if(!c||"string"!==typeof c&&c.constructor!==Handlebars.AST.ProgramNode)throw new Handlebars.Exception("You must pass a string or Handlebars AST to Handlebars.compile. You passed "+c);f=f||{};"data"in f||(f.data=!0);var a=Handlebars.parse(c),a=(new Handlebars.Compiler).compile(a,f);return(new Handlebars.JavaScriptCompiler).compile(a,f)};
Handlebars.compile=function(c,f){if(!c||"string"!==typeof c&&c.constructor!==Handlebars.AST.ProgramNode)throw new Handlebars.Exception("You must pass a string or Handlebars AST to Handlebars.compile. You passed "+c);f=f||{};"data"in f||(f.data=!0);var a;return function(d,g){if(!a){var e=Handlebars.parse(c),e=(new Handlebars.Compiler).compile(e,f),e=(new Handlebars.JavaScriptCompiler).compile(e,f,void 0,!0);a=Handlebars.template(e)}return a.call(this,d,g)}};
Handlebars.VM={template:function(c){var f={escapeExpression:Handlebars.Utils.escapeExpression,invokePartial:Handlebars.VM.invokePartial,programs:[],program:function(a,c,f){var e=this.programs[a];if(f)return Handlebars.VM.program(c,f);e||(e=this.programs[a]=Handlebars.VM.program(c));return e},programWithDepth:Handlebars.VM.programWithDepth,noop:Handlebars.VM.noop,compilerInfo:null};return function(a,d){d=d||{};var g=c.call(f,Handlebars,a,d.helpers,d.partials,d.data),e=f.compilerInfo||[],p=e[0]||1,
b=Handlebars.COMPILER_REVISION;if(p!==b){if(p<b)throw"Template was precompiled with an older version of Handlebars than the current runtime. Please update your precompiler to a newer version ("+Handlebars.REVISION_CHANGES[b]+") or downgrade your runtime to an older version ("+Handlebars.REVISION_CHANGES[p]+").";throw"Template was precompiled with a newer version of Handlebars than the current runtime. Please update your runtime to a newer version ("+e[1]+").";}return g}},programWithDepth:function(c,
f,a){var d=Array.prototype.slice.call(arguments,2);return function(a,e){e=e||{};return c.apply(this,[a,e.data||f].concat(d))}},program:function(c,f){return function(a,d){d=d||{};return c(a,d.data||f)}},noop:function(){return""},invokePartial:function(c,f,a,d,g,e){d={helpers:d,partials:g,data:e};if(void 0===c)throw new Handlebars.Exception("The partial "+f+" could not be found");if(c instanceof Function)return c(a,d);if(Handlebars.compile)return g[f]=Handlebars.compile(c,{data:void 0!==e}),g[f](a,
d);throw new Handlebars.Exception("The partial "+f+" could not be compiled when running in runtime-only mode");}};Handlebars.template=Handlebars.VM.template;


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

Handlebars.getRuntimeTemplate = function (name, obj) {
  if (!Handlebars.templates[name]) {
    Handlebars.templates[name] = Handlebars.compile(document.getElementById(name));
  }
  return Handlebars.templates[name](obj);
}

Handlebars.getCompiledTemplate = function (name, json) {
	var template = Handlebars.getTemplate(name);
	// console.log("compiling template", name, json, template(json));
	return template(json);
}

function isNumber(n) {
  return (Object.prototype.toString.call(n) === '[object Number]' || Object.prototype.toString.call(n) === '[object String]') &&!isNaN(parseFloat(n)) && isFinite(n.toString().replace(/^-/, ''));
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
	    if (date.getFullYear() != (new Date()).getFullYear()) d += " " + date.getFullYear();
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

Handlebars.registerHelper("siblingIndex", function (index, el, sibling, options) {
  if (el[sibling]) return el[sibling][index].textValue;
  return "";
});

Handlebars.registerHelper("singleQuote", function (value, options) {
  if (value) return value.replace(/["]/g,"'");
  return "";
});

/*!
* FitText.js 1.1
*
* Copyright 2011, Dave Rupert http://daverupert.com
* Released under the WTFPL license
* http://sam.zoy.org/wtfpl/
*
* Date: Thu May 05 14:23:00 2011 -0600
*/

(function( $ ){

  $.fn.fitText = function( kompressor, options ) {

    // Setup options
    var compressor = kompressor || 1,
        settings = $.extend({
          'minFontSize' : Number.NEGATIVE_INFINITY,
          'maxFontSize' : Number.POSITIVE_INFINITY
        }, options);

    return this.each(function(){

      // Store the object
      var $this = $(this);

      // Resizer() resizes items based on the object width divided by the compressor * 10
      var resizer = function () {
        $this.css('font-size', Math.max(Math.min($this.width() / (compressor*10), parseFloat(settings.maxFontSize)), parseFloat(settings.minFontSize)));
      };

      // Call once to set.
      resizer();

      // Call on resize. Opera debounces their resize by default.
      $(window).on('resize', resizer);

    });

  };

$.fn.cachedScript = function( url, options ) {
  options = $.extend( options || {}, {
    dataType: "script",
    cache: true,
    url: url
  });
  return $.ajax( options );
};


})( jQuery );

var _magnets_are_go = false,
	_listener;

$(function () {

	$(document).unbind("magnets.refresh").bind("magnets.refresh", function () {
		if (_listener) clearTimeout(_listener);
		if (!_magnets_are_go) return;
		$.get("/engine/action.asp?action=magnet_ping", function(json) {
			$.each(json, function (i, item) {
				var obj = $("[mid='" + json[i].id + "']");
				if (obj.length) {
					if ((parseInt(obj.css("top"),10) != json[i].y) || (parseInt(obj.css("left"),10) != json[i].x)) {
						obj.animate({
							left: json[i].x,
							top: json[i].y,
							"z-index": json[i].z
						},135, function () {
				        	var deg = Math.floor(Math.random()*6+1)-3;
				        	$(obj).css("transform","rotate(" + deg + "deg)");
						});
					}
				} else {
					$("<div />")
						.css({
							left: json[i].x,
							top: json[i].y,
							"z-index": json[i].z
						})
						.css("opacity",0)
						.addClass("magnet")
						.text(json[i].word)
						.attr("mid",json[i].id)
						.appendTo("body")
						.animate({"opacity":1}, (i*50) + 500 + (Math.random() * 1000)); // fadey in effect
				}
			});
			_listener = setTimeout(function () {
				$(document).trigger("magnets.refresh")
			}, 4567);
		});
	});

    //make the magnets draggable and constrained to the fridge (their parent)
    $('.magnet').on('mouseover',function(){
	    $(this).draggable({
	        containment: 'body',
	        stack:'.magnet',
	        stop: function() {
	        	var deg = Math.floor(Math.random()*6+1)-3;
	        	$(this).css("transform","rotate(" + deg + "deg)");
	            $.post('/engine/action.asp?action=magnet_move', { // save it
	            	x: parseInt($(this).css('left')),
	            	y: parseInt($(this).css('top')),
	            	z: parseInt($(this).css('z-index')),
	            	id: $(this).attr('mid')
	            });
	        }
	    });
	});
	$("#magnet-toggle").click(function (e) {
		e.preventDefault();
		if ($(this).text().indexOf(" on!")==-1) {
			$(this).text("Fridge magnets are on!");
			$("#word-adder").show();
			_magnets_are_go = true;
			$(document).trigger("magnets.refresh");
		} else {
			$(this).text("Fridge magnets are off!");
			$("#word-adder").hide();
			_magnets_are_go = false;
			$("div[mid]").animate({"opacity":0},250,function() { $(this).remove(); });
		}
	});

	$("#addAWord").click(function (e) {
		e.preventDefault();
		var word = $("#appendedInputButton").val();
		if (word.length) {
			$.post("/engine/action.asp?action=magnet_add", {
				word: word
			}, function () {
				$("#appendedInputButton").val("");
			});
		}
	});

	$("#randomiseXY").click(function (e) {
		e.preventDefault();
		$.get("/engine/action.asp?action=magnet_randomise"); //, function () {
		//	$(document).trigger("magnets.refresh");
		//});
	})


  if ($.fitText) {

	$(".jumbotron h1").fitText(1.2, { minFontSize: '20px', maxFontSize: '60px' });

}

if ($.button) {

	$(".make-into-buttons a").button();

}

if ($.tooltip) {

	$("#auth-interactions .tooltip").tooltip({
	    position: {
	        my: "center bottom-15",
	        at: "center top",
	        using: function( position, feedback ) {
	            $( this ).css( position );
	            $( "<div>" )
	            .addClass( "arrow bottom" )
	            .addClass( feedback.vertical )
	            .addClass( feedback.horizontal )
	            .appendTo( this );
	        }
	    }
	});

}

	// todo list stuff

/*
	function reBindTodoList() {
		$.getJSON("/engine/action.asp?folder=" + _folder + "&action=todo_get", function (json) {
			var div = $(".modal-body", "#notesModal").html(Handlebars.getCompiledTemplate("todo",json));
			$("#notesModal")
				.on("hidden", function () {
					$(".needs-recalc").trigger("recalc");
				})
				.modal("show");
			$(":checkbox", div).click(function () {
				var $this = $(this);
				$this.parent().removeClass("line-through");
				$.get("/engine/action.asp", {
					"action": "todo_toggle",
					"id": $this.val()
				});
				if ($this.is(":checked")) {
					$this.parent().addClass("line-through");
				}
			});
			$(":text", div).change(function () {
				var $t = $(this);
				if ($t.attr("placeholder") != $t.val()) {
					$.post("/engine/action.asp?folder=" + _folder + "&action=todo_change", {
						"id": $t.attr("data-id"),
						"text": $t.val()
					}, function () {
						$t.attr("placeholder", $t.val());
					});
				}
			});
			$("a",div).click(function(event) {
				event.preventDefault();
				$.post("/engine/action.asp?folder=" + _folder + "&action=todo_remove", {
					"id": $(this).attr("data-id")
				}, function () {
					reBindTodoList();
				});
			});
		});
	}
*/

/*
	$("#todo-items").click(function (event) {
		event.preventDefault();
		reBindTodoList();
	});

	$("#NewToDo").click(function (event) {
		event.preventDefault();
		$.get("/engine/action.asp", {
			id: $("select","#todo-add").val(),
			action: "todo_add",
			text: $("input:text","#todo-add").val()
		}, function (data) {
			$("input:text","#todo-add").val("");
			reBindTodoList();
		});
	});
*/

	// when we have added a todo item we can trigger "recalc" to update the tooltip
	$(".needs-recalc").off("recalc").on("recalc", function () {
		$this = $(this);
		$.get("/engine/action.asp", {
			action: "todocount",
			z: Math.random()
		}, function (count) {
			$this.attr("title", count + " items remaining");
			// clean modal content so next time it shows it re-loads the content path
			try { $("#notesModal").data('modal').$element.removeData(); }
			catch (ex) { } // ignore if empty
		});
	}).trigger("recalc");

	//$("#paste_screenshot").click(function (event) {
	//	$(this).addClass("active").find("span").css("visibility","visible");
	//});

	// bug tracker stuff
/*
	$("#bug-tracker").click(function (event) {
		event.preventDefault();
		ToggleBugTracker();
	});
	$("#new-ticket button").live("click",function (event) {
		var _ta = $.trim($("#new-ticket textarea").val()),
			_level = $("#new-ticket .form-inline").find(":radio:checked").val(),
			_screenshot = "";
		if (_ta.length) {
			$.post("/engine/action.asp?action=ajax_submitbug", {
				text: _ta,
				level: _level,
				screenshot: _screenshot
			}, function (data) {
				$.getJSON("/engine/action.asp?action=ajax_buglist", function (json) {
					$obj.html(Handlebars.getCompiledTemplate("bugs",json));
				});
			});
		}
	});
*/

	//$("#buggr").off("checkr").on("checkr", function () {
	//	$.get("/engine/action.asp", {
	//		action: "ajax-closedbugs",
	//		z: Math.random()
	//	}, function (data) {
	//		console.log("buggr", data);
	//	});
	//}).trigger("checkr");

/*
	$("#bugAdderModal button.btn-primary").click(function () {
		$.post("/engine/action.asp?action=ajax_submitbug", {
			text: $("#bugAdderModal textarea").val(),
			level: $(":checked","#bugAdderModal").val(),
			screenshot: $("#hdnUrl").val()
		}, function(index) {
			// may cause a blocked popup
			var pop = window.open("/engine/pages/tickets/?id=" + index, "_blank");
			popupBlockerChecker.check(pop);
		});
	});
*/

	$('.iris').xeyes({ position: "topRight", reset: true });

	$("body").mousestop(function() {
		$(".watchin").addClass("blink sleep");
//		setTimeout(function() {$(".watchin").removeClass("blink")},100);
	},{
		onStopMove: function () {
			$(".watchin").removeClass("blink");
		},
		delayToStop: '1357'
	});

});

var popupBlockerChecker = {
    check: function(popup_window){
        var _scope = this;
        if (popup_window) {
            if(/chrome/.test(navigator.userAgent.toLowerCase())){
                setTimeout(function () {
                    _scope._is_popup_blocked(_scope, popup_window);
                 },200);
            }else{
                popup_window.onload = function () {
                    _scope._is_popup_blocked(_scope, popup_window);
                };
            }
        }else{
            _scope._displayError();
        }
    },
    _is_popup_blocked: function(scope, popup_window){
        if ((popup_window.innerHeight > 0)==false){ scope._displayError(); }
    },
    _displayError: function(){
        alert("Popup Blocker is enabled! Please add this site to your exception list.");
    }
};

/*
function ToggleBugTracker() {
	return;
	var $obj = $("#bug-tracker-block");
	if ($obj.is(":hidden")) {
		$.getJSON("/engine/action.asp?action=ajax_buglist", function (json) {
			$obj.html(Handlebars.getCompiledTemplate("bugs",json));
			$obj.slideDown("slow");
		});
	} else {
		$obj.slideUp("fast", function () { $obj.empty(); });
	}
	/*
	$obj.slideToggle("slow").promise().done(function () {
		if ($obj.is(":hidden")) {
			$obj.html("<div id='loading-animation'><i class='icon-refresh icon-spin icon-light'></i></div>");
		} else {
			$obj.empty();
		}
	});
}
*/

/*!
 * https://github.com/desandro/imagesloaded
 * imagesLoaded PACKAGED v3.0.2
 * JavaScript is all like "You images are done yet or what?"
 */

(function(e){"use strict";function t(){}function n(e,t){if(r)return t.indexOf(e);for(var n=t.length;n--;)if(t[n]===e)return n;return-1}var i=t.prototype,r=Array.prototype.indexOf?!0:!1;i._getEvents=function(){return this._events||(this._events={})},i.getListeners=function(e){var t,n,i=this._getEvents();if("object"==typeof e){t={};for(n in i)i.hasOwnProperty(n)&&e.test(n)&&(t[n]=i[n])}else t=i[e]||(i[e]=[]);return t},i.getListenersAsObject=function(e){var t,n=this.getListeners(e);return n instanceof Array&&(t={},t[e]=n),t||n},i.addListener=function(e,t){var i,r=this.getListenersAsObject(e);for(i in r)r.hasOwnProperty(i)&&-1===n(t,r[i])&&r[i].push(t);return this},i.on=i.addListener,i.defineEvent=function(e){return this.getListeners(e),this},i.defineEvents=function(e){for(var t=0;e.length>t;t+=1)this.defineEvent(e[t]);return this},i.removeListener=function(e,t){var i,r,s=this.getListenersAsObject(e);for(r in s)s.hasOwnProperty(r)&&(i=n(t,s[r]),-1!==i&&s[r].splice(i,1));return this},i.off=i.removeListener,i.addListeners=function(e,t){return this.manipulateListeners(!1,e,t)},i.removeListeners=function(e,t){return this.manipulateListeners(!0,e,t)},i.manipulateListeners=function(e,t,n){var i,r,s=e?this.removeListener:this.addListener,o=e?this.removeListeners:this.addListeners;if("object"!=typeof t||t instanceof RegExp)for(i=n.length;i--;)s.call(this,t,n[i]);else for(i in t)t.hasOwnProperty(i)&&(r=t[i])&&("function"==typeof r?s.call(this,i,r):o.call(this,i,r));return this},i.removeEvent=function(e){var t,n=typeof e,i=this._getEvents();if("string"===n)delete i[e];else if("object"===n)for(t in i)i.hasOwnProperty(t)&&e.test(t)&&delete i[t];else delete this._events;return this},i.emitEvent=function(e,t){var n,i,r,s=this.getListenersAsObject(e);for(i in s)if(s.hasOwnProperty(i))for(n=s[i].length;n--;)r=t?s[i][n].apply(null,t):s[i][n](),r===!0&&this.removeListener(e,s[i][n]);return this},i.trigger=i.emitEvent,i.emit=function(e){var t=Array.prototype.slice.call(arguments,1);return this.emitEvent(e,t)},"function"==typeof define&&define.amd?define(function(){return t}):e.EventEmitter=t})(this),function(e){"use strict";var t=document.documentElement,n=function(){};t.addEventListener?n=function(e,t,n){e.addEventListener(t,n,!1)}:t.attachEvent&&(n=function(t,n,i){t[n+i]=i.handleEvent?function(){var t=e.event;t.target=t.target||t.srcElement,i.handleEvent.call(i,t)}:function(){var n=e.event;n.target=n.target||n.srcElement,i.call(t,n)},t.attachEvent("on"+n,t[n+i])});var i=function(){};t.removeEventListener?i=function(e,t,n){e.removeEventListener(t,n,!1)}:t.detachEvent&&(i=function(e,t,n){e.detachEvent("on"+t,e[t+n]);try{delete e[t+n]}catch(i){e[t+n]=void 0}});var r={bind:n,unbind:i};"function"==typeof define&&define.amd?define(r):e.eventie=r}(this),function(e){"use strict";function t(e,t){for(var n in t)e[n]=t[n];return e}function n(e){return"[object Array]"===a.call(e)}function i(e){var t=[];if(n(e))t=e;else if("number"==typeof e.length)for(var i=0,r=e.length;r>i;i++)t.push(e[i]);else t.push(e);return t}function r(e,n){function r(e,n,o){if(!(this instanceof r))return new r(e,n);"string"==typeof e&&(e=document.querySelectorAll(e)),this.elements=i(e),this.options=t({},this.options),"function"==typeof n?o=n:t(this.options,n),o&&this.on("always",o),this.getImages(),s&&(this.jqDeferred=new s.Deferred);var h=this;setTimeout(function(){h.check()})}function a(e){this.img=e}r.prototype=new e,r.prototype.options={},r.prototype.getImages=function(){this.images=[];for(var e=0,t=this.elements.length;t>e;e++){var n=this.elements[e];"IMG"===n.nodeName&&this.addImage(n);for(var i=n.querySelectorAll("img"),r=0,s=i.length;s>r;r++){var o=i[r];this.addImage(o)}}},r.prototype.addImage=function(e){var t=new a(e);this.images.push(t)},r.prototype.check=function(){function e(e,r){return t.options.debug&&h&&o.log("confirm",e,r),t.progress(e),n++,n===i&&t.complete(),!0}var t=this,n=0,i=this.images.length;if(this.hasAnyBroken=!1,!i)return this.complete(),void 0;for(var r=0;i>r;r++){var s=this.images[r];s.on("confirm",e),s.check()}},r.prototype.progress=function(e){this.hasAnyBroken=this.hasAnyBroken||!e.isLoaded,this.emit("progress",this,e),this.jqDeferred&&this.jqDeferred.notify(this,e)},r.prototype.complete=function(){var e=this.hasAnyBroken?"fail":"done";if(this.isComplete=!0,this.emit(e,this),this.emit("always",this),this.jqDeferred){var t=this.hasAnyBroken?"reject":"resolve";this.jqDeferred[t](this)}},s&&(s.fn.imagesLoaded=function(e,t){var n=new r(this,e,t);return n.jqDeferred.promise(s(this))});var f={};return a.prototype=new e,a.prototype.check=function(){var e=f[this.img.src];if(e)return this.useCached(e),void 0;if(f[this.img.src]=this,this.img.complete&&void 0!==this.img.naturalWidth)return this.confirm(0!==this.img.naturalWidth,"naturalWidth"),void 0;var t=this.proxyImage=new Image;n.bind(t,"load",this),n.bind(t,"error",this),t.src=this.img.src},a.prototype.useCached=function(e){if(e.isConfirmed)this.confirm(e.isLoaded,"cached was confirmed");else{var t=this;e.on("confirm",function(e){return t.confirm(e.isLoaded,"cache emitted confirmed"),!0})}},a.prototype.confirm=function(e,t){this.isConfirmed=!0,this.isLoaded=e,this.emit("confirm",this,t)},a.prototype.handleEvent=function(e){var t="on"+e.type;this[t]&&this[t](e)},a.prototype.onload=function(){this.confirm(!0,"onload"),this.unbindProxyEvents()},a.prototype.onerror=function(){this.confirm(!1,"onerror"),this.unbindProxyEvents()},a.prototype.unbindProxyEvents=function(){n.unbind(this.proxyImage,"load",this),n.unbind(this.proxyImage,"error",this)},r}var s=e.jQuery,o=e.console,h=o!==void 0,a=Object.prototype.toString;"function"==typeof define&&define.amd?define(["eventEmitter","eventie"],r):e.imagesLoaded=r(e.EventEmitter,e.eventie)}(window);




/**
 * bootbox.js v3.3.0
 *
 * http://bootboxjs.com/license.txt
var bootbox=window.bootbox||function(a,b){function c(a,b){return"undefined"==typeof b&&(b=d),"string"==typeof m[b][a]?m[b][a]:b!=e?c(a,e):a}var d="en",e="en",f=!0,g="static",h="javascript:;",i="",j={},k={},l={};l.setLocale=function(a){for(var b in m)if(b==a)return d=a,void 0;throw new Error("Invalid locale: "+a)},l.addLocale=function(a,b){"undefined"==typeof m[a]&&(m[a]={});for(var c in b)m[a][c]=b[c]},l.setIcons=function(a){k=a,("object"!=typeof k||null===k)&&(k={})},l.setBtnClasses=function(a){j=a,("object"!=typeof j||null===j)&&(j={})},l.alert=function(){var a="",b=c("OK"),d=null;switch(arguments.length){case 1:a=arguments[0];break;case 2:a=arguments[0],"function"==typeof arguments[1]?d=arguments[1]:b=arguments[1];break;case 3:a=arguments[0],b=arguments[1],d=arguments[2];break;default:throw new Error("Incorrect number of arguments: expected 1-3")}return l.dialog(a,{label:b,icon:k.OK,"class":j.OK,callback:d},{onEscape:d||!0})},l.confirm=function(){var a="",b=c("CANCEL"),d=c("CONFIRM"),e=null;switch(arguments.length){case 1:a=arguments[0];break;case 2:a=arguments[0],"function"==typeof arguments[1]?e=arguments[1]:b=arguments[1];break;case 3:a=arguments[0],b=arguments[1],"function"==typeof arguments[2]?e=arguments[2]:d=arguments[2];break;case 4:a=arguments[0],b=arguments[1],d=arguments[2],e=arguments[3];break;default:throw new Error("Incorrect number of arguments: expected 1-4")}var f=function(){return"function"==typeof e?e(!1):void 0},g=function(){return"function"==typeof e?e(!0):void 0};return l.dialog(a,[{label:b,icon:k.CANCEL,"class":j.CANCEL,callback:f},{label:d,icon:k.CONFIRM,"class":j.CONFIRM,callback:g}],{onEscape:f})},l.prompt=function(){var a="",d=c("CANCEL"),e=c("CONFIRM"),f=null,g="";switch(arguments.length){case 1:a=arguments[0];break;case 2:a=arguments[0],"function"==typeof arguments[1]?f=arguments[1]:d=arguments[1];break;case 3:a=arguments[0],d=arguments[1],"function"==typeof arguments[2]?f=arguments[2]:e=arguments[2];break;case 4:a=arguments[0],d=arguments[1],e=arguments[2],f=arguments[3];break;case 5:a=arguments[0],d=arguments[1],e=arguments[2],f=arguments[3],g=arguments[4];break;default:throw new Error("Incorrect number of arguments: expected 1-5")}var h=a,i=b("<form></form>");i.append("<input class='input-block-level' autocomplete=off type=text value='"+g+"' />");var m=function(){return"function"==typeof f?f(null):void 0},n=function(){return"function"==typeof f?f(i.find("input[type=text]").val()):void 0},o=l.dialog(i,[{label:d,icon:k.CANCEL,"class":j.CANCEL,callback:m},{label:e,icon:k.CONFIRM,"class":j.CONFIRM,callback:n}],{header:h,show:!1,onEscape:m});return o.on("shown",function(){i.find("input[type=text]").focus(),i.on("submit",function(a){a.preventDefault(),o.find(".btn-primary").click()})}),o.modal("show"),o},l.dialog=function(c,d,e){function j(){var a=null;"function"==typeof e.onEscape&&(a=e.onEscape()),a!==!1&&x.modal("hide")}var k="",l=[];e||(e={}),"undefined"==typeof d?d=[]:"undefined"==typeof d.length&&(d=[d]);for(var m=d.length;m--;){var n=null,o=null,p=null,q="",r=null;if("undefined"==typeof d[m].label&&"undefined"==typeof d[m]["class"]&&"undefined"==typeof d[m].callback){var s=0,t=null;for(var u in d[m])if(t=u,++s>1)break;1==s&&"function"==typeof d[m][u]&&(d[m].label=t,d[m].callback=d[m][u])}"function"==typeof d[m].callback&&(r=d[m].callback),d[m]["class"]?p=d[m]["class"]:m==d.length-1&&d.length<=2&&(p="btn-primary"),d[m].link!==!0&&(p="btn "+p),n=d[m].label?d[m].label:"Option "+(m+1),d[m].icon&&(q="<i class='"+d[m].icon+"'></i> "),o=d[m].href?d[m].href:h,k="<a data-handler='"+m+"' class='"+p+"' href='"+o+"'>"+q+n+"</a>"+k,l[m]=r}var v=["<div class='bootbox modal' tabindex='-1' style='overflow:hidden;'>"];if(e.header){var w="";("undefined"==typeof e.headerCloseButton||e.headerCloseButton)&&(w="<a href='"+h+"' class='close'>&times;</a>"),v.push("<div class='modal-header'>"+w+"<h3>"+e.header+"</h3></div>")}v.push("<div class='modal-body'></div>"),k&&v.push("<div class='modal-footer'>"+k+"</div>"),v.push("</div>");var x=b(v.join("\n")),y="undefined"==typeof e.animate?f:e.animate;y&&x.addClass("fade");var z="undefined"==typeof e.classes?i:e.classes;return z&&x.addClass(z),x.find(".modal-body").html(c),x.on("keyup.dismiss.modal",function(a){27===a.which&&e.onEscape&&j("escape")}),x.on("click","a.close",function(a){a.preventDefault(),j("close")}),x.on("shown",function(){x.find("a.btn-primary:first").focus()}),x.on("hidden",function(a){a.target===this&&x.remove()}),x.on("click",".modal-footer a",function(a){var c=b(this).data("handler"),e=l[c],f=null;("undefined"==typeof c||"undefined"==typeof d[c].href)&&(a.preventDefault(),"function"==typeof e&&(f=e(a)),f!==!1&&x.modal("hide"))}),b("body").append(x),x.modal({backdrop:"undefined"==typeof e.backdrop?g:e.backdrop,keyboard:!1,show:!1}),x.on("show",function(){b(a).off("focusin.modal")}),("undefined"==typeof e.show||e.show===!0)&&x.modal("show"),x},l.modal=function(){var a,c,d,e={onEscape:null,keyboard:!0,backdrop:g};switch(arguments.length){case 1:a=arguments[0];break;case 2:a=arguments[0],"object"==typeof arguments[1]?d=arguments[1]:c=arguments[1];break;case 3:a=arguments[0],c=arguments[1],d=arguments[2];break;default:throw new Error("Incorrect number of arguments: expected 1-3")}return e.header=c,d="object"==typeof d?b.extend(e,d):e,l.dialog(a,[],d)},l.hideAll=function(){b(".bootbox").modal("hide")},l.animate=function(a){f=a},l.backdrop=function(a){g=a},l.classes=function(a){i=a};var m={br:{OK:"OK",CANCEL:"Cancelar",CONFIRM:"Sim"},da:{OK:"OK",CANCEL:"Annuller",CONFIRM:"Accepter"},de:{OK:"OK",CANCEL:"Abbrechen",CONFIRM:"Akzeptieren"},en:{OK:"OK",CANCEL:"Cancel",CONFIRM:"OK"},es:{OK:"OK",CANCEL:"Cancelar",CONFIRM:"Aceptar"},fr:{OK:"OK",CANCEL:"Annuler",CONFIRM:"D'accord"},it:{OK:"OK",CANCEL:"Annulla",CONFIRM:"Conferma"},nl:{OK:"OK",CANCEL:"Annuleren",CONFIRM:"Accepteren"},pl:{OK:"OK",CANCEL:"Anuluj",CONFIRM:"Potwierdź"},ru:{OK:"OK",CANCEL:"Отмена",CONFIRM:"Применить"},zh_CN:{OK:"OK",CANCEL:"取消",CONFIRM:"确认"},zh_TW:{OK:"OK",CANCEL:"取消",CONFIRM:"確認"}};return l}(document,window.jQuery);window.bootbox=bootbox;
 */

// https://github.com/jeresig/jquery.hotkeys
/*
(function(e){function g(a){"string"===typeof a.data&&(a.data={keys:a.data});if(a.data&&a.data.keys&&"string"===typeof a.data.keys){var g=a.handler,h=a.data.keys.toLowerCase().split(" "),k="text password number email url range date month week time datetime datetime-local search color tel".split(" ");a.handler=function(c){if(this===c.target||!(/textarea|select/i.test(c.target.nodeName)||-1<e.inArray(c.target.type,k))){var d=e.hotkeys.specialKeys[c.keyCode],a="keypress"===c.type&&String.fromCharCode(c.which).toLowerCase(),
b="",f={};c.altKey&&"alt"!==d&&(b+="alt+");c.ctrlKey&&"ctrl"!==d&&(b+="ctrl+");c.metaKey&&(!c.ctrlKey&&"meta"!==d)&&(b+="meta+");c.shiftKey&&"shift"!==d&&(b+="shift+");d&&(f[b+d]=!0);a&&(f[b+a]=!0,f[b+e.hotkeys.shiftNums[a]]=!0,"shift+"===b&&(f[e.hotkeys.shiftNums[a]]=!0));d=0;for(a=h.length;d<a;d++)if(f[h[d]])return g.apply(this,arguments)}}}}e.hotkeys={version:"0.8",specialKeys:{8:"backspace",9:"tab",10:"return",13:"return",16:"shift",17:"ctrl",18:"alt",19:"pause",20:"capslock",27:"esc",32:"space",
33:"pageup",34:"pagedown",35:"end",36:"home",37:"left",38:"up",39:"right",40:"down",45:"insert",46:"del",96:"0",97:"1",98:"2",99:"3",100:"4",101:"5",102:"6",103:"7",104:"8",105:"9",106:"*",107:"+",109:"-",110:".",111:"/",112:"f1",113:"f2",114:"f3",115:"f4",116:"f5",117:"f6",118:"f7",119:"f8",120:"f9",121:"f10",122:"f11",123:"f12",144:"numlock",145:"scroll",186:";",191:"/",220:"\\",222:"'",224:"meta"},shiftNums:{"`":"~",1:"!",2:"@",3:"#",4:"$",5:"%",6:"^",7:"&",8:"*",9:"(",0:")","-":"_","=":"+",";":": ",
"'":'"',",":"<",".":">","/":"?","\\":"|"}};e.each(["keydown","keyup","keypress"],function(){e.event.special[this]={add:g}})})(this.jQuery);
*/


// converts xml into json, used predominantly by quiz.xml
function xml2Obj (oXMLNode) {
    var vResult = true;

    // node attributes
    if (oXMLNode.attributes && oXMLNode.attributes.length > 0) {
        var iAttrib;
        vResult = {};
        // vResult["@attributes"] = {};
        for (var iAttrId = 0; iAttrId < oXMLNode.attributes.length; iAttrId++) {
            iAttrib = oXMLNode.attributes.item(iAttrId);
            // vResult["@attributes"][iAttrib.nodeName] = iAttrib.nodeValue;
            vResult[iAttrib.nodeName] = iAttrib.nodeValue;
        }
    }
    // children, including text
    if (oXMLNode.hasChildNodes()) {
        var iKey, iValue, iXMLChild;
        if (true === vResult) { vResult = {}; }
        for (var iChild = 0; iChild < oXMLNode.childNodes.length; iChild++) {
            iXMLChild = oXMLNode.childNodes.item(iChild);
            if (1 === (iXMLChild.nodeType & 7)) { // nodeType is "Document" (9) or "Element" (1)
                iKey = iXMLChild.nodeName;
                iValue = xml2Obj(iXMLChild);
                if (vResult.hasOwnProperty(iKey)) {
                    if (Array !== vResult[iKey].constructor) { vResult[iKey] = [vResult[iKey]]; }
                    vResult[iKey].push(iValue);
                } else { vResult[iKey] = iValue; }
            } else if (3 === (iXMLChild.nodeType - 1 | 1)) { // nodeType is "Text" (3) or "CDATASection" (4)
                // iKey = "@content";
                iKey = "textValue"; // property to access raw stringvalue of node
                iValue = 3 === iXMLChild.nodeType ? iXMLChild.nodeValue.replace(/^\s+|\s+$/g, "") : iXMLChild.nodeValue;
                if (vResult.hasOwnProperty(iKey)) { vResult[iKey] += iValue; }
                else if (4 === iXMLChild.nodeType || "" !== iValue) { vResult[iKey] = iValue; }
            }
        }
    }
    return(vResult);
}

function hex2rgba(hx,a) {
	var m = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(hx),
		r = parseInt(m[1],16),
		g = parseInt(m[2],16),
		b = parseInt(m[3],16);
	return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}

  // Allow user to set any option except for dataType, cache, and url
jQuery.cachedScript = function( url, options ) {
  options = $.extend( options || {}, {
    dataType: "script",
    cache: true,
    url: url
  });
  return jQuery.ajax( options );
};

// Usage
//$.cachedScript( "ajax/test.js", { cache: false } ).done(function( script, textStatus ) {
//  console.log( textStatus );
//});
// $.cachedScript("/engine/layout/js/tabs//quiz.js").done(function() {
//	 ... code that is equivalent to tab code for quiz
// });

function bindAutoRevealers(block) {
	function hideFocusBlocks() {
		$(".focus-block", block).hide();
	}
	$(".focus-reveals", block).each(function (index,el) {
		$(el).focus(function() {
			hideFocusBlocks();
			$(this).next().show();
		});
	});
	hideFocusBlocks();
}

var toolbarjson = {
	"purpose": [
		{
			"name": "Elements",
			"group": [
				{
					"label":"Images, Video & Audio",
					"commands": [
						{"text":"right-hand images" , "command":"{rightimages %images%}"},
						{"text":"single image" , "command":"{image %image%}"},
						{"text":"slideshow" , "command":"{slideshow %effect%|%pictures%}"},
						{"text":"Video (inline)", "command":"{inlinevideo %videosize%|%linkurl%}", "icon":"icon-youtube"},
						{"text":"Video (fullscreen), Play button", "command":"{fullscreenvideo %linkurl%}"},
						{"text":"Video (fullscreen), Image button", "command": "{fullscreenvideoimage %image%|%linkurl%}"},
						// {"text":"stretch right image", "command": "{backstretch %image%}"},
						{"text":"Captioned image", "command": "{caption black|%image%|%selection%}", "helper":"selector", "values":["black","white","theme"]}
					]
				},
				{
					"label":"Background images",
					"commands": [
						{"text":"page background", "command":"{pagebg %image%}"},
						{"text":"grid background", "command":"{gridbg %image%}"},
						{"text":"column background", "command":"{columnbg %image%}"}
					]
				},
				{
					"label": "Data loaders",
					"commands": [
						//{"text":"load a quiz" , "command":"{quiz 500|%xml%}", "helper":"height", "nestable": false},
						{"text":"load and parse external file" , "command":"{parse %url%}"},
						{"text":"load but do not parse external file" , "command":"{load %url%}"},
						{"text":"iframe", "command": "{iframe 500|%link%}", "helper":"height"},
						{"text":"slidebox (vertical)", "command": "{slidebox vertical|text, image or url for first page|text, image or url for subsequent pages}", "helpers": ["select"], "values": ["horizontal","vertical"]},
						{"text":"slidebox (horizontal)", "command": "{slidebox horizontal|text, image or url for first page|text, image or url for subsequent pages}", "helpers": ["select"], "values": ["horizontal","vertical"]}
					]
				},
				{
					"label": "Utilities",
					"commands": [
						{"text":"any html tag" , "command":"{tag tag|%selection%}"},
						{"text":"any html tag (with css class)" , "command":"{tag tag.className|%selection%}"},
						{"text":"clearfix" , "command":"{clear both}"},
						{"text":"line break (br)" , "command":"{br}"},
						{"text":"line split (p)" , "command":"{/}"},
						{"text":"classname (inline)" , "command":"{wrap classname|%selection%}"},
						{"text":"classname (block)" , "command":"{block classname|%selection%}"},
						{"text":"Strip all HTML from source code", "command":"//stripHTML//", "icon":"icon-bolt"},
						{"text":"Strip all except BODY from source code", "command":"//stripHEAD//", "icon":"icon-bookmark-empty"},
						{"text":"Try to convert stuff automatically", "command":"//convertAUTO//", "icon":"icon-bookmark"},
						{"text":"Insert media", "command":"//insert-media//"},
						{"text":"use right column", "command":"{right %selection%}"},
						{"text":"Convert selection to parse include", "command":"//convertBLOCK//", "icon":"icon-file-text"}
					]
				}
			]
		},
		{
			"name": "Interactions",
			"group": [
				{
					"label": "Overlays & Popups",
					"commands": [
						//{"text":"balloon popup" , "command":"{balloon %selection%|tip-text}", "icon":"icon-comment-alt"},
						{"text":"lightbox popup (button)" , "command":"{popup %selection%|%url%}", "icon":"icon-external-link"},
						{"text":"lightbox popup (text)" , "command":"{popuptext %selection%|%url%}"},
						{"text":"tip (button)" , "command":"{tipbutton %selection%|title box text|tip text in here}"},
						{"text":"tip (text)" , "command":"{tiptext %selection%|tip text in here}"},
						{"text":"glossary term" , "command":"{term %term%}"},
						{"text":"reference number" , "command":"{ref %ref%}"}
					]
				},
				{
					"label": "Interactions",
					"commands": [
						{"text":"fastfact" , "command":"{fastfact Fast Fact|%selection%}"},
						{"text":"flip cards" , "command":"{flip front-1|rear-1|front-N|rear-N}"},
						{"text":"scorm checkbox selection" , "command":"{clickcheck label 1|label ..|label N}"},
						{"text":"scorm true/false selection" , "command":"{clicktf true|false|label 1|label ..|label N}", "helpers":["select"],"values":["true","false"]},
						{"text":"scorm image selection" , "command":"{clickimage %images%}"},
						{"text":"scorm match activity" , "command":"{match Question 1|Answer 1|Question 2|Answer 2|Question N|Answer N}"},
						{"text":"scorm match-set activity" , "command":"{matchset Question 1|Answer 1|Question 2|Answer 2|Question N|Answer N}"},
						{"text":"survey" , "command":"{survey no-options|question 1|question ..|question N}"},
						{"text":"accordion", "command":"{accordion title 1|url 1|title ..|url ..|title N|url N}", "pilledit": true, "helpers": ["pilledit"], "icon": "icon-reorder", "nestable": false},
						{"text":"tab bar" , "command":"{tabs title 1|url 1|title ..|url ..|title N|url N}", "pilledit": true, "helpers": ["pilledit"], "icon": "icon-folder-close-alt", "nestable": false},
						{"text":"zoom-image" , "command":"{zoomimage %thumbnail%|%image%}"},
						{"text":"Split image", "command": "{splitimage %left%|%right%}"}
					]
				},
				{
					"label": "Pages",
					"commands": [
						{"text":"completion page" , "command":"{completion You-have-completed...|You-have-not-yet-completed...}"},
						{"text":"ifcomplete switch" , "command":"{ifcomplete complete-text|incomplete-text}"}
					]
				}
			]
		},
		{
			"name": "Formatters",
			"group": [
				{
					"label": "Formatting",
					"commands": [
						{"text":"h1" , "command":"{tag h1|%selection%}"},
						{"text":"h2" , "command":"{tag h2|%selection%}"},
						{"text":"bold" , "command":"{bold %selection%}", "icon":"icon-bold"},
						{"text":"italic" , "command":"{italic %selection%}", "icon":"icon-italic"},
						{"text":"numbered list" , "command":"{numbers item 1|item ..|item N}", "icon":"icon-list-ol", "easyedit": true, "helpers": ["textlist"]},
						{"text":"bulleted list" , "command":"{bullets point 1|point ..|point N}", "icon":"icon-list-ul", "easyedit": true, "helpers": ["textlist"]},
						{"text":"centered (div)" , "command":"{centered %selection%}", "icon":"icon-align-center"},
						{"text":"centered (p)" , "command":"{centerp %selection%}"},
						{"text":"link (go to page)" , "command":"{link %url%|%selection%}", "icon":"icon-link"},
						{"text":"link (reference)" , "command":"{linkref %url%|%selection%}"},
						{"text":"link (open in new window)" , "command":"{external %link%|%selection%}"},
						{"text":"block quote" , "command":"{quote %selection%}"},
						{"text":"columns", "command":"{columns column 1|column ..|column 5}", "pilledit": true, "helpers": ["pilledit"]},
						{"text":"float left", "command":"{float left|%selection%}"},
						{"text":"float right", "command":"{float right|%selection%}"},
						// {"text":"Line break", "command":"{/}"},
						// {"text":"Blank single line", "command":"{/blank-line/}"},
						{"text":"Horizontal line", "command":"{-}"}
					]
				},
				{
					"label": "Formatter blocks",
					"commands": [
						{"text":"Column splitter", "command":"<|>"},
						{"text":"Fold splitter", "command":"<->"},
						{"text":"Grid 3414", "command":"<layout grid3414>"},
						{"text":"Grid 3525", "command":"<layout grid3525>"},
						{"text":"Grid 1212 L", "command":"<layout grid1212L>"},
						{"text":"Grid 1212 R", "command":"<layout grid1212R>"}
					]
				}
			]
		}
	],
	"grid": $("a.jstree-clicked","#xmlTree").closest("li").attr("template"),
	"grids": [
		{"value":"", "label": "<i class='icon-th-large'></i> Auto"},
		{"value":"grid3414", "label": "<i class='icon-columns'></i> <u>&frac34;</u> : &frac14;"},
		{"value":"grid3525", "label": "<i class='icon-columns'></i> <u>&frac35;</u> : &frac25;"},
		{"value":"grid1212l", "label": "<i class='icon-columns'></i> <u>&frac12;</u> : &frac12;"},
		{"value":"grid1212r", "label": "<i class='icon-columns'></i> &frac12; : <u>&frac12;</u>"},
		{"value":"grid0", "label": "<i class='icon-check-empty'></i> None"}
	]
};

var MediaOverlay = (function(window,document,$,undefined) {

	var active_region = null;

	var _show = function(course_id, region_name, current_selection) {
		window.scrollTo(0,0);
		var encoded_value = "";
		if (current_selection.length) {
			encoded_value = btoa(encodeURIComponent(current_selection).replace(/%([0-9A-F]{2})/g, function toSolidBytes(match, p1) {
		            return String.fromCharCode('0x' + p1);
		    })).replace('+','-').replace('/','_').replace('=',',') + "/"; // to match format expected by Text::base64dec()
		}
		active_region = region_name;
		var div = document.createElement("div");
		div.style = "position:fixed;top:0;left:0;right:0;bottom:0;background-color:rgba(0,0,0,.5);z-index:1091;";
		div.setAttribute("id","media-overlay");
		var iframe = document.createElement("iframe");
		iframe.style = "position:fixed;top:50px;left:50px;width:calc(100vw - 100px);height:calc(100vh - 100px);border:none;background-color:#fff;box-shadow:0 0 25px rgba(0,0,0,.5);";
		iframe.setAttribute("src", "/app/media/index/" + course_id + "/insert/" + region_name + "/" + encoded_value);
		div.appendChild(iframe);
		document.querySelector("body").appendChild(div);
		document.querySelector("body").className += " noscroll";
	}

	var _hide = function () {
		var mo = document.getElementById("media-overlay");
		if (mo) mo.style.display = "none";
		document.querySelector("body").className = document.querySelector("body").className.replace("noscroll","");
	}

	var _insert = function(source) {
		if (active_region) {
			replace_selection(active_region, source);
		}
		MediaOverlay.close();
	}

	var _close = function () {
		var mo = document.getElementById("media-overlay");
		if (mo) mo.parentNode.removeChild(mo);
		document.querySelector("body").className = document.querySelector("body").className.replace("noscroll","");
	}

	return {
		Show: _show,
		Hide: _hide,
		Close: _close,
		Insert: _insert
	}
})(window,document,jQuery);

function nOEmbed(url, callback) {
	$.getJSON("https://noembed.com/embed", {
		format: 'json',
		url: url
	}, function(data) {
		if (data.error) callback(data.url);
		var doc = document.implementation.createHTMLDocument("foo");
		doc.documentElement.innerHTML = data.html;
		callback(doc.querySelector("iframe[src]").getAttribute("src"));
	});
}

// https://github.com/blueimp/JavaScript-MD5/blob/master/js/md5.min.js
// var hash = md5("value"); // "2063c1608d6e0baf80249c42e2be5804"
!function(n){"use strict";function t(n,t){var r=(65535&n)+(65535&t);return(n>>16)+(t>>16)+(r>>16)<<16|65535&r}function r(n,t){return n<<t|n>>>32-t}function e(n,e,o,u,c,f){return t(r(t(t(e,n),t(u,f)),c),o)}function o(n,t,r,o,u,c,f){return e(t&r|~t&o,n,t,u,c,f)}function u(n,t,r,o,u,c,f){return e(t&o|r&~o,n,t,u,c,f)}function c(n,t,r,o,u,c,f){return e(t^r^o,n,t,u,c,f)}function f(n,t,r,o,u,c,f){return e(r^(t|~o),n,t,u,c,f)}function i(n,r){n[r>>5]|=128<<r%32,n[14+(r+64>>>9<<4)]=r;var e,i,a,d,h,l=1732584193,g=-271733879,v=-1732584194,m=271733878;for(e=0;e<n.length;e+=16)i=l,a=g,d=v,h=m,g=f(g=f(g=f(g=f(g=c(g=c(g=c(g=c(g=u(g=u(g=u(g=u(g=o(g=o(g=o(g=o(g,v=o(v,m=o(m,l=o(l,g,v,m,n[e],7,-680876936),g,v,n[e+1],12,-389564586),l,g,n[e+2],17,606105819),m,l,n[e+3],22,-1044525330),v=o(v,m=o(m,l=o(l,g,v,m,n[e+4],7,-176418897),g,v,n[e+5],12,1200080426),l,g,n[e+6],17,-1473231341),m,l,n[e+7],22,-45705983),v=o(v,m=o(m,l=o(l,g,v,m,n[e+8],7,1770035416),g,v,n[e+9],12,-1958414417),l,g,n[e+10],17,-42063),m,l,n[e+11],22,-1990404162),v=o(v,m=o(m,l=o(l,g,v,m,n[e+12],7,1804603682),g,v,n[e+13],12,-40341101),l,g,n[e+14],17,-1502002290),m,l,n[e+15],22,1236535329),v=u(v,m=u(m,l=u(l,g,v,m,n[e+1],5,-165796510),g,v,n[e+6],9,-1069501632),l,g,n[e+11],14,643717713),m,l,n[e],20,-373897302),v=u(v,m=u(m,l=u(l,g,v,m,n[e+5],5,-701558691),g,v,n[e+10],9,38016083),l,g,n[e+15],14,-660478335),m,l,n[e+4],20,-405537848),v=u(v,m=u(m,l=u(l,g,v,m,n[e+9],5,568446438),g,v,n[e+14],9,-1019803690),l,g,n[e+3],14,-187363961),m,l,n[e+8],20,1163531501),v=u(v,m=u(m,l=u(l,g,v,m,n[e+13],5,-1444681467),g,v,n[e+2],9,-51403784),l,g,n[e+7],14,1735328473),m,l,n[e+12],20,-1926607734),v=c(v,m=c(m,l=c(l,g,v,m,n[e+5],4,-378558),g,v,n[e+8],11,-2022574463),l,g,n[e+11],16,1839030562),m,l,n[e+14],23,-35309556),v=c(v,m=c(m,l=c(l,g,v,m,n[e+1],4,-1530992060),g,v,n[e+4],11,1272893353),l,g,n[e+7],16,-155497632),m,l,n[e+10],23,-1094730640),v=c(v,m=c(m,l=c(l,g,v,m,n[e+13],4,681279174),g,v,n[e],11,-358537222),l,g,n[e+3],16,-722521979),m,l,n[e+6],23,76029189),v=c(v,m=c(m,l=c(l,g,v,m,n[e+9],4,-640364487),g,v,n[e+12],11,-421815835),l,g,n[e+15],16,530742520),m,l,n[e+2],23,-995338651),v=f(v,m=f(m,l=f(l,g,v,m,n[e],6,-198630844),g,v,n[e+7],10,1126891415),l,g,n[e+14],15,-1416354905),m,l,n[e+5],21,-57434055),v=f(v,m=f(m,l=f(l,g,v,m,n[e+12],6,1700485571),g,v,n[e+3],10,-1894986606),l,g,n[e+10],15,-1051523),m,l,n[e+1],21,-2054922799),v=f(v,m=f(m,l=f(l,g,v,m,n[e+8],6,1873313359),g,v,n[e+15],10,-30611744),l,g,n[e+6],15,-1560198380),m,l,n[e+13],21,1309151649),v=f(v,m=f(m,l=f(l,g,v,m,n[e+4],6,-145523070),g,v,n[e+11],10,-1120210379),l,g,n[e+2],15,718787259),m,l,n[e+9],21,-343485551),l=t(l,i),g=t(g,a),v=t(v,d),m=t(m,h);return[l,g,v,m]}function a(n){var t,r="",e=32*n.length;for(t=0;t<e;t+=8)r+=String.fromCharCode(n[t>>5]>>>t%32&255);return r}function d(n){var t,r=[];for(r[(n.length>>2)-1]=void 0,t=0;t<r.length;t+=1)r[t]=0;var e=8*n.length;for(t=0;t<e;t+=8)r[t>>5]|=(255&n.charCodeAt(t/8))<<t%32;return r}function h(n){return a(i(d(n),8*n.length))}function l(n,t){var r,e,o=d(n),u=[],c=[];for(u[15]=c[15]=void 0,o.length>16&&(o=i(o,8*n.length)),r=0;r<16;r+=1)u[r]=909522486^o[r],c[r]=1549556828^o[r];return e=i(u.concat(d(t)),512+8*t.length),a(i(c.concat(e),640))}function g(n){var t,r,e="";for(r=0;r<n.length;r+=1)t=n.charCodeAt(r),e+="0123456789abcdef".charAt(t>>>4&15)+"0123456789abcdef".charAt(15&t);return e}function v(n){return unescape(encodeURIComponent(n))}function m(n){return h(v(n))}function p(n){return g(m(n))}function s(n,t){return l(v(n),v(t))}function C(n,t){return g(s(n,t))}function A(n,t,r){return t?r?s(t,n):C(t,n):r?m(n):p(n)}"function"==typeof define&&define.amd?define(function(){return A}):"object"==typeof module&&module.exports?module.exports=A:n.md5=A}(this);

// popup window centered PopupCenter(location,title,width,height)
function PopupCenter(a,d,b,c){var e=void 0!=window.screenLeft?window.screenLeft:screen.left,f=void 0!=window.screenTop?window.screenTop:screen.top;width=window.innerWidth?window.innerWidth:document.documentElement.clientWidth?document.documentElement.clientWidth:screen.width;height=window.innerHeight?window.innerHeight:document.documentElement.clientHeight?document.documentElement.clientHeight:screen.height;a=window.open(a,d,"scrollbars=yes, width="+b+", height="+c+", top="+(height/2-c/2+f)+", left="+
(width/2-b/2+e) + ', resizable=yes');window.focus&&a.focus()};
