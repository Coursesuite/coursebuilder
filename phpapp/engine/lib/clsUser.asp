'
'	User.authenticate(username, password) => boolean
'	User.can(Capability) => boolean
' 	User.password => r/w
'	User.email => r/w
'	User.update => boolean
'	User.id => r
' 	User.name => r/w
'	User.create =>
'

class User
	Private Name
	Private Password
	Private Email
	Private Id
	
	Public Sub Class_Initialize
		Set Obj = Server.CreateObject("MSXML2.FreeThreadedDOMDocument")
		Obj.async = False
	End Sub
	Public Sub Class_Terminate
		Set Obj = Nothing
	End Sub
	
	Public Sub 
	
		Public Sub Class_Initialize
		Set Obj = Server.CreateObject("MSXML2.FreeThreadedDOMDocument")
		Obj.async = False
	End Sub
	Public Sub Class_Terminate
		Set Obj = Nothing
	End Sub
	
		Public Property Let Path(ByVal sPath)
		File = sPath
	End Property

	Public Property Get Xml
		If Obj Is Nothing Then Exit Property
		Xml = Obj.Xml
	End Property
