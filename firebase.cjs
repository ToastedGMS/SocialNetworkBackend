const admin = require('firebase-admin');
require('dotenv').config(); // Load environment variables from .env file

const encodedJson = process.env.ENCODED_SERVICE_ACCOUNT; // Get the base64 encoded string from .env
const jsonString = Buffer.from(encodedJson, 'base64').toString('utf-8'); // Decode it

const serviceAccount = JSON.parse(jsonString); // Parse it into a JSON object

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	storageBucket: 'gs://file-uploader42069.appspot.com', // Replace with your Firebase Storage bucket name
});

const bucket = admin.storage().bucket();

module.exports = bucket;
