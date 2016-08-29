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
 
Copper.JsonUtils = function(){
};

/**
* Transforms object to the json representation. Supported objects are:
*  - ArrayBuffer
*  - Copper.Settings
*  - Copper.CoapMessage.Option
*  - Copper.CoapMessage
*/ 
Copper.JsonUtils.stringify = function(object){
	if (object === undefined){
		return undefined;
	}
	return JSON.stringify(object, Copper.JsonUtils.replacer);
};

/*
* Transform a json representation to an object
*/
Copper.JsonUtils.parse = function(json){
	if (json === undefined){
		return undefined;
	}
	return JSON.parse(json, Copper.JsonUtils.reviver);
};

/* Implementation */
Copper.JsonUtils.replacer = function(key, value){
	for (let i=0; i<Copper.JsonUtils.transformers.length; i++){
		if (Copper.JsonUtils.transformers[i][0](value)){
			if (Copper.JsonUtils.transformers[i])
			return {
				type: Copper.JsonUtils.transformers[i][1],
				data: (Copper.JsonUtils.transformers[i][2] ? Copper.JsonUtils.transformers[i][2](value) : JSON.parse(JSON.stringify(value)))
			};
		}
	}
	return value;
};

Copper.JsonUtils.reviver = function(key, value){
	for (let i=0; i<Copper.JsonUtils.transformers.length; i++){
		if ((value instanceof Object) && value.type === Copper.JsonUtils.transformers[i][1] && value.data){
			return Copper.JsonUtils.transformers[i][3](value.data);
		}
	}
	return value;
};

/**
* Transformers
* - objects with a prototype are transformed into a serializable value
* - a serializable value is retransformed into the object with the prototypye
*/
Copper.JsonUtils.arrayBufferToJson = function(buf){
	if (!(buf instanceof ArrayBuffer)){
		throw new Error("Illegal Arguments");
	}
	return Array.from(new Uint8Array(buf));
};

Copper.JsonUtils.jsonToArrayBuffer = function(data){
	return new Uint8Array(data).buffer;
};

Copper.JsonUtils.jsonToCopperSettings = function(data){
	let res = new Copper.Settings();
	let settings = Object.keys(data);
	for (let i=0; i<settings.length; i++){
		res[settings[i]] = data[settings[i]];
	}
	return res;
};

Copper.JsonUtils.coapMessageOptionToJson = function(option){
	if (!(option instanceof Copper.CoapMessage.Option)){
		throw new Error("Illegal Arguments");
	}
	return {
		header: {
			number: option.header.number,
			name: option.header.name,
			type: option.header.type,
			minLen: option.header.minLen,
			maxLen: option.header.maxLen,
			multipleValues: option.header.multipleValues,
			defaultValue: option.header.defaultValue
		},
		val: option.val
	};
};

Copper.JsonUtils.jsonToCoapMessageOption = function(data){
	let res = new Copper.CoapMessage.Option(new Copper.CoapMessage.OptionHeader(
		data.header.number,
		data.header.name,
		data.header.type,
		data.header.minLen,
		data.header.maxLen,
		data.header.multipleValues,
		data.header.defaultValue
		));
	res.val = data.val;
	return res;
};

Copper.JsonUtils.coapMessageToJson = function(msg){
	if (!(msg instanceof Copper.CoapMessage)){
		throw new Error("Illegal Arguments");
	}
	return {
		type: {number: msg.type.number, name: msg.type.name},
		code: {number: msg.code.number, name: msg.code.name},
		mid: msg.mid,
		token: msg.token,
		options: msg.options,
		payload: msg.payload
	};
};

Copper.JsonUtils.jsonToCoapMessage = function(data){
	let res = new Copper.CoapMessage(
					new Copper.CoapMessage.Type(data.type.number, data.type.name), 
					new Copper.CoapMessage.Code(data.code.number, data.code.name));
	res.mid = data.mid;
	res.token = data.token;
	res.options = data.options;
	res.payload = data.payload;
	return res;
};

Copper.JsonUtils.transformers = [
	[function(value){return value instanceof ArrayBuffer}, "ArrayBuffer", Copper.JsonUtils.arrayBufferToJson, Copper.JsonUtils.jsonToArrayBuffer],
	[function(value){return value instanceof Copper.Settings}, "Copper.Settings", undefined, Copper.JsonUtils.jsonToCopperSettings],
	[function(value){return value instanceof Copper.CoapMessage.Option}, "Copper.CoapMessage.Option", Copper.JsonUtils.coapMessageOptionToJson, Copper.JsonUtils.jsonToCoapMessageOption],
	[function(value){return value instanceof Copper.CoapMessage}, "Copper.CoapMessage", Copper.JsonUtils.coapMessageToJson, Copper.JsonUtils.jsonToCoapMessage]
];