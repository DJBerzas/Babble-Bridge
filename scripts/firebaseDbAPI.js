import { collection, addDoc, getDocs, doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import firebaseApp from '../src/config/firebaseConfig.js';

console.log("Firebase App initialized:", firebaseApp);

const db = getFirestore(firebaseApp);
console.log("Firestore instance created");

export async function addTestUser() {
    try {
        console.log("Starting to add test user to Firebase");
        console.log("Current Firebase config:", {
            apiKey: process.env.FIREBASE_API_KEY,
            projectId: process.env.FIREBASE_PROJECT_ID,
            // Don't log sensitive info
        });

        const usersCollection = collection(db, "Users");
        console.log("Collection reference created");

        const userData = {
            Username: "Tester",
            email: "test@test.com",
            password: "test1234",
            nativeLanguage: "English",
        };
        console.log("User data prepared:", userData);

        const docRef = await addDoc(usersCollection, userData);
        console.log("User successfully added to Firebase");
        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Detailed error adding document: ", e);
        console.error("Error code:", e.code);
        console.error("Error message:", e.message);
    }
}

export async function getTestUser() {
    try {
        console.log("Starting to fetch test users from Firebase");
        const usersCollection = collection(db, "Users");
        const querySnapshot = await getDocs(usersCollection);
        
        const users = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });
        
        console.log("Users fetched successfully:", users);
        return users;
    } catch (e) {
        console.error("Error fetching users: ", e);
        console.error("Error code:", e.code);
        console.error("Error message:", e.message);
        return [];
    }
}

export async function getNativeLanguage() {}

export async function createChatRoom(participants) {
    try {
        console.log("Starting to create chat room");
        const chatRoomsCollection = collection(db, "ChatRooms");

        // Generate a 6-digit room code
        const roomCode = Math.floor(100000 + Math.random() * 900000);
        
        // Get the native languages of all participants
        const languages = new Set();
        participants.forEach(participant => {
            languages.add(participant.nativeLanguage);
        });

        // Create initial message structure for each language
        const messagesByLanguage = {};
        languages.forEach(language => {
            messagesByLanguage[language] = [];
        });

        const chatRoomData = {
            roomCode: roomCode,
            participants: participants,
            languages: Array.from(languages),
            messagesByLanguage: messagesByLanguage,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };

        // Create the chat room with a specific ID based on the room code
        const chatRoomRef = doc(chatRoomsCollection, roomCode.toString());
        await setDoc(chatRoomRef, chatRoomData);

        console.log("Chat room created successfully with code:", roomCode);
        return {
            success: true,
            roomCode: roomCode,
            chatRoomData: chatRoomData
        };
    } catch (e) {
        console.error("Error creating chat room: ", e);
        console.error("Error code:", e.code);
        console.error("Error message:", e.message);
        return {
            success: false,
            error: e.message
        };
    }
}

export async function getChatRoom(roomCode) {
    try {
        console.log("Fetching chat room with code:", roomCode);
        const chatRoomRef = doc(db, "ChatRooms", roomCode.toString());
        const chatRoomDoc = await getDoc(chatRoomRef);

        if (chatRoomDoc.exists()) {
            return {
                success: true,
                chatRoom: { id: chatRoomDoc.id, ...chatRoomDoc.data() }
            };
        } else {
            return {
                success: false,
                error: "Chat room not found"
            };
        }
    } catch (e) {
        console.error("Error fetching chat room: ", e);
        return {
            success: false,
            error: e.message
        };
    }
}

export async function addMessageToChatRoom(roomCode, message, senderLanguage) {
    try {
        console.log("Adding message to chat room:", roomCode);
        console.log("Raw message data:", JSON.stringify(message, null, 2));
        
        const chatRoomRef = doc(db, "ChatRooms", roomCode.toString());
        
        // Create the message object with all required fields
        const messageObject = {
            text: String(message.text),
            sender: String(message.sender),
            timestamp: new Date().toISOString()
        };

        console.log("Formatted message object:", JSON.stringify(messageObject, null, 2));

        // Add message to the appropriate language array
        const update = {};
        update[`messagesByLanguage.${senderLanguage}`] = arrayUnion(messageObject);
        
        // First get the current state of the chat room
        const chatRoomDoc = await getDoc(chatRoomRef);
        console.log("Current chat room data:", JSON.stringify(chatRoomDoc.data(), null, 2));
        
        await updateDoc(chatRoomRef, {
            ...update,
            lastUpdated: new Date().toISOString()
        });

        console.log("Message successfully added to language:", senderLanguage);
        return {
            success: true
        };
    } catch (e) {
        console.error("Error adding message: ", e);
        console.error("Error code:", e.code);
        console.error("Error message:", e.message);
        console.error("Stack trace:", e.stack);
        return {
            success: false,
            error: e.message
        };
    }
}


