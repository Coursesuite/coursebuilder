Dropzone.options.ninjaUploadDropzone = {
	init: function() {
		this.on("success", function(file, response) {
			if (response.status && response.status === "ok") {
				var w = window.opener,
					tree = w.document.documentElement.getElementById("xmlTree");

				//tree.


				return;
			}
			alert(response);
		});
	}
}