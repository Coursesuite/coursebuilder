<%

Class clsBuggr

	Public BuggrAccount
	
	Private Sub Class_Initialise()
		BuggrAccount = "tim@avide.com.au"
	End Sub




	Function TicketOpenersName(ByVal ticketId)
		TicketOpenersName = db.getScalarWithParams("select who from ticket where id={0}", Array(ticketId), "")
	End Function




	Function SubmitBug(ByVal text, ByVal level, ByVal screenshot, ByVal loggedBy)
	Dim emailFrom

		Call db.exec("INSERT INTO ticket (who,level,status) VALUES ({0},{1},'new')", Array(loggedBy,level))
		SubmitBug = db.LastInsertId("ticket")

		Call db.exec("INSERT INTO ticket_item (ticket_id,who,added,details,url) VALUES ({0},{1},NOW(),{2},{3})", Array(SubmitBug, loggedby, text, screenshot))

		emailFrom = WhoToEmail(loggedBy)
		If emailFrom > "" Then
			Call SendAnEmail(emailFrom, BuggrAccount, "Buggr: A new ticket has been logged", text & vbNewLine & vbNewLine & "View details: http://59.167.129.251:8888/engine/pages/tickets/?id=" & SubmitBug, "", "")
		End If
	End Function



	
	Function GetBugListJson(byval state)
		Dim tempRS, aItems, oJSON, i
		Set tempRS = db.GetRS("select * from ticket where status='{0}' order by status", Array(state))
		aItems = Array()
		If Not (tempRS.BOF AND tempRS.EOF) Then
			Do While Not tempRS.EOF
				Set oJSON = JSON.parse("{}")
				For i = 0 To tempRS.Fields.Count -1
					oJSON.set tempRS.Fields.Item(i).Name, tempRS(tempRS.Fields.Item(i).Name)
				Next
				Call Push2Array(aItems, JSON.stringify(oJSON))
				tempRS.moveNext
			Loop
		End If
		GetBugListJson = "[" & Join(aItems,",") & "]"
	End Function



	
	Function GetBugDetails(ByVal ticket_number)
	Dim tempRS, aItems, i, oJSON
		set tempRS = db.getrs("select * from ticket_item where ticket_id='{0}' order by added desc", Array(ticket_number))
		aItems = Array()
		If Not (tempRS.BOF AND tempRS.EOF) Then
			Do While Not tempRS.EOF
				Set oJSON = JSON.parse("{}")
				For i = 0 To tempRS.Fields.Count -1
					oJSON.set tempRS.Fields.Item(i).Name, tempRS(tempRS.Fields.Item(i).Name)
				Next
				Call Push2Array(aItems, JSON.stringify(oJSON))
				tempRS.moveNext
			Loop
		End If
		GetBugDetails = "[" & Join(aItems,",") & "]"
	End Function
	
	
	
	
	Function MakeTicketReplyItsOwnBug(ByVal ticket_item_id, ByVal current_user)
	Dim reply_user
		reply_user = db.getScalarWithParams("SELECT who FROM ticket_item WHERE id={0}", Array(ticket_item_id), current_user)
		Call db.exec("INSERT INTO ticket (who,level,status) VALUES ({0},{1},'new')", Array(reply_user, "meh"))
		MakeTicketReplyItsOwnBug = db.LastInsertId("ticket")
		Call db.exec("UPDATE ticket_item SET ticket_id={0} WHERE id={1}", Array(MakeTicketReplyItsOwnBug,ticket_item_id))
	End Function





	Sub ReplyToTicket(ByVal ticket_number, ByVal reply_text, ByVal screenshot, ByVal set_as_done, ByVal notify_owner, ByVal current_user)	
	Dim close_msg, myEmail, value, theirEmail
		
		Call db.exec("UPDATE ticket SET status='open' WHERE status='new' AND id={0}", Array(ticket_number))

		If reply_text > "" Then
			if set_as_done then
				reply_text = reply_text & vbNewLine & "Marked as Done."
				Call db.exec("UPDATE ticket SET status='done' WHERE id={0}", Array(ticket_number))
			end if
			Call db.exec("INSERT INTO ticket_item (ticket_id,who,added,details,url) VALUES ({0},{1},NOW(),{2},{3})", Array(ticket_number, current_user, reply_text, screenshot))
		End If

		if notify_owner then
			myEmail = WhoToEmail(current_user)
			value = TicketOpenersName(tix)
			theirEmail = whoToEmail(value)
			If myEmail > "" and theirEmail > "" Then
				close_msg = vbNewLine & vbNewLine & "-----------------------------------------------------" & vbNewLine & "If this has resolved your problem, please close the job by clicking the link below." & vbNewLine & "http://59.167.129.251:8888/bug/?id=" & ticket_number & "&action=setstatus&status=closed"
				Call SendAnEmail(myEmail, theirEmail, "Buggr: " & MyUserName & " responded to your ticket...", text & vbNewLine & vbNewLine & "View details: http://59.167.129.251:8888/bug/?id=" & ticket_number & close_msg, "", "")
			End If
		end if
	End Sub



	Function IconForLevel(ByVal level)
		Select Case LCase(level) 
		Case "meh"
			IconForLevel = "meh"
		Case "minor"
			IconForLevel = "smile"
		Case "major"
			IconForLevel = "frown"
		Case Else
			IconForLevel = "circle"
		End Select
	End Function


	
	Function ColourForLevel(ByVal level)
		Select Case LCase(level) 
		Case "meh"
			ColourForLevel = "info"
		Case "minor"
			ColourForLevel = "warning"
		Case "major"
			ColourForLevel = "error"
		Case Else
			ColourForLevel = "circle"
		End Select
	End Function


	Function FinishJob(byval ticketId, byval current_user)
		Dim us, rs, sql, them, jobText
		
		' me
		us = WhoToEmail(current_user)
		If us = "" Then exit function
		
		' them
		Set rs = db.getrs("select who from ticket where id={0}", ticketId)
		If Not (rs.eof and rs.bof) Then
			them = WhoToEmail(rs("who"))
		End If
		
		If them > "" Then
			Set rs = db.getrs("select details from ticket_item where ticket_id={0} order by added limit 1", ticketId)
			If Not (rs.eof and rs.bof) Then
				jobText = "Hi," & vbNewLine & "The following bug has been closed:" & vbNewLine & vbNewLine & rs("details") & vbNewLine & vbNewLine & "View details: http://59.167.129.251:8888/engine/pages/tickets/?id=" & ticketId
			End If
			Call SendAnEmail(us, them, "Buggr: Ticket closed", jobText, "", "")
		End If
		Set rs = Nothing
	End Function
	
	
	
	Sub UpdateLastReadForTicket (byVal sUser, byVal iTicket, byVal dLast)
	Dim c
		c = db.count("ticket_read", db.formatSql("ticket_id={0} AND who={1}", Array(iTicket, sUser)))
		If c > 0 Then
			Call db.exec("UPDATE ticket_read SET last_read={2} WHERE ticket_id={0} AND who={1}", Array(iTicket,sUser,dLast))
		Else
			Call db.exec("INSERT INTO ticket_read (ticket_id,who,last_read) VALUES ({0},{1},{2})", Array(iTicket,sUser,dLast))
			' UNIX_TIMESTAMP(STR_TO_DATE({2},'%d/%m/%Y %h:%i:%s %p')) '  '11/6/2013 11:36:04 AM'
		End If
	End Sub


	Sub SetTicketStatus(ByVal strStatus, ByVal ticketId, ByVal current_user)
		Call db.Update("ticket", Array("status", strStatus), ticketId)
		Call db.connection.execute("INSERT INTO ticket_item (ticket_id,who,added,details) VALUES (" & ticketId & ",'"&current_user&"',NOW(),'Ticket status was changed to " & strStatus & ".')", adExecuteNoRecords)
		If strStatus = "closed" Then
			Call FinishJob(ticketId, current_user)
		End If
	End Sub


End Class


%>