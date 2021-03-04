importScripts( '/src/js/idb.js' );
importScripts( '/src/js/utility.js' );

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
        notification.close();
    }
} );

self.addEventListener( 'notificationclose', ( event ) => {
    console.log( 'notification Was close' );

} );

self.addEventListener( 'push', ( event ) => {
    console.log( 'Push Notification Received', event );
    var data = { Title: 'New!!!', content: 'Something new happened!' };

    if ( event.data ) {
        data = JSON.parse( event.data.text() );
    }

    var options = {
        body: data.content,
        icon: '/src/images/icons/app-icon-96x96.png',
        badge: '/src/images/icons/app-icon-96x96.png',
    }

    event.waitUntil(
        self.registration.showNotification( data.title, options )
    );


} );

self.addEventListener( 'sync', ( event ) => {
    console.log( '[Service Worker] Background Syncing ', event );
    if ( event.tag === 'sync-new-post' ) {
        console.log( '[Service Worker] Syncing new Post ', event );
        event.waitUntil(
            readAllData( 'sync-posts' ).then( data => {



                for ( let dt of data ) {

                    let post = {
                        id: dt.id,
                        title: dt.title,
                        location: dt.location,
                        image: 'https://firebasestorage.googleapis.com/v0/b/pwagran-5b05e.appspot.com/o/Seto-Great-Bridge-Inland-Sea.jpg?alt=media&token=76dc7407-db49-4412-a70a-dc1f593d3f8e'
                    };

                    fetch( 'https://us-central1-pwagran-5b05e.cloudfunctions.net/storePostData', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify( post )
                    } )
                        .then( function ( res ) {
                            console.log( 'Sent data', res );

                            if ( res.ok ) {
                                deleteItemFromData( 'sync-posts', dt.id );
                            }

                        } )
                }



            } )
        );
    }
} );