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
 
QUnit.test("CoapMessageBlockOption: Object", function(assert) {
	let blockOption1 = new Copper.CoapMessage.BlockOption(10, 4, 1);
	assert.deepEqual(blockOption1.toString(), "10/16/1");

	assert.throws(function(){
		new Copper.CoapMessage.BlockOption(10, 3, 1);
	});
	assert.throws(function(){
		new Copper.CoapMessage.BlockOption(10, 5, 2);
	});

	assert.deepEqual(Copper.CoapMessage.BlockOption.convertUintToBlockOption(Copper.CoapMessage.BlockOption.convertBlockOptionToUint(blockOption1)), blockOption1);

	blockOption1 = new Copper.CoapMessage.BlockOption(0, 4, 0);
	assert.deepEqual(Copper.CoapMessage.BlockOption.convertBlockOptionToUint(blockOption1), 0);
	assert.deepEqual(Copper.CoapMessage.BlockOption.convertUintToBlockOption(Copper.CoapMessage.BlockOption.convertBlockOptionToUint(blockOption1)), blockOption1);

	blockOption1 = new Copper.CoapMessage.BlockOption(55, 10, 0);
	assert.deepEqual(Copper.CoapMessage.BlockOption.convertUintToBlockOption(Copper.CoapMessage.BlockOption.convertBlockOptionToUint(blockOption1)), blockOption1);
});