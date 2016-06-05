Copper.BlockwiseSender = function(coapMessage, requestHandler, onComplete){
	if (!(coapMessage instanceof Copper.CoapMessage) || !(requestHandler instanceof Copper.SingleRequestHandler) || typeof(onComplete) !== "function"){
		throw new Error("Illegal argument");
	}
	this.coapMessage = coapMessage;
	this.requestHandler = requestHandler;
	this.onComplete = onComplete;

	if (this.requestHandler.settings.sendSize1){
		this.coapMessage.addOption(Copper.CoapMessage.OptionHeader.SIZE1, this.coapMessage.payload.byteLength, true);
	}
	this.blockSizeExp = this.requestHandler.settings.blockwiseEnabled ? (this.requestHandler.settings.blockSize === 0 ? 10 : this.requestHandler.settings.blockSize) : undefined;
	this.offset = 0;
	this.firstRequest = true;
};

Copper.BlockwiseSender.prototype.coapMessage = undefined;
Copper.BlockwiseSender.prototype.requestHandler = undefined;
Copper.BlockwiseSender.prototype.requestStart = undefined;
Copper.BlockwiseSender.prototype.onComplete = undefined;
Copper.BlockwiseSender.prototype.blockSizeExp = undefined;
Copper.BlockwiseSender.prototype.offset = undefined;
Copper.BlockwiseSender.prototype.firstRequest = undefined;

Copper.BlockwiseSender.prototype.start = function(){
	this.requestStart = Copper.TimeUtils.now();
	if (this.blockSizeExp === undefined || this.coapMessage.payload.byteLength <= Copper.CoapMessage.BlockOption.szExpToSize(this.blockSizeExp)){
		this.requestHandler.sendCoapMessage(this.coapMessage.clone());	
	}
	else {
		this.sendNextMessage();
	}
};

Copper.BlockwiseSender.prototype.onReceiveComplete = function(sentCoapMessage, receivedCoapMessage){
	let block1 = receivedCoapMessage.getOption(Copper.CoapMessage.OptionHeader.BLOCK1);
	if (block1.length === 0 || !this.requestHandler.settings.blockwiseEnabled){
		Copper.Event.sendEvent(Copper.Event.createRequestCompletedEvent(sentCoapMessage, receivedCoapMessage, Copper.TimeUtils.now() - this.requestStart, this.requestHandler.endpointId));
		this.onComplete();
		return;
	}
	if (this.firstRequest){
		if (Copper.CoapMessage.Code.CONTINUE.equals(receivedCoapMessage.code)){
			this.blockSizeExp = block1[0].szExp;
		}
		else if (Copper.CoapMessage.Code.REQUEST_ENTITY_TOO_LARGE.equals(receivedCoapMessage.code)){
			this.blockSizeExp = block1[0].szExp;
			this.offset = 0;
		}
		this.firstRequest = false;
	}
	if (receivedCoapMessage.code.isSuccessCode() && this.hasMoreBlocks()){
		this.sendNextMessage();
	}
	else {
		Copper.Event.sendEvent(Copper.Event.createRequestCompletedEvent(sentCoapMessage, receivedCoapMessage, Copper.TimeUtils.now() - this.requestStart, this.requestHandler.endpointId));
		this.onComplete();
	}
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

/* Implementation */
Copper.BlockwiseSender.prototype.sendNextMessage = function(){
	let blockSize = Copper.CoapMessage.BlockOption.szExpToSize(this.blockSizeExp);
	let coapMessage = this.coapMessage.clone(this.offset, blockSize);
	this.offset += blockSize;
	coapMessage.addOption(Copper.CoapMessage.OptionHeader.BLOCK1, new Copper.CoapMessage.BlockOption((this.offset / blockSize) - 1, this.blockSizeExp, this.hasMoreBlocks()), true);
	this.requestHandler.sendCoapMessage(coapMessage);	
};

Copper.BlockwiseSender.prototype.hasMoreBlocks = function(){
	return this.offset <= this.coapMessage.payload.byteLength;
};

Copper.BlockwiseSender.prototype.onComplete = function(){
	this.onComplete();
};