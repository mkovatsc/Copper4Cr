Copper.SingleReceiver = function(requestHandler){
	if (!(requestHandler instanceof Copper.SingleRequestHandler)){
		throw new Error("Illegal Argument");
	}
	this.requestHandler = requestHandler;
};

Copper.SingleReceiver.prototype.requestHandler = undefined;

Copper.SingleReceiver.prototype.onReceive = function(sentCoapMessage, receivedCoapMessage, responseTransmission){
	if (Copper.CoapMessage.Type.CON.equals(receivedCoapMessage.type)){
		responseTransmission.addResponse(Copper.CoapMessage.ack(receivedCoapMessage.mid, receivedCoapMessage.token));
	}
	this.requestHandler.onReceiveComplete(sentCoapMessage, receivedCoapMessage);
	this.onComplete();
};

Copper.SingleReceiver.prototype.cancel = function(){
	this.onComplete();
};

Copper.SingleReceiver.prototype.onComplete = function(){
	this.requestHandler.onReceiverFinished();
};