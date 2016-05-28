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
	let incomingTabElement = document.getElementById("tab_incoming");
	if (payloadString === undefined || payloadString === ""){
		incomingTabElement.textContent = "";
	}
	else {
		let texts = payloadString.split(/\r\n|\n/);
		incomingTabElement.appendChild(document.createTextNode(texts[0]));
		for (let i=1; i<texts.length; i++){
			incomingTabElement.appendChild(document.createElement("br"));
			incomingTabElement.appendChild(document.createTextNode(texts[i]));
		}
	}
};