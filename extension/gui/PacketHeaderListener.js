Copper.PacketHeaderListener = function(){
};

Copper.PacketHeaderListener.onEvent = function(event, guiAdapter){
	switch(event.type){
		case Copper.Event.TYPE_COAP_MESSAGE_RECEIVED:
			guiAdapter.updatePacketHeader(event.data.coapMessage);
			return true;
	}
	return false;
};