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
    this.etags = [];
    this.ifMatchs = [];
    this.locationPaths = [];
    this.locationQueries = [];
    this.customOptions = [];
};

Copper.Options.prototype.optionsEnabled = false;
Copper.Options.prototype.token = undefined;
Copper.Options.prototype.accept = 0;
Copper.Options.prototype.contentFormat = 0;
Copper.Options.prototype.blockwiseEnabled = true;
Copper.Options.prototype.block1 = undefined;
Copper.Options.prototype.block2 = undefined;
Copper.Options.prototype.size1 = undefined;
Copper.Options.prototype.size2 = undefined;
Copper.Options.prototype.observe = undefined;
Copper.Options.prototype.etags = undefined;
Copper.Options.prototype.ifMatchs = undefined;
Copper.Options.prototype.ifNoneMatch = false;
Copper.Options.prototype.uriHost = undefined;
Copper.Options.prototype.uriPort = undefined;
Copper.Options.prototype.proxyUri = undefined;
Copper.Options.prototype.proxyScheme = false;
Copper.Options.prototype.maxAge = undefined;
Copper.Options.prototype.locationPaths = undefined;
Copper.Options.prototype.locationQueries = undefined;
Copper.Options.prototype.customOptions = undefined;


Copper.Options.prototype.addOptions = function(coapMessage) {
    if (!this.optionsEnabled) {
        return;
    }
    
    if (this.token !== undefined) {
        var token;
        if (this.token === 'empty' || this.token === '0x') {
            token = new ArrayBuffer(0);
        } else if (this.token.substr(0, 2) === '0x') {
            token = Copper.ByteUtils.convertHexStringToBytes(this.token);
        } else {
            token = Copper.ByteUtils.convertStringToBytes(this.token);
        }
        if (token.byteLength > 8) {
            token = token.slice(0,7);
        }
        coapMessage.setToken(token);
    }

    if (this.accept !== undefined) {
        coapMessage.addOption(Copper.CoapMessage.OptionHeader.ACCEPT, this.accept.number, true);
    }

    if (this.contentFormat !== undefined) {
        coapMessage.addOption(Copper.CoapMessage.OptionHeader.CONTENT_FORMAT, this.contentFormat.number, true);
    }

    if (!this.blockwiseEnabled) {
        if (this.block1 !== undefined) {
            coapMessage.addOption(Copper.CoapMessage.OptionHeader.BLOCK1, new Copper.CoapMessage.BlockOption(this.block1, Copper.Session.settings.blockSize, false), true);
        }

        if (this.block2 !== undefined) {
            coapMessage.addOption(Copper.CoapMessage.OptionHeader.BLOCK2, new Copper.CoapMessage.BlockOption(this.block2, Copper.Session.settings.blockSize, false), true);
        }

        if (this.size1 !== undefined) {
            coapMessage.addOption(Copper.CoapMessage.OptionHeader.SIZE1, this.size1, true);
        }

        if (this.size2 !== undefined) {
            coapMessage.addOption(Copper.CoapMessage.OptionHeader.SIZE2, this.size2, true);
        }
    }
    if (this.observe !== undefined) {
        coapMessage.addOption(Copper.CoapMessage.OptionHeader.OBSERVE, this.observe, true);
    }

    if (this.etags.length > 0) {
        let newArray = this.addMultipleOptions(this.etags, Copper.CoapMessage.OptionHeader.ETAG, coapMessage);
        if (newArray !== null) {
            this.etags = newArray;
        }
    }

    if (this.ifMatchs.length > 0) {
        let newArray = this.addMultipleOptions(this.ifMatchs, Copper.CoapMessage.OptionHeader.IF_MATCH, coapMessage);
        if (newArray !== null) {
            this.ifMatchs = newArray;
        }
    }

    if (this.uriHost !== undefined) {
        coapMessage.addOption(Copper.CoapMessage.OptionHeader.URI_HOST, this.uriHost, true);
    }

    if (this.uriPort !== undefined) {
        coapMessage.addOption(Copper.CoapMessage.OptionHeader.URI_PORT, this.uriPort, true);
    }

    if (this.proxyUri !== undefined) {
        // Proxy takes precedence over URI-Options (which MUST NOT be present)
        coapMessage.removeOption(Copper.CoapMessage.OptionHeader.URI_HOST);
        coapMessage.removeOption(Copper.CoapMessage.OptionHeader.URI_PORT);
        coapMessage.removeOption(Copper.CoapMessage.OptionHeader.URI_PATH);
        coapMessage.removeOption(Copper.CoapMessage.OptionHeader.URI_QUERY);
        if (this.proxyScheme) {
            let uri = Copper.StringUtils.parseUri(this.proxyUri);
            if (uri === undefined){
                throw new Error("Proxy URI is not a valid URI");
            }
            else {
                coapMessage.addOption(Copper.CoapMessage.OptionHeader.PROXY_SCHEME, uri.protocol ? uri.protocol : "coap", true);
                coapMessage.addOption(Copper.CoapMessage.OptionHeader.URI_HOST, uri.address);
                if (uri.port !== undefined) coapMessage.addOption(Copper.CoapMessage.OptionHeader.URI_PORT, uri.port);
                if (uri.path !== undefined){
                    let pathParts = uri.path.split("/");
                    for (let i=0; i<pathParts.length; i++){
                        coapMessage.addOption(Copper.CoapMessage.OptionHeader.URI_PATH, pathParts[i]);
                    }
                }
                if (uri.query !== undefined){
                    let queryParts = uri.query.split("&");
                    for (let i=0; i<queryParts.length; i++){
                        coapMessage.addOption(Copper.CoapMessage.OptionHeader.URI_QUERY, queryParts[i]);
                    }
                }
            }
        }
        else {
            coapMessage.addOption(Copper.CoapMessage.OptionHeader.PROXY_URI, this.proxyUri, true);
        }
    }

    if (this.maxAge !== undefined) {
        coapMessage.addOption(Copper.CoapMessage.OptionHeader.MAX_AGE, this.maxAge, true);
    }

    if (this.locationPaths.length > 0) {
        let newArray = this.addMultipleOptions(this.locationPaths, Copper.CoapMessage.OptionHeader.LOCATION_PATH, coapMessage);
        if (newArray !== null) {
            this.locationPaths = newArray;
        }
    }

    if (this.locationQueries.length > 0) {
        let newArray = this.addMultipleOptions(this.locationQueries, Copper.CoapMessage.OptionHeader.LOCATION_QUERY, coapMessage);
        if (newArray !== null) {
            this.locationQueries = newArray;
        }
    }

    if (this.customOptions.length > 0) {

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