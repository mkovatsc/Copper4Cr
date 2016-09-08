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
Copper.PayloadAdapter.currentContentFormat = undefined;
Copper.PayloadAdapter.currentByteOffset = 0;

Copper.PayloadAdapter.setVisiblePane = function(selectedPane, button){
	if (Copper.PayloadAdapter.visiblePane !== selectedPane){
		if (Copper.PayloadAdapter.visiblePane !== undefined){
			Copper.PayloadAdapter.visiblePane.classList.add("hidden");
			Copper.PayloadAdapter.visiblePane.classList.remove("visible");
		}
		selectedPane.classList.add("visible");
		selectedPane.classList.remove("hidden");
		Copper.PayloadAdapter.visiblePane = selectedPane;

		if (!button.classList.contains("selected")) {
			let selectedButtons = button.parentNode.getElementsByClassName("selected");
			for (let i=0; i<selectedButtons.length; i++){
				selectedButtons[i].classList.remove("selected");
			}
			button.classList.add("selected");	
		}
	}
};

Copper.PayloadAdapter.beforeSessionInitialization = function() {
	document.getElementById("copper-payload-btn-in").onclick = function () {
		Copper.PayloadAdapter.setVisiblePane(document.getElementById("copper-payload-tab-in"), document.getElementById("copper-payload-btn-in"));
	};
	document.getElementById("copper-payload-btn-rendered").onclick = function () {
		Copper.PayloadAdapter.setVisiblePane(document.getElementById("copper-payload-tab-rendered"), document.getElementById("copper-payload-btn-rendered"));
	};
	document.getElementById("copper-payload-btn-out").onclick = function () {
		Copper.PayloadAdapter.setVisiblePane(document.getElementById("copper-payload-tab-out"), document.getElementById("copper-payload-btn-out"));
		document.getElementById("copper-payload-tab-out").focus();
		document.getElementById("copper-payload-tab-out").onchange = Copper.PayloadAdapter.onOutgoingChange;
	};
	document.getElementById("copper-payload-btn-in").onclick();
};

Copper.PayloadAdapter.onPayloadUpdated = function() {
	let payload = Copper.Session.payload;
	document.getElementById("copper-payload-tab-out").value = payload.payloadText !== undefined ? payload.payloadText : "";
};

Copper.PayloadAdapter.onOutgoingChange = function() {
	Copper.Session.payload.payloadText = this.value;
	Copper.Session.updatePayload(Copper.Session.payload);
};

Copper.PayloadAdapter.onEvent = function(event){
	switch(event.type){
		case Copper.Event.TYPE_COAP_MESSAGE_RECEIVED:
			Copper.PayloadAdapter.updateIncomingPayload(event.data.coapMessage);
			break;
		case Copper.Event.TYPE_REQUEST_COMPLETED:
			Copper.PayloadAdapter.updateRenderedPayload(event.data.responseCoapMessage);
			break;
		case Copper.Event.TYPE_OBSERVE_REQUEST_FRESH:
			Copper.PayloadAdapter.updateRenderedPayload(event.data.freshCoapMessage);
			break;
	}
};

Copper.PayloadAdapter.updateIncomingPayload = function(coapMessage){
	let append = false;
	let contentFormat = coapMessage.getOption(Copper.CoapMessage.OptionHeader.CONTENT_FORMAT);
	contentFormat = contentFormat.length > 0 ? Copper.CoapMessage.ContentFormat.getContentFormat(contentFormat[0]) : undefined;

	let block2Option = coapMessage.getOption(Copper.CoapMessage.OptionHeader.BLOCK2);
	if (block2Option.length === 1){
		if (Copper.PayloadAdapter.currentBlockNumber === block2Option[0].num && block2Option[0].num > 0){
			append = true;
			contentFormat = Copper.PayloadAdapter.currentContentFormat;
		}
		Copper.PayloadAdapter.currentBlockNumber = block2Option[0].num + 1;
		Copper.PayloadAdapter.currentContentFormat = contentFormat;
	}
	else {
		Copper.PayloadAdapter.currentBlockNumber = 0;
		Copper.PayloadAdapter.currentContentFormat = undefined;
	}

	let incomingTextElement = document.getElementById("copper-payload-tab-in");
	if (!append){
		Copper.PayloadAdapter.currentByteOffset = 0;
		while (incomingTextElement.firstChild) incomingTextElement.removeChild(incomingTextElement.firstChild);
	}

	if (coapMessage.payload.byteLength === 0){
		return;
	}

	if (contentFormat !== undefined && contentFormat.isText){
		// render Text
		let payloadString = Copper.ByteUtils.convertBytesToString(coapMessage.payload, undefined, undefined, !Copper.Session.options.useUtf8);
		if (payloadString !== undefined && payloadString !== ""){
			let texts = payloadString.split(/\r\n|\n/);
			incomingTextElement.appendChild(document.createTextNode(texts[0]));
			for (let i=1; i<texts.length; i++){
				incomingTextElement.appendChild(document.createElement("br"));
				incomingTextElement.appendChild(document.createTextNode(texts[i]));
			}
		}
	}
	else {
		// render Binary
		let bufView = new Uint8Array(coapMessage.payload);
		let firstLine = true;
		let currentBytes = "";
		let currentStringRep = "";
		for (let i=0; i<bufView.byteLength; i++){
			let num = bufView[i];
			
			currentBytes += Copper.StringUtils.lpad(num.toString(16).toUpperCase(), 2, "0");
			if (i%2 === 1) currentBytes += " ";
			
			currentStringRep += (num < 32 || num >= 127) ? "·" : String.fromCharCode(num);
			if (i%8 === 7) currentStringRep += " ";
			
			if (i%16 === 15 || i+1 >= bufView.byteLength) {
				if (i >= 16 || incomingTextElement.lastChild) incomingTextElement.appendChild(document.createElement("br"));
				while (currentBytes.length < 40) currentBytes += " ";
				incomingTextElement.appendChild(document.createTextNode(
					Copper.StringUtils.lpad((Copper.PayloadAdapter.currentByteOffset + i - 15).toString(10), 10, " ") + " | " + currentBytes + " | " + currentStringRep));
				currentBytes = "";
				currentStringRep = "";
			}
		}
		Copper.PayloadAdapter.currentByteOffset += bufView.byteLength;
	}
	document.getElementById("copper-payload-btn-in").onclick();
};

Copper.PayloadAdapter.updateRenderedPayload = function(coapMessage){
	let contentFormat = coapMessage.getOption(Copper.CoapMessage.OptionHeader.CONTENT_FORMAT);
	let renderedPane = document.getElementById("copper-payload-tab-rendered");
	while (renderedPane.firstChild) renderedPane.removeChild(renderedPane.firstChild);

	if (coapMessage.payload.byteLength === 0){
		return;
	}

	contentFormat = contentFormat.length > 0 ? Copper.CoapMessage.ContentFormat.getContentFormat(contentFormat[0]) : undefined;
	if (Copper.CoapMessage.ContentFormat.CONTENT_TYPE_IMAGE_GIF.equals(contentFormat) || Copper.CoapMessage.ContentFormat.CONTENT_TYPE_IMAGE_JPEG.equals(contentFormat) ||
	      Copper.CoapMessage.ContentFormat.CONTENT_TYPE_IMAGE_PNG.equals(contentFormat) || Copper.CoapMessage.ContentFormat.CONTENT_TYPE_IMAGE_TIFF.equals(contentFormat)) {
		let rootElement = document.createElement("div");
		rootElement.style = "display: flex; height: 100%; align-items: center;";
		
		let imgElement = document.createElement("img");
		imgElement.src = "data:" + contentFormat.name + ";base64," + Copper.ByteUtils.convertBytesToBase64(coapMessage.payload);
		imgElement.style = "margin: auto;";
		rootElement.appendChild(imgElement);
		renderedPane.appendChild(rootElement);
	}

	if (renderedPane.firstChild){
		document.getElementById("copper-payload-btn-rendered").onclick();
	}
};