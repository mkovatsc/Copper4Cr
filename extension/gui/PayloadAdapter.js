Copper.PayloadAdapter = function(){
};

Copper.PayloadAdapter.onEvent = function(event){
	switch(event.type){
		case Copper.Event.TYPE_COAP_MESSAGE_RECEIVED:
			Copper.PayloadAdapter.updateIncomingPayload(event.data.coapMessage);
	}
};

Copper.PayloadAdapter.updateIncomingPayload = function(coapMessage){
	let payloadString = Copper.ByteUtils.convertBytesToString(coapMessage.payload);
	if (payloadString === undefined || payloadString === ""){
		document.getElementById("tab_incoming").innerHTML = "";
	}
	else {
		document.getElementById("tab_incoming").innerHTML = payloadString.replace(/\n|\r/g, "<br />");
	}
};