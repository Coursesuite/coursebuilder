<!DOCTYPE html>
<%
dim path : path = replace(request("sco"),"/courses/","")
dim title : title = replace(path,"/", " / ")
dim sco : sco = request("sco")
%>
<html lang="en">
	<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=1024,maximum-scale=1.0">
	<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
	<title><%=title%></title>
	<style>
	*,*:before,*:after{box-sizing: border-box}
	body,html {min-height:100vh;}
	body {
	    background-color: #3757D0;
	    background-image: -webkit-radial-gradient(#81BCFF, #303391);
	    background-image: radial-gradient(#81BCFF, #303391);
	    background-size: 100%;
	    background-repeat: no-repeat;
	    background-attachment: fixed;
		font-family: sans-serif;
		margin: 0;
		color: #fff;
		display: flex;
		flex-direction: column;
	}
	header {
		box-shadow: inset 0 0 200px rgba(0,0,0,.5);
		padding: 10px;
	}
	header div {
		float: right;
	}
	header h1, header p {
		margin: 10px;
		padding: 0;
	}
	header h1 {
		font-size: 24px;
	}
	.content {
		margin: 0 auto;
		width: 960px;
	}
	main {
		position: relative;
		flex: 1;
		overflow: auto;
	}
	main article {
	    position: absolute;
	    top: 50%;
	    left: 50%;
	    transform: translate(-50%, -50%);
	}

	iframe {
		width: 100%;
		height: 100%;
		border: none;
		background-color: transparent;
	}

	footer p {
		text-align: center;
	}
	#log {
		width: 100%;
		height: 100px;
		overflow: auto;
		font-size: 0.85rem;
	}
	#log b {
		color: #ff0;
	}
	
	</style>
	<script type="text/javascript">

/*  https://github.com/js-cookie/js-cookie */
(function(m){var h=!1;"function"===typeof define&&define.amd&&(define(m),h=!0);"object"===typeof exports&&(module.exports=m(),h=!0);if(!h){var e=window.Cookies,a=window.Cookies=m();a.noConflict=function(){window.Cookies=e;return a}}})(function(){function m(){for(var e=0,a={};e<arguments.length;e++){var b=arguments[e],c;for(c in b)a[c]=b[c]}return a}function h(e){function a(b,c,d){if("undefined"!==typeof document){if(1<arguments.length){d=m({path:"/"},a.defaults,d);if("number"===typeof d.expires){var k=
new Date;k.setMilliseconds(k.getMilliseconds()+864E5*d.expires);d.expires=k}d.expires=d.expires?d.expires.toUTCString():"";try{var g=JSON.stringify(c);/^[\{\[]/.test(g)&&(c=g)}catch(p){}c=e.write?e.write(c,b):encodeURIComponent(String(c)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent);b=encodeURIComponent(String(b));b=b.replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent);b=b.replace(/[\(\)]/g,escape);g="";for(var l in d)d[l]&&(g+="; "+l,!0!==d[l]&&(g+="="+
d[l]));return document.cookie=b+"="+c+g}b||(g={});l=document.cookie?document.cookie.split("; "):[];for(var h=/(%[0-9A-Z]{2})+/g,n=0;n<l.length;n++){var q=l[n].split("="),f=q.slice(1).join("=");'"'===f.charAt(0)&&(f=f.slice(1,-1));try{k=q[0].replace(h,decodeURIComponent);f=e.read?e.read(f,k):e(f,k)||f.replace(h,decodeURIComponent);if(this.json)try{f=JSON.parse(f)}catch(p){}if(b===k){g=f;break}b||(g[k]=f)}catch(p){}}return g}}a.set=a;a.get=function(b){return a.call(a,b)};a.getJSON=function(){return a.apply({json:!0},
[].slice.call(arguments))};a.defaults={};a.remove=function(b,c){a(b,"",m(c,{expires:-1}))};a.withConverter=h;return a}return h(function(){})});
	(function(){
    	var oldLog = console.log;
		console.log = function () {
			var now = new Date(), h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
			var ts = "<b>" + [h<10?"0"+h:h,m<10?"0"+m:m,s<10?"0"+s:s," "].join(":") + "</b>";
			var output = document.getElementById("log");
			var el = document.createElement("div");
			el.innerHTML = ts + [].slice.call(arguments).join(", ");
			output.appendChild(el);
			output.scrollTop = 99999;
        	oldLog.apply(console, arguments);
    	};
	})();
	</script>
    <script id="external-scormapi" type="text/javascript" src="scorm12datamodel.js"></script>
</head>
<body>
	<header>
		<div>
			<button onclick="document.getElementById('scorm_object').setAttribute('src','<%=sco%>');return false;">Simulate load</button>
			<button onclick="document.getElementById('scorm_object').setAttribute('src','about:blank');return false;">Simulate unload</button>
			<button onclick="location.reload(true);">Reload page</button>
		</div>
		<h1>Scorm 1.2 Preview</h1>
		<p>Now playing: ~/<%=path%></p>
	</header>
	<main>
		<article id="wrapper">
            <iframe id="scorm_object" name="scorm_frame" src="<%=sco%>" width="100%" height="100%" frameborder="false" allowtransparency="true" scrolling="no" seamless="seamless" style="overflow:hidden" onbeforeunload="API.LMSFinish()"></iframe>
		</article>
	</main>
	<footer>
		<p>
			<button onclick="size(640,960);return false;" title='640 wide by 960 high'>Phone P</button>
			<button onclick="size(960,640);return false;" title='960 wide by 640 high'>Phone L</button>
			<button onclick="size(768,1024);return false;" title='768 wide by 1024 high'>Tablet P</button>
			<button onclick="size(1024,768);return false;" title='1024 wide by 768 high'>Tablet L</button>
			<button onclick="size(1920,1080);return false;" title='1920 wide by 1080 high'>HD Desktop</button>
			<button onclick="size(1000,600);return false;" title='1000 wide by 600 high'>1000 x 600</button>
			<button onclick="size(960,600);return false;" title='960 wide by 600 high'>960 x 600</button>
			<button onclick="size(1024,600);return false;" title='1024 wide by 600 high'>1024 x 600</button>
			<button onclick="size('50%','50%');return false;" title='50% of space'>50% x 50%</button>
			<button onclick="size('100%','100%');return false;" title='fill space'>100% x 100%</button>
			W:<input type="number" min="100" max="4096" step="1" id="w" oninput="customSize()">
			H:<input type="number" min="100" max="4096" step="1" id="h" oninput="customSize()">
		</p>
		<div id="log"></div>
	</footer>
	<script type="text/javascript">
	function size(w,h,save) {
		if (w.toString().indexOf("px")===-1) {
			if (w.toString().indexOf("%")===-1) {
				w += "px";
			}
		}
		if (h.toString().indexOf("px")===-1) {
			if (h.toString().indexOf("%")===-1) {
				h += "px";
			}
		}
		if (save) {
			Cookies.set("width",w,{path:"/scorm"});
			Cookies.set("height",h,{path:"/scorm"});
		}
		document.getElementById("wrapper").style = "width:" + w + ";height:" + h + ";";
		document.getElementById("w").value = parseInt(w,10);
		document.getElementById("h").value = parseInt(h,10);
	}
	window.onload = function () {
		var w = Cookies.get("width") || "960px",
			h = Cookies.get("height") || "600px";
		if (w.indexOf("px")!==-1) w = parseInt(w,10);
		if (h.indexOf("px")!==-1) h = parseInt(h,10);
		if (w<380) w = 380; // small but not rediculous
		if (h<320) h = 320;
		if (w && h) {
			size(w,h,false);
		} else {
			size("960px","600px",true);
		}
	}
	function customSize() {
		var w = document.getElementById("w").value + "px";
		var h = document.getElementById("h").value + "px";
		size(w,h,true);
	}
	</script>
</body>
</html>