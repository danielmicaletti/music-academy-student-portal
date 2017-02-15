
var cacheName = 'v1';
var cacheFiles = [
	'/',
	'../images/hga_logo.png',
	'../images/blank_user.png',
	'../css/bower.min.css',
	'../css/main.min.css',
	'http://maxcdn.bootstrapcdn.com/font-awesome/latest/css/font-awesome.min.css',
	'https://fonts.googleapis.com/css?family=Muli:400,300',
	'../js/bower.min.js',
	'../js/main.min.js',
	'../views/directives/forum-discussion.directive.html',
	'../views/directives/student-goal-dash.directive.html',
	'../views/directives/student-goal-full.directive.html',
	'../views/directives/student-materials-dash.directive.html',
	'../views/directives/student-materials-full.directive.html',
	'../views/directives/student-objective-dash.directive.html',
	'../views/directives/student-objective-full.directive.html',
	'../views/directives/student-practice-dash.directive.html',
	'../views/directives/student-practice-full.directive.html',
	'../views/directives/student-wishlist-dash.directive.html',
	'../views/directives/student-wishlist-full.directive.html',
	'../views/forum/forum.html',
	'../views/main/app.html',
	'../views/main/dashboard.html',
	'../views/main/leaderboard.html',
	'../views/main/login.html',
	'../views/modals/add-course.modal.html',
	'../views/modals/forum-topic.modal.html',
	'../views/modals/student-goal.modal.html',
	'../views/modals/student-materials.modal.html',
	'../views/modals/student-objective.modal.html',
	'../views/modals/student-practice.modal.html',
	'../views/modals/student-wishlist.modal.html',
	'../views/schedule/schedule.html',
	'../views/users/student-goal.html',
	'../views/users/student-materials.html',
	'../views/users/student-objective.html',
	'../views/users/student-practice.html',
	'../views/users/student-wishlist.html',
	'../views/users/user-profile.html',
];

self.addEventListener('install', function(e){
	console.log('Service Worker Install', e);

	e.waitUntil(
		caches.open(cacheName).then(function(cache){
			console.log('Cache files', cache);
			return cache.addAll(cacheFiles);
		})
		.catch(function(errMsg){
			console.log('Install error ', errMsg);
		})
	);

});

self.addEventListener('activate', function(e){
	console.log('Service Worker Activate', e);

	e.waitUntil(
		caches.keys().then(function(cacheNames){
			console.log('Cache Names ', cacheNames);
			return Promise.all(cacheNames.map(function(curCacheName){
				if(curCacheName !== cacheName){
					console.log('Service Worker removing cached files from ', curCacheName);
					return caches.delete(curCacheName);
				}
			}))
		})
		.catch(function(errMsg){
			console.log('Activate error ', errMsg);
		})
	);
});

self.addEventListener('fetch', function(e){
	console.log('Service Worker Fetch', e);

	e.respondWith(
		caches.match(e.request).then(function(response){
			if(response){
				console.log('Service Worker fetching cache', e.request.url);
				return response;
			}

			var requestClone = e.request.clone();

			fetch(requestClone).then(function(response){

				if(!response){
					console.log('Service Worker no response');
					return response;
				}

				var responseClone = response.clone();

				caches.open(cacheName).then(function(cache){
					cache.put(e.request, responseClone);
					return response;
				})
			});
		})
		.catch(function(errMsg){
			console.log('Service Worker error on fetching and caching', errMsg);
		})
	);

});




