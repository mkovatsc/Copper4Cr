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
* This object handles a single Request from the client, meaning
* - It performs blockwise transfer where appropriate
* - It handles observable resources
*/
Copper.SingleRequestHandler = function(coapMessage, transmissionHandler, settings, endpointId){
	if (!(coapMessage instanceof Copper.CoapMessage) || !(transmissionHandler instanceof Copper.TransmissionHandler) || !(settings instanceof Copper.Settings)
			|| !Number.isInteger(endpointId)){
		throw new Error("Illegal Argument");
	}
	this.coapMessage = coapMessage;
	this.transmissionHandler = transmissionHandler;
	this.settings = settings;
	this.endpointId = endpointId;
};

Copper.SingleRequestHandler.prototype.coapMessage = undefined;
Copper.SingleRequestHandler.prototype.transmissionHandler = undefined;
Copper.SingleRequestHandler.prototype.settings = undefined;
Copper.SingleRequestHandler.prototype.endpointId = undefined;

Copper.SingleRequestHandler.prototype.sender = undefined;
Copper.SingleRequestHandler.prototype.receiveCallback = undefined;
Copper.SingleRequestHandler.prototype.receiver = undefined;


Copper.SingleRequestHandler.prototype.start = function(){
	let thisRef = this;

	// check properties of coap message
	let observeOption = this.coapMessage.getOption(Copper.CoapMessage.OptionHeader.OBSERVE);
	let observing = observeOption.length === 1 && observeOption[0] === 0;

	// create token and register this handler
	let token = this.coapMessage.token;
	let randomToken = false;
	if (this.transmissionHandler.isTokenRegistered(token)) {
		Copper.Log.logInfo("Token " + Copper.ByteUtils.convertBytesToHexString(token) + " is in use. Another token is used.");
		randomToken = true;
	}
	else if (observing && this.settings.observeToken) {
		Copper.Log.logInfo("Generate token for observing request");
		randomToken = true;
	}
	if (randomToken) {
		do {
			token = Copper.ByteUtils.convertUintToBytes(parseInt(Math.random()*0x10000000));
		} while (this.transmissionHandler.isTokenRegistered(token));
	}
	this.transmissionHandler.registerToken(token, this);
	this.coapMessage.setToken(token);
	
	// create sender and start it
	if (observing) {
		this.sender = new Copper.ObserveSender(this.coapMessage, this, function(){ thisRef.onSenderFinished(); });
	}
	else {
		this.sender = new Copper.BlockwiseSender(this.coapMessage, this, function(){ thisRef.onSenderFinished(); });
	}

	this.sender.start();
};

Copper.SingleRequestHandler.prototype.handleResponse = function(sentCoapMessage, receivedCoapMessage, responseTransmission){
	if (!(sentCoapMessage instanceof Copper.CoapMessage) || !(receivedCoapMessage instanceof Copper.CoapMessage) || 
		    (responseTransmission !== undefined && !(responseTransmission instanceof Copper.ResponseMessageTransmission))) {
		throw new Error("Illegal Argument");
	}
	if (this.receiveCallback !== undefined){
		this.receiveCallback(sentCoapMessage, receivedCoapMessage, responseTransmission);
	}
	else {
		if (this.receiver === undefined){
			let block2Option = receivedCoapMessage.getOption(Copper.CoapMessage.OptionHeader.BLOCK2);
			let isBlockwiseReceiver = this.settings.blockwiseEnabled && block2Option.length === 1;
			if (isBlockwiseReceiver){
				this.receiver = new Copper.BlockwiseReceiver(this, sentCoapMessage.clone(), receivedCoapMessage.clone());
			}
			else {
				this.receiver = new Copper.SingleReceiver(this);
			}
		}
		this.receiver.onReceive(sentCoapMessage, receivedCoapMessage, responseTransmission);
	}
};

Copper.SingleRequestHandler.prototype.onTimeout = function(){
	this.sender.onTimeout();
};

Copper.SingleRequestHandler.prototype.registerReceiveCallback = function(receiveCallback){
	if (typeof(receiveCallback) !== "function"){
		throw new Error("Illegal Argument");
	}
	this.receiveCallback = receiveCallback;
};

Copper.SingleRequestHandler.prototype.unregisterReceiveCallback = function(){
	this.receiveCallback = undefined;
};

Copper.SingleRequestHandler.prototype.cancel = function(){
	this.sender.cancel();
};

Copper.SingleRequestHandler.prototype.sendCoapMessage = function(coapMessage){
	if (!(coapMessage instanceof Copper.CoapMessage)){
		throw new Error("Illegal Argument");
	}
	this.transmissionHandler.sendCoapMessage(coapMessage, this);
};

// sender callbacks
Copper.SingleRequestHandler.prototype.cancelReceiver = function(){
	if (this.receiver !== undefined){
		this.receiver.cancel();
	}
};

Copper.SingleRequestHandler.prototype.onSenderFinished = function(){
	this.transmissionHandler.unregisterToken(this.coapMessage.token, this);
};

// receiver callbacks
Copper.SingleRequestHandler.prototype.onReceiveComplete = function(sentCoapMessage, receivedCoapMessage){
	this.sender.onReceiveComplete(sentCoapMessage, receivedCoapMessage);
};

Copper.SingleRequestHandler.prototype.onReceiveError = function(errorMessage){
	this.sender.onReceiveError(errorMessage);
};

Copper.SingleRequestHandler.prototype.onReceiverFinished = function(){
	this.receiver = undefined;
};