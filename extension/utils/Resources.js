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
* Holder for the resources for a given key (usually remoteAddress:remotePort)
*/
Copper.Resources = function() {
	this.resources = new Object();	
};

Copper.Resources.prototype.resources = undefined;

Copper.Resources.prototype.getResourcesForAddress = function(address){
	if (typeof(address) !== "string" || address === ""){
		throw new Error("Illegal arguments");
	}
	let resources = this.resources[address];
	
	let uris = resources !== undefined ? Object.keys(resources) : [];
	if (uris.indexOf("/.well-known/core") === -1) uris.push("/.well-known/core");
	uris.sort();

	let res = [];
	for (let i=0; i<uris.length; i++){
		let uri = decodeURI(uris[i]);
		uri = uri.startsWith("/") ? uri.substr(1) : uri;
		let segments = uri.split("/");
		segments.unshift(address);
		let attributes = resources !== undefined && resources[uris[i]] !== undefined ? resources[uris[i]] : (uris[i] === "/.well-known/core" ? {ct: 40, title: "Resource discovery"} : {});
		res.push({
			segments: segments,
			attributes: attributes
		});
	}
	return res;
};

Copper.Resources.prototype.addResource = function(address, path, attributes){
	if (typeof(address) !== "string" || address === "" || typeof(path) !== "string"){
		throw new Error("Illegal arguments");
	}
	if (this.resources[address] === undefined){
		this.resources[address] = new Object();
	}
	this.resources[address][path] = attributes;
};

Copper.Resources.prototype.removeResources = function(address){
	if (typeof(address) !== "string" || address === ""){
		throw new Error("Illegal arguments");
	}
	delete this.resources[address];
};