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

/*
* Implementation of the ClientPort API for Chrome Extension (Manifest V3).
* 
* This replaces the previous architecture that required a separate Chrome App
* with chrome.runtime.connect(). Now the ServerEndpoint runs directly within 
* the extension context using LocalPort for internal message passing.
*/

Copper.ClientPort._serverEndpoint = undefined;
Copper.ClientPort._clientCopperPort = undefined;
Copper.ClientPort._portId = 1;

Copper.ClientPort.connect = function(clientId, finalDisconnectHandler, callback){
	
	// Check if the ServerEndpoint is already created
	if (Copper.ClientPort._serverEndpoint === undefined){
		Copper.Log.logFine("Creating ServerEndpoint directly in extension (Manifest V3 mode)");
		
		// Create a LocalPort that acts as a two-ended pipe
		Copper.ClientPort._portId++;
		let localPort = new Copper.LocalPort(Copper.ClientPort._portId);
		
		// Create the ServerEndpoint using one end of the LocalPort.
		// ServerEndpoint expects a Copper.Port wrapper (provides registerDisconnectCallback).
		let serverEndPort = localPort.createServerEnd();
		let wrappedServerPort = new Copper.Port(serverEndPort, Copper.ClientPort._portId);
		Copper.ClientPort._serverEndpoint = new Copper.ServerEndpoint(wrappedServerPort, Copper.ClientPort._portId);
		
		// The ClientEndpoint will use the other end of the LocalPort
		let clientEndPort = localPort.createClientEnd();
		Copper.ClientPort._clientCopperPort = clientEndPort;
	}
	
	let port = new Copper.Port(Copper.ClientPort._clientCopperPort, clientId);

	let connectedCallback = function(){
        if (port !== undefined){
            port.registerDisconnectCallback(finalDisconnectHandler);
        }
        callback(port);
	};
	
	connectedCallback();
};


/*******************************************************************************
 * Copper.LocalPort - A local port implementation for same-context message passing.
 * 
 * This replaces chrome.runtime.Port which was used to communicate with the 
 * separate Chrome App. LocalPort creates two "ends" - one for the ServerEndpoint 
 * and one for the ClientEndpoint. Messages sent from one end go ONLY to the other.
 * 
 * Architecture:
 *   LocalPort
 *   ├── serverEnd.postMessage → triggers clientEnd's onMessage listener
 *   └── clientEnd.postMessage → triggers serverEnd's onMessage listener
 ******************************************************************************/

Copper.LocalPort = function(id){
	this.id = id;
	this._serverListener = null;
	this._clientListener = null;
	this._disconnectListeners = [];
};

// Create the Server side of the port (used by ServerEndpoint's Copper.Port wrapper)
Copper.LocalPort.prototype.createServerEnd = function(){
	let thisRef = this;
	return {
		id: this.id,
		postMessage: function(msg){
			if (thisRef._clientListener){
				try { thisRef._clientListener(msg); } catch(e) {
					if (typeof Copper !== 'undefined' && Copper.Log){
						Copper.Log.logError("ServerEnd postMessage error: " + e.message);
					}
				}
			}
		},
		onMessage: {
			addListener: function(callback){
				thisRef._serverListener = callback;
			}
		},
		onDisconnect: {
			addListener: function(callback){
				thisRef._disconnectListeners.push(callback);
			}
		},
		disconnect: function(){
			thisRef._serverListener = null;
			thisRef.disconnectAll();
		}
	};
};

// Create the Client side of the port (used by ClientEndpoint's Copper.Port wrapper)
Copper.LocalPort.prototype.createClientEnd = function(){
	let thisRef = this;
	return {
		id: this.id,
		postMessage: function(msg){
			if (thisRef._serverListener){
				try { thisRef._serverListener(msg); } catch(e) {
					if (typeof Copper !== 'undefined' && Copper.Log){
						Copper.Log.logError("ClientEnd postMessage error: " + e.message);
					}
				}
			}
		},
		onMessage: {
			addListener: function(callback){
				thisRef._clientListener = callback;
			}
		},
		onDisconnect: {
			addListener: function(callback){
				thisRef._disconnectListeners.push(callback);
			}
		},
		disconnect: function(){
			thisRef._clientListener = null;
			thisRef.disconnectAll();
		}
	};
};

Copper.LocalPort.prototype.disconnectAll = function(){
	for (let i = 0; i < this._disconnectListeners.length; i++){
		try { this._disconnectListeners[i](); } catch(e) {}
	}
	this._disconnectListeners = [];
	this._serverListener = null;
	this._clientListener = null;
};
