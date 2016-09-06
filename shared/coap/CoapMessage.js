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
* Creates e new message given the type and the code
*/
Copper.CoapMessage = function(type, code){
	if (!(type instanceof Copper.CoapMessage.Type) || !(code instanceof Copper.CoapMessage.Code)){
		throw new Error("Illegal arguments");
	}
	this.type = type;
	this.code = code;
	this.mid = undefined;
	this.token = new ArrayBuffer(0);
	this.options = new Object();
	this.payload = new ArrayBuffer(0);
};

Copper.CoapMessage.prototype.version = Copper.CoapConstants.VERSION;

Copper.CoapMessage.ack = function(mid, token){
	return new Copper.CoapMessage(Copper.CoapMessage.Type.ACK, Copper.CoapMessage.Code.EMPTY).
	       setMid(mid).
	       setToken(token);
};

Copper.CoapMessage.reset = function(mid, token){
	return new Copper.CoapMessage(Copper.CoapMessage.Type.RST, Copper.CoapMessage.Code.EMPTY).
	       setMid(mid).
	       setToken(token);
};

/*
* Clones the message
*/
Copper.CoapMessage.prototype.clone = function(payloadOffset, payloadLength){
	let res = new Copper.CoapMessage(this.type.clone(), this.code.clone()).
			setMid(this.mid).
			setToken(this.token);
	
	let optionNos = Object.keys(this.options);
	for (let i=0; i<optionNos.length; i++){
		res.options[optionNos[i]] = this.options[optionNos[i]];
	}

	if (payloadOffset === undefined && payloadLength === undefined){
		res.setPayload(this.payload);
	}
	else {
		payloadOffset = payloadOffset !== undefined ? payloadOffset : 0;
		payloadLength = payloadLength !== undefined ? payloadLength : (this.payload.byteLength - payloadOffset);
		if (payloadOffset < this.payload.byteLength){
			res.setPayload(this.payload.slice(payloadOffset, Math.min(this.payload.byteLength, payloadOffset + payloadLength)));
		}
	}
	return res;
};

/*
* Sets a message identifier
* @return: this for method chaining
*/
Copper.CoapMessage.prototype.setMid = function(mid){
	if (mid !== undefined && (!Number.isInteger(mid) || mid < 0 || mid > 0xFFFF)){
		throw new Error("Illegal argument");
	}
	this.mid = mid;
	return this;
};

/*
* Sets the message token
* @return: this for method chaining
*/
Copper.CoapMessage.prototype.setToken = function(token){
	if (token === undefined || !(token instanceof ArrayBuffer) || token.byteLength > 8){
		throw new Error("Illegal argument");	
	}
	this.token = token;
	return this;
};

/*
* Adds val to an option creating it if not existing
* @arg optionHeader: header of the option to be set
* @arg val: value of the option
* @arg replace: true if a current option should be overridden
* @arg opts: object with optional options. The following can be set:
*             useUtf8 --> set to false if ascii encoding should be used
*             strict --> set to true in order to throw errors instead of skipping error parts
* @return: this for method chaining
*/
Copper.CoapMessage.prototype.addOption = function(optionHeader, val, replace, opts){
	if (!(optionHeader instanceof Copper.CoapMessage.OptionHeader)){
		throw new Error("Illegal argument");
	}
	if (Copper.CoapMessage.Code.EMPTY.equals(this.code)){
		throw new Error("Empty message cannot have options");
	}
	if (!this.options[optionHeader.number]){
		this.options[optionHeader.number] = new Copper.CoapMessage.Option(optionHeader);
	}
	if (val instanceof ArrayBuffer){
		if (replace){
			this.options[optionHeader.number].setByteValue(val);	
		}
		else {
			this.options[optionHeader.number].addByteValue(val);		
		}
	}
	else {
		if (replace){
			this.options[optionHeader.number].setValue(val, opts);	
		}
		else {
			this.options[optionHeader.number].addValue(val, opts);		
		}
	}
	return this;
};

/**
* Removes all option values for the given header
* @arg optionHeader: header of the option to be removed
*/
Copper.CoapMessage.prototype.removeOption = function(optionHeader){
	if (!(optionHeader instanceof Copper.CoapMessage.OptionHeader)){
		throw new Error("Illegal argument");
	}
	delete this.options[optionHeader.number];
};

/*
* @arg optionHeader: header of the option of which should be checked
* @return whether the option is set
*/
Copper.CoapMessage.prototype.isOptionSet = function(optionHeader){
	if (!(optionHeader instanceof Copper.CoapMessage.OptionHeader)){
		throw new Error("Illegal argument");
	}
	return this.options[optionHeader.number] !== undefined;
};

/*
* @arg optionHeader: header of the option of which the values should be retrieved
* @return if option is not set: default value (which may be undefined)
*         array containing the converted option values. Empty array if option contains no value
*/
Copper.CoapMessage.prototype.getOption = function(optionHeader){
	if (!(optionHeader instanceof Copper.CoapMessage.OptionHeader)){
		throw new Error("Illegal argument");
	}
	if (this.options[optionHeader.number] !== undefined){
		return this.options[optionHeader.number].getValue();
	}
	else if (optionHeader.defaultValue !== undefined) {
		return [optionHeader.defaultValue];
	}
	else {
		return [];
	}
};

/**
* @return: an array containing all options set (options are sorted asc according to their number)
*/
Copper.CoapMessage.prototype.getOptions = function(){
	let optionNos = Object.keys(this.options);
	optionNos.sort(function(a, b){return Number.parseInt(a) - Number.parseInt(b)});
	let res = [];
	for (let i=0; i<optionNos.length; i++){
		res.push(this.options[optionNos[i]]);
	}
	return res;
};

/*
* Sets the payload of the message
* @arg payload: payload in form of an array buffer
* @return: this for method chaining
*/
Copper.CoapMessage.prototype.setPayload = function(payload){
	if (payload === undefined || !(payload instanceof ArrayBuffer)){
		throw new Error("Illegal argument");	
	}
	if (Copper.CoapMessage.Code.EMPTY.equals(this.code) && payload.byteLength > 0){
		throw new Error("Empty message cannot have a payload");
	}
	this.payload = payload;
	return this;
};

/*
* @return: String describing the message
*/
Copper.CoapMessage.prototype.toString = function(){
	let ret = [];
	ret.push("Type: " + this.type.name);
	ret.push("Code: " + this.code.name);
	ret.push("MID: " + this.mid);
	ret.push("Token: " + Copper.ByteUtils.convertBytesToHexString(this.token));
	ret.push("Options: " + this.getOptions().length);
	ret.push("Payload: " + this.payload.byteLength);
	return ret.join("\n");
};