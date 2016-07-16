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
 
Copper.PayloadAdapter = function(){
};

Copper.PayloadAdapter.visiblePane = undefined;
Copper.PayloadAdapter.currentBlockNumber = undefined;

Copper.PayloadAdapter.setVisiblePane = function(element){
	if (Copper.PayloadAdapter.visiblePane !== element){
		Copper.PayloadAdapter.visiblePane.classList.add("hidden");
		Copper.PayloadAdapter.visiblePane.classList.remove("visible");
		element.classList.add("visible");
		element.classList.remove("hidden");
		Copper.PayloadAdapter.visiblePane = element;
	}
};

Copper.PayloadAdapter.init = function(){
	Copper.PayloadAdapter.visiblePane = document.getElementById("copper-payload-tab-in");

	document.getElementById("copper-payload-btn-in").onclick = function(){
		Copper.PayloadAdapter.setVisiblePane(document.getElementById("copper-payload-tab-in"));
	};
	document.getElementById("copper-payload-btn-rendered").onclick = function(){
		Copper.PayloadAdapter.setVisiblePane(document.getElementById("copper-payload-tab-rendered"));
	};
	document.getElementById("copper-payload-btn-out").onclick = function(){
		Copper.PayloadAdapter.setVisiblePane(document.getElementById("copper-payload-tab-out"));
		document.getElementById("copper-payload-tab-out").focus();
	};
};

Copper.PayloadAdapter.onEvent = function(event){
	switch(event.type){
		case Copper.Event.TYPE_COAP_MESSAGE_RECEIVED:
			Copper.PayloadAdapter.updateIncomingPayload(event.data.coapMessage);
	}
};

Copper.PayloadAdapter.beforeSendingCoapMessage = function(coapMessage){
	if (Copper.CoapMessage.Code.POST.equals(coapMessage.code) || Copper.CoapMessage.Code.PUT.equals(coapMessage.code)){
		//coapMessage.addOption(Copper.CoapMessage.OptionHeader.CONTENT_FORMAT, 0);
		coapMessage.setPayload(Copper.ByteUtils.convertStringToBytes(document.getElementById("copper-payload-tab-out").value));
	} 
};

Copper.PayloadAdapter.updateIncomingPayload = function(coapMessage){
	Copper.PayloadAdapter.setVisiblePane(document.getElementById("copper-payload-tab-in"));
	
	let append = false;

	let block2Option = coapMessage.getOption(Copper.CoapMessage.OptionHeader.BLOCK2);
	if (block2Option.length === 1){
		if (Copper.PayloadAdapter.currentBlockNumber === block2Option[0].num && block2Option[0].num > 0){
			append = true;
		}
		Copper.PayloadAdapter.currentBlockNumber = block2Option[0].num + 1;
	}

	let incomingTextElement = document.getElementById("copper-payload-tab-in");
	if (!append){
		while (incomingTextElement.firstChild) {
		    incomingTextElement.removeChild(incomingTextElement.firstChild);
		}
	}

	let payloadString = Copper.ByteUtils.convertBytesToString(coapMessage.payload);
	Copper.Log.logFine(payloadString);
	if (payloadString !== undefined && payloadString !== ""){
		let texts = payloadString.split(/\r\n|\n/);
		incomingTextElement.appendChild(document.createTextNode(texts[0]));
		for (let i=1; i<texts.length; i++){
			incomingTextElement.appendChild(document.createElement("br"));
			incomingTextElement.appendChild(document.createTextNode(texts[i]));
		}
	}
};