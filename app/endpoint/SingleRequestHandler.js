/*
* This object handles a single Request from the client, meaning
* - It performs blockwise transfer where appropriate
* - It handles observable resources
*/
Copper.SingleRequestHandler = function(coapMessage, transmissionHandler, settings, endpointId){
	if (!(coapMessage instanceof Copper.CoapMessage) || !(transmissionHandler instanceof Copper.TransmissionHandler) || !(settings instanceof Copper.Settings)
			|| !Number.isInteger(endpointId)){
		throw new Error("Illegal Argument");
	}
	this.coapMessageTemplate = coapMessage;
	this.transmissionHandler = transmissionHandler;
	this.settings = settings;
	this.endpointId = endpointId;

	this.registerToken(coapMessage.token);
	this.requestStart = Copper.TimeUtils.now();
	this.numberOfSentRequests = 0;
	this.observing = false;

	this.sendCoapMessage();
};

Copper.SingleRequestHandler.prototype.coapMessageTemplate = undefined;
Copper.SingleRequestHandler.prototype.transmissionHandler = undefined;
Copper.SingleRequestHandler.prototype.settings = undefined;
Copper.SingleRequestHandler.prototype.endpointId = undefined;
Copper.SingleRequestHandler.prototype.token = undefined;
Copper.SingleRequestHandler.prototype.requestStart = undefined;
Copper.SingleRequestHandler.prototype.numberOfSentRequests = undefined;
Copper.SingleRequestHandler.prototype.observing = undefined;


Copper.SingleRequestHandler.prototype.registerToken = function(initialToken){
	if (this.transmissionHandler.isTokenRegistered(initialToken)){
		Copper.Log.logInfo("Token " + Copper.ByteUtils.convertBytesToHexString(initialToken) + " is in use. Another token is used.");
		do {
			initialToken = Copper.ByteUtils.convertUintToBytes(parseInt(Math.random()*0x10000000));
		} while (this.transmissionHandler.isTokenRegistered(initialToken));
	}
	this.token = initialToken;
	this.transmissionHandler.registerToken(initialToken, this);
};

Copper.SingleRequestHandler.prototype.sendCoapMessage = function(){
		/* TODO: split sending of message */
	let coapMessage = this.coapMessageTemplate.clone();
	coapMessage.setToken(this.token);
	this.numberOfSentRequests++;
	this.transmissionHandler.sendCoapMessage(coapMessage, this);
};

/*
	TODO:
		* Cancelation (together with client)
		* Requests in case of missing replies (max-age + 5-15s) (see RFC, 3.3.1)
		* Reordering (out of order detection) (see RFC)
*/
Copper.SingleRequestHandler.prototype.handleResponse = function(coapMessage, responseTransmission){
	if (!(coapMessage instanceof Copper.CoapMessage) || (responseTransmission !== undefined && !(responseTransmission instanceof Copper.ResponseMessageTransmission))) {
		throw new Error("Illegal Argument");
	}
	let templateObserveOption = this.coapMessageTemplate.getOption(Copper.CoapMessage.OptionHeader.OBSERVE);
	if (this.numberOfSentRequests === 1 && templateObserveOption.length === 1 && templateObserveOption[0] === 0
			&& coapMessage.getOption(Copper.CoapMessage.OptionHeader.OBSERVE).length > 0){
		this.observing = true;
	}
	if (!this.observing){
		this.transmissionHandler.unregisterToken(this.token);
	}
	else {

	}
	if (Copper.CoapMessage.Type.CON.equals(coapMessage.type)){
		responseTransmission.addResponse(Copper.CoapMessage.ack(coapMessage.mid, coapMessage.token));
	}
};

Copper.SingleRequestHandler.prototype.cancelRequest = function(){
	this.transmissionHandler.unregisterToken(this.token, this);
};

Copper.SingleRequestHandler.prototype.onTimeout = function(requestTransmission){
};

Copper.SingleRequestHandler.prototype.onEndOfLife = function(requestTransmission){
	if (!this.observing){
		this.transmissionHandler.unregisterToken(this.token, this);
	}
};