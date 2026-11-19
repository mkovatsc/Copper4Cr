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
/*
* Holder for a sent response 
*/
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