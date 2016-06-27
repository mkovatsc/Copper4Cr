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
* Creates a new messages set which is capable of handling the different transmission. Handlers for the different
* events can be passed, but are optional 
* @arg onRetransmission: function(transmission, retransmissionCount) --> called for a transmission that should be retransmitted
* @arg onTimeout: function(transmission) --> called for a transmission that has timeouted
* @arg onEndOfLife: function(transmission) --> called for a transmission that is end of life and thus removed
*/
Copper.MessagesInTransmissionSet = function(onRetransmission, onTimeout, onEndOfLife){
	if ((onRetransmission !== undefined && typeof(onRetransmission) !== "function") ||
		    (onTimeout !== undefined && typeof(onTimeout) !== "function") ||
		    (onEndOfLife !== undefined && typeof(onEndOfLife) !== "function")){
		throw new Error("Illegal Argument")
	}
	this.onRetransmission = onRetransmission;
	this.onTimeout = onTimeout;
	this.onEndOfLife = onEndOfLife;
	this.reset();
	this.isHandlingTransmissions = false;
};

/* Prototype */
Copper.MessagesInTransmissionSet.prototype.onRetransmission = undefined;
Copper.MessagesInTransmissionSet.prototype.onTimeout = undefined;
Copper.MessagesInTransmissionSet.prototype.onEndOfLife = undefined;
Copper.MessagesInTransmissionSet.prototype.registeredTokens = undefined;
Copper.MessagesInTransmissionSet.prototype.activeRequestMessageTransmissions = undefined;
Copper.MessagesInTransmissionSet.prototype.timeoutedRequestMessageTransmissions = undefined;
Copper.MessagesInTransmissionSet.prototype.responseMessageTransmissions = undefined;
Copper.MessagesInTransmissionSet.prototype.isHandlingTransmissions = undefined;

/*
* Clears the message set
*/
Copper.MessagesInTransmissionSet.prototype.reset = function(){
	this.registeredTokens = new Object();
	this.activeRequestMessageTransmissions = [];
	this.timeoutedRequestMessageTransmissions = [];
	this.responseMessageTransmissions = [];
};

/**
* Registers a token with a given object
*/
Copper.MessagesInTransmissionSet.prototype.registerToken = function(token, objectToRegister){
	if (!(token instanceof ArrayBuffer) || objectToRegister === undefined){
		throw new Error("Illegal Argument");
	}
	this.registeredTokens[Copper.ByteUtils.convertBytesToHexString(token)] = objectToRegister;
};

/**
* @arg token as ArrayBuffer
* @return: whether the token is in use
*/
Copper.MessagesInTransmissionSet.prototype.isTokenRegistered = function(token){
	if (!(token instanceof ArrayBuffer)){
		throw new Error("Illegal Argument");
	}
	return this.registeredTokens[Copper.ByteUtils.convertBytesToHexString(token)] !== undefined;
};

/**
* @arg token as ArrayBuffer
* @return: object registered with the given token
*/
Copper.MessagesInTransmissionSet.prototype.getRegisteredObjectForToken = function(token){
	if (!(token instanceof ArrayBuffer)){
		throw new Error("Illegal Argument");
	}
	return this.registeredTokens[Copper.ByteUtils.convertBytesToHexString(token)];
};

/**
* Removes the token from the set of registered tokens. Is only allowed if the transmission has finished.
* @arg token
*/
Copper.MessagesInTransmissionSet.prototype.unregisterToken = function(token){
	if (!(token instanceof ArrayBuffer)){
		throw new Error("Illegal Argument");
	}
	let tokenStr = Copper.ByteUtils.convertBytesToHexString(token);
	if (this.registeredTokens[tokenStr] !== undefined){
		delete this.registeredTokens[tokenStr];
	}
};

/**
* Adds a new transmission to this set and registers the token.
* @arg transmission: Transmission which is not end of life and has a unique token and a unique mid
*/
Copper.MessagesInTransmissionSet.prototype.addNewTransmission = function(transmission){
	if ((!(transmission instanceof Copper.RequestMessageTransmission) && !(transmission instanceof Copper.ResponseMessageTransmission)) || transmission.isEndOfLife()){
		throw new Error("Illegal Argument");
	}
	if (transmission instanceof Copper.RequestMessageTransmission){
		if (this.getRequestMessageTransmission(transmission.coapMessage.mid, undefined) !== undefined){
			throw new Error("Duplicate MID");
		}
		this.activeRequestMessageTransmissions.push(transmission);
	}
	else {
		if (this.getResponseMessageTransmission(transmission.coapMessage.mid, transmission.remoteAddress, transmission.remotePort) !== undefined){
			throw new Error("Duplicate Transmission");
		}
		this.responseMessageTransmissions.push(transmission);
	}
};

/**
* @arg mid: message id
* @arg token: token as an ArrayBuffer (optional)
* @return: first transmission that matches mid and token.
*/
Copper.MessagesInTransmissionSet.prototype.getRequestMessageTransmission = function(mid, token){
	if (!Number.isInteger(mid) || mid < 0 || mid > 0xFFFF){
		throw new Error("Illegal Argument");
	}
	let tokenStr = token !== undefined ? Copper.ByteUtils.convertBytesToHexString(token) : undefined;
	let transmissions = this.activeRequestMessageTransmissions.concat(this.timeoutedRequestMessageTransmissions);
	for (let i=0; i<transmissions.length; i++){
		if (mid === transmissions[i].coapMessage.mid && (tokenStr === undefined || tokenStr === Copper.ByteUtils.convertBytesToHexString(transmissions[i].coapMessage.token))){
			return transmissions[i];
		}
	}
	return undefined;
};

/**
* @arg mid: message id
* @arg remoteAddress: remoteAddress
* @arg remotePort: remotePort
* @return: first matching transmission, undefined if none matches
*/
Copper.MessagesInTransmissionSet.prototype.getResponseMessageTransmission = function(mid, remoteAddress, remotePort){
	if (!Number.isInteger(mid) || mid < 0 || mid > 0xFFFF || typeof(remoteAddress) !== "string" 
		     || !Number.isInteger(remotePort) || remotePort <= 0x0 || remotePort > 0xFFFF){
		throw new Error("Illegal argument");
	}
	for (let i=0; i<this.responseMessageTransmissions.length; i++){
		if (mid === this.responseMessageTransmissions[i].coapMessage.mid && remoteAddress === this.responseMessageTransmissions[i].remoteAddress && remotePort === this.responseMessageTransmissions[i].remotePort){
			return this.responseMessageTransmissions[i];
		}
	}
	return undefined;
};

/*
* @return number of transmissions in this set
*/
Copper.MessagesInTransmissionSet.prototype.getTransmissionCount = function(){
	return this.activeRequestMessageTransmissions.length + this.timeoutedRequestMessageTransmissions.length + this.responseMessageTransmissions.length;
};


/*
* Checks each transmission if an action is necessary and calls the callback if this is the case
*/
Copper.MessagesInTransmissionSet.prototype.handleTransmissions = function(){
	if (!this.isHandlingTransmissions){
		this.isHandlingTransmissions = true;
		try {
			this.handleRetransmissionNecessaryTransmissions();
			this.handleTimeoutedTransmissions();
			this.handleEndOfLifeTransmissions();
		} finally {
			this.isHandlingTransmissions = false;
		}
	}
};

/** Implementation **/
// Calls the onRetransmission callback for each transmission that needs retransmission and increases the retransmission counter
Copper.MessagesInTransmissionSet.prototype.handleRetransmissionNecessaryTransmissions = function(){
	for (let i=0; i<this.activeRequestMessageTransmissions.length;i++){
		if (this.activeRequestMessageTransmissions[i].isRetransmissionNecessary()){
			this.activeRequestMessageTransmissions[i].increaseRetransmissionCounter();
			if (this.onRetransmission !== undefined) this.onRetransmission(this.activeRequestMessageTransmissions[i]);
		}
	}
};

// Calls the onTimeout callback on each transmission that timeouted
Copper.MessagesInTransmissionSet.prototype.handleTimeoutedTransmissions = function(){
	let oldActiveRequestTransmissions = this.activeRequestMessageTransmissions;
	this.activeRequestMessageTransmissions = [];
	for (let i=0; i<oldActiveRequestTransmissions.length;i++){
		if (!oldActiveRequestTransmissions[i].isTimeout()){
			this.activeRequestMessageTransmissions.push(oldActiveRequestTransmissions[i]);
		}
		else {
			this.timeoutedRequestMessageTransmissions.push(oldActiveRequestTransmissions[i]);
			if (this.onTimeout !== undefined) this.onTimeout(oldActiveRequestTransmissions[i]);
		}
	}
};

// Removes the transmissions which are endOfLife after calling the endOfLife callback 
Copper.MessagesInTransmissionSet.prototype.handleEndOfLifeTransmissions = function(){
	this.activeRequestMessageTransmissions = this.getNonEndOfLifeTransmissions(this.activeRequestMessageTransmissions);
	this.timeoutedRequestMessageTransmissions = this.getNonEndOfLifeTransmissions(this.timeoutedRequestMessageTransmissions);
	this.responseMessageTransmissions = this.getNonEndOfLifeTransmissions(this.responseMessageTransmissions);
};

// Returns the transmissions from transmissionList which are not endOfLife. Calls the onEndOfLife callback on the others
Copper.MessagesInTransmissionSet.prototype.getNonEndOfLifeTransmissions = function(transmissionList){
	let nonEndOfLifeTransmissions = [];
	for (let i=0; i<transmissionList.length; i++){
		if (!transmissionList[i].isEndOfLife()){
			nonEndOfLifeTransmissions.push(transmissionList[i]);
		}
		else {
			if (this.onEndOfLife !== undefined) {this.onEndOfLife(transmissionList[i]);}
		}
	}
	return nonEndOfLifeTransmissions;
};