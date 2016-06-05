Copper.ResponseMessageTransmission = function(coapMessage, remoteAddress, remotePort){
	if (!(coapMessage instanceof Copper.CoapMessage) || coapMessage.mid === undefined || typeof(remoteAddress) !== "string" 
		     || !Number.isInteger(remotePort) || remotePort <= 0x0 || remotePort > 0xFFFF){
		throw new Error("Illegal argument");
	}
	this.coapMessage = coapMessage;
	this.remoteAddress = remoteAddress;
	this.remotePort = remotePort;
	this.responses = [];
	this.firstTransmissionStart = Copper.TimeUtils.now();
	this.retransmissionCounter = 0;
};

Copper.ResponseMessageTransmission.prototype.coapMessage = undefined;
Copper.ResponseMessageTransmission.prototype.remoteAddress = undefined;
Copper.ResponseMessageTransmission.prototype.remotePort = undefined;
Copper.ResponseMessageTransmission.prototype.responses = undefined;
Copper.ResponseMessageTransmission.prototype.firstTransmissionStart = undefined;
Copper.ResponseMessageTransmission.prototype.retransmissionCounter = undefined;

Copper.ResponseMessageTransmission.prototype.addResponse = function(coapMessage){
	if (!(coapMessage instanceof Copper.CoapMessage)){
		throw new Error("Illegal argument");
	}
	if (this.responses.length >= 2){
		throw new Error("Illegal state");
	}
	this.responses.push(coapMessage);
	return this;
};

Copper.ResponseMessageTransmission.prototype.isEndOfLife = function(){
	return Copper.TimeUtils.isOlderThan(this.firstTransmissionStart, Copper.CoapConstants.EXCHANGE_LIFETIME * 1000); 
};