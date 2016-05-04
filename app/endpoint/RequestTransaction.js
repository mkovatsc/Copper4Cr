Copper.RequestTransaction = function(mid, token, isConfirmable, datagram){
	if (!Number.isInteger(mid) || mid < 0 || mid > 0xFFFF || typeof(token) !== "string" 
		     || typeof(isConfirmable) !== "boolean" || !(datagram instanceof ArrayBuffer)){
		throw new Error("Illegal argument");
	}
	this.mid = mid;
	this.token = token;
	this.isConfirmable = isConfirmable;
	this.datagram = datagram;
	this.firstTransmissionStart = Copper.TimeUtils.now();
	this.lastTransmissionStart = this.firstTransmissionStart;
	if (this.isConfirmable){
		this.timeout = Math.floor(1000 * (Copper.CoapConstants.ACK_TIMEOUT + 
			Copper.CoapConstants.ACK_TIMEOUT*(Copper.CoapConstants.ACK_RANDOM_FACTOR-1)*Math.random()));
		this.retransmissionCounter = 0;
	}
	this.isCompleted = false;
};

Copper.RequestTransaction.prototype.mid = undefined;
Copper.RequestTransaction.prototype.token = undefined;
Copper.RequestTransaction.prototype.datagram = undefined;
Copper.RequestTransaction.prototype.firstTransmissionStart = undefined;
Copper.RequestTransaction.prototype.lastTransmissionStart = undefined;
Copper.RequestTransaction.prototype.timeout = undefined;
Copper.RequestTransaction.prototype.retransmissionCounter = undefined;
Copper.RequestTransaction.prototype.isCompleted = undefined;


Copper.RequestTransaction.prototype.isRetransmissionNecessary = function(){
	return this.isConfirmable && !this.isCompleted && this.retransmissionCounter < Copper.CoapConstants.MAX_RETRANSMIT 
	            && Copper.TimeUtils.isOlderThan(this.lastTransmissionStart, this.timeout);
};

Copper.RequestTransaction.prototype.increaseRetransmissionCounter = function(){
	if (!this.isConfirmable || this.retransmissionCounter >= Copper.CoapConstants.MAX_RETRANSMIT){
		throw new Error("Illegal state");
	}
	this.retransmissionCounter++;
	this.lastTransmissionStart = Copper.TimeUtils.now();
	this.timeout = 2*this.timeout;
};

Copper.RequestTransaction.prototype.isTimeout = function(){
	return !this.isCompleted && 
	            ((this.isConfirmable && this.retransmissionCounter >= Copper.CoapConstants.MAX_RETRANSMIT && 
	         	    Copper.TimeUtils.isOlderThan(this.lastTransmissionStart, this.timeout/2)) ||
	            (!this.isConfirmable && Copper.TimeUtils.isOlderThan(this.lastTransmissionStart, 1000*Copper.CoapConstants.NON_TIMEOUT)));
};

Copper.RequestTransaction.prototype.isEndOfLife = function(){
	return Copper.TimeUtils.isOlderThan(this.firstTransmissionStart, 
		(this.isConfirmable ? Copper.CoapConstants.EXCHANGE_LIFETIME : Copper.CoapConstants.NON_LIFETIME) * 1000); 
};