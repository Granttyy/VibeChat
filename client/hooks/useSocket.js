import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';

const SOCKET_EVENTS = {
  START_SEARCH: 'START_SEARCH',
  MATCH_FOUND: 'MATCH_FOUND',
  SEND_MESSAGE: 'SEND_MESSAGE',
  RECEIVE_MESSAGE: 'RECEIVE_MESSAGE',
  LEAVE_CHAT: 'LEAVE_CHAT',
  PARTNER_LEFT: 'PARTNER_LEFT',
  DISCONNECT: 'disconnect',
};

let socketInstance = null;

const getSocket = () => {
  if (!socketInstance) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
    console.log('🔌 Initializing socket connection to:', socketUrl);
    
    socketInstance = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
      credentials: true
    });
    
    // Connection error handler
    socketInstance.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
    });
  }
  return socketInstance;
};

export const useSocket = () => {
  const [state, setState] = useState('IDLE');
  const [messages, setMessages] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [userId, setUserId] = useState(null);
  const socketRef = useRef(null);

  // Initialize socket connection on mount
  useEffect(() => {
    console.log('Client: Initializing socket connection...');
    socketRef.current = getSocket();

    socketRef.current.on('connect', () => {
      console.log('Client: Socket connected with ID:', socketRef.current.id);
      setUserId(socketRef.current.id);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Client: Socket disconnected');
      setState('IDLE');
      setMessages([]);
      setRoomId(null);
    });

    // Handle MATCH_FOUND event
    socketRef.current.on('MATCH_FOUND', (data) => {
      console.log('Client: MATCH_FOUND received:', data);
      setRoomId(data.roomId);
      setMessages([]);
      setState('CHATTING');
    });

    // Handle WAITING event
    socketRef.current.on('WAITING', (data) => {
      console.log('Client: WAITING received:', data);
    });

    // Handle RECEIVE_MESSAGE event
    socketRef.current.on(SOCKET_EVENTS.RECEIVE_MESSAGE, (data) => {
      console.log('Client: RECEIVE_MESSAGE received:', data);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: data.message,
          sender: data.sender,
          timestamp: data.timestamp || new Date().toLocaleTimeString(),
        },
      ]);
    });

    // Handle partner disconnect
    socketRef.current.on(SOCKET_EVENTS.PARTNER_LEFT, () => {
      console.log('Client: PARTNER_LEFT received');
      setState('IDLE');
      setMessages([]);
      setRoomId(null);
    });

    // Handle disconnect
    socketRef.current.on(SOCKET_EVENTS.DISCONNECT, () => {
      setState('IDLE');
      setMessages([]);
      setRoomId(null);
    });

    return () => {
      // Don't disconnect on unmount - keep singleton alive
    };
  }, []);

  const startSearch = useCallback(() => {
    console.log('Client: startSearch called');
    if (socketRef.current) {
      console.log('Client: Socket exists, emitting START_SEARCH');
      setState('SEARCHING');
      socketRef.current.emit(SOCKET_EVENTS.START_SEARCH);
    } else {
      console.log('Client: No socket connection available');
    }
  }, []);

  const sendMessage = useCallback((message) => {
    if (socketRef.current && roomId) {
      socketRef.current.emit(SOCKET_EVENTS.SEND_MESSAGE, {
        roomId,
        message,
        sender: userId,
      });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: message,
          sender: userId,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }
  }, [roomId, userId]);

  const stopSearch = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit(SOCKET_EVENTS.LEAVE_CHAT);
    }

    setState('IDLE');
    setMessages([]);
    setRoomId(null);
  }, []);

  return {
    state,
    messages,
    roomId,
    userId,
    startSearch,
    sendMessage,
    stopSearch,
  };
};
