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
 
QUnit.test("CoapMessageOption: Object, addByteValue", function(assert) {
	let optionHeader = new Copper.CoapMessage.OptionHeader(3, "Uri-Host", Copper.CoapMessage.OptionHeader.TYPE_STRING, 2, 255, false);

	assert.deepEqual(new Copper.CoapMessage.Option(optionHeader), new Copper.CoapMessage.Option(optionHeader));
	assert.ok(new Copper.CoapMessage.Option(optionHeader).addByteValue(new ArrayBuffer(3)));

	assert.throws(function(){
		new Copper.CoapMessage.Option(optionHeader).addByteValue(new ArrayBuffer(3)).addByteValue(new ArrayBuffer(3));
	});
	assert.throws(function(){
		new Copper.CoapMessage.Option(optionHeader).addByteValue(null);
	});
	assert.throws(function(){
		new Copper.CoapMessage.Option(optionHeader).addByteValue("teststring");
	});
	assert.throws(function(){
		new Copper.CoapMessage.Option(optionHeader).addByteValue(new ArrayBuffer(1));
	});


	optionHeader = new Copper.CoapMessage.OptionHeader(3, "Uri-Host", Copper.CoapMessage.OptionHeader.TYPE_STRING, 0, 8, true);
	assert.throws(function(){
		new Copper.CoapMessage.Option(optionHeader).addByteValue(new ArrayBuffer(10));
	});
	assert.ok(new Copper.CoapMessage.Option(optionHeader).addByteValue(new ArrayBuffer(3)).addByteValue(new ArrayBuffer(3)));
	assert.ok(new Copper.CoapMessage.Option(optionHeader).addByteValue(null));
});

QUnit.test("CoapMessageOption: values", function(assert) {
	let emptyHeader = new Copper.CoapMessage.OptionHeader(5, "If-None-Match", Copper.CoapMessage.OptionHeader.TYPE_EMPTY, 0, 0, false);
	assert.deepEqual(new Copper.CoapMessage.Option(emptyHeader).getValue(), []);
	assert.deepEqual(new Copper.CoapMessage.Option(emptyHeader).setValue(null).getValue(), [null]);
	assert.deepEqual(new Copper.CoapMessage.Option(emptyHeader).setValue(0).getValue(), [null]);
	assert.throws(function(){
		new Copper.CoapMessage.Option(emptyHeader).setValue("test");
	});

	let stringHeader = new Copper.CoapMessage.OptionHeader(3, "Uri-Host", Copper.CoapMessage.OptionHeader.TYPE_STRING, 1, 255, false);
	assert.deepEqual(new Copper.CoapMessage.Option(stringHeader).setValue("http://vs0.inf.ethz.ch").getValue(), ["http://vs0.inf.ethz.ch"]);
	
	let opaqueHeader = new Copper.CoapMessage.OptionHeader(4, "Etag", Copper.CoapMessage.OptionHeader.TYPE_OPAQUE, 1, 8, true);
	assert.deepEqual(new Copper.CoapMessage.Option(opaqueHeader).getValue(), []);
	assert.deepEqual(new Copper.CoapMessage.Option(opaqueHeader).setValue("0x33").getValue(), ["0x33"]);
	assert.deepEqual(new Copper.CoapMessage.Option(opaqueHeader).setValue("0x33").addValue("0x34").getValue(), ["0x33", "0x34"]);

	let uintHeader = new Copper.CoapMessage.OptionHeader(7, "Uri-Port", Copper.CoapMessage.OptionHeader.TYPE_UINT, 0, 2, false);
	assert.throws(function(){
		new Copper.CoapMessage.Option(uintHeader).setValue("0x33");
	});
	assert.deepEqual(new Copper.CoapMessage.Option(uintHeader).setValue(0x33).setValue(0x34).getValue(), [0x34]);

	let blockHeader = new Copper.CoapMessage.OptionHeader(23, "Block2", Copper.CoapMessage.OptionHeader.TYPE_BLOCK, 0, 3, false);
	let blockOption = new Copper.CoapMessage.BlockOption(0, 6, 1);
	assert.deepEqual(new Copper.CoapMessage.Option(blockHeader).setValue(blockOption).getValue(), [blockOption]);
	blockOption = new Copper.CoapMessage.BlockOption(0, 4, 0);
	assert.deepEqual(new Copper.CoapMessage.Option(blockHeader).setValue(blockOption).getValue(), [blockOption]);
	assert.throws(function(){
		new Copper.CoapMessage.Option(blockHeader).setValue(0);
	});
});
