Copper.DebugOptionsAdapter = function(){
};

Copper.DebugOptionsAdapter.init = function() {
    Copper.DebugOptionsAdapter.initContentFormat();
    Copper.DebugOptionsAdapter.initResetListener();

    // Checkboxes
    document.getElementById("chk_debug_options").onclick = Copper.DebugOptionsAdapter.onDebugOptionsEnabledChange;
    document.getElementById("chk_debug_option_block_auto").onclick = Copper.DebugOptionsAdapter.onBlockwiseEnabledChange;
    document.getElementById("debug_option_if_none_match").onclick = Copper.DebugOptionsAdapter.onIfNoneMatchChange;
    document.getElementById("debug_option_proxy_scheme").onclick = Copper.DebugOptionsAdapter.onProxySchemeChange;

    // Selection Menus
    document.getElementById("debug_option_accept").onchange = Copper.DebugOptionsAdapter.onAcceptChange;
    document.getElementById("debug_option_content_format").onchange = Copper.DebugOptionsAdapter.onContentFormatChange;

    // Single Menu Options
    Copper.DebugOptionsAdapter.initSingleOptionsListeners('debug_option_token', Copper.DebugOptionsAdapter.onTokenChange);
    Copper.DebugOptionsAdapter.initSingleOptionsListeners('debug_option_block1', Copper.DebugOptionsAdapter.onBlock1Change);
    Copper.DebugOptionsAdapter.initSingleOptionsListeners('debug_option_block2', Copper.DebugOptionsAdapter.onBlock2Change);
    Copper.DebugOptionsAdapter.initSingleOptionsListeners('debug_option_size1', Copper.DebugOptionsAdapter.onSize1Change);
    Copper.DebugOptionsAdapter.initSingleOptionsListeners('debug_option_size2', Copper.DebugOptionsAdapter.onSize2Change);
    Copper.DebugOptionsAdapter.initSingleOptionsListeners('debug_option_observe', Copper.DebugOptionsAdapter.onObserveChange);
    Copper.DebugOptionsAdapter.initSingleOptionsListeners('debug_option_uri_host', Copper.DebugOptionsAdapter.onUriHostChange);
    Copper.DebugOptionsAdapter.initSingleOptionsListeners('debug_option_uri_port', Copper.DebugOptionsAdapter.onUriPortChange);
    Copper.DebugOptionsAdapter.initSingleOptionsListeners('debug_option_proxy_uri', Copper.DebugOptionsAdapter.onProxyUriChange);
    Copper.DebugOptionsAdapter.initSingleOptionsListeners('debug_option_max_age', Copper.DebugOptionsAdapter.onMaxAgeChange);

};

/**
 * Init Selection Menus
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
 * Initialize listener for reset button to reset all options
 */
Copper.DebugOptionsAdapter.initResetListener = function() {
    let resetButton = document.getElementById("reset_button");
    resetButton.onclick = function() {
        Copper.DebugOptionsAdapter.resetAllDebugOptions();
    }
};

/**
 * Reset all options
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
    Copper.DebugOptionsAdapter.removeAllAdditionalMultipleOptionInputBoxes();
    Copper.Session.options = new Copper.Options();
    Copper.Session.storeChange();
};

/**
 * Initialize listener for single options.
 * @param inputId
 * @param onChangeFunction
 */
Copper.DebugOptionsAdapter.initSingleOptionsListeners = function(inputId, onChangeFunction) {
    let input = document.getElementById(inputId);
    input.oninput = onChangeFunction;
    input.parentNode.lastElementChild.onclick = function () {
        input.value = "";
        onChangeFunction();
    }
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
    Copper.DebugOptionsAdapter.loadMultipleOptionInputBox("debug_options_etags", options.etags);
    Copper.DebugOptionsAdapter.loadMultipleOptionInputBox("debug_options_if_matchs", options.ifMatchs);
    Copper.DebugOptionsAdapter.loadMultipleOptionInputBox("debug_options_location_paths", options.locationPaths);
    Copper.DebugOptionsAdapter.loadMultipleOptionInputBox("debug_options_location_queries", options.locationQueries);
};

/**
 * Methods called upon profile loaded
 */

/**
 * Load checkbox value from storage. The default value will be selected
 * as defined in the prototype
 * @param id
 * @param option
 */
Copper.DebugOptionsAdapter.loadCheckbox = function(id, checked) {
    let checkbox = document.getElementById(id);
    checkbox.checked = checked;
};

/**
 * Load selected index from storage. The default value will be
 * @param id
 * @param option
 */
Copper.DebugOptionsAdapter.loadSelectionMenu = function(id, option) {
    let selectionMenu = document.getElementById(id);
    selectionMenu.selectedIndex = option.index;
};

/**
 * Load single option input box value from storage. The default value will be selected
 * as defined in the prototype
 * @param id
 * @param option
 */
Copper.DebugOptionsAdapter.loadSingleOptionInputBox = function(id, value) {
    if (value === undefined) {
        value = "";
    }
    let inputBox = document.getElementById(id);
    inputBox.value = value;
};

/**
 * Load multiple option input box values from storage and generate additional HTML entries if necessary.
 * Add listeners to all entries.
 * @param id
 * @param option
 */
Copper.DebugOptionsAdapter.loadMultipleOptionInputBox = function(id, values) {
    let option = document.getElementById(id);
    let inputBox = option.lastElementChild.firstElementChild.firstElementChild;

    if (values.length === 0) {
        // No value in storage
        inputBox.value = "";
    } else {
        // Init if only one value
        inputBox.value = values[0];

        for (let i = 1; i < values.length; i++) {
            Copper.DebugOptionsAdapter.addNewMultipleOptionsEntry(id, values[i]);
        }
        Copper.DebugOptionsAdapter.addNewMultipleOptionsEntry(id);
    }

    inputBox.oninput = function() {
        Copper.DebugOptionsAdapter.onMultipleOptionsInputChange(id,inputBox, inputBox.parentNode.parentNode);
    }
    let clearSign = option.lastElementChild.lastElementChild.lastElementChild;
    clearSign.onclick = function () {
        inputBox.value = "";
        Copper.DebugOptionsAdapter.onMultipleOptionsInputChange(id, inputBox, inputBox.parentNode.parentNode);
    }
};


Copper.DebugOptionsAdapter.onMultipleOptionsInputChange = function(id, inputBox, parent) {
    Copper.DebugOptionsAdapter.setStringToHexTooltip(inputBox);
    let newElementIndex = 0;
    let elem = parent;
    while (elem = elem.previousElementSibling ) {
        newElementIndex++;
    }
    newElementIndex--; // First element is <img>

    Copper.DebugOptionsAdapter.callOnChangeFunction(id, inputBox, newElementIndex);

    if (inputBox.value === "") {
        Copper.DebugOptionsAdapter.removeEmptyMultipleOptionInputs(inputBox, id);
    } else {
        Copper.DebugOptionsAdapter.addNewMultipleOptionsEntry(id);
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

Copper.DebugOptionsAdapter.onEtagsChange = function(index, inputBox) {
    if (inputBox.value === "") {
        Copper.Session.options.etags.splice(index, 1);
    } else {
        Copper.Session.options.etags[index] = inputBox.value;
    }
    Copper.Session.storeChange();
};

Copper.DebugOptionsAdapter.onIfMatchsChange = function(index, inputBox) {
    if (inputBox.value === "") {
        Copper.Session.options.ifMatchs.splice(index, 1);
    } else {
        Copper.Session.options.ifMatchs[index] = inputBox.value;
    }
    Copper.Session.storeChange();
};

Copper.DebugOptionsAdapter.onLocationPathsChange = function(index, inputBox) {
    if (inputBox.value === "") {
        Copper.Session.options.locationPaths.splice(index, 1);
    } else {
        Copper.Session.options.locationPaths[index] = inputBox.value;
    }
    Copper.Session.storeChange();
};

Copper.DebugOptionsAdapter.onLocationQueriesChange = function(index, inputBox) {
    if (inputBox.value === "") {
        Copper.Session.options.locationQueries.splice(index, 1);
    } else {
        Copper.Session.options.locationQueries[index] = inputBox.value;
    }
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
    for (let i = 1; i < element.children.length; i++) {
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
        case "debug_options_etags":
        case "debug_options_if_matchs":
            placeholder = 'use hex (0x..) or string';
            break;
        case "debug_options_location_paths":
        case "debug_options_location_queries":
            placeholder = 'not set';
            break;
    }
    input.placeholder = placeholder;
    span.appendChild(input);
    span.appendChild(clearText);
    div.appendChild(span);
    element.appendChild(div);

    input.oninput = function() {
        Copper.DebugOptionsAdapter.onMultipleOptionsInputChange(id, input, div);
    };

    clearText.onclick = function() {
        input.value = "";
        Copper.DebugOptionsAdapter.onMultipleOptionsInputChange(id, input, div);
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
    for (let i = 1; i < element.children.length; i++) {
        let next = element.children[i];
        if (next.lastElementChild.firstElementChild.value === "") {
            emptyInputBoxesCount++;
            emptyInputBoxes.push(next);
        }
    }

    if (emptyInputBoxesCount > 1) {
        element.removeChild(emptyInputBoxes[0]);
    }
};

Copper.DebugOptionsAdapter.removeAllAdditionalMultipleOptionInputBoxes = function() {
    let allMultipleOptions = document.getElementsByClassName("multiple-options");

    for (let i = 0; i < allMultipleOptions.length; i++) {
        let next = allMultipleOptions[i];
        // Remove all empty input boxes, except the last one
        let childrenCount = next.children.length;
        for (let j = 2; j < next.children.length;) {
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
Copper.DebugOptionsAdapter.callOnChangeFunction = function(id, inputBox, index) {
    switch(id) {
        case "debug_options_etags":
            Copper.DebugOptionsAdapter.onEtagsChange(index, inputBox);
            break;
        case "debug_options_if_matchs":
            Copper.DebugOptionsAdapter.onIfMatchsChange(index, inputBox);
            break;
        case "debug_options_location_paths":
            Copper.DebugOptionsAdapter.onLocationPathsChange(index, inputBox);
            break;
        case "debug_options_location_queries":
            Copper.DebugOptionsAdapter.onLocationQueriesChange(index, inputBox);
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