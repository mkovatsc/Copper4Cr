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
 
Copper.CoapMessageSerializer = function(){
};

/**
* @arg msg: Copper.CoapMessage to serialize
* @return: array buffer containing the representation (RFC7252)
*/
Copper.CoapMessageSerializer.serialize = function(msg){
	if (!(msg instanceof Copper.CoapMessage)){
		throw new Error("Invalid Arguments");
	}

	// determine size of the resulting message
	// header & token
	let sz = 4 + msg.token.byteLength;
	let lastOptNr = 0;
	// options
	let msgOptions = msg.getOptions();
	for (let i=0; i<msgOptions.length; i++){
		for (let v=0; v<msgOptions[i].val.length; v++){
			sz += Copper.CoapMessageSerializer.getOptionSize(msgOptions[i].header.number-lastOptNr, msgOptions[i].val[v].byteLength);
			lastOptNr = msgOptions[i].header.number;
		}
	}

	// payload
	sz += msg.payload.byteLength === 0 ? 0 : (1 /* Marker */ + msg.payload.byteLength);

	// serialize
	// header & token
	let buffer = new ArrayBuffer(sz);
	let serMsg = new Uint8Array(buffer);
	serMsg[0] = ((0x03 & msg.version) << 6) | ((0x03 & msg.type.number) << 4) | (0x0F & msg.token.byteLength);
	serMsg[1] = msg.code.number;
	let midBuf = Copper.ByteUtils.convertUintToBytes(msg.mid);
	if (midBuf.byteLength === 1){
		serMsg.set(new Uint8Array(midBuf), 3);
	}
	else if (midBuf.byteLength === 2){
		serMsg.set(new Uint8Array(midBuf), 2);
	}
	serMsg.set(new Uint8Array(msg.token), 4);

	// options
	let idx = 4 + msg.token.byteLength;
	lastOptNr = 0;
	for (let i=0; i<msgOptions.length; i++){
		for (let v=0; v<msgOptions[i].val.length; v++){
			idx += Copper.CoapMessageSerializer.serializeOption(serMsg, idx, msgOptions[i].header.number - lastOptNr, msgOptions[i].val[v]);
			lastOptNr = msgOptions[i].header.number;
		}
	}

	// payload
	if (msg.payload.byteLength > 0){
		serMsg[idx++] = 0xFF;
		serMsg.set(new Uint8Array(msg.payload), idx);
	}
	return buffer;
};

/**
* @arg buffer: ArrayBuffer representing a CoapMessage
* @return: object containing message (deserialized Copper.CoapMessage object (RFC7252))
*                            error (string describing error if message was not deserialized)
*                            warnings (array of strings if problems occured during deserialization)
*/
Copper.CoapMessageSerializer.deserialize = function(buffer){
	if (!(buffer instanceof ArrayBuffer)){
		throw new Error("Invalid Arguments");
	}
	let result = {
		message: undefined, 
		error: undefined, 
		warnings: []
	};

	let serMsg = new Uint8Array(buffer);

	// header & token
	if (Copper.CoapConstants.VERSION !== ((serMsg[0] >>> 6) & 0x03)) {
		result.error = "Cannot handle coap version different from 1";
		return result;
	}

	try {
		let resMsg = new Copper.CoapMessage(
			Copper.CoapMessage.Type.getType((serMsg[0] >>> 4) & 0x03),
			Copper.CoapMessage.Code.getCode(serMsg[1]));
		result.message = resMsg;

		resMsg.setMid(Copper.ByteUtils.convertBytesToUint(buffer, 2, 2));
		
		let tokenLen = serMsg[0] & 0x0F;
		if (tokenLen > 8){
			result.warnings.push("Token length is greater than 8");
		}
		resMsg.setToken(buffer.slice(4, 4 + Math.min(tokenLen, 8)));

		// options
		let idx = 4 + tokenLen;
		let lastOptNumber = 0;
		while (idx < buffer.byteLength && serMsg[idx] !== 0xFF){
			let optionDeltaNibble = (serMsg[idx] >>> 4);
			let addOptionDelta = optionDeltaNibble - Math.min(12, optionDeltaNibble); 
			let optionSizeNibble = (serMsg[idx] & 0x0F) >>> 0;
			let addOptionSize = optionSizeNibble - Math.min(12, optionSizeNibble); 
			
			idx++;
			lastOptNumber += optionDeltaNibble + Copper.ByteUtils.convertBytesToUint(buffer, idx, addOptionDelta);
			idx += addOptionDelta;

			let optionSize = optionSizeNibble + Copper.ByteUtils.convertBytesToUint(buffer, idx, addOptionSize);
			idx += addOptionSize;
			try {
				resMsg.addOption(Copper.CoapMessage.OptionHeader.getOptionHeader(lastOptNumber), buffer.slice(idx, idx + optionSize));
			} catch (exception) {
				result.warnings.push("Error adding option " + lastOptNumber + ": " + exception.message);
			}
			idx += optionSize;
		}
		if (idx < buffer.byteLength){
			resMsg.setPayload(buffer.slice(idx+1));
		}
	} catch(exception) {
		result.error = exception.message;	
	}
	return result;
};

//----------- Helpers --------------
/**
* serializes the option into the serMsg array buffer
*/
Copper.CoapMessageSerializer.serializeOption = function(serMsg, offset, optDelta, optVal){
	if (!(serMsg instanceof Uint8Array) || offset < 0 || optDelta < 0 || optDelta > (0xFFFF + 14) || !(optVal instanceof ArrayBuffer)) {
		throw new Error("Illegal Arguments");
	}
	let optValSize = optVal.byteLength;
	if (optValSize < 0 || optValSize > (0xFFFF + 14)) {
		throw new Error("Illegal Arguments");
	}
	let deltaNibble = (optDelta < 13) ? optDelta : (optDelta <= (0xFF+13) ? 13 : 14);
	let valNibble = (optValSize < 13) ? optValSize : (optValSize <= (0xFF+13) ? 13 : 14);
	let resSz = 1;
	serMsg[offset] = deltaNibble << 4 | valNibble;
	let resDelta = optDelta - deltaNibble;
	if (resDelta > 0){
		let buf = Copper.ByteUtils.convertUintToBytes(resDelta);
		serMsg.set(new Uint8Array(buf), offset+resSz);
		resSz += buf.byteLength;
	}
	let resValSize = optValSize - valNibble;
	if (resValSize > 0){
		let buf = Copper.ByteUtils.convertUintToBytes(resValSize);
		serMsg.set(new Uint8Array(buf), offset+resSz);
		resSz += buf.byteLength;
	}
	serMsg.set(new Uint8Array(optVal), offset+resSz);
	return resSz + optValSize;
};

/**
* calculates the size of the serialized representation of a option
*/
Copper.CoapMessageSerializer.getOptionSize = function(optDelta, optValSize){
	if (optDelta < 0 || optDelta > (0xFFFF + 14) || optValSize < 0 || optValSize > (0xFFFF + 14)){
		throw new Error("Illegal Arguments");
	}
	let size = 1 + optValSize;
	size += (optDelta < 13) ? 0 : (optDelta < (0xFF+14) ? 1 : 2);
	size += (optValSize < 13) ? 0 : (optValSize < (0xFF+14) ? 1 : 2);
	return size;
};