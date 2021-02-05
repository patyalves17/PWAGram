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
    // event.preventDefault();
    // deferredPrompt = event;
    // return false;
} );

window.addEventListener( 'appinstalled', function ( event ) {
    console.log( 'app installed' );
} );


function displayConfirmNotification () {
    // new Notification( 'title', {
    //     body: 'body text',
    //     icon: '/src/images/icons/app-icon-96x96.png',
    //     image: '/src/images/main-image-sm.png',
    // } );
    let n = new Notification( 'title', {
        body: 'body text',
        icon: '/src/images/icons/app-icon-96x96.png',
        image: '/src/images/main-image-sm.png',
    } );
}

function askForNotificationPermission () {
    Notification.requestPermission( ( result ) => {
        console.log( 'User Choice', result );
        if ( result !== 'granted' ) {
            console.log( 'No notification permission granted!' );
        } else {
            let n = new Notification( 'title', {
                body: 'body text',
                icon: '/src/images/icons/app-icon-96x96.png',
                image: '/src/images/main-image-sm.png',
            } );
            // displayConfirmNotification();
        }
    } );
}


if ( 'Notification' in window ) {
    for ( var i = 0; i < enableNotificationsButtons.length; i++ ) {
        enableNotificationsButtons[ i ].style.display = 'inline-block';
        enableNotificationsButtons[ i ].addEventListener( 'click', askForNotificationPermission );
    }
}