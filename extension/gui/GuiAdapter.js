Copper.GuiAdapter = function(clientId){
	this.clientId = clientId;

	let thisRef = this;
	// register callbacks
	document.getElementById("btn_get").onclick = function(){ thisRef.doGet(); };
};

Copper.GuiAdapter.prototype.clientId = undefined;

Copper.GuiAdapter.prototype.doGet = function(){
	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET);
	Copper.Event.sendEvent(Copper.Event.createClientSendCoapMessageEvent(coapMessage, this.clientId));
};

Copper.GuiAdapter.prototype.updatePacketHeader = function(coapMessage){
	if (!(coapMessage instanceof Copper.CoapMessage)){
		throw new Error("Illegal argument");
	}
	document.getElementById("packet_header_type").innerHTML = coapMessage.type.name;
	document.getElementById("packet_header_code").innerHTML = coapMessage.code.getName();
	document.getElementById("packet_header_mid").innerHTML = coapMessage.mid;
	document.getElementById("packet_header_token").innerHTML = Copper.ByteUtils.convertBytesToHexString(coapMessage.token);
};

Copper.GuiAdapter.prototype.updateIncomingPayload = function(coapMessage){
	if (!(coapMessage instanceof Copper.CoapMessage)){
		throw new Error("Illegal argument");
	}
	let payloadString = Copper.ByteUtils.convertBytesToString(coapMessage.payload);
	if (payloadString === undefined || payloadString === ""){
		document.getElementById("tab_incoming").innerHTML = "";
	}
	else {
		document.getElementById("tab_incoming").innerHTML = payloadString.replace(/\n|\r/g, "<br />");
	}
};