Copper.DebugOptionsAdapter = function(){
};

Copper.DebugOptionsAdapter.beforeSendingCoapMessage = function(coapMessage) {
    //Copper.DebugOptionsAdapter.removeEmptyMultipleOptionInputs();
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

    Copper.DebugOptionsAdapter.initMultipleOptionsInputBox('debug_option_etags');
    Copper.DebugOptionsAdapter.initMultipleOptionsInputBox('debug_option_if_matchs');
    Copper.DebugOptionsAdapter.initMultipleOptionsInputBox('debug_option_location_paths');
    Copper.DebugOptionsAdapter.initMultipleOptionsInputBox('debug_option_location_queries');
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
        Copper.DebugOptionsAdapter.resetAllDebugOptions();
    }
};

/**
 * Reset all options to default
 */
Copper.DebugOptionsAdapter.resetAllDebugOptions = function() {
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
    Copper.DebugOptionsAdapter.removeAllEmptyMultipleOptionInputs();
};

/**
 * Load option settings once a profile was loaded
 */
Copper.DebugOptionsAdapter.onProfileLoaded = function() {
    let options = Copper.Session.options;
    let settings = Copper.Session.settings;

    // Checkboxes
    Copper.DebugOptionsAdapter.loadCheckbox("chk_debug_options", options.optionsEnabled);
    Copper.DebugOptionsAdapter.loadCheckbox("debug_option_if_none_match", options.ifNoneMatch);
    Copper.DebugOptionsAdapter.loadCheckbox("debug_option_proxy_scheme", options.proxyScheme);
    Copper.DebugOptionsAdapter.loadCheckbox('chk_debug_option_block_auto', options.blockwiseEnabled);

    // Block options disabled if blockwise transfer enabled
    if (options.blockwiseEnabled) {
        Copper.DebugOptionsAdapter.setBlockOptionAccess(false);
    }

    // Selection menus
    Copper.DebugOptionsAdapter.loadSelectionMenu("debug_option_accept", options.accept);
    Copper.DebugOptionsAdapter.loadSelectionMenu("debug_option_content_format", options.contentFormat);

    // Single options with input box
    Copper.DebugOptionsAdapter.loadSingleOptionInputBox("debug_option_token", options.token);
    Copper.DebugOptionsAdapter.loadSingleOptionInputBox("debug_option_block1", options.block1);
    Copper.DebugOptionsAdapter.loadSingleOptionInputBox("debug_option_block2", options.block2);
    Copper.DebugOptionsAdapter.loadSingleOptionInputBox("debug_option_size1", options.size1);
    Copper.DebugOptionsAdapter.loadSingleOptionInputBox("debug_option_size2", options.size2);
    Copper.DebugOptionsAdapter.loadSingleOptionInputBox("debug_option_observe", options.observe);
    Copper.DebugOptionsAdapter.loadSingleOptionInputBox("debug_option_uri_host", options.uriHost);
    Copper.DebugOptionsAdapter.loadSingleOptionInputBox("debug_option_uri_port", options.uriPort);
    Copper.DebugOptionsAdapter.loadSingleOptionInputBox("debug_option_proxy_uri", options.proxyUri);
    Copper.DebugOptionsAdapter.loadSingleOptionInputBox("debug_option_max_age", options.maxAge);

    // Multiple Options
    Copper.DebugOptionsAdapter.loadMultipleOptionInputBox("debug_option_etags", options.etags);
    Copper.DebugOptionsAdapter.loadMultipleOptionInputBox("debug_option_if_matchs", options.ifMatchs);
    Copper.DebugOptionsAdapter.loadMultipleOptionInputBox("debug_option_location_paths", options.locationPaths);
    Copper.DebugOptionsAdapter.loadMultipleOptionInputBox("debug_option_location_queries", options.locationQueries);

    Copper.DebugOptionsAdapter.loadAllInputTooltips();
};

/**
 * Load checkbox value based on option value. The default value will be selected
 * as defined in the prototype
 * @param id
 * @param option
 */
Copper.DebugOptionsAdapter.loadCheckbox = function(id, checked) {
    let checkbox = document.getElementById(id);
    checkbox.checked = checked;
};

Copper.DebugOptionsAdapter.loadSelectionMenu = function(id, option) {
    let index;

    if (option === undefined) {
        index = 0;
    } else {
        index = option.index;
    }

    let selectionMenu = document.getElementById(id);
    selectionMenu.selectedIndex = index;
};

Copper.DebugOptionsAdapter.loadSingleOptionInputBox = function(id, value) {
    if (value === undefined) {
        value = "";
    }
    let inputBox = document.getElementById(id);

    inputBox.value = value;
};

Copper.DebugOptionsAdapter.loadMultipleOptionInputBox = function(id, values) {
    let option = document.getElementById(id);

    if (values.length === 0) {
        // No value in storage
        option.firstElementChild.lastElementChild.firstElementChild.value = "";
    } else {
        // Init if only one value
        option.firstElementChild.lastElementChild.firstElementChild.value = values[0];
        if (values.length === 1 && values[0] !== "") {
            Copper.DebugOptionsAdapter.addNewMultipleOptionsEntry(id);
        }

        // Init with stored values
        for (let i = 1; i < values.length; i++) {
            Copper.DebugOptionsAdapter.addNewMultipleOptionsEntry(id, values[i]);
        }
    }
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
    input.onchange = onChangeFunction; //TODO: oninput
    input.parentNode.lastElementChild.onclick = function () {
        input.value = "";
        onChangeFunction();
    }
};

Copper.DebugOptionsAdapter.initMultipleOptionsInputBox = function(id) {
    let option = document.getElementById(id);
    let optionChildren = option.children;
    let lastChild = option.lastElementChild.firstElementChild;
    lastChild.onclick = function() {
        //Copper.DebugOptionsAdapter.addNewMultipleOptionsEntry(id);
    }
    for (let i = optionChildren.length-1; i >= 0; i--) {
        let next = optionChildren[i];
        let inputBox = next.lastElementChild.firstElementChild;

        inputBox.oninput = function () {
            Copper.DebugOptionsAdapter.callOnChangeFunction(id, inputBox.value, i);
            if (inputBox.value === "") {
                Copper.DebugOptionsAdapter.removeEmptyMultipleOptionInputs(inputBox, id);
            } else {
                Copper.DebugOptionsAdapter.addNewMultipleOptionsEntry(id);
            }
            Copper.DebugOptionsAdapter.setStringToHexTooltip(inputBox);
        };
        let clearSign = next.lastElementChild.lastElementChild;
        clearSign.onclick = function () {
            inputBox.value = "";
            Copper.DebugOptionsAdapter.callOnChangeFunction(id, inputBox.value, i);
            Copper.DebugOptionsAdapter.setStringToHexTooltip(inputBox);
        }
    }
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
        if (!Copper.Numeric.isPositiveInteger(observe.value)) {
            Copper.DebugOptionsAdapter.setValidityOfInput(observe, false);
        } else {
            Copper.DebugOptionsAdapter.setValidityOfInput(observe, true);
            Copper.Session.options.observe = parseInt(observe.value);
        }
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

Copper.DebugOptionsAdapter.setValidityOfInput = function(element, valid, errorcode) {
    if (valid) {
        element.classList.remove("invalid_input");
    } else  {
        // Invalid input
        element.classList.add("invalid_input");
    }
}

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
 * Creates a new input text box with an optional text value and appends it to
 * the specified html option id.
 *
 * @param id            html id
 * @param inputValue    (optional) text value
 */
Copper.DebugOptionsAdapter.addNewMultipleOptionsEntry = function(id, inputValue) {
    let element = document.getElementById(id);
    let emptyInputBoxesCount = 0;
    let emptyInputBoxes = [];
    for (let i = 0; i < element.children.length; i++) {
        let next = element.children[i];
        if (next.lastElementChild.firstElementChild.value === "") {
            emptyInputBoxesCount++;
            emptyInputBoxes.push(next);
        }
    }
    // Add new one if no input boxes left
    if (emptyInputBoxesCount !== 0 && inputValue === undefined) {
        return;
    }
    let clearText = document.createElement("span");
    clearText.classList.add("clear_text");
    clearText.title = "Clear";
    clearText.innerHTML = '&times;';
    let div = document.createElement("div");
    div.classList.add("flex");
    div.classList.add("hbox");


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
    div.appendChild(span);
    element.appendChild(div);

    let newElementIndex = element.children.length - 1;
    input.oninput = function() {

        if (input.value === "") {
            Copper.DebugOptionsAdapter.removeEmptyMultipleOptionInputs(input, id);
        } else {
            Copper.DebugOptionsAdapter.addNewMultipleOptionsEntry(id);
        }

        Copper.DebugOptionsAdapter.callOnChangeFunction(id, input.value, newElementIndex);
        Copper.DebugOptionsAdapter.setStringToHexTooltip(input);
    };
    clearText.onclick = function() {
        input.value = "";
        Copper.DebugOptionsAdapter.callOnChangeFunction(id, input.value, newElementIndex);
    };
};

/**
 * Called to remove all empty input text boxes of multipleOptions.
 * Ensures that always one input box with an add-button will remain (even if its empty).
 * @param id    html id
 */
Copper.DebugOptionsAdapter.removeEmptyMultipleOptionInputs = function(inputBox, id) {
    let element = document.getElementById(id);
    let emptyInputBoxesCount = 0;
    let emptyInputBoxes = [];
    for (let i = 0; i < element.children.length; i++) {
        let next = element.children[i];
        if (next.lastElementChild.firstElementChild.value === "") {
            emptyInputBoxesCount++;
            if (!next.classList.contains("fixed-option-entry")) {
                emptyInputBoxes.push(next);
            }
        }
    }

    if (emptyInputBoxesCount > 1) {
        if (inputBox.parentNode.parentNode.classList.contains("fixed-option-entry")) {
            element.removeChild(emptyInputBoxes[0]);
        } else {
            for (let i = 0; i < emptyInputBoxes.length-1; i++) {
                if (!emptyInputBoxes[i].classList.contains("fixed-option-entry"))
                {
                    element.removeChild(emptyInputBoxes[i]);
                }
            }
        }
    }
};

Copper.DebugOptionsAdapter.removeAllEmptyMultipleOptionInputs = function() {
    let allMultipleOptions = document.getElementsByClassName("multiple-options");
    for (let i = 0; i < allMultipleOptions.length; i++) {
        let next = allMultipleOptions[i];
        // Remove all empty input boxes, except the last one
        let childrenCount = next.children.length;
        for (let j = 1; j < next.children.length;) {
            let optionChild = next.children[j];
            if (optionChild.lastElementChild.firstElementChild.value == "") {
                next.removeChild(optionChild);
            } else {
                j++;
            }
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