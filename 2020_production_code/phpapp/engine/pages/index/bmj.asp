<!-- #include virtual="/engine/pages/common/page_start.asp" -->
<!-- #include file="subroutines.asp" -->

    <div class="container">
    
    	<div id="filter" class="row" style="margin-top:5em; background-color: #fff; border: 1px solid #ccc; padding: 1em;">
	    	
	    	<h1>Ye Olde BMJ Xml Course Maker</h1>
	    	
			<form method="post" action="/engine/bmjupload.asp" enctype="multipart/form-data" name="form1">
				  Choose BMJ XML File:
				  <input type="file" name="file1" id="file1" placeholder="Choose a file" />
				  <input type="submit" value="Upload">
			</form>   			
		
		</div>

		<div class="row box-shadow index-footer" id="word-adder">
			<div class="input-append">
			  <input class="input-large" id="appendedInputButton" type="text" placeholder="Add new words...">
			  <button class="btn" type="button" id="addAWord">Add 'em</button>
			  <button class="btn btn-inverse" type="button" id="randomiseXY">Shuffle!</button>
			</div>
		</div>

	</div>
 
<!-- #include virtual="/engine/pages/common/page_end.asp" -->