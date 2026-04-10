# VibeChat

A real-time anonymous chat app that pairs users instantly for one-on-one conversations using WebSockets and dynamic matchmaking.

## Features

- **Instant Pairing**: Users are matched randomly for anonymous chats.
- **Real-time Messaging**: Powered by Socket.IO for seamless communication.
- **Responsive UI**: Built with Next.js and Tailwind CSS for a modern, mobile-friendly interface.
- **Scalable Backend**: Uses Node.js, Express, and Redis for efficient matchmaking and session management.
- **Docker Support**: Easy deployment with Docker Compose for production.

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, Socket.IO
- **Database**: Redis (for matchmaking and session storage)
- **Deployment**: Docker, Docker Compose

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker and Docker Compose (for containerized deployment)
- Redis (if running locally without Docker)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd VibeChat
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd client
   npm install
   cd ..
   ```

## Environment Variables

Create a `.env` file in the root directory for the backend:

```env
PORT=3000
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=*
```

For the frontend, create `.env.local` in the `client` directory:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## Running Locally

### Backend
1. Start Redis (if not using Docker):
   ```bash
   # Assuming Redis is installed
   redis-server
   ```

2. Start the backend server:
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:3000`.

### Frontend
1. In a new terminal, navigate to the client directory:
   ```bash
   cd client
   npm run dev
   ```
   The frontend will run on `http://localhost:3000` (or `http://localhost:3001` if port conflicts).

2. Open your browser and go to `http://localhost:3000` (or the frontend port).

## Running with Docker

1. Ensure Docker and Docker Compose are installed.

2. Build and run the services:
   ```bash
   docker compose up --build
   ```

3. Access the app:
   - Frontend: `http://localhost:3001`
   - Backend API: `http://localhost:3000`
   - Redis: `localhost:6379`

## Usage

1. Open the app in your browser.
2. Click "Start Discovery" to enter the matchmaking queue.
3. Wait for a match.
4. Chat anonymously with your matched user.
5. Disconnect to end the chat and return to the main screen.

## Socket Events

The app uses the following Socket.IO events:

- `START_SEARCH`: Initiates matchmaking.
- `MATCH_FOUND`: Notifies users of a successful match with room and user IDs.
- `SEND_MESSAGE`: Sends a message to the chat room.
- `RECEIVE_MESSAGE`: Receives messages from the other user.
- `disconnect`: Handles user disconnection.

## Project Structure

```
VibeChat/
├── client/                 # Next.js frontend
│   ├── app/               # Next.js app router
│   ├── components/        # React components
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilities
│   └── public/            # Static assets
├── src/                   # Node.js backend
│   ├── api/               # API routes (if any)
│   ├── core/              # Core logic (managers)
│   ├── services/          # Services (Redis, Socket)
│   └── shared/            # Shared constants
├── tests/                 # Test files
├── compose.yaml           # Docker Compose configuration
├── Dockerfile             # Backend Docker build
└── package.json           # Backend dependencies
```

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-name`.
3. Commit your changes: `git commit -am 'Add feature'`.
4. Push to the branch: `git push origin feature-name`.
5. Submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
