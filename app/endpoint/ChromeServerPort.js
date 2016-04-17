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

/*
* @arg remoteAddress
* @arg remotePort
* @return: udpclient which will send messages to the given host:port
* 
* Creation is on the prototype in order to use different UDP-Implemntations (testing, different browsers)
*/
Copper.ChromeServerPort.prototype.createUdpClient = function(remoteAddress, remotePort){
	return new ChromeUdpClient(remoteAddress, remotePort);
};

/*
* Disconnects the port and clears all resources
*/
Copper.ChromeServerPort.prototype.disconnect = function(){
	if (this.port !== undefined){
		this.port.disconnect();
		this.port = undefined;
	}
};


/* Implementation */
Copper.ChromeServerPort.prototype.onClientMessage = function(msg){
	// Route message through event queue. Id is set as the endpoint id.
	msg.receiver = this.id;
	msg.sender = msg.sender ? msg.sender : 0;
	Copper.Event.sendEvent(msg);
};

Copper.ChromeServerPort.prototype.onClientDisconnect = function(){
	Copper.Event.sendEvent(Copper.Event.createClientDisconnectedEvent(this.id));
};

Copper.ChromeServerPort.prototype.sendClientMessage = function(msg){
	if (!Number.isInteger(msg.type)){
		throw new Error("Illegal Arguments");
	}
	if (this.port !== undefined){
		delete msg.receiver;
		try {
			this.port.postMessage(msg);
		} catch (exception){
			this.onClientDisconnect();
		}
	}
};