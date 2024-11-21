import { Server } from 'socket.io';
import Redis from 'ioredis'
import prismaClient from './prisma';
import { produceMessage } from './kafka';

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
                // await prismaClient.message.create({
                //     data: {
                //         text: message,
                //     }
                // })
                await produceMessage(message);
                console.log("Message Produced to Kafka Broker...")
            }
        })
    }

    get io() {
        console.log('Getter for server instance for the instance created to use socket service...')
        return this._io;
    }
}
// Sets the env variable PORT and its value 8001 and start the server on that server
// export PORT=8001 && npm start

export default SocketService;