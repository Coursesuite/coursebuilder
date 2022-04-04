<div id="upModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="upModalLabel" aria-hidden="true">
  <form method="post" action="/engine/upload.asp" enctype="multipart/form-data" name="form1" <% if false then %>target="upload-iframe"<% end if %> style="display:inline">
  <div class="modal-header">
    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
    <h3 id="myModalLabel">Upload existing course</h3>
  </div>
  <div class="modal-body">
	<% if false then %><p>If you are uploading an existing CourseBuilder course, then choose 'Update engine'. Editing is only supported on CourseBuilder courses.</p><% end if %>
	<p>Choose an existing CourseBuilder course (other upload types are not yet supported).</p>
		<div><input type="file" name="file1" id="file1" placeholder="Choose a file" /></div>
		<% if false then %><div><select name="runtime" id="runtime">
			<option value="zip">Don't change anything</option>
			<option value="textplayer" selected>Update engine</option>
		</select></div><% end if %>
		
	<% if false then %><iframe id="upload-iframe" name="upload-iframe" src="/engine/upload.asp" style="display:none"></iframe><% end if %>
  </div>
  <div class="modal-footer">
  	<input type="submit" name="action" value="Upload" id="dialog_link" class="btn btn-primary">
    <button class="btn btn-link" data-dismiss="modal" aria-hidden="true">Cancel</button>
  </div>
  </form>
</div> 