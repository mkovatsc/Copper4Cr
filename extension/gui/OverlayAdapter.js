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
 
Copper.OverlayAdapter = function(){
};

Copper.OverlayAdapter.overlayId = "copper-overlay";
Copper.OverlayAdapter.overlayContentId = "copper-overlay-content";

Copper.OverlayAdapter.addOverlay = function(contentNode){
	Copper.OverlayAdapter.removeOverlay();
	let overlayDiv = document.createElement("div");
	overlayDiv.id = Copper.OverlayAdapter.overlayId;
	document.body.appendChild(overlayDiv);
	if (contentNode !== undefined){
		document.body.appendChild(contentNode);
	}
};

Copper.OverlayAdapter.getNewContentNode = function(){
	let container = document.createElement("div");
	container.id = Copper.OverlayAdapter.overlayContentId;
	return container;
};

Copper.OverlayAdapter.getNewMessageBoxNode = function(){
	let container = document.createElement("div");
	container.id = Copper.OverlayAdapter.overlayContentId;
	return container;
};

Copper.OverlayAdapter.addTitleTextOverlay = function(title, text){
	return Copper.OverlayAdapter.addInputOverlay(title, text);
};

Copper.OverlayAdapter.addInputOverlay = function(title, text, errorMsg, inputValue, buttonText, onClick){
	if (typeof(title) !== "string" || typeof(text) !== "string"){
		throw new Error("Illegal Argument");
	}
	let container = Copper.OverlayAdapter.getNewContentNode();
	
	let titleElement = document.createElement("h1");
	titleElement.textContent = title;
	container.appendChild(titleElement);
	
	let textElement = document.createElement("p");
	textElement.textContent = text;
	container.appendChild(textElement);

	if (onClick !== undefined){
		let errorElement = document.createElement("p");
		errorElement.classList.add("error-message");
		errorElement.textContent = errorMsg !== undefined ? errorMsg : "";
		container.appendChild(errorElement);

		let inputElement = document.createElement("input");
		inputElement.type = "text";
		if (inputValue !== undefined){
			inputElement.value = inputValue;
		}
		container.appendChild(inputElement);

		let buttonElement = document.createElement("button");
		buttonElement.textContent = buttonText;
		buttonElement.onclick = function(){ 
			onClick(inputElement.value, function(newErrorMsg){
				errorElement.textContent = newErrorMsg !== undefined ? newErrorMsg : "";
			}); 
		};
		container.appendChild(buttonElement);

		// On press enter click button
		inputElement.addEventListener("keyup", function(event) {
			event.preventDefault();
			if (event.keyCode == 13) {
				buttonElement.click();
			}
		});
	}

	Copper.OverlayAdapter.addOverlay(container);
};

Copper.OverlayAdapter.addErrorMsgOverlay = function(title, text){
	if (typeof(title) !== "string" || typeof(text) !== "string"){
		throw new Error("Illegal Argument");
	}
	let container = Copper.OverlayAdapter.getNewMessageBoxNode();
	
	let titleElement = document.createElement("h1");
	titleElement.textContent = title;
	container.appendChild(titleElement);
	
	let textElement = document.createElement("p");
	textElement.textContent = text;
	container.appendChild(textElement);

	let buttonElement = document.createElement("button");
	buttonElement.textContent = "OK";
	buttonElement.onclick = function(){ 
		Copper.OverlayAdapter.removeOverlay();
	};
	container.appendChild(buttonElement);

	Copper.OverlayAdapter.addOverlay(container);
};

Copper.OverlayAdapter.removeOverlay = function(){
	let overlayNode = document.getElementById(Copper.OverlayAdapter.overlayId);
    if (overlayNode !== undefined && overlayNode !== null){
    	overlayNode.parentNode.removeChild(overlayNode);
    }
    let overlayContentNode = document.getElementById(Copper.OverlayAdapter.overlayContentId);
    if (overlayContentNode !== undefined && overlayContentNode !== null){
    	overlayContentNode.parentNode.removeChild(overlayContentNode);
    }
};