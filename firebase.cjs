const admin = require('firebase-admin');
const serviceAccount = require('/home/gabrielmgs/Downloads/file-uploader42069-firebase-adminsdk-1th49-7328f85525.json');

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	storageBucket: 'gs://file-uploader42069.appspot.com', // Replace with your Firebase Storage bucket name
});

const bucket = admin.storage().bucket();

module.exports = bucket;
