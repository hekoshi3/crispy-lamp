# Crispy Backend Server

A Node.js/Express backend server for the Crispy Lamp forum application.

## Features

- **Boards Management**: Create, read, update, and delete forum boards
- **Threads Management**: Create, read, update, and delete threads within boards
- **Posts Management**: Create, read, update, and delete posts within threads
- **File Uploads**: Upload images with automatic file validation and storage
- **JSON Database**: Simple file-based data storage using JSON
- **RESTful API**: Clean REST API design with proper error handling

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the server**:
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

3. **Server will run on**: `http://127.0.0.1:3001`

## API Endpoints

### Health Check
- `GET /api/health` - Check if server is running

### Boards
- `GET /api/boards` - Get all boards
- `GET /api/boards/:id` - Get board by ID
- `POST /api/boards` - Create new board
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board

### Threads
- `GET /api/threads` - Get all threads
- `GET /api/threads?boardId=:boardId` - Get threads by board ID
- `GET /api/threads/:id` - Get thread by ID
- `POST /api/threads` - Create new thread
- `PUT /api/threads/:id` - Update thread
- `DELETE /api/threads/:id` - Delete thread

### Posts
- `GET /api/posts` - Get all posts
- `GET /api/posts?threadId=:threadId` - Get posts by thread ID
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### File Uploads
- `POST /api/upload/image` - Upload single image
- `POST /api/upload/images` - Upload multiple images (max 5)
- `DELETE /api/upload/image/:filename` - Delete uploaded image

## Request/Response Examples

### Create a Board
```bash
POST /api/boards
Content-Type: application/json

{
  "name": "General Discussion"
}
```

Response:
```json
{
  "board": {
    "id": "uuid-generated",
    "name": "General Discussion"
  }
}
```

### Create a Thread
```bash
POST /api/threads
Content-Type: application/json

{
  "boardId": "board-uuid",
  "content": "Welcome to our new forum!",
  "imageUrl": "/uploads/image.jpg",
  "imageAlt": "Welcome image",
  "opIp": "192.168.1.1"
}
```

### Upload an Image
```bash
POST /api/upload/image
Content-Type: multipart/form-data

Form data:
- image: [file]
```

Response:
```json
{
  "success": true,
  "imageUrl": "/uploads/uuid-generated.jpg",
  "filename": "uuid-generated.jpg",
  "originalName": "my-image.jpg",
  "size": 123456
}
```

## Data Structure

### Board
```json
{
  "id": "string",
  "name": "string"
}
```

### Thread
```json
{
  "threadId": "string",
  "boardId": "string",
  "content": "string",
  "imageUrl": "string|null",
  "imageAlt": "string|null",
  "opIp": "string",
  "createdAt": "ISO date string"
}
```

### Post
```json
{
  "id": "string",
  "threadId": "string",
  "content": "string",
  "imageUrl": "string|null",
  "createdAt": "ISO date string"
}
```

## File Upload Limits

- **File size**: Maximum 5MB per file
- **File types**: jpeg, jpg, png, gif, webp
- **Multiple files**: Maximum 5 files per request
- **Storage**: Files are stored in the `uploads/` directory

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

Error responses include an `error` field with a descriptive message:

```json
{
  "error": "Board name is required"
}
```

## Development

### Project Structure
```
crispy-back/
├── data/
│   └── db.json          # JSON database file
├── routes/
│   ├── boards.js        # Board routes
│   ├── threads.js       # Thread routes
│   ├── posts.js         # Post routes
│   └── upload.js        # File upload routes
├── utils/
│   └── database.js      # Database utility functions
├── uploads/             # Uploaded files directory
├── server.js            # Main server file
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

### Adding New Features

1. Create new route files in the `routes/` directory
2. Add database methods in `utils/database.js` if needed
3. Import and use new routes in `server.js`
4. Update this README with new endpoint documentation

## Connecting to Frontend

To connect your Next.js frontend to this backend:

1. Update your frontend API calls to use `http://127.0.0.1:3001/api/`
2. Ensure CORS is properly configured (already set up in this backend)
3. Handle file uploads using the `/api/upload` endpoints
4. Update image URLs to use the backend's `/uploads/` path

## Production Considerations

For production deployment:

1. Use environment variables for configuration
2. Implement proper authentication and authorization
3. Use a real database (PostgreSQL, MongoDB, etc.)
4. Set up proper file storage (AWS S3, etc.)
5. Implement rate limiting and security measures
6. Add logging and monitoring
7. Use HTTPS in production 