var shareImageButton = document.querySelector( '#share-image-button' );
var createPostArea = document.querySelector( '#create-post' );
var closeCreatePostModalButton = document.querySelector( '#close-create-post-modal-btn' );
var sharedMomentsArea = document.querySelector( '#shared-moments' );
var form = document.querySelector( 'form' );
var titleInput = document.querySelector( '#title' );
var locationInput = document.querySelector( '#location' );

let posts = [];

function openCreatePostModal () {
  createPostArea.style.display = 'block';
}

function closeCreatePostModal () {
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener( 'click', openCreatePostModal );

closeCreatePostModalButton.addEventListener( 'click', closeCreatePostModal );


function clearCards () {
  while ( sharedMomentsArea.hasChildNodes() ) {
    sharedMomentsArea.removeChild( sharedMomentsArea.lastChild );
  }
}


function createCard ( data ) {
  var cardWrapper = document.createElement( 'div' );
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement( 'div' );
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url(' + data.image + ')';
  cardTitle.style.backgroundSize = 'cover';
  cardWrapper.appendChild( cardTitle );
  var cardTitleTextElement = document.createElement( 'h2' );
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild( cardTitleTextElement );
  var cardSupportingText = document.createElement( 'div' );
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  // var cardSaveButton = document.createElement('button');
  // cardSaveButton.textContent = 'Save';
  // cardSaveButton.addEventListener('click', onSaveButtonClicked);
  // cardSupportingText.appendChild(cardSaveButton);
  cardWrapper.appendChild( cardSupportingText );
  componentHandler.upgradeElement( cardWrapper );
  sharedMomentsArea.appendChild( cardWrapper );
}


function updateUI () {
  clearCards();
  for ( var i = 0; i < posts.length; i++ ) {
    createCard( posts[ i ] );
  }
}

function sendData () {
  let data = {
    id: new Date().toISOString(),
    title: titleInput.value,
    location: locationInput.value,
    image: 'https://firebasestorage.googleapis.com/v0/b/pwagran-5b05e.appspot.com/o/Seto-Great-Bridge-Inland-Sea.jpg?alt=media&token=76dc7407-db49-4412-a70a-dc1f593d3f8e'
  };
  fetch( 'https://us-central1-pwagran-5b05e.cloudfunctions.net/storePostData', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify( data )
  } )
    .then( function ( res ) {
      console.log( 'Sent data', res );
      posts.push( data );
      updateUI();
    } )
}


form.addEventListener( 'submit', ( event ) => {
  event.preventDefault();

  if ( titleInput.value.trim() === '' || locationInput.value.trim() === '' ) {
    alert( 'Please enter valid data!' );
    return;
  }


  closeCreatePostModal();

  if ( 'serviceWorker' in navigator && 'SyncManager' in window ) {
    navigator.serviceWorker.ready.then( sw => {
      let post = {
        id: new Date().toISOString(),
        title: titleInput.value,
        location: locationInput.value,
        image: 'https://firebasestorage.googleapis.com/v0/b/pwagran-5b05e.appspot.com/o/Seto-Great-Bridge-Inland-Sea.jpg?alt=media&token=76dc7407-db49-4412-a70a-dc1f593d3f8e'
      };
      writeData( 'sync-posts', post ).then( () => {
        return sw.sync.register( 'sync-new-post' );
      } )
        .then( () => {
          var snackbarContainer = document.querySelector( '#confirmation-toast' );
          var data = { message: 'Your Post was saved for syncing!' }
          snackbarContainer.MaterialSnackbar.showSnackbar( data );
        } )
        .catch( error => console.log( error ) );


    } );
  } else {
    sendData();
  }


} );