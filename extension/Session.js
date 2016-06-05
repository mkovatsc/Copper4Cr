window.onload = function(){
	Copper.ComponentFactory = Copper.ChromeComponentFactory;
    Copper.Log.registerLogger(Copper.ConsoleLogger.log);

    let clientId = 1;
    // resolve port, remoteAddress:port in a browser dependent way
    Copper.ChromeComponentFactory.resolvePortAndCoapEndpoint(clientId, Copper.Session.onPortDisconnect, Copper.Session.registerClient);
};

Copper.Session = function(){
};

Copper.Session.clientId = undefined;
Copper.Session.remoteAddress = undefined;
Copper.Session.remotePort = undefined;
Copper.Session.path = undefined;
Copper.Session.query = undefined;

Copper.Session.settings = undefined;

Copper.Session.clientEndpoint = undefined;
Copper.Session.localPort = undefined;

Copper.Session.guiAdapters = [
        Copper.MessageLogAdapter,
        Copper.PacketHeaderAdapter,
        Copper.PacketOptionsAdapter,
        Copper.PayloadAdapter,
        Copper.ToolbarAdapter
    ];

// setup session
// register client
// bind HTML to javascript
Copper.Session.registerClient = function(clientId, port, remoteAddress, remotePort, path, query){
    Copper.Session.clientId = clientId;
    Copper.Session.remoteAddress = remoteAddress;
    Copper.Session.remotePort = remotePort;
    Copper.Session.path = path;
    Copper.Session.query = query;

    Copper.Session.settings = new Copper.Settings();

    let registeredCallback = function(event){
        switch (event.type){
            case Copper.Event.TYPE_CLIENT_REGISTERED: 
                Copper.Event.unregisterCallback(registeredCallback, clientId);
                Copper.OverlayAdapter.removeOverlay();

                Copper.Session.clientEndpoint = new Copper.ClientEndpoint(port, clientId);
                Copper.Session.localPort = event.port;

                Copper.Session.startExtension();
                break;
            case Copper.Event.TYPE_ERROR_ON_SERVER: 
                Copper.OverlayAdapter.addTitleTextOverlay("Error", "Error " + event.data.errorType + ": " + event.data.errorMessage);
                break;
            default:
                Copper.OverlayAdapter.addTitleTextOverlay("Error: Invalid Event", "Received invalid event(" + event.type + ") from app. Please restart the extension.");
                break;
        }
        return true;
    };
    Copper.Event.registerCallback(registeredCallback, clientId);
    port.sendMessage(Copper.Event.createRegisterClientEvent(remoteAddress, remotePort, Copper.Session.settings, clientId));
};

Copper.Session.startExtension = function(){
    let guiAdapters = Copper.Session.guiAdapters;
    
    // init
    for (let i=0; i<guiAdapters.length; i++){
        if (typeof(guiAdapters[i].init) === "function"){
            guiAdapters[i].init();
        }
    }

    // event callback
    Copper.Event.registerCallback(function(event){
        for (let i=0; i<guiAdapters.length; i++){
            if (typeof(guiAdapters[i].onEvent) === "function"){
                guiAdapters[i].onEvent(event);
            }
        }
        switch (event.type){
            case Copper.Event.TYPE_ERROR_ON_SERVER:
                Copper.Session.showErrorMessage(event.data.errorType, event.data.errorMessage);
                break;
        }
        return true;
    }, Copper.Session.clientId);
};

Copper.Session.showErrorMessage = function(errorNo, errorMessage){
    if (!Number.isInteger(errorNo) || typeof(errorMessage) !== "string"){
        throw new Error("Illegal Arguments");
    }
    Copper.OverlayAdapter.addErrorMsgOverlay("Error " + errorNo, errorMessage);
};

Copper.Session.sendCoapMessage = function(coapMessage, withoutModification){
    if (!(coapMessage instanceof Copper.CoapMessage)){
        throw new Error("Illegal Argument");
    }
    if (Copper.Session.clientEndpoint === undefined){
        throw new Error("Illegal State");
    }
    try{
        if (!withoutModification){
            // add URI-PATH and URI-QUERY
            if (Copper.Session.path !== undefined){
                let pathParts = Copper.Session.path.split("/");
                for (let i=0; i<pathParts.length; i++){
                    coapMessage.addOption(Copper.CoapMessage.OptionHeader.URI_PATH, pathParts[i]);
                }
            }
            if (Copper.Session.query !== undefined){
                let queryParts = Copper.Session.query.split("&");
                for (let i=0; i<queryParts.length; i++){
                    coapMessage.addOption(Copper.CoapMessage.OptionHeader.URI_QUERY, queryParts[i]);
                }
            }
            let guiAdapters = Copper.Session.guiAdapters;
            for (let i=0; i<guiAdapters.length; i++){
                if (typeof(guiAdapters[i].beforeSendingCoapMessage) === "function"){
                    try {
                        guiAdapters[i].beforeSendingCoapMessage(coapMessage);
                    } catch (exception){
                        Copper.Log.logError(exception.stack);
                        Copper.Session.showErrorMessage(-1, exception.message);
                    }
                }
            }
        }
        Copper.Session.clientEndpoint.sendCoapMessage(coapMessage);
    } catch (exception){
        Copper.Log.logError(exception.stack);
        Copper.Session.showErrorMessage(-1, exception.message);
    }
};

Copper.Session.onPortDisconnect = function(){
    Copper.Session.clientEndpoint = undefined;
    Copper.Session.localPort = undefined;
    Copper.OverlayAdapter.addTitleTextOverlay("Connection lost...", "Connection to Copper app lost. Please restart the extension.");
};