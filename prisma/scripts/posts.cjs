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

async function dbReadPost({ id, authorID }) {
	if (id) {
		//get post by post ID (also return author info)
		try {
			const post = await prisma.post.findUnique({
				where: {
					id: id,
				},
				include: {
					author: {
						select: {
							id: true,
							username: true,
							email: true,
							bio: true,
							profilePic: true,
							createdAt: true,
							updatedAt: true,
							// Exclude password here by not including it in the select object
						},
					},
				},
			});
			if (!post) {
				throw new Error(`Post with ID ${id} not found.`);
			}
			return post;
		} catch (error) {
			console.error('Unexpected database error:', error);
			throw new Error(
				`An unexpected error occurred. Details: ${error.message}`
			);
		}
	}

	if (authorID) {
		////get all posts by a specific author using their ID (also return author info)
		try {
			const posts = await prisma.post.findMany({
				where: {
					authorID: authorID,
				},
				include: {
					author: {
						select: {
							id: true,
							username: true,
							email: true,
							bio: true,
							profilePic: true,
							createdAt: true,
							updatedAt: true,
							// Exclude password here by not including it in the select object
						},
					},
				},
				orderBy: {
					createdAt: 'desc', // Order by creation date in descending order
				},
			});
			return posts;
		} catch (error) {
			console.error('Unexpected database error:', error);
			throw new Error(
				`An unexpected error occurred. Details: ${error.message}`
			);
		}
	}

	try {
		//get all posts
		const posts = await prisma.post.findMany({
			include: {
				author: {
					select: {
						id: true,
						username: true,
						email: true,
						bio: true,
						profilePic: true,
						createdAt: true,
						updatedAt: true,
						// Exclude password here by not including it in the select object
					},
				},
			},
			orderBy: {
				createdAt: 'desc', // Order by creation date in descending order
			},
		});
		return posts;
	} catch (error) {
		console.error('Unexpected database error:', error);
		throw new Error(`An unexpected error occurred. Details: ${error.message}`);
	}
}

async function dbDeletePost({ id }) {
	if (!id) {
		throw new Error('Missing parameter: Post ID is required for deletion.');
	}

	try {
		const post = await prisma.post.findUnique({
			where: { id },
		});

		if (!post) {
			throw new Error(`Post with ID ${id} not found.`);
		}

		await prisma.post.delete({
			where: { id },
		});

		return { message: `Post with ID ${id} deleted successfully.` };
	} catch (error) {
		console.error('Unexpected database error:', error);
		throw new Error(`An unexpected error occurred. Details: ${error.message}`);
	}
}

async function dbUpdatePost({ id, content }) {
	if (!id || !content) {
		throw new Error(
			'Missing parameters: Post ID and content are required for updating.'
		);
	}

	try {
		const post = await prisma.post.findUnique({
			where: { id },
		});

		if (!post) {
			throw new Error(`Post with ID ${id} not found.`);
		}

		const updatedPost = await prisma.post.update({
			where: { id },
			data: { content },
		});

		return updatedPost;
	} catch (error) {
		console.error('Unexpected database error:', error);
		throw new Error(`An unexpected error occurred. Details: ${error.message}`);
	}
}

module.exports = { dbCreatePost, dbReadPost, dbDeletePost, dbUpdatePost };
