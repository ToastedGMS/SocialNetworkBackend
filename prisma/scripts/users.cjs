const prisma = require('../prismaClient/prismaClient.cjs');
const bcrypt = require('bcryptjs');

async function dbCreateUser({ userInfo }) {
	const {
		username,
		email,
		password,
		bio = '',
		profilePic = '/default-profile-image.png',
	} = userInfo;

	if (!username || !email || !password) {
		throw new Error(
			'All required fields (username, email, password) must be provided.'
		);
	}

	if (/[^a-zA-Z0-9]/.test(username)) {
		throw new Error('Username may not contain any special characters');
	}

	if (password.length < 8) {
		throw new Error('Password must be at least 8 characters long.');
	}

	const existingUser = await prisma.user.findFirst({
		where: {
			OR: [
				{
					username: userInfo.username,
				},
				{
					email: userInfo.email,
				},
			],
		},
	});

	if (existingUser) {
		if (existingUser.email === email) {
			throw new Error(
				'That email is already in use. Please choose a different email.'
			);
		}
		if (existingUser.username === username) {
			throw new Error(
				'That username is already taken. Please choose a different username.'
			);
		}
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	try {
		const newUser = await prisma.user.create({
			data: {
				username,
				email,
				password: hashedPassword,
				bio,
				profilePic,
			},
		});

		return {
			id: newUser.id,
			username: newUser.username,
			email: newUser.email,
			profilePic: newUser.profilePic,
		};
	} catch (error) {
		console.error('Unexpected database error:', error);
		throw new Error(`An unexpected error occurred. Details: ${error.message}`);
	}
}

async function dbReadUser({ userInfo }) {
	if (
		//if object is empty or all keys are null or empty strings
		!userInfo ||
		(!userInfo.id && !userInfo.username && !userInfo.email) ||
		(userInfo.id === '' && userInfo.username === '' && userInfo.email === '')
	) {
		throw new Error('Search query may not be null or empty.');
	}
	try {
		const foundUser = await prisma.user.findFirst({
			where: {
				OR: [
					{ id: userInfo.id },
					{
						username: userInfo.username,
					},
					{
						email: userInfo.email,
					},
				],
			},
			select: {
				id: true,
				username: true,
				email: true,
				bio: true,
				profilePic: true,
				createdAt: true,
				updatedAt: true,
				// Don't include password in the result
			},
		});

		if (!foundUser) {
			throw new Error('Provided user was not found. Please try again.');
		}

		return foundUser;
	} catch (error) {
		console.error('Unexpected database error:', error);
		throw new Error(`An unexpected error occurred. Details: ${error.message}`);
	}
}

async function dbUpdateUser({ userInfo }) {
	const currentUser = await prisma.user.findFirst({
		where: {
			id: userInfo.id,
		},
	});
	const {
		id,
		username = currentUser.username,
		email = currentUser.email,
		bio = null,
		profilePic = currentUser.profilePic,
	} = userInfo;

	if (
		currentUser.username === username &&
		currentUser.email === email &&
		currentUser.bio === bio &&
		currentUser.profilePic === profilePic
	) {
		return 'No values to update.';
	}

	if (/[^a-zA-Z0-9]/.test(username)) {
		throw new Error('Username may not contain any special characters');
	}

	try {
		const updatedUser = await prisma.user.update({
			where: { id: id },
			data: {
				username,
				email,
				bio,
				profilePic,
			},
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
		});

		return updatedUser;
	} catch (error) {
		console.error('Unexpected database error:', error);
		throw new Error(`An unexpected error occurred. Details: ${error.message}`);
	}
}

async function dbDeleteUser({ userInfo }) {
	const { id, password } = userInfo;
	const currentUser = await prisma.user.findFirst({
		where: {
			id: id,
		},
	});

	if ((await bcrypt.compare(password, currentUser.password)) === false) {
		throw new Error('Forbidden action: Password does not match.');
	}
	try {
		await prisma.user.delete({
			where: {
				id: id,
			},
		});

		return 'User deleted successfully.';
	} catch (error) {
		console.error('Unexpected database error:', error);
		throw new Error(`An unexpected error occurred. Details: ${error.message}`);
	}
}

async function dbCheckCredentials({ userInfo }) {
	const { identification, password } = userInfo;

	if (!identification || !password) {
		throw new Error('One or more missing parameters for checking credentials');
	}

	const stringType = identification.includes('@') ? 'email' : 'username';

	try {
		const user = await prisma.user.findFirst({
			where: {
				[stringType]: identification,
			},
		});

		if (!user) {
			throw new Error(
				'Unable to find matching credentials, check username and password and try again.'
			);
		}

		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) {
			throw new Error(
				'Unable to find matching credentials, check username and password and try again.'
			);
		}

		return {
			id: user.id,
			email: user.email,
			username: user.username,
			bio: user.bio,
			profilePic: user.profilePic,
		};
	} catch (error) {
		console.error('Unexpected database error:', error);
		throw new Error(`An unexpected error occurred. Details: ${error.message}`);
	}
}

async function dbSearchUser(searchQuery) {
	if (!searchQuery || searchQuery === undefined || searchQuery === '') {
		throw new Error('No search query or empty query provided');
	}
	try {
		const result = await prisma.user.findMany({
			where: {
				username: {
					contains: searchQuery,
					mode: 'insensitive',
				},
			},
			select: {
				id: true,
				username: true,
				email: true,
				profilePic: true,
				bio: true,
			},
		});

		return result;
	} catch (error) {
		console.error('Unexpected database error:', error);
		throw new Error(`An unexpected error occurred. Details: ${error.message}`);
	}
}

module.exports = {
	dbCreateUser,
	dbReadUser,
	dbUpdateUser,
	dbDeleteUser,
	dbCheckCredentials,
	dbSearchUser,
};
