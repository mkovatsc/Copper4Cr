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

Copper.PopupWindowAdapter = function(){
};

Copper.PopupWindowAdapter.encode_utf_8 = true;

Copper.PopupWindowAdapter.init = function()
{
    var closeButtons = document.getElementById("popup-windows").getElementsByClassName("close-button");
    for (let i = 0; i < closeButtons.length; i++) {
        closeButtons[i].onclick = Copper.PopupWindowAdapter.closeWindow;
    }
    
    document.getElementById("preferences-window-encode-utf-8").onclick = Copper.PopupWindowAdapter.checkEncode_utf_8;
    document.getElementById("preferences-window-clear-resource-cache").onclick = Copper.PopupWindowAdapter.clearResourceCache;
    document.getElementById("preferences-window-clear-payload-cache").onclick = Copper.PopupWindowAdapter.clearPayloadCache;
    document.getElementById("preferences-window-clear-entire-cache").onclick = Copper.PopupWindowAdapter.clearEntireCache;


    // Init default
    var encode_utf_8 = document.getElementById("preferences-window-encode-utf-8");
    encode_utf_8.checked = "checked"
};


Copper.PopupWindowAdapter.checkEncode_utf_8 = function(){
    Copper.Session.settings.encode_utf_8 = this.checked;
    Copper.Session.clientEndpoint.updateSettings(Copper.Session.settings);
};

Copper.PopupWindowAdapter.checkPlugtest = function(){
    if (this.checked) {
        Copper.PopupWindowAdapter.plugtest = true;
    } else {
        Copper.PopupWindowAdapter.plugtest = false;
    }
};

Copper.PopupWindowAdapter.closeWindow = function(){
    var blockScreens = document.getElementById("popup-windows").getElementsByClassName("block_screen");
    for (let i = 0; i < blockScreens.length; i++) {
        if (!blockScreens[i].classList.contains("hidden")){
            blockScreens[i].classList.add("hidden");
        }
    }
};

Copper.PopupWindowAdapter.clearResourceCache = function(){
    if (confirm('This will delete the RESOURCE cache. Continue?')) {
        Copper.Session.settings.resources = new Object();
        Copper.Session.clientEndpoint.updateSettings(Copper.Session.settings);
    }
};

Copper.PopupWindowAdapter.clearPayloadCache = function(){
    if (confirm('This will delete the PAYLOAD cache. Continue?')) {
        Copper.Session.payload.payloadFileData = new ArrayBuffer();
        Copper.Session.payload.payloadFileName = "";
        Copper.Session.payload.payloadMode = "text";
        Copper.Session.payload.payloadText = "";
        Copper.ToolbarAdapter.resetPayload();
        Copper.PayloadAdapter.resetPayload();
    }
};

Copper.PopupWindowAdapter.clearEntireCache = function(){
    if (confirm('This will delete the ENTIRE cache. Continue?')) {
        Copper.Storage.clear(function() {
            Copper.ToolbarAdapter.resetPayload();
            Copper.PayloadAdapter.resetPayload();
            Copper.DebugOptionsAdapter.resetAllDebugOptions();
            Copper.Session.profiles.createAndSelectDefaultProfile();
        });

    }
};
