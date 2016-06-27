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
*  Port implementation for the chrome application
*/
Copper.ChromePort = function(port, id){
	if (!port || !Number.isInteger(id)){
		throw new Error("Illegal Arguments");
	}
	this.port = port;
	this.id = id;
	
	let thisRef = this;

	port.onMessage.addListener(function(msg){
		thisRef.onMessage(msg);
	});
	port.onDisconnect.addListener(function(){
		thisRef.onDisconnect();
	});
};

/* prototype */
Copper.ChromePort.prototype.port = undefined;
Copper.ChromePort.prototype.id = undefined;
Copper.ChromePort.prototype.disconnectCallback = undefined;

/*
* Register a callback of the that is called when the other port disconnects
* 
* @arg callback: callback of the form function()
*/ 
Copper.ChromePort.prototype.registerDisconnectCallback = function(callback) {
	if (typeof(callback) !== "function"){
		throw new Error("Illegal Arguments");
	}
	this.disconnectCallback = callback;
};

/*
* Send the message to the other port
*
* @arg: message in form of an event
*/ 
Copper.ChromePort.prototype.sendMessage = function(msg){
	if (!Number.isInteger(msg.type)){
		throw new Error("Illegal Arguments");
	}
	if (this.port !== undefined){
		this.port.postMessage(Copper.JsonUtils.stringify(msg));
	}
};

/* Implementation */
Copper.ChromePort.prototype.onMessage = function(msg){
	// Route message through event queue. Id is set as the endpoint id.
	msg = Copper.JsonUtils.parse(msg);
	msg.endpointId = this.id;
	Copper.Event.sendEvent(msg);
};

Copper.ChromePort.prototype.onDisconnect = function(){
	this.port = undefined;
	if (this.disconnectCallback !== undefined) this.disconnectCallback();
};