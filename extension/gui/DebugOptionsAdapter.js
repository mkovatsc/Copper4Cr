Copper.DebugOptionsAdapter = function(){
};

Copper.DebugOptionsAdapter.beforeSendingCoapMessage = function(coapMessage){
   for (var optionId in Copper.DebugOptionsAdapter.allDebugOptionValues) {
       if (optionId !== undefined)
       {
           let value = Copper.DebugOptionsAdapter.allDebugOptionValues[optionId];
           if (value === "" || value === false) {
               continue;
           }
           if (optionId === "debug_option_token") {
               // Add token to message
               var token;
               if (value === 'empty' || value === '0x') {
                   token = new ArrayBuffer(0);
               } else if (value.substr(0, 2) === '0x') {
                   token = Copper.ByteUtils.convertHexStringToBytes(value);
               } else {
                   token = Copper.ByteUtils.convertStringToBytes(value);
               }
               
               coapMessage.setToken(token);
           } else if (optionId !== "") {
               // Add option to message
               let optionHeader = Copper.DebugOptionsAdapter.htmlIdToOptionHeader[optionId];
               if (optionHeader !== undefined) {

                   if (value === true) {
                       // Convert to 0 for If-None-Match
                       value = 0;
                   } //TODO: Elseif for accept and content format
                   coapMessage.addOption(optionHeader, value, false); // TODO: Last elem?
               }
           }
           // TODO: add one option more than once
       }
   } 
};

var inputs;
var selectMenus;

Copper.DebugOptionsAdapter.allDebugOptionValues = undefined;
Copper.DebugOptionsAdapter.htmlIdToOptionHeader = undefined;

Copper.DebugOptionsAdapter.init = function() {
    let sidebar = document.getElementById("sidebar-debug-options");
    inputs = sidebar.getElementsByTagName("INPUT");
    selectMenus = sidebar.getElementsByTagName("SELECT");

    Copper.DebugOptionsAdapter.allDebugOptionValues = {};
    Copper.DebugOptionsAdapter.initMappinghtmlIdToOptionHeader();

    Copper.DebugOptionsAdapter.addClearInputListener();
    Copper.DebugOptionsAdapter.addChangeListeners();

    Copper.DebugOptionsAdapter.addResetListener();
    Copper.DebugOptionsAdapter.loadOldOptionSettingsOrDefault();
};

Copper.DebugOptionsAdapter.initMappinghtmlIdToOptionHeader = function() {
    var options = {};
    options['debug_option_accept'] = Copper.CoapMessage.OptionHeader.ACCEPT;
    options['debug_option_content_format'] = Copper.CoapMessage.OptionHeader.CONTENT_FORMAT;
    options['debug_option_block1'] = Copper.CoapMessage.OptionHeader.BLOCK1;
    options['debug_option_size1'] = Copper.CoapMessage.OptionHeader.SIZE1;
    options['debug_option_block2'] = Copper.CoapMessage.OptionHeader.BLOCK2;
    options['debug_option_size2'] = Copper.CoapMessage.OptionHeader.SIZE2;
    options['debug_option_observe'] = Copper.CoapMessage.OptionHeader.OBSERVE;
    options['debug_option_etag'] = Copper.CoapMessage.OptionHeader.ETAG;
    options['debug_option_if_match'] = Copper.CoapMessage.OptionHeader.IF_MATCH;
    options['debug_option_if_none_match'] = Copper.CoapMessage.OptionHeader.IF_NONE_MATCH;
    options['debug_option_uri_host'] = Copper.CoapMessage.OptionHeader.URI_HOST;
    options['debug_option_uri_port'] = Copper.CoapMessage.OptionHeader.URI_PORT;
    options['debug_option_proxy_uri'] = Copper.CoapMessage.OptionHeader.PROXY_URI;
    options['debug_option_proxy_scheme'] = Copper.CoapMessage.OptionHeader.PROXY_SCHEME;
    options['debug_option_max_age'] = Copper.CoapMessage.OptionHeader.MAX_AGE;
    options['debug_option_location_path'] = Copper.CoapMessage.OptionHeader.LOCATION_PATH;
    options['debug_option_location_query'] = Copper.CoapMessage.OptionHeader.LOCATION_QUERY;
    Copper.DebugOptionsAdapter.htmlIdToOptionHeader = options;
};

// Clear text input boxes
Copper.DebugOptionsAdapter.addClearInputListener = function() {
    for (let i = 0; i < inputs.length; i++) {
        let nextInput = inputs[i];
        let clearSign = nextInput.parentNode.lastElementChild;
        clearSign.onclick = function () {
            nextInput.value = "";
        }
    }
};

// Store newly set options
Copper.DebugOptionsAdapter.addChangeListeners = function() {
    for (let i = 0; i < inputs.length; i++) {
        let nextInput = inputs[i];
        if (nextInput.type == "text") {
            nextInput.onchange = function () {
                Copper.DebugOptionsAdapter.storeOptionState(this.id, this.value);
                Copper.DebugOptionsAdapter.allDebugOptionValues[this.id] = this.value;
            }
        } else {
            nextInput.onchange = function () {
                Copper.DebugOptionsAdapter.storeOptionState(this.id, this.checked);
                Copper.DebugOptionsAdapter.allDebugOptionValues[this.id] = this.checked;
            }
        }
    }

    for (let i = 0; i < selectMenus.length; i++) {
        let nextSelectMenu = selectMenus[i];
        nextSelectMenu.onchange = function () {
            Copper.DebugOptionsAdapter.storeOptionState(this.id, this.selectedIndex);
            Copper.DebugOptionsAdapter.allDebugOptionValues[this.id] = this.selectedIndex;
        }
    }
};

/*
    Store/Retrieve options for future sessions
 */
Copper.DebugOptionsAdapter.storeOptionState = function(id, value) {
    Copper.ComponentFactory.storeLocally(id, value);
}

Copper.DebugOptionsAdapter.retrieveInputTextOptionState = function(id, items) {
    let stored = items[id];
    let textInput = document.getElementById(id);
    textInput.value = (stored === undefined ? "" : stored);
    Copper.DebugOptionsAdapter.allDebugOptionValues[id] = textInput.value;
}


Copper.DebugOptionsAdapter.retrieveInputCheckboxOptionState = function(id, items) {
    let stored = items[id];
    let checkboxInput = document.getElementById(id);
    if (id == "chk_debug_option_block_auto") {
        checkboxInput.checked = (stored === undefined ? true : stored);
    } else {
        checkboxInput.checked = (stored === undefined ? false : stored);
    }
    Copper.DebugOptionsAdapter.allDebugOptionValues[id] = checkboxInput.checked;
}

Copper.DebugOptionsAdapter.retrieveSelectionMenuOptionState = function(id, items) {
    let stored = items[id];
    let selectionMenu = document.getElementById(id);
    selectionMenu.selectedIndex = (stored === undefined ? 0 : stored);
    Copper.DebugOptionsAdapter.allDebugOptionValues[id] = selectionMenu.selectedIndex;
}


Copper.DebugOptionsAdapter.addResetListener = function() {
    let resetButton = document.getElementById("reset_button");
    resetButton.onclick = Copper.DebugOptionsAdapter.setDefaultValues;

};


Copper.DebugOptionsAdapter.setDefaultValues = function() {
    for (let i = 0; i < inputs.length; i++) {
        let nextInput = inputs[i];
        if (nextInput.type == "text") {
            nextInput.value = "";
            Copper.DebugOptionsAdapter.storeOptionState(nextInput.id, nextInput.value);
        } else if (nextInput.type == "checkbox") {
            if (nextInput.id == "chk_debug_option_block_auto") {
                nextInput.checked = true;
            } else {
                nextInput.checked = false;
            }
            Copper.DebugOptionsAdapter.storeOptionState(nextInput.id, nextInput.checked);
        }
    }

    for (let i = 0; i < selectMenus.length; i++) {
        let nextSelectMenu = selectMenus[i];
        nextSelectMenu.selectedIndex = 0;
        Copper.DebugOptionsAdapter.storeOptionState(nextSelectMenu.id, nextSelectMenu.selectedIndex);
    }
};

Copper.DebugOptionsAdapter.loadOldOptionSettingsOrDefault = function() {
    for (let i = 0; i < inputs.length; i++) {
        let nextInput = inputs[i];
        if (nextInput.type == "text") {
            Copper.ComponentFactory.retrieveLocally(nextInput.id, Copper.DebugOptionsAdapter.retrieveInputTextOptionState);
        } else if (nextInput.type == "checkbox") {
            Copper.ComponentFactory.retrieveLocally(nextInput.id, Copper.DebugOptionsAdapter.retrieveInputCheckboxOptionState);
        }
    }

    for (let i = 0; i < selectMenus.length; i++) {
        let nextSelectMenu = selectMenus[i];
        Copper.ComponentFactory.retrieveLocally(nextSelectMenu.id, Copper.DebugOptionsAdapter.retrieveSelectionMenuOptionState);
    }
}

Copper.DebugOptionsAdapter.onEvent = function(event){
};