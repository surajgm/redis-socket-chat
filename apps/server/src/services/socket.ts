import { Server } from 'socket.io';
import Redis from 'ioredis'

const pub = new Redis({
    host:process.env.REDIS_URL,
    port:process.env.REDIS_PORT ? Number(process.env.REDIS_PORT):undefined,
    username:process.env.REDIS_USER,
    password:process.env.REDIS_PASSWORD,
});
const sub = new Redis({
    host:process.env.REDIS_URL,
    port:process.env.REDIS_PORT ? Number(process.env.REDIS_PORT):undefined,
    username:process.env.REDIS_USER,
    password:process.env.REDIS_PASSWORD,
});

class SocketService {
   private _io: Server;

    constructor() {
        console.log("Init Socket Service...");
        this._io = new Server({
            cors: {
                allowedHeaders: ["*"],
                origin: "*",
            }
        });
        sub.subscribe('MESSAGES')
    }

    public initListeners() {
        const io = this._io;
        console.log('Init Socket LIsteners...')
        io.on("connect", (socket) => {
            console.log("New Socket Connected-->", socket.id)
            socket.on('event:message', async ({message}:{message: string}) => {
                console.log('New Message Rec.-->', message);
                // Publish this message to redis
                await pub.publish('MESSAGES', JSON.stringify({message}))
            })
        });
        sub.on('message', async (channel, message) => {
            if(channel === 'MESSAGES') {
                console.log('New message from redis-->', message)
                io.emit('message', message);
            }
        })
    }

    get io() {
        console.log('Getter for server instance for the instance created to use socket service...')
        return this._io;
    }
}

export default SocketService;