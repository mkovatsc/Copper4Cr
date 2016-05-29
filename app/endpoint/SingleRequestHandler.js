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
	this.coapMessageTemplate = coapMessage;
	this.transactionHandler = transactionHandler;
	this.settings = settings;
	this.endpointId = endpointId;

	this.registerToken(coapMessage.token);
	this.requestStart = Copper.TimeUtils.now();
	this.numberOfSentRequests = 0;
	this.observing = false;

	this.sendCoapMessage();
};

Copper.SingleRequestHandler.prototype.coapMessageTemplate = undefined;
Copper.SingleRequestHandler.prototype.transactionHandler = undefined;
Copper.SingleRequestHandler.prototype.settings = undefined;
Copper.SingleRequestHandler.prototype.endpointId = undefined;
Copper.SingleRequestHandler.prototype.token = undefined;
Copper.SingleRequestHandler.prototype.requestStart = undefined;
Copper.SingleRequestHandler.prototype.numberOfSentRequests = undefined;
Copper.SingleRequestHandler.prototype.observing = undefined;


Copper.SingleRequestHandler.prototype.registerToken = function(initialToken){
	if (this.transactionHandler.isTokenRegistered(initialToken)){
		Copper.Log.logInfo("Token " + Copper.ByteUtils.convertBytesToHexString(initialToken) + " is in use. Another token is used.");
		do {
			initialToken = Copper.ByteUtils.convertUintToBytes(parseInt(Math.random()*0x10000000));
		} while (this.transactionHandler.isTokenRegistered(initialToken));
	}
	this.token = initialToken;
	this.transactionHandler.registerToken(initialToken, this);
};

Copper.SingleRequestHandler.prototype.sendCoapMessage = function(){
		/* TODO: split sending of message */
	let coapMessage = this.coapMessageTemplate.clone();
	coapMessage.setToken(this.token);
	this.numberOfSentRequests++;
	this.transactionHandler.sendCoapMessage(coapMessage, this);
};

/*
	TODO:
		* Cancelation (together with client)
		* Requests in case of missing replies (max-age + 5-15s) (see RFC, 3.3.1)
		* Reordering (out of order detection) (see RFC)
*/
Copper.SingleRequestHandler.prototype.handleResponse = function(coapMessage, responseTransaction){
	if (!(coapMessage instanceof Copper.CoapMessage) || (responseTransaction !== undefined && !(responseTransaction instanceof Copper.ResponseTransaction))) {
		throw new Error("Illegal Argument");
	}
	let templateObserveOption = this.coapMessageTemplate.getOption(Copper.CoapMessage.OptionHeader.OBSERVE);
	if (this.numberOfSentRequests === 1 && templateObserveOption.length === 1 && templateObserveOption[0] === 0
			&& coapMessage.getOption(Copper.CoapMessage.OptionHeader.OBSERVE).length > 0){
		this.observing = true;
	}
	if (!this.observing){
		this.transactionHandler.unregisterToken(this.token);
		Copper.Event.sendEvent(Copper.Event.createRequestCompletedEvent(this.coapMessageTemplate, coapMessage, Copper.TimeUtils.now()-this.requestStart, this.endpointId));
	}
	else {

	}
	if (Copper.CoapMessage.Type.CON.equals(coapMessage.type)){
		responseTransaction.addResponse(Copper.CoapMessage.ack(coapMessage.mid, coapMessage.token));
	}
};

Copper.SingleRequestHandler.prototype.cancelRequest = function(){
	this.transactionHandler.unregisterToken(this.token, this);
};

Copper.SingleRequestHandler.prototype.onTimeout = function(requestTransaction){
	Copper.Event.sendEvent(Copper.Event.createCoapMessageTimedOutEvent(requestTransaction.coapMessage.mid, requestTransaction.coapMessage.token, requestTransaction.firstTransmissionStart, this.endpointId));
};

Copper.SingleRequestHandler.prototype.onEndOfLife = function(requestTransaction){
	if (!this.observing){
		this.transactionHandler.unregisterToken(this.token, this);
	}
};