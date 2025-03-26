# **Social Network Backend**

Welcome to the official repository of the **Social Network Backend**, a backend API built using **Express.js** and **Prisma** with **PostgreSQL** for a full-featured social networking application. This backend supports user authentication, CRUD operations for posts, comments, likes, and real-time features. It also integrates JWT-based authentication and utilizes a PostgreSQL database.

You can test the live demo of the frontend here [Live Frontend Demo](https://socialnetworkfrontend-production.up.railway.app/).

---

## **Features**

- **User Management**:

  - Create new users with validation (username, email, password).
  - Read user information by ID.
  - Update user profile information.
  - Delete users after verifying their password.
  - Search for users by their username.

- **Post Management**:

  - Create, read, update, and delete posts.
  - Each post is tied to a user and can have multiple comments and likes.

- **Comment Management**:

  - Add, update, and delete comments.
  - Each comment is associated with a post and a user.

- **Like System**:

  - Add and remove likes for posts and comments.
  - Likes are associated with users and content.

- **JWT Authentication**:

  - Secure the API routes with JWT-based authentication.
  - Ensure that only authenticated users can access certain routes (e.g., updating profiles, liking posts).

- **Supabase Integration**:
  - Managed PostgreSQL database hosted on Supabase.
  - Built-in authentication support (JWT tokens generated by the backend).

---

## **Tech Stack**

- **Node.js** (for backend development)
- **Express.js** (for building the RESTful API)
- **Prisma** (for ORM and database management)
- **PostgreSQL** (database, managed by Supabase)
- **JWT (JSON Web Tokens)** (for authentication and authorization)
- **Bcrypt.js** (for password hashing)
- **Jest** (for unit testing)

---

## **Getting Started**

To run this backend locally, follow these steps:

### **1. Clone the Repository**

```bash
git clone https://github.com/yourusername/socialnetworkbackend.git
cd socialnetworkbackend
```

### **2. Install Dependencies**

Make sure you have Node.js installed. Then, run the following command to install the required dependencies:

```bash
npm install
```

### **3. Set Up Environment Variables**

Create a .env file in the root directory and populate it with the following variables:

```bash

DATABASE_URL="your-supabase-postgresql-database-url"
DATABASE_PASSWORD="your-database-password"
JWT_SECRET_KEY="your-secret-key-for-jwt"
TOKEN_EXPIRY_TIME="1h"
```

Note: You can get your Supabase Postgres URL and credentials from the Supabase dashboard.

### **4. Run Migrations**

Run Prisma's migration commands to set up your database schema:

```bash
npx prisma migrate deploy
```

This will apply the necessary migrations to your database based on the schema defined in prisma/schema.prisma.

### **5. Start the Development Server**

Once everything is set up, you can run the backend server locally:

```bash
npm run dev
```

The server will be running at http://localhost:3000.

---

### API Endpoints

#### User Routes

- **POST** /api/users/new: Create a new user
- **GET** /api/users/read/:id: Get user details by ID
- **GET** /api/users/search Get user profiles by username
- **PUT** /api/users/update/:id: Update user information (requires JWT)
- **DELETE** /api/users/delete/:id: Delete user (requires JWT)

#### Post Routes

- **POST** /api/posts/new: Create a new post (requires JWT)
- **GET** /api/posts/read/:id: Get a post by ID
- **PUT** /api/posts/update/:id: Update a post (requires JWT)
- **DELETE** /api/posts/delete/:id: Delete a post (requires JWT)

#### Comment Routes

- **POST** /api/comments/new: Add a comment to a post (requires JWT)
- **GET** /api/comments/read: Get comments for a post
- **PUT** /api/comments/update/:id: Update a comment (requires JWT)
- **DELETE** /api/comments/delete/:id: Delete a comment (requires JWT)

#### Like Routes

- **POST** /api/likes/new: Add a like to a post or comment (requires JWT)
- **DELETE** /api/likes/remove: Remove a like (requires JWT)
- **GET** /api/likes/post: Get likes for a post
- **GET** /api/likes/comment: Get likes for a comment
- **GET** /api/likes/user: Get all likes for a user

#### Authentication Routes

- **POST** /api/users/login: Log in with either a username or email and password to receive a JWT token.

---

### Authentication

#### Login

To authenticate and receive a JWT token, make a **POST** request to `/api/users/login` with the following body:

```json
{
	"identification": "user@example.com", // or username
	"password": "yourPassword"
}
```

The server will respond with a JWT token, which should be included in the Authorization header as a Bearer token for all subsequent requests to protected routes.

---

### Testing

#### Unit Tests

To run the unit tests for your backend, use Jest:

```bash
npm run test
```

This will execute the test suite and display the results.

#### Manual Integration Tests

For integration tests, you can use **Postman** or similar tools to test the actual API routes.

---

### Contributing

We welcome contributions! If you’d like to improve the project or add new features, feel free to fork the repository and submit a pull request.

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes.
4. Commit your changes (`git commit -am 'Add new feature'`).
5. Push to the branch (`git push origin feature/your-feature`).
6. Create a new pull request.

---

### License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

### Acknowledgements

- **Express.js**: Fast, unopinionated web framework for Node.js.
- **Prisma**: Next-generation ORM for Node.js and TypeScript.
- **JWT**: JSON Web Tokens for stateless authentication.
- **Postman**: Your single platform for collaborative API development.
