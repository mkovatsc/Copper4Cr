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
 
QUnit.test("RequestMessageTransmission: NON-Transmission", function(assert) {
	// custom timer
	let oldNowFunction = Copper.TimeUtils.now;
	let timestamp = Copper.TimeUtils.now();
	let elapsedTime = 0;
	Copper.TimeUtils.now = function() {return timestamp + elapsedTime;};

	// Test
	let nonMsg = new Copper.CoapMessage(Copper.CoapMessage.Type.NON, Copper.CoapMessage.Code.GET).setMid(13424);
	let transmission = new Copper.RequestMessageTransmission(nonMsg, Copper.TestUtils.generateRequestHandlerMock());
	assert.deepEqual(transmission.isRetransmissionNecessary(), false);
	assert.throws(function(){
		transmission.increaseRetransmissionCounter();
	});
	assert.deepEqual(transmission.isTimeout(), false);
	assert.deepEqual(transmission.isEndOfLife(), false);

	elapsedTime = 1 + 500*Copper.CoapConstants.NON_TIMEOUT;
	assert.deepEqual(transmission.isTimeout(), false);
	assert.deepEqual(transmission.isEndOfLife(), false);

	elapsedTime = 1 + 1000*Copper.CoapConstants.NON_TIMEOUT;
	assert.deepEqual(transmission.isTimeout(), true);
	assert.deepEqual(transmission.isEndOfLife(), false);

	elapsedTime = 1 + 1000*Copper.CoapConstants.NON_LIFETIME;
	assert.deepEqual(transmission.isTimeout(), true);
	assert.deepEqual(transmission.isEndOfLife(), true);

	transmission.isCompleted = true;
	assert.deepEqual(transmission.isTimeout(), false);
	assert.deepEqual(transmission.isEndOfLife(), true);

	// reset timer
	Copper.TimeUtils.now = oldNowFunction;
});

QUnit.test("RequestMessageTransmission: CON-Transmission", function(assert) {
	// custom timer
	let oldNowFunction = Copper.TimeUtils.now;
	let timestamp = Copper.TimeUtils.now();
	let elapsedTime = 0;
	Copper.TimeUtils.now = function() {return timestamp + elapsedTime;};

	// Test
	let conMsg = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET).setMid(13424)
	let transmission = new Copper.RequestMessageTransmission(conMsg,  Copper.TestUtils.generateRequestHandlerMock(), true);
	let minTimeout = 1000 * Copper.CoapConstants.ACK_TIMEOUT;
	let maxTimeout = 1000 * Copper.CoapConstants.ACK_TIMEOUT * Copper.CoapConstants.ACK_RANDOM_FACTOR;

	for (let i=0;i<Copper.CoapConstants.MAX_RETRANSMIT;i++){
		assert.deepEqual(transmission.isRetransmissionNecessary(), false);
		assert.deepEqual(transmission.timeout <= maxTimeout && transmission.timeout >= minTimeout, true);
		assert.deepEqual(transmission.isTimeout(), false);
		assert.deepEqual(transmission.isEndOfLife(), false);

		elapsedTime += transmission.timeout + 1;

		transmission.isCompleted = true;
		assert.deepEqual(transmission.isRetransmissionNecessary(), false);
		
		transmission.isCompleted = false;
		assert.deepEqual(transmission.isRetransmissionNecessary(), true);
		transmission.increaseRetransmissionCounter()
		assert.deepEqual(transmission.retransmissionCounter, i+1);
		minTimeout *= 2;
		maxTimeout *= 2;
	}
	assert.deepEqual(transmission.isTimeout(), false);
	assert.deepEqual(transmission.isEndOfLife(), false);
	assert.deepEqual(transmission.isRetransmissionNecessary(), false);
	
	elapsedTime += transmission.timeout/2 + 1;
	assert.deepEqual(transmission.isRetransmissionNecessary(), false);
	assert.deepEqual(transmission.isTimeout(), true);
	assert.deepEqual(transmission.isEndOfLife(), false);

	transmission.isCompleted = true;
	assert.deepEqual(transmission.isTimeout(), false);
	assert.deepEqual(transmission.isEndOfLife(), false);

	elapsedTime = 1000*Copper.CoapConstants.EXCHANGE_LIFETIME + 1;
	assert.deepEqual(transmission.isRetransmissionNecessary(), false);
	assert.deepEqual(transmission.isTimeout(), false);
	assert.deepEqual(transmission.isEndOfLife(), true);

	// reset timer
	Copper.TimeUtils.now = oldNowFunction;
});