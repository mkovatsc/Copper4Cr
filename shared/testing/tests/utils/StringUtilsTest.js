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
 
QUnit.test("StringUtils: lpadTest", function(assert) {
	assert.deepEqual(Copper.StringUtils.lpad("teststring", 3), "tes");
	assert.deepEqual(Copper.StringUtils.lpad("Teststring", 3), "Tes");
	assert.deepEqual(Copper.StringUtils.lpad("", 3), "000");
	assert.deepEqual(Copper.StringUtils.lpad(null, 3), "000");
	assert.deepEqual(Copper.StringUtils.lpad(null, 3, "a"), "aaa");
	assert.deepEqual(Copper.StringUtils.lpad("test", 0), "");
	assert.deepEqual(Copper.StringUtils.lpad("112", 3), "112");
	assert.deepEqual(Copper.StringUtils.lpad("12", 3), "012");
	assert.deepEqual(Copper.StringUtils.lpad("12", 4), "0012");
	assert.deepEqual(Copper.StringUtils.lpad("12", 4, "a"), "aa12");
	assert.deepEqual(Copper.StringUtils.lpad("12", 4, ""), "0012");
	assert.deepEqual(Copper.StringUtils.lpad("12", 4, null), "0012");

	assert.throws(function(){
		Copper.StringUtils.lpad("12", "b", "a")
	});
	assert.throws(function(){
		Copper.StringUtils.lpad("12", 4, "ab")
	});
	assert.throws(function(){
		Copper.StringUtils.lpad(2, 4, "ab")
	});
});

QUnit.test("StringUtils: getDateTimeTest", function(assert) {
	assert.ok(Copper.StringUtils.getDateTime().match("^\\d\\d\\.\\d\\d\\.20\\d\\d [0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d\\d\\d$"), "getDateTime format");
});

QUnit.test("StringUtils: parseUri", function(assert){
	assert.deepEqual(Copper.StringUtils.parseUri("vs0.inf.ethz.ch"), {address: "vs0.inf.ethz.ch"});
	assert.deepEqual(Copper.StringUtils.parseUri("www.vs0.inf.ethz.ch.ch:230/hello"), {address: "www.vs0.inf.ethz.ch.ch", path: "hello", port: 230});
	assert.deepEqual(Copper.StringUtils.parseUri("coap://vs0.inf.ethz.ch:230/hello"), {address: "vs0.inf.ethz.ch", path: "hello", port: 230});
	assert.deepEqual(Copper.StringUtils.parseUri("vs0.inf.ethz.ch?param=test&p2=1"), {address: "vs0.inf.ethz.ch", query: "param=test&p2=1"});
	assert.deepEqual(Copper.StringUtils.parseUri("coap://vs0.inf.ethz.ch:230/hello?param=test&p2=1"), 
		{address: "vs0.inf.ethz.ch", port: 230, path: "hello", query: "param=test&p2=1"});
});