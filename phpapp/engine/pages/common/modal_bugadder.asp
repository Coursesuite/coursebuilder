<div id="bugAdderModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="bugAdderModal-h" aria-hidden="true">
  <div class="modal-header">
    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
    <h3 id="bugAdderModal-h">Log a new bug</h3>
  </div>
  <div class="modal-body" id="bugAdderBody">
	<div class="row-fluid" id="new-ticket">
		<div class="span7">
			<textarea rows="8" class="input-block-level" placeholder="Enter the bug description in this box. If a screenshot is required, copy it (e.g. alt-printscreen, etc), click the dashed box on the right and press ctrl-v."></textarea>
		</div>
		<div class="span5">
			<div id="buggr_screenshot" title="You can capture a screenshot by pressing alt-printscreen on the window, or copying the image from a paint program.">Click to paste</div>
			<input type="hidden" id="hdnUrl">
		</div>
	</div>
  </div>
  <div class="modal-footer">
	<div class="form-inline pull-left">
		<label class="radio inline" title="You're frowny-faced because this is a big problem">
		  <input type="radio" id="inlineCheckbox1" value="major" name="level"><i class='icon-frown'></i>
		</label>
		<label class="radio inline" title="This bug happens, but you're ok with it for now">
		  <input type="radio" id="inlineCheckbox3" value="meh" name="level" checked><i class='icon-meh'></i>
		</label>
		<label class="radio inline" title="You're wondering if you should even mention this">
		  <input type="radio" id="inlineCheckbox2" value="minor" name="level"><i class='icon-smile'></i>
		</label>
	</div>
	<button class='btn btn-primary' data-dismiss='modal' aria-hidden='true'>Save</button>
	<button class='btn' data-dismiss='modal' aria-hidden='true'>Cancel</button>
  </div>
</div>