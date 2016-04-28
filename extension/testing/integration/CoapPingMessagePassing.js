// Sends a coap ping to the vs0.inf.ethz.ch server
// using the CoapMessages and message passing
chrome.browserAction.onClicked.addListener(function(tab) {
    Copper.Log.registerLogger(Copper.ConsoleLogger.log);

    let clientPort = chrome.runtime.connect("mbighlecbopknoggoappifafoffcnocc");

    let onServerMessage = function(msgunparsed){
    	msg = Copper.Event.createFromJson(msgunparsed);
    	Copper.Log.logInfo(msgunparsed);
    	switch(msg.type){
    		case Copper.Event.TYPE_CLIENT_REGISTERED:
    			let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.EMPTY);
				coapMessage.setMid(4);
    			clientPort.postMessage(Copper.Event.convertToJson(Copper.Event.createClientSendCoapMessageEvent(coapMessage, 0)));
    			break;
    		case Copper.Event.TYPE_COAP_MESSAGE_RECEIVED:
    			Copper.Log.logInfo("Received Coap Message");
    			Copper.Log.logInfo(msg.data.coapMessage.toString());
                clientPort.disconnect();
    			break;
    	}
    };
	clientPort.onMessage.addListener(onServerMessage);

	clientPort.postMessage(Copper.Event.convertToJson(Copper.Event.createRegisterClientEvent("vs0.inf.ethz.ch", 5683, 0)));
});