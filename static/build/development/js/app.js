if('serviceWorker' in navigator){
	navigator.serviceWorker.register('./service-worker.js', { scope: './'})
		.then(function(registration){
			console.log("S W ", registration);
		})
		.catch(function(err){
			console.log('Failed to register', err);
		});
};