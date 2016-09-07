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
 
// Builds on top of the shared JsonUtils
Copper.ExtensionJsonUtils = function(){
};

Copper.ExtensionJsonUtils.jsonToCopperOptions = function(data){
	let res = new Copper.Options();
	let options = Object.keys(data);
	for (let i=0; i<options.length; i++){
		res[options[i]] = data[options[i]];
	}
	return res;
};

Copper.ExtensionJsonUtils.copperProfilesToJson = function(profiles){
	if (!(profiles instanceof Copper.Profiles)){
		throw new Error("Illegal Arguments");
	}
	return {
		profiles: profiles.profiles,
		autoStore: profiles.autoStore,
		selectedProfile: profiles.selectedProfile
	};
};


Copper.ExtensionJsonUtils.jsonToCopperProfiles = function(data){
	let res = new Copper.Profiles();
	res.profiles = data.profiles;
	res.autoStore = data.autoStore;
	res.selectedProfile = data.selectedProfile;
	return res;
};

Copper.ExtensionJsonUtils.jsonToCopperResources = function(data){
	let res = new Copper.Resources();
	res.resources = data.resources;
	return res;
};

Copper.ExtensionJsonUtils.copperPayloadToJson = function(payload){
	if (!(payload instanceof Copper.Payload)){
		throw new Error("Illegal Arguments");
	}
	return {
		payloadMode: payload.payloadMode,
		payloadText: payload.payloadText,
		payloadFileData: payload.payloadFileData,
		payloadFileName: payload.payloadFileName
	};
};

Copper.ExtensionJsonUtils.jsonToCopperPayload = function(data){
	let res = new Copper.Payload();
	res.payloadMode = data.payloadMode;
	res.payloadText = data.payloadText;
	res.payloadFileData = data.payloadFileData;
	res.payloadFileName = data.payloadFileName;
	return res;
};

Copper.ExtensionJsonUtils.copperLayoutToJson = function(layout){
	if (!(layout instanceof Copper.Layout)){
		throw new Error("Illegal Arguments");
	}
	return {
		resourceTreeWidth: layout.resourceTreeWidth,
		messageLogHeight: layout.messageLogHeight,
		eventLogWidth: layout.eventLogWidth,
		eventLogHeight: layout.eventLogHeight
	};
};

Copper.ExtensionJsonUtils.jsonToCopperLayout = function(data){
	let res = new Copper.Layout();
	res.resourceTreeWidth = data.resourceTreeWidth;
	res.messageLogHeight = data.messageLogHeight;
	res.eventLogWidth = data.eventLogWidth;
	res.eventLogHeight = data.eventLogHeight;
	return res;
};

Copper.JsonUtils.transformers.push([function(value){return value instanceof Copper.Options}, "Copper.Options", undefined, Copper.ExtensionJsonUtils.jsonToCopperOptions]);
Copper.JsonUtils.transformers.push([function(value){return value instanceof Copper.Profiles}, "Copper.Profiles", Copper.ExtensionJsonUtils.copperProfilesToJson, Copper.ExtensionJsonUtils.jsonToCopperProfiles]);
Copper.JsonUtils.transformers.push([function(value){return value instanceof Copper.Resources}, "Copper.Resources", undefined, Copper.ExtensionJsonUtils.jsonToCopperResources]);
Copper.JsonUtils.transformers.push([function(value){return value instanceof Copper.Payload}, "Copper.Payload", Copper.ExtensionJsonUtils.copperPayloadToJson, Copper.ExtensionJsonUtils.jsonToCopperPayload]);
Copper.JsonUtils.transformers.push([function(value){return value instanceof Copper.Layout}, "Copper.Layout", Copper.ExtensionJsonUtils.copperLayoutToJson, Copper.ExtensionJsonUtils.jsonToCopperLayout]);