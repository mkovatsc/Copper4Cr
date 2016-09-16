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
* GUI-Adapter for the Logger that can be shown using the top right button in the toolbar
* - Add log messages for different events
* - Installs a resizer
*/
Copper.ToolbarLoggerAdapter = function(){
};

Copper.ToolbarLoggerAdapter.resizer = undefined;

Copper.ToolbarLoggerAdapter.beforeSessionInitialization = function(){
    Copper.ToolbarLoggerAdapter.resizer = Copper.Resizer.installResizer(document.getElementById("copper-toolbar-log-event-container"), function(newWidth, newHeight){
        Copper.Session.layout.eventLogWidth = newWidth;
        Copper.Session.layout.eventLogHeight = newHeight;
        Copper.Session.updateLayout(Copper.Session.layout);
    }, false, false, true);
};

Copper.ToolbarLoggerAdapter.onLayoutUpdated = function(){
    if (Copper.Session.layout.eventLogWidth !== undefined && Copper.Session.layout.eventLogHeight !== undefined){
        Copper.ToolbarLoggerAdapter.resizer.setWidth(Copper.Session.layout.eventLogWidth);
        Copper.ToolbarLoggerAdapter.resizer.setHeight(Copper.Session.layout.eventLogHeight);
    }
    else {
        Copper.ToolbarLoggerAdapter.resizer.reset();   
    }
};

Copper.ToolbarLoggerAdapter.addLogEntry = function(log, onCurrent) {
    let logger = document.getElementById("copper-toolbar-log-event-log");
    let newEntry = document.createElement("p");
    newEntry.style.fontFamily = "lucida console";
    let time = "[" + Copper.StringUtils.getTime() + "] ";
    if (onCurrent) {
        newEntry.innerHTML = time + '<i><strong>' + log + '</strong></i>';
    } else {
        newEntry.textContent = time + log;
    }
    logger.insertBefore(newEntry, logger.firstChild);
};

Copper.ToolbarLoggerAdapter.onEvent = function(event) {

    switch (event.type) {
        case Copper.Event.TYPE_COAP_MESSAGE_SENT:
            Copper.ToolbarLoggerAdapter.addLogEntry("Sent " + event.data.bytesSent + " bytes to " + Copper.Session.remoteAddress + ":" + Copper.Session.remotePort);
            break;
        case Copper.Event.TYPE_COAP_MESSAGE_RECEIVED:
            Copper.ToolbarLoggerAdapter.addLogEntry("Received " + event.data.byteLength + " bytes from " + Copper.Session.remoteAddress + ":" + Copper.Session.remotePort);
            break;
    }
};

