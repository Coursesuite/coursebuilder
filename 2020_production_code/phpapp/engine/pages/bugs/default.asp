<!-- #include virtual="/engine/pages/common/page_start.asp" -->
<!-- #include file="subs.asp" -->
<%
Dim i, filts, lineRS, q
Dim rqFilter : rqFilter = request.querystring("filter")
q = trim(request.querystring("q"))
%>    
   	<div class="navbar">
    	<div class="navbar-inner">
			<form class="navbar-form pull-left" method="get">
				<label class="checkbox inline">
				  <input type="checkbox" name="filter" value="new"<%=CheckedIfRqFilter("new",rqFilter) %>> New bugs
				</label>
				<label class="checkbox inline">
				  <input type="checkbox" name="filter" value="open"<%=CheckedIfRqFilter("open",rqFilter) %>> In progress
				</label>
				<label class="checkbox inline">
				  <input type="checkbox" name="filter" value="done"<%=CheckedIfRqFilter("done",rqFilter) %>> Done (probably)
				</label>
				<label class="checkbox inline">
				  <input type="checkbox" name="filter" value="closed"<%=CheckedIfRqFilter("closed",rqFilter) %>> Closed
				</label>
				<button type="submit" class="btn">Apply</button>
			</form>
			<form class="navbar-search pull-right" method="get">
			  <input type="text" class="search-query" placeholder="Search ..." name="q" value="<%=q%>">
			</form>
 		</div>
	</div>

	<div class="container-fluid">
		<div class="row-fluid">
		<div class="span9">
		<%
		filts = Array("new","open")
		sql = " status='{0}' or status='{1}'"
		If request.querystring("filter").count > 0 Then ' it's a COLLECTION, not an ARRAY, gah
			filts = Array()
			sql = ""
			For i = 1 to request.querystring("filter").count
				Push2Array filts, request.querystring("filter")(i)
				sql = sql & " status='{" & (i-1) & "}' OR"
			Next
			if right(sql,3) = " OR" Then
				sql = Left(sql, len(sql)-3)
			end if
		end if
		if q > "" Then
			filts = array(q)
			sql = "id in (select ticket_id from ticket_item where details like '%{0}%')"
		end if
		set tempRS = db.getrs("select * from ticket where (" & sql & ") order by case when status='new' then 0 when status='open' then 1 when status='done' then 2 when status='closed' then 3 end", filts)
		aItems = Array()
		If Not (tempRS.BOF AND tempRS.EOF) Then
			response.write "<table class='table table-bordered'>"
			response.write "<thead><tr><th>Ticket</th><th>Who</th><th>Details</th><th>Severity</th><th>Status</th></tr></thead>"
			response.write "<tbody>"
			Do While Not tempRS.EOF
				response.write "<tr"
				select case tempRS("level")
					case "minor"
						response.write " class='info'"
					case "meh"
						response.write " class='warning'"
					case "major"
						response.write " class='error'"
				End select
				response.write ">"

				response.write "<td><a href='/engine/pages/tickets/?id=" & tempRS("id") & "' class='btn btn-primary'>" & Right("000" & tempRS("id"),3) & "</a></td>"
				response.write "<td>" & tempRS("who") & "</td>"

				response.write "<td>"
				Set lineRS = db.getrs("select details from ticket_item where ticket_id={0} order by added limit 1", array(tempRS("id")))
				if not (lineRS.eof and lineRS.bof) Then
					response.write lineRS("details")
				End If
				Set lineRS = Nothing
				
				If TicketHasUnreadItems(tempRS("id"), MyUserName) Then
					response.write "<br><span class='label label-warning'>Unread replies</span>"
				End If
				
				response.write "</td>"

				response.write "<td><i class='icon-2x icon-" & IconForLevel(tempRS("level")) & "'></i></td>"
				response.write "<td>" & tempRS("status") & "</td>"

				response.write "</tr>"
				tempRS.moveNext
			Loop
			response.write "</tbody>"
			response.write "</table>"
		else
			response.write "<p><b>Hooray!</b> There are no bugs in the selected list(s). To celebrate, go break something!</p>"
		End If
		%>
		</div>
		<div class="span3">
			<table class='table table-bordered table-striped table-condensed'>
			<thead><tr><th colspan='2'>Recent actions</th></thead>
			<tbody>
				<%
				set tempRS = db.getrs("select id, added, details, who, ticket_id from ticket_item order by added desc limit 15",0)
				do while not tempRS.eof
					
					response.write "<tr><td>" & NicerDate(tempRS("added"))
					response.write "</td><td>"
					response.write "<a href='/engine/pages/tickets/?id=" & tempRS("ticket_id") & "' class='btn btn-small pull-right'>" & Right("000" & tempRS("ticket_id"),3) & "</a>"
					response.write "<b>" & tempRS("who") & "</b> said: "
					response.write str.shorten(str.stripTags(tempRS("details")), 123, "...")
					response.write "</td></tr>"
					tempRS.movenext
				loop
				Set tempRS = Nothing
				%>
			</tbody>
			</table>
		</div>
		</div>
	</div>


<!-- #include virtual="/engine/pages/common/page_end.asp" -->
