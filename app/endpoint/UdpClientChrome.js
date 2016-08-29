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
Copper.UdpClient.prototype.socketId = undefined;

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
				let errorMsg = Copper.UdpClient.getLastError(sendInfo.resultCode);
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
Copper.UdpClient.prototype.send = function(datagram, remoteAddress, remotePort, onSent){
	if (!(datagram instanceof ArrayBuffer) || typeof(remoteAddress) !== "string" || !Number.isInteger(remotePort) || remotePort <= 0x0 || remotePort > 0xFFFF){
		throw new Error("Illegal Arguments");
	}
	if (this.socketId === undefined){
		throw new Error("Socket not bound");
	}
	let thisRef = this;
	chrome.sockets.udp.send(this.socketId, datagram, remoteAddress, remotePort, function(sendInfo) {
		if (sendInfo.resultCode < 0){
			let errorMsg = Copper.UdpClient.getLastError(sendInfo.resultCode);
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
Copper.UdpClient.prototype.close = function() {
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
Copper.UdpClient.getLastError = function(resultCode){
	return (chrome.runtime.lastError ? chrome.runtime.lastError.message + " (" + resultCode + ")"  : "Error " + resultCode);
};

Copper.UdpClient.prototype.onReceive = function(info){
	if (info.socketId === this.socketId){
		Copper.Log.logInfo("Received " + info.data.byteLength + " bytes from " + info.remoteAddress + ":" + info.remotePort);
		this.onReceiveCallback(info.data, info.remoteAddress, info.remotePort);
	}
};

Copper.UdpClient.prototype.onReceiveError = function(info){
	if (info.socketId === this.socketId){
		let errorMsg = Copper.UdpClient.getLastError(info.resultCode);
		Copper.Log.logError(errorMsg + " while receiving data on udp socket.");
		let thisRef = this;
		chrome.sockets.udp.getInfo(this.socketId, function(socketInfo){
			thisRef.onReceiveErrorCallback(socketInfo.localPort > 0, errorMsg);
		});
	}
};