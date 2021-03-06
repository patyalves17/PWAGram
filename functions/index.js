var functions = require( 'firebase-functions' );
var admin = require( 'firebase-admin' );
var cors = require( 'cors' )( { origin: true } );
var webpush = require( 'web-push' );

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

var serviceAccount = require( "./pwagram-fb-key.json" );
var webPushKey = require( "./web-push-key.json" );


admin.initializeApp( {
    credential: admin.credential.cert( serviceAccount ),
    databaseURL: 'https://pwagran-5b05e-default-rtdb.firebaseio.com/'
} );

exports.storePostData = functions.https.onRequest( function ( request, response ) {
    cors( request, response, function () {
        admin.database().ref( 'posts' ).push( {
            id: request.body.id,
            title: request.body.title,
            location: request.body.location,
            image: request.body.image
        } )
            .then( function () {
                webpush.setVapidDetails( 'mailto:patriciaalves10@gmail.com',
                    webPushKey.public_key,
                    webPushKey.private_key );
                return admin.database().ref( 'subscriptions' ).once( 'value' );
            } )
            .then( function ( subscriptions ) {
                subscriptions.forEach( function ( sub ) {
                    var pushConfig = {
                        endpoint: sub.val().endpoint,
                        keys: {
                            auth: sub.val().keys.auth,
                            p256dh: sub.val().keys.p256dh
                        }
                    };

                    let pushMessage = {
                        title: 'New Post',
                        content: 'New Post added!',
                        openUrl: '/help'
                    }

                    webpush.sendNotification( pushConfig, JSON.stringify( pushMessage ) )
                        .catch( function ( err ) {
                            console.log( err );
                        } )
                } );
                response.status( 201 ).json( { message: 'Data stored', id: request.body.id } );
            } )
            .catch( function ( err ) {
                response.status( 500 ).json( { error: err } );
            } );
    } );
} );
