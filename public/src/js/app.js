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

        navigator.serviceWorker.ready.then( ( swReg ) => {
            swReg.showNotification( "Successfuly subscribe", {
                body: 'body text',
                icon: '/src/images/icons/app-icon-96x96.png',
                image: '/src/images/main-image-sm.jpg',
                badge: '/src/images/icons/app-icon-96x96.png',
                dir: 'ltr',
                lang: 'en-US',
                vibrate: [ 100, 50, 200 ],
                tag: 'confirm-notification',
                renotify: true,
                actions: [
                    { action: 'confirm', title: 'Okay', icon: '/src/images/icons/app-icon-96x96.png' },
                    { action: 'cancel', title: 'Cancel', icon: '/src/images/icons/app-icon-96x96.png' }
                ]
            } );
        } );

    }
}

function configurePushSub () {
    if ( !( 'serviceWorker' in navigator ) ) {
        return;
    }

    let reg;

    navigator.serviceWorker.ready.then( ( swReg ) => {
        reg = swReg;
        return swReg.pushManager.getSubscription();
    } ).then( ( subs ) => {
        if ( subs === null ) {
            //create a new subscription

            let vapidPublicKey = "BBT--cK2cCCrs7QfeCcp9JKNbpEaSgNOAQz1UfM7LADhVVq6gi6DqquWEfbw0vnnqK3tPA-tdoAzuD2k0sp6ukI"
            let convertedVapidPublicKey = urlBase64ToUint8Array( vapidPublicKey );
            return reg.pushManager.subscribe( {
                userVisibleOnly: true,
                applicationServerKey: convertedVapidPublicKey

            } );
        } else {
            // we have a subscription
        }
    } ).then( ( newSubs ) => {
        console.log( newSubs );
        return fetch( 'https://pwagran-5b05e-default-rtdb.firebaseio.com/subscriptions.json', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify( newSubs )
        } )
    } ).then( ( res ) => {
        if ( res.ok ) {
            displayConfirmNotification()
        }
    } ).catch( ( err ) => {
        console.log( err );
    } );
}

function askForNotificationPermission () {
    Notification.requestPermission( ( result ) => {
        console.log( 'User Choice', result );
        if ( result !== 'granted' ) {
            console.log( 'No notification permission granted!' );
        } else {
            configurePushSub();
            // displayConfirmNotification();
        }
    } );
}


if ( 'Notification' in window && 'serviceWorker' in navigator ) {
    for ( var i = 0; i < enableNotificationsButtons.length; i++ ) {
        enableNotificationsButtons[ i ].style.display = 'inline-block';
        enableNotificationsButtons[ i ].addEventListener( 'click', askForNotificationPermission );
    }
}