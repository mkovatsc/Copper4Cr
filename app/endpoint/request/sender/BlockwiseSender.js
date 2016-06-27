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
 
Copper.BlockwiseSender = function(coapMessage, requestHandler, onComplete){
	if (!(coapMessage instanceof Copper.CoapMessage) || !(requestHandler instanceof Copper.SingleRequestHandler) || typeof(onComplete) !== "function"){
		throw new Error("Illegal argument");
	}
	this.coapMessage = coapMessage;
	this.requestHandler = requestHandler;
	this.onComplete = onComplete;

	if (this.requestHandler.settings.sendSize1){
		this.coapMessage.addOption(Copper.CoapMessage.OptionHeader.SIZE1, this.coapMessage.payload.byteLength, true);
	}
	this.blockSizeExp = this.requestHandler.settings.blockwiseEnabled ? (this.requestHandler.settings.blockSize === 0 ? 10 : this.requestHandler.settings.blockSize) : undefined;
	this.offset = 0;
	this.firstRequest = true;
};

Copper.BlockwiseSender.prototype.coapMessage = undefined;
Copper.BlockwiseSender.prototype.requestHandler = undefined;
Copper.BlockwiseSender.prototype.requestStart = undefined;
Copper.BlockwiseSender.prototype.onComplete = undefined;
Copper.BlockwiseSender.prototype.blockSizeExp = undefined;
Copper.BlockwiseSender.prototype.offset = undefined;
Copper.BlockwiseSender.prototype.firstRequest = undefined;

Copper.BlockwiseSender.prototype.start = function(){
	this.requestStart = Copper.TimeUtils.now();
	if (this.blockSizeExp === undefined || this.coapMessage.payload.byteLength <= Copper.CoapMessage.BlockOption.szExpToSize(this.blockSizeExp)){
		this.requestHandler.sendCoapMessage(this.coapMessage.clone());	
	}
	else {
		this.sendNextMessage();
	}
};

Copper.BlockwiseSender.prototype.onReceiveComplete = function(sentCoapMessage, receivedCoapMessage){
	let block1 = receivedCoapMessage.getOption(Copper.CoapMessage.OptionHeader.BLOCK1);
	if (block1.length === 0 || !this.requestHandler.settings.blockwiseEnabled){
		Copper.Event.sendEvent(Copper.Event.createRequestCompletedEvent(sentCoapMessage, receivedCoapMessage, Copper.TimeUtils.now() - this.requestStart, this.requestHandler.endpointId));
		this.onComplete();
		return;
	}
	if (this.firstRequest){
		if (Copper.CoapMessage.Code.CONTINUE.equals(receivedCoapMessage.code)){
			this.blockSizeExp = block1[0].szExp;
		}
		else if (Copper.CoapMessage.Code.REQUEST_ENTITY_TOO_LARGE.equals(receivedCoapMessage.code)){
			this.blockSizeExp = block1[0].szExp;
			this.offset = 0;
		}
		this.firstRequest = false;
	}
	if ((this.offset === 0 || receivedCoapMessage.code.isSuccessCode()) && this.hasMoreBlocks()){
		this.sendNextMessage();
	}
	else {
		Copper.Event.sendEvent(Copper.Event.createRequestCompletedEvent(sentCoapMessage, receivedCoapMessage, Copper.TimeUtils.now() - this.requestStart, this.requestHandler.endpointId));
		this.onComplete();
	}
};

Copper.BlockwiseSender.prototype.onReceiveError = function(errorMessage){
	Copper.Event.sendEvent(Copper.Event.createRequestReceiveErrorEvent(this.coapMessage, this.requestHandler.endpointId));
	this.onComplete();
};

Copper.BlockwiseSender.prototype.onTimeout = function(){
	this.requestHandler.cancelReceiver();
	Copper.Event.sendEvent(Copper.Event.createRequestTimeoutEvent(this.coapMessage, this.requestHandler.endpointId));
	this.onComplete();
};

Copper.BlockwiseSender.prototype.cancel = function(){
	this.requestHandler.cancelReceiver();
	Copper.Event.sendEvent(Copper.Event.createRequestCanceledEvent(this.coapMessage, this.requestHandler.endpointId));
	this.onComplete();
};

/* Implementation */
Copper.BlockwiseSender.prototype.sendNextMessage = function(){
	let blockSize = Copper.CoapMessage.BlockOption.szExpToSize(this.blockSizeExp);
	let coapMessage = this.coapMessage.clone(this.offset, blockSize);
	this.offset += blockSize;
	coapMessage.addOption(Copper.CoapMessage.OptionHeader.BLOCK1, new Copper.CoapMessage.BlockOption((this.offset / blockSize) - 1, this.blockSizeExp, this.hasMoreBlocks()), true);
	this.requestHandler.sendCoapMessage(coapMessage);	
};

Copper.BlockwiseSender.prototype.hasMoreBlocks = function(){
	return this.offset <= this.coapMessage.payload.byteLength;
};