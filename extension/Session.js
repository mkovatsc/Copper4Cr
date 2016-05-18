window.onload = function(){
	Copper.ComponentFactory = Copper.ChromeComponentFactory;
    Copper.Log.registerLogger(Copper.ConsoleLogger.log);
    Copper.OverlayAdapter.addOverlay();

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

Copper.Session.clientEndpoint = undefined;
Copper.Session.localPort = undefined;

// setup session
// register client
// bind HTML to javascript
Copper.Session.registerClient = function(clientId, port, remoteAddress, remotePort, path){
    Copper.Session.clientId = clientId;
    Copper.Session.remoteAddress = remoteAddress;
    Copper.Session.remotePort = remotePort;
    Copper.Session.path = path;

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
                Copper.OverlayAdapter.addTitleTextOverlay("Error", "Error " + event.errorType + ": " + event.errorMessage);
                break;
            default:
                Copper.OverlayAdapter.addTitleTextOverlay("Error: Invalid Event", "Received invalid event(" + event.type + ") from app. Please restart the extension.");
                break;
        }
        return true;
    };
    Copper.Event.registerCallback(registeredCallback, clientId);
    port.sendMessage(Copper.Event.createRegisterClientEvent(remoteAddress, remotePort, new Copper.Settings(), clientId));
};

Copper.Session.startExtension = function(){
    let guiAdapters = [
        Copper.PacketHeaderAdapter,
        Copper.PayloadAdapter,
        Copper.ToolbarAdapter
    ];

    // init
    for (let i=0; i<guiAdapters.length; i++){
        guiAdapters[i].init();
    }

    // event callback
    Copper.Event.registerCallback(function(event){
        for (let i=0; i<guiAdapters.length; i++){
            guiAdapters[i].onEvent(event);
        }
        return true;
    }, Copper.Session.clientId);
};

Copper.Session.onPortDisconnect = function(){
    Copper.OverlayAdapter.addTitleTextOverlay("Connection lost...", "Connection to Copper app lost. Please restart the extension.");
};