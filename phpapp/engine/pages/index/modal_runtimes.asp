<div id="myModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
  <div class="modal-header">
    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
    <h3 id="myModalLabel">About the runtimes</h3>
  </div>
  <div class="modal-body">
		<div class="accordion" id="accordion2">
		<%
		Dim about, ai
		ai = 0
		set fold = Config.FileSys.getFolder(Config.RuntimesPath)
		for each sf in fold.subfolders
		%>
		  <div class="accordion-group">
		    <div class="accordion-heading">
		      <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapse<%=ai%>"><%=sf.name%></a>
		    </div>
		    <div id="collapse<%=ai%>" class="accordion-body collapse">
		      <div class="accordion-inner"><%
				set about = Config.FileSys.OpenTextFile(sf.path & "\about.txt", 1, false)
				response.write "<p>" & replace(about.ReadAll,vbnewline, "</p><p>") & "</p>"
				about.close
		      %></div>
		    </div>
		  </div>	
		<%
			ai = ai + 1
		next
		Set fold = nothing
		%></div>
  </div>
  <div class="modal-footer">
    <button class="btn btn-primary" data-dismiss="modal" aria-hidden="true">Close</button>
  </div>
</div> 