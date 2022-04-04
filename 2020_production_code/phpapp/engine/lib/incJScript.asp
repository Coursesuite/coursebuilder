<script language="Javascript" runat="server">

// quick way for vbscript to convert gmt to local time .. is to use jscript
function localize(t) {
  var d=new Date(t+" UTC");
  return d.toString();
}

// fake console.log for server side jscript
var console;
(function(){  

var sanitize = function(txt) {  
  var output, x;
  if(typeof txt == 'object') {  
    output = {};  
    for(x in txt) {  
        output[x] = txt[x] + '';  
    }  
    output = JSON.stringify(output, null, 2);  
  } else {  
    output = txt;  
  }  
  return output;  
}  
console = {};  
console.log = function(log) {  
	Response.Write("<li>" + sanitize(log));
//  var XMLHTTP = Server.CreateObject("MSXML2.ServerXMLHTTP")
//  XMLHTTP.open("GET", "http://localhost/log.php?log=" + escape(sanitize(log)), false);
//  XMLHTTP.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
//  XMLHTTP.send();
}  
})();  

function CheckProperty(obj, propName) {
    return (typeof obj[propName] != "undefined");
}

String.prototype.isANumber = function() {
	return /^\d+$/.test(this);
};


function MergeJson(dest, src) {
	for (var prop in src) {
       	if (src.hasOwnProperty(prop)) {
		    try {
		        if ( src[prop].constructor==Object ) {
		            dest[prop] = MergeJson(dest[prop], src[prop]); // recurse
		        } else {
		            dest[prop] = src[prop]; // update
		        }
		    } catch(e) {
	            dest[prop] = src[prop]; // create
	        }
		}
	}
	return dest;
}

function getImageSize(path) {
	if (path.indexOf(":\\")==-1) path = Server.MapPath(path);
	var img = new Image();
	img.src = path;
	return {"width": img.width, "height": img.height};
}
</script>
