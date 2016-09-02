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
 
Copper.Options = function() {
    this.options = new Object();
    this.customOptions = new Object();
};

Copper.Options.prototype.optionsEnabled = false;
Copper.Options.prototype.token = undefined;
Copper.Options.prototype.blockwiseEnabled = true;
Copper.Options.prototype.useProxyScheme = false;
Copper.Options.prototype.useUtf8 = true;
Copper.Options.prototype.options = undefined;
Copper.Options.prototype.customOptions = undefined;

Copper.Options.prototype.setOptionsEnabled = function(optionsEnabled){
    this.optionsEnabled = optionsEnabled ? true : false;
};

Copper.Options.prototype.setToken = function(token){
    if (token === undefined || token === ""){
        this.token = undefined;
    }
    else {
        // validate token
        new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET).setToken(Copper.ByteUtils.convertToByteArray(token));
        this.token = token;
    }
};

Copper.Options.prototype.setBlockwiseEnabled = function(blockwiseEnabled){
    this.blockwiseEnabled = blockwiseEnabled ? true : false;
};

Copper.Options.prototype.setProxyScheme = function(useProxyScheme){
    this.useProxyScheme = useProxyScheme ? true : false;
};

Copper.Options.prototype.setUtf8 = function(useUtf8){
    this.useUtf8 = useUtf8 ? true : false;
};

Copper.Options.prototype.isOptionSet = function(number){
    return this.options[number] !== undefined || this.customOptions[number] !== undefined;
};

Copper.Options.prototype.addOption = function(number, value){
    this.addOptionInternal(number, value, this.options);
};

Copper.Options.prototype.addCustomOption = function(number, value){
    if (number === undefined || !number.match(/^[0-9]+$/g)){
        throw new Error("Illegal option number");
    }
    this.addOptionInternal(Number.parseInt(number), (value === undefined ? "0" : value), this.customOptions);
};

Copper.Options.prototype.addOptionInternal = function(number, value, optionHolder){
    if (value === undefined){
        return;
    }
    let optionHeader = Copper.CoapMessage.OptionHeader.getOptionHeader(number);
    if (!optionHeader.multipleValues && ()){
        throw new Error("Option " + optionHeader.name + " must not be set more than once");
    }
    new Copper.CoapMessage.Option(optionHeader).addValue(this.transformValue(value, optionHeader.type, 4));
    // check proxy-options / uri-options
    if (number === Copper.CoapMessage.OptionHeader.PROXY_URI.number){
        if (this.isOptionSet(Copper.CoapMessage.OptionHeader.URI_HOST.number) || this.isOptionSet(Copper.CoapMessage.OptionHeader.URI_PORT.number) ||
              this.isOptionSet(Copper.CoapMessage.OptionHeader.URI_PATH.number) || this.isOptionSet(Copper.CoapMessage.OptionHeader.URI_QUERY.number)){
            throw new Error("Proxy-uri cannot be used when URI-* options are set");
        }
        if (this.useProxyScheme) {
            let uri = Copper.StringUtils.parseUri(this.proxyUri);
            if (uri === undefined){
                throw new Error("Proxy URI is not a valid URI");
            }
        }
    }
    if (this.isOptionSet(Copper.CoapMessage.OptionHeader.PROXY_URI.number) && 
        (number === Copper.CoapMessage.OptionHeader.URI_HOST.number || number === Copper.CoapMessage.OptionHeader.URI_PORT.number ||
          number === Copper.CoapMessage.OptionHeader.URI_PATH.number || number === Copper.CoapMessage.OptionHeader.URI_QUERY.number)) {
        throw new Error("URI-* options must not be set if proxy-uri option is used");
    }
    optionHolder[number].push(value);
};

Copper.Options.prototype.transformValue = function(value, type, blockSize) {
    switch (type){
        case Copper.CoapMessage.OptionHeader.TYPE_EMPTY:
            return null;
        case Copper.CoapMessage.OptionHeader.TYPE_OPAQUE:
            return value;
        case Copper.CoapMessage.OptionHeader.TYPE_UINT:
            return Number.parseInt(value);
        case Copper.CoapMessage.OptionHeader.TYPE_STRING:
            return value.toString();
        case Copper.CoapMessage.OptionHeader.TYPE_BLOCK:
            return new Copper.CoapMessage.BlockOption(Number.parseInt(value), blockSize, false);
    }
    throw new Error("Illegal type");
};

Copper.Options.prototype.addUriPathOption = function(optionHeader, path){
    if (path !== undefined){
        let pathParts = path.split("/");
        for (let i=0; i<pathParts.length; i++){
            coapMessage.addOption(optionHeader, pathParts[i]);
        }
    }
};

Copper.Options.prototype.addUriQueryOption = function(optionHeader, query){
    if (query !== undefined){
        let queryParts = path.split("&");
        for (let i=0; i<queryParts.length; i++){
            coapMessage.addOption(optionHeader, queryParts[i]);
        }
    }
};

Copper.Options.prototype.addOptionToCoapMessage = function(optionHeader, values, selectedBlockSize){
    if (!this.blockwiseEnabled && (optionHeader.number === Copper.CoapMessage.OptionHeader.BLOCK1.number || optionHeader.number === Copper.CoapMessage.OptionHeader.BLOCK2.number)){
        return;
    }
    for (let i=0; i<values.length; i++){
        let value = this.transformValue(values[i], optionHeader.type, selectedBlockSize);
        if (value === undefined) continue;
        if (optionHeader.number === Copper.CoapMessage.OptionHeader.PROXY_URI.number){
            // Proxy takes precedence over URI-Options (which MUST NOT be present)
            coapMessage.removeOption(Copper.CoapMessage.OptionHeader.URI_HOST);
            coapMessage.removeOption(Copper.CoapMessage.OptionHeader.URI_PORT);
            coapMessage.removeOption(Copper.CoapMessage.OptionHeader.URI_PATH);
            coapMessage.removeOption(Copper.CoapMessage.OptionHeader.URI_QUERY);
            if (this.useProxyScheme) {
                let uri = Copper.StringUtils.parseUri(value);
                if (uri === undefined){
                    throw new Error("Proxy URI is not a valid URI");
                }
                else {
                    coapMessage.addOption(Copper.CoapMessage.OptionHeader.PROXY_SCHEME, uri.protocol ? uri.protocol : "coap", true);
                    coapMessage.addOption(Copper.CoapMessage.OptionHeader.URI_HOST, uri.address);
                    if (uri.port !== undefined) coapMessage.addOption(Copper.CoapMessage.OptionHeader.URI_PORT, uri.port);
                    this.addUriPathOption(Copper.CoapMessage.OptionHeader.URI_PATH, uri.path);
                    this.addUriQueryOption(Copper.CoapMessage.OptionHeader.URI_QUERY, uri.query);
                }
            }
            else {
                coapMessage.addOption(Copper.CoapMessage.OptionHeader.PROXY_URI, value, true);
            }
        }
        else if (optionHeader.number === Copper.CoapMessage.OptionHeader.LOCATION_PATH.number){
            this.addUriPathOption(Copper.CoapMessage.OptionHeader.LOCATION_PATH, value);
        }
        else if (optionHeader.number === Copper.CoapMessage.OptionHeader.LOCATION_QUERY.number){
            this.addUriPathOption(Copper.CoapMessage.OptionHeader.LOCATION_QUERY, value);
        }
        else {
            coapMessage.addOption(optionHeader, value, true);
        }
    }
};

Copper.Options.prototype.addOptionsToCoapMessage = function(coapMessage, selectedBlockSize) {
    if (!this.optionsEnabled) {
        return;
    }
    if (this.token !== undefined) {
        coapMessage.setToken(Copper.ByteUtils.convertToByteArray(this.token));
    }

    let optionNos = Object.keys(this.options);
    for (let i=0; i<optionNos.length; i++){
        this.addOptionToCoapMessage(Copper.CoapMessage.OptionHeader.getOptionHeader(optionNos[i]), this.options[optionNos[i]]);
    }
    let customOptionNos = Object.keys(this.customOptions);
    for (let i=0; i<customOptionNos.length; i++){
        this.addOptionToCoapMessage(Copper.CoapMessage.OptionHeader.getOptionHeader(customOptionNos[i]), this.customOptions[customOptionNos[i]]);
    }
};

Copper.Options.prototype.addMultipleOptions = function(options, tag, coapMessage) {
    let newArray = [];
    let hasEmptyValues = false;
    for (let i = 0; i < options.length; i++) {
        let next = options[i];
        if (next === "" || next === undefined) {
            hasEmptyValues = true;
            continue;
        }
        newArray.push(next);
        coapMessage.addOption(tag, next, false);
    }
    return (hasEmptyValues ? newArray : null);
};

Copper.Options.prototype.removeEmptyMultipleOptions = function(options) {
    let newArray = [];
    let hasEmptyValues = false;
    for (let i = 0; i < options.length; i++) {
        let next = options[i];
        if (next === "" || next === undefined) {
            hasEmptyValues = true;
            continue;
        }
        newArray.push(next);
    }
    return (hasEmptyValues ? newArray : null);
};