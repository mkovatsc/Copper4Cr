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
 
Copper.ComponentFactory = {
	createPort: function(port, endpointId){
					throw new Error("not implemented");
				},
    createUdpClient: function(){
    				throw new Error("not implemented");
    			},
    // used as the client startup procedure
    // connects to the server port and resolves the url, port and path
    // must ensure that finalDisconnectHandler is set on the port finally
    // calls the callback afterwards (function())
    resolvePortAndCoapEndpoint: function(clientId, finalDisconnectHandler, callback){
    				throw new Error("not implemented");
    			},
    // change resource --> state is preserved in a browser dependent way
    changeCoapResource: function(protocol, remoteAddress, remotePort, path, query, reload){
    				 new Error("not implemented");
    			},
	storeLocally: function(id, value) {
					throw new Error("not implemented");
				},
	retrieveLocally: function(element, callback) {
					throw new Error("not implemented");
				},
};

Copper.ChromeComponentFactory = {
	createPort: function(port, endpointId){
					return new Copper.ChromePort(port, endpointId);
				},
    createUdpClient: function(){
    				return new Copper.ChromeUdpClient();
    			},
    resolvePortAndCoapEndpoint: function(clientId, finalDisconnectHandler, callback){
    				return Copper.ChromeStartup.resolvePortAndCoapEndpoint(clientId, finalDisconnectHandler, callback);
    			},
    changeCoapResource: function(protocol, remoteAddress, remotePort, path, query, reload){
				if (reload) {
					window.location.search = "?" + encodeURIComponent((protocol ? protocol + "://" : "") + remoteAddress + ":" + remotePort +
							(path ? ("/" + path) : "") + (query ? ("?" + query) : ""));
				} else {
					window.history.pushState("", "", "?" + encodeURIComponent((protocol ? protocol + "://" : "") + remoteAddress + ":" + remotePort +
							(path ? ("/" + path) : "") + (query ? ("?" + query) : "")));
				}


	},
	storeLocally: function(id, value, callback) {
					var storeObject = {};
					storeObject[id] = value;
					chrome.storage.local.set(storeObject, function(items) {
						if (callback !== undefined) {
							callback();
						}
					});
				},
	retrieveLocally: function(id, callback) {
					chrome.storage.local.get(id, function(items) {
						callback(id, items);
					});
				},
};