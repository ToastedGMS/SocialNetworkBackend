const express = require('express');
const http = require('http');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const { Server } = require('socket.io');

// Middleware
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: '*',
	},
});
app.use(express.json());
app.use(cors());

// Router files
const userRoutes = require('./routes/userRoutes.cjs');
const postRoutes = require('./routes/postRoutes.cjs');
const commentRoutes = require('./routes/commentRoutes.cjs');
const likeRoutes = require('./routes/likeRoutes.cjs');
const friendshipRoutes = require('./routes/friendshipRoutes.cjs');

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/friendships', friendshipRoutes);

// Port
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});

const connectedUsers = new Map();

io.on('connect', (socket) => {
	console.log('a user connected');
	socket.emit('welcome', 'Welcome to the server!');

	socket.on('register_user', (id) => {
		connectedUsers.set(id, socket.id);
		console.log(`User ${id} registered with socket ID ${socket.id}`);
	});

	socket.on('disconnect', () => {
		for (const [id, socketId] of connectedUsers.entries()) {
			if (socketId === socket.id) {
				connectedUsers.delete(id);
				console.log(`User ${id} disconnected`);
				break;
			}
		}
	});
});
