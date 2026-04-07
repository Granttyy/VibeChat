export default class RoomManager {
  constructor() {
    this.rooms = new Map(); // Key: roomId, Value: { participants: [id1, id2], startTime: Date }
  }

  /**
   * Creates a formal record of a chat session
   */
  createRoom(user1, user2) {
    const roomId = `room_${user1.id}_${user2.id}`;
    
    const roomData = {
      id: roomId,
      participants: [user1.id, user2.id],
      createdAt: new Date()
    };

    this.rooms.set(roomId, roomData);
    
    // Assign the room to the User objects
    user1.setRoom(roomId);
    user2.setRoom(roomId);

    return roomId;
  }

  /**
   * Cleans up the room when one or both users leave
   */
  destroyRoom(roomId) {
    if (this.rooms.has(roomId)) {
      this.rooms.delete(roomId);
      console.log(`🏠 Room ${roomId} has been dissolved.`);
    }
  }

  /**
   * Finds the partner ID for a given user in a specific room
   */
  getPartnerId(roomId, currentUserId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    return room.participants.find(id => id !== currentUserId);
  }
}

// Export a single instance to be used across the app
export const roomManager = new RoomManager();