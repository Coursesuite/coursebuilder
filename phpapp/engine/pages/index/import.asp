<!-- #include virtual="/engine/pages/common/page_start.asp" -->
<!-- #include file="subroutines.asp" -->
<%

dim nnn : nnn = trim(request.querystring("name"))
dim iii 
if (nnn  > "") then
	iii = db.getScalarWithParams("select id from container where name = {0}", nnn, 0)
	if iii > 0 then
		response.write "checking ?name=" & nnn & " for id=" & iii
		CheckSpecifiedFolderForNewCoursesAndEnterThemIntoTheDatabase iii, server.mappath("/courses/" & nnn)
	end if
end if
%>
 
<!-- #include virtual="/engine/pages/common/page_end.asp" -->