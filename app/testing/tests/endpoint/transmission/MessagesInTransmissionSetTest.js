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
 
QUnit.test("MessagesInTransmissionSet: General", function(assert) {
	// custom timer
	let oldNowFunction = Copper.TimeUtils.now;
	let timestamp = Copper.TimeUtils.now();
	let elapsedTime = 0;
	Copper.TimeUtils.now = function() {return timestamp + elapsedTime;};

	// Test
	let emptyToken = new ArrayBuffer(0);
	let token = Copper.ByteUtils.convertUintToBytes(234);
	let nonMsg = new Copper.CoapMessage(Copper.CoapMessage.Type.NON, Copper.CoapMessage.Code.GET).setMid(20465);
	let conMsg = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET).setMid(20466).setToken(token);
	let ackMsg = new Copper.CoapMessage(Copper.CoapMessage.Type.ACK, Copper.CoapMessage.Code.CONTENT).setMid(20466).setToken(token).setPayload(new ArrayBuffer(20));
	let requestHandler = Copper.TestUtils.generateRequestHandlerMock();
	let nonTransmission = new Copper.RequestMessageTransmission(nonMsg,  requestHandler);
	let conTransmission = new Copper.RequestMessageTransmission(conMsg,  requestHandler);
	let resTransmission = new Copper.ResponseMessageTransmission(conMsg, "10.3.2.1", 7832);
	resTransmission.addResponse(ackMsg);

	let retransmissionCounter = 0;
	let timeoutCounter = 0;
	let endOfLifeCounter = 0;

	let messagesInTransmissionSet = new Copper.MessagesInTransmissionSet(function(transmission){retransmissionCounter++;}, function(transmission){timeoutCounter++;},
		                                           function(transmission){endOfLifeCounter++;})

	messagesInTransmissionSet.registerToken(emptyToken, requestHandler);
	messagesInTransmissionSet.registerToken(token, requestHandler);
	messagesInTransmissionSet.addNewTransmission(nonTransmission);
	messagesInTransmissionSet.addNewTransmission(conTransmission);
	messagesInTransmissionSet.addNewTransmission(resTransmission);

	assert.deepEqual(messagesInTransmissionSet.getTransmissionCount(), 3);
	messagesInTransmissionSet.removeTransmission(nonTransmission);
	assert.deepEqual(messagesInTransmissionSet.getTransmissionCount(), 2);
	messagesInTransmissionSet.removeTransmission(nonTransmission);
	assert.deepEqual(messagesInTransmissionSet.getTransmissionCount(), 2);
	messagesInTransmissionSet.addNewTransmission(nonTransmission);

	assert.throws(function(){
		// MID must not exist
		messagesInTransmissionSet.addNewTransmission(new Copper.RequestMessageTransmission(new Copper.CoapMessage(Copper.CoapMessage.Type.NON, Copper.CoapMessage.Code.GET).setMid(20465).setToken(Copper.ByteUtils.convertUintToBytes(2535))));
	});	
	assert.throws(function(){
		// token must not exist
		messagesInTransmissionSet.addNewTransmission(new Copper.RequestMessageTransmission(new Copper.CoapMessage(Copper.CoapMessage.Type.NON, Copper.CoapMessage.Code.GET).setMid(51).setToken(token)));
	});
	assert.throws(function(){
		// MID must not exist
		messagesInTransmissionSet.addNewTransmission(new Copper.ResponseMessageTransmission(conMsg, "10.3.2.1", 7832));
	});		
	assert.deepEqual(messagesInTransmissionSet.isTokenRegistered(token), true);
	messagesInTransmissionSet.unregisterToken(Copper.ByteUtils.convertUintToBytes(25353));

	messagesInTransmissionSet.handleTransmissions();
	assert.deepEqual(retransmissionCounter, 0);
	assert.deepEqual(timeoutCounter, 0);
	assert.deepEqual(endOfLifeCounter, 0);

	
	elapsedTime = 1 + conTransmission.timeout;

	for (let i=0; i<Copper.CoapConstants.MAX_RETRANSMIT; i++){
		messagesInTransmissionSet.handleTransmissions();
		assert.deepEqual(retransmissionCounter, i + 1);
		assert.deepEqual(timeoutCounter, (elapsedTime > 1000*Copper.CoapConstants.NON_TIMEOUT ? 1 : 0));
		assert.deepEqual(endOfLifeCounter, 0);

		elapsedTime += 1 + conTransmission.timeout;
	}

	elapsedTime += conTransmission.timeout/2 + 1;
	messagesInTransmissionSet.handleTransmissions();
	assert.deepEqual(retransmissionCounter, Copper.CoapConstants.MAX_RETRANSMIT);
	assert.deepEqual(timeoutCounter, 2);
	assert.deepEqual(endOfLifeCounter, 0);
	assert.deepEqual(messagesInTransmissionSet.getTransmissionCount(), 3);

	elapsedTime = 1 + 1000*Copper.CoapConstants.NON_LIFETIME;
	messagesInTransmissionSet.handleTransmissions();
	messagesInTransmissionSet.unregisterToken(emptyToken);
	assert.deepEqual(retransmissionCounter, Copper.CoapConstants.MAX_RETRANSMIT);
	assert.deepEqual(timeoutCounter, 2);
	assert.deepEqual(endOfLifeCounter, 1);
	assert.deepEqual(messagesInTransmissionSet.getTransmissionCount(), 2);


	elapsedTime = 1 + 1000*Copper.CoapConstants.EXCHANGE_LIFETIME;
	messagesInTransmissionSet.handleTransmissions();
	messagesInTransmissionSet.unregisterToken(token);
	assert.deepEqual(retransmissionCounter, Copper.CoapConstants.MAX_RETRANSMIT);
	assert.deepEqual(timeoutCounter, 2);
	assert.deepEqual(endOfLifeCounter, 3);
	assert.deepEqual(messagesInTransmissionSet.registeredTokens, new Object());

	messagesInTransmissionSet.unregisterToken(token);
	assert.deepEqual(messagesInTransmissionSet.isTokenRegistered(token), false);

	elapsedTime = 0;

	conTransmission.isCompleted = false;
	messagesInTransmissionSet.registerToken(token, requestHandler);
	messagesInTransmissionSet.addNewTransmission(conTransmission);
	messagesInTransmissionSet.getRequestMessageTransmission(20466, token).isCompleted = false;

	messagesInTransmissionSet.handleTransmissions();
	assert.deepEqual(retransmissionCounter, Copper.CoapConstants.MAX_RETRANSMIT);
	elapsedTime = 1 + conTransmission.timeout;

	messagesInTransmissionSet.handleTransmissions();
	assert.deepEqual(retransmissionCounter, Copper.CoapConstants.MAX_RETRANSMIT);
	assert.deepEqual(messagesInTransmissionSet.getTransmissionCount(), 1);

	// reset timer
	Copper.TimeUtils.now = oldNowFunction;
});