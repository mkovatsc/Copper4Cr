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
* Helper for displaying popups
*/
Copper.PopupWindowAdapter = function(){
};

Copper.PopupWindowAdapter.openErrorWindow = function(errorTitle, errorMsg, closable) {
    Copper.PopupWindowAdapter.openPopupWindow(errorTitle, errorMsg, closable, "skin/tool_delete.png");
};

Copper.PopupWindowAdapter.openInfoWindow = function(title, msg, closable) {
    Copper.PopupWindowAdapter.openPopupWindow(title, msg, closable, "skin/tool_discover.png");
};

Copper.PopupWindowAdapter.openPopupWindow = function(title, msg, closable, icon) {
    let blockScreen = document.getElementById("copper-overlay-error").parentNode;
    blockScreen.classList.remove("hidden");
    let errorMsgTitleElement = document.getElementById("copper-overlay-error-title");
    errorMsgTitleElement.innerHTML = "Copper (Cu) - " + title;
    let errorMsgElement = document.getElementById("copper-error-msg");
    errorMsgElement.innerHTML = msg;
    let iconElement = document.getElementById("copper-overlay-icon");
    iconElement.src = icon;

    if (closable) {
        let exitButton = document.createElement("BUTTON");
        exitButton.textContent = "OK";
        exitButton.classList.add("copper-error-exit-button");
        document.getElementById("copper-overlay-error").lastElementChild.appendChild(exitButton);
        exitButton.onclick = function() {
            blockScreen.classList.add("hidden");
        };
    } else {
        let reloadButton = document.createElement("BUTTON");
        reloadButton.textContent = "Reload Page";
        reloadButton.classList.add("copper-error-reload-button");
        document.getElementById("copper-overlay-error").lastElementChild.appendChild(reloadButton);
        reloadButton.onclick = function() {
            document.location.reload(true);
        };

        let backButton = document.createElement("BUTTON");
        backButton.textContent = "Back to Resource Selection";
        backButton.classList.add("copper-error-back-to-resource-button");
        document.getElementById("copper-overlay-error").lastElementChild.appendChild(backButton);
        backButton.onclick = function() {
            Copper.CoapResourceHandler.goToResourceSelection();
        };
    }
};

Copper.PopupWindowAdapter.closeInfoWindow = function(title, msg) {
    let blockScreen = document.getElementById("copper-overlay-error").parentNode;
    blockScreen.classList.add("hidden");
};
