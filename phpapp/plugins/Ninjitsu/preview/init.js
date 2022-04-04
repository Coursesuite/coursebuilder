function render() {
	// console.log("render in init.js in ninjitsu:preview : ", PluginModel);
	var optimised = js_optimisePage(PluginModel.content, PluginModel.template, "");
	window.parent.postMessage({html:optimised,action:"preview"});
	document.getElementById("output").innerHTML = optimised.split("@sco_root@").join(PluginModel.mappedfolder + "/SCO1");
	try{reBindThingsThatMightBeDynamicallyLoaded($("#output"));}catch(ex){};
}
window.addEventListener('message', function(event) {
	PluginModel.content = event.data.content;
	PluginModel.template = event.data.template;
	render();
});
window.parent.postMessage({action:"ready"});
render();