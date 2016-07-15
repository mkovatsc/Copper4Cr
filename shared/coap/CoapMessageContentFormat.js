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

/**
 * Creates a new content format object.
 */
Copper.CoapMessage.ContentFormat = function(number, name) {
	if (!Number.isInteger(number) || number < 0 || typeof(name) !== 'string'){
		throw new Error("Illegal argument");
	}
	this.number = number;
	this.name = name;
};

/*
 * @return content format for a given name (e.g. 2.01 Success)
 */
Copper.CoapMessage.ContentFormat.getCodeForName = function(name){
	if (typeof(name) !== "string"){
		throw new Error("Illegal argument");
	}
	if (name === "") {
		return -1; // No ContentFormat selected
	}
	let reg = Copper.CoapMessage.ContentFormat.Registry;
	for (let i = 0; i < reg.length; i++) {
		if (reg[i].name === name){
			return reg[i].number;
		}
	}
	throw new Error("No matching content format code");
};

/* Content Format Codes */
Copper.CoapMessage.ContentFormat.CONTENT_TYPE_TEXT_PLAIN = new Copper.CoapMessage.ContentFormat(0, "text/plain");
Copper.CoapMessage.ContentFormat.CONTENT_TYPE_TEXT_XML = new Copper.CoapMessage.ContentFormat(1, "text/xml");
Copper.CoapMessage.ContentFormat.CONTENT_TYPE_TEXT_CSV = new Copper.CoapMessage.ContentFormat(2, "text/csv");
Copper.CoapMessage.ContentFormat.CONTENT_TYPE_TEXT_HTML = new Copper.CoapMessage.ContentFormat(3, "text/html");
Copper.CoapMessage.ContentFormat.CONTENT_TYPE_IMAGE_GIF = new Copper.CoapMessage.ContentFormat(21, "image/gif");
Copper.CoapMessage.ContentFormat.CONTENT_TYPE_IMAGE_JPEG = new Copper.CoapMessage.ContentFormat(22, "image/jpeg");
Copper.CoapMessage.ContentFormat.CONTENT_TYPE_IMAGE_PNG = new Copper.CoapMessage.ContentFormat(23, "image/png");
Copper.CoapMessage.ContentFormat.CONTENT_TYPE_IMAGE_TIFF = new Copper.CoapMessage.ContentFormat(24, "image/tiff");
Copper.CoapMessage.ContentFormat.CONTENT_TYPE_AUDIO_RAW = new Copper.CoapMessage.ContentFormat(25, "audio/raw");
Copper.CoapMessage.ContentFormat.CONTENT_TYPE_VIDEO_RAW = new Copper.CoapMessage.ContentFormat(26, "video/raw");
Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_LINK_FORMAT = new Copper.CoapMessage.ContentFormat(40, "application/link-format");
Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_XML = new Copper.CoapMessage.ContentFormat(41, "application/xml");
Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_OCTET_STREAM = new Copper.CoapMessage.ContentFormat(42, "application/octet-stream");
Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_RDF_XML = new Copper.CoapMessage.ContentFormat(43, "application/rdf+xml");
Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_SOAP_XML = new Copper.CoapMessage.ContentFormat(44, "application/soap+xml");
Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_ATOM_XML = new Copper.CoapMessage.ContentFormat(45, "application/atom+xml");
Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_XMPP_XML = new Copper.CoapMessage.ContentFormat(46, "application/xmpp+xml");
Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_EXI = new Copper.CoapMessage.ContentFormat(47, "application/exi");
Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_FASTINFOSET = new Copper.CoapMessage.ContentFormat(48, "application/fastinfoset");
Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_SOAP_FASTINFOSET = new Copper.CoapMessage.ContentFormat(49, "application/soap+fastinfoset");
Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_JSON = new Copper.CoapMessage.ContentFormat(50, "application/json");
Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_X_OBIX_BINARY = new Copper.CoapMessage.ContentFormat(51, "application/x-obix-binary");
Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_CBOR = new Copper.CoapMessage.ContentFormat(60, "application/cbor");
Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_TEXT = new Copper.CoapMessage.ContentFormat(1541, "application/vnd.oma.lwm2m+text");
Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_TLV = new Copper.CoapMessage.ContentFormat(1542, "application/vnd.oma.lwm2m+tlv");
Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_JSON = new Copper.CoapMessage.ContentFormat(1543, "application/vnd.oma.lwm2m+json");
Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_OPAQUE = new Copper.CoapMessage.ContentFormat(1544, "application/vnd.oma.lwm2m+opaque");

Copper.CoapMessage.ContentFormat.Registry = [
	Copper.CoapMessage.ContentFormat.CONTENT_TYPE_TEXT_PLAIN,
	Copper.CoapMessage.ContentFormat.CONTENT_TYPE_TEXT_XML,
	Copper.CoapMessage.ContentFormat.CONTENT_TYPE_TEXT_CSV,
	Copper.CoapMessage.ContentFormat.CONTENT_TYPE_TEXT_HTML,
	Copper.CoapMessage.ContentFormat.CONTENT_TYPE_IMAGE_GIF,
	Copper.CoapMessage.ContentFormat.CONTENT_TYPE_IMAGE_JPEG,
	Copper.CoapMessage.ContentFormat.CONTENT_TYPE_IMAGE_PNG,
	Copper.CoapMessage.ContentFormat.CONTENT_TYPE_IMAGE_TIFF,
	Copper.CoapMessage.ContentFormat.CONTENT_TYPE_AUDIO_RAW,
	Copper.CoapMessage.ContentFormat.CONTENT_TYPE_VIDEO_RAW,
	Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_LINK_FORMAT,
	Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_XML,
	Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_OCTET_STREAM,
	Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_RDF_XML,
	Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_SOAP_XML,
	Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_ATOM_XML,
	Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_XMPP_XML,
	Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_EXI,
	Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_FASTINFOSET,
	Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_SOAP_FASTINFOSET,
	Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_JSON,
	Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_X_OBIX_BINARY,
	Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_CBOR,
	Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_TEXT,
	Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_TLV,
	Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_JSON,
	Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_VND_OMA_LWM2M_OPAQUE
];
