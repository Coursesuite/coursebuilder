<div id="nameHelpModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="nameModalLabel3" aria-hidden="true">
  <div class="modal-header">
    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
    <h3 id="nameModalLabel3">File Names Demystified</h3>
  </div>
  <div class="modal-body">
  	<p>Generally, your filename is going to be the same as the page title, with ".html" after it. But the file name could just as easily be a number. It doesn't matter (in most cases).</p>
  	<p>The filename is only editable <i>before</i> you save the file contents. After that the filename is fixed. So use your brain when making new pages... A 'rename' function might magically appear if you ask Tim for it.</p>
  	<p>File names can be uppercase, lowercase, or any combination thereof. Got a problem with a page not loading? It's not going to be uppercase/lowercase related, for a start.</p>
  	<p><i>Spaces</i> matter. Some systems hate spaces. Spaces before and after a filename are <i>really, really bad</i>. Most systems also hate slashes, quotes, ampersands, brackets, and other symbol characters: <b>Never</b> use them!</p>
  	<p>Underscores (_) - are a <i>fine</i> symbol, and a good substitute for spaces. Every system likes underscores.</p>
  	<p>Where it gets tricky is the <i>prefix</i>. There are 3 special prefixes that we use to <i>hide</i> files from the navigation. (Hidden navigation doesn't contribute score or sequential release, etc).</p>
  	<ol>
  		<li><i>include</i>FileName.html<br>
  			This pattern is used by most tabs, accordions, and general sub-pages. They generally PARSE the page (meaning you can use curly markup on them).
  			Some commands like "{load}" do NOT parse what is loaded, so you can put raw HTML on those includes.
  		</li>
  		<li><i>parse</i>FileName.html<br>
  			This pattern is useful for popup lightboxes "{popup}" since it tells the lightbox to PARSE the page instead of embedding it as an iframe.
  		</li>
  		<li><i>popup</i>FileName.html<br>
  			This pattern is also used for popup lightboxes, and instructs them NOT TO parse the page, so you can use standard HTML on these pages.
  		</li>
  	</ol>
  	<p>If in doubt, get it right first time or you'll ruin everything. Er. No. Tell Tim and he'll fix it.</p>
  </div>
</div>