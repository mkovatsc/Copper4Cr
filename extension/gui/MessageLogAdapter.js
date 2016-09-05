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
 
Copper.MessageLogAdapter = function(){
};

Copper.MessageLogAdapter.beforeSessionInitialization = function(){
	let resizer = document.createElement("div");
	resizer.id = "copper-coap-message-log-resizer";
	
	let messageLog = document.getElementsByClassName("main-content-bottom-box")[0];
	messageLog.appendChild(resizer);

	var startY, startHeight;

	var doMessageLogDrag = function (e) {
		messageLog.style.height = (startHeight + startY - e.clientY) + 'px';
	};

	var stopMessageLogDrag = function (e) {
		document.documentElement.removeEventListener('mousemove', doMessageLogDrag, false);
		document.documentElement.removeEventListener('mouseup', stopMessageLogDrag, false);
	};

	var initMessageLogDrag = function(e) {
		startY = e.clientY;
		startHeight = parseInt(document.defaultView.getComputedStyle(messageLog).height, 10);

		document.documentElement.addEventListener('mousemove', doMessageLogDrag, false);
		document.documentElement.addEventListener('mouseup', stopMessageLogDrag, false);
	};

	resizer.addEventListener('mousedown', initMessageLogDrag, false);


};

Copper.MessageLogAdapter.onEvent = function(event){
	switch(event.type){
		case Copper.Event.TYPE_COAP_MESSAGE_SENT:
			Copper.MessageLogAdapter.addLogEntry(event.data.coapMessage, false, event.data.retransmissionCount);
			break;
		case Copper.Event.TYPE_COAP_MESSAGE_RECEIVED:
			Copper.MessageLogAdapter.addLogEntry(event.data.coapMessage, true);
			break;
		case Copper.Event.TYPE_UNKNOWN_COAP_MESSAGE_RECEIVED:
			Copper.MessageLogAdapter.addLogEntry(event.data.coapMessage, true, undefined, true);
			break;
		case Copper.Event.TYPE_DUPLICATE_COAP_MESSAGE_RECEIVED:
			Copper.MessageLogAdapter.addLogEntry(event.data.coapMessage, true, undefined, true);
			break;	
	}
};

Copper.MessageLogAdapter.addLogEntry = function(coapMessage, isReceived, retransmissionCount, isUnexpected){
	let rootElement = document.getElementById("copper-coap-message-log-table");

	let logElement = document.createElement("div");
	logElement.classList.add("table-body-row");
	logElement.classList.add(isReceived ? (isUnexpected ? "unexpected" : "received") : "sent");

	let timeElement = document.createElement("span");
	timeElement.classList.add("coap-message-time");
	timeElement.textContent = Copper.StringUtils.getTime();
	logElement.appendChild(timeElement);

	let typeElement = document.createElement("span");
	typeElement.classList.add("coap-message-type");
	typeElement.textContent = coapMessage.type.name;
	logElement.appendChild(typeElement);

	let codeElement = document.createElement("span");
	codeElement.classList.add("coap-message-code");
	codeElement.textContent = coapMessage.code.getName();
	logElement.appendChild(codeElement);

	let midElement = document.createElement("span");
	midElement.classList.add("coap-message-mid");
	let mid = coapMessage.mid;
	if (!isReceived && Copper.CoapMessage.Type.CON.equals(coapMessage.type)){
		mid = mid + " (" + retransmissionCount + ")";
	}
	midElement.textContent = mid;
	logElement.appendChild(midElement);

	let tokenElement = document.createElement("span");
	tokenElement.classList.add("coap-message-token");
	tokenElement.textContent = Copper.ByteUtils.convertBytesToHexString(coapMessage.token);
	logElement.appendChild(tokenElement);

	let optionsElement = document.createElement("span");
	optionsElement.classList.add("coap-message-options");
	let options = coapMessage.getOptions();
	for (let i=0; i<options.length; i++){
		let optionHeader = options[i].header;
		let value = options[i].getValue();
		for (let j=0; j<value.length; j++){
			let optionElement = document.createElement("span");
			optionElement.classList.add("no-wrap");
			let optionText = optionHeader.name + ": " + value[j];
			if ((i+1) < options.length || (j+1) < value.length){
				optionText = optionText + ", ";
			}
			optionElement.textContent = optionText;
			optionsElement.appendChild(optionElement);
		}
	}
	logElement.appendChild(optionsElement);

	let payloadElement = document.createElement("span");
	payloadElement.classList.add("coap-message-payload");
	payloadElement.textContent = Copper.ByteUtils.convertBytesToString(coapMessage.payload);
	logElement.appendChild(payloadElement);

	rootElement.insertBefore(logElement, rootElement.firstChild);
};