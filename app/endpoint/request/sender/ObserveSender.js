/*
	TODO:
		* Requests in case of missing replies (max-age + 5-15s) (see RFC, 3.3.1)
		* Reordering (out of order detection) (see RFC)
*/

Copper.ObserveSender = function(isBlockwiseSender, coapMessage, requestHandler, onComplete){
	if (!(coapMessage instanceof Copper.CoapMessage) || !(requestHandler instanceof Copper.SingleRequestHandler) || typeof(onComplete) !== "function"){
		throw new Error("Illegal argument");
	}
	let thisRef = this;
	this.coapMessage = coapMessage;
	this.requestHandler = requestHandler;
	this.onComplete = onComplete;
	this.sender = isBlockwiseSender ? 
		new Copper.BlockwiseSender(this.coapMessage, requestHandler, function(){ thisRef.onComplete(); }) : 
		new Copper.SingleSender(this.coapMessage, requestHandler, function(){ thisRef.onComplete(); });
};

Copper.ObserveSender.prototype.coapMessage = undefined;
Copper.ObserveSender.prototype.requestHandler = undefined;
Copper.ObserveSender.prototype.requestStart = undefined;

Copper.ObserveSender.prototype.start = function(){
	this.sender.start();
};

Copper.ObserveSender.prototype.onReceiveComplete = function(sentCoapMessage, receivedCoapMessage){
	let observeOption = receivedCoapMessage.getOption(Copper.CoapMessage.OptionHeader.OBSERVE);
	if (observeOption.length === 0){
		// no more observing --> stop it
		this.onComplete();
	}
	Copper.Event.sendEvent(Copper.Event.createRequestCompletedEvent(sentCoapMessage, receivedCoapMessage, Copper.TimeUtils.now() - this.requestStart, this.requestHandler.endpointId));
};

Copper.ObserveSender.prototype.onReceiveError = function(errorMessage){
	this.sender.onReceiveError();
};

Copper.ObserveSender.prototype.onTimeout = function(){
	this.sender.onTimeout();
};

Copper.ObserveSender.prototype.cancel = function(){
	this.sender.cancel();
};

Copper.ObserveSender.prototype.onComplete = function(){
	this.onComplete();
};