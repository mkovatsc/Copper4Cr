options = new Copper.Options();
options.loggers = [new Copper.ConsoleLogger()];
Copper.LogUtil.logInfo("test Logging", options);

udpClient = new Copper.ChromeUdpClient("127.0.0.1", 5683, options);
udpClient.bind(function(){
	udpClient.send(null);
	window.setTimeout(function(){
		udpClient.shutdown();
	},1000);
});