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
* Creates a new block option value 
* @num: block number
* @szExp: exponent of the size of the block 4 <= szExp <= 10
* @more: if another block is available (true, false) 
*/
Copper.CoapMessage.BlockOption = function(num, szExp, more){
	if (!Number.isInteger(num) || num < 0 
		|| !Number.isInteger(szExp) || szExp < 4 || szExp > 10
		|| (more !== 0 && more !== 1 && more !== true && more !== false)){
		throw new Error("Illegal Arguments");
	}
	this.num = num;
	this.szExp = szExp;
	this.more = more ? true : false;
};

/*
* @return number of bytes for a given exponent
*/
Copper.CoapMessage.BlockOption.szExpToSize = function(szExp){
	if (!Number.isInteger(szExp)){
		throw new Error("Illegal Arguments");
	}
	return 1 << szExp; 
};

/*
* @return: size of the block
*/
Copper.CoapMessage.BlockOption.prototype.getSize = function(){
	return Copper.CoapMessage.BlockOption.szExpToSize(this.szExp);
};

Copper.CoapMessage.BlockOption.prototype.toString = function(){
	return this.num + "/" + (this.more ? "1" : "0") + "/" + this.getSize();
};

Copper.CoapMessage.BlockOption.prototype.equals = function(other){
	return (other instanceof Copper.CoapMessage.BlockOption) && this.num === other.num && this.szExp === other.szExp && this.more === other.more;
};

/*
* @blockVal: integer representing the block option
* @return: block option object
*/
Copper.CoapMessage.BlockOption.convertUintToBlockOption = function(blockVal){
	if (!Number.isInteger(blockVal) || blockVal < 0){
		throw new Error("Illegal Argument");
	}
	return new Copper.CoapMessage.BlockOption(blockVal >> 4, 4 + (blockVal & 0x7), (blockVal & 0x8) === 0x8);
};

/*
* @blockOption: block option to convert
* @return: integer representing the block option
*/
Copper.CoapMessage.BlockOption.convertBlockOptionToUint = function(blockOption){
	if (!(blockOption instanceof Copper.CoapMessage.BlockOption)){
		throw new Error("Illegal Argument");
	}
	return (blockOption.num << 4) | (blockOption.more ? 0x8 : 0x0) | (blockOption.szExp - 4);
};