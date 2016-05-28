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