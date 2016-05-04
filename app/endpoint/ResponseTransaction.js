Copper.ResponseTransaction = function(mid, remoteAddress, remotePort){
	if (!Number.isInteger(mid) || mid < 0 || mid > 0xFFFF || typeof(remoteAddress) !== "string" 
		     || !Number.isInteger(remotePort) || remotePort <= 0x0 || remotePort > 0xFFFF){
		throw new Error("Illegal argument");
	}
	this.mid = mid;
	this.remoteAddress = remoteAddress;
	this.remotePort = remotePort;
	this.responses = [];
	this.firstTransmissionStart = Copper.TimeUtils.now();
};

Copper.ResponseTransaction.prototype.mid = undefined;
Copper.ResponseTransaction.prototype.remoteAddress = undefined;
Copper.ResponseTransaction.prototype.remotePort = undefined;
Copper.ResponseTransaction.prototype.responses = undefined;
Copper.ResponseTransaction.prototype.firstTransmissionStart = undefined;

Copper.ResponseTransaction.prototype.addResponse = function(datagram){
	if (!(datagram instanceof ArrayBuffer)){
		throw new Error("Illegal argument");
	}
	this.responses.push(datagram);
	return this;
};

Copper.ResponseTransaction.prototype.isEndOfLife = function(){
	return Copper.TimeUtils.isOlderThan(this.firstTransmissionStart, Copper.CoapConstants.EXCHANGE_LIFETIME * 1000); 
};