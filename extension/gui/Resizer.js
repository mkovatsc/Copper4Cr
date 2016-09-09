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
* Helper for installing a resizer and a collapser
*/
Copper.Resizer = function(){
};

Copper.Resizer.installResizer = function(elementToResize, onResizedCallback, enableXRight, enableYTop, enableXYBottomLeft){
	let resizer = document.createElement("div");
	if (enableXRight) resizer.classList.add("x-right-resizer");
	if (enableYTop) resizer.classList.add("y-top-resizer");
	if (enableXYBottomLeft) resizer.classList.add("xy-bottom-left");
	if (enableXYBottomLeft){
		let resizerHolder = document.createElement("div");
		resizerHolder.style = "position: absolute; bottom: 0; left: 0; overflow: hidden;";
		elementToResize.appendChild(resizerHolder);
		resizerHolder.appendChild(resizer);
	}
	else {
		elementToResize.appendChild(resizer);
	}

	let initialWidth = enableXRight || enableXYBottomLeft ? Number.parseInt(document.defaultView.getComputedStyle(elementToResize).width, 10) : undefined;
	let initialHeight = enableYTop || enableXYBottomLeft ? Number.parseInt(document.defaultView.getComputedStyle(elementToResize).height, 10) : undefined;
    let startX = undefined;
    let startY = undefined;
    let startWidth = undefined;
    let startHeight = undefined;
    let lastSetWidth = initialWidth;
    let lastSetHeight = initialHeight;

    let setWidth = function(width){
    	lastSetWidth = width;
	    elementToResize.style.width = lastSetWidth + "px";
    };

    let setHeight = function(height){
    	lastSetHeight = height;
    	elementToResize.style.height = lastSetHeight + "px";
    };

    let doDrag = function (e) {

    	if (enableXRight || enableXYBottomLeft){
    		setWidth(startWidth + (enableXRight ? (e.clientX - startX) : (startX - e.clientX)));
    	}
    	if (enableYTop || enableXYBottomLeft){
    		setHeight(startHeight + (enableYTop ? (startY - e.clientY) : (e.clientY - startY)));
    	}
    };

    let stopDrag = function (e) {
        document.documentElement.removeEventListener('mousemove', doDrag, false);
        document.documentElement.removeEventListener('mouseup', stopDrag, false);
        onResizedCallback(lastSetWidth, lastSetHeight);
    };

    let initDrag = function(e) {
    	if (enableXRight || enableXYBottomLeft){
        	startX = e.clientX;
        	startWidth = lastSetWidth;
        }
        if (enableYTop || enableXYBottomLeft){
        	startY = e.clientY;
        	startHeight = lastSetHeight;
        }
        document.documentElement.addEventListener('mousemove', doDrag, false);
        document.documentElement.addEventListener('mouseup', stopDrag, false);
    };

    resizer.addEventListener('mousedown', initDrag, false);

    return {
    	setWidth: setWidth,
    	setHeight: setHeight,
    	reset: function(){
    		if (initialWidth !== undefined){
    			setWidth(initialWidth);
    		}
    		if (initialHeight !== undefined){
    			setHeight(initialHeight);
    		}
    	}
    };
};

Copper.Resizer.installCollapser = function(elementToCollapse, position, onChangedCallback) {
	let collapser = document.createElement("div");
	collapser.classList.add("striped-background");
	collapser.appendChild(document.createElement("span"));
	elementToCollapse.parentNode.appendChild(collapser)
	let collapsed = false;
	let changeCollapsedState = function(newCollapsed) {
		collapsed = newCollapsed;
		Copper.Resizer.updateCollapser(elementToCollapse, collapser, position, newCollapsed);
	};
	changeCollapsedState(collapsed);
	collapser.onclick = function() {
		changeCollapsedState(!collapsed);
		onChangedCallback(collapsed);
	};
	return {
		changeCollapsedState: changeCollapsedState
	};
};

Copper.Resizer.updateCollapser = function(elementToCollapse, collapserElement, originalPosition, collapsed){
	if (collapsed){
		elementToCollapse.classList.add("hidden");
	}
	else {
		elementToCollapse.classList.remove("hidden");
	}
	if ((originalPosition === "left" && collapsed) || (originalPosition === "right" && !collapsed)){
		collapserElement.classList.add("x-collapser");
		collapserElement.classList.remove("x-collapser-left");
		collapserElement.classList.add("x-collapser-right");
		collapserElement.firstChild.innerHTML = "◂<br/><br/>◂";
	}
	else if ((originalPosition === "right" && collapsed) || (originalPosition === "left" && !collapsed)){
		collapserElement.classList.add("x-collapser");
		collapserElement.classList.remove("x-collapser-right");
		collapserElement.classList.add("x-collapser-left");
		collapserElement.firstChild.innerHTML = "▸<br/><br/>▸";
	}
	else if ((originalPosition === "top" && collapsed) || (originalPosition === "bottom" && !collapsed)){
		collapserElement.classList.add("y-collapser");
		collapserElement.classList.remove("y-collapser-top");
		collapserElement.classList.add("y-collapser-bottom");
		collapserElement.firstChild.innerHTML = "▴&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp▴";
	}
	else if ((originalPosition === "bottom" && collapsed) || (originalPosition === "top" && !collapsed)){
		collapserElement.classList.add("y-collapser");
		collapserElement.classList.remove("y-collapser-bottom");
		collapserElement.classList.add("y-collapser-top");
		collapserElement.firstChild.innerHTML = "▾&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp▾";
	}
};