/* 
*  Server Endpoint for one given client (e.g. extension or page)
*
*  The following state transitions are legal
*
*     STATE_CONNECTED            (Register)
*          |  Λ
* register |  | unregister
*          V  |
*  STATE_UDP_SOCKET_READY        (Send, Receive, Unregister, Disconnect)
*             |
* disconnect  |
*             V
*   STATE_DISCONNECTED
*/
Copper.ServerEndpoint = function(port, id){
	if (!port || !Number.isInteger(id)){
		throw new Error("Illegal Arguments");
	}
	this.port = port;
	this.id = id;
	
	let thisRef = this;

	this.eventCallback = function(event){
		thisRef.dispatchEvent(event);
	};
	Copper.Event.registerCallback(this.eventCallback);

	this.state = Copper.Endpoint.STATE_CONNECTED;
	Copper.Log.logFine("Server Endpoint " + id + " created");
};

/* State constants */
Copper.ServerEndpoint.STATE_CONNECTED = 0;
Copper.ServerEndpoint.STATE_UDP_SOCKET_READY = 1;
Copper.ServerEndpoint.STATE_DISCONNECTED = 2;

/* prototype */
Copper.ServerEndpoint.prototype.port = undefined;
Copper.ServerEndpoint.prototype.id = undefined;
Copper.ServerEndpoint.prototype.state = undefined;
Copper.ServerEndpoint.prototype.udpClient = undefined;
Copper.ServerEndpoint.prototype.eventCallback = undefined;

Copper.ServerEndpoint.prototype.dispatchEvent = function(event){
	if (!Number.isInteger(event.type)){
		throw new Error("Illegal Arguments");
	}
	if (event.receiver === this.id){
		try {
			switch(event.type){
				case Copper.Event.TYPE_ERROR:
					Copper.Log.logError("Error on endpoint " + this.id + ": " + event.data.errorMessage);
					break;
				case Copper.Event.TYPE_CLIENT_DISCONNECTED:
					this.onDisconnect();
					break;
				case Copper.Event.TYPE_REGISTER_CLIENT:
					this.onRegisterClient(event.data.remoteAddress, event.data.remotePort);
					break;

				default:
					Copper.Log.logWarning("Unknown event type " + event.type);
					break;
			}
		} catch (exception) {
			this.onServerEndpointException(exception, event.sender);
		}
		return true;
	}
};

Copper.ServerEndpoint.prototype.onServerEndpointException = function(exception, receiver){
	Copper.Log.logError("Error on endpoint " + this.id + ": " + exception.message);
	this.port.sendClientMessage(Copper.Event.createErrorEvent(exception.message, false, receiver, this.id));
	this.onDisconnect();
};

Copper.ServerEndpoint.prototype.onDisconnect = function(){
	if (this.state !== Copper.ServerEndpoint.STATE_DISCONNECTED){
		this.state = Copper.ServerEndpoint.STATE_DISCONNECTED;
		if (this.udpClient !== undefined){
			this.udpClient.close();
			this.udpClient = undefined;
		}
		Copper.Event.removeEventsForReceiver(this.id);
		Copper.Event.unregisterCallback(this.eventCallback);
		Copper.Log.logFine("Server Endpoint " + id + " closed");
		this.port.disconnect();
		this.port = undefined;
	}
};

Copper.ServerEndpoint.prototype.onRegisterClient = function(remoteAddress, remotePort, receiver){
	if (this.state !== Copper.ServerEndpoint.STATE_CONNECTED){
		this.port.sendClientMessage(Copper.Event.createErrorEvent("Illegal State", this.state === Copper.ServerEndpoint.STATE_UDP_SOCKET_READY, receiver, this.id));
	}
	else if (this.udpClient !== undefined){
		// we are already connecting
		this.port.sendClientMessage(Copper.Event.createErrorEvent("Illegal State", true, receiver, this.id));
	}
	else {
		this.udpClient = this.port.createUdpClient(remoteAddress, remotePort);
		let thisRef = this;
		this.udpClient.bind(function(bindSuccessful){
								if (bindSuccessful){
									this.state = Copper.ServerEndpoint.STATE_UDP_SOCKET_READY;
									this.port.sendClientMessage(Copper.Event.createClientRegisteredEvent(receiver, this.id));
								}
								else {
									this.port.sendClientMessage(Copper.Event.createErrorEvent("Error creating the socket", false, receiver, this.id))
								}
							},
							function(datagram, remoteAddress, remotePort){
								thisRef.onReceiveDatagram(datagram, remoteAddress, remotePort);
							},
							function(socketOpen){
								thisRef.onReceiveDatagramError(socketOpen);
							}
		);
	}
};

Copper.ServerEndpoint.prototype.onReceiveDatagram = function(datagram, remoteAddress, remotePort){

};

Copper.ServerEndpoint.prototype.onReceiveDatagramError = function(socketOpen){

};