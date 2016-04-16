Copper.Event = function() {
};

Copper.Event.listeners = [];

Copper.Event.registerListener = function(listener){
	if (!(typeof(listener.onEvent) === "function")){
		throw new Error("Illegal Arguments");
	}
	this.listeners.push(listener);
};

Copper.Event.send = function(type, data) {
	if (typeof(type) !== "string"){
		throw new Error("Illegal Arguments");
	}
	let event = {
		type: type,
		data: data
	};
	for (let i = 0; i < this.listeners.length; i++){
		this.listeners.onEvent(event);
	}
};

Copper.Event.TYPE_DATAGRAM_SENT;
Copper.Event.TYPE_DATAGRAM_RECEIVED;