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
* Receiver that collects responses from a block transfer
*/
Copper.BlockwiseReceiver = function(requestHandler, initialSentCoapMessage, initialReceivedCoapMessage){
	if (!(requestHandler instanceof Copper.SingleRequestHandler) || !(initialSentCoapMessage instanceof Copper.CoapMessage) 
		    || !(initialReceivedCoapMessage instanceof Copper.CoapMessage) || initialReceivedCoapMessage.getOption(Copper.CoapMessage.OptionHeader.BLOCK2).length === 0) {
		throw new Error("Illegal Arguments");
	}
	this.requestHandler = requestHandler;
	this.initialSentCoapMessage = initialSentCoapMessage;
	this.initialReceivedCoapMessage = initialReceivedCoapMessage;
	this.blockSizeExp = this.initialReceivedCoapMessage.getOption(Copper.CoapMessage.OptionHeader.BLOCK2)[0].szExp;
	this.initialReceivedCoapMessage.removeOption(Copper.CoapMessage.OptionHeader.BLOCK2);
	this.currentBlockNumber = 0;
	this.payloads = [];
};

Copper.BlockwiseReceiver.prototype.requestHandler = undefined;
Copper.BlockwiseReceiver.prototype.initialSentCoapMessage = undefined;
Copper.BlockwiseReceiver.prototype.initialReceivedCoapMessage = undefined;
Copper.BlockwiseReceiver.prototype.blockSizeExp = undefined;
Copper.BlockwiseReceiver.prototype.currentBlockNumber = undefined;
Copper.BlockwiseReceiver.prototype.payloads = undefined;


Copper.BlockwiseReceiver.prototype.onReceive = function(sentCoapMessage, receivedCoapMessage, responseTransmission){
	if (Copper.CoapMessage.Type.CON.equals(receivedCoapMessage.type)){
		responseTransmission.addResponse(Copper.CoapMessage.ack(receivedCoapMessage.mid, receivedCoapMessage.token));
	}
	let block2Option = receivedCoapMessage.getOption(Copper.CoapMessage.OptionHeader.BLOCK2);
	if (block2Option.length === 0){
		this.error("Block Option is missing");
		return;
	}
	block2Option = block2Option[0];
	if (block2Option.num !== this.currentBlockNumber){
		this.error("Unexpected block number");
		return;
	}
	this.payloads.push(receivedCoapMessage.payload);
    if (block2Option.more){
		this.currentBlockNumber++;
		// do not repeat payload
		let nextMessage = this.initialSentCoapMessage.clone(0, 0);
		nextMessage.setMid(undefined);
		nextMessage.addOption(Copper.CoapMessage.OptionHeader.BLOCK2, new Copper.CoapMessage.BlockOption(this.currentBlockNumber, this.blockSizeExp, false), true);
		// do not send the observe option for blockwise requests 
		nextMessage.removeOption(Copper.CoapMessage.OptionHeader.OBSERVE);
		nextMessage.removeOption(Copper.CoapMessage.OptionHeader.BLOCK1);
		this.requestHandler.sendCoapMessage(nextMessage);
	}
	else {
		this.initialReceivedCoapMessage.setPayload(Copper.ByteUtils.mergeByteArrays(this.payloads));
		this.requestHandler.onReceiveComplete(this.initialSentCoapMessage, this.initialReceivedCoapMessage);
		this.onComplete();
	}
};

Copper.BlockwiseReceiver.prototype.error = function(errorMsg){
	this.requestHandler.onReceiveError(errorMsg);
	this.onComplete();
};

Copper.BlockwiseReceiver.prototype.cancel = function(){
	this.onComplete();
};

Copper.BlockwiseReceiver.prototype.onComplete = function(){
	this.requestHandler.onReceiverFinished();
};