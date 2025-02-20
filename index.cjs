const express = require('express');
const http = require('http');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const { Server } = require('socket.io');

// Middleware
const server = http.createServer(app);
app.use(express.json());
app.use(cors());
const io = new Server(server, {
	cors: {
		origin: '*',
	},
});
module.exports = { io };

// Router files
const userRoutes = require('./routes/userRoutes.cjs');
const postRoutes = require('./routes/postRoutes.cjs');
const commentRoutes = require('./routes/commentRoutes.cjs');
const likeRoutes = require('./routes/likeRoutes.cjs');
const friendshipRoutes = require('./routes/friendshipRoutes.cjs');
const notificationRoutes = require('./routes/notificationRoutes.cjs');
const { dbCreateNotification } = require('./prisma/scripts/notifications.cjs');
const prisma = require('./prisma/prismaClient/prismaClient.cjs');

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/friendships', friendshipRoutes);
app.use('/api/notifications', notificationRoutes);

// Port
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});

const connectedUsers = new Map();

io.on('connect', (socket) => {
	console.log('a user connected');
	socket.emit('welcome', 'Welcome to the server!');

	socket.on('register_user', async (id) => {
		try {
			connectedUsers.set(id, socket.id);

			const unreadNotifications = await prisma.notification.findMany({
				where: { receiverID: id, read: false },
			});
			console.log('unread', unreadNotifications);

			if (unreadNotifications.length > 0) {
				socket.emit('unread_notifications', unreadNotifications);
			}
		} catch (error) {
			console.error('Error fetching unread notifications:', error);
		}
	});

	socket.on('new_like', async ({ sender, receiver, post, senderName }) => {
		try {
			const senderID = parseInt(sender, 10);
			const receiverID = parseInt(receiver, 10);
			const postID = parseInt(post, 10);

			if (!senderID || !receiverID || !postID) {
				console.error('Invalid parameters for new_like event.');
				return;
			}

			if (senderID === receiverID) {
				console.log(
					`User ${senderID} liked their own post. No notification created.`
				);
				return;
			}

			const notif = await dbCreateNotification({
				senderID,
				receiverID,
				contentID: postID,
				type: 'liked your post!',
				senderName,
			});

			const receiverSocket = connectedUsers.get(receiverID);
			if (receiverSocket) {
				io.to(receiverSocket).emit('like_notification', {
					sender: senderID,
					post: postID,
				});
			} else {
				console.log(`User ${receiverID} is not online.`);
			}

			console.log(
				`User ${senderID} liked user ${receiverID}'s post (ID: ${postID})`
			);
		} catch (error) {
			console.error('Error handling new_like event:', error);
		}
	});
	socket.on('mark_notifications_read', async (userID) => {
		try {
			await prisma.notification.updateMany({
				where: { receiverID: userID, read: false },
				data: { read: true },
			});
			console.log(`Marked notifications as read for user ${userID}`);
		} catch (error) {
			console.error('Error marking notifications as read:', error);
		}
	});

	socket.on('new_comment', async ({ sender, receiver, post, senderName }) => {
		try {
			const senderID = parseInt(sender, 10);
			const receiverID = parseInt(receiver, 10);
			const postID = parseInt(post, 10);

			if (!senderID || !receiverID || !postID) {
				console.error('Invalid parameters for new_comment event.');
				return;
			}

			if (senderID === receiverID) {
				console.log(
					`User ${senderID} commented on their own post. No notification created.`
				);
				return;
			}

			const notif = await dbCreateNotification({
				senderID,
				receiverID,
				contentID: postID,
				type: 'commented on your post!',
				senderName,
			});

			const receiverSocket = connectedUsers.get(receiverID);
			if (receiverSocket) {
				io.to(receiverSocket).emit('comment_notification', {
					sender: senderID,
					post: postID,
				});
			} else {
				console.log(`User ${receiverID} is not online.`);
			}

			console.log(
				`User ${senderID} commented on user ${receiverID}'s post (ID: ${postID})`
			);
		} catch (error) {
			console.error('Error handling new_comment event:', error);
		}
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
