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
* Event queue for the Copper Application. A seperate queue is maintained for each unique endpointID. 
* Callbacks can be registered on such endpointIds and only get the messages for the corresponding endpoint
*/
Copper.Event = function() {
};

Copper.Event.callbacks = [];
Copper.Event.queue = [];
Copper.Event.isDispatching = false;

/*
* Registers a new callback for the given endpointId
*/
Copper.Event.registerCallback = function(callback, endpointId){
	if (!(typeof(callback) === "function") || !Number.isInteger(endpointId)){
		throw new Error("Illegal Arguments");
	}
	this.callbacks.push({
		endpointId: endpointId,
		callback: callback
	});
};

/*
* Removes the callback with the given endpointID
*/
Copper.Event.unregisterCallback = function(callback, endpointId){
	if (!(typeof(callback) === "function") || !Number.isInteger(endpointId)){
		throw new Error("Illegal Arguments");
	}
	let oldCallbacks = this.callbacks;
	this.callbacks = [];
	for (let i=0; i<oldCallbacks.length; i++){
		if (oldCallbacks[i].endpointId !== endpointId || oldCallbacks[i].callback !== callback){
			this.callbacks.push(oldCallbacks[i]);
		}
	}
};

/**
* Removes all events for a given endpointId
*/
Copper.Event.removeEventsForEndpoint = function(endpointId){
	if (!Number.isInteger(endpointId)){
		throw new Error("Illegal Argument");
	}
	let oldQueue = this.queue;
	Copper.Event.queue = [];
	for (let i=0; i<oldQueue.length; i++){
		if (oldQueue[i].endpointId !== endpointId){
			Copper.Event.queue.push(oldQueue[i]);
		}
	}
};

/*
* Adds a new event to the queue and dispatches the queue
*/
Copper.Event.sendEvent = function(event) {
	if (!Number.isInteger(event.type) || !Number.isInteger(event.endpointId)){
		throw new Error("Illegal Arguments");
	}
	Copper.Event.queue.push(event);
	Copper.Event.dispatchEvents();
};

/*
* Processes the event queue and dispatches the events to the registered callbacks (for the given endpoint-ID)
*/
Copper.Event.dispatchEvents = function(){
	if (!Copper.Event.isDispatching) {
		Copper.Event.isDispatching = true;
		try{
			while (Copper.Event.queue.length > 0) {
				let oldQueue = Copper.Event.queue;
				Copper.Event.queue = [];
				for (let i = 0; i < oldQueue.length; i++){
					let processed = false;
					for (let j = 0; j < this.callbacks.length; j++){
						if (this.callbacks[j].endpointId === oldQueue[i].endpointId){
							try {
								processed = this.callbacks[j].callback(oldQueue[i]) || processed;
							} catch (exception){
								Copper.Log.logError("Error when dispatching event " + oldQueue[i].type + ":" + exception.stack);
							}
						}
					}
					if (!processed){
						Copper.Log.logWarning("Unprocessed event for endpointId " + oldQueue[i].endpointId + ": " + oldQueue[i].type);
					}
				}
			}
		} finally {
			Copper.Event.isDispatching = false;
		}
	}
};

// ------------ Event types ------------

Copper.Event.TYPE_ERROR_ON_SERVER = 1;
Copper.Event.ERROR_GENERAL = 10;
Copper.Event.ERROR_ILLEGAL_STATE = 11;
Copper.Event.ERROR_ILLEGAL_ARGUMENT = 12;
Copper.Event.ERROR_BIND = 13;
Copper.Event.ERROR_SEND = 14;
Copper.Event.ERROR_RECEIVE = 15;

Copper.Event.TYPE_REGISTER_CLIENT = 20;
Copper.Event.TYPE_CLIENT_REGISTERED = 21;
Copper.Event.TYPE_UNREGISTER_CLIENT = 22;
Copper.Event.TYPE_UPDATE_SETTINGS = 23;

Copper.Event.TYPE_COAP_MESSAGE_SENT = 30;
Copper.Event.TYPE_MESSAGE_TRANSMISSION_TIMED_OUT = 31;
Copper.Event.TYPE_MESSAGE_TRANSMISSION_CONFIRMED = 32;
Copper.Event.TYPE_MESSAGE_TRANSMISSION_COMPLETED = 33;

Copper.Event.TYPE_COAP_MESSAGE_RECEIVED = 40;
Copper.Event.TYPE_UNKNOWN_COAP_MESSAGE_RECEIVED = 41;
Copper.Event.TYPE_DUPLICATE_COAP_MESSAGE_RECEIVED = 42;
Copper.Event.TYPE_RECEIVED_PARSE_ERROR = 43;

Copper.Event.TYPE_SEND_COAP_MESSAGE = 50;
Copper.Event.TYPE_REQUEST_COMPLETED = 51;
Copper.Event.TYPE_OBSERVE_REQUEST_FRESH = 52;
Copper.Event.TYPE_OBSERVE_REQUEST_OUT_OF_ORDER = 53;
Copper.Event.TYPE_REQUEST_RECEIVE_ERROR = 54;
Copper.Event.TYPE_REQUEST_TIMEOUT = 55;
Copper.Event.TYPE_CANCEL_REQUESTS = 56;
Copper.Event.TYPE_REQUEST_CANCELED = 57;

// ---------- Factories ---------------

Copper.Event.createEvent = function(type, data, endpointId){
	if (!Number.isInteger(type) || !Number.isInteger(endpointId)){
		throw new Error("Illegal Arguments");
	}
	let event = {
		type: type,
		data: data,
		endpointId: endpointId,
		timestamp: Copper.TimeUtils.now()
	};
	return event;
};

Copper.Event.createErrorOnServerEvent = function(errorType, errorMessage, endpointReady, endpointId){
	if (!Number.isInteger(errorType)){
		throw new Error("Illegal Arguments");
	}
	let data = {
		errorType: errorType,
		errorMessage: errorMessage,
		endpointReady: (endpointReady ? true : false)
	};
	return Copper.Event.createEvent(Copper.Event.TYPE_ERROR_ON_SERVER, data, endpointId);
};

Copper.Event.createRegisterClientEvent = function(remoteAddress, remotePort, settings, endpointId){
	let data = {
		remoteAddress: remoteAddress,
		remotePort: remotePort,
		settings: settings
	};
	return Copper.Event.createEvent(Copper.Event.TYPE_REGISTER_CLIENT, data, endpointId);
};

Copper.Event.createClientRegisteredEvent = function(port, endpointId){
	let data = {
		port: port
	};
	return Copper.Event.createEvent(Copper.Event.TYPE_CLIENT_REGISTERED, data, endpointId);
};

Copper.Event.createClientUnregisterEvent = function(endpointId){
	let data = {};
	return Copper.Event.createEvent(Copper.Event.TYPE_UNREGISTER_CLIENT, data, endpointId);
};

Copper.Event.createUpdateSettingsEvent = function(settings, endpointId){
	let data = {
		settings: settings
	};
	return Copper.Event.createEvent(Copper.Event.TYPE_UPDATE_SETTINGS, data, endpointId);
};

Copper.Event.createCoapMessageSentEvent = function(coapMessage, bytesSent, retransmissionCount, endpointId){
	let data = {
		coapMessage: coapMessage,
		bytesSent: bytesSent,
		retransmissionCount: retransmissionCount
	};
	return Copper.Event.createEvent(Copper.Event.TYPE_COAP_MESSAGE_SENT, data, endpointId);
};

Copper.Event.createMessageTransmissionTimedOutEvent = function(mid, token, firstTransmissionTime, endpointId){
	let data = {
		mid: mid,
		token: token,
		firstTransmissionTime: firstTransmissionTime
	};
	return Copper.Event.createEvent(Copper.Event.TYPE_MESSAGE_TRANSMISSION_TIMED_OUT, data, endpointId);
};

Copper.Event.createMessageTransmissionConfirmedEvent = function(coapMessage, rtt, endpointId){
	let data = {
		coapMessage: coapMessage,
		rtt: rtt
	};
	return Copper.Event.createEvent(Copper.Event.TYPE_MESSAGE_TRANSMISSION_CONFIRMED, data, endpointId);
};

Copper.Event.createMessageTransmissionCompletedEvent = function(requestCoapMessage, responseCoapMessage, transactionTime, endpointId){
	let data = {
		requestCoapMessage: requestCoapMessage,
		responseCoapMessage: responseCoapMessage,
		transactionTime: transactionTime
	};
	return Copper.Event.createEvent(Copper.Event.TYPE_MESSAGE_TRANSMISSION_COMPLETED, data, endpointId);
};

Copper.Event.createReceivedCoapMessageEvent = function(coapMessage, parserWarnings, remoteAddress, remotePort, byteLength, endpointId){
	let data = {
		coapMessage: coapMessage,
		parserWarnings: parserWarnings,
		remoteAddress: remoteAddress,
		remotePort: remotePort,
		byteLength: byteLength
	};
	return Copper.Event.createEvent(Copper.Event.TYPE_COAP_MESSAGE_RECEIVED, data, endpointId);
};

Copper.Event.createReceivedUnknownCoapMessageEvent = function(coapMessage, parserWarnings, remoteAddress, remotePort, byteLength, endpointId){
	let data = {
		coapMessage: coapMessage,
		parserWarnings: parserWarnings,
		remoteAddress: remoteAddress,
		remotePort: remotePort,
		byteLength: byteLength
	};
	return Copper.Event.createEvent(Copper.Event.TYPE_UNKNOWN_COAP_MESSAGE_RECEIVED, data, endpointId);
};

Copper.Event.createReceivedDuplicateCoapMessageEvent = function(coapMessage, parserWarnings, remoteAddress, remotePort, byteLength, endpointId){
	let data = {
		coapMessage: coapMessage,
		parserWarnings: parserWarnings,
		remoteAddress: remoteAddress,
		remotePort: remotePort,
		byteLength: byteLength
	};
	return Copper.Event.createEvent(Copper.Event.TYPE_DUPLICATE_COAP_MESSAGE_RECEIVED, data, endpointId);
};

Copper.Event.createReceivedParseErrorEvent = function(parserError, remoteAddress, remotePort, byteLength, endpointId){
	let data = {
		parserError: parserError,
		remoteAddress: remoteAddress,
		remotePort: remotePort,
		byteLength: byteLength
	};
	return Copper.Event.createEvent(Copper.Event.TYPE_RECEIVED_PARSE_ERROR, data, endpointId);
};

Copper.Event.createClientSendCoapMessageEvent = function(coapMessage, blockwiseEnabled, endpointId){
	let data = {
		coapMessage: coapMessage,
		blockwiseEnabled: (blockwiseEnabled ? true : false)
	};
	return Copper.Event.createEvent(Copper.Event.TYPE_SEND_COAP_MESSAGE, data, endpointId);
};

Copper.Event.createRequestCompletedEvent = function(requestCoapMessage, responseCoapMessage, requestDuration, endpointId){
	let data = {
		requestCoapMessage: requestCoapMessage,
		responseCoapMessage: responseCoapMessage,
		requestDuration: requestDuration
	};
	return Copper.Event.createEvent(Copper.Event.TYPE_REQUEST_COMPLETED, data, endpointId);
};

Copper.Event.createObserveRequestFreshEvent = function(requestCoapMessage, freshCoapMessage, lastMessageTimestamp, lastMessageSeqNumber, endpointId){
	let data = {
		requestCoapMessage: requestCoapMessage,
		freshCoapMessage: freshCoapMessage,
		lastMessageTimestamp: lastMessageTimestamp,
		lastMessageSeqNumber: lastMessageSeqNumber
	};
	return Copper.Event.createEvent(Copper.Event.TYPE_OBSERVE_REQUEST_FRESH, data, endpointId);
};

Copper.Event.createObserveRequestOutOfOrderEvent = function(requestCoapMessage, outOfOrderCoapMessage, lastMessageTimestamp, lastMessageSeqNumber, endpointId){
	let data = {
		requestCoapMessage: requestCoapMessage,
		outOfOrderCoapMessage: outOfOrderCoapMessage,
		lastMessageTimestamp: lastMessageTimestamp,
		lastMessageSeqNumber: lastMessageSeqNumber
	};
	return Copper.Event.createEvent(Copper.Event.TYPE_OBSERVE_REQUEST_OUT_OF_ORDER, data, endpointId);
};

Copper.Event.createRequestReceiveErrorEvent = function(requestCoapMessage, endpointId){
	let data = {
		requestCoapMessage: requestCoapMessage
	};
	return Copper.Event.createEvent(Copper.Event.TYPE_REQUEST_RECEIVE_ERROR, data, endpointId);
};

Copper.Event.createRequestTimeoutEvent = function(requestCoapMessage, endpointId){
	let data = {
		requestCoapMessage: requestCoapMessage
	};
	return Copper.Event.createEvent(Copper.Event.TYPE_REQUEST_TIMEOUT, data, endpointId);
};

Copper.Event.createCancelRequestEvent = function(endpointId){
	let data = {
	};
	return Copper.Event.createEvent(Copper.Event.TYPE_CANCEL_REQUESTS, data, endpointId);
};

Copper.Event.createRequestCanceledEvent = function(requestCoapMessage, endpointId){
	let data = {
		requestCoapMessage: requestCoapMessage
	};
	return Copper.Event.createEvent(Copper.Event.TYPE_REQUEST_CANCELED, data, endpointId);
};

Copper.Event.convertToJson = function(event){
	if (event.data !== undefined && event.data.coapMessage instanceof Copper.CoapMessage){
		event.data.coapMessage = Copper.ByteUtils.convertBytesToJson(Copper.CoapMessageSerializer.serialize(event.data.coapMessage));
	}
	return JSON.stringify(event);
};

Copper.Event.createFromJson = function(json){
	let event = JSON.parse(json);
	if (event.data !== undefined && typeof(event.data.coapMessage) === "string"){
		event.data.coapMessage = Copper.CoapMessageSerializer.deserialize(Copper.ByteUtils.convertJsonToBytes(event.data.coapMessage)).message;
	}
	return event;
};
