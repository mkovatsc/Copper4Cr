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
 
QUnit.test("CoapMessageSerializer: serialization", function(assert) {

	Copper.TestUtils.applyTestsOnDifferentCoapMessages([function(msg){
		let deserializeResult = Copper.CoapMessageSerializer.deserialize(Copper.CoapMessageSerializer.serialize(msg));
		assert.deepEqual(deserializeResult.error, undefined);
		assert.deepEqual(deserializeResult.warnings.length, 0);
		Copper.TestUtils.checkCoapMessageEquality(assert, deserializeResult.message, msg);
	}]);

    let msg = Copper.TestUtils.createCoapMessage();
    let ifNoneMatchHeader = new Copper.CoapMessage.OptionHeader(5, "If-None-Match", Copper.CoapMessage.OptionHeader.TYPE_EMPTY, 0, 0, false);
    let uriPortHeader = new Copper.CoapMessage.OptionHeader(7, "Uri-Port", Copper.CoapMessage.OptionHeader.TYPE_UINT, 0, 2, true)
    
    msg.addOption(ifNoneMatchHeader);
    msg.addOption(uriPortHeader, 333);
    msg.addOption(uriPortHeader, 334);

    let deserializeResult = Copper.CoapMessageSerializer.deserialize(Copper.CoapMessageSerializer.serialize(msg));
    // set option of the message to the expected result (specified from the protocol)
    msg.removeOption(uriPortHeader);
    msg.addOption(new Copper.CoapMessage.OptionHeader(7, "Uri-Port", Copper.CoapMessage.OptionHeader.TYPE_UINT, 0, 2, false), 333);

    Copper.TestUtils.checkCoapMessageEquality(assert, deserializeResult.message, msg);
    assert.deepEqual(deserializeResult.warnings.length, 1);
});