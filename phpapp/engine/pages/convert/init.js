$(function () {

	var $container = $("#drop");

	// drag n drop upload
	$container.filedrop({
	    fallback_id: 'manual_upload_off',	   // an identifier of a standard file input element, becomes the target of "click" events on the dropzone
	    url: '/engine/pages/convert/upload.asp',     // upload handler, handles each file separately, can also be a function taking the file and returning a url
	    paramname: 'userfile',            // POST parameter name used on serverside to reference file, can also be a function taking the filename and returning the paramname
	    withCredentials: false,          // make a cross-origin request with cookies
	    allowedfileextensions: ['.zip'], // file extensions allowed. Empty array means no restrictions
	    maxfiles: 1,
	    maxfilesize: 100,    // max file size in MBs
	    queuefiles: 2,
	    dragOver: function() {
	    	$container.addClass("drag-over");
	    },
	    dragLeave: function() {
	    	$container.removeClass("drag-over");
	    },
	    docOver: function() {
	    	$container.addClass("doc-over");
	    },
	    docLeave: function() {
	    	$container.removeClass("doc-over");
	    },
	    drop: function() {
	    	$container.removeClass("doc-over drag-over");
	    },
	    uploadStarted: function(i, file, len){
	        // a file began uploading
	        // i = index => 0, 1, 2, 3, 4 etc
	        // file is the actual file of the index
	        // len = total files user dropped
	    },
	    uploadFinished: function(i, file, response, time) {
	        // response is the data you got back from server in JSON format.
	        if (response.courseid) {
				location.href = "/engine/pages/edit/?id=" + response.courseid;
			} // otherwise jquery's page-wide error handler catch and alert, plus it's in the log
	    },
	    progressUpdated: function(i, file, progress) {
	        // this function is used for large files and updates intermittently
	        // progress is the integer value of file being uploaded percentage to completion
	    },
	    globalProgressUpdated: function(progress) {
	        // progress for all the files uploaded on the current instance (percentage)
	        // ex: $('#progress div').width(progress+"%");
	    },
	    speedUpdated: function(i, file, speed) {
	        // speed in kb/s
	    },
	    rename: function(name) {
	        // name in string format
	        // must return alternate name as string
	    },
	    beforeEach: function(file) {
	        // file is a file object
	        // return false to cancel upload
	    },
	    //beforeSend: function(file, i, done) {
	        // file is a file object
	        // i is the file index
	        // call done() to start the upload
	    //},
	    afterAll: function() {
	        // runs after all files have been uploaded or otherwise dealt with
	    }
	});

});