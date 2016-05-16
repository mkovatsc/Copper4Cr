QUnit.test("Event: sendEvent", function(assert) {
	let e1 = Copper.Event.createRegisterClientEvent("192.168.0.1", 5863, new Copper.Settings(), 1);
	let e2 = Copper.Event.createClientUnregisterEvent(2);
	let called1 = 0;
	let called2 = 0;
	Copper.Event.registerCallback(function(event){
		called1++;
		Copper.Event.sendEvent(event);
	}, 1);
	Copper.Event.registerCallback(function(event){
		called2++;
		Copper.Event.sendEvent(event);
	}, 2);
	Copper.Event.sendEvent(e1);
	Copper.Event.sendEvent(e2);
	assert.deepEqual(called1, 2);
	assert.deepEqual(called2, 1);
	assert.deepEqual(Copper.Event.queue.length, 2);
});