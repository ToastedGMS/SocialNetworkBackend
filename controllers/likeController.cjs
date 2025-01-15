const {
	dbCreateLike,
	dbRemoveLike,
	dbReadLikesForPost,
	dbReadLikesForComment,
	dbReadLikesForUser,
} = require('../prisma/scripts/likes.cjs');

async function createLike(req, res) {
	try {
		const { authorID, postID, commentID } = req.body;
		const like = await dbCreateLike({ authorID, postID, commentID });
		return res.status(201).json(like);
	} catch (error) {
		console.error('Error creating like:', error);
		if (
			error.message.includes('Missing parameters') ||
			error.message.includes('You have already liked')
		) {
			return res.status(400).json({ message: error.message });
		}
		return res.status(500).json({ message: 'Internal server error' });
	}
}

async function removeLike(req, res) {
	try {
		const { authorID, postID, commentID } = req.body;
		const message = await dbRemoveLike({ authorID, postID, commentID });
		return res.status(200).json(message);
	} catch (error) {
		console.error('Error removing like:', error);
		if (
			error.message.includes('Missing parameters') ||
			error.message.includes('Like not found')
		) {
			return res.status(400).json({ message: error.message });
		}
		return res.status(500).json({ message: 'Internal server error' });
	}
}

async function readLikesForPost(req, res) {
	try {
		const { postID } = req.params;
		const likes = await dbReadLikesForPost(postID);
		return res.status(200).json(likes);
	} catch (error) {
		console.error('Error reading likes for post:', error);
		if (error.message.includes('Missing parameter')) {
			return res
				.status(400)
				.json({
					message: 'Missing parameter: Post ID is required for reading likes.',
				});
		}
		return res.status(500).json({ message: 'Internal server error' });
	}
}

async function readLikesForComment(req, res) {
	try {
		const { commentID } = req.params;
		const likes = await dbReadLikesForComment(commentID);
		return res.status(200).json(likes);
	} catch (error) {
		console.error('Error reading likes for comment:', error);
		if (error.message.includes('Missing parameter')) {
			return res
				.status(400)
				.json({
					message:
						'Missing parameter: Comment ID is required for reading likes.',
				});
		}
		return res.status(500).json({ message: 'Internal server error' });
	}
}

async function readLikesForUser(req, res) {
	try {
		const { authorID } = req.params;
		const likes = await dbReadLikesForUser(authorID);
		return res.status(200).json(likes);
	} catch (error) {
		console.error('Error reading likes for user:', error);
		if (error.message.includes('Missing parameter')) {
			return res
				.status(400)
				.json({
					message:
						'Missing parameter: Author ID is required for reading likes.',
				});
		}
		return res.status(500).json({ message: 'Internal server error' });
	}
}

module.exports = {
	createLike,
	removeLike,
	readLikesForPost,
	readLikesForComment,
	readLikesForUser,
};
