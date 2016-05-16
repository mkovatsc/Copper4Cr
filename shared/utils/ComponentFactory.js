Copper.ComponentFactory = {
	createPort: function(port, endpointId){
					throw new Error("not implemented");
				},
    createUdpClient: function(){
    				throw new Error("not implemented");
    			}
};

Copper.ChromeComponentFactory = {
	createPort: function(port, endpointId){
					return new Copper.ChromePort(port, endpointId);
				},
    createUdpClient: function(){
    				return new Copper.ChromeUdpClient();
    			}
};