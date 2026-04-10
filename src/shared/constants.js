export const SOCKET_EVENTS = Object.freeze({
  CONNECT:              'connect',
  DISCONNECT:           'disconnect',
  START_SEARCH:         'START_SEARCH',
  CANCEL_SEARCH:        'CANCEL_SEARCH',   
  WAITING:              'WAITING',          
  MATCH_FOUND:          'MATCH_FOUND',
  SEND_MESSAGE:         'SEND_MESSAGE',
  RECEIVE_MESSAGE:      'RECEIVE_MESSAGE',
  PARTNER_LEFT:         'PARTNER_LEFT',     
  LEAVE_CHAT:           'LEAVE_CHAT',       
  ERROR:                'ERROR',            
});

export const REDIS_KEYS = Object.freeze({
  QUEUE: 'vibe_queue',
});