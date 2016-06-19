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
	this.coapMessage = coapMessage;
	this.transmissionHandler = transmissionHandler;
	this.settings = settings;
	this.endpointId = endpointId;
};

Copper.SingleRequestHandler.prototype.coapMessage = undefined;
Copper.SingleRequestHandler.prototype.transmissionHandler = undefined;
Copper.SingleRequestHandler.prototype.settings = undefined;
Copper.SingleRequestHandler.prototype.endpointId = undefined;

Copper.SingleRequestHandler.prototype.sender = undefined;
Copper.SingleRequestHandler.prototype.receiver = undefined;


Copper.SingleRequestHandler.prototype.start = function(){
	let thisRef = this;

	// check properties of coap message
	let observeOption = this.coapMessage.getOption(Copper.CoapMessage.OptionHeader.OBSERVE);
	let observing = observeOption.length === 1 && observeOption[0] === 0;

	// create token and register this handler
	let token = this.coapMessage.token;
	let randomToken = false;
	if (this.transmissionHandler.isTokenRegistered(token)) {
		Copper.Log.logInfo("Token " + Copper.ByteUtils.convertBytesToHexString(token) + " is in use. Another token is used.");
		randomToken = true;
	}
	else if (observing && this.settings.observeToken) {
		Copper.Log.logInfo("Generate token for observing request");
		randomToken = true;
	}
	if (randomToken) {
		do {
			token = Copper.ByteUtils.convertUintToBytes(parseInt(Math.random()*0x10000000));
		} while (this.transmissionHandler.isTokenRegistered(token));
	}
	this.transmissionHandler.registerToken(token, this);
	this.coapMessage.setToken(token);
	
	// create sender and start it
	if (observing) {
		this.sender = new Copper.ObserveSender(this.coapMessage, this, function(){ thisRef.onSenderFinished(); });
	}
	else {
		this.sender = new Copper.BlockwiseSender(this.coapMessage, this, function(){ thisRef.onSenderFinished(); });
	}

	this.sender.start();
};

Copper.SingleRequestHandler.prototype.handleResponse = function(sentCoapMessage, receivedCoapMessage, responseTransmission){
	if (!(sentCoapMessage instanceof Copper.CoapMessage) || !(receivedCoapMessage instanceof Copper.CoapMessage) || 
		    (responseTransmission !== undefined && !(responseTransmission instanceof Copper.ResponseMessageTransmission))) {
		throw new Error("Illegal Argument");
	}
	if (this.receiver === undefined){
		let block2Option = receivedCoapMessage.getOption(Copper.CoapMessage.OptionHeader.BLOCK2);
		let isBlockwiseReceiver = this.settings.blockwiseEnabled && block2Option.length === 1;
		if (isBlockwiseReceiver){
			this.receiver = new Copper.BlockwiseReceiver(this, sentCoapMessage.clone(), receivedCoapMessage.clone());
		}
		else {
			this.receiver = new Copper.SingleReceiver(this);
		}
	}
	this.receiver.onReceive(sentCoapMessage, receivedCoapMessage, responseTransmission);
};

Copper.SingleRequestHandler.prototype.onTimeout = function(){
	this.sender.onTimeout();
};

Copper.SingleRequestHandler.prototype.cancel = function(){
	this.sender.cancel();
};

Copper.SingleRequestHandler.prototype.sendCoapMessage = function(coapMessage){
	if (!(coapMessage instanceof Copper.CoapMessage)){
		throw new Error("Illegal Argument");
	}
	this.transmissionHandler.sendCoapMessage(coapMessage, this);
};

// sender callbacks
Copper.SingleRequestHandler.prototype.cancelReceiver = function(){
	if (this.receiver !== undefined){
		this.receiver.cancel();
	}
};

Copper.SingleRequestHandler.prototype.onSenderFinished = function(){
	this.transmissionHandler.unregisterToken(this.coapMessage.token);
};

// receiver callbacks
Copper.SingleRequestHandler.prototype.onReceiveComplete = function(sentCoapMessage, receivedCoapMessage){
	this.sender.onReceiveComplete(sentCoapMessage, receivedCoapMessage);
};

Copper.SingleRequestHandler.prototype.onReceiveError = function(errorMessage){
	this.sender.onReceiveError(errorMessage);
};

Copper.SingleRequestHandler.prototype.onReceiverFinished = function(){
	this.receiver = undefined;
};