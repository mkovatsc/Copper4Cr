Copper.BlockwiseReceiver = function(requestHandler){
	if (!(requestHandler instanceof Copper.SingleRequestHandler)){
		throw new Error("Illegal Argument");
	}
	this.requestHandler = requestHandler;
};

Copper.BlockwiseReceiver.prototype.requestHandler = undefined;

Copper.BlockwiseReceiver.prototype.onReceive = function(sentCoapMessage, receivedCoapMessage, responseTransmission){
	if (Copper.CoapMessage.Type.CON.equals(receivedCoapMessage.type)){
		responseTransmission.addResponse(Copper.CoapMessage.ack(receivedCoapMessage.mid, receivedCoapMessage.token));
	}
	this.requestHandler.onReceiveComplete(sentCoapMessage, receivedCoapMessage);
	this.onComplete();
};

Copper.BlockwiseReceiver.prototype.cancel = function(){
	this.onComplete();
};

Copper.BlockwiseReceiver.prototype.onComplete = function(){
	this.requestHandler.onReceiverFinished();
};