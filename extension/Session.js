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
* The Session provides all the shared information on the client to the GUI-Adapters (see the list below).
* Additionally, it is used
*  - to perform the startup
*  - dispatch events to the GUI-Adapters
*  - send a coap message to the server
*  - update the shared state and persist it (see update* functions on the bottom)
*/
window.onload = function(){
    Copper.Log.registerLogger(Copper.ConsoleLogger.log);
    Copper.Session.initialize();
};

Copper.Session = function(){
};

Copper.Session.clientId = undefined;
Copper.Session.storageManager = undefined;

Copper.Session.settings = undefined;
Copper.Session.options = undefined;
Copper.Session.payload = undefined;
Copper.Session.layout = undefined;
Copper.Session.profiles = undefined;
Copper.Session.resources = undefined;

Copper.Session.protocol = undefined;
Copper.Session.remoteAddress = undefined;
Copper.Session.remotePort = undefined;
Copper.Session.path = undefined;
Copper.Session.query = undefined;

Copper.Session.clientEndpoint = undefined;
Copper.Session.localPort = undefined;


/* 
*  if a function from the following list is implemented, it gets called when appropriate
*   - beforeSessionInitialization
*   - onProfilesUpdated
*   - onSettingsUpdated
*   - onOptionsUpdated
*   - onPayloadUpdated
*   - onLayoutUpdated
*   - onCoapEndpointResolved
*   - onResourcesUpdated
*   - onSelectedProfileUpdated
*   - onClientRegistered
*   - onEvent
*   - beforeSendingCoapMessage
*/
Copper.Session.eventListeners = [
        Copper.MessageLogAdapter,
        Copper.PacketHeaderAdapter,
        Copper.PacketOptionsAdapter,
        Copper.PayloadAdapter,
        Copper.ToolbarAdapter,
        Copper.ResourceViewAdapter,
        Copper.DebugOptionsAdapter,
        Copper.PreferenceWindowAdapter,
        Copper.ProfilesAdapter,
        Copper.StartupWindowAdapter,
        Copper.StatusBarAdapter,
        Copper.PopupWindowAdapter,
        Copper.ToolbarLoggerAdapter
    ];

Copper.Session.informListeners = function(funcName, args){
    let listeners = Copper.Session.eventListeners;
    for (let i=0; i<listeners.length; i++){
        if (typeof(listeners[i][funcName]) === "function"){
            try {
                listeners[i][funcName].apply(listeners[i], args);
            } catch (exception){
                Copper.Log.logError(exception.stack);
                Copper.Session.showErrorMessage(-1, exception.message);
            }
        }
    }
};

Copper.Session.initialize = function(){
    Copper.Session.clientId = 1;
    Copper.Session.storageManager = new Copper.StorageManager("copper");
    Copper.Session.informListeners("beforeSessionInitialization");
    
    Copper.Session.storageManager.loadProfiles(function(profiles){
        Copper.Session.updateProfilesSelection(profiles === undefined ? new Copper.Profiles() : profiles, true);    

        Copper.CoapResourceHandler.resolveCoapResource(function(protocol, remoteAddress, remotePort, path, query){
            Copper.Session.protocol = protocol;
            Copper.Session.remoteAddress = remoteAddress;
            Copper.Session.remotePort = remotePort;
            Copper.Session.path = path;
            Copper.Session.query = query;

            Copper.Session.informListeners("onCoapEndpointResolved");

            Copper.Session.storageManager.loadResources(function(resources){
                Copper.Session.updateResources(resources === undefined ? new Copper.Resources() : resources, true);
                Copper.ClientPort.connect(Copper.Session.clientId, Copper.Session.onPortDisconnect, Copper.Session.registerClient);
            });
        });  
    });
};

// setup session
// register client
// bind HTML to javascript
Copper.Session.registerClient = function(port){

    let registeredCallback = function(event){
        switch (event.type){
            case Copper.Event.TYPE_CLIENT_REGISTERED:
                Copper.Event.unregisterCallback(registeredCallback, Copper.Session.clientId);
                Copper.PopupWindowAdapter.closeInfoWindow();

                Copper.Session.clientEndpoint = new Copper.ClientEndpoint(port, Copper.Session.clientId);
                Copper.Session.localPort = event.port;
                Copper.Session.startExtension();

                break;
            case Copper.Event.TYPE_ERROR_ON_SERVER: 
                Copper.PopupWindowAdapter.openErrorWindow("Error", "Error " + event.data.errorType + ": " + event.data.errorMessage, false, true);
                break;
            default:
                Copper.PopupWindowAdapter.openErrorWindow("Error: Invalid Event", "Error: Invalid Event", "Received invalid event(" + event.type + ") from app. Please restart the extension.", false, true);
                break;
        }
        return true;
    };
    Copper.Event.registerCallback(registeredCallback, Copper.Session.clientId);
    port.sendMessage(Copper.Event.createRegisterClientEvent(Copper.Session.remoteAddress, Copper.Session.remotePort, Copper.Session.settings, Copper.Session.clientId));
};

Copper.Session.startExtension = function(){
    Copper.Session.informListeners("onClientRegistered");

    // event callback
    Copper.Event.registerCallback(function(event){
        Copper.Session.informListeners("onEvent", [event]);
        switch (event.type){
            case Copper.Event.TYPE_ERROR_ON_SERVER:
                Copper.Session.showErrorMessage(event.data.errorType, event.data.errorMessage);
                break;
        }
        return true;
    }, Copper.Session.clientId);
};

Copper.Session.showErrorMessage = function(errorNo, errorMessage){
    if (!Number.isInteger(errorNo) || typeof(errorMessage) !== "string"){
        throw new Error("Illegal Arguments");
    }
    Copper.PopupWindowAdapter.openErrorWindow("Error " + errorNo, errorMessage, false, true);
};

Copper.Session.sendCoapMessage = function(coapMessage, withoutModification){
    if (!(coapMessage instanceof Copper.CoapMessage)){
        throw new Error("Illegal Argument");
    }
    if (Copper.Session.clientEndpoint === undefined){
        throw new Error("Illegal State");
    }
    try{
        let blockwiseEnabled = true;
        if (!withoutModification){
            // add URI-PATH and URI-QUERY
            Copper.CopperUtils.splitOptionAndAddToCoapMessage(coapMessage, Copper.CoapMessage.OptionHeader.URI_PATH, Copper.Session.path, "/", {useUtf8: Copper.Session.options.useUtf8});
            Copper.CopperUtils.splitOptionAndAddToCoapMessage(coapMessage, Copper.CoapMessage.OptionHeader.URI_QUERY, Copper.Session.query, "&", {useUtf8: Copper.Session.options.useUtf8});

            if (Copper.Session.options.optionsEnabled){
                blockwiseEnabled = Copper.Session.options.blockwiseEnabled;
                Copper.Session.options.addOptionsToCoapMessage(coapMessage, Copper.Session.settings.blockSize);
            }
            Copper.Session.payload.addPayloadToCoapMessage(coapMessage, Copper.Session.options.useUtf8, Copper.Session.settings.sendContentType);
            Copper.Session.informListeners("beforeSendingCoapMessage", [coapMessage]);
            if (!blockwiseEnabled && coapMessage.isOptionSet(Copper.CoapMessage.OptionHeader.BLOCK1)){
                let block1 = coapMessage.getOption(Copper.CoapMessage.OptionHeader.BLOCK1)[0];
                let size = block1.getSize();
                let more = coapMessage.payload.byteLength > (block1.num + 1)*size;
                if (more) coapMessage.addOption(Copper.CoapMessage.OptionHeader.BLOCK1, new Copper.CoapMessage.BlockOption(block1.num, block1.szExp, true), true);
                coapMessage = coapMessage.clone(block1.num*size, size);
            }
        }
        if (!Copper.CoapMessage.Code.EMPTY.equals(coapMessage.code) && Copper.Session.settings.sendUriHost && !coapMessage.isOptionSet(Copper.CoapMessage.OptionHeader.PROXY_URI) && 
                !coapMessage.isOptionSet(Copper.CoapMessage.OptionHeader.URI_HOST) && !coapMessage.isOptionSet(Copper.CoapMessage.OptionHeader.URI_PORT)) {
            coapMessage.addOption(Copper.CoapMessage.OptionHeader.URI_HOST, Copper.Session.remoteAddress, false, {useUtf8: Copper.Session.options.useUtf8});
            coapMessage.addOption(Copper.CoapMessage.OptionHeader.URI_PORT, Copper.Session.remotePort);
        }
        Copper.Session.clientEndpoint.sendCoapMessage(coapMessage, blockwiseEnabled);
    } catch (exception){
        Copper.Log.logError(exception.stack);
        Copper.Session.showErrorMessage(-1, exception.message);
    }
};

Copper.Session.onPortDisconnect = function(){
    Copper.Session.clientEndpoint = undefined;
    Copper.Session.localPort = undefined;
    Copper.PopupWindowAdapter.openErrorWindow("Connection lost...", "Connection to Copper app lost. Please restart the extension.", false, true);
};

Copper.Session.updateSettings = function(newSettings, skipStoringToProfile) {
    Copper.Session.settings = newSettings;
    Copper.Session.informListeners("onSettingsUpdated");
    if (this.clientEndpoint !== undefined) this.clientEndpoint.updateSettings(newSettings);
    if (!skipStoringToProfile && Copper.Session.profiles.updateSelectedProfile(Copper.Session.settings, Copper.Session.options, Copper.Session.payload, Copper.Session.layout)){
        Copper.Session.updateProfiles(Copper.Session.profiles);
    }
};

Copper.Session.updateOptions = function(newOptions, skipStoringToProfile) {
    Copper.Session.options = newOptions;
    Copper.Session.informListeners("onOptionsUpdated");
    if (!skipStoringToProfile && Copper.Session.profiles.updateSelectedProfile(Copper.Session.settings, Copper.Session.options, Copper.Session.payload, Copper.Session.layout)){
        Copper.Session.updateProfiles(Copper.Session.profiles);
    }
};

Copper.Session.updatePayload = function(newPayload, skipStoringToProfile) {
    Copper.Session.payload = newPayload;
    Copper.Session.informListeners("onPayloadUpdated");
    if (!skipStoringToProfile && Copper.Session.profiles.updateSelectedProfile(Copper.Session.settings, Copper.Session.options, Copper.Session.payload, Copper.Session.layout)){
        Copper.Session.updateProfiles(Copper.Session.profiles);
    }
};

Copper.Session.updateLayout = function(newLayout, skipStoringToProfile) {
    Copper.Session.layout = newLayout;
    Copper.Session.informListeners("onLayoutUpdated");
    if (!skipStoringToProfile && Copper.Session.profiles.updateSelectedProfile(Copper.Session.settings, Copper.Session.options, Copper.Session.payload, Copper.Session.layout)){
        Copper.Session.updateProfiles(Copper.Session.profiles);
    }
};

Copper.Session.updateProfiles = function(newProfiles, skipStoring) {
    Copper.Session.profiles = newProfiles;
    Copper.Session.informListeners("onProfilesUpdated");
    if (!skipStoring) Copper.Session.storageManager.storeProfiles(newProfiles);
};

Copper.Session.updateProfilesSelection = function(newProfiles, skipStoring) {
    Copper.Session.updateProfiles(newProfiles, skipStoring);
    Copper.Session.updateSettings(newProfiles.getSelectedProfile().settings.clone(), true);
    Copper.Session.updateOptions(newProfiles.getSelectedProfile().options.clone(), true);
    Copper.Session.updatePayload(newProfiles.getSelectedProfile().payload.clone(), true);
    Copper.Session.updateLayout(newProfiles.getSelectedProfile().layout.clone(), true);
    Copper.Session.informListeners("onSelectedProfileUpdated");
};

Copper.Session.updateResources = function(newResources, skipStoring) {
    Copper.Session.resources = newResources;
    Copper.Session.informListeners("onResourcesUpdated");
    if (!skipStoring) Copper.Session.storageManager.storeResources(newResources);
};