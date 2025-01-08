const prisma = require('../prismaClient/prismaClient.cjs');

async function dbCreatePost({ authorID, content }) {
	if (!authorID || !content) {
		throw new Error('Missing parameters for post creation.');
	}
	let id = authorID;

	if (typeof authorID != 'number') {
		id = parseInt(authorID, 10);
	}
	if (content.length > 1000) {
		throw new Error('Content exceeds the maximum length of 1000 characters.');
	}

	try {
		const post = await prisma.post.create({
			data: {
				authorID: id,
				content,
			},
		});

		return post;
	} catch (error) {
		console.error('Unexpected database error:', error);
		throw new Error(`An unexpected error occurred. Details: ${error.message}`);
	}
}

module.exports = { dbCreatePost };
