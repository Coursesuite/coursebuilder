<!-- #include virtual="/engine/pages/common/page_start.asp" -->
<!-- #include file="subroutines.asp" -->
<%

Dim rs

Set rs = db.getrs("select id, path, name from coursefolder", array())
do while not rs.eof
	LogAction "Checking " & rs("name")
	call CheckAncillaryFiles(server.mappath(rs("path")), rs("id"))
	rs.movenext
Loop	

Sub LogAction(ByVal inp)
	Response.Write "<li>" & inp & "</li>"
End Sub

%>
 
<!-- #include virtual="/engine/pages/common/page_end.asp" -->