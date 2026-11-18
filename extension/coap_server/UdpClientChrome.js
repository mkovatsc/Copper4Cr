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
	this.onReceiveCallback = undefined;
	this.onReceiveErrorCallback = undefined;
	this.socket4 = undefined;
	this.socket6 = undefined;
	this.nativePort = undefined;
	this.pendingRequests = new Map();
	this.nextRequestId = 1;
	this.closed = false;
};

Copper.UdpClient.HOST_NAME = "com.copper4cr.udp";
Copper.UdpClient.BIND_TIMEOUT_MS = 10000;
Copper.UdpClient.SEND_TIMEOUT_MS = 15000;

/* Binds the socket to a local port. Calls onBind function once the socket is bound.
*  @arg function onBind(boolean socketReady, int port, string errorMsg)
*  @arg function onReceive(ArrayBuffer datagram, string remoteAddress, int remotePort)
*  @arg function onReceiveError(boolean socketReady, string errorMsg)
*/
Copper.UdpClient.prototype.bind = function(onBind, onReceive, onReceiveError){
	if (typeof(onBind) !== "function" || typeof(onReceive) !== "function" || typeof(onReceiveError) !== "function"){
		throw new Error("Illegal Arguments");
	}
	if (this.nativePort !== undefined){
		throw new Error("UDP client is already bound");
	}

	this.onReceiveCallback = onReceive;
	this.onReceiveErrorCallback = onReceiveError;
	this.closed = false;

	let thisRef = this;
	try {
		this.nativePort = chrome.runtime.connectNative(Copper.UdpClient.HOST_NAME);
		this.nativePort.onMessage.addListener(function(message){
			thisRef.onNativeMessage(message);
		});
		this.nativePort.onDisconnect.addListener(function(){
			thisRef.onNativeDisconnect();
		});
	}
	catch (error) {
		this.nativePort = undefined;
		let errorMsg = "Cannot start native UDP host: " + error.message;
		Copper.Log.logError(errorMsg);
		onBind(false, 0, errorMsg);
		return;
	}

	this.queueRequest("bind", {}, function(message, errorMsg){
		if (errorMsg !== undefined){
			thisRef.socket4 = undefined;
			thisRef.socket6 = undefined;
			Copper.Log.logError(errorMsg + " while binding native UDP sockets.");
			onBind(false, 0, errorMsg);
			return;
		}

		thisRef.socket4 = Number.isInteger(message.ipv4Port) && message.ipv4Port > 0;
		thisRef.socket6 = Number.isInteger(message.ipv6Port) && message.ipv6Port > 0;
		let socketReady = message.ready === true && (thisRef.socket4 || thisRef.socket6);
		let port = thisRef.socket4 ? message.ipv4Port : message.ipv6Port;
		if (!socketReady){
			let bindError = message.error || "Neither IPv4 nor IPv6 UDP socket could be bound";
			onBind(false, 0, bindError);
			return;
		}
		if (message.error){
			Copper.Log.logWarning(message.error);
		}
		onBind(true, port, undefined);
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

	let thisRef = this;
	let ipv6 = remoteAddress.startsWith("[");
	let actualAddress = ipv6 ? remoteAddress.substring(1, remoteAddress.length - 1) : remoteAddress;
	let reportError = function(errorMsg, socketOpen){
		Copper.Log.logError(errorMsg + " while sending to " + remoteAddress + ":" + remotePort);
		if (onSent !== undefined){
			onSent(false, 0, socketOpen, errorMsg);
		}
	};

	if (this.nativePort === undefined || this.closed){
		reportError("Native UDP host is not connected", false);
		return;
	}
	if ((ipv6 && !this.socket6) || (!ipv6 && !this.socket4)){
		reportError((ipv6 ? "IPv6" : "IPv4") + " socket is not bound", false);
		return;
	}
	if (ipv6 && !remoteAddress.endsWith("]")){
		reportError("Invalid bracketed IPv6 address", true);
		return;
	}

	this.queueRequest("send", {
		family: ipv6 ? "ipv6" : "ipv4",
		address: actualAddress,
		port: remotePort,
		data: Copper.ByteUtils.convertBytesToBase64(datagram)
	}, function(message, errorMsg){
		if (errorMsg !== undefined){
			let socketOpen = message && typeof(message.socketOpen) === "boolean" ? message.socketOpen : thisRef.nativePort !== undefined && !thisRef.closed;
			reportError(errorMsg, socketOpen);
		}
		else {
			Copper.Log.logInfo("Sent " + message.bytesSent + " bytes via " + message.family + " to " + remoteAddress + ":" + remotePort);
			if (onSent !== undefined){
				onSent(true, message.bytesSent, true, undefined);
			}
		}
	});
};

/* Closes the socket, releases resources */
Copper.UdpClient.prototype.close = function(){
	if (this.closed){
		return;
	}
	this.closed = true;
	let port = this.nativePort;
	this.nativePort = undefined;
	this.socket4 = undefined;
	this.socket6 = undefined;
	this.failPendingRequests("UDP client closed");

	if (port !== undefined){
		try {
			port.postMessage({v: 1, id: this.nextRequestId++, type: "close"});
		}
		catch (error) {
		}
		try {
			port.disconnect();
		}
		catch (error) {
		}
	}
};

/* ------ Native Messaging implementation -------- */

Copper.UdpClient.prototype.queueRequest = function(type, payload, callback){
	if (this.nativePort === undefined){
		callback(undefined, "Native UDP host is not connected");
		return;
	}

	let id = this.nextRequestId++;
	let thisRef = this;
	let timeout = setTimeout(function(){
		thisRef.finishRequest(id, {socketOpen: thisRef.nativePort !== undefined && !thisRef.closed}, "Native UDP host request timed out: " + type);
	}, type === "bind" ? Copper.UdpClient.BIND_TIMEOUT_MS : Copper.UdpClient.SEND_TIMEOUT_MS);
	this.pendingRequests.set(id, {type: type, callback: callback, timeout: timeout});

	let message = {v: 1, id: id, type: type};
	Object.keys(payload).forEach(function(key){
		message[key] = payload[key];
	});
	try {
		this.nativePort.postMessage(message);
	}
	catch (error) {
		this.finishRequest(id, {socketOpen: false}, "Cannot send request to native UDP host: " + error.message);
	}
};

Copper.UdpClient.prototype.finishRequest = function(id, message, errorMsg){
	let pending = this.pendingRequests.get(id);
	if (pending === undefined){
		return;
	}
	this.pendingRequests.delete(id);
	clearTimeout(pending.timeout);
	pending.callback(message, errorMsg);
};

Copper.UdpClient.prototype.failPendingRequests = function(errorMsg){
	let ids = Array.from(this.pendingRequests.keys());
	for (let i = 0; i < ids.length; i++){
		this.finishRequest(ids[i], {socketOpen: false}, errorMsg);
	}
};

Copper.UdpClient.prototype.onNativeMessage = function(message){
	if (!message || typeof(message.type) !== "string"){
		return;
	}

	if (message.type === "receive"){
		try {
			let datagram = Copper.UdpClient.convertBase64ToBytes(message.data || "");
			Copper.Log.logInfo("Received " + datagram.byteLength + " bytes from " + message.remoteAddress + ":" + message.remotePort);
			if (this.onReceiveCallback !== undefined){
				this.onReceiveCallback(datagram, message.remoteAddress, message.remotePort);
			}
		}
		catch (error) {
			if (this.onReceiveErrorCallback !== undefined){
				this.onReceiveErrorCallback(true, "Invalid datagram from native UDP host: " + error.message);
			}
		}
		return;
	}
	if (message.type === "receiveError"){
		if (this.onReceiveErrorCallback !== undefined){
			this.onReceiveErrorCallback(message.socketOpen === true, message.error || "Native UDP receive error");
		}
		return;
	}
	if (message.type === "bound" || message.type === "sent" || message.type === "error"){
		let errorMsg = message.type === "error" ? (message.error || "Native UDP host error") : undefined;
		this.finishRequest(message.id, message, errorMsg);
	}
};

Copper.UdpClient.prototype.onNativeDisconnect = function(){
	let lastError = chrome.runtime.lastError;
	let errorMsg = lastError ? lastError.message : "Native UDP host disconnected";
	this.nativePort = undefined;
	this.socket4 = undefined;
	this.socket6 = undefined;
	let hadPendingRequests = this.pendingRequests.size > 0;
	this.failPendingRequests(errorMsg);

	if (!this.closed && !hadPendingRequests && this.onReceiveErrorCallback !== undefined){
		this.onReceiveErrorCallback(false, errorMsg);
	}
};

Copper.UdpClient.convertBase64ToBytes = function(base64){
	let binary = atob(base64);
	let bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++){
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes.buffer;
};
