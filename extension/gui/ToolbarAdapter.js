Copper.ToolbarAdapter = function(){
};

Copper.ToolbarAdapter.init = function(){
	document.getElementById("copper-toolbar-get").onclick = Copper.ToolbarAdapter.doGet;
	document.getElementById("copper-toolbar-observe").onclick = Copper.ToolbarAdapter.doObserve;
};

Copper.ToolbarAdapter.onEvent = function(event){
};

Copper.ToolbarAdapter.doGet = function(){
	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET);
	Copper.Session.sendCoapMessage(coapMessage);
};

Copper.ToolbarAdapter.doObserve = function(){
	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET);
	coapMessage.addOption(Copper.CoapMessage.OptionHeader.OBSERVE, 0);
	Copper.Session.sendCoapMessage(coapMessage);
};
