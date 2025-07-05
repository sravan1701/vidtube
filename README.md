# VideoTube Backend

A Node.js + Express backend for a YouTube-like video platform, supporting user authentication, video uploads, playlists, likes, comments, subscriptions, tweets, and more.

## Features

- **User Authentication** (JWT, refresh tokens, secure cookies)
- **Video Upload & Management** (Cloudinary integration)
- **Playlists** (Create, update, delete, add/remove videos)
- **Likes** (Videos, comments, tweets)
- **Comments** (CRUD on videos)
- **Subscriptions** (Subscribe/unsubscribe to channels)
- **Tweets** (User micro-posts)
- **Dashboard** (Channel stats, video list)
- **Watch History**
- **Cloudinary** for media storage
- **Mongoose** ODM for MongoDB

## Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- Cloudinary (media storage)
- JWT (authentication)
- Multer (file uploads)
- dotenv (env config)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/sravan1701/vidtube.git
cd videotube-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d
CORS_ORIGIN=*
```

### 4. Start the server

```bash
npm run dev
```

Server runs on `http://localhost:8000` by default.

## API Endpoints

### Auth & User

- `POST /api/v1/users/register` — Register new user
- `POST /api/v1/users/login` — Login
- `POST /api/v1/users/logout` — Logout
- `POST /api/v1/users/refresh-token` — Refresh JWT
- `PATCH /api/v1/users/avatar` — Update avatar
- `PATCH /api/v1/users/cover-image` — Update cover image
- `PATCH /api/v1/users/update-account` — Update profile info
- `GET /api/v1/users/current-user` — Get current user
- `GET /api/v1/users/c/:username` — Get channel profile
- `GET /api/v1/users/history` — Get watch history

### Videos

- `GET /api/v1/videos/` — List videos (with pagination, search, filter)
- `POST /api/v1/videos/` — Upload video
- `GET /api/v1/videos/:videoId` — Get video by ID
- `PATCH /api/v1/videos/:videoId` — Update video
- `DELETE /api/v1/videos/:videoId` — Delete video
- `PATCH /api/v1/videos/toggle/publish/:videoId` — Toggle publish status

### Playlists

- `POST /api/v1/playlist/` — Create playlist
- `GET /api/v1/playlist/user/:userId` — Get user playlists
- `GET /api/v1/playlist/:playlistId` — Get playlist by ID
- `PATCH /api/v1/playlist/:playlistId` — Update playlist
- `DELETE /api/v1/playlist/:playlistId` — Delete playlist
- `PATCH /api/v1/playlist/add/:videoId/:playlistId` — Add video to playlist
- `PATCH /api/v1/playlist/remove/:videoId/:playlistId` — Remove video from playlist

### Comments

- `GET /api/v1/comments/:videoId` — Get comments for a video
- `POST /api/v1/comments/:videoId` — Add comment to video
- `PATCH /api/v1/comments/c/:commentId` — Update comment
- `DELETE /api/v1/comments/c/:commentId` — Delete comment

### Likes

- `POST /api/v1/likes/toggle/v/:videoId` — Like/unlike video
- `POST /api/v1/likes/toggle/c/:commentId` — Like/unlike comment
- `POST /api/v1/likes/toggle/t/:tweetId` — Like/unlike tweet
- `GET /api/v1/likes/videos` — Get liked videos

### Subscriptions

- `POST /api/v1/subscriptions/c/:channelId` — Subscribe/unsubscribe to channel
- `GET /api/v1/subscriptions/c/:channelId` — Get subscribers of a channel
- `GET /api/v1/subscriptions/u/:subscriberId` — Get channels a user has subscribed to

### Tweets

- `POST /api/v1/tweets/` — Create tweet
- `GET /api/v1/tweets/user/:userId` — Get user's tweets
- `PATCH /api/v1/tweets/:tweetId` — Update tweet
- `DELETE /api/v1/tweets/:tweetId` — Delete tweet

### Dashboard

- `GET /api/v1/dashboard/stats` — Get channel stats
- `GET /api/v1/dashboard/videos` — Get channel videos

### Healthcheck

- `GET /api/v1/healthcheck` — Healthcheck endpoint

## Folder Structure

```
src/
  app.js
  index.js
  constants.js
  controllers/
  db/
  middlewares/
  models/
  routes/
  utils/
```

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

[ISC](LICENSE)

---

**Made with ❤️ by Sravan Thanks To Hitesh Sir**
