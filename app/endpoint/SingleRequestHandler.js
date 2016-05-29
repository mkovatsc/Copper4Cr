/*
* This object handles a single Request from the client, meaning
* - It performs blockwise transfer where appropriate
* - It handles observable resources
*/
Copper.SingleRequestHandler = function(coapMessage, transactionHandler, settings, endpointId){
	if (!(coapMessage instanceof Copper.CoapMessage) || !(transactionHandler instanceof Copper.TransactionHandler) || !(settings instanceof Copper.Settings)
			|| !Number.isInteger(endpointId)){
		throw new Error("Illegal Argument");
	}
	
	this.coapMessage = coapMessage;
	this.transactionHandler = transactionHandler;
	this.settings = settings;
	this.endpointId = endpointId;

	if (this.transactionHandler.isTokenRegistered(this.coapMessage.token)){
		Copper.Log.logInfo("Token " + Copper.ByteUtils.convertBytesToHexString(this.coapMessage.token) + " is in use. Another token is used.");
		do {
			this.coapMessage.setToken(Copper.ByteUtils.convertUintToBytes(parseInt(Math.random()*0x10000000)));
		} while (this.transactionHandler.isTokenRegistered(this.coapMessage.token));
	}
	this.transactionHandler.registerToken(this.coapMessage.token, this);
	this.requestStart = Copper.TimeUtils.now();

	/* TODO: split sending of message */
	this.transactionHandler.sendCoapMessage(coapMessage, this);
};

Copper.SingleRequestHandler.prototype.completeRequestTransaction = function(coapMessage, requestTransaction, responseTransaction){
	if (!(coapMessage instanceof Copper.CoapMessage) || !(requestTransaction instanceof Copper.RequestTransaction) 
			|| (responseTransaction !== undefined && !(responseTransaction instanceof Copper.ResponseTransaction))) {
		throw new Error("Illegal Argument");
	}
	this.transactionHandler.unregisterToken(this.coapMessage.token);
	Copper.Event.sendEvent(Copper.Event.createRequestCompletedEvent(this.coapMessage, coapMessage, Copper.TimeUtils.now()-this.requestStart, this.endpointId));
	if (Copper.CoapMessage.Type.CON.equals(coapMessage.type)){
		responseTransaction.addResponse(Copper.CoapMessage.ack(coapMessage.mid, coapMessage.token));
	}
};

Copper.SingleRequestHandler.prototype.onTimeout = function(requestTransaction){
	Copper.Event.sendEvent(Copper.Event.createCoapMessageTimedOutEvent(requestTransaction.mid, requestTransaction.token, requestTransaction.firstTransmissionStart, this.endpointId));
};

Copper.SingleRequestHandler.prototype.onEndOfLife = function(requestTransaction){
	this.transactionHandler.unregisterToken(requestTransaction.coapMessage.token, this);
};