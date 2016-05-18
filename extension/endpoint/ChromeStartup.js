Copper.ChromeStartup = function(){
};

Copper.ChromeStartup.resolvePortAndCoapEndpoint = function(clientId, finalDisconnectHandler, callback){
	let appId = "mbighlecbopknoggoappifafoffcnocc";
	let port = Copper.ComponentFactory.createPort(chrome.runtime.connect(appId), clientId);

	let resolveEndpointFunction = function(){
		Copper.ChromeStartup.resolveCoapEndpoint(clientId, port, finalDisconnectHandler, callback);
	};
    let firstTimeout = Copper.TimeUtils.setTimeout(resolveEndpointFunction, 20);

    port.registerDisconnectCallback(function(){
        // app not started
        Copper.TimeUtils.clearTimeout(firstTimeout);
        Copper.TimeUtils.setTimeout(resolveEndpointFunction, 500)
        Copper.OverlayAdapter.addTitleTextOverlay("Starting...", "Try to start the Copper Application");
        chrome.management.launchApp(appId, function(){
            port = Copper.ComponentFactory.createPort(chrome.runtime.connect(appId), clientId);
            port.registerDisconnectCallback(function(){
                // app was not started
                port = undefined;
            });
        });
    });
};

Copper.ChromeStartup.resolveCoapEndpoint = function(clientId, port, finalDisconnectHandler, callback){
    if (port === undefined){
        Copper.OverlayAdapter.addTitleTextOverlay("Copper App not installed", "This extension needs the Copper application to send Coap-Messages. Please install the app and reload.");
    }
    else {
        port.registerDisconnectCallback(finalDisconnectHandler);

        let search = window.location.search;
        let uri = undefined;
        if (search && search.startsWith("?")){
            uri = Copper.StringUtils.parseUri(decodeURIComponent(search.substr(1)));
        }
        if (uri === undefined){
            Copper.OverlayAdapter.addInputOverlay("Enter Endpoint", "Enter the URL of the Coap Endpoint", undefined, "coap://", "OK", function(value, errorCallback){
                uri = Copper.StringUtils.parseUri(value);
                if (uri === undefined){
                    errorCallback("Please enter a valid URL");
                }
                else {
                    window.location.search = "?" + encodeURIComponent("coap://" + uri.address + ":" + (uri.port ? uri.port : Copper.CoapConstants.DEFAULT_PORT) + uri.path);
                }
            });
        }
        else {
            callback(clientId, port, uri.address, uri.port ? uri.port : Copper.CoapConstants.DEFAULT_PORT, uri.path);
        }
    }
};