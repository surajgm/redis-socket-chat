import http from 'http';
import SocketService from './services/socket';
import dotenv from 'dotenv';

// Load environment variables from .env file into process.env
dotenv.config();

async function init() {
    const socketService = new SocketService();

    const httpServer = http.createServer();
    const PORT = process.env.PORT ? process.env.PORT : 8000;

    socketService.io.attach(httpServer);

    httpServer.listen (PORT, () => console.log(`HTTP Server started at PORT: ${PORT}`));

    socketService.initListeners()
}

init();