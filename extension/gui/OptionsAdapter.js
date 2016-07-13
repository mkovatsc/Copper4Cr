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

Copper.OptionsAdapter = function(){
};

Copper.OptionsAdapter.encode_utf_8 = true;
Copper.OptionsAdapter.plugtest = false;

window.onload = function()
{
    document.getElementById("close-button").onclick = Copper.OptionsAdapter.closeWindow;
    document.getElementById("encode-utf-8").onclick = Copper.OptionsAdapter.checkEncode_utf_8;
    document.getElementById("plugtest").onclick = Copper.OptionsAdapter.checkPlugtest;
    document.getElementById("clear-resource-cache").onclick = Copper.OptionsAdapter.clearResourceCache;
    document.getElementById("clear-payload-cache").onclick = Copper.OptionsAdapter.clearPayloadCache;

    // Init default
    var encode_utf_8 = document.getElementById("encode-utf-8");
    encode_utf_8.checked = "checked"
};

Copper.OptionsAdapter.openWindow = function(){

    var w = 260;
    var h = 280;
    var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
    var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

    var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    var left = Math.round(((width / 2) - (w / 2)) + dualScreenLeft);
    var top = Math.round(((height / 2) - (h / 2)) + dualScreenTop);

    chrome.windows.create({
        'url': 'options.html',
        'type': 'popup',
        'height': h,
        'width': w,
        'left': left,
        'top': top
    }, function (window) {
    });
}


Copper.OptionsAdapter.checkEncode_utf_8 = function(){
    if (this.checked) {
        Copper.OptionsAdapter.encode_utf_8 = true;
    } else {
        Copper.OptionsAdapter.encode_utf_8 = false;
    }
};

Copper.OptionsAdapter.checkPlugtest = function(){
    if (this.checked) {
        Copper.OptionsAdapter.plugtest = true;
    } else {
        Copper.OptionsAdapter.plugtest = false;
    }
};

Copper.OptionsAdapter.closeWindow = function(){
    window.close();
};

Copper.OptionsAdapter.clearResourceCache = function(){
};

Copper.OptionsAdapter.clearPayloadCache = function(){
};
