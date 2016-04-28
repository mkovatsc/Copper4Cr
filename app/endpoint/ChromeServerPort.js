/* 
*  Port implementation for the chrome application
*/
Copper.ChromeServerPort = function(port, id){
	if (!port || !Number.isInteger(id)){
		throw new Error("Illegal Arguments");
	}
	this.port = port;
	this.id = id;
	
	let thisRef = this;

	port.onMessage.addListener(function(msg){
		thisRef.onClientMessage(msg);
	});
	port.onDisconnect.addListener(function(){
		thisRef.onClientDisconnect();
	});
};

/* prototype */
Copper.ChromeServerPort.prototype.port = undefined;
Copper.ChromeServerPort.prototype.id = undefined;
Copper.ChromeServerPort.prototype.disconnectCallback = undefined;

/*
* @return: udpclient which can be bound to a local port
* 
* Creation is on the port prototype in order to use different UDP-Implemntations (testing, different browsers)
*/
Copper.ChromeServerPort.prototype.createUdpClient = function(){
	return new Copper.ChromeUdpClient();
};

/*
* Register a callback of the that is called when the client port disconnects
* 
* @arg callback: callback of the form function()
*/ 
Copper.ChromeServerPort.prototype.registerDisconnectCallback = function(callback) {
	if (typeof(callback) !== "function"){
		throw new Error("Illegal Arguments");
	}
	this.disconnectCallback = callback;
};

/*
* Send the message to the client
*
* @arg: message in form of an event
*/ 
Copper.ChromeServerPort.prototype.sendClientMessage = function(msg){
	if (!Number.isInteger(msg.type)){
		throw new Error("Illegal Arguments");
	}
	if (this.port !== undefined){
		this.port.postMessage(Copper.Event.convertToJson(msg));
	}
};

/* Implementation */
Copper.ChromeServerPort.prototype.onClientMessage = function(msg){
	// Route message through event queue. Id is set as the endpoint id.
	msg = Copper.Event.createFromJson(msg);
	msg.endpointId = this.id;
	Copper.Event.sendEvent(msg);
};

Copper.ChromeServerPort.prototype.onClientDisconnect = function(){
	this.port = undefined;
	if (this.disconnectCallback !== undefined) this.disconnectCallback();
};