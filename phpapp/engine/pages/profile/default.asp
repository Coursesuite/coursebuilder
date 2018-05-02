<!-- #include virtual="/engine/pages/common/page_start.asp" -->
<%
If MyUserId < 1 Then
	Response.Write "Not logged on."
	Response.End
End If

Select Case Request.Form("post-action")
	Case "recache"
	
	Case "disk2db"
		Dim foldContainer, foldCourse, rsCourse, idCourse
		Dim strConfig, strHelp, strGlossary, strReferences
		Dim oConfig, oGlossary, oReferences
		For Each foldContainer in Config.FileSys.GetFolder(Server.MapPath("/courses")).SubFolders
			For Each foldCourse in foldContainer.SubFolders
				Set rsCourse = db.getRS("select c.id, c.config, c.glossary, c.help, c.references from courses c inner join coursefolder f on c.id = f.id where path='{0}'", array("/courses/" & foldContainer.name & "/" & foldCourse.name))
				if not (rsCourse.eof and rsCourse.bof) Then
					idCourse = rsCourse("id")
					strConfig = trim("" & rsCourse("config"))
					strHelp = trim("" & rsCourse("help"))
					strGlossary = trim("" & rsCourse("glossary"))
					strReferences = trim("" & rsCourse("references"))
					Set rsCourse = Nothing
					
					If strConfig = "" Then strConfig = Trim("" & IO.LoadFileStream(Server.MapPath("/courses/" & foldContainer.name & "/" & foldCourse.name & "/SCO1/Configuration/settings.json")))
					If strHelp = "" Then strHelp = Trim("" & IO.LoadFileStream(Server.MapPath("/courses/" & foldContainer.name & "/" & foldCourse.name & "/SCO1/Configuration/help.txt")))
					If strGlosssary = "" Then strGlossary = Trim("" & IO.LoadFileStream(Server.MapPath("/courses/" & foldContainer.name & "/" & foldCourse.name & "/SCO1/Configuration/glossary.json")))
					If strReferences = "" Then strReferences = Trim("" & IO.LoadFileStream(Server.MapPath("/courses/" & foldContainer.name & "/" & foldCourse.name & "/SCO1/Configuration/references.json")))

					If left(strHelp, 15) = "Sorry, there is" Then strHelp = "{h1|Help}" & VbNewLine & "Sorry, there is no help at this time."
					
					If InStr(strConfig, "'strings': '") > 0 Then ' Fix bum data: string replaces must be in a specific order
						strConfig = Replace(strConfig, "'strings': '", "'strings': [")
						strConfig = Replace(strConfig, "'," & vbNewLine & "    'engine':", "]," & vbNewLine & "    'engine':")
						
						strConfig = Replace(strConfig, "': '", chr(34) & ": " & chr(34))
						strConfig = Replace(strConfig, "': [", chr(34) & ": [")
						strConfig = Replace(strConfig, "': {", chr(34) & ": {")
						strConfig = Replace(strConfig, "': ", chr(34) & ": ")
						strConfig = Replace(strConfig, "',", chr(34) & ",")
						strConfig = Replace(strConfig, "'" & vbNewLine, chr(34) & vbNewLine)
						strConfig = Replace(strConfig, "  '", "  " & chr(34))

					End If

					If strConfig = "" Then strConfig = "{}"
					If strGlossary = "" Then strGlossary = "{}"
					If strReferences = "" Then strReferences = "{}"

					Call db.Exec("update courses set `config`={1}, `help`={2}, `glossary`={3}, `references`={4} where id={0}", Array(idCourse, strConfig, strHelp, strGlossary, strReferences))
				End If

			Next
		Next
	
	
	Case "scancourses"
	
End Select

%>
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

		<% If MyUserName = "tim" Then %>
		<div class="row-fluid">
			<h3>Database caches</h3>
			<p>The base template is stored in the database. It gets delivered on-demand to the disk when you play or download a course. You can "pull" these files back into the database
			from the base template disk store after it is updated. This is a manual process, for which the following button has been created.</p>
			<form method="post"><input type="hidden" name="post-action" value="recache"><input type="submit" name="action" value="Rebuild cache" class="btn"></form>
			<form method="post"><input type="hidden" name="post-action" value="disk2db"><input type="submit" name="action" value="Initialise course caches" class="btn"></form>

			<h3>Re-build courses and containers</h3>
			<p>Sometimes the page load process fails to load new courses and containers. This process cleans up the database by trashing any containers that are in the db but not on the disk,
				and then archives all courses that no longer exist in their target containers. You shouldn't have to do this very often!</p>
			</p>
			<form method="post"><input type="hidden" name="post-action" value="scancourses"><input type="submit" name="action" value="Scan course folders" class="btn"></form>
			
			
		
		</div>
		<% End If %>

	</div>

<!-- #include virtual="/engine/pages/common/page_end.asp" -->