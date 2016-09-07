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

Copper.StatusBarAdapter = function(){
};

Copper.StatusBarAdapter.blockUpdates = undefined;

Copper.StatusBarAdapter.onSelectedProfileUpdated = function(){
    Copper.StatusBarAdapter.setText('Loaded profile "'
        + (Copper.Profiles.DEFAULT_PROFILE_KEY === Copper.Session.profiles.selectedProfile ? "Standard Profile" : Copper.Session.profiles.selectedProfile) + '"');
};

Copper.StatusBarAdapter.onEvent = function(event) {

    switch(event.type){
        case Copper.Event.TYPE_OBSERVE_REQUEST_FRESH:
            Copper.StatusBarAdapter.appendText("(Observing)");
                break;
        case Copper.Event.TYPE_OBSERVE_REQUEST_OUT_OF_ORDER:
            break;
        case Copper.Event.TYPE_COAP_MESSAGE_RECEIVED:
        case Copper.Event.TYPE_UNKNOWN_COAP_MESSAGE_RECEIVED:
            if (Copper.StatusBarAdapter.blockUpdates !== undefined) {
                return;
            }
            if (event.data.coapMessage.code.number !== Copper.CoapMessage.Code.EMPTY.number) {
                Copper.StatusBarAdapter.setText(event.data.coapMessage.code.getName());
            }
            break;
        case Copper.Event.TYPE_REQUEST_COMPLETED:
        case Copper.Event.TYPE_REQUEST_CANCELED:
            if (Copper.StatusBarAdapter.blockUpdates !== undefined) {
                Copper.StatusBarAdapter.appendText(Copper.StatusBarAdapter.blockUpdates);
                Copper.StatusBarAdapter.blockUpdates = undefined;
                return;
            }
            switch (event.data.requestCoapMessage.code.number) {
                case Copper.CoapMessage.Code.GET.number:
                    Copper.StatusBarAdapter.appendText("(Download Finished)");
                    break;
                case Copper.CoapMessage.Code.EMPTY.number:
                    Copper.StatusBarAdapter.setText("Ping: Remote responds to CoAP");
                    Copper.StatusBarAdapter.appendText("(RTT " + event.data.requestDuration + " ms)");
                    break;

                default:
                    Copper.StatusBarAdapter.appendText("(RTT " + event.data.requestDuration + " ms)");
                    break;
            }
            break;
    }
};

Copper.StatusBarAdapter.setTextAndBlockUpdates = function(msgOnStart, msgOnCompleted) {
    if (Copper.StatusBarAdapter.blockUpdates !== undefined) {
        return;
    }
    Copper.StatusBarAdapter.setText(msgOnStart);
    Copper.StatusBarAdapter.blockUpdates = msgOnCompleted;
}

Copper.StatusBarAdapter.setText = function (newText) {
    let statusBar = document.getElementById("status-label");
    statusBar.innerHTML = newText;
};

Copper.StatusBarAdapter.appendText = function (appendedText) {
    let statusBar = document.getElementById("status-label");
    statusBar.innerHTML = statusBar.innerHTML + " " + appendedText;
};