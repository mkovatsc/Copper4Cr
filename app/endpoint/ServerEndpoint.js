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
	this.id = id;
	this.port = port;
	
	let thisRef = this;

	this.port.registerDisconnectCallback(function(){
		thisRef.handleClientDisconnected();
	});

	this.eventCallback = function(event){
		return thisRef.dispatchEvent(event);
	};
	Copper.Event.registerCallback(this.eventCallback);

	this.state = Copper.ServerEndpoint.STATE_CONNECTED;
	Copper.Log.logFine("Server Endpoint " + this.id + " created");
};

/* State constants */
Copper.ServerEndpoint.STATE_CONNECTED = 0;
Copper.ServerEndpoint.STATE_UDP_SOCKET_READY = 1;
Copper.ServerEndpoint.STATE_DISCONNECTED = 2;

/* prototype */
Copper.ServerEndpoint.prototype.port = undefined;
Copper.ServerEndpoint.prototype.id = undefined;
Copper.ServerEndpoint.prototype.state = undefined;
Copper.ServerEndpoint.prototype.transactionHandler = undefined;
Copper.ServerEndpoint.prototype.eventCallback = undefined;


/* Callbacks */
/* Callback for the Copper event queue */
Copper.ServerEndpoint.prototype.dispatchEvent = function(event){
	if (!Number.isInteger(event.type)){
		throw new Error("Illegal Arguments");
	}
	if (event.endpointId === this.id){
		try {
			switch(event.type){
				case Copper.Event.TYPE_ERROR:
					return this.onError(event.data.errorMessage, event.data.endpointReady);

				case Copper.Event.TYPE_REGISTER_CLIENT:
					return this.onRegisterClient(event.data.remoteAddress, event.data.remotePort);
				case Copper.Event.TYPE_CLIENT_REGISTERED:
					this.state = Copper.ServerEndpoint.STATE_UDP_SOCKET_READY;
					this.port.sendClientMessage(event);
					return true;
				case Copper.Event.TYPE_UNREGISTER_CLIENT:
					return this.onUnregisterClient();

				case Copper.Event.TYPE_SEND_COAP_MESSAGE:
					return this.onClientSendCoapMessage(event.data.coapMessage);
				case Copper.Event.TYPE_COAP_MESSAGE_SENT:
					this.port.sendClientMessage(event);
					return true;

				case Copper.Event.TYPE_COAP_MESSAGE_RECEIVED:
					this.port.sendClientMessage(event);
					return true;

				default:
					Copper.Log.logWarning("Unknown event type " + event.type);
					return false;
			}
		} catch (exception) {
			Copper.Log.logError("Error on endpoint " + this.id + ": " + exception.message);
			return this.onError("Endpoint Error: " + exception.message, false);
		}
	}
};

/* Callback for the server port (called when the client disconnects) */
Copper.ServerEndpoint.prototype.handleClientDisconnected = function(){
	if (this.state === Copper.ServerEndpoint.STATE_UDP_SOCKET_READY){
		this.transactionHandler.close();
		this.transactionHandler = undefined;
	}
	if (this.state !== Copper.ServerEndpoint.STATE_DISCONNECTED){
		this.state = Copper.ServerEndpoint.STATE_DISCONNECTED;
		Copper.Event.removeEventsForEndpoint(this.id);
		Copper.Event.unregisterCallback(this.eventCallback);
		Copper.Log.logFine("Server Endpoint " + this.id + " closed");
	}
};

/* Implementation of the different events */
Copper.ServerEndpoint.prototype.onError = function(errorMessage, endpointReady){
	if (this.state === Copper.ServerEndpoint.STATE_UDP_SOCKET_READY && !endpointReady){
		this.transactionHandler.close();
		this.transactionHandler = undefined;
		this.state = Copper.ServerEndpoint.STATE_CONNECTED;
	}
	this.port.sendClientMessage(Copper.Event.createErrorEvent(errorMessage, endpointReady, this.id));
	return true;
};

Copper.ServerEndpoint.prototype.onRegisterClient = function(remoteAddress, remotePort){
	if (this.state !== Copper.ServerEndpoint.STATE_CONNECTED){
		this.onError("Illegal State", this.state === Copper.ServerEndpoint.STATE_UDP_SOCKET_READY);
	}
	else {
		this.transactionHandler = new Copper.TransactionHandler(this.port.createUdpClient(), remoteAddress, remotePort, this.id);
		this.transactionHandler.bind();
	}
	return true;
};

Copper.ServerEndpoint.prototype.onUnregisterClient = function(){
	if (this.state !== Copper.ServerEndpoint.STATE_UDP_SOCKET_READY){
		this.onError("Illegal State", false);
	}
	else {
		this.transactionHandler.close();
		this.transactionHandler = undefined;
		this.state = Copper.ServerEndpoint.STATE_CONNECTED;
		Copper.Log.logFine("Server Endpoint " + this.id + ": Client unregistered");
	}
	return true;
};

Copper.ServerEndpoint.prototype.onClientSendCoapMessage = function(coapMessage){
	if (this.state !== Copper.ServerEndpoint.STATE_UDP_SOCKET_READY){
		this.onError("Illegal State", false);
	}
	else {
		this.transactionHandler.sendCoapMessage(coapMessage);
	}
	return true;
};