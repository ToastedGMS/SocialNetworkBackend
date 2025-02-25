const express = require('express');
const router = express.Router();
const multer = require('multer');
const bucket = require('../firebase.cjs');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadFileToFirebase = async (req, res) => {
	try {
		const file = req.file;

		if (!file) {
			return res.status(400).send('No file uploaded.');
		}

		// Create a file path
		const filePath = `uploads/${Date.now()}-${file.originalname}`;

		// Upload the file to Firebase Storage
		const blob = bucket.file(filePath);
		const blobStream = blob.createWriteStream({
			resumable: false,
			contentType: file.mimetype, // Set content type based on file MIME
		});

		blobStream.on('finish', async () => {
			try {
				await blob.makePublic(); // Make the file public
				const fileUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
				res
					.status(200)
					.send({ message: 'File uploaded successfully!', fileUrl });
			} catch (err) {
				res.status(500).send('Error making file public: ' + err.message);
			}
		});

		blobStream.on('error', (err) => {
			res.status(500).send('Error uploading file: ' + err);
		});

		blobStream.end(file.buffer); // End the stream and send the file buffer to Firebase Storage
	} catch (error) {
		res.status(500).send('Error: ' + error.message);
	}
};

const deleteFileFromFirebase = async (req, res) => {
	try {
		const { filePath } = req.body;
		if (!filePath) return res.status(400).send('File path is required.');

		const file = bucket.file(filePath);
		await file.delete();

		res.status(200).send({ message: 'File deleted successfully!' });
	} catch (error) {
		res.status(500).send('Error deleting file: ' + error.message);
	}
};

router.post('/', upload.single('file'), uploadFileToFirebase);
router.delete('/', deleteFileFromFirebase);

module.exports = router;
