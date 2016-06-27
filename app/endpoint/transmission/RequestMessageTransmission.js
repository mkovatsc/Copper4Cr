/*******************************************************************************
 * Copyright (c) 2016, Institute for Pervasive Computing, ETH Zurich.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the Institute nor the names of its contributors
 *    may be used to endorse or promote products derived from this software
 *    without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE INSTITUTE AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED.  IN NO EVENT SHALL THE INSTITUTE OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 * OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
 * 
 * This file is part of the Copper (Cu) CoAP user-agent.
 ******************************************************************************/
 
Copper.RequestMessageTransmission = function(coapMessage, requestHandler, doRetransmissions){
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

Copper.RequestMessageTransmission.prototype.coapMessage = undefined;
Copper.RequestMessageTransmission.prototype.requestHandler = undefined;
Copper.RequestMessageTransmission.prototype.firstTransmissionStart = undefined;
Copper.RequestMessageTransmission.prototype.lastTransmissionStart = undefined;
Copper.RequestMessageTransmission.prototype.timeout = undefined;
Copper.RequestMessageTransmission.prototype.retransmissionCounter = undefined;
Copper.RequestMessageTransmission.prototype.isConfirmed = undefined;
Copper.RequestMessageTransmission.prototype.isCompleted = undefined;

Copper.RequestMessageTransmission.prototype.isConfirmable = function(){
	// handle CONs without retransmissions as NONs
	return Copper.CoapMessage.Type.CON.equals(this.coapMessage.type) && this.doRetransmissions;
}

Copper.RequestMessageTransmission.prototype.isRetransmissionNecessary = function(){
	return this.isConfirmable() && !this.isCompleted && !this.isConfirmed && this.retransmissionCounter < Copper.CoapConstants.MAX_RETRANSMIT 
	            && Copper.TimeUtils.isOlderThan(this.lastTransmissionStart, this.timeout);
};

Copper.RequestMessageTransmission.prototype.increaseRetransmissionCounter = function(){
	if (!this.isConfirmable() || this.retransmissionCounter >= Copper.CoapConstants.MAX_RETRANSMIT){
		throw new Error("Illegal state");
	}
	this.retransmissionCounter++;
	this.lastTransmissionStart = Copper.TimeUtils.now();
	this.timeout = 2*this.timeout;
};

Copper.RequestMessageTransmission.prototype.isTimeout = function(){
	return !this.isCompleted && !this.isConfirmed && 
	            ((this.isConfirmable() && this.retransmissionCounter >= Copper.CoapConstants.MAX_RETRANSMIT && 
	         	    Copper.TimeUtils.isOlderThan(this.lastTransmissionStart, this.timeout/2)) ||
	            (!this.isConfirmable() && Copper.TimeUtils.isOlderThan(this.lastTransmissionStart, 1000*Copper.CoapConstants.NON_TIMEOUT)));
};

Copper.RequestMessageTransmission.prototype.isEndOfLife = function(){
	return Copper.TimeUtils.isOlderThan(this.firstTransmissionStart, 
		(this.isConfirmable() ? Copper.CoapConstants.EXCHANGE_LIFETIME : Copper.CoapConstants.NON_LIFETIME) * 1000); 
};