Copper.ComponentFactory = {
	createPort: function(port, endpointId){
					throw new Error("not implemented");
				},
    createUdpClient: function(){
    				throw new Error("not implemented");
    			},
    // used as the client startup procedure
    // connects to the server port and resolves the url, port and path
    // must ensure that finalDisconnectHandler is set on the port finally
    // calls the callback afterwards (function())
    resolvePortAndCoapEndpoint: function(clientId, finalDisconnectHandler, callback){
    				throw new Error("not implemented");
    			}
};

Copper.ChromeComponentFactory = {
	createPort: function(port, endpointId){
					return new Copper.ChromePort(port, endpointId);
				},
    createUdpClient: function(){
    				return new Copper.ChromeUdpClient();
    			},
    resolvePortAndCoapEndpoint: function(clientId, finalDisconnectHandler, callback){
    				return Copper.ChromeStartup.resolvePortAndCoapEndpoint(clientId, finalDisconnectHandler, callback);
    			}
};