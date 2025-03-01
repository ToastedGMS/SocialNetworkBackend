const admin = require('firebase-admin');
const serviceAccount = '/firebaseAuth/serviceAccountKey.json';

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	storageBucket: 'gs://file-uploader42069.appspot.com', // Replace with your Firebase Storage bucket name
});

const bucket = admin.storage().bucket();

module.exports = bucket;
