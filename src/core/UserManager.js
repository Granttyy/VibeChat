export default class User {
    constructor(socket) {
        this.id = socket.id;
        this.socket = socket;
        this.currentRoom = null;
        this.isSearching = false;
    }

    setRoom(roomId) {
        this.currentRoom = roomId;
        this.isSearching = false;
        this.socket.join(roomId);
    }

    leaveRoom() {
        if (this.currentRoom) {
            this.socket.leave(this.currentRoom);
            this.currentRoom = null;
        }
    }

    emit(event, data) {
        this.socket.emit(event, data);
    }
}