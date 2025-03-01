const admin = require('firebase-admin');
const serviceAccount = process.env.FIREBASE_ADMIN_SDK;

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	storageBucket: 'gs://file-uploader42069.appspot.com', // Replace with your Firebase Storage bucket name
});

const bucket = admin.storage().bucket();

module.exports = bucket;
