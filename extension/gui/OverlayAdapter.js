Copper.OverlayAdapter = function(){
};

Copper.OverlayAdapter.overlayId = "copper-overlay";
Copper.OverlayAdapter.overlayContentId = "copper-overlay-content";

Copper.OverlayAdapter.addOverlay = function(contentNode){
	Copper.OverlayAdapter.removeOverlay();
	let overlayDiv = document.createElement("div");
	overlayDiv.id = Copper.OverlayAdapter.overlayId;
	overlayDiv.style.cssText = "position:fixed; top: 0; bottom: 0; left: 0; right: 0; background-color: #000; opacity: 0.5; z-index: 100;";
	document.body.appendChild(overlayDiv);
	if (contentNode !== undefined){
		document.body.appendChild(contentNode);
	}
};

Copper.OverlayAdapter.getNewContentNode = function(){
	let container = document.createElement("div");
	container.style.cssText = "position: fixed; top: 20%; bottom: 20%; left: 20%; right: 20%; background-color: #FFF; opacity: 1; z-index: 101; border-radius: 10px; padding: 20px; overflow: auto; ";
	container.id = Copper.OverlayAdapter.overlayContentId;
	return container;
};

Copper.OverlayAdapter.getNewMessageBoxNode = function(){
	let container = document.createElement("div");
	container.style.cssText = "position: fixed; top: 30%; bottom: 30%; left: 30%; right: 30%; background-color: #FFF; opacity: 1; z-index: 101; border-radius: 10px; padding: 20px; overflow: auto; ";
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
	
	let titleElement = document.createElement("p");
	titleElement.style.cssText = "margin-bottom: 10px; font-weight: bold; font-size: 20px; ";
	titleElement.innerHTML = title;
	container.appendChild(titleElement);
	
	let textElement = document.createElement("p");
	textElement.style.cssText = "margin-bottom: 10px; font-size: 14px; ";
	textElement.innerHTML = text;
	container.appendChild(textElement);

	if (onClick !== undefined){
		let errorElement = document.createElement("p");
		errorElement.style.cssText = "margin-bottom: 10px; font-size: 14px; color: red; ";
		errorElement.innerHTML = errorMsg !== undefined ? errorMsg : "";
		container.appendChild(errorElement);

		let inputElement = document.createElement("input");
		inputElement.type = "text";
		if (inputValue !== undefined){
			inputElement.value = inputValue;
		}
		container.appendChild(inputElement);

		let buttonElement = document.createElement("button");
		buttonElement.innerHTML = buttonText;
		buttonElement.onclick = function(){ 
			onClick(inputElement.value, function(newErrorMsg){
				errorElement.innerHTML = newErrorMsg !== undefined ? newErrorMsg : "";
			}); 
		};
		container.appendChild(buttonElement);
	}

	Copper.OverlayAdapter.addOverlay(container);
};

Copper.OverlayAdapter.addErrorMsgOverlay = function(title, text){
	if (typeof(title) !== "string" || typeof(text) !== "string"){
		throw new Error("Illegal Argument");
	}
	let container = Copper.OverlayAdapter.getNewMessageBoxNode();
	
	let titleElement = document.createElement("p");
	titleElement.style.cssText = "margin-bottom: 10px; font-weight: bold; font-size: 20px; ";
	titleElement.innerHTML = title;
	container.appendChild(titleElement);
	
	let textElement = document.createElement("p");
	textElement.style.cssText = "margin-bottom: 10px; font-size: 14px; ";
	textElement.innerHTML = text;
	container.appendChild(textElement);

	let buttonElement = document.createElement("button");
	buttonElement.innerHTML = "OK";
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