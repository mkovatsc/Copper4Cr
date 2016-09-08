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
 
QUnit.test("ExtensionJsonUtils: Options", function(assert) {
	let data = new Copper.Options();
	data.size1 = 2000;
	let json = Copper.JsonUtils.stringify(data);
	assert.deepEqual(Copper.JsonUtils.parse(json), data);
	assert.deepEqual((Copper.JsonUtils.parse(json) instanceof Copper.Options), true);
});

QUnit.test("ExtensionJsonUtils: Profile", function(assert) {
	let data = new Copper.Profiles();
	let settings = new Copper.Settings();
	settings.blockSize = 0;
	let options = new Copper.Options();
	options.setToken("0x33");
	options.addOption(8, "0x2");
	let payload = new Copper.Payload();
	payload.payloadFileData = new ArrayBuffer(4);
	let layout = new Copper.Layout();
	data.addProfile("test", settings, options, payload, layout);
	data.selectProfile("test");
	data.autoStore = false;
	let json = Copper.JsonUtils.stringify(data);
	assert.deepEqual(Copper.JsonUtils.parse(json), data);
	assert.deepEqual((Copper.JsonUtils.parse(json) instanceof Copper.Profiles), true);
	assert.deepEqual(Copper.JsonUtils.parse(json).getSelectedProfile().payload.payloadFileData.byteLength, 4);
});

QUnit.test("ExtensionJsonUtils: Resources", function(assert) {
	let data = new Copper.Resources();
	data.resources["vs0.inf.ethz.ch"] = {"blah blah blah": "test"};
	let json = Copper.JsonUtils.stringify(data);
	assert.deepEqual(Copper.JsonUtils.parse(json), data);
	assert.deepEqual((Copper.JsonUtils.parse(json) instanceof Copper.Resources), true);
});

QUnit.test("ExtensionJsonUtils: Payload", function(assert) {
	let data = new Copper.Payload();
	data.payloadFileData = new ArrayBuffer(33);
	data.payloadMode = "file";
	data.payloadText = "blah blah";
	data.payloadFileName = "temp.txt";
	let json = Copper.JsonUtils.stringify(data);
	assert.deepEqual(Copper.JsonUtils.parse(json), data);
	assert.deepEqual(Copper.JsonUtils.parse(json).payloadFileData.byteLength, 33);
	assert.deepEqual((Copper.JsonUtils.parse(json) instanceof Copper.Payload), true);
});

QUnit.test("ExtensionJsonUtils: Layout", function(assert) {
	let data = new Copper.Layout();
	data.resourceTreeWidth = 22;
	data.resourceViewCollapsed = true;
	let json = Copper.JsonUtils.stringify(data);
	assert.deepEqual(Copper.JsonUtils.parse(json), data);
	assert.deepEqual((Copper.JsonUtils.parse(json) instanceof Copper.Layout), true);
});