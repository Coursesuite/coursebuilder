<!-- #include virtual="/engine/pages/common/popup_start.asp" -->
<!-- #include file="subroutines.asp" -->

<%

fnManifest_UpdateImageManifest COURSE

Response.Write "<section><aside>"

Dim ar, i, j
If COMMAND = "manage" Then
	Call RenderDragUpload(BASE_PATH)
	Call RenderBasicFileUpload(BASE_PATH)
	
ElseIf COMMAND = "image" Or _
	COMMAND = "caption" Or _
	COMMAND = "rightimages" Or _
	COMMAND = "images" Or _
	COMMAND = "selectimage" or _
	COMMAND = "settings" or _
	COMMAND = "clickimage" or _
	COMMAND = "zoomimage" or _
	COMMAND = "pagebg" or _
	COMMAND = "columnbg" or _
	COMMAND = "gridbg" or _
	COMMAND = "backstretch" Then

	Call RenderCheckBoxes(COMMAND)
	Call RenderDragUpload(BASE_PATH)
	Call RenderPasteImage()
	Call RenderBasicFileUpload(BASE_PATH)
	Call RenderJsonEditor()

ElseIf COMMAND = "slideshow" Or _
	COMMAND = "splitimage" Then

	Call RenderDragUpload(BASE_PATH)
	Call RenderPasteImage()
	Call RenderBasicFileUpload(BASE_PATH)

ElseIf COMMAND = "xml" Then
	ar = IO.GetFileNamesForExt(COURSE & "/SCO1/en-us/Content/",".xml")
 	Response.Write "<div class='list-group'>"
	for i = 0 to ubound(ar)
		response.write "<a class='list-group-item' target='_iframe' href='/engine/action.asp?action=htmlencode&file=" & Config.CoursesPathVirtual & "/" & COURSE & "/SCO1/en-us/Content/" & ar(i) & "'>" & ar(i) & "</a></li>"
	next
 	Response.Write "</div>"
 	
ElseIf COMMAND = "xml" Or _
		COMMAND = "url" Or _
		COMMAND = "link" Or _
		COMMAND = "linkref" Or _
		COMMAND = "parse" Or _
		COMMAND = "popup" Or _
		COMMAND = "overlay" Or _
		COMMAND = "load" Or _
		COMMAND = "popuptext" Or _
		COMMAND = "tiptext" Or _
		COMMAND = "tipbutton" Then
	ar = IO.GetFileNamesForExt(COURSE & "/SCO1/en-us/Content/",".htm.html.txt.md.pdf.docx.doc.")
 	Response.Write "<div class='list-group'>"
	for i = 0 to ubound(ar)
		response.write "<a class='list-group-item' target='_iframe' href='preview.asp?" & COURSE & "/SCO1/en-us/Content/" & ar(i) & "'>" & ar(i) & "</a></li>"
	next
 	Response.Write "</div>"

End If

Response.Write "</aside>" ' menu
response.write "<article data-mode='" + COMMAND + "'>" ' body

Dim nocache
' nocache =  "?" & now & timer
nocache = ""

Select Case Command
	case "manage"
		response.write "<div class='list-preview-container'>"
		response.write " <div class='list-container' id='file-list'>"
		response.write "  <h5>Content folder</h5>"
		response.write "  <ul>"
		ar = IO.GetListOfNonCourseFiles(COURSE & "/SCO1/en-us/Content/")
		for i = 0 to ubound(ar, 2)
			response.write "   <li><input type='radio' name='selection' data-container='Content' value=""" & ar(0, i) & """ id='file" & j & "' data-size='" & ar(1, i) & "' data-extn='" & ar(2,i) & "' data-date='" & ar(3,i) & "'><label for='file" & j & "'>" & ar(0, i) & "</label></li>"
			j = j + 1
		Next
		response.write "  </ul>"
		response.write "  <h5>Media folder</h5>"
		response.write "  <ul>"
		ar = IO.GetListOfNonCourseFiles(COURSE & "/SCO1/en-us/Content/media/")
		for i = 0 to ubound(ar, 2)
			response.write "   <li><input type='radio' name='selection' data-container='Content/media' value=""" & ar(0, i) & """ id='file" & j & "' data-size='" & ar(1, i) & "' data-extn='" & ar(2,i) & "' data-date='" & ar(3,i) & "'><label for='file" & j & "'>" & ar(0, i) & "</label></li>"
			j = j + 1
		Next
		response.write "  </ul>"
		response.write " </div>"
		response.write " <div class='preview-container'>"
		response.write "  <h5>Preview</h5>"
		response.write "  <iframe name='_iframe' id='_iframe' frameborder='1' allowtransparency='false' src='about:blank'></iframe>"
		response.write "  <h5>Properties</h5>"
		response.write "  <ul id='file-properties'></ul>"
		response.write " </div>"
		response.write "</div>"

	case "image", "selectimage", "settings", "backstretch", "caption", "pagebg","columnbg","gridbg"
		ar = IO.GetFileNamesForExt(COURSE & "/SCO1/en-us/Content/media/",".jpg.png.gif")
		Response.Write "<div class='well clearfix image-preview'>"
		for i = 0 to ubound(ar)
			response.write "<div class='select-one selectbox'><img src='" & COURSE & "/SCO1/en-us/Content/media/" & ar(i) & nocache & "' /></div>"
		next
		Response.Write "</div>"
		
	case "images","slideshow","rightimages","clickimage","splitimage","zoomimage"
		ar = IO.GetFileNamesForExt(COURSE & "/SCO1/en-us/Content/media/",".jpg.png.gif")
		Response.Write "<div class='well clearfix image-preview'>"
		for i = 0 to ubound(ar)
			response.write "<div class='select-multiple selectbox'><img src='" & COURSE & "/SCO1/en-us/Content/media/" & ar(i) & nocache & "' /></div>"
		next
		Response.Write "</div>"
		
	case "url", "parse", "popup","overlay", "load", "popuptext", "tiptext", "tipbutton", "xml", "link", "linkref"
		response.write "<iframe class='well container well-small iframe-preview' data-spy='affix' name='_iframe' id='_iframe' src='about:blank' width='100%' frameborder='1' allowtransparency='false' height='85%'></iframe><p>&nbsp;</p>"

End Select

Response.Write "</article></section>"

%>
<!-- #include virtual="/engine/pages/common/popup_end.asp" -->