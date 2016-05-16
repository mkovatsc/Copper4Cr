Copper.PayloadListener = function(){
};

Copper.PayloadListener.onEvent = function(event, guiAdapter){
	switch(event.type){
		case Copper.Event.TYPE_COAP_MESSAGE_RECEIVED:
			guiAdapter.updateIncomingPayload(event.data.coapMessage);
			return true;
	}
	return false;
};