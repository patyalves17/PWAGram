
self.registration.showNotification( 'Notification from service Worker', {} );

self.addEventListener( 'install', function ( event ) {
    console.log( '[Service Worker] Installing Service Worker ...', event );
} );
