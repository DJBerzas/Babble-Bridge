import { collection, addDoc, getDocs, doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import axios from 'axios';

// Interfaces
export interface UserData {
    id: string;
    email: string;
    username: string;
    nativeLanguage: string;
    createdAt: string;
}

export interface Participant {
    id: string;
    email: string;
    username: string;
    nativeLanguage: string;
}

export interface Message {
    text: string;
    sender: string;
    senderId: string;
    timestamp: string;
}

export interface ChatRoomData {
    id?: string;
    roomCode: string;
    participants: Participant[];
    languages: string[];
    messagesByLanguage: { [key: string]: Message[] };
    createdAt: string;
    lastUpdated: string;
}

export interface UserChatRoom {
    roomCode: string;
    lastVisited: string;
    participants: Participant[];
}

// Firebase configuration for testing
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCV7-PIC7MOlbTd-aZtVSP7KgR9BKy_kCo",
  authDomain: "babblebridge.firebaseapp.com",
  projectId: "babblebridge",
  storageBucket: "babblebridge.firebasestorage.app",
  messagingSenderId: "157389739525",
  appId: "1:157389739525:web:4ef10b80a7193c275b2e6c",
  measurementId: "G-QHD4TMNK89"
};

// Google Translate API Key
const GOOGLE_TRANSLATE_API_KEY = "AIzaSyAmtq77wGBFT8-eJa31KuVXorFktEXy_ag"; // Replace with your actual API key

// Initialize Firebase with the config
const firebaseApp = initializeApp(FIREBASE_CONFIG);
console.log("Firebase App initialized:", firebaseApp);

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
console.log("Firestore instance created");

// User session management
let currentUser: User | null = null;

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    console.log("User is signed in:", user.email);
  } else {
    currentUser = null;
    console.log("User is signed out");
  }
});

export async function loginUser(email: string, password: string) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        currentUser = userCredential.user;
        return {
            success: true,
            user: {
                id: userCredential.user.uid,
                email: userCredential.user.email
            }
        };
    } catch (error: any) {
        console.error("Login error:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

export async function registerUser(email: string, password: string, username: string, nativeLanguage: string) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userData: UserData = {
            id: userCredential.user.uid,
            email: email,
            username: username,
            nativeLanguage: nativeLanguage,
            createdAt: new Date().toISOString()
        };

        // Store additional user data in Firestore
        await setDoc(doc(db, "Users", userCredential.user.uid), userData);
        
        currentUser = userCredential.user;
        return {
            success: true,
            user: userData
        };
    } catch (error: any) {
        console.error("Registration error:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

export async function logoutUser() {
    try {
        await signOut(auth);
        currentUser = null;
        return { success: true };
    } catch (error: any) {
        console.error("Logout error:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

export function getCurrentUser(): User | null {
    return currentUser;
}

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

        const userData: UserData = {
            id: "test-user",
            username: "Tester",
            email: "test@test.com",
            nativeLanguage: "English",
            createdAt: new Date().toISOString()
        };
        console.log("User data prepared:", userData);

        const docRef = await addDoc(usersCollection, userData);
        console.log("User successfully added to Firebase");
        console.log("Document written with ID: ", docRef.id);
    } catch (error: any) {
        console.error("Detailed error adding document: ", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
    }
}

export async function getTestUser() {
    try {
        console.log("Starting to fetch test users from Firebase");
        const usersCollection = collection(db, "Users");
        const querySnapshot = await getDocs(usersCollection);
        
        const users: UserData[] = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() } as UserData);
        });
        
        console.log("Users fetched successfully:", users);
        return users;
    } catch (error: any) {
        console.error("Error fetching users: ", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        return [];
    }
}

export async function getNativeLanguage() {}

export async function createChatRoom(participants: Participant[]) {
    try {
        console.log("Starting to create chat room");
        const chatRoomsCollection = collection(db, "ChatRooms");

        // Generate a 6-digit room code
        const roomCode = Math.floor(100000 + Math.random() * 900000);
        
        // Get the native languages of all participants
        const languages = new Set<string>();
        participants.forEach(participant => {
            languages.add(participant.nativeLanguage);
        });

        // Create initial message structure for each language
        const messagesByLanguage: { [key: string]: Message[] } = {};
        languages.forEach(language => {
            messagesByLanguage[language] = [];
        });

        const chatRoomData: ChatRoomData = {
            roomCode: roomCode.toString(),
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
    } catch (error: any) {
        console.error("Error creating chat room: ", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

export async function getChatRoom(roomCode: string) {
    try {
        console.log("Fetching chat room with code:", roomCode);
        const chatRoomRef = doc(db, "ChatRooms", roomCode);
        const chatRoomDoc = await getDoc(chatRoomRef);

        if (chatRoomDoc.exists()) {
            const data = chatRoomDoc.data();
            const chatRoom: ChatRoomData = {
                id: chatRoomDoc.id,
                roomCode: data.roomCode,
                participants: data.participants,
                languages: data.languages,
                messagesByLanguage: data.messagesByLanguage,
                createdAt: data.createdAt,
                lastUpdated: data.lastUpdated
            };
            return {
                success: true,
                chatRoom
            };
        } else {
            return {
                success: false,
                error: "Chat room not found"
            };
        }
    } catch (error: any) {
        console.error("Error fetching chat room: ", error);
        return {
            success: false,
            error: error.message
        };
    }
}

export function getLanguageCode(languageName: string): string {
    // First check if the input is already a language code
    const languageMap: { [key: string]: string } = {
        // Full language names to codes
        'English': 'en-US',  // Default to US English
        'English (US)': 'en-US',
        'English (UK)': 'en-GB',
        'Spanish': 'es',
        'French': 'fr',
        'German': 'de',
        'Italian': 'it',
        'Portuguese': 'pt-BR',  // Default to Brazilian Portuguese
        'Portuguese (Brazil)': 'pt-BR',
        'Portuguese (Portugal)': 'pt-PT',
        'Russian': 'ru',
        'Chinese': 'zh',
        'Japanese': 'ja',
        'Korean': 'ko',
        'Arabic': 'ar',
        'Hindi': 'hi',
        'Bengali': 'bn',
        'Dutch': 'nl',
        'Polish': 'pl',
        'Turkish': 'tr',
        'Vietnamese': 'vi',
        'Thai': 'th',
        'Greek': 'el',
        'Hebrew': 'he',
        'Indonesian': 'id',
        'Malay': 'ms',
        'Filipino': 'fil',
        'Swedish': 'sv',
        'Danish': 'da',
        'Finnish': 'fi',
        'Czech': 'cs',
        'Romanian': 'ro',
        'Hungarian': 'hu',
        'Ukrainian': 'uk',
        'Catalan': 'ca',
        // Language codes to themselves (for direct code input)
        'en': 'en-US',  // Default to US English
        'en-US': 'en-US',
        'en-GB': 'en-GB',
        'es': 'es',
        'fr': 'fr',
        'de': 'de',
        'it': 'it',
        'pt': 'pt-BR',  // Default to Brazilian Portuguese
        'pt-BR': 'pt-BR',
        'pt-PT': 'pt-PT',
        'ru': 'ru',
        'zh': 'zh',
        'ja': 'ja',
        'ko': 'ko',
        'ar': 'ar',
        'hi': 'hi',
        'bn': 'bn',
        'nl': 'nl',
        'pl': 'pl',
        'tr': 'tr',
        'vi': 'vi',
        'th': 'th',
        'el': 'el',
        'he': 'he',
        'id': 'id',
        'ms': 'ms',
        'fil': 'fil',
        'sv': 'sv',
        'da': 'da',
        'fi': 'fi',
        'cs': 'cs',
        'ro': 'ro',
        'hu': 'hu',
        'uk': 'uk',
        'ca': 'ca'
    };

    const code = languageMap[languageName];
    if (!code) {
        console.warn(`No language code found for: ${languageName}, defaulting to 'en-US'`);
        return 'en-US';
    }
    return code;
}

export async function translateMessage(message: string, targetLanguage: string, sender: string, timestamp: string, sourceLanguage: string = 'en') {
    try {
        console.log('Starting translation process...');
        console.log('Input parameters:', {
            message,
            sourceLanguage,
            targetLanguage,
            sender,
            timestamp
        });

        // Convert both languages to codes
        const sourceCode = getLanguageCode(sourceLanguage);
        const targetCode = getLanguageCode(targetLanguage);
        console.log('Language codes:', { sourceCode, targetCode });

        // If the language codes are the same, return the original message
        if (sourceCode === targetCode) {
            console.log('Target language is the same as source language, skipping translation');
            return {
                text: message,
                sender: sender,
                timestamp: timestamp
            };
        }

        console.log('Using API key:', GOOGLE_TRANSLATE_API_KEY);

        const requestBody = {
            q: message,
            target: targetCode,
            source: sourceCode
        };
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const response = await axios.post(
            `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`,
            requestBody
        );

        console.log('Translation API response:', JSON.stringify(response.data, null, 2));

        if (!response.data || !response.data.data || !response.data.data.translations || !response.data.data.translations[0]) {
            console.error('Invalid response structure:', response.data);
            throw new Error('Invalid response from translation API');
        }

        const translatedText = response.data.data.translations[0].translatedText;
        console.log('Successfully translated text:', translatedText);
        console.log('Translation details:', {
            original: message,
            translated: translatedText,
            source: sourceLanguage,
            target: targetLanguage,
            sourceCode,
            targetCode
        });
        
        return {
            text: translatedText,
            sender: sender,
            timestamp: timestamp
        };
    } catch (error: any) {
        console.error('Translation error details:', {
            message: error.message,
            code: error.code,
            response: error.response?.data,
            status: error.response?.status,
            request: {
                message,
                sourceLanguage,
                targetLanguage,
                sourceCode: getLanguageCode(sourceLanguage),
                targetCode: getLanguageCode(targetLanguage)
            }
        });
        
        // Return original message if translation fails
        console.log('Falling back to original message');
        return {
            text: message,
            sender: sender,
            timestamp: timestamp
        };
    }
}

export async function addMessageToChatRoom(roomCode: string, message: { text: string }, senderLanguage: string) {
    try {
        if (!currentUser) {
            throw new Error("User must be logged in to send messages");
        }

        console.log("Adding message to chat room:", roomCode);
        console.log("Raw message data:", JSON.stringify(message, null, 2));
        console.log("Sender's language:", senderLanguage);
        
        const chatRoomRef = doc(db, "ChatRooms", roomCode);
        
        // First get the current state of the chat room to get all participants
        const chatRoomDoc = await getDoc(chatRoomRef);
        if (!chatRoomDoc.exists()) {
            throw new Error("Chat room not found");
        }

        const chatRoomData = chatRoomDoc.data() as ChatRoomData;
        const participants = chatRoomData.participants;
        
        console.log("Chat room participants:", participants.map(p => ({
            email: p.email,
            nativeLanguage: p.nativeLanguage
        })));
        
        // Create the original message object
        const messageObject: Message = {
            text: String(message.text),
            sender: currentUser.email || '',
            senderId: currentUser.uid,
            timestamp: new Date().toISOString()
        };

        // Create updates object for all languages
        const updates: { [key: string]: any } = {};
        
        // Add original message to sender's language array
        console.log(`Adding original message to ${senderLanguage} array:`, messageObject);
        updates[`messagesByLanguage.${senderLanguage}`] = arrayUnion(messageObject);

        // Translate and add message for each participant's native language
        for (const participant of participants) {
            if (participant.nativeLanguage !== senderLanguage) {
                console.log(`Translating message for participant ${participant.email} from ${senderLanguage} to ${participant.nativeLanguage}`);
                try {
                    const translatedMessage = await translateMessage(
                        message.text,
                        participant.nativeLanguage,
                        messageObject.sender,
                        messageObject.timestamp,
                        senderLanguage  // Pass the source language
                    );

                    const translatedMessageObject: Message = {
                        text: translatedMessage.text,
                        sender: messageObject.sender,
                        senderId: messageObject.senderId,
                        timestamp: messageObject.timestamp
                    };

                    console.log(`Adding translated message to ${participant.nativeLanguage} array:`, translatedMessageObject);
                    // Add translated message to participant's language array
                    updates[`messagesByLanguage.${participant.nativeLanguage}`] = arrayUnion(translatedMessageObject);
                } catch (translationError: any) {
                    console.error(`Error translating to ${participant.nativeLanguage}:`, translationError);
                    // If translation fails, add original message
                    console.log(`Translation failed, adding original message to ${participant.nativeLanguage} array`);
                    updates[`messagesByLanguage.${participant.nativeLanguage}`] = arrayUnion(messageObject);
                }
            }
        }
        
        console.log("Final updates object:", JSON.stringify(updates, null, 2));
        
        // Update the chat room with all translated messages
        await updateDoc(chatRoomRef, {
            ...updates,
            lastUpdated: new Date().toISOString()
        });

        console.log("Messages successfully added to all language arrays");
        return {
            success: true
        };
    } catch (error: any) {
        console.error("Error adding message: ", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        console.error("Stack trace:", error.stack);
        return {
            success: false,
            error: error.message
        };
    }
}

export async function getRoomsByLanguage(roomCode: string) {
    try {
        console.log("Fetching languages for room:", roomCode);
        const chatRoomRef = doc(db, "ChatRooms", roomCode);
        const chatRoomDoc = await getDoc(chatRoomRef);

        if (chatRoomDoc.exists()) {
            const chatRoomData = chatRoomDoc.data() as ChatRoomData;
            console.log("Languages found:", chatRoomData.languages);
            return {
                success: true,
                languages: chatRoomData.languages || []
            };
        } else {
            console.log("Chat room not found");
            return {
                success: false,
                error: "Chat room not found"
            };
        }
    } catch (error: any) {
        console.error("Error fetching languages: ", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

export async function getUserChatRooms(): Promise<{ success: boolean; chatRooms?: UserChatRoom[]; error?: string }> {
    try {
        if (!currentUser) {
            throw new Error("User must be logged in to fetch chat rooms");
        }

        // Query chat rooms where the user is a participant
        const chatRoomsCollection = collection(db, "ChatRooms");
        const querySnapshot = await getDocs(chatRoomsCollection);
        
        const userChatRooms: UserChatRoom[] = [];
        
        querySnapshot.forEach((doc) => {
            const chatRoomData = doc.data() as ChatRoomData;
            // Check if current user is a participant
            const isParticipant = chatRoomData.participants.some(
                participant => participant.id === currentUser?.uid
            );
            
            if (isParticipant) {
                userChatRooms.push({
                    roomCode: chatRoomData.roomCode,
                    lastVisited: chatRoomData.lastUpdated,
                    participants: chatRoomData.participants
                });
            }
        });

        // Sort by last visited (most recent first)
        userChatRooms.sort((a, b) => 
            new Date(b.lastVisited).getTime() - new Date(a.lastVisited).getTime()
        );

        return {
            success: true,
            chatRooms: userChatRooms
        };
    } catch (error: any) {
        console.error("Error fetching user's chat rooms:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

export async function getUserData(userId: string): Promise<{ success: boolean; userData?: UserData; error?: string }> {
    try {
        const userDoc = await getDoc(doc(db, "Users", userId));
        if (userDoc.exists()) {
            return {
                success: true,
                userData: userDoc.data() as UserData
            };
        } else {
            return {
                success: false,
                error: "User data not found"
            };
        }
    } catch (error: any) {
        console.error("Error fetching user data:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

export async function detectLanguage(text: string): Promise<string> {
    try {
        const response = await axios.post(
            `https://translation.googleapis.com/language/translate/v2/detect?key=${GOOGLE_TRANSLATE_API_KEY}`,
            { q: text }
        );

        if (response.data?.data?.detections?.[0]?.[0]?.language) {
            const detectedCode = response.data.data.detections[0][0].language;
            // Find the language name that corresponds to this code
            for (const [languageName, code] of Object.entries({
                'English': 'en', 'Spanish': 'es', 'French': 'fr', 'German': 'de',
                'Italian': 'it', 'Portuguese': 'pt', 'Russian': 'ru', 'Chinese': 'zh',
                'Japanese': 'ja', 'Korean': 'ko', 'Arabic': 'ar', 'Hindi': 'hi',
                'Bengali': 'bn', 'Dutch': 'nl', 'Polish': 'pl', 'Turkish': 'tr',
                'Vietnamese': 'vi', 'Thai': 'th', 'Greek': 'el', 'Hebrew': 'he',
                'Indonesian': 'id', 'Malay': 'ms', 'Filipino': 'fil', 'Swedish': 'sv',
                'Danish': 'da', 'Finnish': 'fi', 'Czech': 'cs', 'Romanian': 'ro',
                'Hungarian': 'hu', 'Ukrainian': 'uk', 'Catalan': 'ca'
            })) {
                if (code === detectedCode) {
                    return languageName;
                }
            }
        }
        return 'English';
    } catch (error) {
        console.error('Error detecting language:', error);
        return 'English';
    }
}

export async function addParticipantToRoom(roomCode: string, participant: Participant) {
    try {
        const chatRoomRef = doc(db, "ChatRooms", roomCode);
        const chatRoomDoc = await getDoc(chatRoomRef);

        if (!chatRoomDoc.exists()) {
            throw new Error("Chat room not found");
        }

        const chatRoomData = chatRoomDoc.data() as ChatRoomData;
        
        // Check if participant already exists
        const existingParticipant = chatRoomData.participants.find(p => p.id === participant.id);
        if (existingParticipant) {
            return { success: true }; // Participant already exists
        }

        // Add participant to participants array
        const updatedParticipants = [...chatRoomData.participants, participant];

        // Add new language to messagesByLanguage if it doesn't exist
        const updatedMessagesByLanguage = { ...chatRoomData.messagesByLanguage };
        if (!updatedMessagesByLanguage[participant.nativeLanguage]) {
            updatedMessagesByLanguage[participant.nativeLanguage] = [];
        }

        // Update languages array if needed
        const updatedLanguages = [...new Set([...chatRoomData.languages, participant.nativeLanguage])];

        // Update the chat room
        await updateDoc(chatRoomRef, {
            participants: updatedParticipants,
            languages: updatedLanguages,
            messagesByLanguage: updatedMessagesByLanguage,
            lastUpdated: new Date().toISOString()
        });

        return { success: true };
    } catch (error: any) {
        console.error("Error adding participant:", error);
        return {
            success: false,
            error: error.message
        };
    }
}


