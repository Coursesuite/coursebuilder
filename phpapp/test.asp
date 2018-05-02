<%
	
	db = "Driver={MySQL ODBC 5.1 Driver};Server=127.0.0.1;Port=23306;Database=coursebildr;User=coursebuilder;Password=T3#fh*&^vf^g3FC;Option=3;charset=utf8"
	set connection = server.createObject("ADODB.connection")
	connection.open(AJAXED_CONNSTRING)
	
	%>