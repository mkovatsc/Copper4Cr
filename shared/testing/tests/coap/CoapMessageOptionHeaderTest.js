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
 
QUnit.test("CoapMessageOptionHeader: Object", function(assert) {
	let uriHost = new Copper.CoapMessage.OptionHeader(3, "Uri-Host", Copper.CoapMessage.OptionHeader.TYPE_STRING, 1, 255, false);
	let etag = new Copper.CoapMessage.OptionHeader(4, "Etag", Copper.CoapMessage.OptionHeader.TYPE_OPAQUE, 1, 8, true);
	let size1 = new Copper.CoapMessage.OptionHeader(60, "Size1", Copper.CoapMessage.OptionHeader.TYPE_UINT, 0, 4, false);

	assert.deepEqual(uriHost.isCritical(), true);
	assert.deepEqual(etag.isCritical(), false);

	assert.deepEqual(uriHost.isUnsafe(), true);
	assert.deepEqual(etag.isUnsafe(), false);

	assert.deepEqual(uriHost.isNoCacheKey(), false);
	assert.deepEqual(size1.isNoCacheKey(), true);

	assert.deepEqual(uriHost.clone(), uriHost);
});

QUnit.test("CoapMessageOptionHeader: getOptionHeader", function(assert) {
	assert.deepEqual(Copper.CoapMessage.OptionHeader.IF_MATCH, Copper.CoapMessage.OptionHeader.getOptionHeader(1));
	assert.deepEqual(Copper.CoapMessage.OptionHeader.SIZE1, Copper.CoapMessage.OptionHeader.getOptionHeader(60));
	assert.deepEqual("Unknown", Copper.CoapMessage.OptionHeader.getOptionHeader(10).name);

	let size1 = new Copper.CoapMessage.OptionHeader(60, "Size1", Copper.CoapMessage.OptionHeader.TYPE_UINT, 0, 4, false);
	let regSize1 = Copper.CoapMessage.OptionHeader.getOptionHeader(60);
	regSize1.name = "UpdateSize1";
	assert.notEqual(size1, regSize1);
	assert.deepEqual(size1, Copper.CoapMessage.OptionHeader.getOptionHeader(60));

	assert.throws(function(){
		Copper.CoapMessage.OptionHeader.getOptionHeader(-1);
	});
	assert.throws(function(){
		Copper.CoapMessage.OptionHeader.getOptionHeader("10");
	});
});

QUnit.test("CoapMessageOptionHeader: getOptionHeaderForName", function(assert) {
	assert.deepEqual(Copper.CoapMessage.OptionHeader.IF_MATCH, Copper.CoapMessage.OptionHeader.getOptionHeaderForName("If-Match"));
	assert.deepEqual("Unknown", Copper.CoapMessage.OptionHeader.getOptionHeaderForName("Something").name);
	assert.deepEqual(Copper.CoapMessage.OptionHeader.SIZE1, Copper.CoapMessage.OptionHeader.getOptionHeaderForName("Size1"));
});	