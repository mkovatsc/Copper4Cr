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
 
Copper.StringUtils = function(){
};

/**
* @return current datetime formatted as 23.03.2016 15:29:33.214
*/
Copper.StringUtils.getDateTime = function() {
	let currentdate = new Date(Copper.TimeUtils.now()); 
	let dd = currentdate.getDate().toString();
	let mm = (currentdate.getMonth()+1).toString();
	let yyyy = currentdate.getFullYear().toString();
	let hh = currentdate.getHours().toString();
	let mi = currentdate.getMinutes().toString();
	let ss = currentdate.getSeconds().toString();
	let ms = currentdate.getMilliseconds().toString();
    return this.lpad(dd, 2) + "." + this.lpad(mm, 2) + "." + yyyy +
        " " + this.lpad(hh, 2) + ":" + this.lpad(mi, 2) + ":" + this.lpad(ss, 2) + "." + this.lpad(ms, 3);
};

/**
* @arg withMilliseconds: if set to true, milliseconds is added
* @return current datetime formatted as 15:29:33(.214?)
*/
Copper.StringUtils.getTime = function(withMilliseconds) {
	let currentdate = new Date(Copper.TimeUtils.now()); 
	let hh = currentdate.getHours().toString();
	let mi = currentdate.getMinutes().toString();
	let ss = currentdate.getSeconds().toString();
    let res = this.lpad(hh, 2) + ":" + this.lpad(mi, 2) + ":" + this.lpad(ss, 2); 
    if (withMilliseconds){
    	res = res + "." + this.lpad(currentdate.getMilliseconds().toString(), 3);
    }
    return res;
};

/**
* @return String of length len using the first len characters of str optionally left padding it with pad (default 0)
*/
Copper.StringUtils.lpad = function(str, len, pad){
	if (!pad) pad = "0";
	if (pad.length > 1) throw new Error("Length of padding <> 1");
	if (typeof(len) !== "number" || (str !== null && typeof(str) !== "string")) throw new Error("Illegal Arguments");
	if (str && str.length === len) {
		return str;
	}
	else {
		let res = [];
		for (let i = 0; i < len - (str ? str.length : 0); i++){
			res.push(pad);
		}
		res.push(str ? (str.len < len ? str : str.substring(0, len)) : "");
		return res.join("");
	}
};

/**
* @return object containing the parsed URI-Parts. The following parts are returned if set
*   - protocol
*   - address
*   - port
*   - path
*   - query
*/
Copper.StringUtils.parseUri = function(rawUri){
	if (!rawUri){
		return undefined;
	}
	let result = {};

	// use HTML <a> tag as a parser
	let parser = document.createElement("a");

	// we have to set a valid protocol
	let protocolMatcher = /^([a-zA-Z]+):\/\/(.*?)$/;
	let match = protocolMatcher.exec(rawUri);
	if (match === null){
		parser.href = "http://" + rawUri;
	}
	else {
		result.protocol = match[1];
		parser.href = "http://" + match[2];	
	}
	
	if (parser.host && parser.host !== window.location.host){
		// if an invalid href is entered, host points in some browser versions to current location
		result["address"] = parser.hostname;
		if (!Number.isNaN(parseInt(parser.port))){
			result["port"] = parseInt(parser.port);
		}
		if (typeof(parser.pathname) === "string" && parser.pathname.length > 1){
			result["path"] = parser.pathname.substring(1);
		}
		if (typeof(parser.search) === "string"  && parser.search.length > 1){
			result["query"] = parser.search.substring(1);
		}
		return result;
	}
	else {
		return undefined;
	}
};

/*
* Parses a link format
* @return: object representing the resources 
*/
Copper.StringUtils.parseLinkFormat = function(data) {

	var links = new Object();

	// totally complicated but supports ',' and '\n' to separate links and ',' as well as '\"' within quoted strings
	var format = data.match(/(<[^>]+>\s*(;\s*\w+\s*(=\s*(\w+|"([^"\\]*(\\.[^"\\]*)*)")\s*)?)*)/g);
	for (var i in format) {
		var elems = format[i].match(/^<([^>\?]+)[^>]*>\s*(;.+)?\s*$/);

		var uri = elems[1];

		if (uri.match(/([a-zA-Z]+:\/\/)([^\/]+)(.*)/)) {
			// absolute URI
		} else {
			// fix for old Contiki implementation and others which omit the leading '/' in the link format
			if (uri.charAt(0)!='/') uri = '/'+uri;
		}

		links[uri] = new Object();

		if (elems[2]) {

			var tokens = elems[2].match(/(;\s*\w+\s*(=\s*(\w+|"([^\\"]*(\\.[^"\\]*)*)"))?)/g);

			for (var j in tokens) {
				var keyVal = tokens[j].match(/;\s*([^<"\s;,=]+)\s*(=\s*(([^<"\s;,]+)|"([^"\\]*(\\.[^"\\]*)*)"))?/);
				if (keyVal) {
					if (links[uri][keyVal[1]]!=null) {

						if (!Array.isArray(links[uri][keyVal[1]])) {
							let temp = links[uri][keyVal[1]];
							links[uri][keyVal[1]] = new Array(0);
							links[uri][keyVal[1]].push(temp);
						}

						links[uri][keyVal[1]].push(keyVal[2] ? (keyVal[4] ? parseInt(keyVal[4]) : keyVal[5].replace(/\\/g,'')) : true);

					} else {

						links[uri][keyVal[1]] = keyVal[2] ? (keyVal[4] ? parseInt(keyVal[4]) : keyVal[5].replace(/\\/g,'')) : true;
					}
				}
			}
		}
	}

	return links;
};