var deferredPrompt;
var enableNotificationsButtons = document.querySelectorAll( '.enable-notifications' );

if ( 'serviceWorker' in navigator ) {
    navigator.serviceWorker
        .register( '/sw.js' )
        .then( function () {
            console.log( 'Service worker registered!' );
        } )
        .catch( function ( err ) {
            console.log( err );
        } );
}


window.addEventListener( 'beforeinstallprompt', ( event ) => {
    console.log( 'beforeinstallprompt fired' );
    event.userChoice.then( choice => {
        let message = choice.outcome === 'dimissed' ? 'User Cancelled' : 'User installed'
        console.log( message );
    } );
} );


window.addEventListener( 'appinstalled', function () {
    console.log( 'Thank you for installing our app!' );
} );


function displayConfirmNotification () {

    if ( 'serviceWorker' in navigator ) {

        navigator.serviceWorker.ready.then( function ( registration ) {
            registration.showNotification( "Successfuly subscribe'", {
                body: 'body text',
                icon: '/src/images/icons/app-icon-96x96.png',
                image: '/src/images/main-image-sm.jpg',
                badge: '/src/images/main-image-sm.jpg',
            } );
        } );

    }
}

function askForNotificationPermission () {
    Notification.requestPermission( ( result ) => {
        console.log( 'User Choice', result );
        if ( result !== 'granted' ) {
            console.log( 'No notification permission granted!' );
        } else {
            displayConfirmNotification();
        }
    } );
}


if ( 'Notification' in window ) {
    for ( var i = 0; i < enableNotificationsButtons.length; i++ ) {
        enableNotificationsButtons[ i ].style.display = 'inline-block';
        enableNotificationsButtons[ i ].addEventListener( 'click', askForNotificationPermission );
    }
}