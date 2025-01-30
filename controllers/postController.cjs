const { dbGetFriendships } = require('../prisma/scripts/friendship.cjs');
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
		const { id } = req.params;
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
		const { id } = req.params;
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

async function generateFeed(req, res) {
	const { id } = req.params;
	try {
		let friends = await dbGetFriendships(parseInt(id, 10));

		if (!friends || friends.length === 0) {
			console.log('No friends found');
			return res.status(404).json({ error: 'No friends found' });
		}

		const IDs = friends
			.filter(
				(item) =>
					item.receiverId !== parseInt(id, 10) ||
					item.senderId !== parseInt(id, 10)
			)
			.map((item) =>
				item.receiverId !== parseInt(id, 10) ? item.receiverId : item.senderId
			);

		const feedPromises = IDs.map(async (friendId) => {
			try {
				const posts = await dbReadPost({ authorID: friendId });
				return posts;
			} catch (error) {
				console.error(`Error fetching posts for user ${friendId}:`, error);
				return []; // Return an empty array in case of error
			}
		});

		const feed = await Promise.all(feedPromises);

		return res.json(
			feed.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
		);
	} catch (error) {
		console.error('Error fetching friendships or posts:', error);
		return res
			.status(500)
			.json({ error: 'An error occurred while fetching data' });
	}
}

module.exports = { createPost, readPost, deletePost, updatePost, generateFeed };
