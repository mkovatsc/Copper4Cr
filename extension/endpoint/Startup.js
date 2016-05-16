window.onload = function(){
	Copper.ComponentFactory = Copper.ChromeComponentFactory;
    Copper.Log.registerLogger(Copper.ConsoleLogger.log);

    let clientId = 1;
    let guiAdapter = new Copper.GuiAdapter(clientId);

    let clientEndpoint = new Copper.ClientEndpoint(Copper.ComponentFactory.createPort(chrome.runtime.connect("mbighlecbopknoggoappifafoffcnocc"), clientId), clientId);
    clientEndpoint.port.sendMessage(Copper.Event.createRegisterClientEvent("129.132.15.80", 5683, new Copper.Settings(), 1));

    Copper.Event.registerCallback(function(event){
    	Copper.PacketHeaderListener.onEvent(event, guiAdapter);
    	Copper.PayloadListener.onEvent(event, guiAdapter);
    	// register more consumers
    }, clientId);
};