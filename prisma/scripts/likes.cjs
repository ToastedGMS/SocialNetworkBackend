const prisma = require('../prismaClient/prismaClient.cjs');

async function dbCreateLike({ authorID, postID, commentID }) {
	if (!authorID || (!postID && !commentID)) {
		throw new Error('Missing parameters for like creation.');
	}

	const existingLike = await prisma.like.findFirst({
		where: {
			authorID,
			OR: [{ postID }, { commentID }],
		},
	});

	if (existingLike) {
		throw new Error('You have already liked this post or comment.');
	}

	try {
		const like = await prisma.like.create({
			data: {
				authorID,
				postID,
				commentID,
			},
		});
		return like;
	} catch (error) {
		console.error('Unexpected database error:', error);
		throw new Error(`An unexpected error occurred. Details: ${error.message}`);
	}
}

async function dbRemoveLike({ authorID, postID, commentID }) {
	if (!authorID || (!postID && !commentID)) {
		throw new Error('Missing parameters for like removal.');
	}

	try {
		const like = await prisma.like.findFirst({
			where: {
				authorID,
				OR: [{ postID }, { commentID }],
			},
		});

		if (!like) {
			throw new Error('Like not found.');
		}

		await prisma.like.delete({
			where: { id: like.id },
		});

		return { message: 'Like removed successfully.' };
	} catch (error) {
		console.error('Unexpected database error:', error);
		throw new Error(`An unexpected error occurred. Details: ${error.message}`);
	}
}

async function dbReadLikesForPost(postID) {
	if (!postID) {
		throw new Error(
			'Missing parameter: Post ID is required for reading likes.'
		);
	}

	try {
		const likes = await prisma.like.findMany({
			where: { postID },
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

		return likes;
	} catch (error) {
		console.error('Unexpected database error:', error);
		throw new Error(`An unexpected error occurred. Details: ${error.message}`);
	}
}

async function dbReadLikesForComment(commentID) {
	if (!commentID) {
		throw new Error(
			'Missing parameter: Comment ID is required for reading likes.'
		);
	}

	try {
		const likes = await prisma.like.findMany({
			where: { commentID },
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

		return likes;
	} catch (error) {
		console.error('Unexpected database error:', error);
		throw new Error(`An unexpected error occurred. Details: ${error.message}`);
	}
}

async function dbReadLikesForUser(authorID) {
	if (!authorID) {
		throw new Error(
			'Missing parameter: Author ID is required for reading likes.'
		);
	}

	try {
		const likes = await prisma.like.findMany({
			where: { authorID },
			include: { post: true, comment: true },
		});

		return likes;
	} catch (error) {
		console.error('Unexpected database error:', error);
		throw new Error(`An unexpected error occurred. Details: ${error.message}`);
	}
}

module.exports = {
	dbCreateLike,
	dbRemoveLike,
	dbReadLikesForPost,
	dbReadLikesForComment,
	dbReadLikesForUser,
};
