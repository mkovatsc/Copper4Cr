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
* Sender for messages with an observe option
*/
Copper.ObserveSender = function(coapMessage, requestHandler, onComplete){
	if (!(coapMessage instanceof Copper.CoapMessage) || !(requestHandler instanceof Copper.SingleRequestHandler) || typeof(onComplete) !== "function"){
		throw new Error("Illegal argument");
	}
	let thisRef = this;
	this.coapMessage = coapMessage;
	this.requestHandler = requestHandler;
	this.onComplete = onComplete;
};

Copper.ObserveSender.prototype.coapMessage = undefined;
Copper.ObserveSender.prototype.requestHandler = undefined;
Copper.ObserveSender.prototype.requestStart = undefined;
Copper.ObserveSender.prototype.lastTimestamp = undefined;
Copper.ObserveSender.prototype.lastSeqNumber = undefined;
Copper.ObserveSender.prototype.onComplete = undefined;

Copper.ObserveSender.prototype.start = function(){
	this.requestHandler.sendCoapMessage(this.coapMessage.clone());
};

Copper.ObserveSender.prototype.onReceiveComplete = function(sentCoapMessage, receivedCoapMessage){
	let observeOption = receivedCoapMessage.getOption(Copper.CoapMessage.OptionHeader.OBSERVE);
	if (observeOption.length === 0){
		// no more observing --> stop it
		Copper.Event.sendEvent(Copper.Event.createObserveRequestFreshEvent(sentCoapMessage, receivedCoapMessage, this.lastTimestamp, this.lastSeqNumber, this.requestHandler.endpointId));
		Copper.Event.sendEvent(Copper.Event.createRequestCompletedEvent(sentCoapMessage, receivedCoapMessage, Copper.TimeUtils.now() - this.requestStart, this.requestHandler.endpointId));
		this.onComplete();
	}
	else if (this.lastTimestamp !== undefined && this.lastSeqNumber !== undefined && this.lastTimestamp + 128000 < Copper.TimeUtils.now()
	        && ((this.lastSeqNumber < observeOption[0] && observeOption[0] - this.lastSeqNumber > 1<<23)
	        || (observeOption[0] < this.lastSeqNumber && this.lastSeqNumber - observeOption[0] < 1<<23))){
		Copper.Event.sendEvent(Copper.Event.createObserveRequestOutOfOrderEvent(sentCoapMessage, receivedCoapMessage, this.lastTimestamp, this.lastSeqNumber, this.requestHandler.endpointId));
	}
	else {
		Copper.Event.sendEvent(Copper.Event.createObserveRequestFreshEvent(sentCoapMessage, receivedCoapMessage, this.lastTimestamp, this.lastSeqNumber, this.requestHandler.endpointId));
		this.lastTimestamp = Copper.TimeUtils.now();
		this.lastSeqNumber = observeOption[0];
	}
};

Copper.ObserveSender.prototype.onReceiveError = function(errorMessage){
	Copper.Event.sendEvent(Copper.Event.createRequestReceiveErrorEvent(this.coapMessage, this.requestHandler.endpointId));
	this.onComplete();
};

Copper.ObserveSender.prototype.onTimeout = function(){
	this.requestHandler.cancelReceiver();
	Copper.Event.sendEvent(Copper.Event.createRequestTimeoutEvent(this.coapMessage, this.requestHandler.endpointId));
	this.onComplete();
};

Copper.ObserveSender.prototype.cancel = function(){
	Copper.Event.sendEvent(Copper.Event.createRequestCanceledEvent(this.coapMessage, this.requestHandler.endpointId));
	if (this.requestHandler.settings.observeCancellation === 'get'){
		let cancelCoapMessage = this.coapMessage.clone();
		cancelCoapMessage.removeOption(Copper.CoapMessage.OptionHeader.ETAG);
		cancelCoapMessage.addOption(Copper.CoapMessage.OptionHeader.OBSERVE, 1, true);
		this.requestHandler.sendCoapMessage(cancelCoapMessage);
	}
	else if (this.requestHandler.settings.observeCancellation === 'rst'){
		let thisRef = this;
		this.requestHandler.registerReceiveCallback(function(sentCoapMessage, receivedCoapMessage, responseTransmission){
			thisRef.requestHandler.unregisterReceiveCallback();
			responseTransmission.addResponse(Copper.CoapMessage.reset(receivedCoapMessage.mid, receivedCoapMessage.token));
			thisRef.onComplete();
		});
	}
	else {
		// lazy --> handle next message as unknown
		this.requestHandler.cancelReceiver();
		this.onComplete();
	}
};
