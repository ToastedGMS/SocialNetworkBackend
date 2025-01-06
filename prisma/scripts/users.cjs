const prisma = require('../prismaClient/prismaClient.cjs');
const bcrypt = require('bcryptjs');

async function dbCreateUser({ userInfo }) {
	const {
		username,
		email,
		password,
		bio = '',
		profilePic = 'default-profile-image.png',
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

module.exports = { dbCreateUser, dbReadUser, dbUpdateUser, dbDeleteUser };
