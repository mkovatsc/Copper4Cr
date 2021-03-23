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
/*
* Holder for the payload options
* Use @addPayloadToCoapMessage to add the selected payload to the coapMessage
*/
Copper.Payload = function() {
};

Copper.Payload.prototype.payloadMode = "text";
Copper.Payload.prototype.payloadText = "";
Copper.Payload.prototype.payloadFileData = new ArrayBuffer(0);
Copper.Payload.prototype.payloadFileName = undefined;

Copper.Payload.prototype.clone = function(){
    return Copper.CopperUtils.cloneObject(this, new Copper.Payload());
};

Copper.Payload.prototype.addPayloadToCoapMessage = function(coapMessage, useUtf8, setContentType){
	if (Copper.CoapMessage.Code.POST.equals(coapMessage.code)
		|| Copper.CoapMessage.Code.PUT.equals(coapMessage.code)
		|| Copper.CoapMessage.Code.PATCH.equals(coapMessage.code)
		|| Copper.CoapMessage.Code.iPATCH.equals(coapMessage.code)){
		if (this.payloadMode === "text"){
			if (setContentType && !coapMessage.isOptionSet(Copper.CoapMessage.OptionHeader.CONTENT_FORMAT)){
				coapMessage.addOption(Copper.CoapMessage.OptionHeader.CONTENT_FORMAT, Copper.CoapMessage.ContentFormat.CONTENT_TYPE_TEXT_PLAIN.number);
			}
			coapMessage.setPayload(Copper.ByteUtils.convertStringToBytes(document.getElementById("copper-payload-tab-out").value, !useUtf8));
		}
		else if (this.payloadFileData.byteLength > 0) {
			coapMessage.setPayload(this.payloadFileData);
			if (setContentType && !coapMessage.isOptionSet(Copper.CoapMessage.OptionHeader.CONTENT_FORMAT)){
				let match = /\.([a-zA-Z]+)$/g.exec(this.payloadFileName.trim());
				if (match) {
					let contentFormat = Copper.CoapMessage.ContentFormat.getContentFormatForExtension(match[1]);
					if (contentFormat) coapMessage.addOption(Copper.CoapMessage.OptionHeader.CONTENT_FORMAT, contentFormat.number);
				}
			}
		}
	} 
};