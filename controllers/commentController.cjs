const {
	dbCreateComment,
	dbReadComment,
	dbDeleteComment,
	dbUpdateComment,
} = require('../prisma/scripts/comments.cjs');

async function createComment(req, res) {
	try {
		const { authorID, content, postID } = req.body;
		const newComment = await dbCreateComment({ authorID, content, postID });
		return res.status(201).json(newComment);
	} catch (error) {
		console.error('Error creating comment:', error.message);
		if (
			error.message.includes('Missing parameters') ||
			error.message.includes('exceeds the maximum length')
		) {
			return res.status(400).json({ error: error.message });
		}
		return res.status(500).json({ error: 'Internal server error' });
	}
}

async function readComment(req, res) {
	try {
		const { id, authorID, postID } = req.query;
		const comments = await dbReadComment({
			id: parseInt(id, 10),
			authorID: parseInt(authorID, 10),
			postID: parseInt(postID, 10),
		});
		if (!comments || comments.length === 0) {
			// Handle case where no comment is found
			throw new Error('Comment not found');
		}
		return res.status(200).json(comments);
	} catch (error) {
		console.error('Error reading comment:', error.message);
		if (error.message.includes('not found')) {
			return res.status(404).json({ error: error.message });
		}
		return res.status(500).json({ error: 'Internal server error' });
	}
}

async function deleteComment(req, res) {
	try {
		const { id } = req.params;
		const result = await dbDeleteComment({
			id: parseInt(id, 10),
		});
		return res.status(200).json(result);
	} catch (error) {
		console.error('Error deleting comment:', error.message);
		if (error.message.includes('not found')) {
			return res.status(404).json({ error: error.message });
		}
		return res.status(500).json({ error: 'Internal server error' });
	}
}

async function updateComment(req, res) {
	try {
		const { id } = req.params;

		const { content } = req.body;
		if (content.length > 1000) {
			throw new Error('Content exceeds the maximum length of 1000 characters.');
		}
		const updatedComment = await dbUpdateComment({
			id: parseInt(id, 10),
			content,
		});
		return res.status(200).json(updatedComment);
	} catch (error) {
		console.error('Error updating comment:', error.message);
		if (
			error.message.includes('Missing parameters') ||
			error.message.includes('Content exceeds the maximum length')
		) {
			return res.status(400).json({ error: error.message });
		}
		if (error.message.includes('not found')) {
			return res.status(404).json({ error: error.message });
		}
		return res.status(500).json({ error: 'Internal server error' });
	}
}

module.exports = {
	createComment,
	readComment,
	deleteComment,
	updateComment,
};
