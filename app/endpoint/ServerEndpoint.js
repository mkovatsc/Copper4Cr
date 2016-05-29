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
	Copper.Event.registerCallback(this.eventCallback, this.id);

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
	try {
		switch(event.type){
			case Copper.Event.TYPE_ERROR_ON_SERVER:
				return this.onError(event.data.errorType, event.data.errorMessage, event.data.endpointReady);

			case Copper.Event.TYPE_REGISTER_CLIENT:
				return this.onRegisterClient(event.data.remoteAddress, event.data.remotePort, event.data.settings);
			case Copper.Event.TYPE_CLIENT_REGISTERED:
				this.state = Copper.ServerEndpoint.STATE_UDP_SOCKET_READY;
				this.port.sendMessage(event);
				return true;
			case Copper.Event.TYPE_UNREGISTER_CLIENT:
				return this.onUnregisterClient();
			case Copper.Event.TYPE_UPDATE_SETTINGS:
				return this.onUpdateSettings(event.data.settings);

			case Copper.Event.TYPE_SEND_COAP_MESSAGE:
				return this.onClientSendCoapMessage(event.data.coapMessage);
			case Copper.Event.TYPE_COAP_MESSAGE_SENT:
			case Copper.Event.TYPE_COAP_MESSAGE_TIMED_OUT:
			case Copper.Event.TYPE_MESSAGE_CONFIRMED:
			case Copper.Event.TYPE_REQUEST_COMPLETED:
				this.port.sendMessage(event);
				return true;

			case Copper.Event.TYPE_COAP_MESSAGE_RECEIVED:
			case Copper.Event.TYPE_UNKNOWN_COAP_MESSAGE_RECEIVED:
			case Copper.Event.TYPE_DUPLICATE_COAP_MESSAGE_RECEIVED:
			case Copper.Event.TYPE_RECEIVED_PARSE_ERROR:
				this.port.sendMessage(event);
				return true;
							

			default:
				Copper.Log.logWarning("Unknown event type " + event.type);
				return false;
		}
	} catch (exception) {
		Copper.Log.logError("Error on endpoint " + this.id + ": " + exception.stack);
		return this.onError(Copper.Event.ERROR_GENERAL, "Endpoint Error: " + exception.message, false);
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
		Copper.Event.unregisterCallback(this.eventCallback, this.id);
		Copper.Log.logFine("Server Endpoint " + this.id + " closed");
	}
};

/* Implementation of the different events */
Copper.ServerEndpoint.prototype.onError = function(errorType, errorMessage, endpointReady){
	if (this.state === Copper.ServerEndpoint.STATE_UDP_SOCKET_READY && !endpointReady){
		this.transactionHandler.close();
		this.transactionHandler = undefined;
		this.state = Copper.ServerEndpoint.STATE_CONNECTED;
	}
	this.port.sendMessage(Copper.Event.createErrorOnServerEvent(errorType, errorMessage, endpointReady, this.id));
	return true;
};

Copper.ServerEndpoint.prototype.onRegisterClient = function(remoteAddress, remotePort, settings){
	if (this.state !== Copper.ServerEndpoint.STATE_CONNECTED){
		this.onError(Copper.Event.ERROR_ILLEGAL_STATE, "Illegal State", this.state === Copper.ServerEndpoint.STATE_UDP_SOCKET_READY);
	}
	else {
		this.transactionHandler = new Copper.TransactionHandler(Copper.ComponentFactory.createUdpClient(), remoteAddress, remotePort, settings, this.id);
		this.transactionHandler.bind();
	}
	return true;
};

Copper.ServerEndpoint.prototype.onUnregisterClient = function(){
	if (this.state !== Copper.ServerEndpoint.STATE_UDP_SOCKET_READY){
		this.onError(Copper.Event.ERROR_ILLEGAL_STATE, "Illegal State", false);
	}
	else {
		this.transactionHandler.close();
		this.transactionHandler = undefined;
		this.state = Copper.ServerEndpoint.STATE_CONNECTED;
		Copper.Log.logFine("Server Endpoint " + this.id + ": Client unregistered");
	}
	return true;
};

Copper.ServerEndpoint.prototype.onUpdateSettings = function(settings){
	if (this.transactionHandler !== undefined){
		this.transactionHandler.updateSettings(settings);
	}
	return true;
};

Copper.ServerEndpoint.prototype.onClientSendCoapMessage = function(coapMessage){
	if (this.state !== Copper.ServerEndpoint.STATE_UDP_SOCKET_READY){
		this.onError(Copper.Event.ERROR_ILLEGAL_STATE, "Illegal State", false);
	}
	else {
		new Copper.SingleRequestHandler(coapMessage, this.transactionHandler, this.transactionHandler.settings, this.id);
	}
	return true;
};