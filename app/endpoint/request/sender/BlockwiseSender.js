Copper.BlockwiseSender = function(coapMessage, requestHandler, onComplete){
	if (!(coapMessage instanceof Copper.CoapMessage) || !(requestHandler instanceof Copper.SingleRequestHandler) || typeof(onComplete) !== "function"){
		throw new Error("Illegal argument");
	}
	this.coapMessage = coapMessage;
	this.requestHandler = requestHandler;
	this.onComplete = onComplete;
};

Copper.BlockwiseSender.prototype.coapMessage = undefined;
Copper.BlockwiseSender.prototype.requestHandler = undefined;
Copper.BlockwiseSender.prototype.requestStart = undefined;

Copper.BlockwiseSender.prototype.start = function(){
	this.requestStart = Copper.TimeUtils.now();
	this.requestHandler.sendCoapMessage(this.coapMessage);
};

Copper.BlockwiseSender.prototype.onReceiveComplete = function(sentCoapMessage, receivedCoapMessage){
	Copper.Event.sendEvent(Copper.Event.createRequestCompletedEvent(sentCoapMessage, receivedCoapMessage, Copper.TimeUtils.now() - this.requestStart, this.requestHandler.endpointId));
	this.onComplete();
};

Copper.BlockwiseSender.prototype.onReceiveError = function(errorMessage){
	Copper.Event.sendEvent(Copper.Event.createRequestReceiveErrorEvent(this.coapMessage, this.requestHandler.endpointId));
	this.onComplete();
};

Copper.BlockwiseSender.prototype.onTimeout = function(){
	this.requestHandler.cancelReceiver();
	Copper.Event.sendEvent(Copper.Event.createRequestTimeoutEvent(this.coapMessage, this.requestHandler.endpointId));
	this.onComplete();
};

Copper.BlockwiseSender.prototype.cancel = function(){
	this.requestHandler.cancelReceiver();
	Copper.Event.sendEvent(Copper.Event.createRequestCanceledEvent(this.coapMessage, this.requestHandler.endpointId));
	this.onComplete();
};

Copper.BlockwiseSender.prototype.onComplete = function(){
	this.onComplete();
};