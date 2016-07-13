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

Copper.ToolbarAdapter.payload = undefined;
Copper.ToolbarAdapter.requests = undefined;
Copper.ToolbarAdapter.retransmissions = false;
Copper.ToolbarAdapter.sendDuplicates = false;
Copper.ToolbarAdapter.showUnknown = false;
Copper.ToolbarAdapter.rejectUnknown = false;
Copper.ToolbarAdapter.sendUriHost = false;
Copper.ToolbarAdapter.sendSize1 = false;
Copper.ToolbarAdapter.blockSize = undefined;
Copper.ToolbarAdapter.observeToken = false;
Copper.ToolbarAdapter.observeCancellation = undefined;

Copper.ToolbarAdapter.payloadFile = undefined;

Copper.ToolbarAdapter.optionsWindowOpened = false;



Copper.ToolbarAdapter.onEvent = function(event){
};

Copper.ToolbarAdapter.beforeSendingCoapMessage = function(coapMessage){
};

Copper.ToolbarAdapter.init = function(){
	document.getElementById("copper-toolbar-ping").onclick = Copper.ToolbarAdapter.doPing;
	document.getElementById("copper-toolbar-discover").onclick = Copper.ToolbarAdapter.doDiscover;
	document.getElementById("copper-toolbar-get").onclick = Copper.ToolbarAdapter.doGet;
	document.getElementById("copper-toolbar-post").onclick = Copper.ToolbarAdapter.doPost;
	document.getElementById("copper-toolbar-put").onclick = Copper.ToolbarAdapter.doPut;
	document.getElementById("copper-toolbar-delete").onclick = Copper.ToolbarAdapter.doDelete;
	document.getElementById("copper-toolbar-observe").onclick = Copper.ToolbarAdapter.doObserve;
	document.getElementById("copper-toolbar-payload-button").onclick = Copper.ToolbarAdapter.openDropdown;
	document.getElementById("copper-toolbar-behavior-button").onclick = Copper.ToolbarAdapter.openDropdown;
	document.getElementById("copper-toolbar-payload-mode-text").onclick = Copper.ToolbarAdapter.payloadModeText;
	document.getElementById("copper-toolbar-payload-mode-file").onclick = Copper.ToolbarAdapter.payloadModeFile;
	document.getElementById("copper-toolbar-payload-choose-file").onclick = Copper.ToolbarAdapter.chooseFile;
    document.getElementById("copper-toolbar-behavior-request-con").onclick = Copper.ToolbarAdapter.behaviorRequestCon;
    document.getElementById("copper-toolbar-behavior-request-non").onclick = Copper.ToolbarAdapter.behaviorRequestNon;
    document.getElementById("copper-toolbar-behavior-retransmissions").onclick = Copper.ToolbarAdapter.behaviorRetransmissions;
    document.getElementById("copper-toolbar-behavior-duplicates").onclick = Copper.ToolbarAdapter.behaviorDuplicates;
    document.getElementById("copper-toolbar-behavior-display-unknown").onclick = Copper.ToolbarAdapter.behaviorDisplayUnknown;
    document.getElementById("copper-toolbar-behavior-reject-unknown").onclick = Copper.ToolbarAdapter.behaviorRejectUnknown;
    document.getElementById("copper-toolbar-behavior-send-uri-host").onclick = Copper.ToolbarAdapter.behaviorUriHost;
    document.getElementById("copper-toolbar-behavior-send-size1").onclick = Copper.ToolbarAdapter.behaviorSendSize1;
    document.getElementById("copper-toolbar-behavior-block-size-0").onclick = Copper.ToolbarAdapter.behaviorBlockSize0;
    document.getElementById("copper-toolbar-behavior-block-size-16").onclick = Copper.ToolbarAdapter.behaviorBlockSize16;
    document.getElementById("copper-toolbar-behavior-block-size-32").onclick = Copper.ToolbarAdapter.behaviorBlockSize32;
    document.getElementById("copper-toolbar-behavior-block-size-64").onclick = Copper.ToolbarAdapter.behaviorBlockSize64;
    document.getElementById("copper-toolbar-behavior-block-size-128").onclick = Copper.ToolbarAdapter.behaviorBlockSize128;
    document.getElementById("copper-toolbar-behavior-block-size-256").onclick = Copper.ToolbarAdapter.behaviorBlockSize256;
    document.getElementById("copper-toolbar-behavior-block-size-512").onclick = Copper.ToolbarAdapter.behaviorBlockSize512;
    document.getElementById("copper-toolbar-behavior-block-size-1024").onclick = Copper.ToolbarAdapter.behaviorBlockSize1024;
    document.getElementById("copper-toolbar-behavior-token-observe").onclick = Copper.ToolbarAdapter.behaviorObserveToken;
    document.getElementById("copper-toolbar-behavior-observe-lazy").onclick = Copper.ToolbarAdapter.behaviorObserveLazy;
    document.getElementById("copper-toolbar-behavior-observe-get").onclick = Copper.ToolbarAdapter.behaviorObserveGet;
    document.getElementById("copper-toolbar-behavior-observe-rst").onclick = Copper.ToolbarAdapter.behaviorObserveRst;
    document.getElementById("copper-toolbar-log-event-symbol").onclick = Copper.ToolbarAdapter.doLog;
    document.getElementById("copper-toolbar-preferences").onclick = Copper.ToolbarAdapter.doPreferences;

    Copper.ToolbarAdapter.loadOldSettingsOrDefault();
};

Copper.ToolbarAdapter.loadOldSettingsOrDefault = function() {
    Copper.ComponentFactory.retrieveLocally("radio-payload", Copper.ToolbarAdapter.retrieveMenuPayload);
    Copper.ComponentFactory.retrieveLocally("radio-request", Copper.ToolbarAdapter.retrieveMenuRequests);
    Copper.ComponentFactory.retrieveLocally("copper-toolbar-behavior-retransmissions", Copper.ToolbarAdapter.retrieveMenuRetransmissions);
    Copper.ComponentFactory.retrieveLocally("copper-toolbar-behavior-duplicates", Copper.ToolbarAdapter.retrieveDefaultUncheckedMenuCheckbox);
    Copper.ComponentFactory.retrieveLocally("copper-toolbar-behavior-display-unknown", Copper.ToolbarAdapter.retrieveDefaultUncheckedMenuCheckbox);
    Copper.ComponentFactory.retrieveLocally("copper-toolbar-behavior-reject-unknown", Copper.ToolbarAdapter.retrieveMenuRejectUnknown);
    Copper.ComponentFactory.retrieveLocally("copper-toolbar-behavior-send-uri-host", Copper.ToolbarAdapter.retrieveDefaultUncheckedMenuCheckbox);
    Copper.ComponentFactory.retrieveLocally("copper-toolbar-behavior-send-size1", Copper.ToolbarAdapter.retrieveDefaultUncheckedMenuCheckbox);
    Copper.ComponentFactory.retrieveLocally("radio-blockSize", Copper.ToolbarAdapter.retrieveMenuBlockSize);
    Copper.ComponentFactory.retrieveLocally("copper-toolbar-behavior-token-observe", Copper.ToolbarAdapter.retrieveMenuObserveToken);
    Copper.ComponentFactory.retrieveLocally("radio-observeCancellation", Copper.ToolbarAdapter.retrieveMenuObserveCancellation);
};

// Radio
Copper.ToolbarAdapter.retrieveMenuPayload = function(key, items) {
    let id = items[key];
    if (!Copper.ToolbarAdapter.loadRadioValueIfExist(id)) {
        Copper.ToolbarAdapter.loadDefault("copper-toolbar-payload-mode-text");
    } else {
        Copper.ComponentFactory.retrieveLocally("menu-chooseFile", Copper.ToolbarAdapter.retrieveChosenFile);
    }
};

// Chosen File
Copper.ToolbarAdapter.retrieveChosenFile = function(key, items) {
    let fileName = items[key];
    if (fileName !== undefined) {
        Copper.ToolbarAdapter.payloadFile = fileName;

        let chooseFile = document.getElementById("copper-toolbar-payload-choose-file");
        chooseFile.getElementsByTagName('p')[0].innerHTML = fileName;
    }
};

// Radio
Copper.ToolbarAdapter.retrieveMenuRequests = function(key, items) {
    let id = items[key];
    if (!Copper.ToolbarAdapter.loadRadioValueIfExist(id)) {
        Copper.ToolbarAdapter.loadDefault("copper-toolbar-behavior-request-con");
    }
};

// Checkbox
Copper.ToolbarAdapter.retrieveMenuRetransmissions = function(id, items) {
    let checked = items[id];
    if (!Copper.ToolbarAdapter.loadCheckboxValueIfExist(checked, id)) {
        Copper.ToolbarAdapter.loadDefault("copper-toolbar-behavior-retransmissions");
    }
};

// Checkbox
Copper.ToolbarAdapter.retrieveMenuRejectUnknown = function(id, items) {
    let checked = items[id];
    if (!Copper.ToolbarAdapter.loadCheckboxValueIfExist(checked, id)) {
        Copper.ToolbarAdapter.loadDefault("copper-toolbar-behavior-reject-unknown");
    }
};

// Radio
Copper.ToolbarAdapter.retrieveMenuBlockSize = function(key, items) {
    let id = items[key];
    if (!Copper.ToolbarAdapter.loadRadioValueIfExist(id)) {
        Copper.ToolbarAdapter.loadDefault("copper-toolbar-behavior-block-size-64");
    }
};

// Checkbox
Copper.ToolbarAdapter.retrieveMenuObserveToken = function(id, items) {
    let checked = items[id];
    if (!Copper.ToolbarAdapter.loadCheckboxValueIfExist(checked, id)) {
        Copper.ToolbarAdapter.loadDefault("copper-toolbar-behavior-token-observe");
    }
};

// Radio
Copper.ToolbarAdapter.retrieveMenuObserveCancellation = function(key, items) {
    let id = items[key];
    if (!Copper.ToolbarAdapter.loadRadioValueIfExist(id)) {
        Copper.ToolbarAdapter.loadDefault("copper-toolbar-behavior-observe-lazy");
    }
};

// Default 'unchecked'
Copper.ToolbarAdapter.retrieveDefaultUncheckedMenuCheckbox = function(id, items) {
    let checked = items[id];
    Copper.ToolbarAdapter.loadCheckboxValueIfExist(checked, id);
};

Copper.ToolbarAdapter.loadRadioValueIfExist = function(id) {
    if (id !== undefined) {
        let element = document.getElementById(id);
        element.onclick.apply(element);
        return true;
    } else {
        return false;
    }
};

Copper.ToolbarAdapter.loadCheckboxValueIfExist = function(checked, id) {
    if (checked !== undefined) {
        if (checked) {
            let element = document.getElementById(id);
            element.onclick.apply(element);
        }
        return true;
    } else {
        return false;
    }
};

Copper.ToolbarAdapter.loadDefault = function(id) {
    let element = document.getElementById(id);
    element.onclick.apply(element);
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

Copper.ToolbarAdapter.openDropdown = function(){
    var button = document.getElementById(this.id);
    var containerId = button.parentNode.id;

    // Open/Close dropdown menu on button click
    var element  = document.getElementById(containerId).lastElementChild;
    if (element.classList.contains('hidden')) {
        element.classList.remove('hidden');
        button.classList.add('focused')
    } else {
        element.classList.add('hidden');
        button.classList.remove('focused');
    }

    // Close all other currently opened dropdown menus (if any)
    var dropdowns = document.getElementsByClassName("dropdown-content");
    for (let i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (!openDropdown.classList.contains('hidden') && openDropdown !== element) {
            openDropdown.classList.add('hidden');
            openDropdown.parentNode.firstElementChild.classList.remove('focused')
        }
    }

    // Close the dropdown menu if the user clicks outside of it
    window.onclick = function(event) {
        var dropdown = document.getElementById(containerId);
        var elementClicked = event.target;

        // Close dropdown if click was outside of it
        // Check if there is the dropdown container in the parent chain (stop after more than 5 levels or if parent null)
        var j = 0;
        while (elementClicked !== null && j < 5) {

            if (elementClicked === dropdown) {
                return;
            }
            elementClicked = elementClicked.parentElement;
            j++;
        }

        for (let i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (!openDropdown.classList.contains('hidden')) {
                openDropdown.classList.add('hidden');
                openDropdown.parentNode.firstElementChild.classList.remove('focused')
            }
        }
    }
};

Copper.ToolbarAdapter.payloadModeText = function() {
    Copper.ToolbarAdapter.payload = "text";
    Copper.ToolbarAdapter.radioElement(this.id);
    Copper.ComponentFactory.storeLocally("radio-payload", this.id);
};

Copper.ToolbarAdapter.payloadModeFile = function() {
    Copper.ToolbarAdapter.payload = "file";
    Copper.ToolbarAdapter.radioElement(this.id);
    Copper.ToolbarAdapter.chooseFile();
    Copper.ComponentFactory.storeLocally("radio-payload", this.id);

};

Copper.ToolbarAdapter.behaviorRequestCon = function() {
    Copper.ToolbarAdapter.requests = "con";
    Copper.ToolbarAdapter.radioElement(this.id);
    Copper.ComponentFactory.storeLocally("radio-request", this.id);
};

Copper.ToolbarAdapter.behaviorRequestNon = function() {
    Copper.ToolbarAdapter.requests = "non";
    Copper.ToolbarAdapter.radioElement(this.id);
    Copper.ComponentFactory.storeLocally("radio-request", this.id);
};

Copper.ToolbarAdapter.behaviorRetransmissions = function() {
    Copper.ToolbarAdapter.retransmissions = !Copper.ToolbarAdapter.retransmissions;
    Copper.ToolbarAdapter.checkboxElement(this.id);
    Copper.ComponentFactory.storeLocally(this.id, Copper.ToolbarAdapter.retransmissions);
};

Copper.ToolbarAdapter.behaviorDuplicates = function() {
    Copper.ToolbarAdapter.sendDuplicates = !Copper.ToolbarAdapter.sendDuplicates;
    Copper.ToolbarAdapter.checkboxElement(this.id);
    Copper.ComponentFactory.storeLocally(this.id, Copper.ToolbarAdapter.sendDuplicates);
};

Copper.ToolbarAdapter.behaviorDisplayUnknown = function() {
    Copper.ToolbarAdapter.showUnknown = !Copper.ToolbarAdapter.showUnknown;
    Copper.ToolbarAdapter.checkboxElement(this.id);
    Copper.ComponentFactory.storeLocally(this.id, Copper.ToolbarAdapter.showUnknown);
};

Copper.ToolbarAdapter.behaviorRejectUnknown = function() {
    Copper.ToolbarAdapter.rejectUnknown = !Copper.ToolbarAdapter.rejectUnknown;
    Copper.ToolbarAdapter.checkboxElement(this.id);
    Copper.ComponentFactory.storeLocally(this.id, Copper.ToolbarAdapter.rejectUnknown);
};

Copper.ToolbarAdapter.behaviorUriHost = function() {
    Copper.ToolbarAdapter.sendUriHost = !Copper.ToolbarAdapter.sendUriHost;
    Copper.ToolbarAdapter.checkboxElement(this.id);
    Copper.ComponentFactory.storeLocally(this.id, Copper.ToolbarAdapter.sendUriHost);
};

Copper.ToolbarAdapter.behaviorSendSize1 = function() {
    Copper.ToolbarAdapter.sendSize1 = !Copper.ToolbarAdapter.sendSize1;
    Copper.ToolbarAdapter.checkboxElement(this.id);
    Copper.ComponentFactory.storeLocally(this.id, Copper.ToolbarAdapter.sendSize1);
};

Copper.ToolbarAdapter.behaviorBlockSize0 = function() {
    Copper.ToolbarAdapter.blockSize = 0;
    Copper.ToolbarAdapter.radioElement(this.id);
    Copper.ComponentFactory.storeLocally("radio-blockSize", this.id);
};

Copper.ToolbarAdapter.behaviorBlockSize16 = function() {
    Copper.ToolbarAdapter.blockSize = 16;
    Copper.ToolbarAdapter.radioElement(this.id);
    Copper.ComponentFactory.storeLocally("radio-blockSize", this.id);
};

Copper.ToolbarAdapter.behaviorBlockSize32 = function() {
    Copper.ToolbarAdapter.blockSize = 32;
    Copper.ToolbarAdapter.radioElement(this.id);
    Copper.ComponentFactory.storeLocally("radio-blockSize", this.id);
};

Copper.ToolbarAdapter.behaviorBlockSize64 = function() {
    Copper.ToolbarAdapter.blockSize = 64;
    Copper.ToolbarAdapter.radioElement(this.id);
    Copper.ComponentFactory.storeLocally("radio-blockSize", this.id);
};

Copper.ToolbarAdapter.behaviorBlockSize128 = function() {
    Copper.ToolbarAdapter.blockSize = 128;
    Copper.ToolbarAdapter.radioElement(this.id);
    Copper.ComponentFactory.storeLocally("radio-blockSize", this.id);
};

Copper.ToolbarAdapter.behaviorBlockSize256 = function() {
    Copper.ToolbarAdapter.blockSize = 256;
    Copper.ToolbarAdapter.radioElement(this.id);
    Copper.ComponentFactory.storeLocally("radio-blockSize", this.id);
};

Copper.ToolbarAdapter.behaviorBlockSize512 = function() {
    Copper.ToolbarAdapter.blockSize = 512;
    Copper.ToolbarAdapter.radioElement(this.id);
    Copper.ComponentFactory.storeLocally("radio-blockSize", this.id);
};

Copper.ToolbarAdapter.behaviorBlockSize1024 = function() {
    Copper.ToolbarAdapter.blockSize = 1024;
    Copper.ToolbarAdapter.radioElement(this.id);
    Copper.ComponentFactory.storeLocally("radio-blockSize", this.id);
};

Copper.ToolbarAdapter.behaviorObserveToken = function() {
    Copper.ToolbarAdapter.observeToken = !Copper.ToolbarAdapter.observeToken;
    Copper.ToolbarAdapter.checkboxElement(this.id);
    Copper.ComponentFactory.storeLocally(this.id, Copper.ToolbarAdapter.observeToken);
};

Copper.ToolbarAdapter.behaviorObserveLazy = function() {
    Copper.ToolbarAdapter.observeCancellation = "lazy";
    Copper.ToolbarAdapter.radioElement(this.id);
    Copper.ComponentFactory.storeLocally("radio-observeCancellation", this.id);
};

Copper.ToolbarAdapter.behaviorObserveGet = function() {
    Copper.ToolbarAdapter.observeCancellation = "get";
    Copper.ToolbarAdapter.radioElement(this.id);
    Copper.ComponentFactory.storeLocally("radio-observeCancellation", this.id);
};

Copper.ToolbarAdapter.behaviorObserveRst = function() {
    Copper.ToolbarAdapter.observeCancellation = "rest";
    Copper.ToolbarAdapter.radioElement(this.id);
    Copper.ComponentFactory.storeLocally("radio-observeCancellation", this.id);
};

Copper.ToolbarAdapter.checkboxElement = function(id) {
    var element = document.getElementById(id).firstElementChild;
    if (!element.classList.contains('hidden')) {
        element.classList.add('hidden');
        element.classList.remove('selected');
    } else {
        element.classList.remove('hidden');
        element.classList.add('selected');
    }
};

Copper.ToolbarAdapter.radioElement = function(id) {
    var selectedElement = document.getElementById(id).firstElementChild;
    var selectionGroup = document.getElementById(id).parentNode;

    if (selectedElement.classList.contains('hidden')) {

        // Remove the other selected nodes;
        var othersInGroup = selectionGroup.getElementsByClassName("selection-icon");
        for (let i = 0; i < othersInGroup.length; i++) {
            var icon = othersInGroup[i];
            if (!icon.classList.contains('hidden')) {
                icon.classList.add('hidden');
            }
        }
        selectedElement.classList.remove('hidden');
        selectedElement.classList.add('selected');
    }
};

Copper.ToolbarAdapter.chooseFile = function() {
    var chooseFile = document.getElementById("copper-toolbar-payload-choose-file");
    var input = chooseFile.lastElementChild;

    // Set menu entry to file name once selected
    input.onchange = function() {
        let value = this.value.split('\\').pop().split('/').pop();
        chooseFile.getElementsByTagName('p')[0].innerHTML = value;
        Copper.ToolbarAdapter.payloadFile = value;
        Copper.ComponentFactory.storeLocally("menu-chooseFile", value);
    }
    input.click();
};

Copper.ToolbarAdapter.doLog = function(event) {
    var log = document.getElementById("copper-toolbar-log-event-log");
    if (log.classList.contains("hidden")) {
        log.classList.remove("hidden");
    } else {
        log.classList.add("hidden");
    }

    // Close the log div if click outside of div
    window.onmousedown = function(event) {
        var elementClicked = event.target;
        var log_event_symbol = document.getElementById("copper-toolbar-log-event-symbol");

        // Check if in hierarchy, if not hide (click outside of log div)
        while (elementClicked !== null) {
            if (elementClicked === log || elementClicked === log_event_symbol) {
                return;
            }
            elementClicked = elementClicked.parentElement;
        }

        // Close if clicked outside
        log.classList.add("hidden");
    }
};

// TODO: Add into factory or find a better way to avoid opening more than 1 window
Copper.ToolbarAdapter.doPreferences = function() {
    var windowId;
    chrome.windows.onCreated.addListener(function(newWindow) {
        Copper.ToolbarAdapter.optionsWindowOpened = true;
    });

    // Avoid opening more than 1 window
    if (!Copper.ToolbarAdapter.optionsWindowOpened) {
        windowId = Copper.OptionsAdapter.openWindow();
    }
    chrome.windows.onRemoved.addListener(function(id) {
        Copper.ToolbarAdapter.optionsWindowOpened = false;
    });
};

