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

Copper.CopperUtils = function() {
};

Copper.CopperUtils.cloneObject = function(objectToClone, newObject){
	let keys = Object.keys(objectToClone);
	for (let i=0; i<keys.length; i++){
		newObject[keys[i]] = Copper.CopperUtils.cloneSimple(objectToClone[keys[i]]);
	}
	return newObject;
};

Copper.CopperUtils.cloneSimple = function(value){
	if (Array.isArray(value)){
		let clone = [];
		for (let i=0; i<value.length; i++){
			clone.push(Copper.CopperUtils.cloneSimple(value[i]));
		}
		return clone;
	}
	else if (typeof(value) === "object"){
		return Copper.CopperUtils.cloneObject(value, new Object());
	}
	else {
		return value;
	}
};


/*
* Splits a value (e.g. a path) according to a selector and adds these to the coapMessage
* @arg coapMessage: message
* @arg optionHeader: header of the option to be set
* @arg val: value of the option
* @arg separator
* @arg opts: object with optional options. The following can be set:
*             useUtf8 --> set to false if ascii encoding should be used
*             strict --> set to true in order to throw errors instead of skipping error parts
*/
Copper.CopperUtils.splitOptionAndAddToCoapMessage = function(coapMessage, optionHeader, value, separator, opts){
    if (value !== undefined){
        let valueParts = value.split(separator);
        for (let i=0; i<valueParts.length; i++){
            if (valueParts[i] !== undefined && valueParts[i] !== ""){
                coapMessage.addOption(optionHeader, valueParts[i]);
            }
        }
    }
};