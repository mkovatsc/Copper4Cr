Copper.RequestTransaction = function(coapMessage, requestHandler, doRetransmissions){
	if (!(coapMessage instanceof Copper.CoapMessage) || coapMessage.mid === undefined){
		throw new Error("Illegal argument");
	}
	if (!coapMessage.code.isResponseCode() && requestHandler === undefined){
		throw new Error("Request Handler must be set");
	}
	this.coapMessage = coapMessage;
	this.requestHandler = requestHandler;
	this.firstTransmissionStart = Copper.TimeUtils.now();
	this.lastTransmissionStart = this.firstTransmissionStart;
	this.doRetransmissions = doRetransmissions !== undefined ? doRetransmissions : Copper.CoapMessage.Type.CON.equals(coapMessage.type);
	if (this.isConfirmable()){
		this.timeout = Math.floor(1000 * (Copper.CoapConstants.ACK_TIMEOUT + 
			Copper.CoapConstants.ACK_TIMEOUT*(Copper.CoapConstants.ACK_RANDOM_FACTOR-1)*Math.random()));
		this.retransmissionCounter = 0;
	}
	this.isConfirmed = false;
	this.isCompleted = false;
};

Copper.RequestTransaction.prototype.coapMessage = undefined;
Copper.RequestTransaction.prototype.requestHandler = undefined;
Copper.RequestTransaction.prototype.firstTransmissionStart = undefined;
Copper.RequestTransaction.prototype.lastTransmissionStart = undefined;
Copper.RequestTransaction.prototype.timeout = undefined;
Copper.RequestTransaction.prototype.retransmissionCounter = undefined;
Copper.RequestTransaction.prototype.isConfirmed = undefined;
Copper.RequestTransaction.prototype.isCompleted = undefined;

Copper.RequestTransaction.prototype.isConfirmable = function(){
	// handle CONs without retransmissions as NONs
	return Copper.CoapMessage.Type.CON.equals(this.coapMessage.type) && this.doRetransmissions;
}

Copper.RequestTransaction.prototype.isRetransmissionNecessary = function(){
	return this.isConfirmable() && !this.isCompleted && !this.isConfirmed && this.retransmissionCounter < Copper.CoapConstants.MAX_RETRANSMIT 
	            && Copper.TimeUtils.isOlderThan(this.lastTransmissionStart, this.timeout);
};

Copper.RequestTransaction.prototype.increaseRetransmissionCounter = function(){
	if (!this.isConfirmable() || this.retransmissionCounter >= Copper.CoapConstants.MAX_RETRANSMIT){
		throw new Error("Illegal state");
	}
	this.retransmissionCounter++;
	this.lastTransmissionStart = Copper.TimeUtils.now();
	this.timeout = 2*this.timeout;
};

Copper.RequestTransaction.prototype.isTimeout = function(){
	return !this.isCompleted && !this.isConfirmed && 
	            ((this.isConfirmable() && this.retransmissionCounter >= Copper.CoapConstants.MAX_RETRANSMIT && 
	         	    Copper.TimeUtils.isOlderThan(this.lastTransmissionStart, this.timeout/2)) ||
	            (!this.isConfirmable() && Copper.TimeUtils.isOlderThan(this.lastTransmissionStart, 1000*Copper.CoapConstants.NON_TIMEOUT)));
};

Copper.RequestTransaction.prototype.isEndOfLife = function(){
	return Copper.TimeUtils.isOlderThan(this.firstTransmissionStart, 
		(this.isConfirmable() ? Copper.CoapConstants.EXCHANGE_LIFETIME : Copper.CoapConstants.NON_LIFETIME) * 1000); 
};