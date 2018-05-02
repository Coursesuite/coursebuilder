var buggrCatcher = document.getElementById("buggr_screenshot");

$(function() {
	$(buggrCatcher).click(function() {
		this.focus();
		this.className = 'active';
		this.innerHTML = '<p><span>Now press ctrl-v</span></p>';
	});
});


// We start by checking if the browser supports the 
// Clipboard object. If not, we need to create a 
// contenteditable element that catches all pasted data (FF)
if (!window.Clipboard) {
    
   // Firefox allows images to be pasted into contenteditable elements
   buggrCatcher.setAttribute("contenteditable", "");
    
   // We can hide the element and append it to the body,
   //buggrCatcher.style.opacity = 0;
   //document.body.appendChild(buggrCatcher);
 
   // as long as we make sure it is always in focus
   //buggrCatcher.focus();
   //document.addEventListener("click", function() { buggrCatcher.focus(); });
} 
// Add the paste event listener
window.addEventListener("paste", buggr_handlePaste);
 
/* Handle paste events */
function buggr_handlePaste(e) {
   // We need to check if event.clipboardData is supported (Chrome)
   if (e.clipboardData) {
      // Get the items from the clipboard
      var items = e.clipboardData.items;
      if (items) {
         // Loop through all items, looking for any kind of image
         for (var i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {

				// var imgBase64 = null
				var reader = new FileReader();
				reader.onload = function(event) {
					// imgBase64 = event.target.result.replace(/^data:image\/(png|jpg);base64,/, "");
					buggr_createImage(event.target.result);
				};
				reader.readAsDataURL(items[i].getAsFile());// Blob to base64
/*
               // We need to represent the image as a file,
               var blob = items[i].getAsFile();
               // and use a URL or webkitURL (whichever is available to the browser)
               // to create a temporary URL to the object
               var URLObj = window.URL || window.webkitURL;
               var source = URLObj.createObjectURL(blob);
                
               // The URL can then be used as the source of an image
               createImage(source);
*/
            }
         }
      }
   // If we can't handle clipboard data directly (Firefox), 
   // we need to read what was pasted from the contenteditable element
   } else {
      // This is a cheap trick to make sure we read the data
      // AFTER it has been inserted.
      setTimeout(buggr_checkInput, 1);
   }
}
 
/* Parse the input in the paste catcher element */
function buggr_checkInput() {
   // Store the pasted content in a variable
   var child = buggrCatcher.childNodes[0];
 
   // Clear the inner html to make sure we're always
   // getting the latest inserted content
   buggrCatcher.innerHTML = "";
    
   if (child) {
      // If the user pastes an image, the src attribute
      // will represent the image as a base64 encoded string.
      if (child.tagName === "IMG") {
         buggr_createImage(child.src);
      }
   }
}
 
/*
Creates a new image from a given source

- then posts it to the server.
- the server returns a relative url for the new image
- so we can reference that from now on. ..

*/
function buggr_createImage(source) {
	var pastedImage = new Image(),
		imgBase64 = source.replace(/^data:image\/(png|jpg);base64,/, ""),
		imgExtn = (source.indexOf("image/png")==-1)?"jpg":"png";

   pastedImage.onload = function() {
	// You now have the image!
	$(buggrCatcher).empty().append("<i class='icon-spinner icon-spin icon-large'></i>");
	
	var data = new FormData();
	data.append("extn",imgExtn);
	data.append("base64",imgBase64);
	data.append("buggr", true);
	$.ajax({
	    url: '/engine/action.asp?action=ajax_pastedimage',
	    data: data,
	    cache: false,
	    contentType: false,
	    processData: false,
	    type: 'POST',
	    success: function(url) {
			if (url.length) {
				$("#hdnUrl").val(url);
				$("<img />").attr({"src": url}).css("max-width","175px").appendTo($(buggrCatcher).empty());
			}
	    }
	});	
   }
   pastedImage.src = source;
}
