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
* Manages the storage. Used to store or retrieve objects.
* Internally uses the Copper Storage API to persists objects
*/
Copper.StorageManager = function(keyPrefix) {
	this.keyPrefix = keyPrefix !== undefined ? keyPrefix : "";
};

Copper.StorageManager.prototype.keyPrefix = undefined;

Copper.StorageManager.PROFILE_KEY = "profile";
Copper.StorageManager.RESOURCES_KEY = "resources";
Copper.StorageManager.PAYLOAD_KEY = "payload";

// Profiles
Copper.StorageManager.prototype.loadProfiles = function(callback) {
	Copper.Storage.load(this.buildStorageKey(Copper.StorageManager.PROFILE_KEY), function (value) {
        callback(value === undefined ? undefined : Copper.JsonUtils.parse(value));
    });
};

Copper.StorageManager.prototype.storeProfiles = function(profiles) {
	if (!(profiles instanceof Copper.Profiles)){
		throw new Error("Illegal argument");
	}
	Copper.Storage.store(this.buildStorageKey(Copper.StorageManager.PROFILE_KEY), Copper.JsonUtils.stringify(profiles));
};

Copper.StorageManager.prototype.removeProfiles = function() {
	Copper.Storage.remove(this.buildStorageKey(Copper.StorageManager.PROFILE_KEY));
};

// Resources
Copper.StorageManager.prototype.loadResources = function(callback) {
	Copper.Storage.load(this.buildStorageKey(Copper.StorageManager.RESOURCES_KEY), function (value) {
        callback(value === undefined ? undefined : Copper.JsonUtils.parse(value));
    });
};

Copper.StorageManager.prototype.storeResources = function(resources) {
	if (!(resources instanceof Copper.Resources)){
		throw new Error("Illegal argument");
	}
	Copper.Storage.store(this.buildStorageKey(Copper.StorageManager.RESOURCES_KEY), Copper.JsonUtils.stringify(resources));
};

Copper.StorageManager.prototype.removeResources = function() {
	Copper.Storage.remove(this.buildStorageKey(Copper.StorageManager.RESOURCES_KEY));
};

// Payload
Copper.StorageManager.prototype.loadPayload = function(callback) {
	Copper.Storage.load(this.buildStorageKey(Copper.StorageManager.PAYLOAD_KEY), function (value) {
        callback(value === undefined ? undefined : Copper.JsonUtils.parse(value));
    });
};

Copper.StorageManager.prototype.storePayload = function(payload) {
	if (!(payload instanceof Copper.Payload)){
		throw new Error("Illegal argument");
	}
	Copper.Storage.store(this.buildStorageKey(Copper.StorageManager.PAYLOAD_KEY), Copper.JsonUtils.stringify(payload));
};

Copper.StorageManager.prototype.removePayload = function() {
	Copper.Storage.remove(this.buildStorageKey(Copper.StorageManager.PAYLOAD_KEY));
};

Copper.StorageManager.prototype.buildStorageKey = function(specificKey){
	return (this.keyPrefix !== undefined) ? (this.keyPrefix + "." + specificKey) : specificKey;
};