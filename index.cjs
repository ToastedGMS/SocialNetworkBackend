const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

// Middleware
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

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
