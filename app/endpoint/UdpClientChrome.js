/*******************************************************************************
 * Copyright (c) 2016, Institute for Pervasive Computing, ETH Zurich.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the Institute nor the names of its contributors
 *    may be used to endorse or promote products derived from this software
 *    without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE INSTITUTE AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED.  IN NO EVENT SHALL THE INSTITUTE OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 * OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
 * 
 * This file is part of the Copper (Cu) CoAP user-agent.
 ******************************************************************************/
 
/* Implementation of a simple UDP Client interface for sending and receiving plain datagrams. 
*  The following methods are provided:
*
*  -> bind(function onBind, function onReceive, function onReceiveError)
*  -> send(ArrayBuffer datagram, string remoteAddress, int remotePort, function onSent)
*  -> close()
*/

Copper.UdpClient = function(){
};

/* Callbacks */
Copper.UdpClient.prototype.onReceiveCallback = undefined;
Copper.UdpClient.prototype.onReceiveErrorCallback = undefined;

/* SocketId (set while socket is bind) */
Copper.UdpClient.prototype.socket4 = undefined;
Copper.UdpClient.prototype.socket6 = undefined;

/* Binds the socket to a local port. Calls onBind function once the socket is bound.
*  @arg function onBind(boolean socketReady, int port, string errorMsg)
*  @arg function onReceive(ArrayBuffer datagram, string remoteAddress, int remotePort)
*  @arg function onReceiveError(boolean socketReady, string errorMsg)
*/
Copper.UdpClient.prototype.bind = function(onBind, onReceive, onReceiveError){
	if (typeof(onBind) !== "function" || typeof(onReceive) !== "function" || typeof(onReceiveError) !== "function"){
		throw new Error("Illegal Arguments");
	}

	let thisRef = this;

	thisRef.onReceiveCallback = onReceive;
	thisRef.onReceiveErrorCallback = onReceiveError;

	chrome.sockets.udp.onReceive.addListener(function(info){
		thisRef.onReceive(info);
	});
	chrome.sockets.udp.onReceiveError.addListener(function(info){
		thisRef.onReceiveError(info);
	});

	// IPv4
	chrome.sockets.udp.create(null, function(createInfo){
		thisRef.socket4 = createInfo.socketId;
		
		chrome.sockets.udp.bind(thisRef.socket4, "0.0.0.0", 0, function(resultCode){
			if (resultCode >= 0){
				chrome.sockets.udp.getInfo(thisRef.socket4, function(socketInfo){
					onBind(socketInfo.localPort > 0, socketInfo.localPort, undefined);
				});
			} else {
				let errorMsg = Copper.UdpClient.getLastError(sendInfo.resultCode);
				Copper.Log.logError(errorMsg + " while binding IPv4 socket.");
				onBind(false, 0, errorMsg);
			}
		});
	});
	// IPv6
	chrome.sockets.udp.create(null, function(createInfo){
		thisRef.socket6 = createInfo.socketId;
		
		chrome.sockets.udp.bind(thisRef.socket6, "::0", 0, function(resultCode){
			if (resultCode >= 0){
				chrome.sockets.udp.getInfo(thisRef.socket6, function(socketInfo){
					onBind(socketInfo.localPort > 0, socketInfo.localPort, undefined);
				});
			} else {
				let errorMsg = Copper.UdpClient.getLastError(sendInfo.resultCode);
				Copper.Log.logError(errorMsg + " while binding IPv6 socket.");
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
Copper.UdpClient.prototype.send = function(datagram, remoteAddress, remotePort, onSent){
	if (!(datagram instanceof ArrayBuffer) || typeof(remoteAddress) !== "string" || !Number.isInteger(remotePort) || remotePort <= 0x0 || remotePort > 0xFFFF){
		throw new Error("Illegal Arguments");
	}
	if (remoteAddress.startsWith('[')){
		if (this.socket6 === undefined) throw new Error("IPv6 Socket not bound");
		actualSocket = this.socket6;
		actualAddress = remoteAddress.substring(1, remoteAddress.length-1);
		actualQueryType = "ipv6";
	} else {
		if (this.socket4 === undefined) throw new Error("IPv4 Socket not bound");
		actualSocket = this.socket4;
		actualAddress = remoteAddress;
		actualQueryType = "ipv4";
	}
	chrome.sockets.udp.send(actualSocket, datagram, actualAddress, remotePort, dnsQueryType=actualQueryType, function(sendInfo) {
		if (sendInfo.resultCode < 0){
			let errorMsg = Copper.UdpClient.getLastError(sendInfo.resultCode);
			Copper.Log.logError(errorMsg + " while sending to " + actualAddress + ":" + remotePort);
			chrome.sockets.udp.getInfo(actualSocket, function(socketInfo){
				if (onSent !== undefined) onSent(false, 0, socketInfo.localPort > 0, errorMsg);
			});
		} else {
			Copper.Log.logInfo("Sent " + sendInfo.bytesSent + " bytes via " + actualQueryType + " to " + remoteAddress + ":" + remotePort);	
			if (onSent !== undefined) onSent(true, sendInfo.bytesSent, true, undefined);
		}
	});
};

/* Closes the socket, releases resources */
Copper.UdpClient.prototype.close = function() {
	if (this.socket4 !== undefined){
		let tmpSocketId = this.socket4;
		this.socket4 = undefined;
		try {
			chrome.sockets.udp.close(tmpSocketId);
		} catch (exception) {
		}
	}
	if (this.socket6 !== undefined){
		let tmpSocketId = this.socket6;
		this.socket6 = undefined;
		try {
			chrome.sockets.udp.close(tmpSocketId);
		} catch (exception) {
		}
	}
};


/* ------ Implementation -------- */
Copper.UdpClient.getLastError = function(resultCode){
	return (chrome.runtime.lastError ? chrome.runtime.lastError.message + " (" + resultCode + ")"  : "Error " + resultCode);
};

Copper.UdpClient.prototype.onReceive = function(info){
	if (info.socketId === this.socket4 || info.socketId === this.socket6) {
		Copper.Log.logInfo("Received " + info.data.byteLength + " bytes from " + info.remoteAddress + ":" + info.remotePort);
		this.onReceiveCallback(info.data, info.remoteAddress, info.remotePort);
	}
};

Copper.UdpClient.prototype.onReceiveError = function(info){
	let errorMsg = Copper.UdpClient.getLastError(info.resultCode);
	let thisRef = this;
	if (info.socketId === this.socket4){
		Copper.Log.logError(errorMsg + " while receiving data on IPv4 socket.");
		chrome.sockets.udp.getInfo(this.socket4, function(socketInfo){
			thisRef.onReceiveErrorCallback(socketInfo.localPort > 0, errorMsg);
		});
	}
	if (info.socketId === this.socket6){
		Copper.Log.logError(errorMsg + " while receiving data on IPv6 socket.");
		chrome.sockets.udp.getInfo(this.socket6, function(socketInfo){
			thisRef.onReceiveErrorCallback(socketInfo.localPort > 0, errorMsg);
		});
	}
};