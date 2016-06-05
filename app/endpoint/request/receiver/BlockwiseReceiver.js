Copper.BlockwiseReceiver = function(requestHandler, initialSentCoapMessage, initialReceivedCoapMessage){
	if (!(requestHandler instanceof Copper.SingleRequestHandler) || !(initialSentCoapMessage instanceof Copper.CoapMessage) 
		    || !(initialReceivedCoapMessage instanceof Copper.CoapMessage) || initialReceivedCoapMessage.getOption(Copper.CoapMessage.OptionHeader.BLOCK2).length === 0) {
		throw new Error("Illegal Arguments");
	}
	this.requestHandler = requestHandler;
	this.initialSentCoapMessage = initialSentCoapMessage;
	this.initialReceivedCoapMessage = initialReceivedCoapMessage;
	this.blockSizeExp = this.initialReceivedCoapMessage.getOption(Copper.CoapMessage.OptionHeader.BLOCK2)[0].szExp;
	this.initialReceivedCoapMessage.removeOption(Copper.CoapMessage.OptionHeader.BLOCK2);
	this.currentBlockNumber = 0;
	this.payloads = [];
};

Copper.BlockwiseReceiver.prototype.requestHandler = undefined;
Copper.BlockwiseReceiver.prototype.initialSentCoapMessage = undefined;
Copper.BlockwiseReceiver.prototype.initialReceivedCoapMessage = undefined;
Copper.BlockwiseReceiver.prototype.blockSizeExp = undefined;
Copper.BlockwiseReceiver.prototype.currentBlockNumber = undefined;
Copper.BlockwiseReceiver.prototype.payloads = undefined;


Copper.BlockwiseReceiver.prototype.onReceive = function(sentCoapMessage, receivedCoapMessage, responseTransmission){
	if (Copper.CoapMessage.Type.CON.equals(receivedCoapMessage.type)){
		responseTransmission.addResponse(Copper.CoapMessage.ack(receivedCoapMessage.mid, receivedCoapMessage.token));
	}
	let block2Option = receivedCoapMessage.getOption(Copper.CoapMessage.OptionHeader.BLOCK2);
	if (block2Option.length === 0){
		this.error("Block Option is missing");
		return;
	}
	block2Option = block2Option[0];
	if (block2Option.num !== this.currentBlockNumber){
		this.error("Unexpected block number");
		return;
	}
	this.payloads.push(receivedCoapMessage.payload);
    if (block2Option.more){
		this.currentBlockNumber++;
		let nextMessage = this.initialSentCoapMessage.clone();
		nextMessage.setMid(undefined);
		nextMessage.addOption(Copper.CoapMessage.OptionHeader.BLOCK2, new Copper.CoapMessage.BlockOption(this.currentBlockNumber, this.blockSizeExp, false), true);
		// do not send the observe option for blockwise requests 
		nextMessage.removeOption(Copper.CoapMessage.OptionHeader.OBSERVE);
		this.requestHandler.sendCoapMessage(nextMessage);
	}
	else {
		this.initialReceivedCoapMessage.setPayload(Copper.ByteUtils.mergeByteArrays(this.payloads));
		this.requestHandler.onReceiveComplete(this.initialSentCoapMessage, this.initialReceivedCoapMessage);
		this.onComplete();
	}
};

Copper.BlockwiseReceiver.prototype.error = function(errorMsg){
	this.requestHandler.onReceiveError(errorMsg);
	this.onComplete();
};

Copper.BlockwiseReceiver.prototype.cancel = function(){
	this.onComplete();
};

Copper.BlockwiseReceiver.prototype.onComplete = function(){
	this.requestHandler.onReceiverFinished();
};