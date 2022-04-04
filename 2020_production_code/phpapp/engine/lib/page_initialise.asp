<!-- #include file="incConfig.asp" -->
<!--#include file="ajaxed_settings.asp"-->

<!-- #include file="incJScript.asp" -->
<!-- #include file="fnManifest.asp" -->
<!-- #include file="fnScorm.asp" -->
<!-- #include file="fnSettings.asp" -->
<!-- #include file="fnUtils.asp" -->
<!-- #include file="fnXml.asp" -->
<!-- #include file="incMain.asp" -->

<!-- #include file="Parsers/json2.asp" -->
<!-- #include file="Parsers/handlebars.asp" -->

<!-- #include file="classFileIORoutines.asp" -->
<!-- #include file="classLibrary.asp" -->
<!-- #include file="classStringOperations.asp" -->
<!-- #include file="classDataContainer.asp" -->
<!-- #include file="classDatabase.asp" -->
<!-- #include file="classLogger.asp" -->
<!-- #include file="classMd5.asp" -->
<!-- #include file="classBuggr.asp" -->

<!-- #include file="classTardPage.asp" -->


<%
Dim lib :		set lib			= new Library
				set lib.logger	= new Logger
Dim str :		set str			= new StringOperations
Dim db :		set db			= new Database
Dim md5er :		set md5er		= new md5
Dim Buggr :		Set Buggr		= New clsBuggr
Dim IO : 		Set IO			= New FileIORoutines
Dim Config :	Set Config		= New clsConfig
Dim Page

db.close()
db.openDefault()

Dim CURRENT_PAGE, COURSE, MAPPED_COURSE, BASE_PATH, CURRENT_SMALL_PATH
Dim COMMAND, SELECTION, CONTAINERID, RETURNMODE, COURSE_ID, SETTINGS_JSON

Dim spl : spl = Split(Request.ServerVariables("SCRIPT_NAME"),"/")

BASE_PATH = "/engine/"
' CURRENT_PAGE = Mid(Replace(LCase(Request.ServerVariables("SCRIPT_NAME")), ".asp", ""), InStr(Request.ServerVariables("SCRIPT_NAME"),"/") + 1)
CURRENT_PAGE = spl(ubound(spl)-1)

COURSE_ID = Request.QueryString("ID")
' COURSE = Request.QueryString("FOLDER")
COMMAND = Request.QueryString("COMMAND")
SELECTION = Request.QueryString("SELECTION")
CONTAINERID = Request.QueryString("CONTAINERID")
RETURNMODE = Request.QueryString("RETURNMODE")

COURSE = ""
MAPPED_COURSE = ""

If COURSE_ID > 0 AND CURRENT_PAGE <> "tickets" Then
	COURSE = GetCoursePath(COURSE_ID)
	MAPPED_COURSE = Server.MapPath(COURSE)
	Call fnSettings_getCourseJsonObj(COURSE_ID, "config", SETTINGS_JSON)
	Set Page = (New TardPage)(Array(CURRENT_PAGE, COURSE_ID))
Else
	Set Page = (New TardPage)(Array(CURRENT_PAGE))
End If

If COURSE > "" Then
	CURRENT_SMALL_PATH = COURSE
End If

Call Main_PersonalContainer_Set()

%>
