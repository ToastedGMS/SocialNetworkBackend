const { dbCheckCredentials } = require('../prisma/scripts/users.cjs');
const jwt = require('jsonwebtoken');
const jwtSecretKey = process.env.JWT_SECRET_KEY;
const jwtExpiry = process.env.TOKEN_EXPIRY_TIME;

async function checkCredentials(identification, password, res) {
	if (!identification || !password) {
		return res
			.status(400)
			.json('Both identification (email/username) and password are required');
	}

	if (!jwtSecretKey) {
		console.error('JWT secret key is not defined in environment variables');
		return res.status(500).json('Internal server error');
	}

	const userInfo = { identification, password };

	try {
		const authorizedUser = await dbCheckCredentials({ userInfo });

		// Create JWT token
		const token = jwt.sign({ id: authorizedUser.id }, jwtSecretKey, {
			expiresIn: jwtExpiry || '1h', // Default expiration of 1 hour
		});

		// Return token and user data
		return res.status(200).json({
			token,
			authorizedUser,
		});
	} catch (error) {
		console.error('Error checking user credentials:', error.message);
		if (error.message.includes('Unable to find matching credentials')) {
			return res.status(400).json('Invalid username/email or password');
		}
		return res.status(500).json('Internal server error');
	}
}

function verifyToken(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (!token) {
		return res
			.status(401)
			.json({ error: 'Missing token. Authorization denied.' });
	}

	jwt.verify(token, jwtSecretKey, (error, decoded) => {
		if (error) {
			console.error('JWT verification error:', error.message);

			if (error.name === 'TokenExpiredError') {
				return res
					.status(401)
					.json({ error: 'Token has expired. Please login again.' });
			}

			return res.status(403).json({ error: 'Forbidden' });
		}

		req.user = { id: decoded.id };
		next();
	});
}

module.exports = { checkCredentials, verifyToken };
