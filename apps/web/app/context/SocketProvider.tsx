'use client'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client';

interface SocketProviderProps {
    children?: React.ReactNode;
}

interface ISocketContext {
    // eslint-disable-next-line no-unused-vars
    sendMessage: (msg: string) => void;
    messages: string[];
}

const SocketContext = React.createContext<ISocketContext | null>(null);

export const useSocket = () => {
    const state = useContext(SocketContext);
    if(!state) throw new Error('State is undefined...')
    return state
}

export const SocketProvider: React.FC<SocketProviderProps> = ({children}) => {
    const [ socket, setSocket ] = useState<Socket>()
    const [ messages, setMessages ] = useState<string[]>([])

    const sendMessage: ISocketContext["sendMessage"] = useCallback((msg) => {
      console.log("Send Message", msg);
      if (socket) {
        console.log('socket-->', socket)
        socket.emit("event:message", {
          message: msg,
        });
      }
    }, [socket]);

    const onMessageReceived = useCallback((msg: string) => {
        console.log('From server message received-->', msg);
        const {message} = JSON.parse(msg) as {message: string}
        setMessages(prev => [...prev, message])
    }, [])

    useEffect(() => {
      const _socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);
      _socket.on("message", onMessageReceived);
      setSocket(_socket);

      return () => {
        _socket.disconnect();
        _socket.off("message", onMessageReceived);
        setSocket(undefined);
      };
    }, []);
    return (
        <SocketContext.Provider value={{sendMessage, messages}}>
            {children}
        </SocketContext.Provider>
    )
}