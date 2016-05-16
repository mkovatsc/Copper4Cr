/* 
*  Port implementation for the chrome application
*/
Copper.ChromePort = function(port, id){
	if (!port || !Number.isInteger(id)){
		throw new Error("Illegal Arguments");
	}
	this.port = port;
	this.id = id;
	
	let thisRef = this;

	port.onMessage.addListener(function(msg){
		thisRef.onMessage(msg);
	});
	port.onDisconnect.addListener(function(){
		thisRef.onDisconnect();
	});
};

/* prototype */
Copper.ChromePort.prototype.port = undefined;
Copper.ChromePort.prototype.id = undefined;
Copper.ChromePort.prototype.disconnectCallback = undefined;

/*
* Register a callback of the that is called when the other port disconnects
* 
* @arg callback: callback of the form function()
*/ 
Copper.ChromePort.prototype.registerDisconnectCallback = function(callback) {
	if (typeof(callback) !== "function"){
		throw new Error("Illegal Arguments");
	}
	this.disconnectCallback = callback;
};

/*
* Send the message to the other port
*
* @arg: message in form of an event
*/ 
Copper.ChromePort.prototype.sendMessage = function(msg){
	if (!Number.isInteger(msg.type)){
		throw new Error("Illegal Arguments");
	}
	if (this.port !== undefined){
		this.port.postMessage(Copper.JsonUtils.stringify(msg));
	}
};

/* Implementation */
Copper.ChromePort.prototype.onMessage = function(msg){
	// Route message through event queue. Id is set as the endpoint id.
	msg = Copper.JsonUtils.parse(msg);
	msg.endpointId = this.id;
	Copper.Event.sendEvent(msg);
};

Copper.ChromePort.prototype.onDisconnect = function(){
	this.port = undefined;
	if (this.disconnectCallback !== undefined) this.disconnectCallback();
};