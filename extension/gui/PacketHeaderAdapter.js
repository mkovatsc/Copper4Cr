Copper.PacketHeaderAdapter = function(){
};

Copper.PacketHeaderAdapter.onEvent = function(event){
	switch(event.type){
		case Copper.Event.TYPE_COAP_MESSAGE_RECEIVED:
			Copper.PacketHeaderAdapter.updatePacketHeader(event.data.coapMessage);
	}
};

Copper.PacketHeaderAdapter.updatePacketHeader = function(coapMessage){
	document.getElementById("packet_header_type").innerHTML = coapMessage.type.name;
	document.getElementById("packet_header_code").innerHTML = coapMessage.code.getName();
	document.getElementById("packet_header_mid").innerHTML = coapMessage.mid;
	document.getElementById("packet_header_token").innerHTML = Copper.ByteUtils.convertBytesToHexString(coapMessage.token);
};
