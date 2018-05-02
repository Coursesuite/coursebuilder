<!-- #include virtual="/engine/pages/common/page_start.asp" -->

    <div class="container">
    
    	<div class="row-fluid">
    		<div class="span6">
    			<h3>Password</h3>
    			<p>You can change your password below. This might be different to your windows password.</p>
				<form class="form-horizontal" action="/engine/action.asp?action=post-profile-setpassword" method="post">
				  <div class="control-group">
				    <label class="control-label" for="inputPassword">New password</label>
				    <div class="controls">
				      <input type="password" name="newPassword" id="inputPassword" placeholder="">
				    </div>
				  </div>
				  <div class="control-group">
				    <div class="controls">
				      <button type="submit" class="btn">Change it!</button>
				    </div>
				  </div>
      			</form>
			</div>
    		<div class="span6">
    			<h3>Email</h3>
    			<p>The email address is currently only used by Buggr. You can change which address is used below.</p>
				<form class="form-horizontal" action="/engine/action.asp?action=post-profile-setpassword" method="post">
					<input type="hidden" name="action" value="post-profile-setemail">
				  <div class="control-group">
				    <label class="control-label" for="inputEmail">New password</label>
				    <div class="controls">
				      <input type="password" name="newEmail" id="inputEmail" placeholder="<%=WhoToEmail(MyUserName)%>">
				    </div>
				  </div>
				  <div class="control-group">
				    <div class="controls">
				      <button type="submit" class="btn">Change it!</button>
				    </div>
				  </div>
      			</form>
			</div>
    	</div>

	</div>

<!-- #include virtual="/engine/pages/common/page_end.asp" -->