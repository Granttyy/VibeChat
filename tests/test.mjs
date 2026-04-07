// test.mjs
import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:3000";

console.log("🤖 Starting VibeChat Automated Test...");

// 1. Create two separate simulated users
const user1 = io(SERVER_URL);
const user2 = io(SERVER_URL);

// --- USER 1 LOGIC ---
user1.on("connect", () => {
    console.log(`🟢 User 1 connected: ${user1.id}`);
    
    // As soon as User 1 connects, they join the queue
    console.log("➡️ User 1 sending START_SEARCH...");
    user1.emit("START_SEARCH", {});
});

user1.on("MATCH_FOUND", (data) => {
    console.log(`🔥 User 1 received MATCH_FOUND! Room: ${data.roomId}`);
    
    // Simulate typing a message for 1 second, then sending it
    setTimeout(() => {
        console.log("✉️ User 1 sending a message...");
        user1.emit("SEND_MESSAGE", { text: "Hello from User 1! How is your vibe?" });
    }, 1000);
});

user1.on("RECEIVE_MESSAGE", (data) => {
    console.log(`📥 User 1 received a message: "${data.text}"`);
});


// --- USER 2 LOGIC ---
user2.on("connect", () => {
    console.log(`🟢 User 2 connected: ${user2.id}`);
    
    // Add a tiny delay so User 1 is definitely in the queue first
    setTimeout(() => {
        console.log("➡️ User 2 sending START_SEARCH...");
        user2.emit("START_SEARCH", {});
    }, 500);
});

user2.on("MATCH_FOUND", (data) => {
    console.log(`🔥 User 2 received MATCH_FOUND! Room: ${data.roomId}`);
});

user2.on("RECEIVE_MESSAGE", (data) => {
    console.log(`📥 User 2 received a message: "${data.text}"`);
    
    // User 2 replies immediately
    console.log("✉️ User 2 sending a reply...");
    user2.emit("SEND_MESSAGE", { text: "My vibe is immaculate. Thanks for asking!" });
    
    // End the test after a short delay
    setTimeout(() => {
        console.log("✅ Test Complete. Disconnecting...");
        user1.disconnect();
        user2.disconnect();
        process.exit(0);
    }, 1000);
});