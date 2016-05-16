Copper.ClientEndpoint = function(port, id){
	if (!port || !Number.isInteger(id)){
		throw new Error("Illegal Arguments");
	}
	this.id = id;
	this.port = port;
	
	let thisRef = this;

	this.eventCallback = function(event){
		return thisRef.dispatchEvent(event);
	};
	Copper.Event.registerCallback(this.eventCallback, this.id);
};

/* prototype */
Copper.ClientEndpoint.prototype.port = undefined;
Copper.ClientEndpoint.prototype.id = undefined;
Copper.ClientEndpoint.prototype.eventCallback = undefined;


/* Callbacks */
/* Callback for the Copper event queue */
Copper.ClientEndpoint.prototype.dispatchEvent = function(event){
	if (!Number.isInteger(event.type)){
		throw new Error("Illegal Arguments");
	}
	Copper.Log.logInfo(event);
	try {
		switch(event.type){
			case Copper.Event.TYPE_SEND_COAP_MESSAGE:
				return this.onSendCoapMessage(event.data.coapMessage);
			default:
				return true;
		}
	} catch (exception) {
		Copper.Log.logError("Error on endpoint " + this.id + ": " + exception.message);
		return true;
	}
};

Copper.ClientEndpoint.prototype.onSendCoapMessage = function(coapMessage){
	this.port.sendMessage(Copper.Event.createClientSendCoapMessageEvent(coapMessage, this.id));
	return true;
};