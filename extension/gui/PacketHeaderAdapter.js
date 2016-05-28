Copper.PacketHeaderAdapter = function(){
};

Copper.PacketHeaderAdapter.onEvent = function(event){
	switch(event.type){
		case Copper.Event.TYPE_COAP_MESSAGE_RECEIVED:
			Copper.PacketHeaderAdapter.updatePacketHeader(event.data.coapMessage);
	}
};

Copper.PacketHeaderAdapter.updatePacketHeader = function(coapMessage){
	document.getElementById("copper-packet-header-type").textContent = coapMessage.type.name;
	document.getElementById("copper-packet-header-code").textContent = coapMessage.code.getName();
	document.getElementById("copper-packet-header-mid").textContent = coapMessage.mid;
	document.getElementById("copper-packet-header-token").textContent = Copper.ByteUtils.convertBytesToHexString(coapMessage.token);
};
