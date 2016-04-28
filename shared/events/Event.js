Copper.Event = function() {
};

Copper.Event.callbacks = [];
Copper.Event.queue = [];
Copper.Event.isDispatching = false;

Copper.Event.registerCallback = function(callback){
	if (!(typeof(callback) === "function")){
		throw new Error("Illegal Arguments");
	}
	if (this.callbacks.indexOf(callback) > -1){
		throw new Error("Callback already registered");
	}
	this.callbacks.push(callback);
};

Copper.Event.unregisterCallback = function(callback){
	if (!(typeof(callback) === "function")){
		throw new Error("Illegal Arguments");
	}
	let index = this.callbacks.indexOf(callback);
	if (index > -1){
		this.callbacks.splice(index, 1);
	}
};

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

Copper.Event.sendEvent = function(event) {
	if (!Number.isInteger(event.type)){
		throw new Error("Illegal Arguments");
	}
	Copper.Event.queue.push(event);
	Copper.Event.dispatchEvents();
};

Copper.Event.dispatchEvents = function(){
	if (!Copper.Event.isDispatching){
		Copper.Event.isDispatching = true;
		let oldQueue = Copper.Event.queue;
		Copper.Event.queue = [];
		for (let i = 0; i < oldQueue.length; i++){
			let processed = false;
			for (let j = 0; j < this.callbacks.length; j++){
				processed = this.callbacks[j](oldQueue[i]) || processed;
			}
			if (!processed){
				Copper.Log.logWarning("Unprocessed event for endpointId " + oldQueue[i].endpointId + ": " + oldQueue[i].type);
			}
		}
		Copper.Event.isDispatching = false;
	}
};

Copper.Event.TYPE_ERROR = 1;

Copper.Event.TYPE_REGISTER_CLIENT = 10;
Copper.Event.TYPE_CLIENT_REGISTERED = 11;
Copper.Event.TYPE_UNREGISTER_CLIENT = 12;

Copper.Event.TYPE_SEND_COAP_MESSAGE = 20;
Copper.Event.TYPE_COAP_MESSAGE_SENT = 21;

Copper.Event.TYPE_COAP_MESSAGE_RECEIVED = 30;

Copper.Event.createEvent = function(type, data, endpointId){
	if (!Number.isInteger(type) || !Number.isInteger(endpointId)){
		throw new Error("Illegal Arguments");
	}
	let event = {
		type: type,
		data: data,
		endpointId: endpointId,
		timestamp: Date.now()
	};
	return event;
};

Copper.Event.createErrorEvent = function(errorMessage, endpointReady, endpointId){
	let data = {
		errorMessage: errorMessage,
		endpointReady: (endpointReady ? true : false)
	};
	return Copper.Event.createEvent(Copper.Event.TYPE_ERROR, data, endpointId);
};

Copper.Event.createRegisterClientEvent = function(remoteAddress, remotePort, endpointId){
	let data = {
		remoteAddress: remoteAddress,
		remotePort: remotePort
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

Copper.Event.createClientSendCoapMessageEvent = function(coapMessage, endpointId){
	let data = {
		coapMessage: coapMessage
	};
	return Copper.Event.createEvent(Copper.Event.TYPE_SEND_COAP_MESSAGE, data, endpointId);
};

Copper.Event.createCoapMessageSentEvent = function(coapMessage, bytesSent, endpointId){
	let data = {
		coapMessage: coapMessage,
		bytesSent: bytesSent
	};
	return Copper.Event.createEvent(Copper.Event.TYPE_COAP_MESSAGE_SENT, data, endpointId);
};

Copper.Event.createReceivedCoapMessageEvent = function(coapMessage, parserWarnings, parserError, remoteAddress, remotePort, byteLength, endpointId){
	let data = {
		coapMessage: coapMessage,
		parserWarnings: parserWarnings,
		parserError: parserError,
		remoteAddress: remoteAddress,
		remotePort: remotePort,
		byteLength: byteLength
	};
	return Copper.Event.createEvent(Copper.Event.TYPE_COAP_MESSAGE_RECEIVED, data, endpointId);
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