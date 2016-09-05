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

window.onload = function(){
    Copper.Log.registerLogger(Copper.ConsoleLogger.log);
    Copper.Session.initialize();
};

Copper.Session = function(){
};

Copper.Session.clientId = undefined;
Copper.Session.storageManager = undefined;

Copper.Session.profileName = undefined;
Copper.Session.settings = undefined;
Copper.Session.options = undefined;
Copper.Session.payload = undefined;
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
*   - onCoapEndpointResolved
*   - onResourcesUpdated
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
        Copper.ErrorWindowAdapter,
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
    
    Copper.Session.storageManager.loadPayload(function(payload){
        Copper.Session.updatePayload(payload === undefined ? new Copper.Payload() : payload, true);
        
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
                Copper.ErrorWindowAdapter.closeInfoWindow();

                Copper.Session.clientEndpoint = new Copper.ClientEndpoint(port, Copper.Session.clientId);
                Copper.Session.localPort = event.port;
                Copper.Session.startExtension();

                break;
            case Copper.Event.TYPE_ERROR_ON_SERVER: 
                Copper.ErrorWindowAdapter.openErrorWindow("Error", "Error " + event.data.errorType + ": " + event.data.errorMessage);
                break;
            default:
                Copper.ErrorWindowAdapter.openErrorWindow("Error: Invalid Event", "Error: Invalid Event", "Received invalid event(" + event.type + ") from app. Please restart the extension.");
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
    Copper.ErrorWindowAdapter.openErrorWindow("Error " + errorNo, errorMessage);
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
            Copper.CopperUtils.splitOptionAndAddToCoapMessage(coapMessage, Copper.CoapMessage.OptionHeader.URI_PATH, Copper.Session.path, "/");
            Copper.CopperUtils.splitOptionAndAddToCoapMessage(coapMessage, Copper.CoapMessage.OptionHeader.URI_QUERY, Copper.Session.query, "&");

            if (Copper.Session.options.optionsEnabled){
                blockwiseEnabled = Copper.Session.options.blockwiseEnabled;
                Copper.Session.options.addOptionsToCoapMessage(coapMessage, Copper.Session.settings.blockSize);
            }

            Copper.Session.informListeners("beforeSendingCoapMessage", [coapMessage]);
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
    Copper.ErrorWindowAdapter.openErrorWindow("Connection lost...", "Connection to Copper app lost. Please restart the extension.");
};

Copper.Session.storeChange = function() {
    Copper.Session.profiles.updateCurrentProfile();
};

Copper.Session.updateSettings = function(newSettings, skipStoringToProfile) {
    Copper.Session.settings = newSettings;
    Copper.Session.informListeners("onSettingsUpdated");
    if (this.clientEndpoint !== undefined) this.clientEndpoint.updateSettings(newSettings);
    if (!skipStoringToProfile && Copper.Session.profiles.updateSelectedProfile(Copper.Session.settings, Copper.Session.options)){
        Copper.Session.updateProfiles(Copper.Session.profiles);
    }
};

Copper.Session.updateOptions = function(newOptions, skipStoringToProfile) {
    Copper.Session.options = newOptions;
    Copper.Session.informListeners("onOptionsUpdated");
    if (!skipStoringToProfile && Copper.Session.profiles.updateSelectedProfile(Copper.Session.settings, Copper.Session.options)){
        Copper.Session.updateProfiles(Copper.Session.profiles);
    }
};

Copper.Session.updatePayload = function(newPayload, skipStoring) {
    Copper.Session.payload = newPayload;
    Copper.Session.informListeners("onPayloadUpdated");
    if (!skipStoring) Copper.Session.storageManager.storePayload(newPayload);
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
};

Copper.Session.updateResources = function(newResources, skipStoring) {
    Copper.Session.resources = newResources;
    Copper.Session.informListeners("onResourcesUpdated");
    if (!skipStoring) Copper.Session.storageManager.storeResources(newResources);
};