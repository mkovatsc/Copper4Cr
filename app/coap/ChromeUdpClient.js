/* Implementation of the UDP Client interface for the Copper Chrome Application. 
*
*  Should be used in the following cycle:
*  1. let udp = new Copper.ChromeUdpClient(string remotehost, number remoteport, Copper.Options options)
*  2. udp.bind(function onReady)
*  3. udp.addCallback(function onReceive)
*  4. udp.send(datagram)
*  5. udp.shutdown()
*/


Copper.ChromeUdpClient = function(remotehost, remoteport, options){
	if (!remotehost || !remoteport) {
		throw new Error();
	}
	this.remotehost = remotehost;
	this.remoteport = remoteport;
	this.options = options ? options : new Copper.Options();
}

/* State Constants */
Copper.ChromeUdpClient.STATE_CREATED = 0;
Copper.ChromeUdpClient.STATE_READY = 1;
Copper.ChromeUdpClient.STATE_STOPPED = 2;

/* Properties */
Copper.ChromeUdpClient.prototype.remotehost = undefined;
Copper.ChromeUdpClient.prototype.remoteport = undefined;
Copper.ChromeUdpClient.prototype.options = undefined;
Copper.ChromeUdpClient.prototype.callbacks = [];
Copper.ChromeUdpClient.prototype.state = Copper.ChromeUdpClient.STATE_CREATED;

/* SocketId (set while socket is bind) */
Copper.ChromeUdpClient.prototype.socketId = undefined;

/* Binds the socket to a local port. Calls onReady function once the socket is ready
*  @param function onReady
*/
Copper.ChromeUdpClient.prototype.bind = function(onReady){
	let thisRef = this;

	chrome.sockets.udp.create(null, function(createInfo){
		thisRef.socketId = createInfo.socketId;

		chrome.sockets.udp.onReceive.addListener(function(info){
			thisRef.onReceive(info);
		});
		chrome.sockets.udp.onReceiveError.addListener(function(info){
			thisRef.onReceiveError(info);
		});
		
		chrome.sockets.udp.bind(createInfo.socketId, "0.0.0.0", 0, function(resultCode){
			if (resultCode < 0){
				Copper.LogUtil.logError("Error " + resultCode + " while binding udp socket.", thisRef.options)
			}
			else {
				thisRef.state = Copper.ChromeUdpClient.STATE_READY;
				onReady();
			}
		});
	});
};

/* Adds a callback which is called if data is received. Callback should take a datagram as an argument 
*  @param function callback*/
Copper.ChromeUdpClient.prototype.addCallback = function(callback){
	this.callbacks.push(callback);
};

/* Sends a datagram */
Copper.ChromeUdpClient.prototype.send = function(datagram){
	if (this.state === Copper.ChromeUdpClient.STATE_STOPPED){
		return false;
	}
	else if (this.state !== Copper.ChromeUdpClient.STATE_READY){
		throw new Error("Socket not ready");
	}
	else {
		// TODO: datagram conversion
		let thisRef = this;
		let data = new ArrayBuffer(12);
		let dataView = new DataView(data);
		dataView.setInt32(0, 0x626c6168);
		chrome.sockets.udp.send(this.socketId, data, this.remotehost, this.remoteport, function(sendInfo){
			if (sendInfo.resultCode < 0){
				Copper.LogUtil.logError("Error " + sendInfo.resultCode + " while sending data on udp socket.", thisRef.options)
			}
		});
		return true;
	}
};

/* Closes the socket, releases resources */
Copper.ChromeUdpClient.prototype.shutdown = function() {
	this.state = Copper.ChromeUdpClient.STATE_STOPPED;
	chrome.sockets.udp.close(this.socketId, function(){
		this.socketId = undefined;
	});
};


/* ------ Implementation -------- */
Copper.ChromeUdpClient.prototype.onReceive = function(info){
	if (info.socketId == this.socketId){
		Copper.LogUtil.logInfo("Received " + info.data.byteLength + " bytes from " + info.remoteAddress + ":" + info.remotePort, this.options);
		let dataView = new DataView(info.data);
		Copper.LogUtil.logInfo("Received: " + dataView.getInt32(0).toString(16), this.options);
		// TODO: callbacks
	}
};

Copper.ChromeUdpClient.prototype.onReceiveError = function(info){
	if (info.socketId == this.socketId){
		Copper.LogUtil.logError("Error " + info.resultCode + " while receiving data on udp socket.", this.options)
	}
};