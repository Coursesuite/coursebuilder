<div id="notesModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel2" aria-hidden="true">
  <div class="modal-header">
    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
    <h3 id="myModalLabel2">To-do list manager</h3>
  </div>
  <div class="modal-body">
  	...
  </div>
  <div class="modal-footer"><%
  ' response.write becasue bootstrap draws whitespace in chrome!
response.write "<div class='form-inline' id='todo-add'>"
response.write "<span class='input-prepend'>"
response.write "<span class='add-on'><i class='icon-plus-sign'></i></span>"
response.write "<input type='text' placeholder='Enter new to-do item here ...'>"
response.write "</span>"
response.write "<span class='input-append'>"
response.write "<select><option selected='selected' value='Core / Engine related'>Core / Engine related</option>"

Dim courseRs, grp, grpI : set courseRs = db.getrs("select c.id, c.name, g.name as grouping from courses c inner join container g on c.container=g.id where g.name <> 'archive' order by g.name, c.name", "")
If Not (courseRs.BOF AND courseRs.EOF) Then
	grp = ""
	grpI = 0
	Do While Not courseRs.EOF
		if courseRs("grouping") <> grp Then
			if grpI > 0 then response.write "</optgroup>"
			response.write "<optgroup label='" & courseRs("grouping") & "'>"
		End if
		Response.Write "<option value='" & courseRs("id") & "'>" & courseRs("name") & "</option>" ' Lists(0, Index) & "'>" & Lists(1, Index) & "</option>"
		grp = courseRs("grouping")
		courseRs.moveNext
	Loop
	response.write "</optgroup>"
end if

response.write "</select>"
response.write "<button id='NewToDo' class='btn'>Add</button>" '  data-dismiss='modal' aria-hidden='true'
response.write "</span>"
response.write "</div>"
  %></div>
</div> 