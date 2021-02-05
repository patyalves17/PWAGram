
self.registration.showNotification( 'Notification from service Worker', {} );

var CACHE_NAME = 'my-site-cache-v1';
var urlsToCache = [
    '/',
    '/src/css/app.css',
    '/src/css/feed.css',
    '/src/css/help.css',
    '/src/js/feed.js',
    '/src/js/material.min.js'
];

self.addEventListener( 'install', function ( event ) {
    console.log( '[Service Worker] Installing Service Worker ...', event );
    event.waitUntil(
        caches.open( CACHE_NAME )
            .then( function ( cache ) {
                console.log( 'Opened cache' );
                return cache.addAll( urlsToCache );
            } )
    );
} );

