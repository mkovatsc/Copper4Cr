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
 
/**
* Creates a new type object.
*/
Copper.CoapMessage.Type = function(number, name) {
	if (!Number.isInteger(number) || typeof(name) !== 'string'){
		throw new Error("Illegal argument");
	}
	this.number = number;
	this.name = name;
};

Copper.CoapMessage.Type.prototype.clone = function() {
	return new Copper.CoapMessage.Type(this.number, this.name);
};

Copper.CoapMessage.Type.prototype.equals = function(other){
	return (other instanceof Copper.CoapMessage.Type) && this.number === other.number && this.name === other.name;
};

/* Registry */
Copper.CoapMessage.Type.CON = new Copper.CoapMessage.Type(0, "CON");
Copper.CoapMessage.Type.NON = new Copper.CoapMessage.Type(1, "NON");
Copper.CoapMessage.Type.ACK = new Copper.CoapMessage.Type(2, "ACK");
Copper.CoapMessage.Type.RST = new Copper.CoapMessage.Type(3, "RST");

Copper.CoapMessage.Type.Registry = [
	Copper.CoapMessage.Type.CON,
	Copper.CoapMessage.Type.NON,
	Copper.CoapMessage.Type.ACK,
	Copper.CoapMessage.Type.RST
];


/*
* @return MessageType for a given number
*/
Copper.CoapMessage.Type.getType = function(number){
	if (!Number.isInteger(number)){
		throw new Error("Illegal argument");
	}
	let reg = Copper.CoapMessage.Type.Registry;
	for (let i = 0; i < reg.length; i++) {
		if (reg[i].number === number){
			return reg[i].clone();
		}
	}
	throw new Error("Illegal message type");
};

/*
* @return MessageType for a given name
*/
Copper.CoapMessage.Type.getTypeForName = function(name){
	if (typeof(name) !== "string"){
		throw new Error("Illegal argument");
	}
	let reg = Copper.CoapMessage.Type.Registry;
	for (let i = 0; i < reg.length; i++) {
		if (reg[i].name === name){
			return reg[i].clone();
		}
	}
	throw new Error("Illegal message type");
};