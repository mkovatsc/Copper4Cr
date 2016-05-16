/* Implementation of a simple UDP Client interface for sending and receiving plain datagrams. 
*  The following methods are provided:
*
*  -> bind(function onBind, function onReceive, function onReceiveError)
*  -> send(ArrayBuffer datagram, string remoteAddress, int remotePort, function onSent)
*  -> close()
*/

Copper.ChromeUdpClient = function(){
}

/* Callbacks */
Copper.ChromeUdpClient.prototype.onReceiveCallback = undefined;
Copper.ChromeUdpClient.prototype.onReceiveErrorCallback = undefined;

/* SocketId (set while socket is bind) */
Copper.ChromeUdpClient.prototype.socketId = undefined;

/* Binds the socket to a local port. Calls onBind function once the socket is bound.
*  @arg function onBind(boolean socketReady, int port, string errorMsg)
*  @arg function onReceive(ArrayBuffer datagram, string remoteAddress, int remotePort)
*  @arg function onReceiveError(boolean socketReady, string errorMsg)
*/
Copper.ChromeUdpClient.prototype.bind = function(onBind, onReceive, onReceiveError){
	if (typeof(onBind) !== "function" || typeof(onReceive) !== "function" || typeof(onReceiveError) !== "function"){
		throw new Error("Illegal Arguments");
	}

	let thisRef = this;

	chrome.sockets.udp.create(null, function(createInfo){
		thisRef.socketId = createInfo.socketId;
		
		chrome.sockets.udp.bind(thisRef.socketId, "0.0.0.0", 0, function(resultCode){
			if (resultCode >= 0){
				thisRef.onReceiveCallback = onReceive;
				thisRef.onReceiveErrorCallback = onReceiveError;
				chrome.sockets.udp.onReceive.addListener(function(info){
					thisRef.onReceive(info);
				});
				chrome.sockets.udp.onReceiveError.addListener(function(info){
					thisRef.onReceiveError(info);
				});

				chrome.sockets.udp.getInfo(thisRef.socketId, function(socketInfo){
					onBind(socketInfo.localPort > 0, socketInfo.localPort, undefined);
				});
			}
			else {
				let errorMsg = Copper.ChromeUdpClient.getLastError(sendInfo.resultCode);
				Copper.Log.logError(errorMsg + " while binding the udp socket.");
				onBind(false, 0, errorMsg);
			}
		});
	});
};

/**
* Sends a datagram 
* @arg datagram: array buffer to send
* @arg onSent(boolean successful, int bytesSent, boolean socketOpen, string errorMsg)
*/
Copper.ChromeUdpClient.prototype.send = function(datagram, remoteAddress, remotePort, onSent){
	if (!(datagram instanceof ArrayBuffer) || typeof(remoteAddress) !== "string" || !Number.isInteger(remotePort) || remotePort <= 0x0 || remotePort > 0xFFFF){
		throw new Error("Illegal Arguments");
	}
	if (this.socketId === undefined){
		throw new Error("Socket not bound");
	}
	let thisRef = this;
	chrome.sockets.udp.send(this.socketId, datagram, remoteAddress, remotePort, function(sendInfo) {
		if (sendInfo.resultCode < 0){
			let errorMsg = Copper.ChromeUdpClient.getLastError(sendInfo.resultCode);
			Copper.Log.logError(errorMsg + " while sending data on udp socket.");
			chrome.sockets.udp.getInfo(thisRef.socketId, function(socketInfo){
				if (onSent !== undefined) onSent(false, 0, socketInfo.localPort > 0, errorMsg);
			});
		}
		else {
			Copper.Log.logInfo("Sent " + sendInfo.bytesSent + " bytes to " + remoteAddress + ":" + remotePort);	
			if (onSent !== undefined) onSent(true, sendInfo.bytesSent, true, undefined);
		}
	});
};

/* Closes the socket, releases resources */
Copper.ChromeUdpClient.prototype.close = function() {
	if (this.socketId !== undefined){
		let tmpSocketId = this.socketId;
		this.socketId = undefined;
		try {
			chrome.sockets.udp.close(tmpSocketId);
		} catch (exception) {
		}
	}
};


/* ------ Implementation -------- */
Copper.ChromeUdpClient.getLastError = function(resultCode){
	return (chrome.runtime.lastError ? chrome.runtime.lastError.message + " (" + resultCode + ")"  : "Error " + resultCode);
};

Copper.ChromeUdpClient.prototype.onReceive = function(info){
	if (info.socketId === this.socketId){
		Copper.Log.logInfo("Received " + info.data.byteLength + " bytes from " + info.remoteAddress + ":" + info.remotePort);
		this.onReceiveCallback(info.data, info.remoteAddress, info.remotePort);
	}
};

Copper.ChromeUdpClient.prototype.onReceiveError = function(info){
	if (info.socketId === this.socketId){
		let errorMsg = Copper.ChromeUdpClient.getLastError(info.resultCode);
		Copper.Log.logError(errorMsg + " while receiving data on udp socket.");
		let thisRef = this;
		chrome.sockets.udp.getInfo(this.socketId, function(socketInfo){
			thisRef.onReceiveErrorCallback(socketInfo.localPort > 0, errorMsg);
		});
	}
};