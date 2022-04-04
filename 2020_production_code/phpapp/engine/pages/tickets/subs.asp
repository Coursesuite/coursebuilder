<%
Function CheckedIfRqFilter(byval val, ByVal rq)
	If rq = "" And val = "new" Then CheckedIfRqFilter = " checked"
	If rq = "" And val = "open" Then CheckedIfRqFilter = " checked"
	If InStr(rq,val) > 0 Then CheckedIfRqFilter = " checked"
End Function

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

Function FinishJob(ticketId)
	Dim us, rs, sql, them, jobText
	
	' me
	us = WhoToEmail(MyUserName)
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
		Call db.exec("UPDATE ticket_read SET last_read={0} WHERE ticket_id={1} AND who={2}", Array(dLast,iTicket,sUser))
	Else
		Call db.exec("INSERT INTO ticket_read (ticket_id,who,last_read) VALUES ({0},{1},{2})", Array(iTicket,sUser,dLast))
	End If
End Sub



%>