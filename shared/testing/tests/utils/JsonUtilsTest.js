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
 
QUnit.test("JsonUtils: ArrayBuffer", function(assert) {
	let data = new Uint8Array([23, 21, 42]).buffer;
	let json = Copper.JsonUtils.stringify(data);
	assert.deepEqual(Copper.JsonUtils.parse(json), data);
	assert.deepEqual(Copper.JsonUtils.parse(json).byteLength, data.byteLength);
});

QUnit.test("JsonUtils: Settings", function(assert) {
	let data = new Copper.Settings();
	data.blockSize = 0;
	let json = Copper.JsonUtils.stringify(data);
	assert.deepEqual(Copper.JsonUtils.parse(json), data);
	assert.deepEqual((Copper.JsonUtils.parse(json) instanceof Copper.Settings), true);
});

QUnit.test("JsonUtils: CoapMessageOption", function(assert) {
	let block2Header = new Copper.CoapMessage.OptionHeader(23, "Block2", Copper.CoapMessage.OptionHeader.TYPE_BLOCK, 0, 3, false);
	let data = new Copper.CoapMessage.Option(block2Header).addValue(new Copper.CoapMessage.BlockOption(1, 4, 1));
	let json = Copper.JsonUtils.stringify(data);
	assert.deepEqual(Copper.JsonUtils.parse(json), data);
	assert.deepEqual(Copper.JsonUtils.parse(json).getValue(), data.getValue());
	assert.deepEqual((Copper.JsonUtils.parse(json) instanceof Copper.CoapMessage.Option), true);
});

QUnit.test("JsonUtils: CoapMessage", function(assert) {
	Copper.TestUtils.applyTestsOnDifferentCoapMessages([function(msg){
		Copper.TestUtils.checkCoapMessageEquality(assert, Copper.JsonUtils.parse(Copper.JsonUtils.stringify(msg)), msg);
	}]);
	let msg = Copper.TestUtils.createCoapMessage();
	msg.mid = undefined;
	Copper.TestUtils.checkCoapMessageEquality(assert, Copper.JsonUtils.parse(Copper.JsonUtils.stringify(msg)), msg);
});

QUnit.test("JsonUtils: General", function(assert) {
	let data = {
		t1: 2,
		t2: "blah",
		t3: null,
		t4: {
			t10: 2,
			t11: 3.132,
			t12: null
		}
	};
	let json = Copper.JsonUtils.stringify(data);
	assert.deepEqual(Copper.JsonUtils.parse(json), data);
});