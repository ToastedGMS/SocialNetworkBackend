const {
	dbCreatePost,
	dbReadPost,
	dbDeletePost,
	dbUpdatePost,
} = require('../prisma/scripts/posts.cjs');

async function createPost(req, res) {
	try {
		const { authorID, content } = req.body;
		const newPost = await dbCreatePost({ authorID, content });
		return res.status(201).json(newPost);
	} catch (error) {
		console.error('Error creating post:', error);
		if (
			error.message.includes('Missing parameters') ||
			error.message.includes('Content exceeds')
		) {
			return res.status(400).json({ error: error.message });
		}
		return res.status(500).json({ error: 'Internal server error' });
	}
}

async function readPost(req, res) {
	try {
		const { id, authorID } = req.query;
		const post = await dbReadPost({
			id: parseInt(id, 10),
			authorID: parseInt(authorID, 10),
		});
		return res.status(200).json(post);
	} catch (error) {
		console.error('Error reading post:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
}

async function deletePost(req, res) {
	try {
		const { id } = req.query;
		const deletionMessage = await dbDeletePost({ id: parseInt(id, 10) });
		return res.status(200).json(deletionMessage);
	} catch (error) {
		console.error('Error deleting post:', error);
		if (
			error.message.includes('Missing parameter') ||
			error.message.includes('not found')
		) {
			return res.status(400).json({ error: error.message });
		}
		return res.status(500).json({ error: 'Internal server error' });
	}
}

async function updatePost(req, res) {
	try {
		const { id } = req.query;
		const { content } = req.body;
		const updatedPost = await dbUpdatePost({ id: parseInt(id, 10), content });
		return res.status(200).json(updatedPost);
	} catch (error) {
		console.error('Error updating post:', error);
		if (
			error.message.includes('Missing parameters') ||
			error.message.includes('not found')
		) {
			return res.status(400).json({ error: error.message });
		}
		return res.status(500).json({ error: 'Internal server error' });
	}
}

module.exports = { createPost, readPost, deletePost, updatePost };
