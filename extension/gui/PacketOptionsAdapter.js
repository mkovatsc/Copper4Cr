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
* GUI-Adapter for the PacketOptions on top center right
* - Fills the table with all set options for each received coap message
*/
Copper.PacketOptionsAdapter = function(){
};

Copper.PacketOptionsAdapter.maxAgeTimer = undefined;

Copper.PacketOptionsAdapter.onEvent = function(event){
	switch(event.type){
		case Copper.Event.TYPE_COAP_MESSAGE_RECEIVED:
			Copper.PacketOptionsAdapter.updatePacketOptions(event.data.coapMessage);
	}
};

Copper.PacketOptionsAdapter.updatePacketOptions = function(coapMessage){
	Copper.TimeUtils.clearTimeout(Copper.PacketOptionsAdapter.maxAgeTimer);
	Copper.PacketOptionsAdapter.maxAgeTimer = undefined;

	let rootElement = document.getElementById("copper-packet-options-table");

	while (rootElement.firstChild) {
	    rootElement.removeChild(rootElement.firstChild);
	}

	let options = coapMessage.getOptions();
	for (let i=0; i<options.length; i++){
		let optionHeader = options[i].header;
		let value = options[i].getValue();
		let rawValue = options[i].val;

		for (let j=0; j<value.length; j++){
			let optionRowElement = document.createElement("div");
			optionRowElement.classList.add("table-body-row");
			
			let optionElement = document.createElement("span");
			optionElement.classList.add("packet-option");
			optionElement.textContent = optionHeader.name + " (" + optionHeader.number + ")";
			optionRowElement.appendChild(optionElement);

			let valueElement = document.createElement("span");
			valueElement.classList.add("packet-value");
			valueElement.textContent = "" + value[j];
			optionRowElement.appendChild(valueElement);

			let rawElement = document.createElement("span");
			rawElement.classList.add("packet-raw");
			rawElement.textContent = Copper.ByteUtils.convertBytesToHexString(rawValue[j]);
			optionRowElement.appendChild(rawElement);
			
			rootElement.appendChild(optionRowElement);
		}
		if (Copper.CoapMessage.OptionHeader.MAX_AGE.equals(optionHeader)){
			let maxAgeRow = rootElement.lastChild;
			Copper.PacketOptionsAdapter.maxAgeTimer = Copper.TimeUtils.setTimeout(function(){
				maxAgeRow.classList.add("red");
			}, value[value.length - 1]*1000);
		}
	}
};