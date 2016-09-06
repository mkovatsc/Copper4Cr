Copper.DebugOptionsAdapter = function(){
};

Copper.DebugOptionsAdapter.debugOptionsEnabledField = undefined;
Copper.DebugOptionsAdapter.tokenInputField = undefined;
Copper.DebugOptionsAdapter.blockwiseEnabledField = undefined;
Copper.DebugOptionsAdapter.useProxySchemeField = undefined;
Copper.DebugOptionsAdapter.customOptionsField = undefined;
Copper.DebugOptionsAdapter.optionFieldAppenders = new Object();
Copper.DebugOptionsAdapter.optionFields = [];
Copper.DebugOptionsAdapter.optionHolderUsed = undefined;

Copper.DebugOptionsAdapter.beforeSessionInitialization = function() {
    let opaquePlaceholder = "use hex (0x..) or string";
    let blockNoPlaceholder = "block no.";
    let totalSizePlaceholder = "total size";
    let integerPlaceholder = "use integer";
    let notSetPlaceholder = "not set";
    let notSetShortPlaceholder = "n/s";
    let useAbsoluteUriPlaceholder = "use absolute URI";

    let chooseBlockSizeTitle = "Choose block size in Behavior menu";
    let blockwiseEnabledTitle = "Automatically transmit all blocks";

    let debugControlLabel = "Debug Control";
    let autoLabel = "Auto";
    let useProxySchemeLabel = "Use Proxy-Scheme option";

    document.getElementById("copper-debug-options-reset").onclick = Copper.DebugOptionsAdapter.onReset;
    Copper.DebugOptionsAdapter.debugOptionsEnabledField = Copper.DebugOptionsAdapter.appendCheckbox(document.getElementById("copper-debug-options-enabled"), debugControlLabel, undefined, false, Copper.DebugOptionsAdapter.onChange);
    Copper.DebugOptionsAdapter.tokenInputField = Copper.DebugOptionsAdapter.appendInputField(document.getElementById("copper-debug-options-token"), opaquePlaceholder, undefined, Copper.DebugOptionsAdapter.onChange);
    Copper.DebugOptionsAdapter.blockwiseEnabledField = Copper.DebugOptionsAdapter.appendCheckbox(document.getElementById("copper-debug-options-blockwise-enabled"), autoLabel, blockwiseEnabledTitle, true, Copper.DebugOptionsAdapter.onChange);
    Copper.DebugOptionsAdapter.useProxySchemeField = Copper.DebugOptionsAdapter.appendCheckbox(document.getElementById("copper-debug-options-proxy-scheme"), useProxySchemeLabel, undefined, false, Copper.DebugOptionsAdapter.onChange);

    Copper.DebugOptionsAdapter.initOptionField("copper-debug-options-accept", Copper.CoapMessage.OptionHeader.ACCEPT);
    Copper.DebugOptionsAdapter.initOptionField("copper-debug-options-content-format", Copper.CoapMessage.OptionHeader.CONTENT_FORMAT);
    Copper.DebugOptionsAdapter.initOptionField("copper-debug-options-block1", Copper.CoapMessage.OptionHeader.BLOCK1, blockNoPlaceholder, chooseBlockSizeTitle);
    Copper.DebugOptionsAdapter.initOptionField("copper-debug-options-size1", Copper.CoapMessage.OptionHeader.SIZE1, totalSizePlaceholder);
    Copper.DebugOptionsAdapter.initOptionField("copper-debug-options-block2", Copper.CoapMessage.OptionHeader.BLOCK2, blockNoPlaceholder, chooseBlockSizeTitle);
    Copper.DebugOptionsAdapter.initOptionField("copper-debug-options-size2", Copper.CoapMessage.OptionHeader.SIZE2, totalSizePlaceholder);
    Copper.DebugOptionsAdapter.initOptionField("copper-debug-options-observe", Copper.CoapMessage.OptionHeader.OBSERVE, integerPlaceholder);
    Copper.DebugOptionsAdapter.initOptionField("copper-debug-options-etags", Copper.CoapMessage.OptionHeader.ETAG, opaquePlaceholder);
    Copper.DebugOptionsAdapter.initOptionField("copper-debug-options-ifmatches", Copper.CoapMessage.OptionHeader.IF_MATCH, opaquePlaceholder);
    Copper.DebugOptionsAdapter.initOptionField("copper-debug-options-if-none-match", Copper.CoapMessage.OptionHeader.IF_NONE_MATCH);
    Copper.DebugOptionsAdapter.initOptionField("copper-debug-options-uri-host", Copper.CoapMessage.OptionHeader.URI_HOST, notSetPlaceholder);
    Copper.DebugOptionsAdapter.initOptionField("copper-debug-options-uri-port", Copper.CoapMessage.OptionHeader.URI_PORT, notSetShortPlaceholder);
    Copper.DebugOptionsAdapter.initOptionField("copper-debug-options-proxy-uri", Copper.CoapMessage.OptionHeader.PROXY_URI, useAbsoluteUriPlaceholder);
    Copper.DebugOptionsAdapter.initOptionField("copper-debug-options-max-age", Copper.CoapMessage.OptionHeader.MAX_AGE, integerPlaceholder);
    Copper.DebugOptionsAdapter.initOptionField("copper-debug-options-location-path", Copper.CoapMessage.OptionHeader.LOCATION_PATH, notSetPlaceholder);
    Copper.DebugOptionsAdapter.initOptionField("copper-debug-options-location-query", Copper.CoapMessage.OptionHeader.LOCATION_QUERY, notSetPlaceholder);

    Copper.DebugOptionsAdapter.customOptionsField = document.getElementById("copper-debug-options-custom-options");
    Copper.DebugOptionsAdapter.customOptionsField.classList.add("debug-option-custom-options");
};

Copper.DebugOptionsAdapter.onOptionsUpdated = function(){
    if (Copper.DebugOptionsAdapter.optionHolderUsed !== Copper.Session.options){
        Copper.DebugOptionsAdapter.optionHolderUsed = Copper.Session.options;
        Copper.DebugOptionsAdapter.updateDebugOptions(Copper.Session.options);
    }
};

Copper.DebugOptionsAdapter.handleBlockOption = function(optionHeader, blockwiseEnabled, inputElements){
    if (optionHeader.number === Copper.CoapMessage.OptionHeader.BLOCK1.number ||
            optionHeader.number === Copper.CoapMessage.OptionHeader.BLOCK2.number){
        for (let i=0; i<inputElements.length; i++){
            if (blockwiseEnabled){
                inputElements[i].classList.add("disabled");
            }
            else {
                inputElements[i].classList.remove("disabled");
            }
        }
    }  
};

Copper.DebugOptionsAdapter.onChange = function(lastChangedElement){
    // move changed element to the tail
    // ensures that error message is displayed on the right field
    if (lastChangedElement !== undefined){
        let idx = Copper.DebugOptionsAdapter.optionFields.indexOf(lastChangedElement);
        if (idx !== -1){
            Copper.DebugOptionsAdapter.optionFields.splice(idx, 1);
            Copper.DebugOptionsAdapter.optionFields.push(lastChangedElement);
        }
    }
    
    let updateFunc = function(inputElement, value, update){
        let errorMsg = undefined;
        try {
            update(inputElement, value);
        } catch (error){
            errorMsg = error.message;
        }
        Copper.DebugOptionsAdapter.setValue(inputElement, value, errorMsg);
    };

    let options = new Copper.Options();
    Copper.DebugOptionsAdapter.optionHolderUsed = options;

    let simpleUpdateFunc = function(inputElement, update){
        updateFunc(inputElement, Copper.DebugOptionsAdapter.getValue(inputElement), function(inputElement, value){
            update.apply(options, [value]);
        });
    };

    simpleUpdateFunc(Copper.DebugOptionsAdapter.debugOptionsEnabledField.firstChild, options.setOptionsEnabled);
    simpleUpdateFunc(Copper.DebugOptionsAdapter.tokenInputField.firstChild, options.setToken);
    simpleUpdateFunc(Copper.DebugOptionsAdapter.blockwiseEnabledField.firstChild, options.setBlockwiseEnabled);
    simpleUpdateFunc(Copper.DebugOptionsAdapter.useProxySchemeField.firstChild, options.setProxyScheme);

    for (i=0; i<Copper.DebugOptionsAdapter.optionFields.length; i++){
        let rootElement = Copper.DebugOptionsAdapter.optionFields[i];
        if (rootElement.classList.contains("debug-option-custom-option")){
            updateFunc(rootElement, Copper.DebugOptionsAdapter.getValue(rootElement), function(inputElement, customOption){
                if (customOption !== undefined) {
                    options.addCustomOption(customOption.number, customOption.value);
                }
            });
        }
        else {
            let optionHeader = Copper.CoapMessage.OptionHeader.getOptionHeader(Number.parseInt(rootElement.dataset.optionnumber));
            let valuesSet = Copper.DebugOptionsAdapter.getValues(rootElement);
            let newNodes = Copper.DebugOptionsAdapter.getInputFields(rootElement, (optionHeader.multipleValues ? (valuesSet.length + 1) : 1), Copper.DebugOptionsAdapter.optionFieldAppenders[optionHeader.number]);
            Copper.DebugOptionsAdapter.handleBlockOption(optionHeader, options.blockwiseEnabled, newNodes);
            for (j=0; j<newNodes.length; j++){
                updateFunc(newNodes[j], (j<valuesSet.length ? valuesSet[j] : undefined), function(inputElement, value){
                    if (value !== undefined){
                        options.addOption(optionHeader.number, value);
                    }
                });
            }
        }
    }
    Copper.DebugOptionsAdapter.organizeCustomOptions();
    Copper.Session.updateOptions(options);
};

Copper.DebugOptionsAdapter.onInput = function(rootElement){
    let optionHeader = Copper.CoapMessage.OptionHeader.getOptionHeader(Number.parseInt(rootElement.dataset.optionnumber));
    let valuesSet = Copper.DebugOptionsAdapter.getValues(rootElement);
    let newNodes = Copper.DebugOptionsAdapter.getInputFields(rootElement, (optionHeader.multipleValues ? (valuesSet.length + 1) : 1), Copper.DebugOptionsAdapter.optionFieldAppenders[optionHeader.number]);        
};

Copper.DebugOptionsAdapter.updateDebugOptions = function(options){
    Copper.DebugOptionsAdapter.setValue(Copper.DebugOptionsAdapter.debugOptionsEnabledField.firstChild, options.optionsEnabled);
    Copper.DebugOptionsAdapter.setValue(Copper.DebugOptionsAdapter.tokenInputField.firstChild, options.token);
    Copper.DebugOptionsAdapter.setValue(Copper.DebugOptionsAdapter.blockwiseEnabledField.firstChild, options.blockwiseEnabled);
    Copper.DebugOptionsAdapter.setValue(Copper.DebugOptionsAdapter.useProxySchemeField.firstChild, options.useProxyScheme);

    Copper.DebugOptionsAdapter.removeCustomOptions();

    for (let i=0; i<Copper.DebugOptionsAdapter.optionFields.length; i++){
        let rootElement = Copper.DebugOptionsAdapter.optionFields[i];
        let optionHeader = Copper.CoapMessage.OptionHeader.getOptionHeader(Number.parseInt(rootElement.dataset.optionnumber));
        let valuesSet = options.options[optionHeader.number] !== undefined ? options.options[optionHeader.number] : [];
        let newNodes = Copper.DebugOptionsAdapter.getInputFields(rootElement, (optionHeader.multipleValues ? (valuesSet.length + 1) : 1), Copper.DebugOptionsAdapter.optionFieldAppenders[optionHeader.number]);
        Copper.DebugOptionsAdapter.handleBlockOption(optionHeader, options.blockwiseEnabled, newNodes);
        for (j=0; j<newNodes.length; j++){
            Copper.DebugOptionsAdapter.setValue(newNodes[j], (j<valuesSet.length ? valuesSet[j] : undefined));
        }
    }

    let customOptionNos = Object.keys(options.customOptions);
    for (let i=0; i<customOptionNos.length; i++){
        let customValues = options.customOptions[customOptionNos[i]];
        for (let j=0; j<customValues.length; j++){
            Copper.DebugOptionsAdapter.addCustomOption(customOptionNos[i], customValues[j]);
        }
    }
    Copper.DebugOptionsAdapter.addCustomOption(undefined, undefined);
};

Copper.DebugOptionsAdapter.onReset = function(lastChangedElement){
    Copper.Session.updateOptions(new Copper.Options());
};

Copper.DebugOptionsAdapter.initOptionField = function(htmlId, optionHeader, placeholder, title){
    let rootElement = document.getElementById(htmlId);
    rootElement.dataset.optionnumber = optionHeader.number;
    Copper.DebugOptionsAdapter.optionFields.push(rootElement);
    let changeCallback = function(){
        Copper.DebugOptionsAdapter.onChange(rootElement);
    };
    let inputCallback = function(){
        Copper.DebugOptionsAdapter.onInput(rootElement);
    };
    let fieldAppender = undefined;
    if (optionHeader.number === Copper.CoapMessage.OptionHeader.ACCEPT.number || optionHeader.number === Copper.CoapMessage.OptionHeader.CONTENT_FORMAT.number){
        fieldAppender = function(){
            Copper.DebugOptionsAdapter.appendContentFormatDropDownField(rootElement, changeCallback);
        };
    }
    else if (optionHeader.type === Copper.CoapMessage.OptionHeader.TYPE_EMPTY){
        fieldAppender = function(){
            Copper.DebugOptionsAdapter.appendCheckbox(rootElement, optionHeader.name, title, false, changeCallback);
        };
    }
    else {
        fieldAppender = function(){
            Copper.DebugOptionsAdapter.appendInputField(rootElement, placeholder, title, changeCallback, inputCallback);
        };
    }
    Copper.DebugOptionsAdapter.optionFieldAppenders[optionHeader.number] = fieldAppender;
    fieldAppender();
};

Copper.DebugOptionsAdapter.getInputFields = function(rootElement, inputFieldCount, inputFieldAppender){
    let res = [];
    let nodesToRemove = [];
    for (let i=0; i<rootElement.childNodes.length; i++){
        if (i < inputFieldCount){
            res.push(rootElement.childNodes[i]);
        }
        else {
            nodesToRemove.push(rootElement.childNodes[i]);
        }
    }
    for (let i=rootElement.childNodes.length; i<inputFieldCount; i++){
        inputFieldAppender();
        res.push(rootElement.lastChild);
    }
    for (let i=0; i<nodesToRemove.length; i++) {
        rootElement.removeChild(nodesToRemove[i]);
    }
    return res;
};

Copper.DebugOptionsAdapter.organizeCustomOptions = function(nodeOnFocus){
    let nodeList = Copper.DebugOptionsAdapter.customOptionsField.childNodes;
    let nodesToRemove = [];
    for (let i=0; i<nodeList.length-1; i++){
        if (Copper.DebugOptionsAdapter.getValue(nodeList[i]) === undefined){
            if (nodeList[i] !== nodeOnFocus) nodesToRemove.push(nodeList[i]);
        }
    }
    Copper.DebugOptionsAdapter.removeCustomOptions(nodesToRemove);
    if (Copper.DebugOptionsAdapter.customOptionsField.lastChild === null || Copper.DebugOptionsAdapter.getValue(Copper.DebugOptionsAdapter.customOptionsField.lastChild) !== undefined){
        Copper.DebugOptionsAdapter.addCustomOption(undefined, undefined);
    }
};

Copper.DebugOptionsAdapter.removeCustomOptions = function(nodesToRemove){
    if (nodesToRemove === undefined){
        let nodeList = Copper.DebugOptionsAdapter.customOptionsField.childNodes;
        nodesToRemove = [];
        for (let i=0; i<nodeList.length; i++){
            nodesToRemove.push(nodeList[i]);
        }
    }
    for (let i=0; i<nodesToRemove.length; i++){
        let idx = Copper.DebugOptionsAdapter.optionFields.indexOf(nodesToRemove[i]);
        if (idx !== -1) Copper.DebugOptionsAdapter.optionFields.splice(idx, 1);
        Copper.DebugOptionsAdapter.customOptionsField.removeChild(nodesToRemove[i]);
    }
};

Copper.DebugOptionsAdapter.addCustomOption = function(number, value){
    let customOption = Copper.DebugOptionsAdapter.createCustomOptionField();
    Copper.DebugOptionsAdapter.setValue(customOption, {number: number, value: value});
    Copper.DebugOptionsAdapter.optionFields.push(customOption);
    Copper.DebugOptionsAdapter.customOptionsField.appendChild(customOption);
};

Copper.DebugOptionsAdapter.getValues = function(rootElement){
    let res = [];
    if (rootElement.classList.contains("debug-option-custom-option")){
        res.push(Copper.DebugOptionsAdapter.getValue(rootElement));
    }
    else {
        for (let i=0; i<rootElement.childNodes.length; i++){
            let value = Copper.DebugOptionsAdapter.getValue(rootElement.childNodes[i]);
            if (value !== undefined) res.push(value);
        }
    }
    return res;
};

Copper.DebugOptionsAdapter.getValue = function(inputElement){
    if (inputElement.classList.contains("debug-option-input-field")){
        let val = inputElement.getElementsByTagName("INPUT")[0].value;
        return val ? val : undefined;
    }
    else if (inputElement.classList.contains("debug-option-checkbox")){
        return inputElement.getElementsByTagName("INPUT")[0].checked ? true : undefined;
    }
    else if (inputElement.classList.contains("debug-option-content-format")){
        let selectElement = inputElement.getElementsByTagName("SELECT")[0];
        if (selectElement.selectedIndex === 0){
            return undefined;
        }
        else {
            return Number.parseInt(selectElement.options[selectElement.selectedIndex].dataset.number);
        }
    }
    else if (inputElement.classList.contains("debug-option-custom-option")){
        let number = Copper.DebugOptionsAdapter.getValue(inputElement.getElementsByClassName("debug-option-custom-option-number")[0]);
        let value = Copper.DebugOptionsAdapter.getValue(inputElement.getElementsByClassName("debug-option-custom-option-value")[0]);
        return (number || value) ? {number: (number ? number : undefined), value: (value ? value : undefined)} : undefined;
    }
    else {
        throw new Error("Invalid input element");
    }
};

Copper.DebugOptionsAdapter.setValue = function(inputElement, value, errorMessage){
    Copper.DebugOptionsAdapter.setErrorInformationOnInputElement(inputElement, errorMessage);
    if (inputElement.classList.contains("debug-option-input-field")){
        inputElement.getElementsByTagName("INPUT")[0].value = value ? value : "";
    }
    else if (inputElement.classList.contains("debug-option-checkbox")){
        inputElement.getElementsByTagName("INPUT")[0].checked = value ? true : false;   
    }
    else if (inputElement.classList.contains("debug-option-content-format")){
        let selectElement = inputElement.getElementsByTagName("SELECT")[0];
        if (value !== undefined){
            for (let i=0; i<selectElement.options.length; i++){
                if (Number.parseInt(selectElement.options[i].dataset.number) === value){
                    selectElement.selectedIndex = i;
                    break;
                }
            }
        }
        else {
            selectElement.selectedIndex = 0;
        }
    }
    else if (inputElement.classList.contains("debug-option-custom-option")){
        Copper.DebugOptionsAdapter.setValue(inputElement.getElementsByClassName("debug-option-custom-option-number")[0], value !== undefined ? value.number : undefined, errorMessage);
        Copper.DebugOptionsAdapter.setValue(inputElement.getElementsByClassName("debug-option-custom-option-value")[0], value !== undefined ? value.value : undefined, errorMessage);
    }
    else {
        throw new Error("Invalid input element");
    }
};

Copper.DebugOptionsAdapter.setErrorInformationOnInputElement = function(inputElement, errorMessage){
    if (!inputElement.classList.contains("debug-option-custom-option")){
        // remove error
        inputElement.classList.remove("error");
        let errorChilds = inputElement.getElementsByClassName("error");
        for (let i=0; i<errorChilds.length; i++){
            inputElement.removeChild(errorChilds[i]);
        }
        // add new error message if necessary
        if (errorMessage !== undefined) {
            inputElement.classList.add("error");

            let errorElement = document.createElement("span");
            errorElement.classList.add("error");
            errorElement.title = errorMessage;
            errorElement.textContent = "\u26A0 ";

            if (inputElement.classList.contains("debug-option-checkbox")){
                // find text node (node-type === 3) and insert before
                if (inputElement.firstChild.nodeType === 3){
                    inputElement.insertBefore(errorElement, inputElement.firstChild);
                }
                else {
                    inputElement.insertBefore(errorElement, inputElement.lastChild);
                }
            }
            else {
                inputElement.insertBefore(errorElement, inputElement.firstChild);
            }
        }
    }
};

Copper.DebugOptionsAdapter.appendInputField = function(rootElement, placeholder, title, onChangeCallback, onInputCallback, customClass, customStyle){
    rootElement.classList.add("debug-option-input-fields");

    let span = document.createElement("span");
    span.classList.add("debug-option-input-field");
    span.classList.add("flex");
    span.classList.add("hbox");
    span.classList.add("text-input-custom");
    if (title !== undefined) span.title = title;
    if (customClass !== undefined) span.classList.add(customClass);
    if (customStyle !== undefined) span.style = customStyle;

    let input = document.createElement("input");
    input.classList.add("flex");
    input.type = "text";
    input.placeholder = placeholder;
    input.onchange = onChangeCallback;
    if (onInputCallback !== undefined) input.oninput = onInputCallback;
    span.appendChild(input);

    let spanReset = document.createElement("span");
    spanReset.classList.add("reset");
    spanReset.title = "Reset";
    spanReset.textContent = "\u00d7"; // times sign
    spanReset.onclick = function(){
        input.value = "";
        if (onChangeCallback !== undefined){
            onChangeCallback();
        }
    };
    span.appendChild(spanReset);
    rootElement.appendChild(span);
    return rootElement;
};

Copper.DebugOptionsAdapter.appendCheckbox = function(rootElement, label, title, alignCenter, onChangeCallback){
    rootElement.classList.add("debug-option-checkboxes");
    rootElement.classList.add("checkbox");

    let labelEl = document.createElement("label");
    labelEl.classList.add("debug-option-checkbox");
    if (title !== undefined) labelEl.title = title;
    if (alignCenter) labelEl.style = "margin-left: auto; margin-right: auto;";
    let text = document.createTextNode(label);
    let chkbox = document.createElement("input");
    chkbox.type = "checkbox";
    if (alignCenter) chkbox.style = "display: block; margin-left: auto; margin-right: auto;";
    chkbox.onclick = onChangeCallback;

    if (alignCenter){
        labelEl.appendChild(text);
        labelEl.appendChild(chkbox);
    }
    else {
        labelEl.appendChild(chkbox);
        labelEl.appendChild(text);
    }
    rootElement.appendChild(labelEl);
    return rootElement;
};

Copper.DebugOptionsAdapter.appendContentFormatDropDownField = function(rootElement, onChangeCallback){
    rootElement.classList.add("debug-option-content-formats");

    let span = document.createElement("span");
    span.classList.add("debug-option-content-format");
    span.classList.add("flex");
    span.classList.add("hbox");
    span.classList.add("text-input-custom");

    let dropDown = document.createElement("select");
    dropDown.classList.add("flex");

    let emptyOption = document.createElement("option");
    dropDown.add(emptyOption);

    for (let i=0; i<Copper.CoapMessage.ContentFormat.Registry.length; i++) {
        let format = Copper.CoapMessage.ContentFormat.Registry[i];
        let option = document.createElement("option");
        option.text = format.name;
        option.dataset.number = format.number;
        dropDown.add(option);
    }

    dropDown.onchange = onChangeCallback;
    span.appendChild(dropDown);
    rootElement.appendChild(span);
    return rootElement;
};

Copper.DebugOptionsAdapter.createCustomOptionField = function(){
    let container = document.createElement("div");
    container.classList.add("hbox");
    container.classList.add("debug-option-custom-option");
    let changeCallback = function(){
        Copper.DebugOptionsAdapter.onChange(container);
    };
    let inputCallback = function(){
        Copper.DebugOptionsAdapter.organizeCustomOptions(container);
    };
    Copper.DebugOptionsAdapter.appendInputField(container, "not set", undefined, changeCallback, inputCallback, "debug-option-custom-option-number", "flex: 1;");
    Copper.DebugOptionsAdapter.appendInputField(container, "hex (0x..) or string", undefined, changeCallback, inputCallback, "debug-option-custom-option-value", "margin-left: 6px; flex: 2;");
    return container;
};