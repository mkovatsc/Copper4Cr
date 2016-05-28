Copper.ClientEndpoint = function(port, id){
	if (!port || !Number.isInteger(id)){
		throw new Error("Illegal Arguments");
	}
	this.id = id;
	this.port = port;
};

/* prototype */
Copper.ClientEndpoint.prototype.port = undefined;
Copper.ClientEndpoint.prototype.id = undefined;
Copper.ClientEndpoint.prototype.eventCallback = undefined;

Copper.ClientEndpoint.prototype.sendCoapMessage = function(coapMessage){
	if (!(coapMessage instanceof Copper.CoapMessage)){
		throw new Error("Illegal Argument");
	}
	this.port.sendMessage(Copper.Event.createClientSendCoapMessageEvent(coapMessage, this.id));
	return true;
};