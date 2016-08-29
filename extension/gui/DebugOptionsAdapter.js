Copper.DebugOptionsAdapter = function(){
};

Copper.DebugOptionsAdapter.beforeSendingCoapMessage = function(coapMessage) {
    Copper.DebugOptionsAdapter.removeEmptyMultipleOptionInputs();
};

Copper.DebugOptionsAdapter.init = function() {
    Copper.DebugOptionsAdapter.initContentFormat();
    Copper.DebugOptionsAdapter.initResetListener();

    document.getElementById("chk_debug_options").onclick = Copper.DebugOptionsAdapter.onDebugOptionsEnabledChange;
    document.getElementById("chk_debug_option_block_auto").onclick = Copper.DebugOptionsAdapter.onBlockwiseEnabledChange;
    document.getElementById("debug_option_if_none_match").onclick = Copper.DebugOptionsAdapter.onIfNoneMatchChange;
    document.getElementById("debug_option_proxy_scheme").onclick = Copper.DebugOptionsAdapter.onProxySchemeChange;

    document.getElementById("debug_option_accept").onchange = Copper.DebugOptionsAdapter.onAcceptChange;
    document.getElementById("debug_option_content_format").onchange = Copper.DebugOptionsAdapter.onContentFormatChange;

    Copper.DebugOptionsAdapter.initSingleOptionsInputBox('debug_option_token', Copper.DebugOptionsAdapter.onTokenChange);
    Copper.DebugOptionsAdapter.initSingleOptionsInputBox('debug_option_block1', Copper.DebugOptionsAdapter.onBlock1Change);
    Copper.DebugOptionsAdapter.initSingleOptionsInputBox('debug_option_block2', Copper.DebugOptionsAdapter.onBlock2Change);
    Copper.DebugOptionsAdapter.initSingleOptionsInputBox('debug_option_size1', Copper.DebugOptionsAdapter.onSize1Change);
    Copper.DebugOptionsAdapter.initSingleOptionsInputBox('debug_option_size2', Copper.DebugOptionsAdapter.onSize2Change);
    Copper.DebugOptionsAdapter.initSingleOptionsInputBox('debug_option_observe', Copper.DebugOptionsAdapter.onObserveChange);
    Copper.DebugOptionsAdapter.initSingleOptionsInputBox('debug_option_uri_host', Copper.DebugOptionsAdapter.onUriHostChange);
    Copper.DebugOptionsAdapter.initSingleOptionsInputBox('debug_option_uri_port', Copper.DebugOptionsAdapter.onUriPortChange);
    Copper.DebugOptionsAdapter.initSingleOptionsInputBox('debug_option_proxy_uri', Copper.DebugOptionsAdapter.onProxyUriChange);
    Copper.DebugOptionsAdapter.initSingleOptionsInputBox('debug_option_max_age', Copper.DebugOptionsAdapter.onMaxAgeChange);

    Copper.DebugOptionsAdapter.initMultipleOptionsInputBox('debug_option_etags', Copper.DebugOptionsAdapter.onEtagsChange);
    Copper.DebugOptionsAdapter.initMultipleOptionsInputBox('debug_option_if_matchs', Copper.DebugOptionsAdapter.onIfMatchsChange);
    Copper.DebugOptionsAdapter.initMultipleOptionsInputBox('debug_option_location_paths', Copper.DebugOptionsAdapter.onLocationPathsChange);
    Copper.DebugOptionsAdapter.initMultipleOptionsInputBox('debug_option_location_queries', Copper.DebugOptionsAdapter.onLocationQueriesChange);
};

/**
 * Init Select Menus
 */
Copper.DebugOptionsAdapter.initContentFormat = function() {
    let acceptMenu = document.getElementById("debug_option_accept");
    let contentFormatMenu = document.getElementById("debug_option_content_format");

    for (let i = 0; i < Copper.CoapMessage.ContentFormat.Registry.length; i++) {
        let format = Copper.CoapMessage.ContentFormat.Registry[i];
        if (format.number > 100) {
            break;
        }
        let option = document.createElement("option");
        option.text = format.name;
        option.dataset.number = format.number;
        acceptMenu.add(option);

        option = document.createElement("option");
        option.text = format.name;
        option.dataset.number = format.number;

        contentFormatMenu.add(option);
    }
};

/**
 * Reset all options to default
 */
Copper.DebugOptionsAdapter.initResetListener = function() {
    let resetButton = document.getElementById("reset_button");
    resetButton.onclick = function() {
        Copper.Session.options = new Copper.Options();
        let sidebar = document.getElementById('sidebar');
        let allInputBoxes = sidebar.getElementsByTagName('INPUT');
        for (let i = 0; i < allInputBoxes.length; i++) {
            let nextInput = allInputBoxes[i];
            if (nextInput.type == "text") {
                nextInput.value = "";
            } else if (nextInput.type == "checkbox") {
                if (nextInput.id == "chk_debug_option_block_auto") {
                    nextInput.checked = true;
                } else {
                    nextInput.checked = false;
                }
            }
        }

        let allSelectionMenus = sidebar.getElementsByTagName("SELECT");
        for (let i = 0; i < allSelectionMenus.length; i++) {
            let nextSelectMenu = allSelectionMenus[i];
            nextSelectMenu.selectedIndex = 0;
        }
    }
};

/**
 * Load option settings once a profile was loaded
 */
Copper.DebugOptionsAdapter.onProfileLoaded = function() {
    let options = Copper.Session.options;
    let settings = Copper.Session.settings;
    if (options.optionsEnabled) {
        Copper.DebugOptionsAdapter.loadCheckbox("chk_debug_options");
    }

    if (options.ifNoneMatch) {
        Copper.DebugOptionsAdapter.loadCheckbox("debug_option_if_none_match");
    }

    if (options.proxyScheme) {
        Copper.DebugOptionsAdapter.loadCheckbox("debug_option_proxy_scheme");
    }

    if (options.accept !== undefined) {
        Copper.DebugOptionsAdapter.loadSelectionMenu("debug_option_accept", options.accept.index);
    }

    if (options.contentFormat !== undefined) {
        Copper.DebugOptionsAdapter.loadSelectionMenu("debug_option_content_format", options.contentFormat.index);
    }

    if (options.token !== undefined && options.token !== "") {
        Copper.DebugOptionsAdapter.loadSingleOptionInputBox("debug_option_token", options.token);
    }

    if (options.block1 !== undefined) {
        Copper.DebugOptionsAdapter.loadSingleOptionInputBox("debug_option_block1", options.block1);
    }

    if (options.block2 !== undefined) {
        Copper.DebugOptionsAdapter.loadSingleOptionInputBox("debug_option_block2", options.block2);
    }

    if (options.size1 !== undefined) {
        Copper.DebugOptionsAdapter.loadSingleOptionInputBox("debug_option_size1", options.size1);
    }

    if (options.size2 !== undefined) {
        Copper.DebugOptionsAdapter.loadSingleOptionInputBox("debug_option_size2", options.size2);
    }

    if (options.observe !== undefined) {
        Copper.DebugOptionsAdapter.loadSingleOptionInputBox("debug_option_observe", options.observe);
    }

    if (options.uriHost !== undefined) {
        Copper.DebugOptionsAdapter.loadSingleOptionInputBox("debug_option_uri_host", options.uriHost);
    }

    if (options.uriPort !== undefined) {
        Copper.DebugOptionsAdapter.loadSingleOptionInputBox("debug_option_uri_port", options.uriPort);
    }

    if (options.proxyUri !== undefined) {
        Copper.DebugOptionsAdapter.loadSingleOptionInputBox("debug_option_proxy_uri", options.proxyUri);
    }

    if (options.maxAge !== undefined) {
        Copper.DebugOptionsAdapter.loadSingleOptionInputBox("debug_option_max_age", options.maxAge);
    }

    if (options.etags !== undefined && options.etags.length > 0) {
        Copper.DebugOptionsAdapter.loadMultipleOptionInputBox("debug_option_etags", options.etags);
        options.removeEmptyMultipleOptions(options.etags);
    }

    if (options.ifMatchs !== undefined && options.ifMatchs.length > 0) {
        Copper.DebugOptionsAdapter.loadMultipleOptionInputBox("debug_option_if_matchs", options.ifMatchs);
        options.removeEmptyMultipleOptions(options.ifMatchs);
    }

    if (options.locationPaths !== undefined && options.locationPaths.length > 0) {
        Copper.DebugOptionsAdapter.loadMultipleOptionInputBox("debug_option_location_paths", options.locationPaths);
        options.removeEmptyMultipleOptions(options.locationPaths);
    }

    if (options.locationQueries !== undefined && options.locationQueries.length > 0) {
        Copper.DebugOptionsAdapter.loadMultipleOptionInputBox("debug_option_location_queries", options.locationQueries);
        options.removeEmptyMultipleOptions(options.locationQueries);
    }

    if (options.blockwiseEnabled) {
        Copper.DebugOptionsAdapter.loadCheckbox('chk_debug_option_block_auto', options.blockwiseEnabled);
        Copper.DebugOptionsAdapter.setBlockOptionAccess(false);
    }

    Copper.DebugOptionsAdapter.removeEmptyMultipleOptionInputs();
    Copper.DebugOptionsAdapter.loadAllInputTooltips();
};

Copper.DebugOptionsAdapter.loadCheckbox = function(id) {
    let checkbox = document.getElementById(id);
    checkbox.checked = true;
};

Copper.DebugOptionsAdapter.loadSelectionMenu = function(id, index) {
    let selectionMenu = document.getElementById(id);
    selectionMenu.selectedIndex = index;
};

Copper.DebugOptionsAdapter.loadSingleOptionInputBox = function(id, value) {
    let inputBox = document.getElementById(id);
    inputBox.value = value;
};

Copper.DebugOptionsAdapter.loadMultipleOptionInputBox = function(id, values) {
    let option = document.getElementById(id);

    // Init with stored values
    for (let i = 1; i < values.length; i++) {
        Copper.DebugOptionsAdapter.multipleOptionsHTMLFactory(id, values[i]);
    }

    // Init input box with add button with the first value
    option.firstElementChild.lastElementChild.firstElementChild.value = values[0];
};

Copper.DebugOptionsAdapter.loadAllInputTooltips = function() {
    let allTooltipInputs = document.getElementsByClassName("str2Hex");
    for (let i = 0; i < allTooltipInputs.length; i++) {
        let nextInput = allTooltipInputs[i];
        Copper.DebugOptionsAdapter.setStringToHexTooltip(nextInput);
    }
}

Copper.DebugOptionsAdapter.initSingleOptionsInputBox = function(inputId, onChangeFunction) {
    let input = document.getElementById(inputId);
    input.onchange = onChangeFunction;
    input.parentNode.lastElementChild.onclick = function () {
        input.value = "";
        onChangeFunction();
    }
};

Copper.DebugOptionsAdapter.initMultipleOptionsInputBox = function(id, onChangeFunction) {
    let option = document.getElementById(id);
    let optionChildren = option.children;
    let lastChild = option.lastElementChild.firstElementChild;
    lastChild.onclick = function() {
        Copper.DebugOptionsAdapter.multipleOptionsHTMLFactory(id);
    }
    for (let i = optionChildren.length-1; i >= 0; i--) {
        let next = optionChildren[i];
        let inputBox = next.lastElementChild.firstElementChild;

        inputBox.onchange = function() {
            onChangeFunction(inputBox.value, i);
            Copper.DebugOptionsAdapter.setStringToHexTooltip(inputBox);
        };
        let clearSign = next.lastElementChild.lastElementChild;
        clearSign.onclick = function() {
            inputBox.value = "";
            onChangeFunction(inputBox.value, i);
            Copper.DebugOptionsAdapter.setStringToHexTooltip(inputBox);
        }
    }
};

/**
 * Creates a new input text box with an optional text value and appends it to
 * the specified html option id.
 *
 * @param id            html id
 * @param inputValue    (optional) text value
 */
Copper.DebugOptionsAdapter.multipleOptionsHTMLFactory = function(id, inputValue) {
    let element = document.getElementById(id);
    let clearText = document.createElement("span");
    clearText.classList.add("clear_text");
    clearText.title = "Clear";
    clearText.innerHTML = '&times;';
    let div = document.createElement("div");
    div.classList.add("flex");
    div.classList.add("hbox");
    div.classList.add("last-option-with-add");
    let img = document.createElement("img");
    img.classList.add("add-option-button");
    img.src = "skin/collapsed.png";

    img.onclick = function () {
        Copper.DebugOptionsAdapter.multipleOptionsHTMLFactory(id);
    }

    element.lastElementChild.removeChild(element.lastElementChild.firstElementChild);
    let span = document.createElement("span");
    span.classList.add("flex");
    span.classList.add("hbox");
    span.classList.add("text-input-custom");
    let input = document.createElement("input");
    input.classList.add("flex");
    input.classList.add("str2Hex");
    input.type = "text";
    if (inputValue !== undefined) {
        input.value = inputValue;
    }
    let placeholder;
    switch(id) {
        case "debug_option_etags":
        case "debug_option_if_matchs":
            placeholder = 'use hex (0x..) or string';
            break;
        case "debug_option_location_paths":
        case "debug_option_location_queries":
            placeholder = 'not set';
            break;
    }
    input.placeholder = placeholder;
    span.appendChild(input);
    span.appendChild(clearText);
    div.appendChild(img);
    div.appendChild(span);
    element.appendChild(div);

    let newElementIndex = element.children.length - 1;
    input.onchange = function() {
        Copper.DebugOptionsAdapter.callOnChangeFunction(id, input.value, newElementIndex);
        Copper.DebugOptionsAdapter.setStringToHexTooltip(input);
    };
    clearText.onclick = function() {
        input.value = "";
        Copper.DebugOptionsAdapter.callOnChangeFunction(id, input.value, newElementIndex);
    };
};

/**
 * All onChange functions (on GUI Element change)
 */

Copper.DebugOptionsAdapter.onDebugOptionsEnabledChange = function() {
    Copper.Session.options.optionsEnabled = !Copper.Session.options.optionsEnabled;
    Copper.Session.storeChange();
};

Copper.DebugOptionsAdapter.onBlockwiseEnabledChange = function() {

    let blockwiseCheckbox = document.getElementById("chk_debug_option_block_auto");
    // Only change blockwise setting if debug option enabled
    if (Copper.Session.options.optionsEnabled) {
        Copper.Session.settings.blockwiseEnabled = !Copper.Session.settings.blockwiseEnabled;
        Copper.Session.clientEndpoint.updateSettings(Copper.Session.settings);
    }
    Copper.DebugOptionsAdapter.setBlockOptionAccess(!blockwiseCheckbox.checked);
};

Copper.DebugOptionsAdapter.onIfNoneMatchChange = function() {
    Copper.Session.options.ifNoneMatch = !Copper.Session.options.ifNoneMatch;
    Copper.Session.storeChange();
};

Copper.DebugOptionsAdapter.onProxySchemeChange = function() {
    Copper.Session.options.proxyScheme = !Copper.Session.options.proxyScheme;
    Copper.Session.storeChange();
};

Copper.DebugOptionsAdapter.onTokenChange = function() {
    let token = document.getElementById("debug_option_token");
    Copper.Session.options.token = token.value;
    Copper.DebugOptionsAdapter.setStringToHexTooltip(token);
    Copper.Session.storeChange();
};

Copper.DebugOptionsAdapter.onAcceptChange = function() {
    let acceptMenu = document.getElementById("debug_option_accept");
    let selectedIndex = acceptMenu.selectedIndex;
    if (selectedIndex === 0) {
        Copper.Session.options.accept = undefined;
    } else {
        let selectedAcceptFormatNumber = acceptMenu.options[selectedIndex].dataset.number;
        Copper.Session.options.accept = {number: parseInt(selectedAcceptFormatNumber), index: selectedIndex} ;
    }
    Copper.Session.storeChange();
};

Copper.DebugOptionsAdapter.onContentFormatChange = function() {
    let contentFormatMenu = document.getElementById("debug_option_content_format");
    let selectedIndex = contentFormatMenu.selectedIndex;
    if (selectedIndex === 0) {
        Copper.Session.options.contentFormat = undefined;
    } else {
        let selectedContentFormatNumber = contentFormatMenu.options[selectedIndex].dataset.number;
        Copper.Session.options.contentFormat = {number: parseInt(selectedContentFormatNumber), index: selectedIndex};
    }
    Copper.Session.storeChange();
};

Copper.DebugOptionsAdapter.onBlock1Change = function() {
    let block1 = document.getElementById("debug_option_block1");
    if (block1.value === "") {
        Copper.Session.options.block1 = undefined;
    } else {
        Copper.Session.options.block1 = parseInt(block1.value);
    }
    Copper.Session.storeChange();
};

Copper.DebugOptionsAdapter.onBlock2Change = function() {
    let block2 = document.getElementById("debug_option_block2");
    if (block2.value === "") {
        Copper.Session.options.block2 = undefined;
    } else {
        Copper.Session.options.block2 = parseInt(block2.value);
    }
    Copper.Session.storeChange();
};

Copper.DebugOptionsAdapter.onSize1Change = function() {
    let size1 = document.getElementById("debug_option_size1");
    if (size1.value === "") {
        Copper.Session.options.size1 = undefined;
    } else {
        Copper.Session.options.size1 = parseInt(size1.value);
    }
    Copper.Session.storeChange();
};

Copper.DebugOptionsAdapter.onSize2Change = function() {
    let size2 = document.getElementById("debug_option_size2");
    if (size2.value === "") {
        Copper.Session.options.size2 = undefined;
    } else {
        Copper.Session.options.size2 = parseInt(size2.value);
    }
    Copper.Session.storeChange();
};

Copper.DebugOptionsAdapter.onObserveChange = function() {
    let observe = document.getElementById("debug_option_observe");
    if (observe.value === "") {
        Copper.Session.options.observe = undefined;
    } else {
        Copper.Session.options.observe = parseInt(observe.value);
    }
    Copper.Session.storeChange();
};

Copper.DebugOptionsAdapter.onUriHostChange = function() {
    let uriHost = document.getElementById("debug_option_uri_host");
    Copper.Session.options.uriHost = uriHost.value;
    Copper.Session.storeChange();
};

Copper.DebugOptionsAdapter.onUriPortChange = function() {
    let uriPort = document.getElementById("debug_option_uri_port");
    if (uriPort.value === "") {
        Copper.Session.options.uriPort = undefined;
    } else {
        Copper.Session.options.uriPort = parseInt(uriPort.value);
    }
    Copper.Session.storeChange();
};

Copper.DebugOptionsAdapter.onProxyUriChange = function() {
    let proxyUri = document.getElementById("debug_option_proxy_uri");
    Copper.Session.options.proxyUri = proxyUri.value;
    Copper.Session.storeChange();
};

Copper.DebugOptionsAdapter.onMaxAgeChange = function() {
    let maxAge = document.getElementById("debug_option_max_age");
    if (maxAge.value === "") {
        Copper.Session.options.maxAge = undefined;
    } else {
        Copper.Session.options.maxAge = parseInt(maxAge.value);
    }
    Copper.Session.storeChange();
};

Copper.DebugOptionsAdapter.onEtagsChange = function(value, index) {
    Copper.Session.options.etags[index] = value;
    Copper.Session.storeChange();
};

Copper.DebugOptionsAdapter.onIfMatchsChange = function(value, index) {
    Copper.Session.options.ifMatchs[index] = value;
    Copper.Session.storeChange();
};

Copper.DebugOptionsAdapter.onLocationPathsChange = function(value, index) {
    Copper.Session.options.locationPaths[index] = value;
    Copper.Session.storeChange();
};

Copper.DebugOptionsAdapter.onLocationQueriesChange = function(value, index) {
    Copper.Session.options.locationQueries[index] = value;
    Copper.Session.storeChange();
};

/**
 * Status: True -> Enable all block options
 * Status: False -> Disable all block options
 * @param status
 */
Copper.DebugOptionsAdapter.setBlockOptionAccess = function(status) {
    let blockOptions = document.getElementById("sidebar_block_options");
    let inputs = blockOptions.getElementsByTagName("INPUT");
    for (let i = 0; i < inputs.length; i++) {
        let nextInput = inputs[i];
        if (nextInput.type === "text") {
            nextInput.disabled = !status;
        }
    }
};

/**
 * Called to remove all empty input text boxes of multipleOptions.
 * Ensures that always one input box with an add-button will remain (even if its empty).
 * @param id    html id
 */
Copper.DebugOptionsAdapter.removeEmptyMultipleOptionInputs = function(id) {
    let allMultipleOptions = document.getElementsByClassName("multiple-options");
    for (let i = 0; i < allMultipleOptions.length; i++) {
        let next = allMultipleOptions[i];
        let removedInputBoxes = false;
        // Remove all empty input boxes, except the last one
        let childrenCount = next.children.length;
        for (let j = 0; j < next.children.length-1;) {
            let optionChild = next.children[j];
            if (optionChild.lastElementChild.firstElementChild.value == "") {
                next.removeChild(optionChild);
                removedInputBoxes = true;
            } else {
                j++;
            }
        }

        /**
         * If last input box is empty remove it and add the "option-add-button" to the
         * input box that was above (and now is last), but only if there are more than 1 box
         * (Avoid deleting the last empty box)
         **/
        let lastOption = next.lastElementChild;
        if (next.children.length != 1) {
            if (lastOption.lastElementChild.firstElementChild.value == "") {
                removedInputBoxes = true;
                next.removeChild(lastOption);
                lastOption = next.lastElementChild;
                lastOption.classList.add("last-option-with-add");
                let addButton = document.createElement("img");
                addButton.classList.add("add-option-button");
                addButton.src = "skin/collapsed.png";
                addButton.onclick = function () {
                    Copper.DebugOptionsAdapter.multipleOptionsHTMLFactory(next.id);
                }
                lastOption.insertBefore(addButton, lastOption.firstElementChild);
            }
        }

        // If input boxes were removed change indexes for 'onChange' functions
        if (removedInputBoxes) {
            for (let j = next.children.length - 1, index = 0; j >= 0; j--, index++) {
                let optionChild = next.children[j];
                let inputBox = optionChild.lastElementChild.firstElementChild;

                inputBox.onchange = function () {
                    Copper.DebugOptionsAdapter.callOnChangeFunction(next.id, inputBox.value, index);
                };
                let clearSign = optionChild.lastElementChild.lastElementChild;
                clearSign.onclick = function () {
                    inputBox.value = "";
                    Copper.DebugOptionsAdapter.callOnChangeFunction(next.id, inputBox.value, index);
                }
            }
            Copper.Session.storeChange();
        }
    }
};

/**
 * Call multipleOptions onChange function with value and index depending on id
 * @param id
 * @param value
 * @param index
 */
Copper.DebugOptionsAdapter.callOnChangeFunction = function(id, value, index) {
    switch(id) {
        case "debug_option_etags":
            Copper.DebugOptionsAdapter.onEtagsChange(value, index);
            break;
        case "debug_option_if_matchs":
            Copper.DebugOptionsAdapter.onIfMatchsChange(value, index);
            break;
        case "debug_option_location_paths":
            Copper.DebugOptionsAdapter.onLocationPathsChange(value, index);
            break;
        case "debug_option_location_queries":
            Copper.DebugOptionsAdapter.onLocationQueriesChange(value, index);
            break;
    }
};

/**
 * Only called for elements with class 'str2Hex"
 * @param element   html element
 */
Copper.DebugOptionsAdapter.setStringToHexTooltip = function(element) {
    if (element.value !== "" && element.value.substr(0, 2) !== '0x') {
        element.title = Copper.ByteUtils.convertBytesToHexString(Copper.ByteUtils.convertStringToBytes(element.value));
    }
    else {
        element.removeAttribute("title");
    }
};