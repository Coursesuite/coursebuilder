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

Function TicketHasUnreadItems(ByVal iTicket, ByVal sUser)
Dim dLast, dLatest
	TicketHasUnreadItems = false
	' Last message that I read for this job
	dLast = db.getScalarWithParams("SELECT CAST(last_read AS datetime) FROM ticket_read WHERE ticket_id={0} AND who={1}", Array(iTicket, sUser), 0)
	' Last message posted to ticket
	dLatest = db.getScalarWithParams("SELECT DATE_FORMAT(FROM_UNIXTIME(added), '%e %b %Y') FROM ticket_item WHERE ticket_id={0} ORDER BY added DESC LIMIT 1", Array(iTicket), 0)
	If cLng(dLast) > 0 Then TicketHasUnreadItems = (dLatest > dLast)
End Function
%>