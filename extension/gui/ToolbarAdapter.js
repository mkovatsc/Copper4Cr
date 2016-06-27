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
 
Copper.ToolbarAdapter = function(){
};

Copper.ToolbarAdapter.init = function(){
	document.getElementById("copper-toolbar-ping").onclick = Copper.ToolbarAdapter.doPing;
	document.getElementById("copper-toolbar-discover").onclick = Copper.ToolbarAdapter.doDiscover;
	document.getElementById("copper-toolbar-get").onclick = Copper.ToolbarAdapter.doGet;
	document.getElementById("copper-toolbar-post").onclick = Copper.ToolbarAdapter.doPost;
	document.getElementById("copper-toolbar-put").onclick = Copper.ToolbarAdapter.doPut;
	document.getElementById("copper-toolbar-delete").onclick = Copper.ToolbarAdapter.doDelete;
	document.getElementById("copper-toolbar-observe").onclick = Copper.ToolbarAdapter.doObserve;
};

Copper.ToolbarAdapter.onEvent = function(event){
};

Copper.ToolbarAdapter.doPing = function(){
	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.EMPTY);
	Copper.Session.sendCoapMessage(coapMessage, true);
};

Copper.ToolbarAdapter.doDiscover = function(){
	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET);
	coapMessage.addOption(Copper.CoapMessage.OptionHeader.URI_PATH, ".well-known");
	coapMessage.addOption(Copper.CoapMessage.OptionHeader.URI_PATH, "core");
	Copper.Session.sendCoapMessage(coapMessage, true);
};

Copper.ToolbarAdapter.doGet = function(){
	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET);
	Copper.Session.sendCoapMessage(coapMessage);
};

Copper.ToolbarAdapter.doPost = function(){
	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.POST);
	Copper.Session.sendCoapMessage(coapMessage);
};

Copper.ToolbarAdapter.doPut = function(){
	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.PUT);
	Copper.Session.sendCoapMessage(coapMessage);
};

Copper.ToolbarAdapter.doDelete = function(){
	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.DELETE);
	Copper.Session.sendCoapMessage(coapMessage);
};

Copper.ToolbarAdapter.doObserve = function(){
	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET);
	coapMessage.addOption(Copper.CoapMessage.OptionHeader.OBSERVE, 0);
	Copper.Session.sendCoapMessage(coapMessage);
};
