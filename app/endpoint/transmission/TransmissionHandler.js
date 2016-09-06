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
* The transmission handler is the layer between the ServerEndpoint and the UdpClient. It provides reliable transport for the Coap Messages according to RFC-7252
* 
* The chart gives an overview of the different states and the methods that lead to a transition
*
*  STATE_CREATED            (Bind)
*        |
* bind   |  
*        V  
*   STATE_READY   (Send, Receive, Close)
*        |
* close  |
*        V
*   STATE_CLOSED
*/
Copper.TransmissionHandler = function(udpClient, remoteAddress, remotePort, settings, endpointId){
	if (typeof(remoteAddress) !== "string" || !Number.isInteger(remotePort) || remotePort <= 0x0 || remotePort > 0xFFFF || 
		    !(settings instanceof Copper.Settings) || !Number.isInteger(endpointId)) {
		throw new Error("Illegal Arguments");
	}
	this.udpClient = udpClient;
	this.remoteAddress = remoteAddress;
	this.remotePort = remotePort;
	this.settings = settings;
	this.endpointId = endpointId;

	let thisRef = this;
	this.messagesInTransmissionSet = new Copper.MessagesInTransmissionSet(function(transmission, retransmissionCount){ thisRef.onRetransmission(transmission, retransmissionCount); },
													function(transmission){ thisRef.onTimeout(transmission); },
													function(transmission){ thisRef.onEndOfLife(transmission); });
	
	let midStart = parseInt(Math.random()*0x10000);
	this.midGenerator = function(returnLastMid){
		if (!returnLastMid) midStart = (midStart + 1) % 0x10000;
		return midStart;
	};

	let periodicFunction = function(){
		thisRef.messagesInTransmissionSet.handleTransmissions();
		thisRef.timer = Copper.TimeUtils.setTimeout(periodicFunction, 50);
	}
	periodicFunction();

	this.requestCallbacks = [];
	this.state = Copper.TransmissionHandler.STATE_CREATED;

	this.isInResponseHandling = false;
	this.sendQueue = [];
};

/* State Constants */
Copper.TransmissionHandler.STATE_CREATED = 0;
Copper.TransmissionHandler.STATE_READY = 1;
Copper.TransmissionHandler.STATE_CLOSED = 2;

/* Properties */
Copper.TransmissionHandler.prototype.udpClient = undefined;
Copper.TransmissionHandler.prototype.remoteAddress = undefined;
Copper.TransmissionHandler.prototype.remotePort = undefined;
Copper.TransmissionHandler.prototype.settings = undefined;
Copper.TransmissionHandler.prototype.endpointId = undefined;
Copper.TransmissionHandler.prototype.messagesInTransmissionSet = undefined;
Copper.TransmissionHandler.prototype.midGenerator = undefined;
Copper.TransmissionHandler.prototype.timer = undefined;
Copper.TransmissionHandler.prototype.requestCallbacks = undefined;
Copper.TransmissionHandler.prototype.state = undefined;
Copper.TransmissionHandler.prototype.isInResponseHandling = undefined;
Copper.TransmissionHandler.prototype.sendQueue = undefined;

/*
* Register a new callback that is called if a request is received
* If the callback returns a response, no further callbacks are called and the response is sent to remoteAddress:remotePort
* an ACK is also sent if a CON response is returned for a CON request 
* @arg callback: function(coapMessage, remoteAddress, remotePort) 
*/
Copper.TransmissionHandler.prototype.registerRequestCallback = function(callback){
	if (!(typeof(callback) === "function")){
		throw new Error("Illegal Arguments");
	}
	if (this.requestCallbacks.indexOf(callback) > -1){
		throw new Error("Callback already registered");
	}
	this.requestCallbacks.push(callback);
};

/*
* Unregister the previously registered callback
* @arg callback: function(coapMessage, remoteAddress, remotePort) 
*/
Copper.TransmissionHandler.prototype.unregisterRequestCallback = function(callback){
	if (!(typeof(callback) === "function")){
		throw new Error("Illegal Arguments");
	}
	let index = this.requestCallbacks.indexOf(callback);
	if (index > -1){
		this.requestCallbacks.splice(index, 1);
	}
};

/* 
*  Binds the underlying socket. On success, a ClientRegisteredEvent is put on the event queue
*/
Copper.TransmissionHandler.prototype.bind = function(){
	if (this.state !== Copper.TransmissionHandler.STATE_CREATED){
		Copper.Event.sendEvent(Copper.Event.createErrorOnServerEvent(Copper.Event.ERROR_ILLEGAL_STATE, "Illegal State", this.state === Copper.TransmissionHandler.STATE_READY, this.endpointId));
	}
	else {
		let thisRef = this;
		this.udpClient.bind(function(socketReady, port, errorMsg){
								if (socketReady){
									thisRef.state = Copper.TransmissionHandler.STATE_READY;
									Copper.Event.sendEvent(Copper.Event.createClientRegisteredEvent(port, thisRef.endpointId));
								}
								else {
									Copper.Event.sendEvent(Copper.Event.createErrorOnServerEvent(Copper.Event.ERROR_BIND, "Error while binding socket: " + errorMsg, false, thisRef.endpointId));
									thisRef.close();
								}
							},
							function(datagram, remoteAddress, remotePort){ thisRef.onReceiveDatagram(datagram, remoteAddress, remotePort); },
							function(socketOpen, errorMsg){	thisRef.onReceiveDatagramError(socketOpen, errorMsg); }
		);
	}
};

/*
*  Updates the settings
*  @arg settings: new settings
*/
Copper.TransmissionHandler.prototype.updateSettings = function(settings){
	if (!(settings instanceof Copper.Settings)){
		throw new Error("Illegal Arguments");
	}
	this.settings = settings;
};

Copper.TransmissionHandler.prototype.isTokenRegistered = function(token){
	if (!(token instanceof ArrayBuffer)){
		throw new Error("Illegal Arguments");
	}
	return this.messagesInTransmissionSet.isTokenRegistered(token);
};

Copper.TransmissionHandler.prototype.registerToken = function(token, requestHandler){
	if (!(token instanceof ArrayBuffer) || requestHandler === undefined){
		throw new Error("Illegal Arguments");
	}
	if (this.messagesInTransmissionSet.isTokenRegistered(token)){
		throw new Error("Token is already registered");
	}
	this.messagesInTransmissionSet.registerToken(token, {requestHandler: requestHandler});
};

Copper.TransmissionHandler.prototype.getRequestHandlerForToken = function(token){
	if (!(token instanceof ArrayBuffer)){
		throw new Error("Illegal Arguments");
	}
	let registeredObject = this.messagesInTransmissionSet.getRegisteredObjectForToken(token);
	return registeredObject !== undefined ? registeredObject.requestHandler : undefined;
};

Copper.TransmissionHandler.prototype.setRequestMessageTransmissionForToken = function(token, requestTransmission){
	if (!(token instanceof ArrayBuffer) || !(requestTransmission instanceof Copper.RequestMessageTransmission)){
		throw new Error("Illegal Arguments");
	}
	let registeredObject = this.messagesInTransmissionSet.getRegisteredObjectForToken(token);
	if (registeredObject === undefined){
		throw new Error("Illegal Argument");
	}
	registeredObject.requestTransmission = requestTransmission;
};

Copper.TransmissionHandler.prototype.getRequestMessageTransmissionForToken = function(token){
	if (!(token instanceof ArrayBuffer)){
		throw new Error("Illegal Arguments");
	}
	let registeredObject = this.messagesInTransmissionSet.getRegisteredObjectForToken(token);
	return registeredObject !== undefined ? registeredObject.requestTransmission : undefined;
};

Copper.TransmissionHandler.prototype.unregisterToken = function(token, requestHandler){
	if (!(token instanceof ArrayBuffer)){
		throw new Error("Illegal Arguments");
	}
	if (requestHandler === undefined || this.getRequestHandlerForToken(token) === requestHandler){
		this.messagesInTransmissionSet.unregisterToken(token);
	}
};

/*
*  Creates a new transmission and starts sending the coap message
*
* @arg coapMessage: message to send
*/
Copper.TransmissionHandler.prototype.sendCoapMessage = function(coapMessage, requestHandler, sendFirst){
	if (this.state !== Copper.TransmissionHandler.STATE_READY){
		Copper.Event.sendEvent(Copper.Event.createErrorOnServerEvent(Copper.Event.ERROR_ILLEGAL_STATE, "Illegal State", false, this.endpointId));
	}
	else if (coapMessage.mid !== undefined){
		Copper.Event.sendEvent(Copper.Event.createErrorOnServerEvent(Copper.Event.ERROR_ILLEGAL_ARGUMENT, "Mid must not be set", true, this.endpointId));
	}
	else if (requestHandler !== undefined && this.getRequestHandlerForToken(coapMessage.token) !== requestHandler){
		throw new Error("Request Handler must match token");
	}
	else {
		coapMessage.setMid(this.midGenerator(this.settings.sendDuplicates));
		let transmission = new Copper.RequestMessageTransmission(coapMessage, requestHandler, this.settings.retransmissions);
		if (requestHandler !== undefined){
			this.setRequestMessageTransmissionForToken(coapMessage.token, transmission);
		}
		if (this.settings.sendDuplicates){
			let activeTransmission = this.messagesInTransmissionSet.getRequestMessageTransmission(coapMessage.mid);
			if (activeTransmission !== undefined) this.messagesInTransmissionSet.removeTransmission(activeTransmission);
		}
		this.messagesInTransmissionSet.addNewTransmission(transmission);

		if (sendFirst){
			this.sendQueue.unshift(transmission.coapMessage);
		}
		else {
			this.sendQueue.push(transmission.coapMessage);
		}
		if (!this.isInResponseHandling){
			this.processSendQueue();
		}
	}
};

/*
*  Closes the underlying socket and cancels all remaining transmissions
*/
Copper.TransmissionHandler.prototype.close = function(){
	if (this.state !== Copper.TransmissionHandler.STATE_CLOSED){
		this.state = Copper.TransmissionHandler.STATE_CLOSED;
		Copper.TimeUtils.clearTimeout(this.timer);
		this.messagesInTransmissionSet.reset();
		this.udpClient.close();
	}
};

// -------- Implementation -------------
Copper.TransmissionHandler.prototype.processSendQueue = function(){
	let oldQueue = this.sendQueue;
	this.sendQueue = [];
	for (let i=0; i<oldQueue.length; i++){
		this.sendCoapMessageInternal(oldQueue[i], this.remoteAddress, this.remotePort, 0);
	}
};

/*
* Sends the coap message over the udp socket
*/
Copper.TransmissionHandler.prototype.sendCoapMessageInternal = function(coapMessage, remoteAddress, remotePort, retransmissionCount){
	if (!(coapMessage instanceof Copper.CoapMessage) || typeof(remoteAddress) !== "string" || !Number.isInteger(remotePort) || remotePort < 0 || 
			!Number.isInteger(retransmissionCount) || retransmissionCount < 0){
		throw new Error("Illegal Arguments");
	}
	let thisRef = this;
	this.udpClient.send(Copper.CoapMessageSerializer.serialize(coapMessage), this.remoteAddress, this.remotePort, function(successful, bytesSent, socketOpen, errorMsg){
		if (this.state !== Copper.TransmissionHandler.STATE_CLOSED){
			if (successful){
				Copper.Event.sendEvent(Copper.Event.createCoapMessageSentEvent(coapMessage, bytesSent, retransmissionCount, thisRef.endpointId));
			}
			else {
				Copper.Event.sendEvent(Copper.Event.createErrorOnServerEvent(Copper.Event.ERROR_SEND, "Error while sending: " + errorMsg, socketOpen, thisRef.endpointId));
			}
		}
	});
};

/*
* Handle a received message. 
* For a request (CON or NON with request code)
*   1. Collect response
*   2. Send response (and if necessary ACK) 
*   3. Add to duplicate filter
* For a response (ACK, RST, CON or NON with response code):
*   1. Stop retransmission for corresponding transmission 
*   2. Release token if content is delivered
*   3. ACK if it is necessary
*/
Copper.TransmissionHandler.prototype.handleReceivedCoapMessage = function(coapMessage, parserWarnings, remoteAddress, remotePort, byteLength){
	this.isInResponseHandling = true;
	try {
		let thisRef = this;
		let completeRequestTransmission = function(requestTransmission, coapMessage){
			requestTransmission.isCompleted = true;
			Copper.Event.sendEvent(Copper.Event.createMessageTransmissionCompletedEvent(requestTransmission.coapMessage, coapMessage, Copper.TimeUtils.now()-requestTransmission.firstTransmissionStart, thisRef.endpointId));
		};
		if (Copper.CoapMessage.Type.ACK.equals(coapMessage.type) || Copper.CoapMessage.Type.RST.equals(coapMessage.type)){
			// Matches exactly one coap message in a request
			let requestTransmission = this.messagesInTransmissionSet.getRequestMessageTransmission(coapMessage.mid, coapMessage.token);
			if (requestTransmission === undefined){
				Copper.Event.sendEvent(Copper.Event.createReceivedUnknownCoapMessageEvent(coapMessage, parserWarnings, remoteAddress, remotePort, byteLength, this.endpointId));
			}
			else if (requestTransmission.isConfirmed){
				Copper.Event.sendEvent(Copper.Event.createReceivedDuplicateCoapMessageEvent(coapMessage, parserWarnings, remoteAddress, remotePort, byteLength, this.endpointId));
			}
			else if (requestTransmission.requestHandler !== undefined && requestTransmission.requestHandler !== this.getRequestHandlerForToken(coapMessage.token)) {
				Copper.Event.sendEvent(Copper.Event.createReceivedUnknownCoapMessageEvent(coapMessage, parserWarnings, remoteAddress, remotePort, byteLength, this.endpointId));
			}
			else {
				Copper.Event.sendEvent(Copper.Event.createReceivedCoapMessageEvent(coapMessage, parserWarnings, remoteAddress, remotePort, byteLength, this.endpointId));
				requestTransmission.isConfirmed = true;
				Copper.Event.sendEvent(Copper.Event.createMessageTransmissionConfirmedEvent(requestTransmission.coapMessage, Copper.TimeUtils.now()-requestTransmission.lastTransmissionStart, this.endpointId));
				
				if (requestTransmission.requestHandler === undefined){
					completeRequestTransmission(requestTransmission, coapMessage);
				}
				else if (Copper.CoapMessage.Type.RST.equals(coapMessage.type) || !Copper.CoapMessage.Code.EMPTY.equals(coapMessage.code)){
					completeRequestTransmission(requestTransmission, coapMessage);
					requestTransmission.requestHandler.handleResponse(requestTransmission.coapMessage, coapMessage, undefined);
				}
			}
		}
		else {
			// Either a new request or a reponse to a previous request. If request or response is determined using the code
			let responseCoapMessage = undefined; // CON-Message that is sent as a reply to a CON-Response
			let responseTransmission = this.messagesInTransmissionSet.getResponseMessageTransmission(coapMessage.mid, remoteAddress, remotePort);
			if (responseTransmission !== undefined){
				// message is a duplicate
				Copper.Event.sendEvent(Copper.Event.createReceivedDuplicateCoapMessageEvent(coapMessage, parserWarnings, remoteAddress, remotePort, byteLength, this.endpointId));
				responseTransmission.retransmissionCounter++;
			}
			else {
				responseTransmission = new Copper.ResponseMessageTransmission(coapMessage, remoteAddress, remotePort);
				if (coapMessage.code.isResponseCode()) {
					// reponse to a previous request. should match using the token 
					let requestTransmission = this.getRequestMessageTransmissionForToken(coapMessage.token);
					if (requestTransmission !== undefined){
						Copper.Event.sendEvent(Copper.Event.createReceivedCoapMessageEvent(coapMessage, parserWarnings, remoteAddress, remotePort, byteLength, this.endpointId));
						completeRequestTransmission(requestTransmission, coapMessage);
						requestTransmission.requestHandler.handleResponse(requestTransmission.coapMessage, coapMessage, responseTransmission);
					}
					else {
						Copper.Event.sendEvent(Copper.Event.createReceivedUnknownCoapMessageEvent(coapMessage, parserWarnings, remoteAddress, remotePort, byteLength, this.endpointId));
						if (this.settings.rejectUnknown){
							responseTransmission.addResponse(Copper.CoapMessage.reset(coapMessage.mid, coapMessage.token));
						}
					}
				}
				else if (coapMessage.code.isRequestCode()) {
					let res = undefined;
					let i=0;
					while (res === undefined && i < this.requestCallbacks.length){
						let tmpRes = this.requestCallbacks[i](coapMessage, remoteAddress, remotePort);
						if (tmpRes !== undefined && (!(tmpRes instanceof Copper.CoapMessage)) || !tmpRes.code.isResponseCode()){
							throw new Error("Illegal return value from callback");
						}
						res = tmpRes;
						i++;
					}
					if (res !== undefined){
						Copper.Event.sendEvent(Copper.Event.createReceivedCoapMessageEvent(coapMessage, parserWarnings, remoteAddress, remotePort, byteLength, this.endpointId));
						if (Copper.CoapMessage.Type.CON.equals(responseTransmission.coapMessage.type) && 
							      !Copper.CoapMessage.Type.ACK.equals(res.type) && !Copper.CoapMessage.Type.RST.equals(res.type)){
							// add ACK for the CON message
							responseTransmission.addResponse(Copper.CoapMessage.ack(responseTransmission.coapMessage.mid, responseTransmission.coapMessage.token));
						}
						if (Copper.CoapMessage.Type.CON.equals(res.type)){
							responseCoapMessage = res;
						}
						else {
							responseTransmission.addResponse(res);
						}
					}
					else {
						Copper.Event.sendEvent(Copper.Event.createReceivedUnknownCoapMessageEvent(coapMessage, parserWarnings, remoteAddress, remotePort, byteLength, this.endpointId));
						if (this.settings.rejectUnknown){
							responseTransmission.addResponse(Copper.CoapMessage.reset(coapMessage.mid, coapMessage.token));
						}	
					}
				}
				else {
					Copper.Event.sendEvent(Copper.Event.createReceivedUnknownCoapMessageEvent(coapMessage, parserWarnings, remoteAddress, remotePort, byteLength, this.endpointId));
					if (this.settings.rejectUnknown){
						responseTransmission.addResponse(Copper.CoapMessage.reset(coapMessage.mid, coapMessage.token));
					}
				}
				this.messagesInTransmissionSet.addNewTransmission(responseTransmission);
			}
			for (let i=0; i<responseTransmission.responses.length; i++) {
				this.sendCoapMessageInternal(responseTransmission.responses[i], responseTransmission.remoteAddress, responseTransmission.remotePort, responseTransmission.retransmissionCounter);
			}
			if (responseCoapMessage !== undefined){
				if (!Copper.CoapMessage.Type.CON.equals(responseCoapMessage.type)){
					throw new Error("Illegal response message");
				}
				// create new transmission and send reliably
				this.sendCoapMessage(responseCoapMessage, undefined, true);
			}
		}
	} finally {
		this.isInResponseHandling = false;
	}
	this.processSendQueue();
};

// -------- Transmission Set Callbacks -----------
Copper.TransmissionHandler.prototype.onRetransmission = function(transmission){
	Copper.Log.logFine("Retransmit Transmission " + transmission.coapMessage.mid + " to " + this.remoteAddress + ":" + this.remotePort);
	this.sendCoapMessageInternal(transmission.coapMessage, this.remoteAddress, this.remotePort, transmission.retransmissionCounter);
};

Copper.TransmissionHandler.prototype.onTimeout = function(transmission){
	Copper.Log.logFine("Request Transmission " + transmission.coapMessage.mid + " to " + this.remoteAddress + ":" + this.remotePort + " has timeouted");
	Copper.Event.sendEvent(Copper.Event.createMessageTransmissionTimedOutEvent(transmission.coapMessage.mid, transmission.coapMessage.token, transmission.firstTransmissionStart, this.endpointId));
	if (transmission.requestHandler !== undefined){
		transmission.requestHandler.onTimeout();
	}
};

Copper.TransmissionHandler.prototype.onEndOfLife = function(transmission){
	if (transmission instanceof Copper.RequestMessageTransmission){
		Copper.Log.logFine("Request Transmission " + transmission.coapMessage.mid + " to " + this.remoteAddress + ":" + this.remotePort + " is end of life");
	}
	else {
		Copper.Log.logFine("Response Transmission " + transmission.coapMessage.mid + " from " + transmission.remoteAddress + ":" + transmission.remotePort + " is end of life");
	}
};

// -------- UDP Socket Callbacks -----------
Copper.TransmissionHandler.prototype.onReceiveDatagram = function(datagram, remoteAddress, remotePort){
	if (this.state !== Copper.TransmissionHandler.STATE_CLOSED){
		let result = Copper.CoapMessageSerializer.deserialize(datagram);
		if (result.error === undefined){
			this.handleReceivedCoapMessage(result.message, result.warnings, remoteAddress, remotePort, datagram.byteLength);
		}
		else {
			Copper.Event.sendEvent(Copper.Event.createReceivedParseErrorEvent(result.error, remoteAddress, remotePort, datagram.byteLength, this.endpointId));
		}
	}
};

Copper.TransmissionHandler.prototype.onReceiveDatagramError = function(socketOpen, errorMsg){
	if (this.state !== Copper.TransmissionHandler.STATE_CLOSED){
		Copper.Event.sendEvent(Copper.Event.createErrorOnServerEvent(Copper.Event.ERROR_RECEIVE, "Error while receiving: " + errorMsg, socketOpen, this.endpointId));
	}
};