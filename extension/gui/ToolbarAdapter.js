Copper.ToolbarAdapter = function(){
};

Copper.ToolbarAdapter.init = function(){
	document.getElementById("copper-toolbar-ping").onclick = Copper.ToolbarAdapter.doPing;
	document.getElementById("copper-toolbar-discover").onclick = Copper.ToolbarAdapter.doDiscover;
	document.getElementById("copper-toolbar-get").onclick = Copper.ToolbarAdapter.doGet;
	document.getElementById("copper-toolbar-post").onclick = Copper.ToolbarAdapter.doPost;
	document.getElementById("copper-toolbar-put").onclick = Copper.ToolbarAdapter.doPut;
	document.getElementById("copper-toolbar-delete").onclick = Copper.ToolbarAdapter.doDelete;
	document.getElementById("copper-toolbar-observe").onclick = Copper.ToolbarAdapter.doObserve;
};

Copper.ToolbarAdapter.onEvent = function(event){
};

Copper.ToolbarAdapter.doPing = function(){
	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.EMPTY);
	Copper.Session.sendCoapMessage(coapMessage, true);
};

Copper.ToolbarAdapter.doDiscover = function(){
	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET);
	coapMessage.addOption(Copper.CoapMessage.OptionHeader.URI_PATH, ".well-known");
	coapMessage.addOption(Copper.CoapMessage.OptionHeader.URI_PATH, "core");
	Copper.Session.sendCoapMessage(coapMessage, true);
};

Copper.ToolbarAdapter.doGet = function(){
	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET);
	Copper.Session.sendCoapMessage(coapMessage);
};

Copper.ToolbarAdapter.doPost = function(){
	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.POST);
	Copper.Session.sendCoapMessage(coapMessage);
};

Copper.ToolbarAdapter.doPut = function(){
	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.PUT);
	Copper.Session.sendCoapMessage(coapMessage);
};

Copper.ToolbarAdapter.doDelete = function(){
	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.DELETE);
	Copper.Session.sendCoapMessage(coapMessage);
};

Copper.ToolbarAdapter.doObserve = function(){
	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET);
	coapMessage.addOption(Copper.CoapMessage.OptionHeader.OBSERVE, 0);
	Copper.Session.sendCoapMessage(coapMessage);
};
