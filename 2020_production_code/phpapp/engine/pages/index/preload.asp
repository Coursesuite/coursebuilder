<!-- #include virtual="/engine/pages/common/page_start.asp" -->
<!-- #include file="subroutines.asp" -->
<table>
<tr><th>Name</th><th>Disk</th><th>Db</th><th>Action</th></tr>
<%

If request.form("action") = "Fix" Then

	data = replace(request.form("newdata"),"\\", "\") ' un-double-escape
	data = replace(request.form("newdata"),"\", "\\") ' then re-double-escape

	call db.printsql("update courses set `config` = {0} where id = {1}", array(data, clng(request.form("updateid"))))
	
	call db.exec("update courses set `config` = {0} where id = {1}", array(data, clng(request.form("updateid"))))

ElseIf request.form("action") = "Delete" Then

		call db.printsql("delete from courses where id = {0}",  clng(request.form("updateid")))
		call db.exec("delete from courses where id = {0}",  clng(request.form("updateid")))

ElseIf request.form("delete").count > 0 Then

	for i = 0 to request.form("delete").count
		'call db.exec("delete from courses where id = {0}", request.form("delete")(i))
		call db.printsql("delete from courses where id = {0}",  request.form("delete")(i))
	next

end if

dim rs, cp, diskOk, dbOk, diskJson, dbJson, oTmp, printSubmit

set rs = db.getrs("select * from courses", Array())
do while not rs.eof
	cp = getcoursepath(rs("id"))
	diskJson = ""
	if cp > "" then
	if config.filesys.fileexists(Server.mappath(cp) & "\sco1\configuration\") then
		diskJson = IO.GetFileString(Server.mappath(cp) & "\sco1\configuration\settings.json", "")
	end if
	end if
	dbJson = rs("config")
	
	diskOk = true
	dbOk = true
	printSubmit = false

	on error resume next
	Set oTmp = JSON.parse(join(array(diskJson)))
	If err > 0 Then diskOk = false
	on error goto 0
	
	on error resume next
	Set oTmp = JSON.parse(join(array(dbJson)))
	If err > 0 Then dbOk = false
	on error goto 0
	
	if diskOk = false or dbOk = false Then
		response.write "<tr><form method='post'><input type='hidden' name='updateid' value='" & rs("id") & "'>"
		response.write "<td>" & rs("name") & "</td>"
		response.write "<td>" & diskOk & "<br><textarea rows=5 cols=50 name='newdata'>" & diskJson & "</textarea></td>"
		response.write "<td>" & dbOk & "<br><textarea rows=5 cols=50>" & dbJson & "</textarea></td>"
		
		if diskOk = true and dbOk = false Then
			response.write "<td><input type='submit' name='action' value='Fix'></td>"
		elseif diskOk = false and dbOk = true Then
			printSubmit = true
			'response.write "<td><input type='checkbox' name='delete' value='" & rs("id") & "'> Delete</td>"
			response.write "<td><input type='submit' name='action' value='Delete'></td>"
		end if
		response.write "</form></tr>"
		
	end if
	
	rs.movenext
loop
set rs = nothing

If printSubmit Then
End If
%>

 </table>
 
 
<!-- #include virtual="/engine/pages/common/page_end.asp" -->