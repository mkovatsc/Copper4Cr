Copper.Event = function() {
};

Copper.Event.callbacks = [];
Copper.Event.queue = [];

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

Copper.Event.removeEventsForReceiver = function(receiver){
	if (receiver === undefined || !Number.isInteger(receiver)){
		throw new Error("Illegal Argument");
	}
	let oldQueue = this.queue;
	Copper.Event.queue = [];
	for (let i=0; i<oldQueue.length; i++){
		if (oldQueue[i].receiver !== receiver){
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
	let oldQueue = Copper.Event.queue;
	Copper.Event.queue = [];
	for (let i = 0; i < oldQueue.length; i++){
		let processed = false;
		for (let j = 0; j < this.callbacks.length; j++){
			processed = this.callbacks[j](oldQueue[i]) || processed;
		}
		if (!processed){
			Copper.Event.queue.push(oldQueue[i]);
		}
	}
};

Copper.Event.TYPE_ERROR = 1;
Copper.Event.TYPE_CLIENT_DISCONNECTED = 2;

Copper.Event.TYPE_REGISTER_CLIENT = 10;
Copper.Event.TYPE_CLIENT_REGISTERED = 11;
Copper.Event.TYPE_UNREGISTER_CLIENT = 12;

Copper.Event.TYPE_SEND_COAP_MESSAGE = 20;
Copper.Event.TYPE_COAP_MESSAGE_RECEIVED = 21;

Copper.Event.createEvent = function(type, data, receiver, sender){
	if (!Number.isInteger(receiver) || !Number.isInteger(sender)){
		throw new Error("Illegal Arguments");
	}
	let event = {
		type: type,
		data: data,
		receiver: receiver,
		sender: sender,
		timestamp: Date.now()
	};
	return event;
};

Copper.Event.createErrorEvent = function(errorMessage, endpointReady, receiver, sender){
	let data = {
		errorMessage: errorMessage,
		endpointReady: (endpointReady ? true : false)
	};
	return Copper.Event.createEvent(Copper.Event.TYPE_ERROR, data, receiver, sender);
};

Copper.Event.createClientDisconnectedEvent = function(receiver, sender){
	let data = {};
	return Copper.Event.createEvent(Copper.Event.TYPE_CLIENT_DISCONNECTED, data, receiver, sender);
};

Copper.Event.createRegisterClientEvent = function(remoteAddress, remotePort, receiver, sender){
	let data = {
		remoteAddress: remoteAddress,
		remotePort: remotePort
	};
	return Copper.Event.createEvent(Copper.Event.TYPE_REGISTER_CLIENT, data, receiver, sender);
};

Copper.Event.createClientRegisteredEvent = function(receiver, sender){
	let data = {};
	return Copper.Event.createEvent(Copper.Event.TYPE_CLIENT_REGISTERED, data, receiver, sender);
};