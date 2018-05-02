<%
Sub RenderCheckBoxes(ByVal Command)
If command = "caption" Then Exit Sub ' unsupported for now
Dim ar, i, j, dft_val
	dft_val = ""
	ar = Split("box-shadow,rp-bouncein,rp-fadein,rp-fadeinfast,rp-blindin,rp-slidein,pull-left,pull-right,scale-image,play-button",",")
	j = ubound(ar)
	Response.Write "<table class='check-append-classes' id='css-classes'><tr><th colspan='2'>Image CSS</th></tr><tr>"
	For i = 0 to j
		response.write "<td><label><input type='checkbox' value='" & ar(i) & "'"
		if (command = "images" or command = "image" or command = "rightimages") and (ar(i) = "box-shadow") then
			dft_val = "box-shadow"
			response.write " checked"
		end if
		response.write "> " & replace(replace(replace(ar(i),"rp-",""),"in"," in "),"l in d","lind") & "</label></td>"
		if i = j or i mod 2 = 1 then
			response.write "</tr>"
			if i < j then response.write "<tr>"
		end if
	Next
	response.write "<tr><td colspan='2'><input type='text' placeholder='CSS classnames' size='40' value='" & dft_val & "'></td></tr>"
	response.write "</table>"
End Sub

Sub RenderDragUpload(ByVal BASE_PATH)
exit sub
	response.write "<table id='drag-upload'><tr><th>Drag here to upload</th></tr>"
	response.write "<form action='" & BASE_PATH & "listUpload.asp?" & request.querystring & "' class='dropzone' id='my-awesome-dropzone' style='display:block'>"
	response.write "<tr><td align='center' valign='middle'>"
	response.write "<div class='dz-message'>"
	response.write "<p align='center'><i class='icon-upload icon-4x'></i></p>"
	response.write "</div>"
	response.write "</td></tr>"	
	response.write "</form>"
	response.write "</table>"
End Sub

Sub RenderBasicFileUpload(ByVal BASE_PATH)
	response.write "<table class='basic-upload'>"
	response.write "<form action='" & BASE_PATH & "listUpload.asp?" & request.querystring & "' method='post' enctype='multipart/form-data'>"
	response.write "<tr><th>Basic uploader</th></tr>"
	response.write "<tr><td>Browse for a file, or just drag files onto this window.</td></tr>"
	response.write "<tr><td><input type='file' id='manual_upload' name='file1'></td></tr>"
	response.write "<tr><td><input type='submit' value='Upload'></td></tr>"
	response.write "</form>"
	response.write "</table>"
End Sub

Sub RenderPasteImage()
	response.write "<table id='click-paste'><tr><th>Click n Paste</th></tr>"
	response.write "<tr><td align='center' valign='middle'>"
	response.write "<div id='paste_screenshot' title='You can capture a screenshot by pressing alt-printscreen on the window, or copying the image from a paint program.'>"
	response.write "<p><span>Ctrl-V to paste an image!</span></p>"
	response.write "</div>"
	response.write "</td></tr></table>"
End Sub

%>