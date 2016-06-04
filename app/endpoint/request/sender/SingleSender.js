Copper.SingleSender = function(coapMessage, requestHandler, onComplete){
	if (!(coapMessage instanceof Copper.CoapMessage) || !(requestHandler instanceof Copper.SingleRequestHandler) || typeof(onComplete) !== "function"){
		throw new Error("Illegal argument");
	}
	this.coapMessage = coapMessage;
	this.requestHandler = requestHandler;
	this.onComplete = onComplete;
};

Copper.SingleSender.prototype.coapMessage = undefined;
Copper.SingleSender.prototype.requestHandler = undefined;
Copper.SingleSender.prototype.requestStart = undefined;

Copper.SingleSender.prototype.start = function(){
	this.requestStart = Copper.TimeUtils.now();
	this.requestHandler.sendCoapMessage(this.coapMessage);
};

Copper.SingleSender.prototype.onReceiveComplete = function(sentCoapMessage, receivedCoapMessage){
	Copper.Event.sendEvent(Copper.Event.createRequestCompletedEvent(sentCoapMessage, receivedCoapMessage, Copper.TimeUtils.now() - this.requestStart, this.requestHandler.endpointId));
	this.onComplete();
};

Copper.SingleSender.prototype.onReceiveError = function(errorMessage){
	Copper.Event.sendEvent(Copper.Event.createRequestReceiveErrorEvent(this.coapMessage, this.requestHandler.endpointId));
	this.onComplete();
};

Copper.SingleSender.prototype.onTimeout = function(){
	this.requestHandler.cancelReceiver();
	Copper.Event.sendEvent(Copper.Event.createRequestTimeoutEvent(this.coapMessage, this.requestHandler.endpointId));
	this.onComplete();
};

Copper.SingleSender.prototype.cancel = function(){
	this.requestHandler.cancelReceiver();
	Copper.Event.sendEvent(Copper.Event.createRequestCanceledEvent(this.coapMessage, this.requestHandler.endpointId));
	this.onComplete();
};

Copper.SingleSender.prototype.onComplete = function(){
	this.onComplete();
};