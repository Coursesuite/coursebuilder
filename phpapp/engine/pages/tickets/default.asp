<!-- #include virtual="/engine/pages/common/page_start.asp" -->
<!-- #include file="subs.asp" -->
<%
Dim ticketId : ticketId = Request.QueryString("id")
Dim strAction : strAction = Request.QueryString("action")
Dim strStatus : strStatus = Request.QueryString("status")
Select Case strAction
	Case "setstatus"
		Call Buggr.SetTicketStatus(strStatus, ticketId, MyUserName)

End Select
%>    
   	<div class="navbar navbar-static-top">
    	<div class="navbar-inner">
			<form class='navbar-form pull-left' method='get' action='/engine/pages/bugs/'>
				<button type='submit' class='btn'><i class='icon-circle-arrow-left'></i> Back</button>
			</form>
			<div class="container">
		<%
		set tempRS = db.getrs("select * from ticket where id={0}", Array(ticketId))
		
		response.write "<a class='brand'><i class='icon-" & Buggr.IconForLevel(tempRS("level")) & "'></i> " & tempRS("level") & "-" & Right("000" & tempRS("id"),3) & "</a>"

		response.write "<form class='navbar-form pull-right' method='get'>"
		response.write "<input type='hidden' name='id' value='" & ticketId & "'>"
		response.write "<input type='hidden' name='action' value='setstatus'>"
		response.write "Current status: "
		response.write "<select id='inputStatus' name='status'>"
		Dim iLoop, arStatus : arStatus = Array("new","open","done","closed")
		For iLoop = 0 To UBound(arStatus)
			Response.Write "<option"
			If arStatus(iLoop) = tempRS("status") Then Response.Write " selected"
			Response.Write ">" & arStatus(iLoop) & "</option>"
		Next
		Response.Write "</select> <button type='submit' class='btn'>Update</button> </form>"
		Set tempRS = Nothing
		%>
	 		</div>
 		</div>
	</div>

	<p>&nbsp;</p>

	<div class="container">
		<%
		Set lineRS = db.getrs("select id, added, details, url, who from ticket_item where ticket_id={0} order by added", Array(ticketId))
		lastRead = ""
		do while not lineRS.eof
			response.write "<div class='row'><div class='span3'>"
			lastRead = lineRS("added")
			response.write "<p>" & lastRead & "</p>"
			If lineRS("who") > "" Then response.write "<p><small>" & lineRS("who") & "</small></p>"
			If MyUserName = "tim" Then ' yay, hacks!
				response.write "<a class='btn btn-mini' href='/engine/action.asp?action=post_makeTicketReplyItsOwnBug&item=" & lineRS("id") & "' title='This probably should be its own bug'>Bugg<sub>r</sub> it</a></p>"
			End If
			response.write "</div><div class='span9'>"
			if lineRS("url") > "" then response.write "<a href='" & lineRS("url") & "' target='_blank'><img class='pull-right img-polaroid' src='" & lineRS("url") & "' style='max-width:175px'></a>"
			response.write "<p>" & replace(lineRS("details"), vbnewline, "</p><p>") & "</p>"
			response.write "</div></div>"
			response.write "<hr>"
			lineRS.movenext
		Loop
		
		Call Buggr.UpdateLastReadForTicket(MyUserName, CLng(ticketId), lastRead)
		
		Set lineRS = Nothing
		%>
		<div class='row'><form id="conversation" method="post" action="/engine/action.asp?action=post_conversation">
			<div class='span3'>
				<p><small><%=MyUserName%></small></p>
			</div>
			<div class='span6'>
				<textarea name="details" rows="4" class="input-block-level" placeholder="Enter any additions you have to this conversation in this box. If a screenshot is required, take it as normal, click the dashed box on the right and press ctrl-v."></textarea>
				<div class='row-fluid'>
					<div class='span3'>
						<button type="submit" class="btn btn-primary">Add entry</button>
					</div>
					<div class='span5'>
						<label class="checkbox pull-left"> <i class='icon-thumbs-up'></i> <input type="checkbox" name="done" value="y">  Mark as Done?</label>
					</div>
					<div class='span4'>
						<label class="checkbox pull-right"> <i class='icon-envelope'></i> <input type="checkbox" name="notify" value="y">  Notify?</label>
					</div>
				</div>
			</div><div class='span3'><div id='paste_screenshot'>
				<span>Now press ctrl-v</span>
			</div>
			<input type="hidden" name="url" id="hdnUrl"><input type="hidden" name="ticketid" value="<%=ticketid%>">
		</form></div>
	</div>

	<form enctype='multipart/form-data' method='post' name='fileinfo' id='fileinfo'></form>

<!-- #include virtual="/engine/pages/common/page_end.asp" -->
