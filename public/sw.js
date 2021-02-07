
// self.registration.showNotification( 'Notification from service Worker', {} );

var CACHE_NAME = 'my-site-cache-v1';
var urlsToCache = [
    '/',
    '/offline.html',
    '/src/css/app.css',
    '/src/css/feed.css',
    '/src/css/help.css',
    '/src/js/feed.js',
    '/src/js/material.min.js'
];

// Incrementing OFFLINE_VERSION will kick off the install event and force
// previously cached resources to be updated from the network.
const OFFLINE_VERSION = 1;
// const CACHE_NAME = "offline";
// Customize this with a different URL if needed.
const OFFLINE_URL = "offline.html";

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




self.addEventListener( "activate", ( event ) => {
    event.waitUntil(
        ( async () => {
            // Enable navigation preload if it's supported.
            // See https://developers.google.com/web/updates/2017/02/navigation-preload
            if ( "navigationPreload" in self.registration ) {
                await self.registration.navigationPreload.enable();
            }
        } )()
    );

    // Tell the active service worker to take control of the page immediately.
    self.clients.claim();
} );


self.addEventListener( "fetch", ( event ) => {
    // We only want to call event.respondWith() if this is a navigation request
    // for an HTML page.
    if ( event.request.mode === "navigate" ) {
        event.respondWith(
            ( async () => {
                try {
                    // First, try to use the navigation preload response if it's supported.
                    const preloadResponse = await event.preloadResponse;
                    if ( preloadResponse ) {
                        return preloadResponse;
                    }

                    // Always try the network first.
                    const networkResponse = await fetch( event.request );
                    return networkResponse;
                } catch ( error ) {
                    // catch is only triggered if an exception is thrown, which is likely
                    // due to a network error.
                    // If fetch() returns a valid HTTP response with a response code in
                    // the 4xx or 5xx range, the catch() will NOT be called.
                    console.log( "Fetch failed; returning offline page instead.", error );

                    const cache = await caches.open( CACHE_NAME );
                    const cachedResponse = await cache.match( OFFLINE_URL );
                    return cachedResponse;
                }
            } )()
        );
    }
} );


self.addEventListener( 'notificationclick', ( event ) => {
    let notification = event.notification;
    let action = event.action;

    console.log( notification );

    if ( action === 'confirm' ) {
        console.log( 'Confirm was chosen' );
        notification.close();
    } else {
        console.log( action );
    }
} );