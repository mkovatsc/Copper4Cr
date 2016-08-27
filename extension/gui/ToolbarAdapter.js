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

Copper.ToolbarAdapter.chooseFileDefaultString = "Choose File...";

Copper.ToolbarAdapter.optionsWindowOpened = false;

Copper.ToolbarAdapter.ongoingDiscoverRequest = false;

Copper.ToolbarAdapter.onEvent = function(event){
    switch(event.type){
        case Copper.Event.TYPE_COAP_MESSAGE_SENT:
            let observeOption = event.data.coapMessage.getOption(Copper.CoapMessage.OptionHeader.OBSERVE);
            if (observeOption.length > 0 && observeOption[0] === 0){
                let rootElement = document.getElementById("copper-toolbar-observe");
                if (rootElement.firstChild.src.endsWith("skin/tool_observe.png")) {
                    rootElement.firstChild.src = "skin/tool_unobserve.png";
                    rootElement.lastChild.textContent = " Cancel";
                }
            }
            break;
        case Copper.Event.TYPE_REQUEST_CANCELED:
            let rootElement = document.getElementById("copper-toolbar-observe");
            if (rootElement.firstChild.src.endsWith("skin/tool_unobserve.png")) {
                rootElement.firstChild.src = "skin/tool_observe.png";
                rootElement.lastChild.textContent = " Observe";
            }
            break;
    }
};

Copper.ToolbarAdapter.beforeSendingCoapMessage = function(coapMessage) {
};

Copper.ToolbarAdapter.init = function(){
	document.getElementById("copper-toolbar-ping").onclick = Copper.ToolbarAdapter.doPing;
	document.getElementById("copper-toolbar-discover").onclick = Copper.ToolbarAdapter.doDiscover;
	document.getElementById("copper-toolbar-get").onclick = Copper.ToolbarAdapter.doGet;
	document.getElementById("copper-toolbar-post").onclick = Copper.ToolbarAdapter.doPost;
	document.getElementById("copper-toolbar-put").onclick = Copper.ToolbarAdapter.doPut;
	document.getElementById("copper-toolbar-delete").onclick = Copper.ToolbarAdapter.doDelete;
	document.getElementById("copper-toolbar-observe").onclick = Copper.ToolbarAdapter.doObserve;
	document.getElementById("copper-toolbar-payload-mode-text").onclick = Copper.ToolbarAdapter.payloadModeText;
	document.getElementById("copper-toolbar-payload-mode-file").onclick = Copper.ToolbarAdapter.payloadModeFile;
	document.getElementById("copper-toolbar-payload-choose-file").onclick = function() { Copper.ToolbarAdapter.chooseFile(); };
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
    document.getElementById("copper-toolbar-profiles-standard").onclick = Copper.ToolbarAdapter.profilesStandardProfile;
    document.getElementById("copper-toolbar-profiles-auto-store").onclick = Copper.ToolbarAdapter.profilesAutoStore;
    document.getElementById("copper-toolbar-profiles-store-current").onclick = Copper.ToolbarAdapter.profilesStoreCurrent;
    document.getElementById("copper-toolbar-log-event-symbol").onclick = Copper.ToolbarAdapter.doLog;
    document.getElementById("copper-toolbar-preferences").onclick = Copper.ToolbarAdapter.openPreferences;

    // Dropdowns
    let dropdowns = document.getElementsByClassName("copper-toolbar-dropdown-button");
    for (let i = 0; i < dropdowns.length; i++) {
        dropdowns[i].onclick = Copper.ToolbarAdapter.openDropdown;
    }
};

Copper.ToolbarAdapter.onProfileLoaded = function() {
    let profiles = Copper.Session.profiles;
    let settings = Copper.Session.settings;

    for (let profileKey in profiles.allProfiles) {

        if (profileKey !== Copper.Profiles.defaultProfile) {
            let element = document.getElementById("copper-toolbar-profiles-profile-" + profileKey.split(' ').join('-'));
            if (element === null) {
                Copper.ProfilesAdapter.addNewHTMLDropdownProfile(profileKey, profiles, profileKey === Copper.Profiles.selectedProfile);
            }
        }
    }

    if (profiles.autoStore) {
        Copper.ToolbarAdapter.checkboxElement("copper-toolbar-profiles-auto-store");
    }

    if (Copper.Profiles.selectedProfile === Copper.Profiles.defaultProfile) {
        let standardProfile = document.getElementById("copper-toolbar-profiles-standard");
        standardProfile.firstElementChild.classList.remove("hidden");
        standardProfile.firstElementChild.classList.add("selected");
    }

    if (settings.payloadMode !== undefined) {
        if (settings.payloadMode === "text") {
            Copper.ToolbarAdapter.radioElement("copper-toolbar-payload-mode-text");
        } else {
            Copper.ToolbarAdapter.radioElement("copper-toolbar-payload-mode-file");
        }
    }

    if (settings.payloadFileName !== undefined) {
        if (settings.payloadFileName !== "") {
            var chooseFile = document.getElementById("copper-toolbar-payload-choose-file");
            chooseFile.getElementsByTagName('p')[0].innerHTML = settings.payloadFileName;
        }
    }


    if (settings.requests !== undefined) {
        if (settings.requests.name === Copper.CoapMessage.Type.CON.name) {
            Copper.ToolbarAdapter.radioElement("copper-toolbar-behavior-request-con");
        } else {
            Copper.ToolbarAdapter.radioElement("copper-toolbar-behavior-request-non");
        }
    } else {
        // Default CON
        Copper.ToolbarAdapter.radioElement("copper-toolbar-behavior-request-con");
    }

    // Default true
    if (settings.retransmissions !== undefined) {
        if (settings.retransmission) {
            Copper.ToolbarAdapter.checkboxElement("copper-toolbar-behavior-retransmissions");
        }
    } else {
        Copper.ToolbarAdapter.checkboxElement("copper-toolbar-behavior-retransmissions");
    }

    // Default false
    if (settings.sendDuplicates) {
        Copper.ToolbarAdapter.checkboxElement("copper-toolbar-behavior-duplicates");
    }

    // Default true
    if (settings.showUnknown !== undefined) {
        if (settings.showUnknown) {
            Copper.ToolbarAdapter.checkboxElement("copper-toolbar-behavior-display-unknown");
        }
    } else {
        Copper.ToolbarAdapter.checkboxElement("copper-toolbar-behavior-display-unknown");
    }

    // Default true
    if (settings.rejectUnknown !== undefined) {
        if (settings.rejectUnknown) {
            Copper.ToolbarAdapter.checkboxElement("copper-toolbar-behavior-reject-unknown");
        }
    } else {
        Copper.ToolbarAdapter.checkboxElement("copper-toolbar-behavior-reject-unknown");
    }

    // Default false
    if (settings.sendUriHost) {
        Copper.ToolbarAdapter.checkboxElement("copper-toolbar-behavior-send-uri-host");
    }

    // Default false
    if (settings.sendSize1) {
        Copper.ToolbarAdapter.checkboxElement("copper-toolbar-behavior-send-size1");
    }

    if (settings.blockSize !== undefined) {
        switch(settings.blockSize) {
            case 0:
                Copper.ToolbarAdapter.radioElement("copper-toolbar-behavior-block-size-0");
                break;
            case 4:
                Copper.ToolbarAdapter.radioElement("copper-toolbar-behavior-block-size-16");
                break;
            case 5:
                Copper.ToolbarAdapter.radioElement("copper-toolbar-behavior-block-size-32");
                break;
            case 6:
                Copper.ToolbarAdapter.radioElement("copper-toolbar-behavior-block-size-64");
                break;
            case 7:
                Copper.ToolbarAdapter.radioElement("copper-toolbar-behavior-block-size-128");
                break;
            case 8:
                Copper.ToolbarAdapter.radioElement("copper-toolbar-behavior-block-size-256");
                break;
            case 9:
                Copper.ToolbarAdapter.radioElement("copper-toolbar-behavior-block-size-512");
                break;
            case 10:
                Copper.ToolbarAdapter.radioElement("copper-toolbar-behavior-block-size-1024");
                break;
        }
    } else {
        // Default
        Copper.ToolbarAdapter.radioElement("copper-toolbar-behavior-block-size-64");
    }

    // Default true
    if (settings.observeToken !== undefined) {
        if (settings.observeToken) {
            Copper.ToolbarAdapter.checkboxElement("copper-toolbar-behavior-token-observe");
        }
    } else {
        Copper.ToolbarAdapter.checkboxElement("copper-toolbar-behavior-token-observe");
    }

    if (settings.observeCancellation !== undefined) {
        switch(settings.observeCancellation) {
            case "lazy":
                Copper.ToolbarAdapter.radioElement("copper-toolbar-behavior-observe-lazy");
                break;
            case "get":
                Copper.ToolbarAdapter.radioElement("copper-toolbar-behavior-observe-get");
                break;
            case "rst":
                Copper.ToolbarAdapter.radioElement("copper-toolbar-behavior-observe-rst");
                break;
        }
    } else {
        // Default
        Copper.ToolbarAdapter.radioElement("copper-toolbar-behavior-observe-lazy");
    }
};

Copper.ToolbarAdapter.doPing = function(){
    let coapMessage = new Copper.CoapMessage(Copper.Session.settings.requests, Copper.CoapMessage.Code.EMPTY);
	Copper.Session.sendCoapMessage(coapMessage, true);
};

Copper.ToolbarAdapter.doDiscover = function(){
	let coapMessage = new Copper.CoapMessage(Copper.Session.settings.requests, Copper.CoapMessage.Code.GET);
	coapMessage.addOption(Copper.CoapMessage.OptionHeader.URI_PATH, ".well-known");
	coapMessage.addOption(Copper.CoapMessage.OptionHeader.URI_PATH, "core");
    Copper.ToolbarAdapter.ongoingDiscoverRequest = true;
	Copper.Session.sendCoapMessage(coapMessage, true);
};

Copper.ToolbarAdapter.doGet = function(){
	let coapMessage = new Copper.CoapMessage(Copper.Session.settings.requests, Copper.CoapMessage.Code.GET);
	Copper.Session.sendCoapMessage(coapMessage);
};

Copper.ToolbarAdapter.doPost = function(){
	let coapMessage = new Copper.CoapMessage(Copper.Session.settings.requests, Copper.CoapMessage.Code.POST);
	Copper.Session.sendCoapMessage(coapMessage);
};

Copper.ToolbarAdapter.doPut = function(){
	let coapMessage = new Copper.CoapMessage(Copper.Session.settings.requests, Copper.CoapMessage.Code.PUT);
	Copper.Session.sendCoapMessage(coapMessage);
};

Copper.ToolbarAdapter.doDelete = function(){
	let coapMessage = new Copper.CoapMessage(Copper.Session.settings.requests, Copper.CoapMessage.Code.DELETE);
	Copper.Session.sendCoapMessage(coapMessage);
};

Copper.ToolbarAdapter.doObserve = function(){
    let rootElement = document.getElementById("copper-toolbar-observe");
    if (rootElement.firstChild.src.endsWith("skin/tool_unobserve.png")) {
        // stop observing
        Copper.Session.clientEndpoint.cancelRequests();
    }
    else {
        // start observing
        let coapMessage = new Copper.CoapMessage(Copper.Session.settings.requests, Copper.CoapMessage.Code.GET);
        coapMessage.addOption(Copper.CoapMessage.OptionHeader.OBSERVE, 0);
        Copper.Session.sendCoapMessage(coapMessage);
    }
};

Copper.ToolbarAdapter.openDropdown = function(){
    var button = this;
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
        while (elementClicked !== null) {

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
    Copper.Session.settings.payloadMode = "text";
    Copper.ToolbarAdapter.radioElement(this.id);
    Copper.Session.clientEndpoint.updateSettings(Copper.Session.settings);

};

Copper.ToolbarAdapter.payloadModeFile = function() {
    var chooseFile = document.getElementById("copper-toolbar-payload-choose-file");

    if (chooseFile.getElementsByTagName('p')[0].innerHTML === Copper.ToolbarAdapter.chooseFileDefaultString) {
        Copper.ToolbarAdapter.chooseFile(this.id);
    } else {
        Copper.Session.settings.payloadMode = "file";
        Copper.ToolbarAdapter.radioElement(this.id);
        Copper.Session.clientEndpoint.updateSettings(Copper.Session.settings);
    }

};

Copper.ToolbarAdapter.behaviorRequestCon = function() {
    Copper.Session.settings.requests = Copper.CoapMessage.Type.CON;
    Copper.ToolbarAdapter.radioElement(this.id);
    Copper.Session.clientEndpoint.updateSettings(Copper.Session.settings);
};

Copper.ToolbarAdapter.behaviorRequestNon = function() {
    Copper.Session.settings.requests = Copper.CoapMessage.Type.NON;
    Copper.ToolbarAdapter.radioElement(this.id);
    Copper.Session.clientEndpoint.updateSettings(Copper.Session.settings);
};

Copper.ToolbarAdapter.behaviorRetransmissions = function() {
    Copper.Session.settings.retransmissions = !Copper.Session.settings.retransmissions;
    Copper.ToolbarAdapter.checkboxElement(this.id);
    Copper.Session.clientEndpoint.updateSettings(Copper.Session.settings);
};

Copper.ToolbarAdapter.behaviorDuplicates = function() {
    Copper.Session.settings.sendDuplicates = !Copper.Session.settings.sendDuplicates;
    Copper.ToolbarAdapter.checkboxElement(this.id);
    Copper.Session.clientEndpoint.updateSettings(Copper.Session.settings);
};

Copper.ToolbarAdapter.behaviorDisplayUnknown = function() {
    Copper.Session.settings.showUnknown = !Copper.Session.settings.showUnknown;
    Copper.ToolbarAdapter.checkboxElement(this.id);
    Copper.Session.clientEndpoint.updateSettings(Copper.Session.settings);
};

Copper.ToolbarAdapter.behaviorRejectUnknown = function() {
    Copper.Session.settings.rejectUnknown = !Copper.Session.settings.rejectUnknown;
    Copper.ToolbarAdapter.checkboxElement(this.id);
    Copper.Session.clientEndpoint.updateSettings(Copper.Session.settings);
};

Copper.ToolbarAdapter.behaviorUriHost = function() {
    Copper.Session.settings.sendUriHost = !Copper.Session.settings.sendUriHost;
    Copper.ToolbarAdapter.checkboxElement(this.id);
    Copper.Session.clientEndpoint.updateSettings(Copper.Session.settings);
};

Copper.ToolbarAdapter.behaviorSendSize1 = function() {
    Copper.Session.settings.sendSize1 = !Copper.Session.settings.sendSize1;
    Copper.ToolbarAdapter.checkboxElement(this.id);
    Copper.Session.clientEndpoint.updateSettings(Copper.Session.settings);
};

Copper.ToolbarAdapter.behaviorBlockSize0 = function() {
    Copper.Session.settings.blockSize = 0;
    Copper.ToolbarAdapter.radioElement(this.id);
    Copper.Session.clientEndpoint.updateSettings(Copper.Session.settings);
};

Copper.ToolbarAdapter.behaviorBlockSize16 = function() {
    Copper.Session.settings.blockSize = 4;
    Copper.ToolbarAdapter.radioElement(this.id);
    Copper.Session.clientEndpoint.updateSettings(Copper.Session.settings);
};

Copper.ToolbarAdapter.behaviorBlockSize32 = function() {
    Copper.Session.settings.blockSize = 5;
    Copper.ToolbarAdapter.radioElement(this.id);
    Copper.Session.clientEndpoint.updateSettings(Copper.Session.settings);
};

Copper.ToolbarAdapter.behaviorBlockSize64 = function() {
    Copper.Session.settings.blockSize = 6;
    Copper.ToolbarAdapter.radioElement(this.id);
    Copper.Session.clientEndpoint.updateSettings(Copper.Session.settings);
};

Copper.ToolbarAdapter.behaviorBlockSize128 = function() {
    Copper.Session.settings.blockSize = 7;
    Copper.ToolbarAdapter.radioElement(this.id);
    Copper.Session.clientEndpoint.updateSettings(Copper.Session.settings);
};

Copper.ToolbarAdapter.behaviorBlockSize256 = function() {
    Copper.Session.settings.blockSize = 8;
    Copper.ToolbarAdapter.radioElement(this.id);
    Copper.Session.clientEndpoint.updateSettings(Copper.Session.settings);
};

Copper.ToolbarAdapter.behaviorBlockSize512 = function() {
    Copper.Session.settings.blockSize = 9;
    Copper.ToolbarAdapter.radioElement(this.id);
    Copper.Session.clientEndpoint.updateSettings(Copper.Session.settings);
};

Copper.ToolbarAdapter.behaviorBlockSize1024 = function() {
    Copper.Session.settings.blockSize = 10;
    Copper.ToolbarAdapter.radioElement(this.id);
    Copper.Session.clientEndpoint.updateSettings(Copper.Session.settings);
};

Copper.ToolbarAdapter.behaviorObserveToken = function() {
    Copper.Session.settings.observeToken = !Copper.Session.settings.observeToken;
    Copper.ToolbarAdapter.checkboxElement(this.id);
    Copper.Session.clientEndpoint.updateSettings(Copper.Session.settings);
};

Copper.ToolbarAdapter.behaviorObserveLazy = function() {
    Copper.Session.settings.observeCancellation = "lazy";
    Copper.ToolbarAdapter.radioElement(this.id);
    Copper.Session.clientEndpoint.updateSettings(Copper.Session.settings);
};

Copper.ToolbarAdapter.behaviorObserveGet = function() {
    Copper.Session.settings.observeCancellation = "get";
    Copper.ToolbarAdapter.radioElement(this.id);
    Copper.Session.clientEndpoint.updateSettings(Copper.Session.settings);
};

Copper.ToolbarAdapter.behaviorObserveRst = function() {
    Copper.Session.settings.observeCancellation = "rst";
    Copper.ToolbarAdapter.radioElement(this.id);
    Copper.Session.clientEndpoint.updateSettings(Copper.Session.settings);
};

Copper.ToolbarAdapter.profilesStandardProfile = function() {
    Copper.ToolbarAdapter.radioElement(this.id);
    Copper.Session.profiles.changeProfile(Copper.Profiles.defaultProfile);
};

Copper.ToolbarAdapter.profilesAutoStore = function() {
    Copper.ToolbarAdapter.checkboxElement(this.id);
    Copper.Session.profiles.autoStore = !Copper.Session.profiles.autoStore;
    Copper.Session.storeChange();
};

Copper.ToolbarAdapter.profilesStoreCurrent = function() {
    Copper.Session.profiles.updateCurrentProfile(true);
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

/**
 *
 * @param id If set => switch radio button to file, otherwise not
 */
Copper.ToolbarAdapter.chooseFile = function(id) {
    var chooseFile = document.getElementById("copper-toolbar-payload-choose-file");

    var input = document.createElement("input");
    input.type = "file";
    input.style.display = "none";

    // Set menu entry to file name once selected
    input.onchange = function(event) {
        if (id !== undefined) {
            Copper.Session.settings.payloadMode = "file";
            Copper.ToolbarAdapter.radioElement("copper-toolbar-payload-mode-file");
        }
        
        let file = event.target.files[0];
        let reader = new FileReader();

        reader.onload = function(event) {
            Copper.Session.settings.payloadFileData = reader.result;
            Copper.Session.clientEndpoint.updateSettings(Copper.Session.settings);
        }
        reader.readAsArrayBuffer(file);


        let value = this.value.split('\\').pop().split('/').pop();
        chooseFile.getElementsByTagName('p')[0].innerHTML = value;
        Copper.Session.settings.payloadFileName = value;
        Copper.Session.clientEndpoint.updateSettings(Copper.Session.settings);

    }
    input.click();
};

Copper.ToolbarAdapter.resetPayload = function() {
    var chooseFile = document.getElementById("copper-toolbar-payload-choose-file");
    chooseFile.getElementsByTagName('p')[0].innerHTML = Copper.ToolbarAdapter.chooseFileDefaultString;
    Copper.ToolbarAdapter.radioElement("copper-toolbar-payload-mode-text");
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

Copper.ToolbarAdapter.openPreferences = function() {
    var preferencesWindow = document.getElementById("preferences-window").parentElement;
    preferencesWindow.classList.remove("hidden");
};
